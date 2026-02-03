const express = require('express');
const { authenticate } = require('../../../middleware/authenticate');
const { csrfProtection } = require('../../../middleware/csrfProtection');
const asyncHandler = require('../../../utils/asyncHandler');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

/**
 * GET /api/v1/users/profile
 * Fetch current user profile with KYC and spending data
 */
router.get('/', asyncHandler(async (req, res) => {
    const user = await req.repositories.db('users')
        .where({ id: req.user.id })
        .first();

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Calculate monthly spending
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlySpent = await req.repositories.db('transactions')
        .where({ user_id: req.user.id })
        .where('created_at', '>=', currentMonth)
        .sum('amount as total')
        .first();

    // Remove sensitive data
    delete user.password_hash;

    res.json({
        success: true,
        user: {
            ...user,
            monthly_spent: parseFloat(monthlySpent?.total || 0)
        }
    });
}));

/**
 * PATCH /api/v1/users/profile
 * Update user profile information
 */
const updateSchema = Joi.object({
    full_name: Joi.string().max(255),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    bio: Joi.string().max(500).allow('', null),
    company: Joi.string().max(255).allow('', null),
    address: Joi.object({
        street: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        state: Joi.string().allow('', null),
        zip: Joi.string().allow('', null),
        country: Joi.string().allow('', null)
    })
});

router.patch('/', asyncHandler(async (req, res) => {
    const { error, value } = updateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    // Update user profile
    await req.repositories.db('users')
        .where({ id: req.user.id })
        .update({
            ...value,
            updated_at: new Date()
        });

    // Fetch updated user
    const updated = await req.repositories.db('users')
        .where({ id: req.user.id })
        .first();

    delete updated.password_hash;

    // Create audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'profile_update',
        resource_type: 'user',
        resource_id: req.user.id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success',
        metadata: { updated_fields: Object.keys(value) }
    });

    res.json({ success: true, user: updated });
}));

module.exports = router;
