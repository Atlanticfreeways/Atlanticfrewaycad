const logger = require('../utils/logger');
const db = require('../database/connection');

/**
 * Idempotency Middleware
 * Ensures the specific request (identified by Idempotency-Key) is executed only once.
 * 
 * Flow:
 * 1. Check if 'Idempotency-Key' header exists.
 * 2. If no key, proceed normally (or reject if strict mode).
 * 3. If key exists, check Redis for cached response.
 * 4. If cached, return cached response.
 * 5. If not cached, proceed, but intercept response.send() to cache the result.
 */
const idempotencyMiddleware = async (req, res, next) => {
    const key = req.headers['idempotency-key'];

    // Only apply to state-changing methods
    if (!key || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
    }

    const redis = db.getRedis();
    if (!redis || !redis.isOpen) {
        logger.warn('Redis not available for Idempotency check. Proceeding without protection.');
        return next();
    }

    const redisKey = `idempotency:${key}`;

    try {
        // 1. Check if key exists
        const cachedData = await redis.get(redisKey);

        if (cachedData) {
            logger.info(`Idempotency Hit: Returning cached response for key ${key}`);
            const { status, body, headers } = JSON.parse(cachedData);

            // Replay headers
            // Note: We might filter some headers out if needed
            if (headers) {
                Object.keys(headers).forEach(headerKey => {
                    res.setHeader(headerKey, headers[headerKey]);
                });
            }

            // Add custom header to indicate replay
            res.setHeader('X-Idempotency-Replay', 'true');
            return res.status(status).send(body); // Assuming body is stored as object/string
        }

        // 2. Not found. Proceed but hijack response to cache it.
        // We need to lock the key to prevent concurrent race conditions?
        // Simple SETNX with "PROCESSING" status could work, but for now let's optimistic lock.
        // Actually, if two requests come EXACTLY same time, both might pass.
        // Better: SETNX key "PROCESSING" with short TTL.

        const setProcessing = await redis.set(redisKey, JSON.stringify({ status: 202, body: { status: 'processing' } }), {
            NX: true, // Only set if not exists
            EX: 60 // 60 seconds lock for processing
        });

        if (!setProcessing) {
            // If we couldn't set it, it means it exists (either processing or done).
            // We should fetch it again or wait?
            // For simplicity, failing fast with 409 Conflict if concurrent is often standard,
            // or 429 Too Many Requests.
            // OR, if it returns "processing", we tell client to retry?
            // Let's assume hitting it concurrently is rare for legitimate retries (usually sequential).
            // But if it happens, we return 409 Conflict "Request in progress".
            logger.warn(`Idempotency Conflict: Key ${key} is currently being processed.`);
            return res.status(409).json({ error: 'Request with this Idempotency-Key is currently being processed.' });
        }

        // Hook into response methods to capture output
        const originalSend = res.send;
        const originalJson = res.json;

        res.send = function (body) {
            // Restore original to actually send
            res.send = originalSend;

            // Cache the response asynchronously
            // We store status, body, headers
            // Ensure body is string or JSON
            let storedBody = body;
            // If object, strict stringify.

            const responseData = {
                status: res.statusCode,
                body: storedBody,
                headers: res.getHeaders ? res.getHeaders() : {}
            };

            // Save to Redis (TTL 24 hours)
            redis.set(redisKey, JSON.stringify(responseData), {
                EX: 60 * 60 * 24
            }).catch(err => logger.error('Failed to cache idempotency response', err));

            return res.send(body);
        };

        res.json = function (body) {
            res.json = originalJson;

            const responseData = {
                status: res.statusCode,
                body: body,
                headers: res.getHeaders ? res.getHeaders() : {}
            };

            redis.set(redisKey, JSON.stringify(responseData), {
                EX: 60 * 60 * 24
            }).catch(err => logger.error('Failed to cache idempotency response', err));

            return res.json(body);
        };

        next();

    } catch (err) {
        logger.error('Idempotency Middleware Error', err);
        // Fail open or closed?
        // Closed: next(err)
        // Open: next()
        next(err);
    }
};

module.exports = idempotencyMiddleware;
