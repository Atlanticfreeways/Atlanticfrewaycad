const crypto = require('crypto');
const logger = require('../utils/logger');
const MessageQueueManager = require('../queue/MessageQueueManager');

class MarqetaWebhooks {
    constructor(mqManager) {
        this.mqManager = mqManager || new MessageQueueManager();
        this.initialized = false;
    }

    async init() {
        if (!this.initialized) {
            await this.mqManager.connect();
            this.initialized = true;
        }
    }

    validateSignature(payload, signature, secret) {
        if (!signature || !secret) return false;

        // Marqeta specific signature validation logic
        const hmac = crypto.createHmac('sha1', secret);
        const digest = hmac.update(JSON.stringify(payload)).digest('hex');
        return signature === digest;
    }

    async processWebhook(req, res) {
        try {
            await this.init();

            const event = req.body;
            const signature = req.headers['x-marqeta-signature'];

            // Basic security check (skip in dev if needed)
            if (process.env.NODE_ENV === 'production') {
                if (!this.validateSignature(event, signature, process.env.MARQETA_WEBHOOK_SECRET)) {
                    logger.warn('Invalid webhook signature');
                    return res.status(403).json({ error: 'Invalid signature' });
                }
            }

            logger.info(`Received Marqeta webhook: ${event.type}`);

            // Publish to message queue for async processing
            // This decouples ingestion from processing
            await this.mqManager.publishMessage('transactions', 'transaction.webhook', {
                event: event,
                receivedAt: new Date().toISOString()
            });

            // Return immediately to Marqeta
            // "Webhooks must return a 200 OK response within a short timeout"
            return res.status(200).json({ status: 'received' });
        } catch (error) {
            logger.error('Webhook processing error:', error);
            // Still return 200 to prevent Marqeta from retrying indefinitely if it's our logic error
            return res.status(200).json({ received: false });
        }
    }
}

module.exports = new MarqetaWebhooks();
