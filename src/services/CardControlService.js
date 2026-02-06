const { ValidationError, NotFoundError } = require('../errors/AppError');

class CardControlService {
    constructor(repositories, services = {}) {
        this.db = repositories.db; // Access to Knex/pg wrapper
        this.audit = services.audit;
    }

    // --- Merchant Controls ---

    async addMerchantControl(userId, cardId, data) {
        // 1. Validate ownership
        await this.validateCardOwnership(userId, cardId);

        const { controlType, merchantName, mcc, categoryGroup } = data;
        if (!merchantName && !mcc && !categoryGroup) {
            throw new ValidationError('Must specify merchantName, MCC, or Category Group');
        }

        // 2. Insert rule
        const [rule] = await this.db('card_merchant_controls').insert({
            card_id: cardId,
            control_type: controlType,
            merchant_name: merchantName,
            mcc: mcc,
            category_group: categoryGroup
        }).returning('*');

        // 3. Audit
        if (this.audit) {
            await this.audit.logAction({
                userId,
                action: 'card_control_merchant_add',
                resourceType: 'card',
                resourceId: cardId,
                metadata: { ruleId: rule.id, ...data }
            });
        }

        return rule;
    }

    async getMerchantControls(userId, cardId) {
        await this.validateCardOwnership(userId, cardId);
        return await this.db('card_merchant_controls').where({ card_id: cardId });
    }

    async deleteMerchantControl(userId, controlId) {
        // Verify rule belongs to a card owned by user
        const rule = await this.db('card_merchant_controls')
            .join('cards', 'card_merchant_controls.card_id', 'cards.id')
            .where('card_merchant_controls.id', controlId)
            .where('cards.user_id', userId)
            .select('card_merchant_controls.*')
            .first();

        if (!rule) throw new NotFoundError('Rule not found or unauthorized');

        await this.db('card_merchant_controls').where({ id: controlId }).del();

        if (this.audit) {
            await this.audit.logAction({
                userId,
                action: 'card_control_merchant_remove',
                resourceType: 'card',
                resourceId: rule.card_id,
                metadata: { ruleId: controlId }
            });
        }
        return { success: true };
    }

    // --- Location Controls ---

    async setLocationControl(userId, cardId, data) {
        await this.validateCardOwnership(userId, cardId);
        const { countryCode, controlType } = data;

        // Upsert logic: if rule exists for country, update it
        const [rule] = await this.db('card_location_controls')
            .insert({
                card_id: cardId,
                country_code: countryCode, // database constrained to 2 chars, strict check needed?
                control_type: controlType
            })
            .onConflict(['card_id', 'country_code'])
            .merge()
            .returning('*');

        if (this.audit) {
            await this.audit.logAction({
                userId,
                action: 'card_control_location_set',
                resourceType: 'card',
                resourceId: cardId,
                metadata: { ...data }
            });
        }
        return rule;
    }

    async getLocationControls(userId, cardId) {
        await this.validateCardOwnership(userId, cardId);
        return await this.db('card_location_controls').where({ card_id: cardId });
    }

    async deleteLocationControl(userId, cardId, countryCode) {
        const deleted = await this.db('card_location_controls')
            .join('cards', 'card_location_controls.card_id', 'cards.id')
            .where('card_location_controls.card_id', cardId)
            .where('card_location_controls.country_code', countryCode)
            .where('cards.user_id', userId)
            .del();

        if (deleted === 0) throw new NotFoundError('Rule not found');

        return { success: true };
    }

    // --- Helpers ---

    async validateCardOwnership(userId, cardId) {
        const card = await this.db('cards').where({ id: cardId, user_id: userId }).first();
        if (!card) throw new NotFoundError('Card not found or unauthorized');
        return card;
    }
}

module.exports = CardControlService;
