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

router.get('/cards', asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  let cards;

  // If user explicitly asks for their own cards OR is just an employee
  if (req.query.scope === 'me' || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
    cards = await businessService.getCardsByUser(req.user.id, req.user.companyId);
  } else {
    // Admins/Managers see all cards by default
    cards = await businessService.getCards(req.user.companyId);
  }

  res.json({ success: true, cards });
}));

router.put('/cards/:cardId/controls', authorize('admin', 'manager'), validate(schemas.updateSpendingControls), asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  res.json({ success: true, controls });
}));

router.put('/cards/:cardId/status', asyncHandler(async (req, res) => {
  const businessService = new BusinessService(req.repositories);
  // Security check: Ensure card belongs to company (Service should handle, but basic check is good)
  // For now, relying on Service finding the card
  const card = await businessService.updateCardStatus(req.params.cardId, req.body.status);
  res.json({ success: true, card });
}));

module.exports = router;