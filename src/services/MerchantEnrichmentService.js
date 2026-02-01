const mapping = require('../config/merchantMapping');

/**
 * MerchantEnrichmentService
 * Normalizes merchant names and categorizes transactions based on MCC and brand patterns.
 */
class MerchantEnrichmentService {
    /**
     * Enriches raw transaction data.
     * @param {string} rawName - The messy merchant name from the network (e.g., "AMZN MKTP US*123")
     * @param {string} mcc - Merchant Category Code (e.g., "5411")
     */
    enrich(rawName, mcc) {
        let normalizedName = rawName || 'Unknown Merchant';
        let category = 'Uncategorized';
        let group = 'Others';
        let icon = 'help_outline';
        let parentBrand = null;

        // 1. Identify Brand & Parent (Name-based matching)
        for (const merchant of mapping.MERCHANTS) {
            if (merchant.pattern.test(rawName)) {
                normalizedName = merchant.name;
                category = merchant.category;
                icon = merchant.icon;
                parentBrand = merchant.parent || null;
                break;
            }
        }

        // 2. Resolve Category (MCC-based matching)
        // If we didn't find a brand-specific category, use the MCC mapping
        if (category === 'Uncategorized' && mcc) {
            const mccInfo = mapping.CATEGORIES[mcc] || mapping.CATEGORIES['default'];
            category = mccInfo.label;
            group = mccInfo.group;
        } else if (category !== 'Uncategorized') {
            // Find group for the brand-specific category if possible
            const groupInfo = Object.values(mapping.CATEGORIES).find(c => c.label === category);
            group = groupInfo ? groupInfo.group : 'General';
        }

        return {
            originalName: rawName,
            name: normalizedName,
            category: category,
            group: group,
            mcc: mcc,
            icon: icon,
            parentBrand: parentBrand
        };
    }

    /**
     * Bulk enrich a list of transactions (helper for reports)
     */
    enrichAll(transactions) {
        return transactions.map(tx => {
            const enrichment = this.enrich(tx.merchant_name, tx.merchant_category);
            return {
                ...tx,
                enriched_name: enrichment.name,
                enriched_category: enrichment.category,
                enriched_group: enrichment.group,
                icon: enrichment.icon,
                parent_brand: enrichment.parentBrand
            };
        });
    }
}

module.exports = new MerchantEnrichmentService();
