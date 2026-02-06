const { ValidationError } = require('../utils/errors');

class AnalyticsService {
    constructor({ db }) {
        this.db = db;
    }

    applyDateFilter(query, startDate, endDate) {
        if (startDate) query.where('created_at', '>=', startDate);
        if (endDate) query.where('created_at', '<=', endDate);
        return query;
    }

    /**
     * Spending by Category (Pie Chart)
     */
    async getSpendingByCategory(companyId, { startDate, endDate }) {
        const query = this.db('transactions')
            .select('category')
            .sum('amount as total')
            .count('id as count')
            .where('company_id', companyId)
            .where('status', 'approved')
            .groupBy('category')
            .orderBy('total', 'desc');

        this.applyDateFilter(query, startDate, endDate);

        const results = await query;
        return results.map(r => ({
            name: r.category || 'Uncategorized',
            value: parseFloat(r.total),
            count: parseInt(r.count)
        }));
    }

    /**
     * Spending by Employee (Bar Chart)
     */
    async getSpendingByEmployee(companyId, { startDate, endDate }) {
        // Join users to get names
        const query = this.db('transactions')
            .join('users', 'transactions.user_id', 'users.id')
            .select('users.first_name', 'users.last_name')
            .sum('transactions.amount as total')
            .where('transactions.company_id', companyId)
            .where('transactions.status', 'approved')
            .groupBy('users.id', 'users.first_name', 'users.last_name')
            .orderBy('total', 'desc')
            .limit(10);

        this.applyDateFilter(query, startDate, endDate);

        const results = await query;
        return results.map(r => ({
            name: `${r.first_name} ${r.last_name}`,
            amount: parseFloat(r.total)
        }));
    }

    /**
     * Spending Trends (Line Chart)
     * Groups by Day or Month
     */
    async getSpendingTrends(companyId, { startDate, endDate, interval = 'day' }) {
        // Postgres date_trunc
        const truncType = interval === 'month' ? 'month' : 'day';

        const query = this.db('transactions')
            .select(this.db.raw(`DATE_TRUNC(?, created_at) as date`, [truncType]))
            .sum('amount as total')
            .where('company_id', companyId)
            .where('status', 'approved')
            .groupByOuter('date')
            .orderBy('date', 'asc');

        this.applyDateFilter(query, startDate, endDate);

        const results = await query;
        return results.map(r => ({
            date: r.date.toISOString(),
            amount: parseFloat(r.total)
        }));
    }
}

module.exports = AnalyticsService;
