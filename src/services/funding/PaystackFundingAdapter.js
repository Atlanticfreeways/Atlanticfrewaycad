const BaseFundingAdapter = require('./BaseFundingAdapter');
const { v4: uuidv4 } = require('uuid');

class PaystackFundingAdapter extends BaseFundingAdapter {
    constructor() {
        super('paystack');
    }

    async initializeSession(user) {
        // Paystack is often client-side initialized or dedicated account setup
        // Return mock config for frontend
        return {
            provider: 'paystack',
            key: 'pk_test_mock_paystack_key',
            email: user.email,
            currency: 'NGN' // Default for this adapter context, though could be dynamic
        };
    }

    async connectAccount(reference) {
        // Verify transaction/setup
        return {
            success: true,
            providerId: `paystack_${uuidv4().substring(0, 8)}`,
            accessToken: `auth_${reference}`, // Paystack uses authorization codes for recurring charges
            meta: { reference }
        };
    }

    async getAccounts(accessToken) {
        // Paystack doesn't "link" bank accounts for data access exactly like Plaid
        // But keeps "authorizations" for cards/accounts
        return [{
            id: 'auth_12345',
            name: 'GTBank - Savings',
            mask: '1234',
            type: 'savings',
            currency: 'NGN',
            status: 'active'
        }];
    }
}

module.exports = PaystackFundingAdapter;
