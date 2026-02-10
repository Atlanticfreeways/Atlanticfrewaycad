const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { authLimiter } = require('../../middleware/rateLimiter');
const { csrfProtection } = require('../../middleware/csrfProtection');
const asyncHandler = require('../../utils/asyncHandler');
const { ValidationError, AuthenticationError } = require('../../errors/AppError');
const logger = require('../../utils/logger');

const router = express.Router();

// Helper to get Redis client from app locals or connection
const getRedis = (req) => {
    // Assuming repositories or direct connection is available
    // Based on server.js: dbConnection.getRedis()
    const dbConnection = require('../../database/connection');
    return dbConnection.getRedis();
};

/**
 * POST /auth/request-reset
 * Request a password reset link
 */
router.post('/request-reset', authLimiter, csrfProtection, asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ValidationError('Email is required');
    }

    const userRepo = req.repositories.user;
    const user = await userRepo.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const EmailService = require('../../services/EmailService');

    // ... (inside the handler)

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const redisKey = `reset_token:${token}`;

    // Store in Redis (1 hour expiration)
    // We need to fetch Redis properly
    const dbConnection = require('../../database/connection');
    const redis = dbConnection.getRedis();

    // Set with expiration (EX 3600 seconds = 1 hour)
    await redis.set(redisKey, user.id, { EX: 3600 });

    try {
        await EmailService.sendPasswordResetEmail(user, token);
        logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send password reset email to ${email}`, error);
        // Don't fail the request, just log
    }

    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
}));

/**
 * POST /auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', authLimiter, csrfProtection, asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw new ValidationError('Token and new password are required');
    }

    if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters');
    }

    const redis = getRedis(req);
    const redisKey = `reset_token:${token}`;
    const userId = await redis.get(redisKey);

    if (!userId) {
        throw new AuthenticationError('Invalid or expired reset token');
    }

    const userRepo = req.repositories.user;

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user
    await userRepo.update(userId, {
        password_hash: passwordHash,
        updated_at: new Date()
    });

    // Delete token
    await redis.del(redisKey);

    // Revoke all sessions (Optional security measure)
    // await redis.del(`sessions:${userId}`); // If we tracked sessions by user ID list

    logger.info(`Password reset successful for user ${userId}`);

    res.json({ success: true, message: 'Password has been reset successfully.' });
}));

module.exports = router;
