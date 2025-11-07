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

router.post('/companies', strictLimiter, authorize('admin'), validate(schemas.createCompany), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const company = await businessService.createCompany(req.body);
  res.status(201).json({ success: true, company });
}));

router.post('/employees', authorize('admin', 'manager'), validate(schemas.addEmployee), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const employee = await businessService.addEmployee(req.user.companyId, req.body);
  res.status(201).json({ success: true, employee });
}));

router.post('/cards/corporate', strictLimiter, validate(schemas.issueCorporateCard), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const card = await businessService.issueCorporateCard(req.user.id, req.body);
  res.status(201).json({ success: true, card });
}));

router.get('/expenses', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const expenses = await businessService.getExpenseReport(req.user.companyId, req.query);
  res.json({ success: true, expenses });
}));

router.put('/cards/:cardId/controls', authorize('admin', 'manager'), validate(schemas.updateSpendingControls), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  const controls = await businessService.updateSpendingControls(req.params.cardId, req.body);
  res.json({ success: true, controls });
}));

module.exports = router;