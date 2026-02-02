const { v4: uuidv4 } = require('uuid');
const httpContext = require('express-http-context');

/**
 * Request ID Middleware
 * Assigns a unique ID to every request for distributed tracing.
 * Uses 'express-http-context' to make the ID available to the logger implicitly.
 */
const requestId = (req, res, next) => {
    // Check for existing ID from upstream (e.g. Load Balancer)
    const traceId = req.headers['x-request-id'] || req.headers['x-correlation-id'] || uuidv4();

    // Set for downstream / response
    req.id = traceId;
    res.setHeader('x-request-id', traceId);

    // Store in Context for Logger access
    httpContext.set('requestId', traceId);

    next();
};

module.exports = requestId;
