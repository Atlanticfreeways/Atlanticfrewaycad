const BaseFundingAdapter = require('./BaseFundingAdapter');
const { v4: uuidv4 } = require('uuid');

class TrueLayerFundingAdapter extends BaseFundingAdapter {
    constructor() {
        super('truelayer');
    }

    async initializeSession(user) {
        return {
            provider: 'truelayer',
            authUri: `https://auth.truelayer-sandbox.com/?response_type=code&client_id=mock_client&scope=info%20accounts%20balance&redirect_uri=https://app.atlanticfreeway.com/callback`,
            state: uuidv4()
        };
    }

    async connectAccount(code) {
        return {
            success: true,
            providerId: `tl_${uuidv4().substring(0, 8)}`,
            accessToken: `tl_access_${uuidv4()}`,
            refreshToken: `tl_refresh_${uuidv4()}`
        };
    }

    async getAccounts(accessToken) {
        return [{
            id: 'acc_barclays_gbp',
            name: 'Barclays Current',
            mask: '8888',
            type: 'transaction',
            currency: 'GBP',
            status: 'active'
        }];
    }
}

module.exports = TrueLayerFundingAdapter;
