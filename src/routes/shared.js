const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { authenticateApiKey, apiKeyRateLimit } = require('../middleware/apiKeyAuth');
const asyncHandler = require('../utils/asyncHandler');
const { csrfProtection } = require('../middleware/csrfProtection');

const router = express.Router();

// Authentication routes (no auth required)
router.post('/auth/login', csrfProtection, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await req.sharedService.authenticateUser(email, password);

  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { userId: user.id, email: user.email, accountType: user.accountType },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accountType: user.accountType,
      role: user.role
    },
    token
  });
}));

// Transaction history (requires auth - supports both JWT and API key)
router.get('/transactions', authenticateApiKey, apiKeyRateLimit, authenticateToken, asyncHandler(async (req, res) => {
  const transactions = await req.sharedService.getTransactionHistory(
    req.user.id,
    req.user.accountType,
    req.query
  );
  res.json({ success: true, transactions });
}));

// Analytics (requires auth - supports both JWT and API key)
router.get('/analytics', authenticateApiKey, apiKeyRateLimit, authenticateToken, asyncHandler(async (req, res) => {
  const analytics = await req.sharedService.getTransactionAnalytics(
    req.user.id,
    req.user.accountType,
    req.query.period
  );
  res.json({ success: true, analytics });
}));

// Marqeta webhooks (no auth required - uses signature verification)
const verifyMarqetaSignature = require('../middleware/marqetaWebhook');
router.post('/webhooks/marqeta', verifyMarqetaSignature, asyncHandler(async (req, res) => {
  const result = await req.sharedService.processMarqetaWebhook(req.body);
  res.json({ success: true, result });
}));

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      business: 'active',
      personal: 'active',
      shared: 'active'
    }
  });
});

module.exports = router;