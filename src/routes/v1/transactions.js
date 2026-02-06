const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { csrfProtection } = require('../../middleware/csrfProtection');
const asyncHandler = require('../../utils/asyncHandler');
const TransactionHistoryService = require('../../services/TransactionHistoryService');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

const searchSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(50),
    startDate: Joi.date(),
    endDate: Joi.date(),
    minAmount: Joi.number(),
    maxAmount: Joi.number(),
    merchant: Joi.string(),
    cardId: Joi.string().uuid(),
    status: Joi.string().valid('pending', 'approved', 'declined', 'failed')
});

/**
 * GET /api/v1/transactions
 * Search and list transactions
 */
router.get('/', asyncHandler(async (req, res) => {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const service = new TransactionHistoryService(req.repositories);
    const result = await service.getHistory(req.user.id, value);

    res.json({ success: true, ...result });
}));

/**
 * GET /api/v1/transactions/export
 * Export filtered transactions to CSV
 */
router.get('/export', asyncHandler(async (req, res) => {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const service = new TransactionHistoryService(req.repositories);
    const csv = await service.exportCSV(req.user.id, value);

    res.header('Content-Type', 'text/csv');
    res.attachment(`transactions-${new Date().toISOString()}.csv`);
    return res.send(csv);
}));

module.exports = router;
