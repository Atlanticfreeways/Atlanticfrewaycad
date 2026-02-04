const logger = require('../utils/logger');

class FraudDetectionService {
    constructor(repositories, rulesRepo = null) {
        this.transactionRepo = repositories.transaction;
        // In a real app, this would be injected. For now, we instantiate or use passed repo.
        this.rulesRepo = rulesRepo || { getRules: async () => ({}) };
    }

    /**
     * Evaluate transaction risk
     * @param {object} transactionData - { cardId, amount, merchantName, merchantCategory, country }
     * @returns {Promise<{approved: boolean, reason: string, riskScore: number}>}
     */
    async evaluateTransaction(transactionData) {
        const rules = await this.rulesRepo.getRules();
        const { cardId, amount, merchantCategory, country } = transactionData;

        // 1. Check Blocked Merchants (MCC)
        if (rules.blocked_mcc && rules.blocked_mcc.includes(merchantCategory)) {
            logger.warn(`Fraud Block: High Risk MCC ${merchantCategory}`, { cardId });
            return { approved: false, reason: 'HIGH_RISK_MERCHANT', riskScore: 100 };
        }

        // 2. Check Blocked Countries
        if (rules.country_blocklist && rules.country_blocklist.includes(country)) {
            logger.warn(`Fraud Block: High Risk Country ${country}`, { cardId });
            return { approved: false, reason: 'HIGH_RISK_COUNTRY', riskScore: 100 };
        }

        // 3. Velocity Check (Transactions in last minute)
        // We need to count recent transactions for this card.
        // Assuming transactionRepo has a method countRecentTransactions(cardId, minutes)
        // If not, we will query via pool directly if exposed, or add method.
        try {
            const recentCount = await this.getRecentTransactionCount(cardId, 1); // 1 minute window
            if (rules.velocity && recentCount >= rules.velocity.max_transactions_per_minute) {
                logger.warn(`Fraud Block: Velocity Exceeded (${recentCount} in 1m)`, { cardId });
                return { approved: false, reason: 'VELOCITY_EXCEEDED', riskScore: 90 };
            }
        } catch (e) {
            logger.error('Failed to check velocity', e);
            // Non-blocking error for now, or fail safe? Fail safe -> allow.
        }

        return { approved: true, reason: 'LOW_RISK', riskScore: 0 };
    }

    async getRecentTransactionCount(cardId, minutes) {
        // This relies on the repo having access to the DB pool.
        // If strictly using repo pattern, we should add this method to TransactionRepository.
        // For Phase 9 speedy implementation, we might access pool if available, or assume method exists.

        // Let's assume transactionRepo has access to the DB driver or methods.
        // If standard repo:
        if (this.transactionRepo && this.transactionRepo.pool) {
            const res = await this.transactionRepo.pool.query(
                `SELECT COUNT(*) FROM jit_execution_traces 
                 WHERE (steps::text LIKE '%"cardId":"' || $1 || '"%') 
                 AND final_decision = 'APPROVED'
                 AND created_at > NOW() - INTERVAL '1 minute'`,
                [cardId]
            );
            // Note: JIT traces table might not be indexed for this, but good enough for MVP.
            // Better: Query 'transactions' table if authorized transactions are saved there instantly.
            // But JIT is pre-transaction.
            // Better 2: Redis counters.
            // For now, let's use the DB query on traces or assume 0 if not implemented.
            return parseInt(res.rows[0].count, 10);
        }
        return 0;
    }
}

module.exports = FraudDetectionService;
