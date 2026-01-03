const JITFundingService = require('../../../src/services/JITFundingService');

describe('JITFundingService', () => {
  let jitService;
  let mockRepositories;

  beforeEach(() => {
    mockRepositories = {
      user: {
        findById: jest.fn(),
        query: jest.fn()
      },
      card: {
        findById: jest.fn()
      },
      spendingControl: {
        findByCard: jest.fn()
      },
      transaction: {
        query: jest.fn(),
        create: jest.fn()
      }
    };

    jitService = new JITFundingService(mockRepositories);
  });

  describe('authorizeTransaction', () => {
    it('should approve valid transaction', async () => {
      // Mock card data
      mockRepositories.card.findById.mockResolvedValue({
        id: 'card-123',
        user_id: 'user-123',
        status: 'active'
      });

      // Mock user data
      mockRepositories.user.findById.mockResolvedValue({
        id: 'user-123',
        account_type: 'business'
      });

      // Mock no spending controls
      mockRepositories.spendingControl.findByCard.mockResolvedValue(null);

      const transactionData = {
        cardId: 'card-123',
        amount: 100,
        merchantName: 'Test Merchant',
        merchantCategory: '5411'
      };

      const result = await jitService.authorizeTransaction(transactionData);

      expect(result.approved).toBe(true);
      expect(result.reason).toBe('APPROVED');
      expect(result.processingTime).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should reject transaction for inactive card', async () => {
      mockRepositories.card.findById.mockResolvedValue({
        id: 'card-123',
        user_id: 'user-123',
        status: 'frozen'
      });

      const transactionData = {
        cardId: 'card-123',
        amount: 100,
        merchantName: 'Test Merchant',
        merchantCategory: '5411'
      };

      const result = await jitService.authorizeTransaction(transactionData);

      expect(result.approved).toBe(false);
      expect(result.reason).toBe('CARD_INACTIVE');
    });

    it('should reject transaction for non-existent card', async () => {
      mockRepositories.card.findById.mockResolvedValue(null);

      const transactionData = {
        cardId: 'nonexistent-card',
        amount: 100,
        merchantName: 'Test Merchant',
        merchantCategory: '5411'
      };

      const result = await jitService.authorizeTransaction(transactionData);

      expect(result.approved).toBe(false);
      expect(result.reason).toBe('CARD_NOT_FOUND');
    });

    it('should complete authorization within 100ms target', async () => {
      // Mock fast responses
      mockRepositories.card.findById.mockResolvedValue({
        id: 'card-123',
        user_id: 'user-123',
        status: 'active'
      });

      mockRepositories.user.findById.mockResolvedValue({
        id: 'user-123',
        account_type: 'business'
      });

      mockRepositories.spendingControl.findByCard.mockResolvedValue(null);

      const transactionData = {
        cardId: 'card-123',
        amount: 100,
        merchantName: 'Test Merchant',
        merchantCategory: '5411'
      };

      const start = Date.now();
      const result = await jitService.authorizeTransaction(transactionData);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
      expect(result.processingTime).toBeLessThan(100);
    });
  });

  describe('checkSpendingLimits', () => {
    it('should allow transaction within daily limit', async () => {
      mockRepositories.spendingControl.findByCard.mockResolvedValue({
        daily_limit: 1000,
        monthly_limit: 5000
      });

      mockRepositories.transaction.query.mockResolvedValue({
        rows: [{ total: '500' }]
      });

      const result = await jitService.checkSpendingLimits('card-123', 200);

      expect(result.allowed).toBe(true);
    });

    it('should reject transaction exceeding daily limit', async () => {
      mockRepositories.spendingControl.findByCard.mockResolvedValue({
        daily_limit: 1000,
        monthly_limit: 5000
      });

      mockRepositories.transaction.query.mockResolvedValue({
        rows: [{ total: '900' }]
      });

      const result = await jitService.checkSpendingLimits('card-123', 200);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('DAILY_LIMIT_EXCEEDED');
      expect(result.details).toBeDefined();
    });
  });

  describe('checkMerchantRestrictions', () => {
    it('should allow transaction for unrestricted merchant', async () => {
      mockRepositories.spendingControl.findByCard.mockResolvedValue(null);

      const result = await jitService.checkMerchantRestrictions('card-123', 'Test Merchant', '5411');

      expect(result.allowed).toBe(true);
    });

    it('should reject blocked merchant', async () => {
      mockRepositories.spendingControl.findByCard.mockResolvedValue({
        merchant_restrictions: JSON.stringify({
          blocked_merchants: ['Blocked Merchant']
        })
      });

      const result = await jitService.checkMerchantRestrictions('card-123', 'Blocked Merchant', '5411');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('MERCHANT_BLOCKED');
    });
  });

  describe('processTransactionWebhook', () => {
    it('should process authorization webhook', async () => {
      mockRepositories.card.findById.mockResolvedValue({
        id: 'card-123',
        user_id: 'user-123',
        status: 'active'
      });

      mockRepositories.user.findById.mockResolvedValue({
        id: 'user-123',
        account_type: 'business'
      });

      mockRepositories.spendingControl.findByCard.mockResolvedValue(null);

      const webhookData = {
        type: 'transaction.authorization',
        transaction: {
          card_token: 'card-123',
          amount: 10000, // $100 in cents
          merchant: {
            name: 'Test Merchant',
            mcc: '5411'
          }
        }
      };

      const result = await jitService.processTransactionWebhook(webhookData);

      expect(result.approved).toBe(true);
      expect(result.reason).toBe('APPROVED');
    });

    it('should process clearing webhook', async () => {
      const webhookData = {
        type: 'transaction.clearing',
        transaction: {
          token: 'txn-123',
          card_token: 'card-123',
          amount: 10000,
          merchant: {
            name: 'Test Merchant',
            mcc: '5411'
          },
          state: 'completed',
          type: 'authorization',
          created_time: '2024-01-01T00:00:00Z'
        }
      };

      const result = await jitService.processTransactionWebhook(webhookData);

      expect(result.processed).toBe(true);
      expect(mockRepositories.transaction.create).toHaveBeenCalledWith({
        marqetaTransactionToken: 'txn-123',
        cardId: 'card-123',
        amount: 100,
        merchantName: 'Test Merchant',
        merchantCategory: '5411',
        status: 'completed',
        transactionType: 'authorization',
        createdAt: '2024-01-01T00:00:00Z'
      });
    });
  });
});