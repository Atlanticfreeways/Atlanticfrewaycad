const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const dbConnection = require('../database/connection');

class AuthMiddleware {
    constructor() {
        this.redis = null;
    }

    async getRedis() {
        if (!this.redis) {
            await dbConnection.initRedis();
            this.redis = dbConnection.getRedis();
        }
        return this.redis;
    }

    async verifyToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // Check session in Redis (if using stateful sessions / logout blacklist)
            const redisClient = await this.getRedis();
            if (redisClient) {
                const isBlacklisted = await redisClient.get(`blacklist:${token}`);
                if (isBlacklisted) {
                    return res.status(401).json({ error: 'Token revoked' });
                }
            }

            req.user = decoded;
            next();
        } catch (error) {
            logger.error('Token verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    checkPermissions(requiredRole) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (req.user.role !== requiredRole && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            next();
        };
    }

    async verifyApiKey(req, res, next) {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        if (apiKey !== process.env.API_KEY) {
            return res.status(403).json({ error: 'Invalid API key' });
        }
        next();
    }
}

module.exports = new AuthMiddleware();
