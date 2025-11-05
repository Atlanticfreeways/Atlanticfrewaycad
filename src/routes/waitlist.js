const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// POST /api/waitlist - Add email to waitlist
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        // Save to waitlist
        const result = await pool.query(
            `INSERT INTO waitlist (email, ip_address, user_agent) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (email) DO NOTHING
             RETURNING *`,
            [email, ip, userAgent]
        );

        // Log activity
        await pool.query(
            `INSERT INTO admin_activity (activity_type, description, metadata) 
             VALUES ($1, $2, $3)`,
            [
                'waitlist_signup',
                `New waitlist signup: ${email}`,
                JSON.stringify({ email, ip, userAgent })
            ]
        );

        res.json({ 
            success: true, 
            message: 'Successfully added to waitlist!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Waitlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding to waitlist' 
        });
    }
});

// GET /api/waitlist - Get all waitlist entries (admin only)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM waitlist ORDER BY created_at DESC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching waitlist:', error);
        res.status(500).json({ success: false, message: 'Error fetching waitlist' });
    }
});

// GET /api/waitlist/stats - Get waitlist statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as today,
                COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as this_week
            FROM waitlist
        `);
        res.json({ success: true, data: stats.rows[0] });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
});

module.exports = router;
