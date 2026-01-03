const Sentry = require("@sentry/node");
const logger = require('../utils/logger');

class ErrorTracking {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        if (process.env.SENTRY_DSN) {
            Sentry.init({
                dsn: process.env.SENTRY_DSN,
                environment: process.env.NODE_ENV || 'development',
                tracesSampleRate: 1.0,
            });
            this.initialized = true;
            logger.info('Sentry initialized');
        } else {
            logger.warn('Sentry DSN not provided, error tracking disabled');
        }
    }

    captureException(error, context = {}) {
        if (!this.initialized) {
            logger.error('Error (Sentry disabled):', error, context);
            return;
        }

        Sentry.withScope(scope => {
            if (context.user) {
                scope.setUser(context.user);
            }
            if (context.tags) {
                Object.entries(context.tags).forEach(([key, value]) => {
                    scope.setTag(key, value);
                });
            }
            if (context.extra) {
                Object.entries(context.extra).forEach(([key, value]) => {
                    scope.setExtra(key, value);
                });
            }
            Sentry.captureException(error);
        });
    }

    requestHandler() {
        return Sentry.Handlers.requestHandler();
    }

    errorHandler() {
        return Sentry.Handlers.errorHandler();
    }
}

module.exports = new ErrorTracking();
