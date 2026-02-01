const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /rates:
 *   get:
 *     summary: Get current exchange rates
 *     tags: [Rates]
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *           default: USD
 *         description: Base currency code
 *     responses:
 *       200:
 *         description: Exchange rates retrieved successfully
 */
router.get('/', async (req, res) => {
    try {
        const exchangeRateService = req.services.exchangeRate;
        if (!exchangeRateService) {
            return res.status(503).json({ error: 'Exchange rate service unavailable' });
        }

        // Default to getting all rates against USD (base)
        // Frontends can do the cross-calc or we can implement base switching here
        const base = req.query.base || 'USD';

        // For MVP, simply return the cached USD-based rates from memory
        // If we want re-basing, we can do it here or in service.
        // Service memory cache is a Map<Currency, RateToUSD>

        const rates = {};
        for (const [currency, rate] of exchangeRateService.memoryCache) {
            if (currency !== '_timestamp') {
                rates[currency] = rate;
            }
        }

        const timestamp = exchangeRateService.memoryCache.get('_timestamp');

        res.json({
            base: 'USD',
            timestamp,
            rates
        });
    } catch (error) {
        req.logger.error('Failed to get rates', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
