const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

class MockOnfidoAdapter {
    constructor() {
        this.name = 'MockOnfido';
    }

    async createApplicant(user) {
        logger.info(`[MockOnfido] Creating applicant for user ${user.id}`);
        return `app_${uuidv4().substring(0, 8)}`; // Fake Applicant ID
    }

    async generateSdkToken(applicantId) {
        logger.info(`[MockOnfido] Generating SDK token for applicant ${applicantId}`);
        return `mock_sdk_token_${uuidv4()}`;
    }

    /**
     * Maps provider status to internal status
     * @param {string} status Provider status (clear, consider, etc)
     * @param {string} result Provider result
     */
    mapStatus(status, result) {
        if (result === 'clear') return 'approved';
        if (result === 'consider') return 'review_required';
        return 'pending';
    }
}

module.exports = MockOnfidoAdapter;
