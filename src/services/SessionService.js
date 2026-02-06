const crypto = require('crypto');
const { AuthenticationError } = require('../errors/AppError');

class SessionService {
    constructor(repositories) {
        this.repo = repositories.user; // Using user repo as query runner
    }

    /**
     * Hash token for storage
     * @param {string} token 
     * @returns {string}
     */
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Create a new session (refresh token)
     * @param {string} userId 
     * @param {string} refreshToken 
     * @param {string} ipAddress 
     * @param {string} userAgent 
     */
    async createSession(userId, refreshToken, ipAddress, userAgent) {
        const hash = this.hashToken(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.repo.query(
            `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, hash, expiresAt, ipAddress, userAgent]
        );
    }

    /**
     * Rotate refresh token (Reuse Detection Implemented)
     * @param {string} oldRefreshToken 
     * @param {string} newRefreshToken 
     * @param {string} ipAddress 
     * @param {string} userAgent 
     */
    async rotateSession(oldRefreshToken, newRefreshToken, ipAddress, userAgent) {
        const oldHash = this.hashToken(oldRefreshToken);
        const newHash = this.hashToken(newRefreshToken);

        // Find old token
        const result = await this.repo.query(
            "SELECT * FROM refresh_tokens WHERE token_hash = $1",
            [oldHash]
        );
        const tokenRecord = result.rows[0];

        if (!tokenRecord) {
            // Token not in DB? potentially spoofed or very old/purged
            throw new AuthenticationError('Invalid session');
        }

        if (tokenRecord.revoked) {
            // SECURITY: Reuse detection!
            // Revoke ALL sessions for this user
            await this.revokeAllUserSessions(tokenRecord.user_id, 'Token Reuse Detected');
            throw new AuthenticationError('Security Violation: Session Reuse Detected. All sessions revoked.');
        }

        // Revoke old token and link to new one
        await this.repo.query(
            "UPDATE refresh_tokens SET revoked = true, replaced_by_token_hash = $1 WHERE id = $2",
            [newHash, tokenRecord.id]
        );

        // Create new token record
        await this.createSession(tokenRecord.user_id, newRefreshToken, ipAddress, userAgent);

        return tokenRecord.user_id;
    }

    async revokeAllUserSessions(userId, reason = 'Admin Action') {
        await this.repo.query(
            "UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND revoked = false",
            [userId]
        );
    }

    async logout(refreshToken) {
        if (!refreshToken) return;
        const hash = this.hashToken(refreshToken);
        await this.repo.query(
            "UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1",
            [hash]
        );
    }
}

module.exports = SessionService;
