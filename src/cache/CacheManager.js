const logger = require('../utils/logger');
const dbConnection = require('../database/connection');

class CacheManager {
    constructor() {
        this.redis = null;
        this.strategies = {
            userSessions: { ttl: 3600 }, // 1 hour
            cardData: { ttl: 900 },      // 15 minutes
            transactions: { ttl: 300 }   // 5 minutes
        };
    }

    async getRedis() {
        if (!this.redis) {
            await dbConnection.initRedis();
            this.redis = dbConnection.getRedis();
        }
        return this.redis;
    }

    async set(key, value, strategyName = 'default') {
        try {
            const client = await this.getRedis();
            if (!client || !client.isOpen) return false;

            const ttl = this.strategies[strategyName]?.ttl || 300;
            await client.setEx(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error('Cache set error:', error.message);
            return false;
        }
    }

    async get(key) {
        try {
            const client = await this.getRedis();
            if (!client || !client.isOpen) return null;

            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Cache get error:', error.message);
            return null;
        }
    }

    async del(key) {
        try {
            const client = await this.getRedis();
            if (!client || !client.isOpen) return false;

            await client.del(key);
            return true;
        } catch (error) {
            logger.error('Cache del error:', error.message);
            return false;
        }
    }

    async flushPattern(pattern) {
        try {
            const client = await this.getRedis();
            if (!client || !client.isOpen) return false;

            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
            return true;
        } catch (error) {
            logger.error('Cache flushPattern error:', error.message);
            return false;
        }
    }
}

module.exports = new CacheManager();
