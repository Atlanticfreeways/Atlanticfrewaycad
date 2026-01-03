const JITFundingService = require('../../../src/services/marqeta/JITFundingService');

describe('JITFundingService', () => {
  let service;
  let mockRedis;
  let mockPostgres;
  let mockMQ;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(true)
    };

    mockPostgres = {
      query: jest.fn()
    };

    mockMQ = {
      publishMessage: jest.fn().mockResolvedValue(true)
    };

    service = new JITFundingService(mockRedis, mockPostgres, mockMQ);
  });

  describe('authorizeTransaction', () => {
    it('should approve transaction with sufficient balance', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(true);
      expect(result.reason).toBe('approved');
      expect(result.latency).toBeLessThan(100);
    });

    it('should deny transaction with insufficient balance', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 50 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(false);
      expect(result.reason).toBe('insufficient_funds');
    });

    it('should deny transaction with exceeded daily limit', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 500, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 450 }] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(false);
      expect(result.reason).toBe('spending_limit_exceeded');
    });

    it('should deny transaction with restricted merchant', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [{ blocked_merchants: ['Amazon', 'Ebay'] }] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(false);
      expect(result.reason).toBe('merchant_restricted');
    });

    it('should deny transaction with inactive card', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'inactive', daily_limit: 5000, monthly_limit: 50000 }] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(false);
      expect(result.reason).toBe('card_inactive');
    });

    it('should include latency in response', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.latency).toBeDefined();
      expect(result.latency).toBeGreaterThan(0);
    });

    it('should include stage timings in response', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.stages).toBeDefined();
      expect(result.stages.userLookup).toBeDefined();
      expect(result.stages.cardLookup).toBeDefined();
      expect(result.stages.balanceCheck).toBeDefined();
    });
  });

  describe('checkSpendingLimits', () => {
    it('should allow transaction within daily limit', async () => {
      mockPostgres.query.mockResolvedValueOnce({ rows: [{ total: 100 }] });
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({ daily_limit: 500 }));

      const result = await service.checkSpendingLimits('card-1', 200);
      expect(result).toBe(true);
    });

    it('should deny transaction exceeding daily limit', async () => {
      mockPostgres.query.mockResolvedValueOnce({ rows: [{ total: 450 }] });
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({ daily_limit: 500 }));

      const result = await service.checkSpendingLimits('card-1', 100);
      expect(result).toBe(false);
    });
  });

  describe('checkMerchantRestrictions', () => {
    it('should allow unrestricted merchant', async () => {
      mockPostgres.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.checkMerchantRestrictions('card-1', 'Amazon');
      expect(result).toBe(true);
    });

    it('should deny restricted merchant', async () => {
      mockPostgres.query.mockResolvedValueOnce({ rows: [{ blocked_merchants: ['Amazon', 'Ebay'] }] });

      const result = await service.checkMerchantRestrictions('card-1', 'Amazon');
      expect(result).toBe(false);
    });
  });

  describe('processTransactionWebhook', () => {
    it('should process webhook and publish event', async () => {
      const webhook = {
        transactionId: 'txn-1',
        cardId: 'card-1',
        userId: 'user-1',
        amount: 100,
        merchant: 'Amazon',
        status: 'completed'
      };

      await service.processTransactionWebhook(webhook);

      expect(mockMQ.publishMessage).toHaveBeenCalledWith(
        'transactions',
        'transaction.webhook',
        expect.objectContaining({
          id: 'txn-1',
          cardId: 'card-1',
          amount: 100
        })
      );
    });
  });

  describe('updateSpendingCounters', () => {
    it('should update spending counters and invalidate cache', async () => {
      await service.updateSpendingCounters('card-1', 100);

      expect(mockPostgres.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cards'),
        [100, 'card-1']
      );
      expect(mockRedis.del).toHaveBeenCalledWith('card:card-1');
    });
  });
});
