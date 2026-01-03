const JITFundingService = require('../../../src/services/marqeta/JITFundingService');

describe('JITFundingService Integration Tests', () => {
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

  describe('End-to-End Authorization Flow', () => {
    it('should complete full authorization flow', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(true);
      expect(result.stages).toBeDefined();
      expect(result.stages.userLookup).toBeDefined();
      expect(result.stages.cardLookup).toBeDefined();
      expect(result.stages.balanceCheck).toBeDefined();
      expect(result.stages.limitsCheck).toBeDefined();
      expect(result.stages.merchantCheck).toBeDefined();
      expect(result.stages.updateCounters).toBeDefined();
    });

    it('should handle authorization denial gracefully', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 50 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(false);
      expect(result.reason).toBe('insufficient_funds');
      expect(result.latency).toBeDefined();
    });
  });

  describe('Cache Performance', () => {
    it('should use cached user data', async () => {
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({ id: 'user-1', balance: 1000 }));
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(true);
      expect(mockRedis.get).toHaveBeenCalledWith('user:user-1');
    });

    it('should cache user data after database lookup', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      await service.authorizeTransaction(transaction);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'user:user-1',
        expect.any(String),
        3600
      );
    });

    it('should invalidate card cache after update', async () => {
      await service.updateSpendingCounters('card-1', 100);

      expect(mockRedis.del).toHaveBeenCalledWith('card:card-1');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent authorization requests', async () => {
      mockPostgres.query
        .mockResolvedValue({ rows: [{ id: 'user-1', balance: 10000 }] })
        .mockResolvedValue({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 50000, monthly_limit: 500000 }] })
        .mockResolvedValue({ rows: [{ total: 0 }] })
        .mockResolvedValue({ rows: [] });

      const transactions = Array(10).fill(null).map((_, i) => ({
        userId: 'user-1',
        cardId: 'card-1',
        amount: 100 + i,
        merchant: `Merchant-${i}`
      }));

      const results = await Promise.all(
        transactions.map(tx => service.authorizeTransaction(tx))
      );

      expect(results.every(r => r.approved === true)).toBe(true);
      expect(results.length).toBe(10);
    });

    it('should handle concurrent cache operations', async () => {
      const cacheOps = Array(5).fill(null).map((_, i) =>
        service.updateSpendingCounters(`card-${i}`, 100)
      );

      await Promise.all(cacheOps);

      expect(mockRedis.del).toHaveBeenCalledTimes(5);
    });
  });

  describe('Latency Measurement', () => {
    it('should measure authorization latency', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.latency).toBeLessThan(100);
      expect(result.latency).toBeGreaterThan(0);
    });

    it('should track individual stage latencies', async () => {
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.stages.userLookup.duration).toBeGreaterThan(0);
      expect(result.stages.cardLookup.duration).toBeGreaterThan(0);
      expect(result.stages.balanceCheck.duration).toBeGreaterThan(0);
      expect(result.stages.limitsCheck.duration).toBeGreaterThan(0);
      expect(result.stages.merchantCheck.duration).toBeGreaterThan(0);
      expect(result.stages.updateCounters.duration).toBeGreaterThan(0);
    });
  });

  describe('Webhook Integration', () => {
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

    it('should handle webhook with message queue failure', async () => {
      mockMQ.publishMessage.mockRejectedValueOnce(new Error('Queue unavailable'));

      const webhook = {
        transactionId: 'txn-1',
        cardId: 'card-1',
        userId: 'user-1',
        amount: 100,
        merchant: 'Amazon',
        status: 'completed'
      };

      await expect(service.processTransactionWebhook(webhook))
        .rejects.toThrow('Queue unavailable');
    });
  });

  describe('Error Recovery', () => {
    it('should handle database errors gracefully', async () => {
      mockPostgres.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(false);
      expect(result.reason).toBe('system_error');
    });

    it('should handle cache errors gracefully', async () => {
      mockRedis.get.mockRejectedValueOnce(new Error('Cache unavailable'));
      mockPostgres.query
        .mockResolvedValueOnce({ rows: [{ id: 'user-1', balance: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ id: 'card-1', user_id: 'user-1', status: 'active', daily_limit: 5000, monthly_limit: 50000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 100 }] })
        .mockResolvedValueOnce({ rows: [] });

      const transaction = { userId: 'user-1', cardId: 'card-1', amount: 100, merchant: 'Amazon' };
      const result = await service.authorizeTransaction(transaction);

      expect(result.approved).toBe(true);
    });
  });
});
