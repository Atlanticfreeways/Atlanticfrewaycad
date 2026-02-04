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
}

module.exports = NotificationService;
