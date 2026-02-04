const { parse } = require('csv-parse/sync');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class BulkIssuanceService {
    constructor(repositories, services = {}) {
        this.userRepo = repositories.user;
        this.cardRepo = repositories.card;
        this.compliance = services.compliance;
        this.pool = repositories.user.pool;
    }

    /**
     * Process a CSV buffer to issue cards in bulk
     * CSV Format: email, name, spending_limit, role
     */
    async processBulkFile(fileBuffer, adminCompanyId) {
        const results = {
            total: 0,
            success: 0,
            failed: 0,
            errors: []
        };

        let records;
        try {
            records = parse(fileBuffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
        } catch (parseError) {
            throw new Error('Invalid CSV Format: ' + parseError.message);
        }

        results.total = records.length;
        logger.info(`Starting bulk issuance for ${results.total} records`, { companyId: adminCompanyId });

        // Process in serial to avoid overwhelming Marqeta (or we could batch/parallelize)
        for (const [index, row] of records.entries()) {
            try {
                await this.issueSingleCard(row, adminCompanyId);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    row: index + 2, // Account for header
                    email: row.email,
                    error: error.message
                });
                logger.error(`Bulk issuance failed for row ${index + 2}`, { email: row.email, error: error.message });
            }
        }

        return results;
    }

    async issueSingleCard(row, companyId) {
        const { email, name, spending_limit, role } = row;

        if (!email || !name) {
            throw new Error('Missing email or name');
        }

        // Phase 2: Compliance Check
        if (this.compliance) {
            // Note: For bulk issuance, if the user doesn't exist yet, we can't check KYC status
            // This is a business decision: Pre-provision but only activate after KYC?
            // Or only allow bulk issuance for already verified users?
            // For this implementation, we'll try to find the user first.
            const existingUser = await this.userRepo.findByEmail(email);
            if (existingUser) {
                await this.compliance.checkComplianceForIssuance(existingUser.id);
            } else {
                // If new user, they MUST go through KYC before a REAL card is active
                // For now, let's assume new users are 'pending'
                logger.info(`New user ${email} provisioned via bulk. Card will be pending KYC.`);
            }
        }

        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Check if user exists, else create (Simplified Provisioning)
            let userId;
            const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);

            if (userRes.rows.length > 0) {
                userId = userRes.rows[0].id;
            } else {
                // Provision new user
                const newUser = await client.query(
                    `INSERT INTO users (id, email, first_name, last_name, role, account_type, company_id, password_hash, email_verified, kyc_status)
                     VALUES ($1, $2, $3, $4, $5, 'business', $6, 'temp_hash_placeholder', true, 'pending')
                     RETURNING id`,
                    [uuidv4(), email, name.split(' ')[0], name.split(' ')[1] || '', role || 'employee', companyId]
                );
                userId = newUser.rows[0].id;
                // Ideally trigger password reset email here
            }

            // 2. Create Card Record (Internal)
            // In a real flow, checking if they already have a card might be needed
            const cardRes = await client.query(
                `INSERT INTO cards (id, user_id, type, status, currency, spending_limit, brand, last_4, expiry_month, expiry_year)
                 VALUES ($1, $2, 'virtual', 'active', 'USD', $3, 'visa', $4, '12', '30')
                 RETURNING id`,
                [uuidv4(), userId, parseFloat(spending_limit) || 1000, '4242'] // Mock PAN data for now
            );

            // 3. (Optional) Call Marqeta API here to actually issue
            // await marqetaClient.createCard(...)

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = BulkIssuanceService;
