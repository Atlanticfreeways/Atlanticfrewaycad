const { Pool } = require('pg');
const logger = require('../utils/logger');

class PostgreSQLAdapter {
  constructor(config) {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: 20, // Maximum connections
      min: 5, // Minimum connections
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000,
      acquireTimeoutMillis: 60000,
      statement_timeout: 30000, // Query timeout
      application_name: 'atlanticfrewaycard'
    });

    // Monitor pool health
    this.pool.on('error', (err) => {
      logger.error('Database pool error:', err);
    });

    this.pool.on('connect', () => {
      logger.debug('New database connection established');
    });

    this.pool.on('remove', () => {
      logger.debug('Database connection removed from pool');
    });
  }

  async executeQuery(query, params = []) {
    const start = Date.now();
    const client = await this.pool.connect();

    try {
      const result = await client.query(query, params);
      const duration = Date.now() - start;

      // Log slow queries for profiling
      if (duration > 100) {
        logger.warn('Slow query detected', {
          duration,
          query: query.substring(0, 100),
          params: params.length
        });
      }

      return result;
    } catch (error) {
      logger.error('Query execution error:', {
        error: error.message,
        query: query.substring(0, 100)
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async executeTransaction(callback) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async testConnection() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      logger.info('PostgreSQL connection test successful');
      return result;
    } catch (error) {
      logger.error('PostgreSQL connection test failed:', error);
      throw error;
    }
  }

  async getPoolStats() {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingRequests: this.pool.waitingCount
    };
  }

  async close() {
    await this.pool.end();
    logger.info('PostgreSQL connection pool closed');
  }
}

module.exports = PostgreSQLAdapter;
