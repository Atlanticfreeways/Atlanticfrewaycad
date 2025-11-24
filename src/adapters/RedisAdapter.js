const redis = require('redis');
const logger = require('../utils/logger');

class RedisAdapter {
  constructor(config) {
    this.config = config;
    this.client = null;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: this.config.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
          connectTimeout: 5000
        },
        retry_strategy: (options) => Math.min(options.attempt * 100, 3000)
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis reconnecting');
      });

      await this.client.connect();
      logger.info('Redis connection established');

      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  // Cache strategies by data type
  async cacheUser(userId, userData, ttl = 3600) {
    try {
      await this.client.setEx(
        `user:${userId}`,
        ttl,
        JSON.stringify(userData)
      );
    } catch (error) {
      logger.error('Failed to cache user:', error);
    }
  }

  async cacheCard(cardId, cardData, ttl = 900) {
    try {
      await this.client.setEx(
        `card:${cardId}`,
        ttl,
        JSON.stringify(cardData)
      );
    } catch (error) {
      logger.error('Failed to cache card:', error);
    }
  }

  async cacheSpendingLimits(cardId, limits, ttl = 300) {
    try {
      await this.client.setEx(
        `limits:${cardId}`,
        ttl,
        JSON.stringify(limits)
      );
    } catch (error) {
      logger.error('Failed to cache spending limits:', error);
    }
  }

  async cacheTransaction(transactionId, transaction, ttl = 300) {
    try {
      await this.client.setEx(
        `transaction:${transactionId}`,
        ttl,
        JSON.stringify(transaction)
      );
    } catch (error) {
      logger.error('Failed to cache transaction:', error);
    }
  }

  async getFromCache(key) {
    try {
      const data = await this.client.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      logger.error('Failed to get from cache:', error);
      return null;
    }
  }

  async invalidateUserCache(userId) {
    try {
      const keys = await this.client.keys(`user:${userId}*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('Failed to invalidate user cache:', error);
    }
  }

  async invalidateCardCache(cardId) {
    try {
      const keys = await this.client.keys(`card:${cardId}*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('Failed to invalidate card cache:', error);
    }
  }

  async setSession(sessionId, sessionData, ttl = 86400) {
    try {
      await this.client.setEx(
        `session:${sessionId}`,
        ttl,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      logger.error('Failed to set session:', error);
    }
  }

  async getSession(sessionId) {
    try {
      const data = await this.client.get(`session:${sessionId}`);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      logger.error('Failed to get session:', error);
      return null;
    }
  }

  async deleteSession(sessionId) {
    try {
      await this.client.del(`session:${sessionId}`);
    } catch (error) {
      logger.error('Failed to delete session:', error);
    }
  }

  async incrementCounter(key, increment = 1) {
    try {
      return await this.client.incrBy(key, increment);
    } catch (error) {
      logger.error('Failed to increment counter:', error);
      return null;
    }
  }

  async getCounter(key) {
    try {
      const value = await this.client.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      logger.error('Failed to get counter:', error);
      return 0;
    }
  }

  async getCacheStats() {
    try {
      const info = await this.client.info('stats');
      return info;
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return null;
    }
  }

  async close() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis connection closed');
    }
  }
}

module.exports = RedisAdapter;
