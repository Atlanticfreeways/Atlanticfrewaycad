const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * NowPaymentsService
 * Handles crypto payment generation and IPN (Instant Payment Notification) verification.
 */
class NowPaymentsService {
    constructor() {
        this.apiKey = process.env.NOWPAYMENTS_API_KEY;
        this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
        this.baseUrl = process.env.NOWPAYMENTS_BASE_URL || 'https://api.nowpayments.io/v1';

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'x-api-key': this.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Creates a payment (invoice) on NOWPayments.
     * @param {string} userId - ID of the user funding their wallet.
     * @param {number} amount - Amount in the source currency (e.g., USD).
     * @param {string} currencyFrom - Currency the user pays with (e.g., BTC, ETH, USDT).
     * @param {string} currencyTo - Target wallet currency (e.g., USD or BTC).
     */
    async createPayment(userId, amount, currencyFrom, currencyTo = 'usd') {
        try {
            const response = await this.client.post('/payment', {
                price_amount: amount,
                price_currency: currencyTo,
                pay_currency: currencyFrom,
                ipn_callback_url: `${process.env.API_BASE_URL}/webhooks/nowpayments`,
                order_id: `FUND_${userId}_${Date.now()}`,
                order_description: `Wallet funding for user ${userId}`
            });

            return {
                paymentId: response.data.payment_id,
                payAddress: response.data.pay_address,
                payAmount: response.data.pay_amount,
                payCurrency: response.data.pay_currency,
                status: response.data.payment_status
            };
        } catch (error) {
            logger.error('NOWPayments createPayment error:', error.response?.data || error.message);
            throw new Error('Failed to create NOWPayments crypto payment');
        }
    }

    /**
     * Verifies the authenticity of a NOWPayments IPN.
     * NOWPayments sends a signature in the 'x-nowpayments-sig' header.
     */
    verifyIpnSignature(signature, body) {
        if (!signature || !this.ipnSecret) return false;

        // Sort keys and stringify to match NOWPayments' signing process if needed
        // For NOWPayments, they usually sign the raw JSON body
        const hmac = crypto.createHmac('sha512', this.ipnSecret);

        // Ensure keys are in alphabetical order as per NOWPayments documentation
        const sortedBody = Object.keys(body).sort().reduce((obj, key) => {
            obj[key] = body[key];
            return obj;
        }, {});

        const bodyString = JSON.stringify(sortedBody);
        const hash = hmac.update(bodyString).digest('hex');

        return hash === signature;
    }

    /**
     * Get payment status manually if needed.
     */
    async getPaymentStatus(paymentId) {
        try {
            const response = await this.client.get(`/payment/${paymentId}`);
            return response.data;
        } catch (error) {
            logger.error('NOWPayments getPaymentStatus error:', error.response?.data || error.message);
            return null;
        }
    }
}

module.exports = new NowPaymentsService();
