const express = require('express');
const { authenticate, authorize } = require('../middleware/authenticate');
const BusinessService = require('../services/BusinessService');

const router = express.Router();

router.use(authenticate);

router.post('/companies', authorize('admin'), async (req, res, next) => {
  try {
    const businessService = new BusinessService(req.repositories);
    const company = await businessService.createCompany(req.body);
    res.status(201).json({ success: true, company });
  } catch (error) {
    next(error);
  }
});

router.post('/employees', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const businessService = new BusinessService(req.repositories);
    const employee = await businessService.addEmployee(req.user.companyId, req.body);
    res.status(201).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
});

router.post('/cards/corporate', async (req, res, next) => {
  try {
    const businessService = new BusinessService(req.repositories);
    const card = await businessService.issueCorporateCard(req.user.id, req.body);
    res.status(201).json({ success: true, card });
  } catch (error) {
    next(error);
  }
});

router.get('/expenses', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const businessService = new BusinessService(req.repositories);
    const expenses = await businessService.getExpenseReport(req.user.companyId, req.query);
    res.json({ success: true, expenses });
  } catch (error) {
    next(error);
  }
});

router.put('/cards/:cardId/controls', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const businessService = new BusinessService(req.repositories);
    const controls = await businessService.updateSpendingControls(req.params.cardId, req.body);
    res.json({ success: true, controls });
  } catch (error) {
    next(error);
  }
});

module.exports = router;