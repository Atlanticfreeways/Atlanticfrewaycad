const DatabaseManager = require('../database/DatabaseManager');
const logger = require('../utils/logger');

let dbManager = null;

async function initializeDatabases() {
  try {
    dbManager = new DatabaseManager({
      DATABASE_URL: process.env.DATABASE_URL,
      MONGODB_URI: process.env.MONGODB_URI,
      MONGODB_DB: process.env.MONGODB_DB || 'atlanticfrewaycard',
      REDIS_URL: process.env.REDIS_URL,
      RABBITMQ_URL: process.env.RABBITMQ_URL
    });

    await dbManager.initialize();
    logger.info('All databases initialized successfully');

    return dbManager;
  } catch (error) {
    logger.error('Failed to initialize databases:', error);
    throw error;
  }
}

function getDatabaseManager() {
  return dbManager;
}

async function closeDatabases() {
  if (dbManager) {
    await dbManager.close();
  }
}

module.exports = {
  initializeDatabases,
  getDatabaseManager,
  closeDatabases
};
