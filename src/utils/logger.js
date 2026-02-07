const winston = require('winston');
const path = require('path');

/**
 * Winston Logger Configuration
 * Structured logging with different transports
 */

const httpContext = require('express-http-context');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    // Inject RequestId if available
    const requestId = httpContext.get('requestId');
    if (requestId) {
      info.requestId = requestId;
    }
    return info;
  })(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'atlanticfrewaycard' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? logFormat
        : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
    })
  ]
});

// Add File transports only if explicitly configured or in non-production environments
// This avoids EACCES errors in cloud environments like Render
if (process.env.ENABLE_FILE_LOGGING === 'true' || process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));

  logger.add(new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    maxsize: 5242880,
    maxFiles: 5
  }));
}

module.exports = logger;
