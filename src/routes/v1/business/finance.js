const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth');
const { requireRole, ROLES } = require('../../../middleware/rbac');
const logger = require('../../../utils/logger');

// GET /api/v1/business/finance/overview
// Financial Overview (Balance, Burn Rate, Monthly Spend)
// Accessible by: Business Admin, Finance Manager
router.get('/overview', authMiddleware, requireRole([ROLES.BUSINESS_ADMIN, ROLES.FINANCE_MANAGER]), async (req, res) => {
    try {
        const companyId = req.user.company_id;

        // Mock Aggregation Data (Replace with real SQL aggregation later)
        const financeData = {
            total_balance: { amount: 154200.50, currency: 'USD' },
            monthly_burn_rate: 12500.00,
            active_cards: 45,
            pending_settlements: 1200.00,
            generated_at: new Date().toISOString()
        };

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
router.post('/load-funds', authMiddleware, requireRole([ROLES.BUSINESS_ADMIN]), idempotency, async (req, res) => {
    // ... Logic to load funds via ACH/Wire ...
    res.json({ message: 'Fund load initiated' });
});

module.exports = router;
