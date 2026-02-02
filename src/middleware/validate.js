const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Higher-order function to validate request body against a Joi schema
 * @param {Joi.Schema} schema - The Joi schema to validate against
 */
const validate = (schema) => (req, res, next) => {
    try {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errorDetails = error.details.map(detail => detail.message);
            logger.warn('Validation error', {
                path: req.originalUrl,
                errors: errorDetails,
                ip: req.ip
            });

            return res.status(400).json({
                error: 'Validation Failed',
                details: errorDetails
            });
        }

        // Replace req.body with the sanitized/validated value
        req.body = value;
        next();

    } catch (err) {
        logger.error('Validator internal error', err);
        res.status(500).json({ error: 'Internal validation error' });
    }
};

module.exports = validate;
