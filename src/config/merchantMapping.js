/**
 * Merchant & MCC Mapping Catalog
 * Maps raw network data to human-readable brands and categories.
 */
module.exports = {
    // Top 500 Merchants Normalization (Partial list for MVP)
    MERCHANTS: [
        { pattern: /AMZN|AMAZON/i, name: 'Amazon', category: 'Retail', icon: 'shopping_cart' },
        { pattern: /MSFT|MICROSOFT|AZURE|365/i, name: 'Microsoft', category: 'Tech & Software', icon: 'computer', parent: 'Microsoft Corp' },
        { pattern: /GOOGLE|GSUITE|YOUTUBE/i, name: 'Google', category: 'Tech & Software', icon: 'search', parent: 'Alphabet Inc' },
        { pattern: /APPLE.COM|ITUNES/i, name: 'Apple', category: 'Tech & Electronics', icon: 'apple', parent: 'Apple Inc' },
        { pattern: /WMT|WAL-MART|WALMART/i, name: 'Walmart', category: 'Essentials', icon: 'store' },
        { pattern: /COSTCO/i, name: 'Costco', category: 'Essentials', icon: 'shopping_bag' },
        { pattern: /NFLX|NETFLIX/i, name: 'Netflix', category: 'Entertainment', icon: 'movie' },
        { pattern: /SPOTIFY/i, name: 'Spotify', category: 'Entertainment', icon: 'music_note' },
        { pattern: /UBER/i, name: 'Uber', category: 'Transport', icon: 'directions_car' },
        { pattern: /LYFT/i, name: 'Lyft', category: 'Transport', icon: 'local_taxi' },
        { pattern: /SBUX|STARBUCKS/i, name: 'Starbucks', category: 'Dining', icon: 'local_cafe' },
        { pattern: /MCDONALDS/i, name: 'McDonalds', category: 'Dining', icon: 'fastfood' },
    ],

    // Merchant Category Code (MCC) Lookups (ISO-18245)
    CATEGORIES: {
        '5411': { label: 'Groceries', group: 'Essentials' },
        '5812': { label: 'Dining', group: 'Dining & Entertainment' },
        '5814': { label: 'Fast Food', group: 'Dining & Entertainment' },
        '4121': { label: 'Taxis/Rideshare', group: 'Transport' },
        '4814': { label: 'Telecommunications', group: 'Tech & Utilities' },
        '5311': { label: 'Department Stores', group: 'Retail' },
        '5732': { label: 'Electronics', group: 'Tech & Software' },
        '5968': { label: 'Subscriptions', group: 'Entertainment & Software' },
        '7372': { label: 'Cloud Services', group: 'Tech & Software' },
        '4511': { label: 'Airlines', group: 'Travel' },
        '7011': { label: 'Hotels/Lodging', group: 'Travel' },
        'default': { label: 'Other', group: 'Others' }
    }
};
