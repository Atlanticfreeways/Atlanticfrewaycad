const express = require('express');
const router = express.Router();
const commissionService = require('../services/CommissionCalculationService');
const memoryStore = require('../utils/memoryStore');

// Get commission summary for a partner
router.get('/summary/:code', (req, res) => {
  const partner = memoryStore.getPartner(req.params.code);
  
  if (!partner) {
    return res.status(404).json({ 
      success: false,
      error: 'Partner not found' 
    });
  }

  const summary = commissionService.getCommissionSummary(partner.id);
  
  res.json({
    success: true,
    data: summary
  });
});

// Calculate commission for a specific referral
router.post('/calculate', (req, res) => {
  const { referral_code, user_id } = req.body;
  
  if (!referral_code) {
    return res.status(400).json({
      success: false,
      error: 'Referral code required'
    });
  }

  const commission = commissionService.processConversion(referral_code, user_id);
  
  if (!commission) {
    return res.status(404).json({
      success: false,
      error: 'No pending referral found'
    });
  }

  res.json({
    success: true,
    data: commission,
    message: 'Commission calculated successfully'
  });
});

// Get total earnings for a partner
router.get('/earnings/:code', (req, res) => {
  const partner = memoryStore.getPartner(req.params.code);
  
  if (!partner) {
    return res.status(404).json({ 
      success: false,
      error: 'Partner not found' 
    });
  }

  const totalEarnings = commissionService.calculateTotalEarnings(partner.id);
  
  res.json({
    success: true,
    data: {
      partner_id: partner.id,
      partner_code: partner.referral_code,
      total_earnings: totalEarnings,
      currency: 'USD'
    }
  });
});

module.exports = router;
