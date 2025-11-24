const express = require('express');
const router = express.Router();

let databaseManager = null;

// Initialize with database manager
function initializeHealthRoutes(dbManager) {
  databaseManager = dbManager;
}

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const status = await databaseManager.getHealthStatus();

    const overallHealth = Object.values(status).every(
      (s) => s === 'healthy'
    )
      ? 'healthy'
      : 'degraded';

    res.status(overallHealth === 'healthy' ? 200 : 503).json({
      status: overallHealth,
      timestamp: new Date().toISOString(),
      services: status
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ready check endpoint
router.get('/ready', async (req, res) => {
  try {
    const status = await databaseManager.getHealthStatus();

    const isReady = Object.values(status).every((s) => s === 'healthy');

    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      timestamp: new Date().toISOString(),
      services: status
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = { router, initializeHealthRoutes };
