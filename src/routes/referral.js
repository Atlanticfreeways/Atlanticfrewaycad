const express = require('express');
const router = express.Router();
const memoryStore = require('../utils/memoryStore');
const clickTrackingService = require('../services/ClickTrackingService');

// Track referral click and redirect
router.get('/:code', (req, res) => {
  const { code } = req.params;
  
  // Store referral code in cookie for 30 days
  res.cookie('ref_code', code, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  // Track click with detailed metadata
  clickTrackingService.trackClick(code, {
    ip: req.ip,
    user_agent: req.get('user-agent'),
    referrer: req.get('referer')
  });
  
  // Track in memory store (for referral creation)
  const partner = memoryStore.getPartner(code);
  if (partner) {
    memoryStore.addReferral({
      partner_id: partner.id,
      referral_code: code,
      status: 'pending',
      ip: req.ip,
      user_agent: req.get('user-agent'),
      referrer: req.get('referer')
    });
  }
  
  // Redirect to homepage with ref parameter
  res.redirect('/?ref=' + code);
});

module.exports = router;
