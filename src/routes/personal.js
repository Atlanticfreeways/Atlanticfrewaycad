const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrfProtection');
const PersonalService = require('../services/PersonalService');
const asyncHandler = require('../utils/asyncHandler');
const { validate, schemas } = require('../middleware/validation');
const { strictLimiter } = require('../middleware/rateLimiter');
const idempotency = require('../middleware/idempotency');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

router.post('/cards', strictLimiter, idempotency, validate(schemas.createCard), asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories, req.services);
  const card = await personalService.issuePersonalCard(req.user.id, req.body);
  res.status(201).json({ success: true, card });
}));

router.get('/cards/:cardId', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories, req.services);
  const card = await personalService.getCardDetails(req.params.cardId, req.user.id);
  res.json({ success: true, card });
}));

router.post('/cards/:cardId/freeze', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories, req.services);
  const card = await personalService.freezeCard(req.params.cardId, req.user.id);
  res.json({ success: true, card });
}));

router.post('/cards/:cardId/unfreeze', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories, req.services);
  const card = await personalService.unfreezeCard(req.params.cardId, req.user.id);
  res.json({ success: true, card });
}));

router.put('/cards/:cardId/limits', strictLimiter, idempotency, asyncHandler(async (req, res) => {
  const Joi = require('joi');
  const schema = Joi.object({
    dailyLimit: Joi.number().min(0).required(),
    monthlyLimit: Joi.number().min(0).required(),
    transactionLimit: Joi.number().min(0).required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  const personalService = new PersonalService(req.repositories, req.services);
  const card = await personalService.updateCardLimits(req.params.cardId, req.user.id, value);
  res.json({ success: true, card });
}));

// --- Card Controls (Merchant & Location) ---

const CardControlService = require('../services/CardControlService');

/**
 * POST /cards/:cardId/controls/merchant
 * Add a merchant restriction
 */
router.post('/cards/:cardId/controls/merchant', strictLimiter, idempotency, asyncHandler(async (req, res) => {
  const Joi = require('joi');
  const schema = Joi.object({
    controlType: Joi.string().valid('allow', 'block').required(),
    merchantName: Joi.string().optional(),
    mcc: Joi.string().optional(),
    categoryGroup: Joi.string().optional()
  }).or('merchantName', 'mcc', 'categoryGroup');

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });

  const service = new CardControlService(req.repositories, req.services);
  const rule = await service.addMerchantControl(req.user.id, req.params.cardId, value);
  res.json({ success: true, rule });
}));

/**
 * GET /cards/:cardId/controls/merchant
 */
router.get('/cards/:cardId/controls/merchant', asyncHandler(async (req, res) => {
  const service = new CardControlService(req.repositories, req.services);
  const rules = await service.getMerchantControls(req.user.id, req.params.cardId);
  res.json({ success: true, rules });
}));

/**
 * DELETE /cards/controls/merchant/:controlId
 */
router.delete('/cards/controls/merchant/:controlId', asyncHandler(async (req, res) => {
  const service = new CardControlService(req.repositories, req.services);
  await service.deleteMerchantControl(req.user.id, req.params.controlId);
  res.json({ success: true });
}));

/**
 * POST /cards/:cardId/controls/location
 * Set location restriction (country)
 */
router.post('/cards/:cardId/controls/location', strictLimiter, idempotency, asyncHandler(async (req, res) => {
  const Joi = require('joi');
  const schema = Joi.object({
    controlType: Joi.string().valid('allow', 'block').required(),
    countryCode: Joi.string().length(2).uppercase().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });

  const service = new CardControlService(req.repositories, req.services);
  const rule = await service.setLocationControl(req.user.id, req.params.cardId, value);
  res.json({ success: true, rule });
}));

/**
 * GET /cards/:cardId/controls/location
 */
router.get('/cards/:cardId/controls/location', asyncHandler(async (req, res) => {
  const service = new CardControlService(req.repositories, req.services);
  const rules = await service.getLocationControls(req.user.id, req.params.cardId);
  res.json({ success: true, rules });
}));

/**
 * DELETE /cards/:cardId/controls/location/:countryCode
 */
router.delete('/cards/:cardId/controls/location/:countryCode', asyncHandler(async (req, res) => {
  const service = new CardControlService(req.repositories, req.services);
  await service.deleteLocationControl(req.user.id, req.params.cardId, req.params.countryCode);
  res.json({ success: true });
}));

router.get('/wallet', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories, req.services);
  const wallet = await personalService.getWallet(req.user.id);
  res.json({ success: true, wallet });
}));

router.post('/wallet/fund', strictLimiter, idempotency, validate(schemas.addFunds), asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories, req.services);
  const { amount, source } = req.body;
  const wallet = await personalService.addFunds(req.user.id, amount, source);
  res.json({ success: true, wallet });
}));

router.get('/transactions', asyncHandler(async (req, res) => {
  const personalService = new PersonalService(req.repositories, req.services);
  const transactions = await personalService.getTransactions(req.user.id, req.query.limit);
  res.json({ success: true, transactions });
}));

module.exports = router;
