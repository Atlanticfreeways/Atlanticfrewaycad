const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authLimiter = createRateLimiter(15 * 60 * 1000, 20); // More strict for auth endpoints
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100);
const strictLimiter = createRateLimiter(60 * 1000, 10);

/**
 * Dynamic rate limiter based on user account tier
 * Requires authentication middleware to run BEFORE this
 */
const tieredLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req, res) => {
    if (!req.user) return 100; // Unauthenticated fallback

    switch (req.user.accountType) { // or subscription_tier
      case 'business':
        return 5000;
      case 'premium':
        return 2000;
      default: // personal/basic
        return 500;
    }
  },
  message: { error: 'Rate limit exceeded for your tier', code: 'TIER_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user ? req.user.id : req.ip
});

module.exports = { createRateLimiter, authLimiter, apiLimiter, strictLimiter, tieredLimiter };
