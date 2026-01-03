const logger = require('../utils/logger');
const { AppError, ExternalServiceError } = require('../errors/AppError');

/**
 * BaseAdapter - Abstract base class for all database adapters
 * Provides common error handling, logging, retry logic, and lifecycle management
 */
class BaseAdapter {
  constructor(config = {}) {
    this.config = config;
    this.name = this.constructor.name;
    this.isConnected = false;
    this.retryConfig = {
      maxRetries: config.maxRetries || 3,
      initialDelayMs: config.initialDelayMs || 100,
      maxDelayMs: config.maxDelayMs || 5000,
      backoffMultiplier: config.backoffMultiplier || 2
    };
  }

  /**
   * Execute a database operation with automatic retry logic
   * @param {Function} operation - Async function to execute
   * @param {string} operationName - Name of the operation for logging
   * @param {Object} options - Retry options
   * @returns {Promise} Result of the operation
   */
  async executeWithRetry(operation, operationName = 'operation', options = {}) {
    const maxRetries = options.maxRetries ?? this.retryConfig.maxRetries;
    const initialDelayMs = options.initialDelayMs ?? this.retryConfig.initialDelayMs;
    const maxDelayMs = options.maxDelayMs ?? this.retryConfig.maxDelayMs;
    const backoffMultiplier = options.backoffMultiplier ?? this.retryConfig.backoffMultiplier;

    let lastError;
    let delayMs = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`[${this.name}] Executing ${operationName} (attempt ${attempt + 1}/${maxRetries + 1})`);
        const result = await operation();
        
        if (attempt > 0) {
          logger.info(`[${this.name}] ${operationName} succeeded after ${attempt} retries`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          logger.warn(`[${this.name}] ${operationName} failed (attempt ${attempt + 1}), retrying in ${delayMs}ms`, {
            error: error.message,
            attempt: attempt + 1,
            maxRetries: maxRetries + 1
          });
          
          await this.delay(delayMs);
          delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
        } else {
          logger.error(`[${this.name}] ${operationName} failed after ${maxRetries + 1} attempts`, {
            error: error.message,
            stack: error.stack
          });
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute an operation with timeout
   * @param {Function} operation - Async function to execute
   * @param {number} timeoutMs - Timeout in milliseconds
   * @param {string} operationName - Name of the operation for logging
   * @returns {Promise} Result of the operation
   */
  async executeWithTimeout(operation, timeoutMs, operationName = 'operation') {
    return Promise.race([
      operation(),
      new Promise((_, reject) =>
        setTimeout(() => {
          const error = new AppError(
            `${operationName} timed out after ${timeoutMs}ms`,
            504,
            'TIMEOUT_ERROR',
            { timeoutMs, operationName }
          );
          logger.warn(`[${this.name}] ${operationName} timeout`, { timeoutMs });
          reject(error);
        }, timeoutMs)
      )
    ]);
  }

  /**
   * Execute an operation with both retry and timeout
   * @param {Function} operation - Async function to execute
   * @param {Object} options - Configuration options
   * @returns {Promise} Result of the operation
   */
  async executeWithRetryAndTimeout(operation, options = {}) {
    const {
      operationName = 'operation',
      timeoutMs = 30000,
      maxRetries = this.retryConfig.maxRetries,
      initialDelayMs = this.retryConfig.initialDelayMs,
      maxDelayMs = this.retryConfig.maxDelayMs,
      backoffMultiplier = this.retryConfig.backoffMultiplier
    } = options;

    return this.executeWithRetry(
      () => this.executeWithTimeout(operation, timeoutMs, operationName),
      operationName,
      { maxRetries, initialDelayMs, maxDelayMs, backoffMultiplier }
    );
  }

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle database connection errors
   * @param {Error} error - The error to handle
   * @param {string} context - Context information for logging
   * @throws {AppError} Processed error
   */
  handleConnectionError(error, context = '') {
    logger.error(`[${this.name}] Connection error: ${context}`, {
      error: error.message,
      stack: error.stack
    });

    if (error.code === 'ECONNREFUSED') {
      throw new AppError(
        `${this.name} connection refused`,
        503,
        'CONNECTION_REFUSED',
        { originalError: error.message, context }
      );
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'EHOSTUNREACH') {
      throw new AppError(
        `${this.name} connection timeout`,
        504,
        'CONNECTION_TIMEOUT',
        { originalError: error.message, context }
      );
    }

    throw new AppError(
      `${this.name} connection error: ${error.message}`,
      503,
      'CONNECTION_ERROR',
      { originalError: error.message, context }
    );
  }

  /**
   * Handle query execution errors
   * @param {Error} error - The error to handle
   * @param {string} query - The query that failed
   * @param {Array} params - Query parameters
   * @throws {AppError} Processed error
   */
  handleQueryError(error, query = '', params = []) {
    logger.error(`[${this.name}] Query error`, {
      error: error.message,
      query: query.substring(0, 200),
      paramsCount: params.length,
      stack: error.stack
    });

    if (error.code === 'QUERY_TIMEOUT' || error.message.includes('timeout')) {
      throw new AppError(
        'Query execution timeout',
        504,
        'QUERY_TIMEOUT',
        { originalError: error.message }
      );
    }

    if (error.code === 'SYNTAX_ERROR' || error.message.includes('syntax')) {
      throw new AppError(
        'Query syntax error',
        400,
        'QUERY_SYNTAX_ERROR',
        { originalError: error.message }
      );
    }

    throw new AppError(
      `Query execution failed: ${error.message}`,
      500,
      'QUERY_ERROR',
      { originalError: error.message }
    );
  }

  /**
   * Handle transaction errors
   * @param {Error} error - The error to handle
   * @param {string} context - Context information
   * @throws {AppError} Processed error
   */
  handleTransactionError(error, context = '') {
    logger.error(`[${this.name}] Transaction error: ${context}`, {
      error: error.message,
      stack: error.stack
    });

    throw new AppError(
      `Transaction failed: ${error.message}`,
      500,
      'TRANSACTION_ERROR',
      { originalError: error.message, context }
    );
  }

  /**
   * Log slow operation
   * @param {string} operationName - Name of the operation
   * @param {number} durationMs - Duration in milliseconds
   * @param {number} thresholdMs - Threshold for slow operation
   * @param {Object} metadata - Additional metadata
   */
  logSlowOperation(operationName, durationMs, thresholdMs = 100, metadata = {}) {
    if (durationMs > thresholdMs) {
      logger.warn(`[${this.name}] Slow operation detected: ${operationName}`, {
        durationMs,
        thresholdMs,
        ...metadata
      });
    }
  }

  /**
   * Validate adapter is connected
   * @throws {AppError} If adapter is not connected
   */
  validateConnection() {
    if (!this.isConnected) {
      throw new AppError(
        `${this.name} is not connected`,
        503,
        'NOT_CONNECTED',
        { adapter: this.name }
      );
    }
  }

  /**
   * Get adapter status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      adapter: this.name,
      isConnected: this.isConnected,
      config: {
        maxRetries: this.retryConfig.maxRetries,
        initialDelayMs: this.retryConfig.initialDelayMs,
        maxDelayMs: this.retryConfig.maxDelayMs,
        backoffMultiplier: this.retryConfig.backoffMultiplier
      }
    };
  }

  /**
   * Abstract method - must be implemented by subclasses
   * @throws {Error} Not implemented
   */
  async connect() {
    throw new Error(`${this.name}.connect() must be implemented by subclass`);
  }

  /**
   * Abstract method - must be implemented by subclasses
   * @throws {Error} Not implemented
   */
  async close() {
    throw new Error(`${this.name}.close() must be implemented by subclass`);
  }

  /**
   * Abstract method - must be implemented by subclasses
   * @throws {Error} Not implemented
   */
  async healthCheck() {
    throw new Error(`${this.name}.healthCheck() must be implemented by subclass`);
  }
}

module.exports = BaseAdapter;
