const Joi = require('joi');

/**
 * Validation Middleware
 * Validates request body against Joi schema
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      }
    });
  }

  req.validatedBody = value;
  next();
};

/**
 * Validation Schemas
 */
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.pattern.base': 'Password must contain uppercase, lowercase, and number'
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createCard: Joi.object({
    nickname: Joi.string().max(50).optional(),
    dailyLimit: Joi.number().min(0).max(10000).optional(),
    monthlyLimit: Joi.number().min(0).max(50000).optional()
  }),

  addFunds: Joi.object({
    amount: Joi.number().min(1).max(10000).required(),
    source: Joi.string().valid('bank_transfer', 'crypto', 'card').required()
  }),

  createCompany: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    settings: Joi.object().optional()
  }),

  addEmployee: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    role: Joi.string().valid('employee', 'manager', 'admin').default('employee')
  }),

  issueCorporateCard: Joi.object({
    dailyLimit: Joi.number().min(0).max(10000).optional(),
    monthlyLimit: Joi.number().min(0).max(50000).optional(),
    merchantRestrictions: Joi.array().items(Joi.string()).optional(),
    locationRestrictions: Joi.object().optional(),
    timeRestrictions: Joi.object().optional()
  }),

  waitlistEmail: Joi.object({
    email: Joi.string().email().required()
  }),

  updateSpendingControls: Joi.object({
    dailyLimit: Joi.number().min(0).optional(),
    monthlyLimit: Joi.number().min(0).optional(),
    merchantRestrictions: Joi.array().items(Joi.string()).optional()
  })
};

module.exports = { validate, schemas };
