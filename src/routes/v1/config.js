const express = require('express');
const router = express.Router();
const assets = require('../../config/assets');

/**
 * GET /api/v1/config/assets
 * Returns the list of supported fiat and crypto assets.
 */
router.get('/assets', (req, res) => {
    res.json({
        fiat: assets.fiat,
        crypto: assets.crypto,
        all: [...assets.fiat, ...assets.crypto]
    });
});

module.exports = router;
