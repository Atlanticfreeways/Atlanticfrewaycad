const express = require('express');
const { authenticate } = require('../../../middleware/authenticate');
const { csrfProtection } = require('../../../middleware/csrfProtection');
const asyncHandler = require('../../../utils/asyncHandler');
const MFAService = require('../../../services/auth/MFAService');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

/**
 * GET /api/v1/users/mfa/status
 * Check if MFA is enabled for the current user
 */
router.get('/status', asyncHandler(async (req, res) => {
    const user = await req.repositories.db('users')
        .where({ id: req.user.id })
        .select('two_factor_enabled')
        .first();

    res.json({
        success: true,
        enabled: !!user?.two_factor_enabled
    });
}));

/**
 * POST /api/v1/users/mfa/setup
 * Start the MFA setup process - generates secret and QR code
 */
router.post('/setup', asyncHandler(async (req, res) => {
    const user = await req.repositories.db('users')
        .where({ id: req.user.id })
        .first();

    if (user.two_factor_enabled) {
        return res.status(400).json({ success: false, error: 'MFA is already enabled' });
    }

    const { secret, otpauth_url } = await MFAService.generateSecret(user.email);
    const qrCode = await MFAService.generateQRCode(otpauth_url);

    // Save temporary secret in session or metadata? 
    // In this MVP, we return it and expect it back during verification
    // NOTE: This could be stored in a 'pending_mfa_secret' field in DB for security
    await req.repositories.db('users')
        .where({ id: req.user.id })
        .update({ two_factor_secret: secret });

    res.json({
        success: true,
        qrCode,
        secret // Provided so user can enter manually if QR fails
    });
}));

/**
 * POST /api/v1/users/mfa/verify
 * Confirm MFA setup by providing the first 6-digit code
 */
const verifySchema = Joi.object({
    code: Joi.string().length(6).required(),
    secret: Joi.string().required() // Re-verify secret to ensure consistency
});

router.post('/verify', asyncHandler(async (req, res) => {
    const { error, value } = verifySchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const user = await req.repositories.db('users')
        .where({ id: req.user.id })
        .first();

    // Verify the secret matches what we generated (or just use what's in DB)
    const secret = user.two_factor_secret || value.secret;

    const isValid = MFAService.verifyToken(secret, value.code);

    if (!isValid) {
        return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }

    // Generate backup codes
    const backupCodes = MFAService.generateBackupCodes();

    // Enable MFA
    await req.repositories.db('users')
        .where({ id: req.user.id })
        .update({
            two_factor_enabled: true,
            two_factor_secret: secret,
            two_factor_backup_codes: JSON.stringify(backupCodes)
        });

    // Audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'mfa_enabled',
        resource_type: 'user',
        resource_id: req.user.id,
        ip_address: req.ip,
        status: 'success'
    });

    res.json({
        success: true,
        message: 'MFA enabled successfully',
        backupCodes
    });
}));

/**
 * POST /api/v1/users/mfa/disable
 * Disable MFA - requires current code or a backup code
 */
const disableSchema = Joi.object({
    code: Joi.string().required()
});

router.post('/disable', asyncHandler(async (req, res) => {
    const { error, value } = disableSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });

    const user = await req.repositories.db('users')
        .where({ id: req.user.id })
        .first();

    if (!user.two_factor_enabled) {
        return res.status(400).json({ success: false, error: 'MFA is not enabled' });
    }

    // Verify token or backup code
    const isTokenValid = MFAService.verifyToken(user.two_factor_secret, value.code);

    let isBackupValid = false;
    let backupCodes = JSON.parse(user.two_factor_backup_codes || '[]');
    if (!isTokenValid) {
        const codeIndex = backupCodes.indexOf(value.code.toUpperCase());
        if (codeIndex !== -1) {
            isBackupValid = true;
            backupCodes.splice(codeIndex, 1);
        }
    }

    if (!isTokenValid && !isBackupValid) {
        return res.status(400).json({ success: false, error: 'Invalid code' });
    }

    // Disable MFA
    await req.repositories.db('users')
        .where({ id: req.user.id })
        .update({
            two_factor_enabled: false,
            two_factor_secret: null,
            two_factor_backup_codes: null
        });

    // Audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'mfa_disabled',
        resource_type: 'user',
        resource_id: req.user.id,
        ip_address: req.ip,
        status: 'success'
    });

    res.json({
        success: true,
        message: 'MFA disabled successfully'
    });
}));

module.exports = router;
