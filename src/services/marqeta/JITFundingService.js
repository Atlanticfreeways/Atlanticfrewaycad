const logger = require('../../utils/logger');

class JITFundingService {
  constructor(redisAdapter, postgresAdapter, messageQueueManager) {
    this.redis = redisAdapter;
    this.postgres = postgresAdapter;
    this.mq = messageQueueManager;
  }

  async authorizeTransaction(transaction) {
    const startTime = Date.now();
    const stages = {};

    try {
      // Stage 1: Get user from cache
      stages.userLookup = { start: Date.now() };
      const user = await this.getUser(transaction.userId);
      stages.userLookup.duration = Date.now() - stages.userLookup.start;

      if (!user) {
        return { approved: false, reason: 'user_not_found', latency: Date.now() - startTime };
      }

      // Stage 2: Get card from cache
      stages.cardLookup = { start: Date.now() };
      const card = await this.getCard(transaction.cardId);
      stages.cardLookup.duration = Date.now() - stages.cardLookup.start;

      if (!card || card.status !== 'active') {
        return { approved: false, reason: 'card_inactive', latency: Date.now() - startTime };
      }

      // Stage 3: Check balance
      stages.balanceCheck = { start: Date.now() };
      const hasBalance = await this.checkBalance(user.id, transaction.amount);
      stages.balanceCheck.duration = Date.now() - stages.balanceCheck.start;

      if (!hasBalance) {
        return { approved: false, reason: 'insufficient_funds', latency: Date.now() - startTime };
      }

      // Stage 4: Check spending limits
      stages.limitsCheck = { start: Date.now() };
      const limitsOk = await this.checkSpendingLimits(card.id, transaction.amount);
      stages.limitsCheck.duration = Date.now() - stages.limitsCheck.start;

      if (!limitsOk) {
        return { approved: false, reason: 'spending_limit_exceeded', latency: Date.now() - startTime };
      }

      // Stage 5: Check merchant restrictions
      stages.merchantCheck = { start: Date.now() };
      const merchantOk = await this.checkMerchantRestrictions(card.id, transaction.merchant);
      stages.merchantCheck.duration = Date.now() - stages.merchantCheck.start;

      if (!merchantOk) {
        return { approved: false, reason: 'merchant_restricted', latency: Date.now() - startTime };
      }

      // Stage 6: Update spending counters
      stages.updateCounters = { start: Date.now() };
      await this.updateSpendingCounters(card.id, transaction.amount);
      stages.updateCounters.duration = Date.now() - stages.updateCounters.start;

      const latency = Date.now() - startTime;

      // Log metrics
      logger.info(`Authorization approved in ${latency}ms`, { stages, transaction: transaction.id });

      return {
        approved: true,
        reason: 'approved',
        latency,
        stages
      };
    } catch (error) {
      logger.error(`Authorization error: ${error.message}`, { transaction: transaction.id });
      return { approved: false, reason: 'system_error', latency: Date.now() - startTime };
    }
  }

  async getUser(userId) {
    try {
      const cached = await this.redis.get(`user:${userId}`);
      if (cached) return JSON.parse(cached);

      const user = await this.postgres.query(
        'SELECT id, balance FROM users WHERE id = $1',
        [userId]
      );

      if (user.rows[0]) {
        await this.redis.set(`user:${userId}`, JSON.stringify(user.rows[0]), 3600);
        return user.rows[0];
      }
      return null;
    } catch (error) {
      logger.error(`Error getting user: ${error.message}`);
      return null;
    }
  }

  async getCard(cardId) {
    try {
      const cached = await this.redis.get(`card:${cardId}`);
      if (cached) return JSON.parse(cached);

      const card = await this.postgres.query(
        'SELECT id, user_id, status, daily_limit, monthly_limit FROM cards WHERE id = $1',
        [cardId]
      );

      if (card.rows[0]) {
        await this.redis.set(`card:${cardId}`, JSON.stringify(card.rows[0]), 900);
        return card.rows[0];
      }
      return null;
    } catch (error) {
      logger.error(`Error getting card: ${error.message}`);
      return null;
    }
  }

  async checkBalance(userId, amount) {
    try {
      const user = await this.postgres.query(
        'SELECT balance FROM users WHERE id = $1',
        [userId]
      );

      return user.rows[0] && user.rows[0].balance >= amount;
    } catch (error) {
      logger.error(`Error checking balance: ${error.message}`);
      return false;
    }
  }

  async checkSpendingLimits(cardId, amount) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailySpent = await this.postgres.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE card_id = $1 AND DATE(created_at) = $2',
        [cardId, today]
      );

      const card = await this.getCard(cardId);
      if (!card) return false;

      return (dailySpent.rows[0].total + amount) <= card.daily_limit;
    } catch (error) {
      logger.error(`Error checking spending limits: ${error.message}`);
      return false;
    }
  }

  async checkMerchantRestrictions(cardId, merchant) {
    try {
      const restrictions = await this.postgres.query(
        'SELECT blocked_merchants FROM spending_controls WHERE card_id = $1 AND control_type = $2',
        [cardId, 'merchant_restriction']
      );

      if (restrictions.rows.length === 0) return true;

      const blocked = restrictions.rows[0].blocked_merchants || [];
      return !blocked.includes(merchant);
    } catch (error) {
      logger.error(`Error checking merchant restrictions: ${error.message}`);
      return true;
    }
  }

  async updateSpendingCounters(cardId, amount) {
    try {
      const today = new Date().toISOString().split('T')[0];
      await this.postgres.query(
        'UPDATE cards SET daily_spent = daily_spent + $1, monthly_spent = monthly_spent + $1 WHERE id = $2',
        [amount, cardId]
      );

      // Invalidate cache
      await this.redis.del(`card:${cardId}`);
    } catch (error) {
      logger.error(`Error updating spending counters: ${error.message}`);
    }
  }

  async processTransactionWebhook(webhook) {
    try {
      const transaction = {
        id: webhook.transactionId,
        cardId: webhook.cardId,
        userId: webhook.userId,
        amount: webhook.amount,
        merchant: webhook.merchant,
        status: webhook.status,
        timestamp: new Date().toISOString()
      };

      // Publish event
      if (this.mq) {
        await this.mq.publishMessage('transactions', 'transaction.webhook', transaction);
      }

      logger.info(`Webhook processed: ${webhook.transactionId}`);
      return transaction;
    } catch (error) {
      logger.error(`Error processing webhook: ${error.message}`);
      throw error;
    }
  }
}

module.exports = JITFundingService;
