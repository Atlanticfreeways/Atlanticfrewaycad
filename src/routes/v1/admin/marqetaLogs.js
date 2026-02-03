const express = require('express');
const router = express.Router();
const logger = require('../../../utils/logger');
const authMiddleware = require('../../../middleware/auth'); // Assuming you have an auth middleware

// GET /api/v1/admin/marqeta-logs
// Retrieve raw Marqeta webhook logs for troubleshooting
router.get('/marqeta-logs', authMiddleware.authenticateToken, async (req, res) => {
    try {
        // Simple authorization check (RBAC should be better in future)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: Admin only' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const eventType = req.query.type;

        let query = `
            SELECT id, event_type, event_token, payload, headers, created_at 
            FROM marqeta_event_logs 
        `;
        let params = [];
        let whereClause = '';

        if (eventType) {
            whereClause = 'WHERE event_type = $1';
            params.push(eventType);
        }

        query += `${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const logs = await req.repositories.user.pool.query(query, params);

        // Get total count for pagination
        const countQuery = `SELECT count(*) FROM marqeta_event_logs ${whereClause}`;
        const countResult = await req.repositories.user.pool.query(countQuery, eventType ? [eventType] : []);

        res.json({
            data: logs.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                limit,
                offset
            }
        });

    } catch (error) {
        logger.error('Error fetching Marqeta logs', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
