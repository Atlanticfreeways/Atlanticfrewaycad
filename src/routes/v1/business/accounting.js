const express = require('express');
const { authenticate } = require('../../../middleware/authenticate');
const asyncHandler = require('../../../utils/asyncHandler');
const AccountingService = require('../../../services/AccountingService');
const Joi = require('joi');

const router = express.Router();
router.use(authenticate);

// Mock OAuth callback handling
router.post('/:provider/connect', asyncHandler(async (req, res) => {
    const { provider } = req.params;
    // In real flow, this would handle the code from QB/Xero callback
    // For demo, we accept a mock token payload
    const tokens = {
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000),
        realmId: '123456789'
    };

    const service = new AccountingService({ db: req.repositories.db });
    const integration = await service.connect(req.user.company_id, provider, tokens);

    res.json({ success: true, integration });
}));

router.post('/:provider/sync', asyncHandler(async (req, res) => {
    const service = new AccountingService({ db: req.repositories.db });
    const result = await service.syncTransactions(req.user.company_id, req.params.provider);
    res.json({ success: true, result });
}));

router.get('/:provider/mappings', asyncHandler(async (req, res) => {
    const service = new AccountingService({ db: req.repositories.db });
    const mappings = await service.getMappings(req.user.company_id, req.params.provider);
    res.json({ success: true, mappings });
}));

router.post('/:provider/mappings', asyncHandler(async (req, res) => {
    const service = new AccountingService({ db: req.repositories.db });
    await service.saveMapping(req.user.company_id, req.params.provider, req.body);
    res.json({ success: true });
}));

module.exports = router;
