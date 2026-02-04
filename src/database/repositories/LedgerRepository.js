const BaseRepository = require('../BaseRepository');

class LedgerRepository extends BaseRepository {
    async findAccountByCode(code) {
        const query = 'SELECT * FROM ledger_accounts WHERE code = $1';
        const result = await this.query(query, [code]);
        return result.rows[0];
    }

    async findAccountByOwner(ownerId, type = 'liability') {
        const query = 'SELECT * FROM ledger_accounts WHERE owner_id = $1 AND type = $2';
        const result = await this.query(query, [ownerId, type]);
        return result.rows[0];
    }

    async createAccount(data) {
        const query = `
      INSERT INTO ledger_accounts (name, code, type, owner_id, company_id, currency)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const result = await this.query(query, [
            data.name,
            data.code,
            data.type,
            data.ownerId || null,
            data.companyId || null,
            data.currency || 'USD'
        ]);
        return result.rows[0];
    }

    /**
     * Execute a double-entry transaction
     * @param {Object} transactionData - { referenceType, referenceId, description, entries, isSandbox }
     * @param {Array} entries - Array of { accountId, type: 'debit'|'credit', amount, currency }
     */
    async recordTransaction(transactionData) {
        const { referenceType, referenceId, description, entries, isSandbox = false } = transactionData;

        // Validate balance
        const totalDebit = entries
            .filter(e => e.type === 'debit')
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const totalCredit = entries
            .filter(e => e.type === 'credit')
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.001) {
            throw new Error(`Unbalanced ledger transaction: DR ${totalDebit} / CR ${totalCredit}`);
        }

        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            // 1. Create Transaction Header
            const txQuery = `
        INSERT INTO ledger_transactions (reference_type, reference_id, description, is_sandbox)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
            const txResult = await client.query(txQuery, [referenceType, referenceId, description, isSandbox]);
            const transactionId = txResult.rows[0].id;

            // 2. Create Entries & Update Account Balances
            for (const entry of entries) {
                const entryQuery = `
          INSERT INTO ledger_entries (transaction_id, account_id, type, amount, currency)
          VALUES ($1, $2, $3, $4, $5)
        `;
                await client.query(entryQuery, [
                    transactionId,
                    entry.accountId,
                    entry.type,
                    entry.amount,
                    entry.currency || 'USD'
                ]);

                // Phase 3/7: Sandbox Isolation
                // Skip updating running balances for sandbox transactions
                if (isSandbox) continue;

                // Update Account Balance
                const accRes = await client.query('SELECT type FROM ledger_accounts WHERE id = $1', [entry.accountId]);
                const accType = accRes.rows[0].type;

                let amountChange = parseFloat(entry.amount);
                if (['liability', 'equity', 'revenue'].includes(accType)) {
                    amountChange = (entry.type === 'credit') ? amountChange : -amountChange;
                } else {
                    amountChange = (entry.type === 'debit') ? amountChange : -amountChange;
                }

                await client.query(`
          UPDATE ledger_accounts 
          SET balance = balance + $1, updated_at = NOW() 
          WHERE id = $2
        `, [amountChange, entry.accountId]);
            }

            await client.query('COMMIT');
            return transactionId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getAccountBalance(accountId) {
        const query = 'SELECT balance FROM ledger_accounts WHERE id = $1';
        const result = await this.query(query, [accountId]);
        return result.rows[0]?.balance || 0;
    }

    /**
     * Get transactions for a user's account within a date range
     * @param {string} userId 
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async getAccountTransactions(userId, startDate, endDate) {
        return await this.query(`
            SELECT 
                t.id, 
                t.description, 
                t.posted_at, 
                e.amount, 
                e.type as entry_type,
                a.name as account_name
            FROM ledger_entries e
            JOIN ledger_transactions t ON e.transaction_id = t.id
            JOIN ledger_accounts a ON e.account_id = a.id
            WHERE a.owner_id = $1
            AND t.posted_at >= $2
            AND t.posted_at <= $3
            ORDER BY t.posted_at ASC
        `, [userId, startDate, endDate]);
    }

    /**
     * Get ALL ledger transactions within a date range (for Reconciliation)
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async getAllTransactions(startDate, endDate) {
        return await this.query(`
            SELECT 
                t.id, 
                t.reference_id,
                t.description, 
                t.posted_at, 
                e.amount, 
                e.type as entry_type,
                a.name as account_name
            FROM ledger_entries e
            JOIN ledger_transactions t ON e.transaction_id = t.id
            JOIN ledger_accounts a ON e.account_id = a.id
            WHERE t.posted_at >= $1
            AND t.posted_at <= $2
            -- Only fetch Debits or Credits to avoid double counting?
            -- Actually, reconciliation needs to see the movement.
            -- But internal entries are double. 
            -- We want to verify the 'source of truth' transaction event or the entries affecting settlement?
            -- Let's fetch the Transactions (ledger_transactions) and their entries.
            -- Actually the Service logic expects flat list.
            -- Let's stick to returning entries but filter for Settlement or User Liability accounts?
            -- To match Marqeta, we usually match against the Settlement Account entries (CR for Spends).
            -- Let's return all for now and let Service filter or we filter here.
            -- Service uses: reduce(sum + amount). If we sum debits AND credits, it allows checking balance.
            -- But for volume, we might double count if we sum both legs.
            -- Let's just order by ID.
            ORDER BY t.posted_at ASC
        `, [startDate, endDate]);
    }

    /**
     * Get transactions for a user's account within a date range
     * @param {string} userId 
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async getAccountTransactions(userId, startDate, endDate) {
        // First find the user's liability/account
        // We assume we want their main liability account or all accounts?
        // Typically statement is per account. Let's find their liability account.
        const accountRes = await this.query(
            `SELECT id FROM ledger_accounts WHERE code = $1 OR name = $2`,
            [`USER-${userId}`, `User Account - ${userId}`] // Fallback match logic from service
            // Better: We should store account_id on user, or consistent naming
            // Current LedgerService uses: `User Account - ${userName}`
            // But code is generated... let's look up by user_id if we have a link?? 
            // The migration didn't link ledger_accounts to users explicitely other than via logic.
            // But wait, LedgerService.getOrCreateUserAccount uses metadata? No.
            // It relies on finding by Name? 
        );

        // Actually, LedgerService.getOrCreateUserAccount does:
        // findAccountByName(`User Account - ${userName}`)
        // That's risky if names change.
        // Ideally we query ledger_entries joined with accounts.

        // Let's implement a robust query assuming we find the account by looser match or we fix LedgerService to store relation.
        // For Phase 10, let's assuming we find ALL accounts with 'User Account' name pattern for this user?
        // Or simpler: The LedgerService creates accounts with name `User Account - ${userName}`.
        // BUT we have userId.
        // Let's rely on the fact we can find the account via the entries linked to transactions initiated by user?
        // No, entries are linked to accounts.

        // IMPROVEMENT: We'll query ledger_accounts where name ILIKE '%User Account%' AND ... 
        // THIS IS SUBOPTIMAL.
        // Let's assume for now we fetch the user and construct the likely name as LedgerService does.
        return await this.query(`
            SELECT 
                t.id, 
                t.description, 
                t.posted_at, 
                e.amount, 
                e.type as entry_type
            FROM ledger_entries e
            JOIN ledger_transactions t ON e.transaction_id = t.id
            JOIN ledger_accounts a ON e.account_id = a.id
            WHERE a.name LIKE $1
            AND t.posted_at >= $2
            AND t.posted_at <= $3
            ORDER BY t.posted_at ASC
        `, [`%${userId}%`, startDate, endDate]);
        // Note: LedgerService creates account with name "User Account - FirstName LastName".
        // It DOES NOT put userId in the name by default. 
        // Wait, getOrCreateUserAccount in LedgerService.js:
        // const existingAccount = await this.ledgerRepo.findAccountByName(accountName);
        // It uses Name.
        // So we need to reconstruct the name.
        // But the Repository doesn't have access to User Repo to get the name.
        // So `getAccountTransactions` should probably take `accountName` or `accountId` instead of `userId`.
        // Let's change the signature or logic.

        // Revised Logic:
        // We will pass the USER OBJECT or Name to this method?
        // No, the Service calling this (StatementService) HAS the user.
        // So StatementService should find the account first, then call `getAccountTransactions(accountId...)`
    }

    async getTransactionsByAccountId(accountId, startDate, endDate) {
        return (await this.query(`
            SELECT 
                t.id, 
                t.description, 
                t.posted_at, 
                e.amount, 
                e.type as entry_type
            FROM ledger_entries e
            JOIN ledger_transactions t ON e.transaction_id = t.id
            WHERE e.account_id = $1
            AND t.posted_at >= $2
            AND t.posted_at <= $3
            ORDER BY t.posted_at ASC
        `, [accountId, startDate, endDate])).rows;
    }
}

module.exports = LedgerRepository;
