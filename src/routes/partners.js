const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const asyncHandler = require('../utils/asyncHandler');
const Joi = require('joi');

const registerSchema = Joi.object({
  partner_type: Joi.string().valid('affiliate', 'reseller', 'whitelabel', 'technology').required(),
  company_name: Joi.string().max(255),
  settings: Joi.object()
});

const updateSchema = Joi.object({
  company_name: Joi.string().max(255),
  settings: Joi.object(),
  branding: Joi.object()
});

router.post('/register',
  authenticateToken,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const partnerService = req.app.get('services').partner;
    const partner = await partnerService.registerPartner(req.user.id, req.body);
    res.status(201).json({ success: true, data: partner });
  })
);

router.get('/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const partnerService = req.app.get('services').partner;
    const partnerRepo = req.app.get('repositories').partner;
    
    const partner = await partnerRepo.findByUserId(req.user.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner profile not found' });
    }

    const profile = await partnerService.getPartnerProfile(partner.id);
    res.json({ success: true, data: profile });
  })
);

router.put('/profile',
  authenticateToken,
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const partnerService = req.app.get('services').partner;
    const partnerRepo = req.app.get('repositories').partner;
    
    const partner = await partnerRepo.findByUserId(req.user.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner profile not found' });
    }

    const updated = await partnerService.updatePartner(partner.id, req.body);
    res.json({ success: true, data: updated });
  })
);

router.post('/api-key',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const partnerService = req.app.get('services').partner;
    const partnerRepo = req.app.get('repositories').partner;
    
    const partner = await partnerRepo.findByUserId(req.user.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner profile not found' });
    }

    const keys = await partnerService.generateAPIKey(partner.id);
    res.json({ 
      success: true, 
      data: keys,
      message: 'Store the API secret securely. It will not be shown again.'
    });
  })
);

module.exports = router;
