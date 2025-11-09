const express = require('express');
const router = express.Router();
const payoutService = require('../services/PayoutService');
const memoryStore = require('../utils/memoryStore');

// Get payout summary for partner
router.get('/summary/:code', (req, res) => {
  const partner = memoryStore.getPartner(req.params.code);
  
  if (!partner) {
    return res.status(404).json({ 
      success: false,
      error: 'Partner not found' 
    });
  }

  const summary = payoutService.getPayoutSummary(partner.id);
  
  res.json({
    success: true,
    data: summary
  });
});

// Request a payout
router.post('/request', (req, res) => {
  const { partner_code, amount } = req.body;
  
  if (!partner_code || !amount) {
    return res.status(400).json({
      success: false,
      error: 'Partner code and amount required'
    });
  }

  const partner = memoryStore.getPartner(partner_code);
  if (!partner) {
    return res.status(404).json({
      success: false,
      error: 'Partner not found'
    });
  }

  try {
    const payout = payoutService.requestPayout(partner.id, amount);
    
    res.json({
      success: true,
      data: payout,
      message: 'Payout request created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Process a payout
router.post('/process/:id', async (req, res) => {
  try {
    const payout = await payoutService.processPayout(req.params.id);
    
    res.json({
      success: true,
      data: payout,
      message: 'Payout processed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get payout history
router.get('/history/:code', (req, res) => {
  const partner = memoryStore.getPartner(req.params.code);
  
  if (!partner) {
    return res.status(404).json({ 
      success: false,
      error: 'Partner not found' 
    });
  }

  const history = payoutService.getPayoutHistory(partner.id);
  
  res.json({
    success: true,
    data: history,
    count: history.length
  });
});

// Get available balance
router.get('/balance/:code', (req, res) => {
  const partner = memoryStore.getPartner(req.params.code);
  
  if (!partner) {
    return res.status(404).json({ 
      success: false,
      error: 'Partner not found' 
    });
  }

  const balance = payoutService.getAvailableBalance(partner.id);
  
  res.json({
    success: true,
    data: {
      partner_code: partner.referral_code,
      available_balance: balance,
      currency: 'USD'
    }
  });
});

// Cancel payout
router.post('/cancel/:id', (req, res) => {
  try {
    const payout = payoutService.cancelPayout(req.params.id);
    
    res.json({
      success: true,
      data: payout,
      message: 'Payout cancelled successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
