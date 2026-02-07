const RegionRouterService = require('./RegionRouterService');
const PaystackAdapter = require('./funding/PaystackFundingAdapter');
const PlaidAdapter = require('./funding/PlaidFundingAdapter');
const TrueLayerAdapter = require('./funding/TrueLayerFundingAdapter');
const { ValidationError } = require('../errors/AppError');

class FundingService {
    constructor(repositories) {
        this.regionRouter = new RegionRouterService();
        this.adapters = {
            paystack: new PaystackAdapter(),
            plaid: new PlaidAdapter(),
            truelayer: new TrueLayerAdapter(),
            // 'manual': new ManualAdapter() // Could add later
        };
        this.repo = repositories.wallet; // Assuming wallet or bank_accounts table
    }

    getAdapter(providerName) {
        const adapter = this.adapters[providerName];
        if (!adapter) throw new ValidationError(`Unsupported funding provider: ${providerName}`);
        return adapter;
    }

    async initiateConnection(user, countryCode) {
        // 1. Detect region and provider
        const region = this.regionRouter.detectRegion(countryCode);
        const providerName = this.regionRouter.getFundingProvider(region);

        if (providerName === 'manual') {
            return { type: 'manual', instructions: 'Implement manual wire instructions here' };
        }

        // 2. Initialize provider session
        const adapter = this.getAdapter(providerName);
        const sessionData = await adapter.initializeSession(user);

        return {
            type: 'automated',
            provider: providerName,
            session: sessionData
        };
    }

    async completeConnection(user, providerName, credentials) {
        const adapter = this.getAdapter(providerName);

        // 1. Exchange credentials for access token
        const connection = await adapter.connectAccount(credentials.token, credentials.accountId);

        // 2. Fetch initial account details
        const accounts = await adapter.getAccounts(connection.accessToken);

        // 3. Persist to DB
        const accountData = {
            provider: providerName,
            providerId: connection.providerId,
            accessToken: connection.accessToken, // In prod, encrypt this!
            itemId: connection.itemId,
            accountName: accounts[0].name,
            accountMask: accounts[0].mask,
            currency: accounts[0].currency,
            linkedAt: new Date().toISOString()
        };

        if (this.repo && this.repo.addBankAccount) {
            await this.repo.addBankAccount(user.id, accountData);
        }

        return {
            success: true,
            linkedAccount: accounts[0]
        };
    }

    async getLinkedAccounts(userId) {
        if (!this.repo) return [];
        const wallet = await this.repo.findByUser(userId);
        return wallet ? ((wallet.bank_accounts) || []) : [];
    }
}

module.exports = FundingService;
