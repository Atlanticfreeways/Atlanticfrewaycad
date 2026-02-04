const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../../../middleware/authenticate');
const { csrfProtection } = require('../../../middleware/csrfProtection');
const asyncHandler = require('../../../utils/asyncHandler');
const Joi = require('joi');

const router = express.Router();

router.use(authenticate);
router.use(csrfProtection);

/**
 * GET /api/v1/users/api-keys
 * List all API keys for the authenticated user
 */
router.get('/api-keys', asyncHandler(async (req, res) => {
    const keys = await req.repositories.db('user_api_keys')
        .where({ user_id: req.user.id })
        .select('id', 'name', 'key_prefix', 'created_at', 'expires_at', 'last_used_at')
        .orderBy('created_at', 'desc');

    res.json({
        success: true,
        keys: keys.map(key => ({
            ...key,
            is_expired: key.expires_at && new Date(key.expires_at) < new Date(),
        })),
    });
}));

/**
 * POST /api/v1/users/api-keys
 * Generate a new API key
 */
const createKeySchema = Joi.object({
    name: Joi.string().required().max(100),
    expires_days: Joi.number().integer().min(1).max(365).default(90),
});

router.post('/api-keys', asyncHandler(async (req, res) => {
    const { error, value } = createKeySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message,
        });
    }

    const { name, expires_days } = value;

    // Generate random API key
    const apiKey = 'afc_' + crypto.randomBytes(32).toString('hex');
    const keyPrefix = apiKey.substring(0, 12) + '...'; // First 12 chars for display

    // Hash the key for storage
    const keyHash = await bcrypt.hash(apiKey, 10);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_days);

    // Insert into database
    const [key] = await req.repositories.db('user_api_keys')
        .insert({
            user_id: req.user.id,
            name,
            key_hash: keyHash,
            key_prefix: keyPrefix,
            expires_at: expiresAt,
            created_at: new Date(),
        })
        .returning(['id', 'name', 'key_prefix', 'created_at', 'expires_at']);

    // Create audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'api_key_created',
        resource_type: 'api_key',
        resource_id: key.id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success',
    });

    // Create notification
    await req.repositories.db('notifications').insert({
        user_id: req.user.id,
        type: 'security',
        title: 'API Key Created',
        message: `New API key "${name}" was created`,
        data: { key_id: key.id, key_prefix: keyPrefix },
    });

    res.status(201).json({
        success: true,
        message: 'API key created successfully',
        key: {
            ...key,
            plaintext_key: apiKey, // Only shown once!
        },
    });
}));

/**
 * DELETE /api/v1/users/api-keys/:id
 * Revoke an API key
 */
router.delete('/api-keys/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if key exists and belongs to user
    const key = await req.repositories.db('user_api_keys')
        .where({ id, user_id: req.user.id })
        .first();

    if (!key) {
        return res.status(404).json({
            success: false,
            error: 'API key not found',
        });
    }

    // Delete the key
    await req.repositories.db('user_api_keys')
        .where({ id })
        .delete();

    // Create audit log
    await req.repositories.db('audit_logs').insert({
        user_id: req.user.id,
        action: 'api_key_revoked',
        resource_type: 'api_key',
        resource_id: id,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        status: 'success',
        metadata: { key_name: key.name },
    });

    // Create notification
    await req.repositories.db('notifications').insert({
        user_id: req.user.id,
        type: 'security',
        title: 'API Key Revoked',
        message: `API key "${key.name}" was revoked`,
        data: { key_id: id },
    });

    res.json({
        success: true,
        message: 'API key revoked successfully',
    });
}));

module.exports = router;
