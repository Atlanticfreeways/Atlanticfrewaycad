const axios = require('axios');
const logger = require('../utils/logger');

/**
 * PaystackService
 * Handles fiat payouts and transfer recipient management using Paystack API.
 */
class PaystackService {
    constructor() {
        this.secretKey = process.env.PAYSTACK_SECRET_KEY;
        this.baseUrl = 'https://api.paystack.co';

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Creates a transfer recipient on Paystack.
     * Required before initiating any transfer.
     */
    async createTransferRecipient(partner) {
        try {
            const response = await this.client.post('/transferrecipient', {
                type: "nuban", // Assuming bank transfer for MVP
                name: partner.name || `${partner.firstName} ${partner.lastName}`,
                account_number: partner.bank_account_number,
                bank_code: partner.bank_code,
                currency: partner.currency || "NGN"
            });

            return response.data.data.recipient_code;
        } catch (error) {
            logger.error('Paystack createRecipient error:', error.response?.data || error.message);
            throw new Error('Failed to create Paystack transfer recipient');
        }
    }

    /**
     * Initiates a transfer from Atlanticfrewaycard's Paystack balance to a recipient.
     */
    async initiateTransfer(recipientCode, amount, reason = "Payout") {
        try {
            // Paystack amount is in kobo (x100 for NGN)
            const response = await this.client.post('/transfer', {
                source: "balance",
                amount: Math.round(amount * 100),
                recipient: recipientCode,
                reason: reason
            });

            return {
                reference: response.data.data.reference,
                transferId: response.data.data.id,
                status: response.data.data.status
            };
        } catch (error) {
            logger.error('Paystack initiateTransfer error:', error.response?.data || error.message);
            throw new Error('Failed to initiate Paystack transfer');
        }
    }

    /**
     * Verifies transfer status.
     */
    async verifyTransfer(reference) {
        try {
            const response = await this.client.get(`/transfer/verify/${reference}`);
            return response.data.data;
        } catch (error) {
            logger.error('Paystack verifyTransfer error:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Simple signature validation for webhooks.
     */
    verifyWebhookSignature(signature, body) {
        const crypto = require('crypto');
        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
            .update(JSON.stringify(body))
            .digest('hex');
        return hash === signature;
    }
}

module.exports = new PaystackService();
