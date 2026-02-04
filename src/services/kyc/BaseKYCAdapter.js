class BaseKYCAdapter {
    /**
     * Create a new applicant or user in the KYC system
     * @param {Object} user - User profile data
     * @returns {Promise<string>} External applicant ID
     */
    async createApplicant(user) {
        throw new Error('Method not implemented');
    }

    /**
     * Generate a token for the frontend SDK to start verification
     * @param {string} applicantId 
     * @returns {Promise<string>} SDK Token
     */
    async generateSdkToken(applicantId) {
        throw new Error('Method not implemented');
    }

    /**
     * Get the result of a specific check
     * @param {string} externalId 
     * @returns {Promise<Object>} Verification status and result
     */
    async getCheckResult(externalId) {
        throw new Error('Method not implemented');
    }

    /**
     * Map provider status to internal kyc_status
     * @param {string} providerStatus 
     * @returns {string} pending | approved | rejected | expired
     */
    mapStatus(providerStatus) {
        return 'pending';
    }
}

module.exports = BaseKYCAdapter;
