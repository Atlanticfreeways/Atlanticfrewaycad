const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');
const BaseAdapter = require('./BaseAdapter');

class MongoDBAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.config.MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        retryWrites: true,
        w: 'majority'
      });

      await this.client.connect();
      this.db = this.client.db(this.config.MONGODB_DB || 'atlanticfrewaycard');
      this.isConnected = true;

      logger.info('MongoDB connection established');

      // Monitor connection events
      this.client.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        this.isConnected = false;
      });

      return this.db;
    } catch (error) {
      this.isConnected = false;
      this.handleConnectionError(error, 'MongoDB connection failed');
    }
  }

  async executeQuery(collection, operation, params = {}) {
    this.validateConnection();
    const start = Date.now();

    try {
      const col = this.db.collection(collection);
      let result;

      switch (operation) {
        case 'findOne':
          result = await col.findOne(params.filter);
          break;
        case 'find':
          result = await col.find(params.filter).toArray();
          break;
        case 'insertOne':
          result = await col.insertOne(params.document);
          break;
        case 'updateOne':
          result = await col.updateOne(params.filter, { $set: params.update });
          break;
        case 'deleteOne':
          result = await col.deleteOne(params.filter);
          break;
        case 'aggregate':
          result = await col.aggregate(params.pipeline).toArray();
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      const duration = Date.now() - start;
      this.logSlowOperation(`${operation} on ${collection}`, duration, 100, {
        collection,
        operation
      });

      return result;
    } catch (error) {
      this.handleQueryError(error, `${operation} on ${collection}`, []);
    }
  }

  async createIndexes(collection, indexes) {
    try {
      const col = this.db.collection(collection);
      for (const index of indexes) {
        await col.createIndex(index.keys, index.options || {});
      }
      logger.info(`Indexes created for collection: ${collection}`);
    } catch (error) {
      logger.error('Failed to create indexes:', error);
      throw error;
    }
  }

  async getConnectionStats() {
    try {
      const stats = await this.db.admin().serverStatus();
      return {
        connections: stats.connections,
        uptime: stats.uptime
      };
    } catch (error) {
      logger.error('Failed to get connection stats:', error);
      return null;
    }
  }

  async healthCheck() {
    try {
      await this.db.admin().ping();
      logger.info('MongoDB health check successful');
      this.isConnected = true;
      return { healthy: true, adapter: 'MongoDB' };
    } catch (error) {
      logger.error('MongoDB health check failed:', error);
      this.isConnected = false;
      this.handleConnectionError(error, 'Health check failed');
    }
  }

  async close() {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        logger.info('MongoDB connection closed');
      }
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

module.exports = MongoDBAdapter;
