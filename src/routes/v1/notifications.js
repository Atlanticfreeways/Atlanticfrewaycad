const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { csrfProtection } = require('../../middleware/csrfProtection');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

/**
 * GET /api/v1/notifications
 * List user notifications with filtering and pagination
 */
router.get('/', asyncHandler(async (req, res) => {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = req.repositories.db('notifications')
        .where({ user_id: req.user.id })
        .orderBy('created_at', 'desc')
        .limit(parseInt(limit))
        .offset(offset);

    if (type && type !== 'all') {
        query = query.where({ type });
    }

    const notifications = await query;

    // Get total count for pagination
    let countQuery = req.repositories.db('notifications')
        .where({ user_id: req.user.id })
        .count('* as count');

    if (type && type !== 'all') {
        countQuery = countQuery.where({ type });
    }

    const { count } = await countQuery.first();

    res.json({
        success: true,
        notifications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(count),
            pages: Math.ceil(parseInt(count) / parseInt(limit))
        }
    });
}));

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify ownership
    const notification = await req.repositories.db('notifications')
        .where({ id, user_id: req.user.id })
        .first();

    if (!notification) {
        return res.status(404).json({
            success: false,
            error: 'Notification not found'
        });
    }

    // Update read_at timestamp
    await req.repositories.db('notifications')
        .where({ id })
        .update({
            read_at: new Date(),
            updated_at: new Date()
        });

    res.json({ success: true });
}));

/**
 * POST /api/v1/notifications/mark-all-read
 * Mark all notifications as read
 */
router.post('/mark-all-read', asyncHandler(async (req, res) => {
    const count = await req.repositories.db('notifications')
        .where({ user_id: req.user.id })
        .whereNull('read_at')
        .update({
            read_at: new Date(),
            updated_at: new Date()
        });

    res.json({
        success: true,
        marked_read: count
    });
}));

/**
 * DELETE /api/v1/notifications/:id
 * Delete a notification
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deleted = await req.repositories.db('notifications')
        .where({ id, user_id: req.user.id })
        .del();

    if (deleted === 0) {
        return res.status(404).json({
            success: false,
            error: 'Notification not found'
        });
    }

    res.json({ success: true });
}));

/**
 * GET /api/v1/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', asyncHandler(async (req, res) => {
    const { count } = await req.repositories.db('notifications')
        .where({ user_id: req.user.id })
        .whereNull('read_at')
        .count('* as count')
        .first();

    res.json({
        success: true,
        unread_count: parseInt(count)
    });
}));

module.exports = router;
