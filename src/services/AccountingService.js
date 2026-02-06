const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class AccountingService {
    constructor({ db }) {
        this.db = db;
    }

    /**
     * Connect Integration (Store Tokens)
     */
    async connect(companyId, provider, tokens) {
        const { accessToken, refreshToken, expiresAt, realmId } = tokens;

        // Upsert integration
        const [integration] = await this.db('integrations')
            .insert({
                company_id: companyId,
                provider,
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expiresAt,
                realm_id: realmId,
                is_active: true,
                updated_at: new Date()
            })
            .onConflict(['company_id', 'provider'])
            .merge()
            .returning('*');

        return integration;
    }

    /**
     * Refresh OAuth Token (Mock Logic)
     */
    async refreshToken(integration) {
        // In real app: Call QB/Xero API to get new token
        // const newTokens = await qbClient.refresh(integration.refresh_token);
        logger.info(`Refreshing token for ${integration.provider}`);

        // Mock update
        const newExpiry = new Date(Date.now() + 3600 * 1000); // +1 hour
        await this.db('integrations')
            .where({ id: integration.id })
            .update({ expires_at: newExpiry });

        return { ...integration, expires_at: newExpiry };
    }

    /**
     * Sync Transactions to Accounting Provider
     */
    async syncTransactions(companyId, provider) {
        const integration = await this.db('integrations')
            .where({ company_id: companyId, provider })
            .first();

        if (!integration || !integration.is_active) {
            throw new ValidationError('Integration not active');
        }

        // 1. Get unsynced transactions (mock logic: created after last sync)
        const lastSync = integration.last_sync_at || new Date('2000-01-01');
        const transactions = await this.db('transactions')
            .where({ company_id: companyId, status: 'approved' })
            .where('created_at', '>', lastSync);

        logger.info(`Found ${transactions.length} transactions to sync for ${provider}`);

        // 2. Push to Provider (Mock)
        let successCount = 0;
        let failCount = 0;

        for (const tx of transactions) {
            try {
                // await qbClient.createExpense(tx);
                logger.info(`Synced Tx ${tx.id} to ${provider}`);
                successCount++;
            } catch (e) {
                logger.error(`Failed to sync Tx ${tx.id}`, e);
                failCount++;
            }
        }

        // 3. Update Sync Status
        await this.db('integrations')
            .where({ id: integration.id })
            .update({
                last_sync_at: new Date(),
                last_sync_status: failCount > 0 ? 'partial' : 'success',
                last_sync_error: failCount > 0 ? `${failCount} failed` : null
            });

        return { success: successCount, failed: failCount };
    }

    /**
     * Get Mappings
     */
    async getMappings(companyId, provider) {
        return this.db('integration_mappings')
            .join('integrations', 'integrations.id', 'integration_mappings.integration_id')
            .where('integrations.company_id', companyId)
            .where('integrations.provider', provider)
            .select('integration_mappings.*');
    }

    /**
     * Save Mapping
     */
    async saveMapping(companyId, provider, mapping) {
        const integration = await this.db('integrations')
            .where({ company_id: companyId, provider })
            .first();

        if (!integration) throw new NotFoundError('Integration not found');

        await this.db('integration_mappings')
            .insert({
                integration_id: integration.id,
                internal_category: mapping.category,
                external_account_id: mapping.accountId,
                external_account_name: mapping.accountName
            })
            .onConflict(['integration_id', 'internal_category'])
            .merge();
    }
}

module.exports = AccountingService;
