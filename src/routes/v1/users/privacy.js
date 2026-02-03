const express = require('express');
const { authenticate } = require('../../../middleware/authenticate');
const { csrfProtection } = require('../../../middleware/csrfProtection');
const asyncHandler = require('../../../utils/asyncHandler');
const PrivacyService = require('../../../services/PrivacyService');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

/**
 * GET /api/v1/users/privacy/data-export
 * Export all user data in GDPR-compliant JSON format
 */
router.get('/data-export', asyncHandler(async (req, res) => {
    const privacyService = new PrivacyService(req.repositories);
    const exportData = await privacyService.exportUserData(req.user.id);

    // Log the export action
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'data_export',
        resource_type: 'user',
        resource_id: req.user.id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success'
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="atlantic-data-export-${Date.now()}.json"`);
    res.json(exportData);
}));

/**
 * POST /api/v1/users/privacy/delete-request
 * Create account deletion request with 30-day grace period
 */
router.post('/delete-request', asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const privacyService = new PrivacyService(req.repositories);
    const deletionRequest = await privacyService.createDeletionRequest(req.user.id, reason);

    // Send confirmation email (if email service is available)
    if (req.emailService) {
        try {
            await req.emailService.send({
                to: req.user.email,
                template: 'account-deletion-request',
                data: {
                    name: req.user.full_name,
                    scheduled_for: deletionRequest.scheduled_for.toISOString().split('T')[0]
                }
            });
        } catch (emailError) {
            console.error('Failed to send deletion confirmation email:', emailError);
        }
    }

    // Log the deletion request
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'deletion_request',
        resource_type: 'user',
        resource_id: req.user.id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success',
        metadata: { scheduled_for: deletionRequest.scheduled_for }
    });

    res.json({
        success: true,
        message: 'Account deletion request created. You have 30 days to cancel.',
        request: {
            id: deletionRequest.id,
            scheduled_for: deletionRequest.scheduled_for,
            status: deletionRequest.status
        }
    });
}));

/**
 * POST /api/v1/users/privacy/cancel-deletion
 * Cancel a pending account deletion request
 */
router.post('/cancel-deletion', asyncHandler(async (req, res) => {
    const privacyService = new PrivacyService(req.repositories);
    const cancelled = await privacyService.cancelDeletionRequest(req.user.id);

    if (!cancelled) {
        return res.status(404).json({
            success: false,
            error: 'No pending deletion request found'
        });
    }

    // Log the cancellation
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'deletion_cancelled',
        resource_type: 'user',
        resource_id: req.user.id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success'
    });

    res.json({
        success: true,
        message: 'Account deletion request cancelled'
    });
}));

/**
 * GET /api/v1/users/privacy/deletion-status
 * Check if user has a pending deletion request
 */
router.get('/deletion-status', asyncHandler(async (req, res) => {
    const pendingRequest = await req.repositories.db('account_deletion_requests')
        .where({ user_id: req.user.id, status: 'pending' })
        .first();

    res.json({
        success: true,
        has_pending_deletion: !!pendingRequest,
        request: pendingRequest || null
    });
}));

module.exports = router;
