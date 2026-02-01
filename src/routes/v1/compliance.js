const express = require('express');
const router = express.Router();
const ComplianceService = require('../../services/ComplianceService');
const dbConnection = require('../../database/connection');
const { authenticate, authorize } = require('../../middleware/authenticate');

// Initialize service (lazy init pattern)
const complianceService = new ComplianceService(dbConnection.getPostgres());

/**
 * GET /api/v1/compliance/reports/conversions
 * Exports a CSV of currency conversions.
 * Requires 'admin' role.
 */
router.get('/reports/conversions', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to last 30 days if not specified
        const end = endDate || new Date().toISOString();
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        res.header('Content-Type', 'text/csv');
        res.attachment(`conversions_report_${Date.now()}.csv`);

        const stream = await complianceService.generateConversionReportStream(start, end);

        // Handle stream errors
        stream.on('error', (err) => {
            logger.error('CSV Stream error', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed' });
            }
        });

        return stream.pipe(res);

    } catch (error) {
        logger.error('Failed to generate report', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate report' });
        }
    }
});

module.exports = router;
