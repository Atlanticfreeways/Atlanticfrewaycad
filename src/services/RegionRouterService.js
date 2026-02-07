/**
 * Service to detect user region and determine appropriate providers
 */
class RegionRouterService {
    constructor() {
        this.regionMap = {
            'NG': 'africa',
            'GH': 'africa',
            'KE': 'africa',
            'ZA': 'africa',
            'US': 'usa',
            'GB': 'eu',
            'DE': 'eu',
            'FR': 'eu',
            'ES': 'eu',
            'IT': 'eu',
            'NL': 'eu'
            // Add more as needed
        };

        this.defaultRegion = 'other';
    }

    detectRegion(countryCode) {
        if (!countryCode) return this.defaultRegion;
        return this.regionMap[countryCode.toUpperCase()] || this.defaultRegion;
    }

    getFundingProvider(region) {
        switch (region) {
            case 'africa': return 'paystack';
            case 'usa': return 'plaid';
            case 'eu': return 'truelayer';
            default: return 'manual';
        }
    }

    getKYCProvider(region) {
        switch (region) {
            case 'africa': return 'paystack_identity';
            case 'usa': return 'onfido'; // or Persona
            case 'eu': return 'onfido';
            default: return 'onfido'; // default global
        }
    }
}

module.exports = RegionRouterService;
