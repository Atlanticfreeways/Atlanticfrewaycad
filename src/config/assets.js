/**
 * Centralized configuration for supported assets in the platform.
 * Used by both Backend (validation) and Frontend (display).
 */
module.exports = {
    // Fiat Currencies supported for display and transactions
    fiat: [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    ],

    // Crypto Assets supported for holding and funding
    crypto: [
        { code: 'BTC', name: 'Bitcoin', symbol: '₿', coingeckoId: 'bitcoin' },
        { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', coingeckoId: 'ethereum' },
        { code: 'SOL', name: 'Solana', symbol: '◎', coingeckoId: 'solana' },
        { code: 'USDC', name: 'USD Coin', symbol: '$', coingeckoId: 'usd-coin' },
        { code: 'USDT', name: 'Tether', symbol: '$', coingeckoId: 'tether' },
    ]
};
