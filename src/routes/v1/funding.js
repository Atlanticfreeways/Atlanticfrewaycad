const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const asyncHandler = require('../../utils/asyncHandler');
const FundingService = require('../../services/FundingService');

const router = express.Router();

router.use(authenticate);

// POST /api/v1/funding/connect/start
// Body: { countryCode: 'US' }
router.post('/connect/start', asyncHandler(async (req, res) => {
    const fundingService = new FundingService(req.repositories);
    const result = await fundingService.initiateConnection(req.user, req.body.countryCode);
    res.json({ success: true, data: result });
}));

// POST /api/v1/funding/connect/complete
// Body: { provider: 'plaid', token: 'public-token' }
router.post('/connect/complete', asyncHandler(async (req, res) => {
    const fundingService = new FundingService(req.repositories);
    const result = await fundingService.completeConnection(req.user, req.body.provider, req.body);
    res.json({ success: true, data: result });
}));

// GET /api/v1/funding/status
router.get('/status', asyncHandler(async (req, res) => {
    const fundingService = new FundingService(req.repositories);
    const accounts = await fundingService.getLinkedAccounts(req.user.id);
    res.json({ success: true, accounts });
}));

module.exports = router;
