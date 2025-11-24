const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

class MongoDBAdapter {
  constructor(config) {
    this.config = config;
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

      logger.info('MongoDB connection established');

      // Monitor connection events
      this.client.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      return this.db;
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async executeQuery(collection, operation, params = {}) {
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

      if (duration > 100) {
        logger.warn('Slow MongoDB query detected', {
          duration,
          collection,
          operation
        });
      }

      return result;
    } catch (error) {
      logger.error('MongoDB query error:', {
        error: error.message,
        collection,
        operation
      });
      throw error;
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

  async close() {
    if (this.client) {
      await this.client.close();
      logger.info('MongoDB connection closed');
    }
  }
}

module.exports = MongoDBAdapter;
