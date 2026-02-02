const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const verifyMarqetaSignature = require('../../middleware/marqetaWebhook');

router.post('/marqeta', verifyMarqetaSignature, async (req, res) => {
    try {
        const { event_type, token } = req.body;
        const payload = req.body;

        // 1. Enterprise Log: Save raw payload
        // We use direct query because repositories might not be fully available in webhook context yet
        // or we want to ensure write happens even if processing logic fails.
        const pool = req.repositories ? req.repositories.user.pool : null; // Hacky access to pool

        if (pool) {
            await pool.query(
                `INSERT INTO marqeta_event_logs (event_type, event_token, payload, headers) VALUES ($1, $2, $3, $4)`,
                [
                    req.body.type || 'unknown_event',
                    req.body.token || 'no_token',
                    JSON.stringify(payload),
                    JSON.stringify({ signature: req.marqetaEventLog?.signature })
                ]
            );
            logger.info('Raw Marqeta event logged to DB');
        } else {
            logger.warn('Could not log Marqeta event: Database pool unavailable');
        }

        // 2. Process Business Logic (JIT, Transaction, etc.)
        // Delegate to JIT Service if it's an authorization
        if (req.body.type === 'transaction.authorization' || req.body.type === 'jit.funding.paymentcontrol') {
            if (req.jitFundingService) {
                // Correct method name is processTransactionWebhook
                const response = await req.jitFundingService.processTransactionWebhook({
                    type: req.body.type,
                    transaction: req.body.payload?.transaction || req.body.transaction || req.body
                });
                return res.json(response);
            }
        }

        res.status(200).json({ processed: true });

    } catch (error) {
        logger.error('Error processing Marqeta webhook', { error: error.message });
        res.status(500).json({ error: 'Processing failed' });
    }
});

module.exports = router;
