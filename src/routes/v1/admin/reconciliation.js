const express = require('express');
const router = express.Router();
const ReconciliationService = require('../../../services/ReconciliationService');
const authMiddleware = require('../../../middleware/auth');
const { requireRole, ROLES } = require('../../../middleware/rbac');

const Joi = require('joi');
const validate = require('../../../middleware/validate');

// Schema for Reconciliation
const reconcileSchema = Joi.object({
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
        .messages({ 'string.pattern.base': 'Date must be YYYY-MM-DD' }),
    records: Joi.array().items(
        Joi.object({
            token: Joi.string().required(),
            amount: Joi.number().required(),
            currency: Joi.string().length(3).uppercase().required()
        })
    ).min(1).required()
});

// POST /api/v1/admin/reconcile/run
// Trigger an ad-hoc reconciliation for a specific date
router.post('/run', authMiddleware, requireRole([ROLES.ADMIN, ROLES.FINANCE_MANAGER]), validate(reconcileSchema), async (req, res) => {
    try {
        const { date, records } = req.body;
        // Validation handled by middleware

        const reconciliationService = new ReconciliationService(req.repositories);
        const result = await reconciliationService.reconcileDailySettlement(date, records);

        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/v1/admin/reconcile/history
// Get list of past reconciliations
router.get('/history', authMiddleware, requireRole([ROLES.ADMIN, ROLES.FINANCE_MANAGER]), async (req, res) => {
    try {
        const result = await req.repositories.user.pool.query(
            `SELECT * FROM settlements ORDER BY settlement_date DESC LIMIT 30`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
