const PostgreSQLAdapter = require('../adapters/PostgreSQLAdapter');
const RedisAdapter = require('../adapters/RedisAdapter');
const MessageQueueManager = require('../queue/MessageQueueManager');
const logger = require('../utils/logger');

class DatabaseManager {
  constructor(config) {
    this.config = config;
    this.postgres = null;
    this.redis = null;
    this.messageQueue = null;
  }

  async initialize() {
    try {
      logger.info('Initializing database connections...');

      // Initialize PostgreSQL
      this.postgres = new PostgreSQLAdapter(this.config);
      await this.postgres.testConnection();
      logger.info('PostgreSQL connected');

      // Initialize Redis
      this.redis = new RedisAdapter(this.config);
      await this.redis.connect();
      logger.info('Redis connected');

      // Initialize Message Queue
      this.messageQueue = new MessageQueueManager(this.config);
      await this.messageQueue.connect();
      logger.info('Message Queue connected');

      // Create PostgreSQL indexes
      await this.createPostgreSQLIndexes();

      logger.info('All database connections initialized successfully');

      return {
        postgres: this.postgres,
        redis: this.redis,
        messageQueue: this.messageQueue
      };
    } catch (error) {
      logger.error('Failed to initialize database connections:', error);
      throw error;
    }
  }

  async createPostgreSQLIndexes() {
    try {
      const indexes = [
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_date 
         ON transactions(user_id, created_at DESC)`,

        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_card_status 
         ON transactions(card_id, status) WHERE status = 'completed'`,

        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cards_user_active 
         ON cards(user_id, status) WHERE status = 'active'`,

        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_company_role 
         ON users(company_id, role)`,

        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_pending 
         ON transactions(created_at) WHERE status = 'pending'`,

        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spending_controls_card 
         ON spending_controls(card_id, status)`,

        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_user 
         ON wallets(user_id, currency)`
      ];

      for (const index of indexes) {
        try {
          await this.postgres.executeQuery(index);
        } catch (error) {
          // Index might already exist, continue
          logger.debug('Index creation note:', error.message);
        }
      }

      logger.info('PostgreSQL indexes created');
    } catch (error) {
      logger.error('Failed to create PostgreSQL indexes:', error);
    }
  }

  async getHealthStatus() {
    const status = {
      postgres: 'unknown',
      redis: 'unknown',
      messageQueue: 'unknown'
    };

    try {
      // Check PostgreSQL
      const pgStats = await this.postgres.getPoolStats();
      status.postgres = pgStats ? 'healthy' : 'unhealthy';
    } catch (error) {
      status.postgres = 'unhealthy';
    }

    try {
      // Check Redis
      const redisStats = await this.redis.getCacheStats();
      status.redis = redisStats ? 'healthy' : 'unhealthy';
    } catch (error) {
      status.redis = 'unhealthy';
    }

    try {
      // Check Message Queue
      const queueStats = await this.messageQueue.getQueueStats(
        'jit-funding-queue'
      );
      status.messageQueue = queueStats ? 'healthy' : 'unhealthy';
    } catch (error) {
      status.messageQueue = 'unhealthy';
    }

    return status;
  }

  async close() {
    try {
      logger.info('Closing database connections...');

      if (this.postgres) {
        await this.postgres.close();
      }

      if (this.redis) {
        await this.redis.close();
      }

      if (this.messageQueue) {
        await this.messageQueue.close();
      }

      logger.info('All database connections closed');
    } catch (error) {
      logger.error('Error closing database connections:', error);
    }
  }
}

module.exports = DatabaseManager;
