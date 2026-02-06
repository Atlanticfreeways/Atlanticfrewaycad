const { AuthenticationError } = require('../errors/AppError');

class SecurityService {
    constructor(repositories) {
        this.repo = repositories.user; // Using user repo as query runner
    }

    /**
     * Check if user/IP is currently locked out
     * @param {string} email 
     * @param {string} ipAddress 
     */
    async checkLockout(email, ipAddress) {
        // Check recent failures (last 15 mins)
        const result = await this.repo.query(
            `SELECT COUNT(*) as failures 
             FROM login_attempts 
             WHERE (email = $1 OR ip_address = $2) 
             AND success = false 
             AND attempted_at > NOW() - INTERVAL '15 minutes'`,
            [email, ipAddress]
        );

        const failures = parseInt(result.rows[0].failures);
        if (failures >= 5) {
            throw new AuthenticationError('Account locked due to too many failed login attempts. Please try again in 15 minutes.');
        }
    }

    /**
     * Log a login attempt
     * @param {string} email 
     * @param {string} ipAddress 
     * @param {boolean} success 
     */
    async logLoginAttempt(email, ipAddress, success) {
        await this.repo.query(
            `INSERT INTO login_attempts (email, ip_address, success)
             VALUES ($1, $2, $3)`,
            [email, ipAddress, success]
        );
    }
}

module.exports = SecurityService;
