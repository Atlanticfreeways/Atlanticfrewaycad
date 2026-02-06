const { ValidationError, NotFoundError } = require('../utils/errors');

class ApprovalService {
    constructor({ db, auditLogger }) {
        this.db = db;
        this.audit = auditLogger;
    }

    /**
     * Create a new approval policy/rule
     */
    async createRule(companyId, data) {
        const { name, minAmount, requiredRole } = data;

        if (!name || !minAmount || !requiredRole) {
            throw new ValidationError('Missing required rule fields');
        }

        const [rule] = await this.db('approval_rules').insert({
            company_id: companyId,
            name,
            min_amount: minAmount,
            required_role: requiredRole
        }).returning('*');

        return rule;
    }

    /**
     * Submit a new request for approval
     */
    async createRequest(userId, companyId, data) {
        const { requestType, amount, reason } = data;

        // 1. Find applicable rule (Simple logic: Find rule with highest min_amount that matches this request)
        // In a real system, this might be more complex engine
        const rule = await this.db('approval_rules')
            .where('company_id', companyId)
            .where('is_active', true)
            .where('min_amount', '<=', amount)
            .orderBy('min_amount', 'desc')
            .first();

        const [request] = await this.db('approval_requests').insert({
            company_id: companyId,
            requester_id: userId,
            request_type: requestType,
            amount: amount,
            reason: reason,
            applied_rule_id: rule ? rule.id : null,
            status: 'pending' // Always pending initially
        }).returning('*');

        // Log creation
        /*
        await this.audit.log({
            event: 'approval_request_created',
            userId,
            meta: { requestId: request.id }
        });
        */

        return request;
    }

    /**
     * Approve a pending request
     */
    async approveRequest(requestId, approverId, note = '') {
        const request = await this.db('approval_requests').where({ id: requestId }).first();
        if (!request) throw new NotFoundError('Request not found');

        if (request.status !== 'pending') {
            throw new ValidationError('Request is not pending');
        }

        // TODO: Verify approver has the role required by request.applied_rule_id
        // For now, assuming middleware checked 'admin' or 'approver' permission

        await this.db.transaction(async (trx) => {
            // 1. Update status
            await trx('approval_requests')
                .where({ id: requestId })
                .update({
                    status: 'approved',
                    updated_at: new Date()
                });

            // 2. Log action
            await trx('approval_logs').insert({
                request_id: requestId,
                actor_id: approverId,
                action: 'approve',
                note: note
            });

            // 3. Execute side-effects? 
            // e.g. If 'new_card', actually issue the card now?
            // e.g. If 'limit_increase', update card limits?
            // This is usually handled by the caller or an event listener.
        });

        return { success: true };
    }

    /**
     * Reject a request
     */
    async rejectRequest(requestId, approverId, note = '') {
        const request = await this.db('approval_requests').where({ id: requestId }).first();
        if (!request) throw new NotFoundError('Request not found');

        await this.db.transaction(async (trx) => {
            await trx('approval_requests')
                .where({ id: requestId })
                .update({
                    status: 'rejected',
                    updated_at: new Date()
                });

            await trx('approval_logs').insert({
                request_id: requestId,
                actor_id: approverId,
                action: 'reject',
                note: note
            });
        });

        return { success: true };
    }

    async getHistory(companyId, filters = {}) {
        return this.db('approval_requests')
            .where({ company_id: companyId })
            .modify(q => {
                if (filters.status) q.where('status', filters.status);
                if (filters.requesterId) q.where('requester_id', filters.requesterId);
            })
            .orderBy('created_at', 'desc');
    }
}

module.exports = ApprovalService;
