const express = require('express');
const router = express.Router();
const memoryStore = require('../utils/memoryStore');

// Get partner profile by code (for dashboard)
router.get('/profile/:code', (req, res) => {
  const partner = memoryStore.getPartner(req.params.code);
  
  if (!partner) {
    return res.status(404).json({ 
      success: false,
      error: 'Partner not found' 
    });
  }

  const stats = memoryStore.getPartnerStats(partner.id);
  
  res.json({
    success: true,
    data: {
      ...partner,
      stats
    }
  });
});

// Register new partner
router.post('/register', (req, res) => {
  const { username, email, company_name } = req.body;
  
  if (!username || !email) {
    return res.status(400).json({
      success: false,
      error: 'Username and email required'
    });
  }

  // Generate referral code
  const code = username.toUpperCase().substring(0, 4) + 
               Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const partner = memoryStore.addPartner({
    username,
    email,
    company_name: company_name || username,
    referral_code: code,
    tier: 'tier1',
    commission_rate: 10.00,
    status: 'active'
  });
  
  res.json({ 
    success: true, 
    data: partner,
    message: 'Partner registered successfully'
  });
});

// Get all partners (admin)
router.get('/all', (req, res) => {
  const partners = memoryStore.getAllPartners();
  res.json({
    success: true,
    data: partners,
    count: partners.length
  });
});

// Get referrals for a partner
router.get('/:code/referrals', (req, res) => {
  const partner = memoryStore.getPartner(req.params.code);
  
  if (!partner) {
    return res.status(404).json({ 
      success: false,
      error: 'Partner not found' 
    });
  }

  const referrals = memoryStore.getReferralsByPartner(partner.id);
  
  res.json({
    success: true,
    data: referrals,
    count: referrals.length
  });
});

module.exports = router;
