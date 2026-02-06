const logger = require('../utils/logger');

class NotificationService {
    constructor(io) {
        this.io = io;
        this.setupConnectionHandlers();
    }

    /**
     * Setup initial connection event handlers
     */
    setupConnectionHandlers() {
        this.io.on('connection', (socket) => {
            if (socket.user) {
                // User joined
                const userId = socket.user.id;
                const roomName = `user_${userId}`;

                socket.join(roomName);
                logger.info(`User ${userId} joined room ${roomName}`, { socketId: socket.id });

                socket.on('disconnect', () => {
                    logger.info(`User ${userId} disconnected`, { socketId: socket.id });
                });
            } else {
                logger.warn('Unauthenticated socket connected (should be blocked by middleware)', { socketId: socket.id });
            }
        });
    }

    /**
     * Send a targeted alert to a specific user
     * @param {string} userId - UUID of the user
     * @param {string} event - Event name (e.g., 'transaction_alert')
     * @param {object} payload - Data to send
     */
    sendUserAlert(userId, event, payload) {
        const roomName = `user_${userId}`;
        this.io.to(roomName).emit(event, payload);
        logger.debug(`Sent ${event} to ${roomName}`, payload);
    }

    /**
     * Broadcast an event to all connected clients
     * Use sparingly (e.g., system maintenance alerts)
     * @param {string} event 
     * @param {object} payload 
     */
    broadcast(event, payload) {
        this.io.emit(event, payload);
        logger.info(`Broadcasted ${event} to all users`);
    }
    /**
     * Send an email notification (Mock)
     */
    async sendEmail(toVec, subject, body) {
        // In production: await sendgrid.send(...)
        logger.info(`[MOCK EMAIL] To: ${toVec} | Subject: ${subject} | Body: ${body}`);
        return true;
    }

    /**
     * Send a Slack notification (Mock)
     */
    async sendSlack(webhookUrl, message) {
        // In production: await axios.post(webhookUrl, { text: message })
        logger.info(`[MOCK SLACK] To: ${webhookUrl} | Message: ${message}`);
        return true;
    }

    /**
     * Send a multi-channel alert
     */
    async sendBudgetAlert(budget, percentUsed, amountUsed) {
        const message = `🚨 Budget Alert: ${budget.name} has reached ${percentUsed.toFixed(1)}% usage ($${amountUsed.toLocaleString()}).`;

        // 1. Send via Socket (In-app)
        // Need to find which users subscribe to this budget? For now generic broadacst or skip.

        // 2. Send Emails
        if (budget.notify_emails && budget.notify_emails.length > 0) {
            await this.sendEmail(budget.notify_emails, `Budget Alert: ${budget.name}`, message);
        }

        // 3. Send Slack
        if (budget.slack_webhook_url) {
            await this.sendSlack(budget.slack_webhook_url, message);
        }
    }
}

module.exports = NotificationService;
