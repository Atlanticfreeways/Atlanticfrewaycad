const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ReconciliationService {
    constructor(repositories) {
        this.transactionRepo = repositories.transaction;
        this.pool = repositories.user.pool; // Direct pool access for transaction control
    }

    /**
     * Process a Daily Settlement Report
     * @param {string} date - YYYY-MM-DD
     * @param {Array} settlementRows - Array of { token: string, amount: number, currency: string }
     */
    async reconcileDailySettlement(date, settlementRows) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            logger.info(`Starting reconciliation for ${date} with ${settlementRows.length} records`);

            // 1. Create Settlement Record
            const totalAmount = settlementRows.reduce((sum, row) => sum + Math.abs(row.amount), 0);

            const settlementRes = await client.query(
                `INSERT INTO settlements (settlement_date, total_amount_settled, total_transactions_count, status)
                 VALUES ($1, $2, $3, 'PROCESSING')
                 ON CONFLICT (settlement_date) DO UPDATE 
                 SET total_amount_settled = $2, total_transactions_count = $3, status = 'PROCESSING', updated_at = NOW()
                 RETURNING id`,
                [date, totalAmount, settlementRows.length]
            );
            const settlementId = settlementRes.rows[0].id;

            let discrepanciesCount = 0;

            // 2. Iterate and Match
            for (const row of settlementRows) {
                const { token, amount } = row; // amount is settled amount (usually negative for spend)
                const absAmount = Math.abs(amount);

                // Find in Ledger
                const ledgerRes = await client.query(
                    `SELECT id, amount, status FROM transactions WHERE marqeta_transaction_token = $1`,
                    [token]
                );

                if (ledgerRes.rows.length === 0) {
                    // MISSING IN LEDGER
                    await this.logDiscrepancy(client, settlementId, null, token, absAmount, 0, 'MISSING_IN_LEDGER');
                    discrepanciesCount++;
                    continue;
                }

                const tx = ledgerRes.rows[0];
                const ledgerAmount = parseFloat(tx.amount); // stored as positive usually? depends on schema. Assuming positive for spend.

                // Floating point comparison safe-guard
                if (Math.abs(ledgerAmount - absAmount) > 0.01) {
                    // AMOUNT MISMATCH
                    await this.logDiscrepancy(client, settlementId, tx.id, token, absAmount, ledgerAmount, 'AMOUNT_MISMATCH');
                    discrepanciesCount++;
                }
            }

            // 3. Finalize Status
            const finalStatus = discrepanciesCount > 0 ? 'DISCREPANCY' : 'MATCHED';
            await client.query(
                `UPDATE settlements SET status = $1 WHERE id = $2`,
                [finalStatus, settlementId]
            );

            await client.query('COMMIT');
            logger.info(`Reconciliation completed for ${date}. Status: ${finalStatus}`);

            return {
                settlementId,
                date,
                status: finalStatus,
                discrepancies: discrepanciesCount
            };

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Reconciliation failed', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async logDiscrepancy(client, settlementId, txId, token, marqetaAmt, ledgerAmt, reason) {
        await client.query(
            `INSERT INTO settlement_discrepancies (settlement_id, transaction_id, marqeta_token, marqeta_amount, ledger_amount, reason)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [settlementId, txId, token, marqetaAmt, ledgerAmt, reason]
        );
    }
}

module.exports = ReconciliationService;
