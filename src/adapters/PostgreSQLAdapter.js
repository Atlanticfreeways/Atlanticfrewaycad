const { Pool } = require('pg');
const logger = require('../utils/logger');
const BaseAdapter = require('./BaseAdapter');

class PostgreSQLAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
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
      this.isConnected = true;
    });

    this.pool.on('remove', () => {
      logger.debug('Database connection removed from pool');
    });
  }

  async executeQuery(query, params = []) {
    this.validateConnection();
    const start = Date.now();
    const client = await this.pool.connect();

    try {
      const result = await client.query(query, params);
      const duration = Date.now() - start;

      // Log slow queries for profiling
      this.logSlowOperation('executeQuery', duration, 100, {
        query: query.substring(0, 100),
        params: params.length
      });

      return result;
    } catch (error) {
      this.handleQueryError(error, query, params);
    } finally {
      client.release();
    }
  }

  async executeTransaction(callback) {
    this.validateConnection();
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        logger.error('Rollback error:', rollbackError);
      }
      this.handleTransactionError(error, 'Transaction execution failed');
    } finally {
      client.release();
    }
  }

  async healthCheck() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      logger.info('PostgreSQL health check successful');
      this.isConnected = true;
      return { healthy: true, adapter: 'PostgreSQL' };
    } catch (error) {
      logger.error('PostgreSQL health check failed:', error);
      this.isConnected = false;
      this.handleConnectionError(error, 'Health check failed');
    }
  }

  async testConnection() {
    return this.healthCheck();
  }

  async getPoolStats() {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingRequests: this.pool.waitingCount
    };
  }

  async close() {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('PostgreSQL connection pool closed');
    } catch (error) {
      logger.error('Error closing PostgreSQL connection pool:', error);
      throw error;
    }
  }
}

module.exports = PostgreSQLAdapter;
