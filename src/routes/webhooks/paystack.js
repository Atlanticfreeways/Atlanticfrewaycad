const express = require('express');
const router = express.Router();
const paystackService = require('../../services/PaystackService');
const payoutService = require('../../services/PayoutService');
const logger = require('../../utils/logger');

/**
 * Paystack Webhook Handler
 * POST /webhooks/paystack
 */
router.post('/paystack', express.json(), async (req, res) => {
    const signature = req.headers['x-paystack-signature'];

    // 1. Verify Signature
    if (!paystackService.verifyWebhookSignature(signature, req.body)) {
        logger.warn('Invalid Paystack webhook signature');
        return res.status(401).send('Forbidden');
    }

    const event = req.body;
    logger.info(`Received Paystack webhook: ${event.event}`, { reference: event.data?.reference });

    try {
        switch (event.event) {
            case 'transfer.success':
                await handleTransferSuccess(event.data);
                break;
            case 'transfer.failed':
                await handleTransferFailed(event.data);
                break;
            case 'transfer.reversed':
                await handleTransferFailed(event.data, 'REVERSED');
                break;
        }

        res.status(200).send('Webhook processed');
    } catch (error) {
        logger.error('Error processing Paystack webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function handleTransferSuccess(data) {
    const reference = data.reference;
    // Find the payout by reference in our service
    const payout = Array.from(payoutService.payouts.values() || [])
        .find(p => p.paystack_reference === reference);

    if (payout) {
        payout.status = 'completed';
        payout.completed_at = new Date().toISOString();
        payoutService.payouts.set(payout.id, payout);
        logger.info(`Payout ${payout.id} marked as COMPLETED via webhook`);
    }
}

async function handleTransferFailed(data, reason = 'FAILED') {
    const reference = data.reference;
    const payout = Array.from(payoutService.payouts.values() || [])
        .find(p => p.paystack_reference === reference);

    if (payout) {
        payout.status = 'failed';
        payout.error_reason = reason;
        payoutService.payouts.set(payout.id, payout);
        logger.warn(`Payout ${payout.id} marked as FAILED via webhook: ${reason}`);
    }
}

module.exports = router;
