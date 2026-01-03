const logger = require('./logger');
const { AppError } = require('../errors/AppError');

/**
 * Retry utilities for handling transient failures with exponential backoff
 */

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} initialDelayMs - Initial delay in milliseconds
 * @param {number} maxDelayMs - Maximum delay in milliseconds
 * @param {number} multiplier - Backoff multiplier
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(attempt, initialDelayMs = 100, maxDelayMs = 5000, multiplier = 2) {
  const delay = initialDelayMs * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelayMs);
}

/**
 * Add jitter to delay to prevent thundering herd
 * @param {number} delayMs - Base delay in milliseconds
 * @param {number} jitterPercent - Jitter percentage (0-100)
 * @returns {number} Delay with jitter in milliseconds
 */
function addJitter(delayMs, jitterPercent = 10) {
  const jitterAmount = (delayMs * jitterPercent) / 100;
  const jitter = Math.random() * jitterAmount - jitterAmount / 2;
  return Math.max(0, delayMs + jitter);
}

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Resolves after delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an operation with exponential backoff
 * @param {Function} operation - Async function to execute
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the operation
 */
async function retryWithBackoff(operation, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    jitterPercent = 10,
    operationName = 'operation',
    onRetry = null,
    shouldRetry = null
  } = options;

  let lastError;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`Executing ${operationName} (attempt ${attempt + 1}/${maxRetries + 1})`);
      const result = await operation();

      if (attempt > 0) {
        logger.info(`${operationName} succeeded after ${attempt} retries`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        logger.error(`${operationName} failed with non-retryable error`, {
          error: error.message
        });
        throw error;
      }

      if (attempt < maxRetries) {
        const jitteredDelay = addJitter(delayMs, jitterPercent);
        logger.warn(`${operationName} failed (attempt ${attempt + 1}), retrying in ${jitteredDelay}ms`, {
          error: error.message,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1
        });

        if (onRetry) {
          onRetry(attempt, error, jitteredDelay);
        }

        await delay(jitteredDelay);
        delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
      } else {
        logger.error(`${operationName} failed after ${maxRetries + 1} attempts`, {
          error: error.message,
          stack: error.stack
        });
      }
    }
  }

  throw lastError;
}

/**
 * Retry an operation with timeout
 * @param {Function} operation - Async function to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operationName - Name of the operation
 * @returns {Promise} Result of the operation
 */
async function executeWithTimeout(operation, timeoutMs, operationName = 'operation') {
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
        logger.warn(`${operationName} timeout`, { timeoutMs });
        reject(error);
      }, timeoutMs)
    )
  ]);
}

/**
 * Retry an operation with both retry and timeout
 * @param {Function} operation - Async function to execute
 * @param {Object} options - Configuration options
 * @returns {Promise} Result of the operation
 */
async function retryWithBackoffAndTimeout(operation, options = {}) {
  const {
    operationName = 'operation',
    timeoutMs = 30000,
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    jitterPercent = 10,
    onRetry = null,
    shouldRetry = null
  } = options;

  return retryWithBackoff(
    () => executeWithTimeout(operation, timeoutMs, operationName),
    {
      operationName,
      maxRetries,
      initialDelayMs,
      maxDelayMs,
      backoffMultiplier,
      jitterPercent,
      onRetry,
      shouldRetry
    }
  );
}

/**
 * Determine if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if error is retryable
 */
function isRetryableError(error) {
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'EHOSTUNREACH') {
    return true;
  }

  // Timeout errors
  if (error.code === 'TIMEOUT_ERROR' || error.message.includes('timeout')) {
    return true;
  }

  // Database connection errors
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
    return true;
  }

  // HTTP 5xx errors (server errors)
  if (error.statusCode && error.statusCode >= 500) {
    return true;
  }

  // HTTP 429 (Too Many Requests)
  if (error.statusCode === 429) {
    return true;
  }

  return false;
}

module.exports = {
  calculateBackoffDelay,
  addJitter,
  delay,
  retryWithBackoff,
  executeWithTimeout,
  retryWithBackoffAndTimeout,
  isRetryableError
};
