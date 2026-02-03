const express = require('express');
const router = express.Router();
const logger = require('../../../utils/logger');
const authMiddleware = require('../../../middleware/auth');

// GET /api/v1/admin/jit-traces/:token
// Retrieve the step-by-step execution path for a specific Marqeta transaction
router.get('/jit-traces/:token', authMiddleware.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { token } = req.params;

        const query = `
            SELECT * FROM jit_execution_traces 
            WHERE marqeta_event_token = $1 
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        const result = await req.repositories.user.pool.query(query, [token]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trace not found for this transaction' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        logger.error('Error fetching JIT trace', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
