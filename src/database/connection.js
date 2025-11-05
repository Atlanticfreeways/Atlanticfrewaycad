const { Pool } = require('pg');
const redis = require('redis');

class DatabaseConnection {
  constructor() {
    this.pgPool = null;
    this.redisClient = null;
  }

  async initPostgres() {
    this.pgPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'atlanticfrewaycard',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      max: parseInt(process.env.POSTGRES_POOL_SIZE) || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pgPool.on('error', (err) => {
      console.error('Unexpected PostgreSQL error:', err);
    });

    await this.pgPool.query('SELECT NOW()');
    console.log('✓ PostgreSQL connected');
  }

  async initRedis() {
    this.redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD,
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await this.redisClient.connect();
    console.log('✓ Redis connected');
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
}

module.exports = new DatabaseConnection();
