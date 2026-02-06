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
    if (req.services.audit) {
        await req.services.audit.logAction({
            userId: req.user.id,
            action: 'data_export',
            resourceType: 'user',
            resourceId: req.user.id,
            req: req,
            metadata: { status: 'success' }
        });
    }

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

    // Log the deletion request
    if (req.services.audit) {
        await req.services.audit.logAction({
            userId: req.user.id,
            action: 'deletion_request',
            resourceType: 'user',
            resourceId: req.user.id,
            req: req,
            metadata: {
                scheduled_for: deletionRequest.scheduled_for,
                reason: reason
            }
        });
    }

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
    if (req.services.audit) {
        await req.services.audit.logAction({
            userId: req.user.id,
            action: 'deletion_cancelled',
            resourceType: 'user',
            resourceId: req.user.id,
            req: req
        });
    }

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
    // Manually query since PrivacyService doesn't expose getStatus (though we could add it)
    // Using user repo query runner
    const result = await req.repositories.user.query(
        "SELECT * FROM account_deletion_requests WHERE user_id = $1 AND status = 'pending'",
        [req.user.id]
    );

    const pendingRequest = result.rows[0];

    res.json({
        success: true,
        has_pending_deletion: !!pendingRequest,
        request: pendingRequest || null
    });
}));

module.exports = router;
