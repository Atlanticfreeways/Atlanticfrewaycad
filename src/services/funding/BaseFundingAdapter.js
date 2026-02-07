/**
 * Base class/Interface for Funding Providers
 */
class BaseFundingAdapter {
    constructor(name) {
        this.name = name;
    }

    /**
     * Initialize a funding session (e.g. generate link token)
     * @param {Object} user User object
     * @param {Object} options Additional options
     * @returns {Promise<Object>} Session data (link token, url, etc)
     */
    async initializeSession(user, options = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Verify and exchange token/code for access credentials
     * @param {string} publicToken Token received from frontend
     * @param {string} accountId Selected account ID (if applicable)
     * @returns {Promise<Object>} Connection result
     */
    async connectAccount(publicToken, accountId) {
        throw new Error('Method not implemented');
    }

    /**
     * Get formatted bank account details
     * @param {string} accessToken Access credential
     * @returns {Promise<Array>} List of accounts
     */
    async getAccounts(accessToken) {
        throw new Error('Method not implemented');
    }
}

module.exports = BaseFundingAdapter;
