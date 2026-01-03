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

// Account Management
router.post('/accounts', strictLimiter, validate(schemas.createPersonalAccount), asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const account = await personalService.createPersonalAccount(req.user.id, req.body);
  res.status(201).json({ success: true, account });
}));

router.get('/accounts/:id', asyncHandler(async (req, res) => {
  const account = await req.repositories.user.findById(req.params.id);
  if (!account || account.id !== req.user.id) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.json({ success: true, account });
}));

router.put('/accounts/:id', validate(schemas.updatePersonalAccount), asyncHandler(async (req, res) => {
  if (req.params.id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const account = await req.repositories.user.update(req.params.id, req.body);
  res.json({ success: true, account });
}));

// KYC Verification
router.post('/kyc/verify', strictLimiter, validate(schemas.submitKYC), asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const verification = await personalService.submitKYCVerification(req.user.id, req.body);
  res.status(201).json({ success: true, verification });
}));

router.get('/kyc/status', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const status = await personalService.getKYCStatus(req.user.id);
  res.json({ success: true, status });
}));

// Card Management
router.post('/cards', strictLimiter, validate(schemas.issuePersonalCard), asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const card = await personalService.issuePersonalCard(req.user.id, req.body);
  res.status(201).json({ success: true, card });
}));

router.get('/cards', asyncHandler(async (req, res) => {
  const cards = await req.repositories.card.findByUser(req.user.id);
  res.json({ success: true, cards });
}));

router.get('/cards/:id', asyncHandler(async (req, res) => {
  const card = await req.repositories.card.findById(req.params.id);
  if (!card || card.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Card not found' });
  }
  res.json({ success: true, card });
}));

router.post('/cards/:id/freeze', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const card = await personalService.freezeCard(req.params.id, req.user.id);
  res.json({ success: true, card });
}));

router.post('/cards/:id/unfreeze', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const card = await personalService.unfreezeCard(req.params.id, req.user.id);
  res.json({ success: true, card });
}));

// Wallet Management
router.get('/wallet', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const wallet = await personalService.getWallet(req.user.id);
  res.json({ success: true, wallet });
}));

router.post('/wallet/fund', strictLimiter, validate(schemas.fundWallet), asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const wallet = await personalService.addFunds(req.user.id, req.body.amount, req.body.source);
  res.json({ success: true, wallet });
}));

// Transaction History
router.get('/transactions', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories);
  const transactions = await personalService.getTransactions(req.user.id, req.query.limit || 50);
  res.json({ success: true, transactions });
}));

router.get('/transactions/:id', asyncHandler(async (req, res) => {
  const transaction = await req.repositories.transaction.findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json({ success: true, transaction });
}));

module.exports = router;