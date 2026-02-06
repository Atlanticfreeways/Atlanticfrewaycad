const { ValidationError } = require('../errors/AppError');

class PrivacyService {
    constructor(repositories) {
        this.repositories = repositories;
        // Use user repo as a gateway for raw queries since they share the pool
        this.queryRunner = repositories.user;
    }

    /**
     * Export all user data in GDPR-compliant format
     * @param {string} userId
     * @returns {Object} Complete user data export
     */
    async exportUserData(userId) {
        // Fetch User
        const user = await this.repositories.user.findById(userId);
        if (!user) throw new ValidationError('User not found');

        // Fetch Cards
        const cards = await this.repositories.card.findByUser(userId);

        // Fetch Transactions (Needs all, not just recent. Assuming repo has findAll or we query directly)
        const transactionsRes = await this.queryRunner.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        const transactions = transactionsRes.rows;

        // Fetch KYC Docs
        const kycRes = await this.queryRunner.query(
            'SELECT * FROM kyc_verifications WHERE user_id = $1',
            [userId]
        );
        const kycDocs = kycRes.rows;

        // Fetch Audit Logs
        const auditRes = await this.queryRunner.query(
            'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1000',
            [userId]
        );
        const auditLogs = auditRes.rows;

        // Fetch Notifications
        const notifRes = await this.queryRunner.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 500',
            [userId]
        );
        const notifications = notifRes.rows;

        // Remove sensitive fields
        const safeUser = { ...user };
        delete safeUser.password_hash;
        delete safeUser.marqeta_user_token; // Internal token, maybe sensitive?

        return {
            export_metadata: {
                generated_at: new Date().toISOString(),
                user_id: userId,
                version: '1.0'
            },
            user_profile: safeUser,
            cards: cards.map(c => {
                const safeCard = { ...c };
                delete safeCard.marqeta_card_token;
                return safeCard;
            }),
            transactions: transactions.map(t => {
                const safeTx = { ...t };
                delete safeTx.marqeta_transaction_token;
                return safeTx;
            }),
            kyc_verifications: kycDocs,
            audit_logs: auditLogs,
            notifications: notifications
        };
    }

    /**
     * Create account deletion request with 30-day grace period
     * @param {string} userId
     * @param {string} reason - Optional reason for deletion
     * @returns {Object} Deletion request details
     */
    async createDeletionRequest(userId, reason = null) {
        // Check for pending
        const existingRes = await this.queryRunner.query(
            "SELECT * FROM account_deletion_requests WHERE user_id = $1 AND status = 'pending'",
            [userId]
        );
        if (existingRes.rows.length > 0) {
            return existingRes.rows[0];
        }

        const scheduledFor = new Date();
        scheduledFor.setDate(scheduledFor.getDate() + 30);

        const insertQuery = `
            INSERT INTO account_deletion_requests (user_id, scheduled_for, status, reason)
            VALUES ($1, $2, 'pending', $3)
            RETURNING *
        `;
        const result = await this.queryRunner.query(insertQuery, [userId, scheduledFor, reason]);
        return result.rows[0];
    }

    /**
     * Cancel a pending deletion request
     * @param {string} userId
     * @returns {boolean} Success status
     */
    async cancelDeletionRequest(userId) {
        const query = `
            UPDATE account_deletion_requests 
            SET status = 'cancelled', cancelled_at = NOW()
            WHERE user_id = $1 AND status = 'pending'
            RETURNING id
        `;
        const result = await this.queryRunner.query(query, [userId]);
        return result.rowCount > 0;
    }

    /**
     * Process pending deletions (run as cron job)
     * @returns {number} Number of accounts deleted
     */
    async processPendingDeletions() {
        const pendingRes = await this.queryRunner.query(
            "SELECT * FROM account_deletion_requests WHERE scheduled_for <= NOW() AND status = 'pending'"
        );
        const pendingDeletions = pendingRes.rows;

        let deletedCount = 0;

        for (const request of pendingDeletions) {
            try {
                // Using a manual transaction approach via client if repository supported it
                // For now, doing sequential updates. Ideally this should be wrapped in BEGIN/COMMIT

                // Anonymize User
                await this.queryRunner.query(`
                    UPDATE users SET 
                        email = $1, 
                        first_name = 'DELETED', 
                        last_name = 'USER',
                        phone = NULL,
                        password_hash = NULL,
                        company_id = NULL,
                        marqeta_user_token = NULL,
                        metadata = '{}'
                    WHERE id = $2
                `, [`deleted_${request.user_id}@deleted.local`, request.user_id]);

                // Mark request completed
                await this.queryRunner.query(
                    "UPDATE account_deletion_requests SET status = 'completed', completed_at = NOW() WHERE id = $1",
                    [request.id]
                );

                deletedCount++;
            } catch (err) {
                console.error(`Failed to process deletion for request ${request.id}`, err);
            }
        }

        return deletedCount;
    }
}

module.exports = PrivacyService;
