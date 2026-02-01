const logger = require('../utils/logger');

class CurrencyConversionLogger {
    constructor(db) {
        this.db = db;
    }

    /**
     * Logs a currency conversion event to the database.
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} params.fromCurrency
     * @param {string} params.toCurrency
     * @param {number} params.amountSource
     * @param {number} params.amountTarget
     * @param {number} params.rate
     * @param {number} params.spread
     */
    async logConversion({ userId, fromCurrency, toCurrency, amountSource, amountTarget, rate, spread }) {
        const query = `
            INSERT INTO currency_conversion_logs 
            (user_id, from_currency, to_currency, amount_source, amount_target, rate_applied, spread_fee)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;

        const values = [
            userId,
            fromCurrency,
            toCurrency,
            amountSource,
            amountTarget,
            rate,
            spread || 0
        ];

        try {
            const result = await this.db.query(query, values);
            logger.info('Logged currency conversion', { logId: result.rows[0].id, userId });
            return result.rows[0].id;
        } catch (error) {
            logger.error('Failed to log currency conversion', { userId, error: error.message });
            // We don't throw here to avoid failing the transaction/process just because logging failed,
            // but in strict compliance environments, you might WANT to throw.
            // For now, we just log the error.
        }
    }
}

module.exports = CurrencyConversionLogger;
