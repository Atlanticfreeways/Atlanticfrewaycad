const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const verifyMarqetaSignature = require('../middleware/marqetaWebhook');
const JITFundingService = require('../services/JITFundingService');
const WebhookProcessorService = require('../services/marqeta/WebhookProcessorService');

const router = express.Router();

router.post('/marqeta/jit', verifyMarqetaSignature, asyncHandler(async (req, res) => {
  const jitService = new JITFundingService(req.repositories);
  // Using the centralized webhook processor method
  const response = await jitService.processTransactionWebhook(req.body);
  res.json(response);
}));

router.post('/marqeta/transaction', verifyMarqetaSignature, asyncHandler(async (req, res) => {
  const webhookProcessor = new WebhookProcessorService(req.repositories);
  await webhookProcessor.processTransaction(req.body);
  res.json({ success: true });
}));

router.post('/marqeta/cardstatechange', verifyMarqetaSignature, asyncHandler(async (req, res) => {
  const webhookProcessor = new WebhookProcessorService(req.repositories);
  await webhookProcessor.processCardStateChange(req.body);
  res.json({ success: true });
}));

// Paystack Webhooks
router.use('/paystack', require('./webhooks/paystack'));

// NOWPayments Webhooks
router.use('/nowpayments', require('./webhooks/nowpayments'));

module.exports = router;
