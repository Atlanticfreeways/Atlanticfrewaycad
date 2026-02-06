const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { csrfProtection } = require('../../middleware/csrfProtection');
const asyncHandler = require('../../utils/asyncHandler');
const DisputeService = require('../../services/DisputeService');
const Joi = require('joi');
const { strictLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

const createSchema = Joi.object({
    transactionId: Joi.number().required(),
    reason: Joi.string().valid('fraud', 'duplicate', 'subscription_cancelled', 'product_not_received', 'other').required(),
    description: Joi.string().min(10).max(1000).required()
});

/**
 * POST /api/v1/disputes
 * File a new dispute
 */
router.post('/', strictLimiter, asyncHandler(async (req, res) => {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const service = new DisputeService(req.repositories, req.services);
    const dispute = await service.createDispute(req.user.id, value);

    res.status(201).json({ success: true, dispute });
}));

/**
 * GET /api/v1/disputes
 * List user disputes
 */
router.get('/', asyncHandler(async (req, res) => {
    const service = new DisputeService(req.repositories, req.services);
    const disputes = await service.getUserDisputes(req.user.id);
    res.json({ success: true, disputes });
}));

/**
 * GET /api/v1/disputes/:id
 * Get dispute details
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const service = new DisputeService(req.repositories, req.services);
    const dispute = await service.getDispute(req.params.id, req.user.id);
    res.json({ success: true, dispute });
}));

/**
 * POST /api/v1/disputes/:id/evidence
 * Add evidence to a dispute
 */
router.post('/:id/evidence', strictLimiter, asyncHandler(async (req, res) => {
    const schema = Joi.object({
        evidenceUrls: Joi.array().items(Joi.string().uri()).min(1).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const service = new DisputeService(req.repositories, req.services);
    const dispute = await service.addEvidence(req.params.id, req.user.id, value.evidenceUrls);

    res.json({ success: true, dispute });
}));

module.exports = router;
