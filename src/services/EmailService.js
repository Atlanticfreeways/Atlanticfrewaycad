const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            this.enabled = true;
        } else {
            logger.warn('EmailService: SENDGRID_API_KEY not found. Emails will be logged only.');
            this.enabled = false;
        }
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@atlanticfrewaycard.com';
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    }

    async send(to, subject, html) {
        if (!this.enabled) {
            logger.info(`[Email Mock] To: ${to}, Subject: ${subject}`);
            return;
        }

        const msg = {
            to,
            from: this.fromEmail,
            subject,
            html,
        };

        try {
            await sgMail.send(msg);
            logger.info(`Email sent to ${to}`);
        } catch (error) {
            logger.error('EmailService Error', error);
            if (error.response) {
                logger.error(error.response.body);
            }
            throw error;
        }
    }

    async sendWelcomeEmail(user) {
        const subject = 'Welcome to Atlanticfrewaycard';
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome, ${user.firstName}!</h2>
        <p>Your workspace has been created successfully.</p>
        <p>Get started by exploring verify your identity to issue cards.</p>
        <a href="${this.frontendUrl}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      </div>
    `;
        await this.send(user.email, subject, html);
    }

    async sendPasswordResetEmail(user, token) {
        const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
        const subject = 'Reset your password';
        const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to reset it (valid for 1 hour):</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;
        await this.send(user.email, subject, html);
    }
}

module.exports = new EmailService(); // Export singleton instance
