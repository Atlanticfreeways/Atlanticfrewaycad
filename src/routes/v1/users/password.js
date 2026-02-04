const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../../../middleware/authenticate');
const { csrfProtection } = require('../../../middleware/csrfProtection');
const asyncHandler = require('../../../utils/asyncHandler');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

/**
 * POST /api/v1/users/password
 * Change user password
 */
const passwordSchema = Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
        .message('Password must contain uppercase, lowercase, number, and special character'),
});

router.post('/password', asyncHandler(async (req, res) => {
    const { error, value } = passwordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        });
    }

    const { current_password, new_password } = value;

    // Get user's current password hash
    const user = await req.repositories.db('users')
        .where({ id: req.user.id })
        .select('password_hash')
        .first();

    if (!user || !user.password_hash) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
        return res.status(401).json({
            success: false,
            error: 'Current password is incorrect'
        });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 12);

    // Update password
    await req.repositories.db('users')
        .where({ id: req.user.id })
        .update({
            password_hash: newPasswordHash,
            updated_at: new Date()
        });

    // Create audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'password_changed',
        resource_type: 'user',
        resource_id: req.user.id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success'
    });

    // Create notification
    await req.repositories.db('notifications').insert({
        user_id: req.user.id,
        type: 'security',
        title: 'Password Changed',
        message: 'Your password has been successfully changed',
        data: { timestamp: new Date().toISOString() }
    });

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
}));

module.exports = router;
