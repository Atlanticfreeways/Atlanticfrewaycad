const { Pool } = require('pg');
const redis = require('redis');
const logger = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.pgPool = null;
    this.redisClient = null;
  }

  async initPostgres(retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        // Use DATABASE_URL if available (Railway), otherwise use individual vars
        const poolConfig = process.env.DATABASE_URL ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
          } : false
        } : {
          host: process.env.POSTGRES_HOST || 'localhost',
          port: process.env.POSTGRES_PORT || 5432,
          database: process.env.POSTGRES_DB || 'atlanticfrewaycard',
          user: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD,
          max: parseInt(process.env.POSTGRES_POOL_SIZE) || 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
          } : false
        };
        
        this.pgPool = new Pool(poolConfig);

        this.pgPool.on('error', (err) => {
          logger.error('Unexpected PostgreSQL error', { error: err.message });
        });

        await this.pgPool.query('SELECT NOW()');
        logger.info('PostgreSQL connected');
        return;
      } catch (err) {
        logger.error(`PostgreSQL connection attempt ${i + 1} failed`, { error: err.message });
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async initRedis(retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        this.redisClient = redis.createClient({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
          },
          password: process.env.REDIS_PASSWORD,
        });

        this.redisClient.on('error', (err) => {
          logger.error('Redis error', { error: err.message });
        });

        await this.redisClient.connect();
        logger.info('Redis connected');
        return;
      } catch (err) {
        logger.error(`Redis connection attempt ${i + 1} failed`, { error: err.message });
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  async init() {
    await this.initPostgres();
    await this.initRedis();
  }

  async close() {
    if (this.pgPool) await this.pgPool.end();
    if (this.redisClient) await this.redisClient.quit();
  }

  getPostgres() {
    return this.pgPool;
  }

  getRedis() {
    return this.redisClient;
  }

  async healthCheck() {
    const status = { postgres: 'unknown', redis: 'unknown' };
    
    try {
      if (this.pgPool) {
        await this.pgPool.query('SELECT 1');
        status.postgres = 'healthy';
      } else {
        status.postgres = 'not_initialized';
      }
    } catch (err) {
      status.postgres = 'unhealthy';
      logger.error('PostgreSQL health check failed', { error: err.message });
    }
    
    try {
      if (this.redisClient && this.redisClient.isOpen) {
        await this.redisClient.ping();
        status.redis = 'healthy';
      } else {
        status.redis = 'not_initialized';
      }
    } catch (err) {
      status.redis = 'unhealthy';
      logger.error('Redis health check failed', { error: err.message });
    }
    
    return status;
  }
}

module.exports = new DatabaseConnection();
