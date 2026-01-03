const crypto = require('crypto');
const logger = require('../utils/logger');

class PCICompliance {
    constructor() {
        this.encryptionKey = process.env.PCI_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
        this.algorithm = 'aes-256-gcm';
    }

    encryptCardData(data) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);

            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag().toString('hex');

            return {
                encrypted,
                iv: iv.toString('hex'),
                authTag
            };
        } catch (error) {
            logger.error('PCI Encryption failed:', error.message);
            throw new Error('Encryption failed');
        }
    }

    decryptCardData(encryptedData) {
        try {
            if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
                throw new Error('Invalid encrypted data format');
            }

            const decipher = crypto.createDecipheriv(
                this.algorithm,
                Buffer.from(this.encryptionKey, 'hex'),
                Buffer.from(encryptedData.iv, 'hex')
            );

            decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            logger.error('PCI Decryption failed:', error.message);
            throw new Error('Decryption failed');
        }
    }

    auditAccess(userId, resource, action) {
        // Log access to sensitive data
        logger.info('PCI Audit Log', {
            timestamp: new Date().toISOString(),
            userId,
            resource,
            action,
            ip: 'captured-from-request'
        });
    }

    maskCardNumber(cardNumber) {
        if (!cardNumber || cardNumber.length < 4) return cardNumber;
        const last4 = cardNumber.slice(-4);
        return `****-****-****-${last4}`;
    }
}

module.exports = new PCICompliance();
