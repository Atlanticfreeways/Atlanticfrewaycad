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
    sameSite: 'lax',
    path: '/'
  }
});

/**
 * CSRF Error Handler
 */
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF Error:', {
      message: err.message,
      tokenInHeader: req.headers['x-csrf-token'],
      allHeaders: req.headers,
      cookies: req.cookies
    });
    return res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF token',
      code: 'INVALID_CSRF_TOKEN'
    });
  }
  next(err);
};

module.exports = {
  csrfProtection,
  csrfErrorHandler
};
