const express = require('express');
const crypto = require('crypto');
const JITFundingService = require('../services/marqeta/JITFundingService');
const WebhookProcessorService = require('../services/marqeta/WebhookProcessorService');

const router = express.Router();

const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-marqeta-signature'];
  const secret = process.env.MARQETA_WEBHOOK_SECRET;

  if (!secret) {
    return next();
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

router.post('/marqeta/jit', async (req, res, next) => {
  try {
    const jitService = new JITFundingService(req.repositories);
    const response = await jitService.processAuthorization(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/marqeta/transaction', verifyWebhookSignature, async (req, res, next) => {
  try {
    const webhookProcessor = new WebhookProcessorService(req.repositories);
    await webhookProcessor.processTransaction(req.body);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/marqeta/cardstatechange', verifyWebhookSignature, async (req, res, next) => {
  try {
    const webhookProcessor = new WebhookProcessorService(req.repositories);
    await webhookProcessor.processCardStateChange(req.body);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
