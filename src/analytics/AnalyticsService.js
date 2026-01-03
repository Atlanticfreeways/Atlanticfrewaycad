const logger = require('../utils/logger');
const dbConnection = require('../database/connection');
const prometheus = require('../monitoring/PrometheusMetrics');

class AnalyticsService {
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

    async trackTransaction(transaction) {
        try {
            // Real-time metrics
            prometheus.incrementTransaction(transaction.status, transaction.type);

            // Aggregation for dashboard (Redis)
            const client = await this.getRedis();
            if (client) {
                const today = new Date().toISOString().split('T')[0];

                // Increment daily total
                await client.incrBy(`analytics:daily_volume:${today}`, Math.floor(transaction.amount * 100)); // Store in cents
                await client.incr(`analytics:daily_count:${today}`);

                // Add to recent transactions list (capped at 100)
                await client.lPush('analytics:recent_transactions', JSON.stringify({
                    id: transaction.id,
                    amount: transaction.amount,
                    merchant: transaction.merchantName,
                    time: new Date().toISOString()
                }));
                await client.lTrim('analytics:recent_transactions', 0, 99);
            }

        } catch (error) {
            logger.error('Failed to track analytics:', error);
        }
    }

    async getDashboardStats() {
        try {
            const client = await this.getRedis();
            const today = new Date().toISOString().split('T')[0];

            const [volume, count, recent] = await Promise.all([
                client.get(`analytics:daily_volume:${today}`),
                client.get(`analytics:daily_count:${today}`),
                client.lRange('analytics:recent_transactions', 0, 10)
            ]);

            return {
                dailyVolume: (parseInt(volume || 0) / 100),
                dailyCount: parseInt(count || 0),
                recentTransactions: recent.map(r => JSON.parse(r))
            };
        } catch (error) {
            logger.error('Failed to get dashboard stats:', error);
            return null;
        }
    }
}

module.exports = new AnalyticsService();
