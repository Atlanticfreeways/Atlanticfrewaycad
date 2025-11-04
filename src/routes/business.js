const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const BusinessService = require('../services/BusinessService');

const router = express.Router();

// All business routes require authentication
router.use(authenticateToken);

// Company management (admin only)
router.post('/companies', requireRole(['admin']), async (req, res) => {
  try {
    const company = await req.businessService.createCompany(req.body);
    res.status(201).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Employee management
router.post('/employees', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const employee = await req.businessService.addEmployee(
      req.user.companyId,
      req.body
    );
    res.status(201).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Corporate card issuance
router.post('/cards/corporate', async (req, res) => {
  try {
    const card = await req.businessService.issueCorporateCard(
      req.user.id,
      req.body
    );
    res.status(201).json({ success: true, card });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Expense reporting
router.get('/expenses', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const expenses = await req.businessService.getExpenseReport(
      req.user.companyId,
      req.query
    );
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Spending approvals
router.post('/approvals/:transactionId', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const { approved, reason } = req.body;
    const result = await req.businessService.processSpendingApproval(
      req.params.transactionId,
      approved,
      reason
    );
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;