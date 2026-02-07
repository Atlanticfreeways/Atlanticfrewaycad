const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

const router = express.Router();

// POST /webhooks/kyc/onfido
// Handles callbacks from Onfido
router.post('/onfido', asyncHandler(async (req, res) => {
    // Note: In production, we must verify the X-SHA2-Signature from Onfido
    logger.info('Received Onfido Webhook', { payload: req.body });

    const kycService = req.services.kyc;

    // Process the webhook asynchronously to avoid timing out the provider
    // (In a real app, you might put this in a queue)
    kycService.handleWebhook('onfido', req.body).catch(err => {
        logger.error('Error handling KYC webhook', err);
    });

    res.status(200).send('OK');
}));

// POST /webhooks/kyc/stripe
// Handles callbacks from Stripe
router.post('/stripe', asyncHandler(async (req, res) => {
    // Note: In production, we must verify the stripe-signature
    logger.info('Received Stripe Webhook', { payload: req.body });

    const kycService = req.services.kyc;

    // Process the webhook asynchronously
    kycService.handleWebhook('stripe', req.body).catch(err => {
        logger.error('Error handling KYC webhook', err);
    });

    res.status(200).send('OK');
}));

module.exports = router;
