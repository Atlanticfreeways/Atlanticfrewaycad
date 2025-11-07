const csrf = require('csurf');

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

// CSRF protection with cookie storage
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

/**
 * CSRF Error Handler
 */
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INVALID_CSRF_TOKEN',
        message: 'Invalid or missing CSRF token'
      }
    });
  }
  next(err);
};

module.exports = {
  csrfProtection,
  csrfErrorHandler
};
