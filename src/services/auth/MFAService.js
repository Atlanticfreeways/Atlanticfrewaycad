const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const logger = require('../../utils/logger');

class MFAService {
    /**
     * Generate a new MFA secret for a user
     * @param {string} email - User email for the label
     * @returns {Promise<{secret: string, otpauth_url: string}>}
     */
    async generateSecret(email) {
        const secret = speakeasy.generateSecret({
            issuer: 'Atlantic Freeway Card',
            name: `Atlantic Freeway Card (${email})`,
            length: 20
        });

        return {
            secret: secret.base32,
            otpauth_url: secret.otpauth_url
        };
    }

    /**
     * Generate a QR code data URL from an otpauth URL
     * @param {string} otpauthUrl 
     * @returns {Promise<string>}
     */
    async generateQRCode(otpauthUrl) {
        try {
            return await QRCode.toDataURL(otpauthUrl);
        } catch (error) {
            logger.error('Failed to generate MFA QR Code', error);
            throw new Error('Failed to generate QR Code');
        }
    }

    /**
     * Verify a TOTP token against a secret
     * @param {string} secret - Base32 secret
     * @param {string} token - 6-digit TOTP token
     * @returns {boolean}
     */
    verifyToken(secret, token) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1 // Allow 30s clock drift
        });
    }

    /**
     * Generate backup codes for a user
     * @param {number} count - Number of codes to generate
     * @returns {string[]}
     */
    generateBackupCodes(count = 8) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            // 8-character hex codes
            codes.push(Math.random().toString(16).slice(2, 10).toUpperCase());
        }
        return codes;
    }
}

module.exports = new MFAService();
