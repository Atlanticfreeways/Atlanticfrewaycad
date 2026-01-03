const TransactionEventService = require('../../../src/services/TransactionEventService');

describe('TransactionEventService', () => {
  let service;
  let mockMQManager;

  beforeEach(() => {
    mockMQManager = {
      publishWithRetry: jest.fn().mockResolvedValue(true)
    };

    service = new TransactionEventService(mockMQManager);
  });

  describe('publishTransactionEvent', () => {
    it('should publish transaction event with correct routing key', async () => {
      const transaction = {
        id: 'txn-1',
        userId: 'user-1',
        cardId: 'card-1',
        amount: 100,
        currency: 'USD',
        merchant: 'Amazon',
        status: 'completed'
      };

      await service.publishTransactionEvent(transaction);

      expect(mockMQManager.publishWithRetry).toHaveBeenCalledWith(
        'transactions',
        'transaction.created',
        expect.objectContaining({
          type: 'transaction.created',
          transactionId: 'txn-1',
          userId: 'user-1',
          cardId: 'card-1',
          amount: 100
        })
      );
    });

    it('should include timestamp in event', async () => {
      const transaction = { id: 'txn-1', userId: 'user-1', cardId: 'card-1', amount: 100, currency: 'USD', merchant: 'Test', status: 'completed' };
      await service.publishTransactionEvent(transaction);

      const call = mockMQManager.publishWithRetry.mock.calls[0];
      expect(call[2].timestamp).toBeDefined();
    });
  });

  describe('publishAuthorizationEvent', () => {
    it('should publish authorization event with correct routing key', async () => {
      const authorization = {
        id: 'auth-1',
        transactionId: 'txn-1',
        cardId: 'card-1',
        approved: true,
        reason: 'approved',
        latency: 45
      };

      await service.publishAuthorizationEvent(authorization);

      expect(mockMQManager.publishWithRetry).toHaveBeenCalledWith(
        'transactions',
        'authorization.decision',
        expect.objectContaining({
          type: 'authorization.decision',
          authorizationId: 'auth-1',
          approved: true,
          latency: 45
        })
      );
    });

    it('should handle denied authorization', async () => {
      const authorization = {
        id: 'auth-2',
        transactionId: 'txn-2',
        cardId: 'card-2',
        approved: false,
        reason: 'insufficient_funds',
        latency: 32
      };

      await service.publishAuthorizationEvent(authorization);

      const call = mockMQManager.publishWithRetry.mock.calls[0];
      expect(call[2].approved).toBe(false);
      expect(call[2].reason).toBe('insufficient_funds');
    });
  });

  describe('publishWebhookEvent', () => {
    it('should publish webhook event with correct routing key', async () => {
      const webhook = {
        id: 'webhook-1',
        source: 'marqeta',
        eventType: 'transaction.completed',
        data: { transactionId: 'txn-1', status: 'completed' }
      };

      await service.publishWebhookEvent(webhook);

      expect(mockMQManager.publishWithRetry).toHaveBeenCalledWith(
        'transactions',
        'webhook.received',
        expect.objectContaining({
          type: 'webhook.received',
          webhookId: 'webhook-1',
          source: 'marqeta',
          eventType: 'transaction.completed'
        })
      );
    });
  });

  describe('publishCardEvent', () => {
    it('should publish card event with correct routing key', async () => {
      const card = {
        id: 'card-1',
        userId: 'user-1',
        cardType: 'virtual',
        status: 'active'
      };

      await service.publishCardEvent(card);

      expect(mockMQManager.publishWithRetry).toHaveBeenCalledWith(
        'transactions',
        'card.issued',
        expect.objectContaining({
          type: 'card.issued',
          cardId: 'card-1',
          userId: 'user-1',
          cardType: 'virtual'
        })
      );
    });
  });

  describe('publishSpendingLimitEvent', () => {
    it('should publish spending limit exceeded event', async () => {
      const limit = {
        id: 'limit-1',
        cardId: 'card-1',
        limitType: 'daily',
        limitAmount: 1000,
        currentSpending: 1050
      };

      await service.publishSpendingLimitEvent(limit);

      expect(mockMQManager.publishWithRetry).toHaveBeenCalledWith(
        'transactions',
        'spending.limit.exceeded',
        expect.objectContaining({
          type: 'spending.limit.exceeded',
          limitId: 'limit-1',
          limitAmount: 1000,
          currentSpending: 1050
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error on publish failure', async () => {
      mockMQManager.publishWithRetry.mockRejectedValue(new Error('Connection failed'));

      const transaction = { id: 'txn-1', userId: 'user-1', cardId: 'card-1', amount: 100, currency: 'USD', merchant: 'Test', status: 'completed' };

      await expect(service.publishTransactionEvent(transaction))
        .rejects.toThrow('Connection failed');
    });

    it('should handle all event types on error', async () => {
      mockMQManager.publishWithRetry.mockRejectedValue(new Error('Connection failed'));

      const authorization = { id: 'auth-1', transactionId: 'txn-1', cardId: 'card-1', approved: true, reason: 'approved', latency: 45 };

      await expect(service.publishAuthorizationEvent(authorization))
        .rejects.toThrow('Connection failed');
    });
  });
});
