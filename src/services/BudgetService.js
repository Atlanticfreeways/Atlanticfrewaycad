const { ValidationError, NotFoundError } = require('../utils/errors');

class BudgetService {
    constructor({ db, notificationService }) {
        this.db = db;
        this.notifications = notificationService;
    }

    // ... (createBudget remains same)

    /**
     * Check if budget thresholds are crossed and notify
     * Call this after transactions are processed or via periodic job
     */
    async checkAndNotify(budget) {
        if (!this.notifications) return;

        const spent = await this.calculateUsage(budget);
        const percent = (spent / budget.amount) * 100;

        // Define Thresholds (Defaults if not set)
        const thresholds = [50, 75, 80, 90, 100];
        const history = budget.alert_history || {};

        for (const t of thresholds) {
            // If crossed AND not yet alerted for this threshold
            if (percent >= t && !history[t]) {
                // Determine if we should alert based on user preference (budget.alert_threshold_percent)
                // We only alert if it's >= the user's setting OR it's 100%
                const userThreshold = budget.alert_threshold_percent || 80;

                if (t >= userThreshold || t === 100) {
                    await this.notifications.sendBudgetAlert(budget, percent, spent);

                    // Mark as sent
                    history[t] = new Date().toISOString();
                }
            }
        }

        // Update history in DB if changed
        // Simple optimization: only update if history keys changed
        if (JSON.stringify(history) !== JSON.stringify(budget.alert_history)) {
            await this.db('budgets')
                .where({ id: budget.id })
                .update({ alert_history: history });
        }
    }

    async createBudget(companyId, data) {
        const { name, scopeType, scopeValue, amount, period, startDate } = data;

        const [budget] = await this.db('budgets').insert({
            company_id: companyId,
            name,
            scope_type: scopeType,
            scope_value: scopeValue,
            amount,
            period,
            start_date: startDate
        }).returning('*');

        return budget;
    }

    /**
     * Get budgets with real-time usage calculation
     */
    async getBudgetsWithUsage(companyId) {
        const budgets = await this.db('budgets')
            .where({ company_id: companyId })
            .orderBy('created_at', 'desc');

        // Enhance with usage data
        // For MVP, we calculate on read. For scale, we'd use a materialized view or redis cache.
        const enhancedBudgets = await Promise.all(budgets.map(async (b) => {
            const usage = await this.calculateUsage(b);
            return {
                ...b,
                spent: usage,
                remaining: b.amount - usage,
                percent: (usage / b.amount) * 100
            };
        }));

        return enhancedBudgets;
    }

    /**
     * Calculate spent amount for a budget based on transactions
     */
    async calculateUsage(budget) {
        let query = this.db('transactions')
            .sum('amount as total')
            .where('company_id', budget.company_id)
            .where('status', 'approved')
            .where('created_at', '>=', budget.start_date);

        if (budget.end_date) {
            query.where('created_at', '<=', budget.end_date);
        } else if (budget.period === 'monthly') {
            // Basic implementation: Current Month
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            query.where('created_at', '>=', firstDay);
        }

        // Scope filter
        if (budget.scope_type === 'category') {
            query.where('category', budget.scope_value); // Exact match
        } else if (budget.scope_type === 'team') {
            // Join users to filter by team (Mock logic)
            // query.join('users', ...).where('users.team', budget.scope_value)
        }

        const result = await query.first();
        return parseFloat(result.total || 0);
    }
}

module.exports = BudgetService;
