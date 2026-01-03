const axios = require('axios');
const logger = require('../utils/logger');
const MessageQueueManager = require('../queue/MessageQueueManager');

class MarqetaService {
    constructor(mqManager) {
        this.client = axios.create({
            baseURL: process.env.MARQETA_BASE_URL || 'https://sandbox-api.marqeta.com/v3',
            auth: {
                username: process.env.MARQETA_APP_TOKEN,
                password: process.env.MARQETA_ADMIN_TOKEN
            },
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        this.mqManager = mqManager || new MessageQueueManager();
    }

    async issueCard(userData) {
        try {
            logger.info('Requesting card issuance from Marqeta', { userId: userData.userId });

            // In a real implementation, this would call Marqeta API
            // const response = await this.client.post('/cards', { ... });

            // For now, mocking with "success" and publishing functionality
            const cardData = {
                card_token: `card_${Date.now()}`,
                user_token: userData.userToken,
                state: 'ACTIVE',
                created_time: new Date().toISOString()
            };

            // Publish event to message queue for async processing
            await this.mqManager.connect();
            await this.mqManager.publishMessage('transactions', 'card.issued', {
                userId: userData.userId,
                cardId: cardData.card_token,
                timestamp: new Date().toISOString(),
                details: cardData
            });

            return cardData;
        } catch (error) {
            logger.error('Failed to issue card:', error.message);
            throw error;
        }
    }

    async fundUser(userToken, amount) {
        try {
            // API call to fund GPA
            // await this.client.post('/gpaorders', { ... });

            await this.mqManager.connect();
            await this.mqManager.publishMessage('transactions', 'user.funded', {
                userToken,
                amount,
                timestamp: new Date().toISOString()
            });

            return { success: true, amount };
        } catch (error) {
            logger.error('Failed to fund user:', error.message);
            throw error;
        }
    }
}

module.exports = MarqetaService;
