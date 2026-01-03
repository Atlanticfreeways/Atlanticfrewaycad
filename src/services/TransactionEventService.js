const logger = require('../utils/logger');

class TransactionEventService {
  constructor(messageQueueManager) {
    this.mqManager = messageQueueManager;
  }

  async publishTransactionEvent(transaction) {
    try {
      const event = {
        type: 'transaction.created',
        transactionId: transaction.id,
        userId: transaction.userId,
        cardId: transaction.cardId,
        amount: transaction.amount,
        currency: transaction.currency,
        merchant: transaction.merchant,
        status: transaction.status,
        timestamp: new Date().toISOString()
      };

      await this.mqManager.publishWithRetry('transactions', 'transaction.created', event);
      logger.info(`Transaction event published: ${transaction.id}`);
      return event;
    } catch (error) {
      logger.error('Failed to publish transaction event:', error.message);
      throw error;
    }
  }

  async publishAuthorizationEvent(authorization) {
    try {
      const event = {
        type: 'authorization.decision',
        authorizationId: authorization.id,
        transactionId: authorization.transactionId,
        cardId: authorization.cardId,
        approved: authorization.approved,
        reason: authorization.reason,
        latency: authorization.latency,
        timestamp: new Date().toISOString()
      };

      await this.mqManager.publishWithRetry('transactions', 'authorization.decision', event);
      logger.info(`Authorization event published: ${authorization.id}`);
      return event;
    } catch (error) {
      logger.error('Failed to publish authorization event:', error.message);
      throw error;
    }
  }

  async publishWebhookEvent(webhook) {
    try {
      const event = {
        type: 'webhook.received',
        webhookId: webhook.id,
        source: webhook.source,
        eventType: webhook.eventType,
        data: webhook.data,
        timestamp: new Date().toISOString()
      };

      await this.mqManager.publishWithRetry('transactions', 'webhook.received', event);
      logger.info(`Webhook event published: ${webhook.id}`);
      return event;
    } catch (error) {
      logger.error('Failed to publish webhook event:', error.message);
      throw error;
    }
  }

  async publishCardEvent(card) {
    try {
      const event = {
        type: 'card.issued',
        cardId: card.id,
        userId: card.userId,
        cardType: card.cardType,
        status: card.status,
        timestamp: new Date().toISOString()
      };

      await this.mqManager.publishWithRetry('transactions', 'card.issued', event);
      logger.info(`Card event published: ${card.id}`);
      return event;
    } catch (error) {
      logger.error('Failed to publish card event:', error.message);
      throw error;
    }
  }

  async publishSpendingLimitEvent(limit) {
    try {
      const event = {
        type: 'spending.limit.exceeded',
        limitId: limit.id,
        cardId: limit.cardId,
        limitType: limit.limitType,
        limitAmount: limit.limitAmount,
        currentSpending: limit.currentSpending,
        timestamp: new Date().toISOString()
      };

      await this.mqManager.publishWithRetry('transactions', 'spending.limit.exceeded', event);
      logger.info(`Spending limit event published: ${limit.id}`);
      return event;
    } catch (error) {
      logger.error('Failed to publish spending limit event:', error.message);
      throw error;
    }
  }
}

module.exports = TransactionEventService;
