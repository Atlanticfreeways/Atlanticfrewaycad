/**
 * Spread Configuration
 * Defines the fee percentage added to the market rate for various asset classes.
 * 
 * Example: 0.005 = 0.5% fee
 */
module.exports = {
    // Base spread for stable fiat pairs (e.g. USD <-> EUR)
    FIAT_SPREAD: 0.005, // 0.5%

    // Higher spread for volatile crypto assets (e.g. USD <-> BTC)
    CRYPTO_SPREAD: 0.02, // 2.0%

    // Special spreads for specific pairs (overrides defaults)
    PAIRS: {
        'USDC': 0.001, // 0.1% for stablecoin
        'USDT': 0.001,
    }
};
