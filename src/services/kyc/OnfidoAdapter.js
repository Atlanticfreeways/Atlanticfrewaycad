const BaseKYCAdapter = require('./BaseKYCAdapter');
const axios = require('axios');
const logger = require('../../utils/logger');

class OnfidoAdapter extends BaseKYCAdapter {
    constructor(config = {}) {
        super();
        this.apiKey = config.apiKey || process.env.ONFIDO_API_KEY;
        this.baseUrl = 'https://api.onfido.com/v3.4';
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Token token=${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createApplicant(user) {
        try {
            // Mocking API call for demo if no real key
            if (!this.apiKey || this.apiKey.includes('your-')) {
                logger.warn('Using Mock Onfido Applicant creation');
                return `onfido_app_${Math.random().toString(36).substr(2, 9)}`;
            }

            const response = await this.client.post('/applicants', {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            });
            return response.data.id;
        } catch (error) {
            logger.error('Onfido createApplicant failed', error.response?.data || error.message);
            throw new Error('KYC service unavailable');
        }
    }

    async generateSdkToken(applicantId, referrer = 'http://localhost:3000/*') {
        try {
            if (!this.apiKey || this.apiKey.includes('your-')) {
                return `mock_sdk_token_${applicantId}`;
            }

            const response = await this.client.post('/sdk_token', {
                applicant_id: applicantId,
                referrer
            });
            return response.data.token;
        } catch (error) {
            logger.error('Onfido generateSdkToken failed', error.response?.data || error.message);
            throw new Error('Failed to initiate KYC session');
        }
    }

    async getCheckResult(checkId) {
        try {
            if (!this.apiKey || this.apiKey.includes('your-')) {
                // Return a mock result
                return {
                    status: 'completed',
                    result: 'clear',
                    sub_result: 'clear'
                };
            }

            const response = await this.client.get(`/checks/${checkId}`);
            return response.data;
        } catch (error) {
            logger.error('Onfido getCheckResult failed', error.response?.data || error.message);
            throw new Error('Failed to fetch KYC result');
        }
    }

    mapStatus(onfidoStatus, onfidoResult) {
        if (onfidoStatus === 'completed') {
            return onfidoResult === 'clear' ? 'approved' : 'rejected';
        }
        if (onfidoStatus === 'in_progress') return 'pending';
        if (onfidoStatus === 'withdrawn' || onfidoStatus === 'expired') return 'expired';
        return 'pending';
    }
}

module.exports = OnfidoAdapter;
