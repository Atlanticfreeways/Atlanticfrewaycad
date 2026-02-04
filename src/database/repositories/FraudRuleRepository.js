class FraudRuleRepository {
    constructor() {
        // In the future, these can be loaded from DB/Redis
        this.rules = {
            velocity: {
                max_transactions_per_minute: 5,
                max_transactions_per_hour: 12
            },
            amount: {
                max_single_transaction_multiplier: 5.0 // vs average
            },
            blocked_mcc: [
                '7995', // Gambling
                '6010', // Cash Advance
                '4829', // Wire Transfer
                '6211', // Securities
                '5944'  // Jewelry (High risk sample)
            ],
            country_blocklist: ['KP', 'IR', 'CU', 'SY']
        };
    }

    async getRules() {
        // Simulate async fetching
        return this.rules;
    }
}

module.exports = FraudRuleRepository;
