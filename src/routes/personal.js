const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrfProtection');
const PersonalService = require('../services/PersonalService');
const asyncHandler = require('../utils/asyncHandler');
const { validate, schemas } = require('../middleware/validation');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

router.post('/cards', strictLimiter, validate(schemas.createCard), asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const card = await personalService.issuePersonalCard(req.user.id, req.body);
  res.status(201).json({ success: true, card });
}));

router.get('/cards/:cardId', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const card = await personalService.getCardDetails(req.params.cardId, req.user.id);
  res.json({ success: true, card });
}));

router.post('/cards/:cardId/freeze', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const card = await personalService.freezeCard(req.params.cardId, req.user.id);
  res.json({ success: true, card });
}));

router.post('/cards/:cardId/unfreeze', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const card = await personalService.unfreezeCard(req.params.cardId, req.user.id);
  res.json({ success: true, card });
}));

router.get('/wallet', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const wallet = await personalService.getWallet(req.user.id);
  res.json({ success: true, wallet });
}));

router.post('/wallet/fund', strictLimiter, validate(schemas.addFunds), asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const { amount, source } = req.body;
  const wallet = await personalService.addFunds(req.user.id, amount, source);
  res.json({ success: true, wallet });
}));

router.get('/transactions', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const transactions = await personalService.getTransactions(req.user.id, req.query.limit);
  res.json({ success: true, transactions });
}));

module.exports = router;
