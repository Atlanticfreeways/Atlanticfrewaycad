const { ValidationError } = require('../errors/AppError');

class PrivacyService {
    constructor(repositories) {
        this.repositories = repositories;
    }

    /**
     * Export all user data in GDPR-compliant format
     * @param {string} userId
     * @returns {Object} Complete user data export
     */
    async exportUserData(userId) {
        const db = this.repositories.db;

        // Fetch all user data in parallel
        const [user, cards, transactions, kycDocs, auditLogs, notifications] = await Promise.all([
            db('users').where({ id: userId }).first(),
            db('cards').where({ user_id: userId }).select('*'),
            db('transactions').where({ user_id: userId }).select('*'),
            db('kyc_verifications').where({ user_id: userId }).select('*'),
            db('audit_logs').where({ user_id: userId }).orderBy('created_at', 'desc').limit(1000),
            db('notifications').where({ user_id: userId }).orderBy('created_at', 'desc').limit(500)
        ]);

        if (!user) {
            throw new ValidationError('User not found');
        }

        // Remove sensitive fields
        delete user.password_hash;

        return {
            export_metadata: {
                generated_at: new Date().toISOString(),
                user_id: userId,
                version: '1.0'
            },
            user_profile: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                bio: user.bio,
                company: user.company,
                address: user.address,
                account_type: user.account_type,
                kyc_tier: user.kyc_tier,
                kyc_verified_at: user.kyc_verified_at,
                monthly_limit: user.monthly_limit,
                monthly_spent: user.monthly_spent,
                virtual_account_number: user.virtual_account_number,
                created_at: user.created_at,
                last_login_at: user.last_login_at,
                preferences: user.preferences
            },
            cards: cards.map(c => ({
                id: c.id,
                type: c.type,
                status: c.status,
                network: c.network,
                last_four: c.last_four,
                expiry_month: c.expiry_month,
                expiry_year: c.expiry_year,
                created_at: c.created_at
            })),
            transactions: transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                currency: t.currency,
                merchant_name: t.merchant_name,
                mcc: t.mcc,
                status: t.status,
                created_at: t.created_at
            })),
            kyc_verifications: kycDocs.map(k => ({
                id: k.id,
                tier: k.tier,
                status: k.status,
                verified_at: k.verified_at,
                submitted_at: k.created_at
            })),
            audit_logs: auditLogs.map(a => ({
                action: a.action,
                resource_type: a.resource_type,
                ip_address: a.ip_address,
                timestamp: a.created_at
            })),
            notifications: notifications.map(n => ({
                type: n.type,
                title: n.title,
                message: n.message,
                read_at: n.read_at,
                created_at: n.created_at
            }))
        };
    }

    /**
     * Create account deletion request with 30-day grace period
     * @param {string} userId
     * @param {string} reason - Optional reason for deletion
     * @returns {Object} Deletion request details
     */
    async createDeletionRequest(userId, reason = null) {
        const db = this.repositories.db;

        // Check if there's already a pending request
        const existing = await db('account_deletion_requests')
            .where({ user_id: userId, status: 'pending' })
            .first();

        if (existing) {
            return existing;
        }

        // Schedule deletion 30 days from now
        const scheduledFor = new Date();
        scheduledFor.setDate(scheduledFor.getDate() + 30);

        const [request] = await db('account_deletion_requests')
            .insert({
                user_id: userId,
                scheduled_for: scheduledFor,
                status: 'pending',
                reason
            })
            .returning('*');

        return request;
    }

    /**
     * Cancel a pending deletion request
     * @param {string} userId
     * @returns {boolean} Success status
     */
    async cancelDeletionRequest(userId) {
        const db = this.repositories.db;

        const result = await db('account_deletion_requests')
            .where({ user_id: userId, status: 'pending' })
            .update({
                status: 'cancelled',
                cancelled_at: new Date()
            });

        return result > 0;
    }

    /**
     * Process pending deletions (run as cron job)
     * @returns {number} Number of accounts deleted
     */
    async processPendingDeletions() {
        const db = this.repositories.db;

        const pendingDeletions = await db('account_deletion_requests')
            .where('scheduled_for', '<=', new Date())
            .where('status', 'pending')
            .select('*');

        let deletedCount = 0;

        for (const request of pendingDeletions) {
            await db.transaction(async (trx) => {
                // Anonymize user data instead of hard delete (for audit trail)
                await trx('users')
                    .where({ id: request.user_id })
                    .update({
                        email: `deleted_${request.user_id}@deleted.local`,
                        full_name: 'DELETED USER',
                        phone: null,
                        bio: null,
                        company: null,
                        address: null,
                        password_hash: null,
                        preferences: null
                    });

                // Mark deletion as completed
                await trx('account_deletion_requests')
                    .where({ id: request.id })
                    .update({
                        status: 'completed',
                        completed_at: new Date()
                    });

                deletedCount++;
            });
        }

        return deletedCount;
    }
}

module.exports = PrivacyService;
