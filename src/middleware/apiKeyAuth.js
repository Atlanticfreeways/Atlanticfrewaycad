const bcrypt = require('bcryptjs');
const pool = require('../config/database');

/**
 * Middleware to authenticate API requests using API keys
 * Checks for X-API-Key header and validates against database
 */
async function authenticateApiKey(req, res, next) {
    try {
        // Check for API key in header
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            // No API key provided - proceed to next middleware (JWT auth)
            return next();
        }

        // Validate key format
        const isSandboxKey = apiKey.startsWith('sbk_');
        const isLiveKey = apiKey.startsWith('afc_');

        if (!isSandboxKey && !isLiveKey) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key format'
            });
        }

        // Find all API keys from database
        const keysResult = await pool.query(`
            SELECT 
                k.id,
                k.user_id,
                k.key_hash,
                k.name,
                k.expires_at,
                k.revoked_at,
                k.environment,
                u.email,
                u.full_name,
                u.role,
                u.status as user_status
            FROM user_api_keys k
            JOIN users u ON k.user_id = u.id
            WHERE k.revoked_at IS NULL
            AND (k.expires_at IS NULL OR k.expires_at > NOW())
        `);

        if (keysResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key'
            });
        }

        // Check each key hash to find a match
        let matchedKey = null;

        for (const key of keysResult.rows) {
            const isMatch = await bcrypt.compare(apiKey, key.key_hash);
            if (isMatch) {
                matchedKey = key;
                break;
            }
        }

        if (!matchedKey) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key'
            });
        }

        // Check if user account is active
        if (matchedKey.user_status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'User account is not active'
            });
        }

        // Update last_used_at timestamp (async, don't wait)
        pool.query(`
            UPDATE user_api_keys 
            SET last_used_at = NOW() 
            WHERE id = $1
        `, [matchedKey.id]).catch(err => {
            console.error('Failed to update API key last_used_at:', err);
        });

        // Create audit log entry (async, don't wait)
        pool.query(`
            INSERT INTO audit_logs (
                user_id, action, resource, ip_address, user_agent, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            matchedKey.user_id,
            'api_key_auth',
            'api',
            req.ip || req.connection.remoteAddress,
            req.headers['user-agent'],
            JSON.stringify({
                key_id: matchedKey.id,
                key_name: matchedKey.name,
                endpoint: req.path,
                method: req.method
            })
        ]).catch(err => {
            console.error('Failed to create audit log:', err);
        });

        // Populate req.user with user information (same structure as JWT auth)
        req.user = {
            id: matchedKey.user_id,
            email: matchedKey.email,
            full_name: matchedKey.full_name,
            role: matchedKey.role,
            authMethod: 'api_key',
            apiKeyId: matchedKey.id,
            apiKeyName: matchedKey.name,
            environment: matchedKey.environment,
            isSandbox: matchedKey.environment === 'sandbox'
        };

        // Continue to route handler
        next();

    } catch (error) {
        console.error('API key authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication error'
        });
    }
}

/**
 * Rate limiting for API key requests
 * Limits to 10 requests per second per key
 */
const apiKeyRateLimits = new Map();

function apiKeyRateLimit(req, res, next) {
    // Only apply to API key authenticated requests
    if (!req.user || req.user.authMethod !== 'api_key') {
        return next();
    }

    const keyId = req.user.apiKeyId;
    const now = Date.now();
    const windowMs = 1000; // 1 second
    const maxRequests = 10;

    // Get or create rate limit data for this key
    let rateLimitData = apiKeyRateLimits.get(keyId);

    if (!rateLimitData) {
        rateLimitData = [];
        apiKeyRateLimits.set(keyId, rateLimitData);
    }

    // Remove requests older than the window
    const recentRequests = rateLimitData.filter(timestamp => now - timestamp < windowMs);
    apiKeyRateLimits.set(keyId, recentRequests);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: `Maximum ${maxRequests} requests per second per API key`
        });
    }

    // Add current request
    recentRequests.push(now);
    apiKeyRateLimits.set(keyId, recentRequests);

    next();
}

// Cleanup old rate limit data every minute
setInterval(() => {
    const now = Date.now();
    const expireTime = 60000; // 1 minute

    for (const [keyId, timestamps] of apiKeyRateLimits.entries()) {
        const recent = timestamps.filter(t => now - t < expireTime);
        if (recent.length === 0) {
            apiKeyRateLimits.delete(keyId);
        } else {
            apiKeyRateLimits.set(keyId, recent);
        }
    }
}, 60000);

module.exports = {
    authenticateApiKey,
    apiKeyRateLimit
};
