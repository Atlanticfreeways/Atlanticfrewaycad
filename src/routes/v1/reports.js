const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authenticateApiKey, apiKeyRateLimit } = require('../../middleware/apiKeyAuth');
const asyncHandler = require('../../utils/asyncHandler');
const Joi = require('joi');

const router = express.Router();

// Apply API key authentication first, then fall back to JWT
router.use(authenticateApiKey);
router.use(apiKeyRateLimit);
router.use(authenticate);

/**
 * GET /api/v1/reports/spending
 * Get spending analytics for the authenticated user
 */
const spendingQuerySchema = Joi.object({
    range: Joi.string().valid('7d', '30d', '90d', '1y', 'all').default('30d'),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
});

router.get('/spending', asyncHandler(async (req, res) => {
    const { error, value } = spendingQuerySchema.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message,
        });
    }

    const { range, start_date, end_date } = value;

    // Calculate date range
    let startDate, endDate = new Date();

    if (start_date && end_date) {
        startDate = new Date(start_date);
        endDate = new Date(end_date);
    } else {
        switch (range) {
            case '7d':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 90);
                break;
            case '1y':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case 'all':
                startDate = new Date('2020-01-01'); // Beginning of time
                break;
            default:
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
        }
    }

    // Get user's cards
    const cards = await req.repositories.db('cards')
        .where({ user_id: req.user.id })
        .select('id');

    const cardIds = cards.map(c => c.id);

    if (cardIds.length === 0) {
        return res.json({
            success: true,
            data: {
                total_spending: 0,
                total_transactions: 0,
                average_transaction: 0,
                active_days: 0,
                spending_trend: [],
                category_breakdown: [],
                transaction_volume: [],
                top_merchants: [],
            },
        });
    }

    // Total spending
    const totalResult = await req.repositories.db('transactions')
        .whereIn('card_id', cardIds)
        .whereBetween('created_at', [startDate, endDate])
        .where('status', 'approved')
        .sum('amount as total')
        .count('* as count')
        .first();

    const total_spending = parseFloat(totalResult.total) || 0;
    const total_transactions = parseInt(totalResult.count) || 0;
    const average_transaction = total_transactions > 0 ? total_spending / total_transactions : 0;

    // Active days (days with at least one transaction)
    const activeDaysResult = await req.repositories.db('transactions')
        .whereIn('card_id', cardIds)
        .whereBetween('created_at', [startDate, endDate])
        .where('status', 'approved')
        .select(req.repositories.db.raw('COUNT(DISTINCT DATE(created_at)) as active_days'))
        .first();

    const active_days = parseInt(activeDaysResult.active_days) || 0;

    // Spending trend (daily aggregation)
    const spendingTrend = await req.repositories.db('transactions')
        .whereIn('card_id', cardIds)
        .whereBetween('created_at', [startDate, endDate])
        .where('status', 'approved')
        .select(
            req.repositories.db.raw('DATE(created_at) as date'),
            req.repositories.db.raw('SUM(amount) as amount')
        )
        .groupByRaw('DATE(created_at)')
        .orderBy('date', 'asc');

    // Category breakdown (by MCC - Merchant Category Code)
    const categoryBreakdown = await req.repositories.db('transactions')
        .whereIn('card_id', cardIds)
        .whereBetween('created_at', [startDate, endDate])
        .where('status', 'approved')
        .select('mcc_description as category')
        .sum('amount as amount')
        .count('* as count')
        .groupBy('mcc_description')
        .orderBy('amount', 'desc')
        .limit(10);

    // Transaction volume (count by day)
    const transactionVolume = await req.repositories.db('transactions')
        .whereIn('card_id', cardIds)
        .whereBetween('created_at', [startDate, endDate])
        .where('status', 'approved')
        .select(
            req.repositories.db.raw('DATE(created_at) as date'),
            req.repositories.db.raw('COUNT(*) as count')
        )
        .groupByRaw('DATE(created_at)')
        .orderBy('date', 'asc');

    // Top merchants
    const topMerchants = await req.repositories.db('transactions')
        .whereIn('card_id', cardIds)
        .whereBetween('created_at', [startDate, endDate])
        .where('status', 'approved')
        .select('merchant_name as merchant')
        .sum('amount as amount')
        .count('* as count')
        .groupBy('merchant_name')
        .orderBy('amount', 'desc')
        .limit(10);

    res.json({
        success: true,
        data: {
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                range,
            },
            summary: {
                total_spending,
                total_transactions,
                average_transaction,
                active_days,
            },
            spending_trend: spendingTrend.map(row => ({
                date: row.date,
                amount: parseFloat(row.amount),
            })),
            category_breakdown: categoryBreakdown.map(row => ({
                category: row.category || 'Other',
                amount: parseFloat(row.amount),
                count: parseInt(row.count),
                percentage: total_spending > 0 ? (parseFloat(row.amount) / total_spending) * 100 : 0,
            })),
            transaction_volume: transactionVolume.map(row => ({
                date: row.date,
                count: parseInt(row.count),
            })),
            top_merchants: topMerchants.map(row => ({
                merchant: row.merchant || 'Unknown',
                amount: parseFloat(row.amount),
                count: parseInt(row.count),
            })),
        },
    });
}));

// ... existing code ...

const AnalyticsService = require('../../services/AnalyticsService');

/**
 * Business Analytics Routes
 */

router.get('/business/spending-by-category', asyncHandler(async (req, res) => {
    // Permission check: ensure user is admin/finance
    // const { error } = validateRole(req.user, ['admin', 'manager']);

    const service = new AnalyticsService({ db: req.repositories.db });
    const data = await service.getSpendingByCategory(req.user.company_id, req.query);
    res.json({ success: true, data });
}));

router.get('/business/spending-by-employee', asyncHandler(async (req, res) => {
    const service = new AnalyticsService({ db: req.repositories.db });
    const data = await service.getSpendingByEmployee(req.user.company_id, req.query);
    res.json({ success: true, data });
}));

router.get('/business/spending-trends', asyncHandler(async (req, res) => {
    const service = new AnalyticsService({ db: req.repositories.db });
    const data = await service.getSpendingTrends(req.user.company_id, req.query);
    res.json({ success: true, data });
}));

module.exports = router;
