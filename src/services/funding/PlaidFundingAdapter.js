const BaseFundingAdapter = require('./BaseFundingAdapter');
const { v4: uuidv4 } = require('uuid');

class PlaidFundingAdapter extends BaseFundingAdapter {
    constructor() {
        super('plaid');
    }

    async initializeSession(user) {
        // Generate Link Token
        return {
            provider: 'plaid',
            linkToken: `link-sandbox-${uuidv4()}`,
            expiration: new Date(Date.now() + 30 * 60000).toISOString()
        };
    }

    async connectAccount(publicToken, accountId) {
        // Exchange public_token for access_token
        return {
            success: true,
            providerId: `plaid_${uuidv4().substring(0, 8)}`,
            accessToken: `access-sandbox-${uuidv4()}`,
            itemId: `item-${uuidv4().substring(0, 8)}`
        };
    }

    async getAccounts(accessToken) {
        return [{
            id: 'acc_chase_checking',
            name: 'Chase Checking',
            mask: '0000',
            type: 'checking',
            currency: 'USD',
            status: 'active',
            balance: 5000.00
        }, {
            id: 'acc_chase_savings',
            name: 'Chase Savings',
            mask: '1111',
            type: 'savings',
            currency: 'USD',
            status: 'active',
            balance: 12000.00
        }];
    }
}

module.exports = PlaidFundingAdapter;
