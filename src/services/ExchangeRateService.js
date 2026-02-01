const axios = require('axios');
const logger = require('../utils/logger');

// Fallback rates if all APIs fail
const MOCK_RATES_FALLBACK = {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 148.5,
    'CAD': 1.35,
    'AUD': 1.52,
    'CHF': 0.88,
    'CNY': 7.19,
    'INR': 83.12,
    'BTC': 0.000023,
    'ETH': 0.00043,
    'SOL': 0.0105,
    'USDC': 1.00,
    'USDT': 1.00
};

/**
 * ExchangeRateService
 * 
 * Handles fetching and caching of global currency exchange rates.
 * Default Strategy: OpenExchangeRates (if Configured).
 * Fallback Strategy: Hybrid Free Tier (Frankfurter + CoinGecko) for PRODUCTION use without keys.
 */
const Spreads = require('../config/spreads');

/**
 * ExchangeRateService
 * 
 * Handles fetching and caching of global currency exchange rates.
 * Default Strategy: OpenExchangeRates (if Configured).
 * Fallback Strategy: Hybrid Free Tier (Frankfurter + CoinGecko) for PRODUCTION use without keys.
 */
class ExchangeRateService {
    constructor(redisClient, config = {}, io = null) {
        this.redis = redisClient;
        this.io = io; // Socket.io instance
        this.appId = config.openExchangeRatesAppId || process.env.OPEN_EXCHANGE_RATES_APP_ID;
        this.baseUrl = 'https://openexchangerates.org/api';
        this.baseCurrency = 'USD';

        // In-memory fallback cache (currency -> rate)
        this.memoryCache = new Map();
        this.cacheTTL = 3600; // 1 hour in seconds
        this.updateInterval = config.updateInterval || 60 * 60 * 1000; // 1 hour default

        this.isUpdating = false;

        // Coingecko IDs map
        this.cryptoIds = {
            'bitcoin': 'BTC',
            'ethereum': 'ETH',
            'solana': 'SOL',
            'usd-coin': 'USDC',
            'tether': 'USDT'
        };
    }

    /**
     * Initialize the service: load rates and start background updates
     */
    async initialize() {
        logger.info('Initializing ExchangeRateService...');

        if (!this.appId) {
            logger.info('App ID not found. Using Hybrid Free-Tier APIs (Frankfurter + CoinGecko).');
        } else {
            logger.info('App ID found. Using OpenExchangeRates.');
        }

        try {
            // Try to load from Redis first
            await this.loadFromCache();

            // Check if we need an immediate update
            const lastUpdated = this.memoryCache.get('_timestamp');
            const isStale = !lastUpdated || (Date.now() - lastUpdated > this.updateInterval);

            if (isStale) {
                // Perform initial fetch only if stale or empty
                await this.fetchRates();
            } else {
                logger.info('Rates are fresh from cache. Skipping initial API fetch.');
            }

            // Start background update loop
            this.startBackgroundUpdates();

            logger.info('ExchangeRateService initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize ExchangeRateService:', error);
        }
    }

    startBackgroundUpdates() {
        setInterval(async () => {
            await this.fetchRates();
        }, this.updateInterval);
    }

    /**
     * Smart Fetch: Decides which source to use
     */
    async fetchRates() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            if (this.appId) {
                await this.fetchOpenExchangeRates();
            } else {
                await this.fetchFreeTierRates();
            }
        } catch (error) {
            logger.error('Failed to fetch rates', error.message);
            // Last resort fallback if cache is empty
            if (this.memoryCache.size === 0) {
                logger.warn('Cache empty after failed fetch. Loading static fallback.');
                await this.updateCache(MOCK_RATES_FALLBACK, Date.now());
            }
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * Legacy/Premium Path: OpenExchangeRates
     */
    async fetchOpenExchangeRates() {
        logger.info('Fetching from OpenExchangeRates...');
        const response = await axios.get(`${this.baseUrl}/latest.json`, {
            params: { app_id: this.appId, base: this.baseCurrency },
            timeout: 5000
        });

        if (response.data && response.data.rates) {
            await this.updateCache(response.data.rates, response.data.timestamp);
            logger.info(`Updated rates for ${Object.keys(response.data.rates).length} currencies`);
        }
    }

    /**
     * Free Path: Frankfurter (Fiat) + CoinGecko (Crypto)
     */
    async fetchFreeTierRates() {
        logger.info('Fetching from Free Tier APIs...');
        const rates = { 'USD': 1.0 };
        let timestamp = Date.now();

        // 1. Fetch Fiat (Frankfurter)
        try {
            // Frankfurter allows rebasing to 'USD'
            const frankRes = await axios.get('https://api.frankfurter.app/latest?from=USD', { timeout: 3000 });
            if (frankRes.data && frankRes.data.rates) {
                Object.assign(rates, frankRes.data.rates);
            }
        } catch (err) {
            logger.warn('Frankfurter API failed:', err.message);
        }

        // 2. Fetch Crypto (CoinGecko)
        try {
            // IDs: bitcoin, ethereum, etc. vs_currencies: usd
            const ids = Object.keys(this.cryptoIds).join(',');
            const geckoRes = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
                params: { ids, vs_currencies: 'usd' },
                timeout: 3000
            });

            if (geckoRes.data) {
                // CoinGecko returns Price in USD (e.g. BTC: 42000)
                // We need Rate relative to USD (1 USD = X BTC) -> 1 / Price
                for (const [id, data] of Object.entries(geckoRes.data)) {
                    const priceInUSD = data.usd;
                    const symbol = this.cryptoIds[id];
                    if (priceInUSD && symbol) {
                        rates[symbol] = 1 / priceInUSD;
                    }
                }
            }
        } catch (err) {
            logger.warn('CoinGecko API failed:', err.message);
        }

        // Only update if we got meaningful data
        if (Object.keys(rates).length > 5) {
            await this.updateCache(rates, Math.floor(timestamp / 1000));
            logger.info(`Updated rates: ${Object.keys(rates).length} currencies (Hybrid Mode).`);
        } else {
            throw new Error('Using fallback due to insufficient rate data.');
        }
    }

    async updateCache(rates, timestamp) {
        this.memoryCache.clear();
        for (const [currency, rate] of Object.entries(rates)) {
            this.memoryCache.set(currency, Number(rate));
        }
        this.memoryCache.set('_timestamp', timestamp);

        if (this.io) {
            this.io.emit('metrics:rates_updated', rates);
        }

        if (this.redis) {
            try {
                const data = JSON.stringify(rates);
                await this.redis.set('exchange_rates:latest', data, { EX: this.cacheTTL * 24 });
                await this.redis.publish('events:exchange_rates_updated', JSON.stringify({ timestamp }));
            } catch (error) {
                logger.error('Failed to update Redis cache:', error.message);
            }
        }
    }

    async loadFromCache() {
        if (!this.redis) return;
        try {
            const cachedRates = await this.redis.get('exchange_rates:latest');
            if (cachedRates) {
                const rates = JSON.parse(cachedRates);
                for (const [currency, rate] of Object.entries(rates)) {
                    this.memoryCache.set(currency, Number(rate));
                }
                logger.info('Loaded rates from Redis.');
            }
        } catch (error) {
            logger.warn('Redis load failed:', error.message);
        }
    }

    getRate(fromCurrency, toCurrency = 'USD') {
        const fromRate = this.getRateToUSD(fromCurrency);
        const toRate = this.getRateToUSD(toCurrency);

        // Permissive fallback for getting started without errors
        if (!fromRate || !toRate) {
            if (MOCK_RATES_FALLBACK[fromCurrency] && MOCK_RATES_FALLBACK[toCurrency]) {
                const f = MOCK_RATES_FALLBACK[fromCurrency];
                const t = MOCK_RATES_FALLBACK[toCurrency];
                return t / f;
            }
            // Last resort
            return 1.0;
        }

        return toRate / fromRate;
    }

    getRateToUSD(currency) {
        if (this.memoryCache.has(currency)) return this.memoryCache.get(currency);
        if (currency === 'USD') return 1.0;
        return null;
    }

    /**
     * Converts an amount from one currency to another, optionally applying a spread.
     * @param {number} amount
     * @param {string} fromCurrency
     * @param {string} toCurrency
     * @param {boolean} applySpread - If true, adds a fee to the rate (simulating a "Buy" price).
     */
    convert(amount, fromCurrency, toCurrency, applySpread = false) {
        let rate = this.getRate(fromCurrency, toCurrency);
        let spreadForCalc = 0;

        if (applySpread) {
            // Determine spread based on target asset class
            // Rough heuristic: if target is in our crypto list, use crypto spread
            const isCrypto = Object.values(this.cryptoIds).includes(toCurrency) ||
                Object.values(this.cryptoIds).includes(fromCurrency);

            // Check specific pair overrides first
            if (Spreads.PAIRS[toCurrency]) {
                spreadForCalc = Spreads.PAIRS[toCurrency];
            } else if (Spreads.PAIRS[fromCurrency]) {
                spreadForCalc = Spreads.PAIRS[fromCurrency];
            } else {
                spreadForCalc = isCrypto ? Spreads.CRYPTO_SPREAD : Spreads.FIAT_SPREAD;
            }

            // Apply spread: User gets LESS when buying (or pays MORE)
            // Example: Rate is 1.0, user buys. We charge 1.02.
            // Simplified: "Client Rate" includes the fee.
            // If converting 100 USD to EUR (Rate 0.92), fee 0.5%
            // Effective Rate = 0.92 * (1 - 0.005) = 0.9154
            rate = rate * (1 - spreadForCalc);
        }

        return {
            amount: amount * rate,
            rate: rate,
            spreadApplied: spreadForCalc,
            timestamp: Date.now()
        };
    }
}

module.exports = ExchangeRateService;
