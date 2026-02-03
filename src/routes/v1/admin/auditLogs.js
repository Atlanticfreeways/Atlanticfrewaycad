const express = require('express');
const { authenticate, authorize } = require('../../../middleware/authenticate');
const asyncHandler = require('../../../utils/asyncHandler');
const { Parser } = require('json2csv');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin'])); // Only admins can access audit logs

/**
 * GET /api/v1/admin/audit-logs
 * List audit logs with filtering and pagination
 */
router.get('/', asyncHandler(async (req, res) => {
    const {
        action,
        user,
        start_date,
        end_date,
        page = 1,
        limit = 50
    } = req.query;

    const offset = (page - 1) * limit;

    let query = req.repositories.db('audit_logs')
        .leftJoin('users', 'audit_logs.user_id', 'users.id')
        .select(
            'audit_logs.id',
            'audit_logs.user_id',
            'users.email as user_email',
            'audit_logs.action',
            'audit_logs.resource_type',
            'audit_logs.resource_id',
            'audit_logs.ip_address',
            'audit_logs.user_agent',
            'audit_logs.status',
            'audit_logs.metadata',
            'audit_logs.created_at'
        )
        .orderBy('audit_logs.created_at', 'desc')
        .limit(parseInt(limit))
        .offset(offset);

    // Apply filters
    if (action) {
        query = query.where('audit_logs.action', action);
    }
    if (user) {
        query = query.where('users.email', 'like', `%${user}%`);
    }
    if (start_date) {
        query = query.where('audit_logs.created_at', '>=', start_date);
    }
    if (end_date) {
        query = query.where('audit_logs.created_at', '<=', end_date);
    }

    const logs = await query;

    // Get total count
    let countQuery = req.repositories.db('audit_logs')
        .leftJoin('users', 'audit_logs.user_id', 'users.id')
        .count('* as count');

    if (action) countQuery = countQuery.where('audit_logs.action', action);
    if (user) countQuery = countQuery.where('users.email', 'like', `%${user}%`);
    if (start_date) countQuery = countQuery.where('audit_logs.created_at', '>=', start_date);
    if (end_date) countQuery = countQuery.where('audit_logs.created_at', '<=', end_date);

    const { count } = await countQuery.first();

    res.json({
        success: true,
        logs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(count),
            pages: Math.ceil(parseInt(count) / parseInt(limit))
        }
    });
}));

/**
 * GET /api/v1/admin/audit-logs/export
 * Export audit logs to CSV
 */
router.get('/export', asyncHandler(async (req, res) => {
    const { action, user, start_date, end_date } = req.query;

    let query = req.repositories.db('audit_logs')
        .leftJoin('users', 'audit_logs.user_id', 'users.id')
        .select(
            'audit_logs.created_at',
            'users.email as user_email',
            'audit_logs.action',
            'audit_logs.resource_type',
            'audit_logs.resource_id',
            'audit_logs.ip_address',
            'audit_logs.status'
        )
        .orderBy('audit_logs.created_at', 'desc')
        .limit(10000); // Cap at 10k rows for CSV

    // Apply same filters
    if (action) query = query.where('audit_logs.action', action);
    if (user) query = query.where('users.email', 'like', `%${user}%`);
    if (start_date) query = query.where('audit_logs.created_at', '>=', start_date);
    if (end_date) query = query.where('audit_logs.created_at', '<=', end_date);

    const logs = await query;

    // Convert to CSV
    const parser = new Parser({
        fields: ['created_at', 'user_email', 'action', 'resource_type', 'resource_id', 'ip_address', 'status']
    });
    const csv = parser.parse(logs);

    // Set download headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
}));

/**
 * GET /api/v1/admin/audit-logs/stats
 * Get audit log statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;

    let query = req.repositories.db('audit_logs');

    if (start_date) query = query.where('created_at', '>=', start_date);
    if (end_date) query = query.where('created_at', '<=', end_date);

    const [
        totalLogs,
        successLogs,
        failureLogs,
        topActions,
        topUsers
    ] = await Promise.all([
        query.clone().count('* as count').first(),
        query.clone().where('status', 'success').count('* as count').first(),
        query.clone().where('status', 'failure').count('* as count').first(),
        query.clone()
            .select('action')
            .count('* as count')
            .groupBy('action')
            .orderBy('count', 'desc')
            .limit(5),
        query.clone()
            .leftJoin('users', 'audit_logs.user_id', 'users.id')
            .select('users.email')
            .count('* as count')
            .groupBy('users.email')
            .orderBy('count', 'desc')
            .limit(5)
    ]);

    res.json({
        success: true,
        stats: {
            total: parseInt(totalLogs.count),
            successful: parseInt(successLogs.count),
            failed: parseInt(failureLogs.count),
            top_actions: topActions,
            top_users: topUsers
        }
    });
}));

module.exports = router;
