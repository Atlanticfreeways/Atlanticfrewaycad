const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const PersonalService = require('../services/PersonalService');

const router = express.Router();

router.use(authenticate);

router.post('/cards', async (req, res, next) => {
  try {
    const personalService = new PersonalService(req.repositories);
    const card = await personalService.issuePersonalCard(req.user.id, req.body);
    res.status(201).json({ success: true, card });
  } catch (error) {
    next(error);
  }
});

router.get('/cards/:cardId', async (req, res, next) => {
  try {
    const personalService = new PersonalService(req.repositories);
    const card = await personalService.getCardDetails(req.params.cardId, req.user.id);
    res.json({ success: true, card });
  } catch (error) {
    next(error);
  }
});

router.post('/cards/:cardId/freeze', async (req, res, next) => {
  try {
    const personalService = new PersonalService(req.repositories);
    const card = await personalService.freezeCard(req.params.cardId, req.user.id);
    res.json({ success: true, card });
  } catch (error) {
    next(error);
  }
});

router.post('/cards/:cardId/unfreeze', async (req, res, next) => {
  try {
    const personalService = new PersonalService(req.repositories);
    const card = await personalService.unfreezeCard(req.params.cardId, req.user.id);
    res.json({ success: true, card });
  } catch (error) {
    next(error);
  }
});

router.get('/wallet', async (req, res, next) => {
  try {
    const personalService = new PersonalService(req.repositories);
    const wallet = await personalService.getWallet(req.user.id);
    res.json({ success: true, wallet });
  } catch (error) {
    next(error);
  }
});

router.post('/wallet/fund', async (req, res, next) => {
  try {
    const personalService = new PersonalService(req.repositories);
    const { amount, source } = req.body;
    const wallet = await personalService.addFunds(req.user.id, amount, source);
    res.json({ success: true, wallet });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const personalService = new PersonalService(req.repositories);
    const transactions = await personalService.getTransactions(req.user.id, req.query.limit);
    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
