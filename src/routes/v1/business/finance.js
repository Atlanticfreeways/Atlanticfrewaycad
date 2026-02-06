const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth');
const { requireRole, ROLES } = require('../../../middleware/rbac');
const logger = require('../../../utils/logger');
const dbConnection = require('../../../database/connection');

// GET /api/v1/business/finance/overview
// Financial Overview (Balance, Burn Rate, Monthly Spend)
// Accessible by: Business Admin, Finance Manager
router.get('/overview', authMiddleware.authenticateToken, requireRole([ROLES.BUSINESS_ADMIN, ROLES.FINANCE_MANAGER]), async (req, res) => {
    try {
        const companyId = req.user.company_id;
        const redisClient = dbConnection.getRedis();
        const cacheKey = `finance:overview:${companyId}`;

        // 1. Try Cache
        if (redisClient && redisClient.isOpen) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    return res.json(JSON.parse(cached));
                }
            } catch (err) {
                logger.warn('Redis cache read failed', err);
            }
        }

        const pgPool = dbConnection.getPostgres();

        // 2. Fetch Data (Parallel)
        const [walletRes, spendRes, cardsRes, pendingRes] = await Promise.all([
            // Total Balance
            pgPool.query('SELECT SUM(balance) as total FROM wallets WHERE company_id = $1', [companyId]),

            // Monthly Burn Rate (Last 30 days)
            pgPool.query(`
                SELECT SUM(t.amount) as total 
                FROM transactions t 
                JOIN users u ON t.user_id = u.id 
                WHERE u.company_id = $1 
                AND t.created_at >= NOW() - INTERVAL '30 days' 
                AND t.status = 'approved'
            `, [companyId]),

            // Active Cards
            pgPool.query(`
                SELECT COUNT(c.id) as total 
                FROM cards c 
                JOIN users u ON c.user_id = u.id 
                WHERE u.company_id = $1 
                AND c.status = 'active'
            `, [companyId]),

            // Pending Settlements
            pgPool.query(`
                SELECT SUM(t.amount) as total 
                FROM transactions t 
                JOIN users u ON t.user_id = u.id 
                WHERE u.company_id = $1 
                AND t.status = 'pending'
            `, [companyId])
        ]);

        const financeData = {
            total_balance: {
                amount: parseFloat(walletRes.rows[0].total || 0),
                currency: 'USD'
            },
            monthly_burn_rate: parseFloat(spendRes.rows[0].total || 0),
            active_cards: parseInt(cardsRes.rows[0].total || 0),
            pending_settlements: parseFloat(pendingRes.rows[0].total || 0),
            generated_at: new Date().toISOString()
        };

        // 3. Set Cache (60 seconds)
        if (redisClient && redisClient.isOpen) {
            try {
                await redisClient.setEx(cacheKey, 60, JSON.stringify(financeData));
            } catch (err) {
                logger.warn('Redis cache write failed', err);
            }
        }

        res.json(financeData);

    } catch (error) {
        logger.error('Finance API Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const idempotency = require('../../../middleware/idempotency');

// POST /api/v1/business/finance/load-funds
// Load funds into the company wallet
// Accessible by: Business Admin ONLY (Finance Manager cannot initiate transfers yet)
// Security: Idempotency required to prevent double billing
router.post('/load-funds', authMiddleware.authenticateToken, requireRole([ROLES.BUSINESS_ADMIN]), idempotency, async (req, res) => {
    // ... Logic to load funds via ACH/Wire ...
    res.json({ message: 'Fund load initiated' });
});

module.exports = router;
