const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

// Cache for initialized limiters
const limiters = {};

/**
 * Creates or retrieves a rate limiter.
 * Tries to use Redis if available, otherwise falls back to Memory.
 */
const getLimiter = (key, windowMs, max) => {
  // If specifically cached (and we are confident in the store), return it
  if (limiters[key]) return limiters[key];

  const redisClient = dbConnection.getRedis();
  let store;

  if (redisClient && redisClient.isOpen) {
    store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
    // Only cache if we successfully got Redis, so we don't get stuck with Memory 
    // if this was called prematurely.
    // Actually, express-rate-limit instances are stateful. Re-creating them per request 
    // resets the counter for MemoryStore! We MUST cache it.
    //
    // Compromise: We cache it. If the server starts and Redis isn't ready when this is called,
    // it uses Memory. If we want Redis, we must ensure this is called after Redis init.
    // Moving middleware in server.js handles this.
  }

  const limiter = rateLimit({
    windowMs,
    max,
    store, // undefined = MemoryStore
    message: { error: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  limiters[key] = limiter;
  return limiter;
};

// Proxy middlewares
// Login/Register brute force protection: 5 requests per minute
const authLimiter = (req, res, next) => getLimiter('auth', 60 * 1000, 5)(req, res, next);

// General API limit: 100 requests per 15 minutes (Standard)
const apiLimiter = (req, res, next) => getLimiter('api', 15 * 60 * 1000, 100)(req, res, next);

// Strict limit for sensitive actions: 10 requests per minute
const strictLimiter = (req, res, next) => getLimiter('strict', 60 * 1000, 10)(req, res, next);

// Tiered limiter (dynamic) - simpler to recreate or just use memory/redis mixed logic
// For simplicity, we'll wrap the standard one but with Redis backing if possible.
const tieredLimiter = (req, res, next) => {
  // We can't easily cache a dynamic limiter with different logic inside getLimiter factory
  // So we'll define it here using the same store logic
  if (!limiters['tiered']) {
    const redisClient = dbConnection.getRedis();
    let store;
    if (redisClient && redisClient.isOpen) {
      store = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      });
    }

    limiters['tiered'] = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: (req) => {
        if (!req.user) return 100;
        switch (req.user.accountType) {
          case 'business': return 5000;
          case 'premium': return 2000;
          default: return 500;
        }
      },
      store,
      message: { error: 'Rate limit exceeded for your tier', code: 'TIER_LIMIT_EXCEEDED' },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.user ? req.user.id : req.ip
    });
  }
  return limiters['tiered'](req, res, next);
};

const createRateLimiter = (windowMs, max) => {
  // Legacy support or manual usage
  return rateLimit({ windowMs, max });
};

module.exports = { createRateLimiter, authLimiter, apiLimiter, strictLimiter, tieredLimiter };
