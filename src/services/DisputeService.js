const { ValidationError, NotFoundError } = require('../errors/AppError');

class DisputeService {
    constructor(repositories, services = {}) {
        this.repo = repositories.db; // Using Knex/raw access
        this.txRepo = repositories.transaction;
        this.audit = services.audit;
        this.email = services.email;
    }

    /**
     * File a new dispute
     */
    async createDispute(userId, data) {
        const { transactionId, reason, description } = data;

        // 1. Verify Transaction
        const tx = await this.txRepo.findById(transactionId);
        if (!tx) throw new NotFoundError('Transaction not found');
        if (tx.user_id !== userId) throw new ValidationError('Unauthorized');

        // 2. Check for existing dispute
        const existing = await this.repo('disputes')
            .where({ transaction_id: transactionId })
            .whereNot({ status: 'lost' }) // Can re-dispute if previously lost? usually no, but let's assume no active disputes
            .first();

        if (existing) throw new ValidationError('Active dispute already exists for this transaction');

        // 3. Create Dispute
        const [dispute] = await this.repo('disputes').insert({
            transaction_id: transactionId,
            user_id: userId,
            amount: tx.amount,
            reason,
            description,
            status: 'opened'
        }).returning('*');

        // 4. Log Event
        await this.logDisputeEvent(dispute.id, 'opened', 'Dispute filed by user');

        // 5. Audit
        if (this.audit) {
            await this.audit.logAction({
                userId,
                action: 'dispute_filed',
                resourceType: 'dispute',
                resourceId: dispute.id,
                metadata: { transactionId, amount: tx.amount }
            });
        }

        // 6. Notify Admin (Mock)
        // await this.email.sendToAdmin(...)

        return dispute;
    }

    /**
     * Get disputes for a user
     */
    async getUserDisputes(userId) {
        return await this.repo('disputes')
            .where({ user_id: userId })
            .orderBy('created_at', 'desc');
    }

    /**
     * Get single dispute details
     */
    async getDispute(disputeId, userId) {
        const dispute = await this.repo('disputes')
            .where({ id: disputeId, user_id: userId })
            .first();

        if (!dispute) throw new NotFoundError('Dispute not found');

        const events = await this.repo('dispute_events')
            .where({ dispute_id: disputeId })
            .orderBy('created_at', 'asc');

        return { ...dispute, timeline: events };
    }

    /**
     * Add evidence (URLs)
     */
    async addEvidence(disputeId, userId, evidenceUrls) {
        const dispute = await this.repo('disputes')
            .where({ id: disputeId, user_id: userId })
            .first();

        if (!dispute) throw new NotFoundError('Dispute not found');
        if (['won', 'lost'].includes(dispute.status)) throw new ValidationError('Cannot add evidence to closed dispute');

        // Append URLs
        const currentEvidence = dispute.evidence_urls || [];
        const newEvidence = [...currentEvidence, ...evidenceUrls];

        await this.repo('disputes')
            .where({ id: disputeId })
            .update({
                evidence_urls: JSON.stringify(newEvidence),
                status: 'evidence_submitted', // Move status forward
                updated_at: new Date()
            });

        await this.logDisputeEvent(disputeId, 'evidence_submitted', `User added ${evidenceUrls.length} files`);

        return this.getDispute(disputeId, userId);
    }

    /**
     * Internal helper to log timeline events
     */
    async logDisputeEvent(disputeId, status, note) {
        await this.repo('dispute_events').insert({
            dispute_id: disputeId,
            status,
            note
        });
    }
}

module.exports = DisputeService;
