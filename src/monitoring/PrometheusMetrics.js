const client = require('prom-client');
const logger = require('../utils/logger');

class PrometheusMetrics {
    constructor() {
        this.register = new client.Registry();
        this.initialized = false;

        // Define metrics
        this.jitDuration = new client.Histogram({
            name: 'jit_funding_duration_ms',
            help: 'JIT funding authorization duration in milliseconds',
            buckets: [10, 25, 50, 100, 250, 500, 1000],
            registers: [this.register]
        });

        this.cacheHitRate = new client.Gauge({
            name: 'cache_hit_rate',
            help: 'Cache hit rate percentage',
            registers: [this.register]
        });

        this.transactionCounter = new client.Counter({
            name: 'transaction_total',
            help: 'Total number of transactions processed',
            labelNames: ['status', 'type'],
            registers: [this.register]
        });
    }

    init() {
        if (this.initialized) return;

        // Collect default metrics
        client.collectDefaultMetrics({ register: this.register });
        this.initialized = true;
        logger.info('Prometheus metrics initialized');
    }

    async getMetrics() {
        return await this.register.metrics();
    }

    recordJITDuration(duration) {
        this.jitDuration.observe(duration);
    }

    updateCacheHitRate(rate) {
        this.cacheHitRate.set(rate);
    }

    incrementTransaction(status, type = 'unknown') {
        this.transactionCounter.inc({ status, type });
    }

    contentType() {
        return this.register.contentType;
    }
}

module.exports = new PrometheusMetrics();
