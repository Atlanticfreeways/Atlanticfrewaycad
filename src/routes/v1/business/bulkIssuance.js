const express = require('express');
const router = express.Router();
const multer = require('multer');
const BulkIssuanceService = require('../../../services/BulkIssuanceService');
const authMiddleware = require('../../../middleware/auth');
const logger = require('../../../utils/logger');

// Configure upload (memory storage for parsing)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const { requireRole, ROLES } = require('../../../middleware/rbac');

// POST /api/v1/business/bulk-issue
// Upload a CSV file to issue cards to multiple employees
// Roles: Admin (Platform) or Business Admin (Company Owner)
router.post('/bulk-issue', authMiddleware, requireRole([ROLES.BUSINESS_ADMIN, 'business_manager']), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file provided' });
        }

        const bulkService = new BulkIssuanceService(req.repositories, req.services);

        // Pass the buffer and the admin's company ID (if applicable)
        // For this demo, we assume the admin belongs to the target company
        const companyId = req.user.company_id || 'default_company_id'; // Fallback for test

        const report = await bulkService.processBulkFile(req.file.buffer, companyId);

        res.json({
            message: 'Bulk issuance processed',
            report: report
        });

    } catch (error) {
        logger.error('Bulk issuance API error', { error: error.message });
        res.status(500).json({ error: 'Internal processing error' });
    }
});

module.exports = router;
