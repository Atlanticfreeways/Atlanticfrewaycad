const express = require('express');
const { authenticate, authorize } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrfProtection');
const BusinessService = require('../services/BusinessService');
const asyncHandler = require('../utils/asyncHandler');
const { validate, schemas } = require('../middleware/validation');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

// Company Management
router.post('/companies', strictLimiter, authorize('admin'), validate(schemas.createCompany), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const company = await businessService.createCompany(req.body);
  res.status(201).json({ success: true, company });
}));

router.get('/companies/:id', asyncHandler(async (req, res) => {
  const company = await req.repositories.company.findById(req.params.id);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json({ success: true, company });
}));

router.put('/companies/:id', authorize('admin', 'company_admin'), validate(schemas.updateCompany), asyncHandler(async (req, res) => {
  const company = await req.repositories.company.update(req.params.id, req.body);
  res.json({ success: true, company });
}));

router.get('/companies/:id/stats', asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const stats = await businessService.getCompanyStats(req.params.id);
  res.json({ success: true, stats });
}));

// Employee Management
router.post('/employees', strictLimiter, authorize('admin', 'company_admin'), validate(schemas.addEmployee), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const employee = await businessService.addEmployee(req.user.company_id, req.body);
  res.status(201).json({ success: true, employee });
}));

router.get('/companies/:id/employees', asyncHandler(async (req, res) => {
  const employees = await req.repositories.user.findByCompany(req.params.id);
  res.json({ success: true, employees });
}));

router.put('/employees/:id', authorize('admin', 'company_admin'), validate(schemas.updateEmployee), asyncHandler(async (req, res) => {
  const employee = await req.repositories.user.update(req.params.id, req.body);
  res.json({ success: true, employee });
}));

router.delete('/employees/:id', authorize('admin', 'company_admin'), asyncHandler(async (req, res) => {
  await req.repositories.user.update(req.params.id, { status: 'inactive' });
  res.json({ success: true, message: 'Employee deactivated' });
}));

// Card Management
router.post('/cards/issue', strictLimiter, validate(schemas.issueCorporateCard), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const card = await businessService.issueCorporateCard(req.user.id, req.body);
  res.status(201).json({ success: true, card });
}));

router.get('/cards/:id', asyncHandler(async (req, res) => {
  const card = await req.repositories.card.findById(req.params.id);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  res.json({ success: true, card });
}));

router.put('/cards/:id/status', authorize('admin', 'company_admin'), validate(schemas.updateCardStatus), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const card = await businessService.updateCardStatus(req.params.id, req.body.status);
  res.json({ success: true, card });
}));

// Spending Controls
router.post('/controls', strictLimiter, authorize('admin', 'company_admin'), validate(schemas.createSpendingControl), asyncHandler(async (req, res) => {
  const control = await req.repositories.spendingControl.create(req.body.card_id, req.body);
  res.status(201).json({ success: true, control });
}));

router.get('/cards/:id/controls', asyncHandler(async (req, res) => {
  const controls = await req.repositories.spendingControl.findByCard(req.params.id);
  res.json({ success: true, controls });
}));

router.put('/controls/:id', authorize('admin', 'company_admin'), validate(schemas.updateSpendingControl), asyncHandler(async (req, res) => {
  const control = await req.repositories.spendingControl.update(req.params.id, req.body);
  res.json({ success: true, control });
}));

router.delete('/controls/:id', authorize('admin', 'company_admin'), asyncHandler(async (req, res) => {
  await req.repositories.spendingControl.delete(req.params.id);
  res.json({ success: true, message: 'Control deleted' });
}));

// Transaction Monitoring
router.get('/transactions', asyncHandler(async (req, res) => {
  const transactions = await req.repositories.transaction.findByCompany(req.user.company_id, req.query.limit || 50);
  res.json({ success: true, transactions });
}));

router.get('/transactions/:id', asyncHandler(async (req, res) => {
  const transaction = await req.repositories.transaction.findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json({ success: true, transaction });
}));

router.get('/analytics/spending', asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const analytics = await businessService.getSpendingAnalytics(req.user.company_id, req.query);
  res.json({ success: true, analytics });
}));

module.exports = router;