const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const verifyMarqetaSignature = require('../middleware/marqetaWebhook');
const JITFundingService = require('../services/JITFundingService');
const WebhookProcessorService = require('../services/marqeta/WebhookProcessorService');

const router = express.Router();

// Marqeta Webhooks (Unified Handler with ISO 8583 Logging)
router.use('/marqeta', require('./webhooks/marqeta'));

// Paystack Webhooks
router.use('/paystack', require('./webhooks/paystack'));

// NOWPayments Webhooks
router.use('/nowpayments', require('./webhooks/nowpayments'));

module.exports = router;
