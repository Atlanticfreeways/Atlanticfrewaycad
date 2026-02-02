const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Marqeta Webhook Signature Verification
 * Verifies webhook authenticity using HMAC signature
 */

const verifyMarqetaSignature = (req, res, next) => {
  const signature = req.headers['x-marqeta-signature'];
  const webhookSecret = process.env.MARQETA_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('MARQETA_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook configuration error' });
  }

  if (!signature) {
    logger.warn('Webhook received without signature', { ip: req.ip });
    return res.status(401).json({ error: 'Missing signature' });
  }

  try {
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Invalid webhook signature', { ip: req.ip });
      return res.status(401).json({ error: 'Invalid signature' });
    }
    // Enterprise Observation: Log raw payload to DB
    try {
      if (req.repositories && req.repositories.user) { // Check if repositories are available (unlikely in middleware but good practice)
        // In most middleware chains, repo injection happens globally. 
        // If not, we might need a direct db connection or wait until controller.
        // However, logging *before* controller logic is safer for debugging "crashes".

        // Assuming we can access the pool from global or req.
        // For now, simpler: we'll attach the "Verified" status and let the Controller do the DB insert 
        // to avoid creating a new DB connection instance inside this middleware.
        req.marqetaEventLog = {
          verified: true,
          signature: signature
        };
      }
    } catch (logErr) {
      // Don't fail the webhook if logging fails
      console.error('Failed to prepare log data', logErr);
    }

    logger.info('Webhook signature verified', { type: req.body.type });
    next();
  } catch (error) {
    logger.error('Webhook verification error', { error: error.message });
    return res.status(500).json({ error: 'Verification failed' });
  }
};

module.exports = verifyMarqetaSignature;
