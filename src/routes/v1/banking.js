const express = require('express');
const router = express.Router();
const BankingService = require('../../services/banking/BankingService.js');
const authMiddleware = require('../../middleware/auth');
// const adminMiddleware = require('../../../middleware/admin'); // If we had one

// GET /api/v1/banking/account
// Get the user's Virtual Account details (Routing/Account Number)
router.get('/account', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const bankingService = new BankingService(req.repositories);
        const account = await bankingService.getOrCreateVirtualAccount(req.user.id);

        res.json({
            account_number: account.account_number,
            routing_number: account.routing_number,
            bank_name: account.bank_name,
            status: account.status
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve banking details' });
    }
});

// POST /api/v1/banking/simulate-deposit (Admin/Dev Only)
// Simulate an incoming payroll deposit
router.post('/simulate-deposit', authMiddleware.authenticateToken, require('../../middleware/IdempotencyMiddleware'), async (req, res) => {
    // strict check for admin or dev env
    if (req.user.role !== 'admin' && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Simulation not allowed in production without admin rights' });
    }

    const { account_number, amount, employer } = req.body;

    if (!account_number || !amount) {
        return res.status(400).json({ error: 'Missing account_number or amount' });
    }

    try {
        const bankingService = new BankingService(req.repositories);
        const result = await bankingService.simulateDirectDeposit(account_number, parseFloat(amount), employer);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
