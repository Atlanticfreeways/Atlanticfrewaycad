const express = require('express');
const { authenticate, authorize } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const KYCService = require('../services/KYCService');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

router.post('/verify', async (req, res, next) => {
  try {
    const { tier, documents } = req.body;
    const kycService = new KYCService(req.repositories);
    const verification = await kycService.submitVerification(req.user.id, tier, documents);
    res.status(201).json({ success: true, verification });
  } catch (error) {
    next(error);
  }
});

router.get('/status', async (req, res, next) => {
  try {
    const query = 'SELECT * FROM kyc_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await req.repositories.user.query(query, [req.user.id]);
    res.json({ success: true, verification: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/limits', async (req, res, next) => {
  try {
    const user = await req.repositories.user.findById(req.user.id);
    const kycService = new KYCService(req.repositories);
    const limits = kycService.getTierLimits(user.kyc_tier);
    res.json({ 
      success: true, 
      tier: user.kyc_tier,
      limits,
      spent: user.monthly_spent,
      remaining: user.monthly_limit - user.monthly_spent
    });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/approve/:id', authorize('admin'), async (req, res, next) => {
  try {
    const kycService = new KYCService(req.repositories);
    const verification = await kycService.approveVerification(req.params.id, req.user.id);
    res.json({ success: true, verification });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
