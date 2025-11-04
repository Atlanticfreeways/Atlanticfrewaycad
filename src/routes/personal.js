const express = require('express');
const { authenticateToken, requireAccountType } = require('../middleware/auth');
const PersonalService = require('../services/PersonalService');

const router = express.Router();

// All personal routes require authentication
router.use(authenticateToken);
router.use(requireAccountType('personal'));

// Personal virtual card issuance
router.post('/cards/virtual', async (req, res) => {
  try {
    const card = await req.personalService.issuePersonalCard(
      req.user.id,
      req.body
    );
    res.status(201).json({ success: true, card });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crypto funding
router.post('/wallet/crypto', async (req, res) => {
  try {
    const { amount, cryptoType, walletAddress } = req.body;
    const transaction = await req.personalService.fundWithCrypto(
      req.user.id,
      amount,
      cryptoType,
      walletAddress
    );
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bank transfer funding
router.post('/wallet/bank', async (req, res) => {
  try {
    const { amount, bankAccount } = req.body;
    const transfer = await req.personalService.fundWithBank(
      req.user.id,
      amount,
      bankAccount
    );
    res.status(201).json({ success: true, transfer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// KYC verification
router.post('/kyc', async (req, res) => {
  try {
    const kyc = await req.personalService.submitKYC(req.user.id, req.body);
    res.status(201).json({ success: true, kyc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Card controls
router.post('/cards/:cardId/freeze', async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await req.personalService.freezeCard(
      req.params.cardId,
      reason
    );
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cards/:cardId/unfreeze', async (req, res) => {
  try {
    const result = await req.personalService.unfreezeCard(req.params.cardId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;