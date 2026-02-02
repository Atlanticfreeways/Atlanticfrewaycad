const jwt = require('jsonwebtoken');
const db = require('../models/database');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // 1. Try Redis Cache
    const redis = dbConnection.getRedis();
    let user = null;

    if (redis && redis.isOpen) {
      try {
        const cached = await redis.get(`session:user:${userId}`);
        if (cached) {
          user = JSON.parse(cached);
        }
      } catch (redisErr) {
        logger.warn('Redis auth cache error', { error: redisErr.message });
      }
    }

    // 2. Fallback to Database
    if (!user) {
      user = await db.getUserById(userId);

      if (!user || user.status !== 'active') {
        return res.status(403).json({ error: 'Invalid or inactive user' });
      }

      // 3. Set Cache (TTL 15 mins)
      if (redis && redis.isOpen) {
        // Remove sensitive data before caching
        const { password_hash, ...safeUser } = user;
        // Update user object to match safe version for consistency
        user = safeUser;
        try {
          await redis.setEx(`session:user:${userId}`, 900, JSON.stringify(safeUser));
        } catch (cacheErr) {
          logger.warn('Failed to set auth cache', { error: cacheErr.message });
        }
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };