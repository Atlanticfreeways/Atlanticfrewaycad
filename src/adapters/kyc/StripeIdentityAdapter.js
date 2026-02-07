const logger = require('../../utils/logger');
const Stripe = require('stripe');

class StripeIdentityAdapter {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16' // Or latest stable
        });
    }

    /**
     * Create a verification session for Stripe Identity
     * @param {Object} user 
     * @returns {Promise<string>} Verification Session ID
     */
    async createApplicant(user) {
        try {
            const session = await this.stripe.identity.verificationSessions.create({
                type: 'document',
                options: {
                    document: {
                        require_id_number: true,
                        require_live_capture: true,
                        require_matching_selfie: true,
                    },
                },
                metadata: {
                    user_id: user.id,
                },
            });
            return session.id;
        } catch (error) {
            logger.error('Stripe Identity Application creation failed', error);
            throw error;
        }
    }

    /**
     * For Stripe, we return the client secret instead of a special SDK token
     * @param {string} sessionId 
     * @returns {Promise<string>} Client Secret
     */
    async generateSdkToken(sessionId) {
        const session = await this.stripe.identity.verificationSessions.retrieve(sessionId);
        return session.client_secret;
    }

    /**
     * Map Stripe status to internal status
     * @param {string} status 
     * @returns {string} 
     */
    mapStatus(status) {
        const statusMap = {
            'processing': 'pending',
            'verified': 'approved',
            'requires_input': 'failed',
            'canceled': 'rejected'
        };
        return statusMap[status] || 'pending';
    }
}

module.exports = StripeIdentityAdapter;
