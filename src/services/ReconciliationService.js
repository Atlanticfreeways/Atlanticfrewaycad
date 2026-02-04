const logger = require('../utils/logger');
const crypto = require('crypto');

class ReconciliationService {
    constructor(repositories, services, marqetaAdapter = null) {
        this.reconRepo = repositories.reconciliation;
        this.ledgerRepo = repositories.ledger;
        this.notification = services.notification;
        // In real app, we use MarqetaAdapter to fetch settlement reports
        // For simulation, we will use a mock provider if not passed
        this.marqeta = marqetaAdapter || {
            fetchDailyTransactions: async (date) => {
                // Mock: Return empty for now, or simulate data
                return [];
            }
        };
    }

    /**
     * Run daily reconciliation
     * @param {Date} date - The date to reconcile (usually T-1)
     */
    async reconcileDaily(date) {
        const dateStr = date.toISOString().split('T')[0];
        logger.info(`Starting Reconciliation for ${dateStr}`);

        try {
            // 1. Fetch Internal Ledger Transactions for Date
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            // We need a method in LedgerRepo to get ALL transactions for a date range
            // Currently we have per-user. We'll add `getAllTransactions(start, end)` or use raw query.
            const internalTransactions = await this.ledgerRepo.getAllTransactions(startDate, endDate);

            // 2. Fetch External (Marqeta) Transactions
            const externalTransactions = await this.marqeta.fetchDailyTransactions(date);

            // 3. Compare
            const discrepancies = this.findDiscrepancies(internalTransactions, externalTransactions);

            // 4. Determine Status
            const status = discrepancies.length > 0 ? 'discrepancy_found' : 'matched';
            const totalVolume = internalTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

            // 5. Save Report
            const report = await this.reconRepo.createReport({
                date: dateStr,
                status,
                discrepancies,
                processed_count: internalTransactions.length,
                total_volume: totalVolume
            });

            logger.info(`Reconciliation Completed for ${dateStr}. Status: ${status}`);

            // 6. Alert if Discrepancy
            if (status === 'discrepancy_found') {
                this.alertAdmin(report);
            }

            return report;

        } catch (err) {
            logger.error('Reconciliation Failed', err);
            // Log failed report
            await this.reconRepo.createReport({
                date: dateStr,
                status: 'error',
                discrepancies: [{ error: err.message }]
            });
            throw err;
        }
    }

    findDiscrepancies(internal, external) {
        const issues = [];
        const externalMap = new Map(external.map(t => [t.referenceId, t])); // Assume Marqeta returns refId we sent

        // Check 1: Internal exists, External missing?
        for (const tx of internal) {
            // Internal ledger usually tracks `reference_id` which maps to Marqeta Token match
            // We assume ledger_transactions.reference_id IS the Marqeta Token for simple matching
            if (!tx.reference_id) continue; // Skip internal-only transfers?

            const extTx = externalMap.get(tx.reference_id);
            if (!extTx) {
                issues.push({
                    type: 'MISSING_IN_MARQETA',
                    internal_id: tx.id,
                    reference_id: tx.reference_id,
                    amount: tx.amount
                });
                continue;
            }

            // Check 2: Amount Mismatch
            if (Math.abs(parseFloat(tx.amount) - parseFloat(extTx.amount)) > 0.01) {
                issues.push({
                    type: 'AMOUNT_MISMATCH',
                    internal_id: tx.id,
                    reference_id: tx.reference_id,
                    internal_amount: tx.amount,
                    external_amount: extTx.amount
                });
            }
        }

        // Check 3: External exists, Internal missing? (Unaccounted spend)
        const internalRefMap = new Set(internal.map(t => t.reference_id));
        for (const extTx of external) {
            if (!internalRefMap.has(extTx.referenceId)) {
                issues.push({
                    type: 'MISSING_IN_LEDGER',
                    reference_id: extTx.referenceId,
                    amount: extTx.amount
                });
            }
        }

        return issues;
    }

    alertAdmin(report) {
        if (this.notification) {
            // We might broadcast to an admin room or email
            // For now, reuse notification service to "admin_channel" or log high severity
            this.notification.broadcast('admin_alert', {
                title: 'Reconciliation Discrepancy Detected',
                date: report.date,
                issues: report.discrepancies.length
            });
        }
    }
}

module.exports = ReconciliationService;
