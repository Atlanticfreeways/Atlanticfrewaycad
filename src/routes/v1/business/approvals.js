const express = require('express');
const { authenticate } = require('../../../middleware/authenticate');
const asyncHandler = require('../../../utils/asyncHandler');
const ApprovalService = require('../../../services/ApprovalService');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);

const ruleSchema = Joi.object({
    name: Joi.string().required(),
    minAmount: Joi.number().min(0).required(),
    requiredRole: Joi.string().required() // e.g. 'admin', 'manager'
});

const requestSchema = Joi.object({
    requestType: Joi.string().valid('new_card', 'limit_increase', 'expense').required(),
    amount: Joi.number().min(0).required(),
    reason: Joi.string().optional()
});

/**
 * POST /api/v1/business/approvals/rules
 * Create a new approval rule (Admin only)
 */
router.post('/rules', asyncHandler(async (req, res) => {
    // TODO: proper role check
    const { error, value } = ruleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const service = new ApprovalService({ db: req.repositories.db, auditLogger: req.auditLogger });
    const rule = await service.createRule(req.user.company_id, value);

    res.status(201).json({ success: true, rule });
}));

/**
 * POST /api/v1/business/approvals/requests
 * Create a new approval request
 */
router.post('/requests', asyncHandler(async (req, res) => {
    const { error, value } = requestSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const service = new ApprovalService({ db: req.repositories.db, auditLogger: req.auditLogger });
    const request = await service.createRequest(req.user.id, req.user.company_id, value);

    res.status(201).json({ success: true, request });
}));

/**
 * GET /api/v1/business/approvals/requests
 * List history
 */
router.get('/requests', asyncHandler(async (req, res) => {
    const service = new ApprovalService({ db: req.repositories.db, auditLogger: req.auditLogger });
    const history = await service.getHistory(req.user.company_id, req.query);
    res.json({ success: true, history });
}));

/**
 * POST /api/v1/business/approvals/requests/:id/approve
 */
router.post('/requests/:id/approve', asyncHandler(async (req, res) => {
    const service = new ApprovalService({ db: req.repositories.db, auditLogger: req.auditLogger });
    await service.approveRequest(req.params.id, req.user.id, req.body.note);
    res.json({ success: true });
}));

/**
 * POST /api/v1/business/approvals/requests/:id/reject
 */
router.post('/requests/:id/reject', asyncHandler(async (req, res) => {
    const service = new ApprovalService({ db: req.repositories.db, auditLogger: req.auditLogger });
    await service.rejectRequest(req.params.id, req.user.id, req.body.note);
    res.json({ success: true });
}));

module.exports = router;
