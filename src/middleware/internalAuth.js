const logger = require('../utils/logger');

/**
 * Internal Service Authentication Middleware
 * Enforces use of INTERNAL_API_KEY for strict service-to-service calls.
 */
const requireInternalKey = (req, res, next) => {
    const key = req.headers['x-internal-key'];
    const validKey = process.env.INTERNAL_API_KEY;

    // Use a timing-safe check if possible, or strict equality at minimum
    if (!key || !validKey || key !== validKey) {
        logger.warn('Blocked unauthorized internal request', {
            ip: req.ip,
            path: req.originalUrl
        });
        return res.status(403).json({ error: 'Forbidden: Internal Access Only' });
    }

    next();
};

module.exports = requireInternalKey;
