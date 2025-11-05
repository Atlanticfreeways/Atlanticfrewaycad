const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Authentication routes (no auth required)
router.post('/auth/login', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Transaction history (requires auth)
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await req.sharedService.getTransactionHistory(
      req.user.id,
      req.user.accountType,
      req.query
    );
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics (requires auth)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await req.sharedService.getTransactionAnalytics(
      req.user.id,
      req.user.accountType,
      req.query.period
    );
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marqeta webhooks (no auth required)
router.post('/webhooks/marqeta', async (req, res) => {
  try {
    const result = await req.sharedService.processMarqetaWebhook(req.body);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(200).json({ success: false, error: error.message });
  }
});

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