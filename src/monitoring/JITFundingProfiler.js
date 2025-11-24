const logger = require('../utils/logger');

class JITFundingProfiler {
  constructor(redisAdapter, postgresAdapter) {
    this.redis = redisAdapter;
    this.postgres = postgresAdapter;
    this.metrics = [];
  }

  async profileAuthorization(transaction) {
    const metrics = {
      transactionId: transaction.id,
      startTime: Date.now(),
      stages: {}
    };

    try {
      // Stage 1: User lookup
      metrics.stages.userLookup = { start: Date.now() };
      const user = await this.getUserFromCache(transaction.userId);
      metrics.stages.userLookup.duration = Date.now() - metrics.stages.userLookup.start;

      // Stage 2: Card lookup
      metrics.stages.cardLookup = { start: Date.now() };
      const card = await this.getCardFromCache(transaction.cardId);
      metrics.stages.cardLookup.duration = Date.now() - metrics.stages.cardLookup.start;

      // Stage 3: Spending limits check
      metrics.stages.limitsCheck = { start: Date.now() };
      const limits = await this.getSpendingLimitsFromCache(transaction.cardId);
      metrics.stages.limitsCheck.duration = Date.now() - metrics.stages.limitsCheck.start;

      // Stage 4: Decision logic
      metrics.stages.decision = { start: Date.now() };
      const decision = this.makeDecision(transaction, user, card, limits);
      metrics.stages.decision.duration = Date.now() - metrics.stages.decision.start;

      metrics.totalDuration = Date.now() - metrics.startTime;
      metrics.approved = decision.approved;
      metrics.reason = decision.reason;

      // Log metrics for analysis
      this.logMetrics(metrics);

      return { decision, metrics };
    } catch (error) {
      logger.error('JIT funding profiling error:', error);
      metrics.error = error.message;
      metrics.totalDuration = Date.now() - metrics.startTime;
      this.logMetrics(metrics);

      return {
        decision: { approved: false, reason: 'system_error' },
        metrics
      };
    }
  }

  async getUserFromCache(userId) {
    try {
      return await this.redis.getFromCache(`user:${userId}`);
    } catch (error) {
      logger.error('Failed to get user from cache:', error);
      return null;
    }
  }

  async getCardFromCache(cardId) {
    try {
      return await this.redis.getFromCache(`card:${cardId}`);
    } catch (error) {
      logger.error('Failed to get card from cache:', error);
      return null;
    }
  }

  async getSpendingLimitsFromCache(cardId) {
    try {
      return await this.redis.getFromCache(`limits:${cardId}`);
    } catch (error) {
      logger.error('Failed to get spending limits from cache:', error);
      return null;
    }
  }

  makeDecision(transaction, user, card, limits) {
    // Fast decision logic
    if (!card || card.status !== 'active') {
      return { approved: false, reason: 'card_inactive' };
    }

    if (!user || user.status !== 'active') {
      return { approved: false, reason: 'user_inactive' };
    }

    if (transaction.amount > limits?.daily) {
      return { approved: false, reason: 'daily_limit_exceeded' };
    }

    if (transaction.amount > limits?.transaction) {
      return { approved: false, reason: 'transaction_limit_exceeded' };
    }

    if (user.balance < transaction.amount) {
      return { approved: false, reason: 'insufficient_funds' };
    }

    return { approved: true, reason: 'approved' };
  }

  logMetrics(metrics) {
    this.metrics.push(metrics);

    logger.info('JIT Funding Metrics', {
      transactionId: metrics.transactionId,
      totalDuration: metrics.totalDuration,
      stages: metrics.stages,
      approved: metrics.approved,
      timestamp: new Date().toISOString()
    });

    // Alert if exceeds 100ms threshold
    if (metrics.totalDuration > 100) {
      logger.warn('JIT funding exceeded threshold', {
        transactionId: metrics.transactionId,
        duration: metrics.totalDuration,
        stages: metrics.stages
      });
    }

    // Alert if exceeds 50ms threshold (warning level)
    if (metrics.totalDuration > 50 && metrics.totalDuration <= 100) {
      logger.debug('JIT funding approaching threshold', {
        transactionId: metrics.transactionId,
        duration: metrics.totalDuration
      });
    }
  }

  getMetricsStats() {
    if (this.metrics.length === 0) {
      return null;
    }

    const durations = this.metrics.map((m) => m.totalDuration);
    const sorted = durations.sort((a, b) => a - b);

    return {
      count: this.metrics.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      approvalRate:
        (this.metrics.filter((m) => m.approved).length / this.metrics.length) *
        100
    };
  }

  resetMetrics() {
    this.metrics = [];
  }
}

module.exports = JITFundingProfiler;
