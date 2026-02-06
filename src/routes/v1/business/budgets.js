const express = require('express');
const { authenticate } = require('../../../middleware/authenticate');
const asyncHandler = require('../../../utils/asyncHandler');
const BudgetService = require('../../../services/BudgetService');
const NotificationService = require('../../../services/NotificationService');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);

const budgetSchema = Joi.object({
    name: Joi.string().required(),
    amount: Joi.number().min(1).required(),
    scopeType: Joi.string().valid('company', 'team', 'category', 'project').required(),
    scopeValue: Joi.string().optional().allow(''),
    period: Joi.string().valid('monthly', 'quarterly', 'annual', 'one_time').default('monthly'),
    startDate: Joi.date().default(Date.now),
    notifyEmails: Joi.array().items(Joi.string().email()).optional(),
    slackWebhook: Joi.string().uri().optional()
});

/**
 * GET /api/v1/business/finance/budgets
 * List all budgets with progress
 */
router.get('/budgets', asyncHandler(async (req, res) => {
    const notificationService = new NotificationService(req.io);
    const service = new BudgetService({ db: req.repositories.db, notificationService });
    const budgets = await service.getBudgetsWithUsage(req.user.company_id);
    res.json({ success: true, budgets });
}));

/**
 * POST /api/v1/business/finance/budgets
 * Create new budget
 */
router.post('/budgets', asyncHandler(async (req, res) => {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const notificationService = new NotificationService(req.io);
    const service = new BudgetService({ db: req.repositories.db, notificationService });
    const budget = await service.createBudget(req.user.company_id, value);

    res.status(201).json({ success: true, budget });
}));

module.exports = router;
