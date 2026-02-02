const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

/**
 * Idempotency Middleware
 * Ensures that the same operation is not executed multiple times.
 * Caches the response of the first successful request with a given Idempotency-Key.
 */
const idempotency = async (req, res, next) => {
    const key = req.headers['idempotency-key'];

    // Skip for GET requests or if no key provided (though strictly, write ops should require it)
    if (!key || req.method === 'GET') {
        return next();
    }

    const redis = dbConnection.getRedis();
    if (!redis || !redis.isOpen) {
        logger.warn('Redis unavailable, skipping idempotency check');
        return next();
    }

    const redisKey = `idempotency:${key}`;

    try {
        // Check if key exists
        const cachedResponse = await redis.get(redisKey);
        if (cachedResponse) {
            logger.info(`Idempotency hit for key: ${key}`);
            const { status, body, headers } = JSON.parse(cachedResponse);

            // Replay headers
            if (headers) {
                Object.keys(headers).forEach(headerKey => {
                    res.setHeader(headerKey, headers[headerKey]);
                });
            }

            return res.status(status).json(body);
        }

        // Hook into res.msg/res.json to cache response before sending
        // We proxy res.json to capture the output
        const originalJson = res.json;
        res.json = function (body) {
            // Restore original to prevent infinite loop if called internally
            res.json = originalJson;

            // Only cache success-like codes (2xx) or specific errors? 
            // Usually strict idempotency catches everything, but let's cache everything that finished.
            if (res.statusCode < 500) {
                const responseData = {
                    status: res.statusCode,
                    body: body,
                    headers: res.getHeaders() // Capture content-type etc
                };

                // Save to Redis (TTL 24 hours)
                redis.setEx(redisKey, 86400, JSON.stringify(responseData))
                    .catch(err => logger.error('Failed to cache idempotency response', err));
            }

            return originalJson.call(this, body);
        };

        next();
    } catch (error) {
        logger.error('Idempotency middleware error', error);
        next();
    }
};

module.exports = idempotency;
