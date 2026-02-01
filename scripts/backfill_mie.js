const db = require('../src/database/connection');
const MerchantEnrichmentService = require('../src/services/MerchantEnrichmentService');
const logger = require('../src/utils/logger');

/**
 * MIE Backfill Utility
 * Enriches historical transactions with human-readable brands and categories.
 */
async function backfill() {
    logger.info('Starting MIE Historical Backfill...');

    const client = db.getPostgres();

    try {
        // 1. Fetch all transactions that haven't been enriched yet 
        // (those with raw metadata or missing fields)
        const result = await client.query('SELECT id, merchant_name, merchant_category, metadata FROM transactions');

        logger.info(`Found ${result.rows.length} transactions to process.`);

        let updatedCount = 0;

        for (const row of result.rows) {
            const enrichment = MerchantEnrichmentService.enrich(row.merchant_name, row.merchant_category);

            // Only update if something changed
            if (enrichment.name !== row.merchant_name || enrichment.category !== row.merchant_category) {
                const metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {});

                const newMetadata = {
                    ...metadata,
                    backfilled_by_mie: true,
                    original_merchant: row.merchant_name,
                    mcc: row.merchant_category,
                    group: enrichment.group,
                    parent_brand: enrichment.parentBrand
                };

                await client.query(
                    'UPDATE transactions SET merchant_name = $1, merchant_category = $2, metadata = $3 WHERE id = $4',
                    [enrichment.name, enrichment.category, JSON.stringify(newMetadata), row.id]
                );

                updatedCount++;
            }
        }

        logger.info(`Backfill complete. Updated ${updatedCount} transactions.`);
    } catch (error) {
        logger.error('Backfill failed:', error);
    } finally {
        process.exit();
    }
}

backfill();
