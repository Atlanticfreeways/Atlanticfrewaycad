const FundingService = require('../src/services/FundingService');
const RegionRouterService = require('../src/services/RegionRouterService');

// Mock Repositories
const mockRepo = {
    wallet: {
        addBankAccount: async (uid, data) => {
            console.log(`[DB Mock] Saving bank account for user ${uid}:`, data.provider, data.accountName);
            return data;
        },
        findByUser: async (uid) => {
            return { bank_accounts: [{ provider: 'mock_existing' }] };
        }
    }
};

(async () => {
    console.log('--- Testing Region Router ---');
    const router = new RegionRouterService();
    console.log('NG ->', router.detectRegion('NG'), '-> Provider:', router.getFundingProvider('africa'));
    console.log('US ->', router.detectRegion('US'), '-> Provider:', router.getFundingProvider('usa'));
    console.log('DE ->', router.detectRegion('DE'), '-> Provider:', router.getFundingProvider('eu'));

    console.log('\n--- Testing Funding Service Flow (Africa/Paystack) ---');
    const service = new FundingService(mockRepo);
    const user = { id: 'user_123', email: 'test@example.com' };

    // 1. Initiate
    console.log('Initiating connection for NG...');
    const initResult = await service.initiateConnection(user, 'NG');
    console.log('Init Result:', initResult);

    // 2. Complete
    console.log('Completing connection...');
    const completeResult = await service.completeConnection(user, 'paystack', {
        token: 'auth_code_123',
        accountId: 'acc_123'
    });
    console.log('Complete Result:', completeResult);

    console.log('\n--- Testing Funding Service Flow (USA/Plaid) ---');
    console.log('Initiating connection for US...');
    const initUS = await service.initiateConnection(user, 'US');
    console.log('Init US:', initUS);

})();
