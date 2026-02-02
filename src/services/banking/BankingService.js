const logger = require('../../utils/logger');

class BankingService {
    constructor(repositories) {
        this.userRepo = repositories.user;
        this.walletRepo = repositories.wallet; // This is the old wallet repo, maybe unused?
        this.pool = repositories.user.pool; // Access pool directly for transactions
    }

    /**
     * Generate or Retrieve Virtual Account Details for a User
     */
    async getOrCreateVirtualAccount(userId) {
        try {
            // Check if exists
            const existing = await this.pool.query(
                `SELECT * FROM virtual_accounts WHERE user_id = $1 AND status = 'active'`,
                [userId]
            );

            if (existing.rows.length > 0) {
                return existing.rows[0];
            }

            // Generate new (Mock logic for now, later call Marqeta)
            const accountNumber = '1000' + Math.floor(Math.random() * 9000000000); // 10-14 digits
            const routingNumber = '021000021'; // Chase Mock

            const newAccount = await this.pool.query(
                `INSERT INTO virtual_accounts (user_id, account_number, routing_number, bank_name)
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [userId, accountNumber, routingNumber, 'Atlantic Federal Bank']
            );

            return newAccount.rows[0];

        } catch (error) {
            logger.error('Error creating virtual account', { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Simulate an inbound ACH Direct Deposit (Payroll)
     */
    async simulateDirectDeposit(accountNumber, amount, employerName) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Find Account
            const accountRes = await client.query(
                `SELECT * FROM virtual_accounts WHERE account_number = $1`,
                [accountNumber]
            );

            if (accountRes.rows.length === 0) {
                throw new Error('Invalid Account Number');
            }
            const account = accountRes.rows[0];

            // 2. Credit Wallet Balance
            const balanceRes = await client.query(
                `INSERT INTO wallet_balances (user_id, currency, balance) 
                 VALUES ($1, 'USD', $2)
                 ON CONFLICT (user_id, currency) 
                 DO UPDATE SET balance = wallet_balances.balance + $2
                 RETURNING balance`,
                [account.user_id, amount]
            );

            // 3. Record Transaction
            const txRes = await client.query(
                `INSERT INTO transactions (id, user_id, amount, currency, merchant_name, status, transaction_type, metadata)
                 VALUES (gen_random_uuid(), $1, $2, 'USD', $3, 'completed', 'deposit', $4)
                 RETURNING id`,
                [
                    account.user_id,
                    amount,
                    employerName || 'Payroll Deposit',
                    JSON.stringify({ source: 'ACH', account_number_tail: accountNumber.slice(-4) })
                ]
            );

            await client.query('COMMIT');

            logger.info('Direct Deposit Processed', {
                userId: account.user_id,
                amount,
                newBalance: balanceRes.rows[0].balance
            });

            return {
                success: true,
                transactionId: txRes.rows[0].id,
                newBalance: balanceRes.rows[0].balance
            };

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Direct Deposit Failed', { error: error.message });
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = BankingService;
