const BaseAdapter = require('../../../src/adapters/BaseAdapter');
const { AppError } = require('../../../src/errors/AppError');

describe('BaseAdapter', () => {
  let adapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new BaseAdapter({
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2
    });
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const defaultAdapter = new BaseAdapter();
      expect(defaultAdapter.name).toBe('BaseAdapter');
      expect(defaultAdapter.isConnected).toBe(false);
      expect(defaultAdapter.retryConfig.maxRetries).toBe(3);
      expect(defaultAdapter.retryConfig.initialDelayMs).toBe(100);
    });

    it('should initialize with custom config', () => {
      expect(adapter.retryConfig.maxRetries).toBe(3);
      expect(adapter.retryConfig.initialDelayMs).toBe(10);
      expect(adapter.retryConfig.maxDelayMs).toBe(100);
      expect(adapter.retryConfig.backoffMultiplier).toBe(2);
    });
  });

  describe('executeWithRetry', () => {
    it('should execute operation successfully on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await adapter.executeWithRetry(operation, 'test-op');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');

      const result = await adapter.executeWithRetry(operation, 'test-op');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries exceeded', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent failure'));

      await expect(adapter.executeWithRetry(operation, 'test-op')).rejects.toThrow('persistent failure');
      expect(operation).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    it('should respect custom retry options', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');

      const result = await adapter.executeWithRetry(operation, 'test-op', {
        maxRetries: 1,
        initialDelayMs: 5
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should apply exponential backoff', async () => {
      jest.useFakeTimers();
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');

      const promise = adapter.executeWithRetry(operation, 'test-op', {
        maxRetries: 2,
        initialDelayMs: 10,
        backoffMultiplier: 2
      });

      // First retry after 10ms
      jest.advanceTimersByTime(10);
      await Promise.resolve();

      // Second retry after 20ms (10 * 2)
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      const result = await promise;
      expect(result).toBe('success');

      jest.useRealTimers();
    });
  });

  describe('executeWithTimeout', () => {
    it('should execute operation successfully within timeout', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await adapter.executeWithTimeout(operation, 1000, 'test-op');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should throw timeout error when operation exceeds timeout', async () => {
      jest.useFakeTimers();
      const operation = jest.fn(() => new Promise(() => {})); // Never resolves

      const promise = adapter.executeWithTimeout(operation, 100, 'test-op');

      jest.advanceTimersByTime(100);
      await expect(promise).rejects.toThrow('timed out after 100ms');

      jest.useRealTimers();
    }, 10000);

    it('should throw AppError with correct status code on timeout', async () => {
      jest.useFakeTimers();
      const operation = jest.fn(() => new Promise(() => {}));

      const promise = adapter.executeWithTimeout(operation, 100, 'test-op');

      jest.advanceTimersByTime(100);

      try {
        await promise;
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(504);
        expect(error.code).toBe('TIMEOUT_ERROR');
      }

      jest.useRealTimers();
    });
  });

  describe('executeWithRetryAndTimeout', () => {
    it('should execute operation with both retry and timeout', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await adapter.executeWithRetryAndTimeout(operation, {
        operationName: 'test-op',
        timeoutMs: 1000,
        maxRetries: 2
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on timeout', async () => {
      jest.useFakeTimers();
      const operation = jest.fn()
        .mockImplementationOnce(() => new Promise(() => {})) // Timeout
        .mockResolvedValueOnce('success');

      const promise = adapter.executeWithRetryAndTimeout(operation, {
        operationName: 'test-op',
        timeoutMs: 50,
        maxRetries: 1,
        initialDelayMs: 10
      });

      jest.advanceTimersByTime(50);
      await Promise.resolve();

      jest.advanceTimersByTime(10);
      await Promise.resolve();

      const result = await promise;
      expect(result).toBe('success');

      jest.useRealTimers();
    });
  });

  describe('delay', () => {
    it('should delay execution', async () => {
      jest.useFakeTimers();
      const start = Date.now();
      const delayPromise = adapter.delay(100);

      jest.advanceTimersByTime(100);
      await delayPromise;

      expect(Date.now() - start).toBe(100);
      jest.useRealTimers();
    });
  });

  describe('handleConnectionError', () => {
    it('should throw CONNECTION_REFUSED error for ECONNREFUSED', () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';

      expect(() => adapter.handleConnectionError(error, 'test context')).toThrow(AppError);
      expect(() => adapter.handleConnectionError(error, 'test context')).toThrow(
        expect.objectContaining({
          code: 'CONNECTION_REFUSED',
          statusCode: 503
        })
      );
    });

    it('should throw CONNECTION_TIMEOUT error for ETIMEDOUT', () => {
      const error = new Error('Connection timeout');
      error.code = 'ETIMEDOUT';

      expect(() => adapter.handleConnectionError(error, 'test context')).toThrow(AppError);
      expect(() => adapter.handleConnectionError(error, 'test context')).toThrow(
        expect.objectContaining({
          code: 'CONNECTION_TIMEOUT',
          statusCode: 504
        })
      );
    });

    it('should throw CONNECTION_ERROR for other connection errors', () => {
      const error = new Error('Unknown connection error');

      expect(() => adapter.handleConnectionError(error, 'test context')).toThrow(AppError);
      expect(() => adapter.handleConnectionError(error, 'test context')).toThrow(
        expect.objectContaining({
          code: 'CONNECTION_ERROR',
          statusCode: 503
        })
      );
    });

    it('should include context in error details', () => {
      const error = new Error('Connection error');
      error.code = 'ECONNREFUSED';

      try {
        adapter.handleConnectionError(error, 'test context');
      } catch (e) {
        expect(e.details.context).toBe('test context');
      }
    });
  });

  describe('handleQueryError', () => {
    it('should throw QUERY_TIMEOUT error for timeout', () => {
      const error = new Error('Query timeout');
      error.code = 'QUERY_TIMEOUT';

      expect(() => adapter.handleQueryError(error, 'SELECT *', [])).toThrow(AppError);
      expect(() => adapter.handleQueryError(error, 'SELECT *', [])).toThrow(
        expect.objectContaining({
          code: 'QUERY_TIMEOUT',
          statusCode: 504
        })
      );
    });

    it('should throw QUERY_SYNTAX_ERROR for syntax errors', () => {
      const error = new Error('syntax error');

      expect(() => adapter.handleQueryError(error, 'INVALID SQL', [])).toThrow(AppError);
      expect(() => adapter.handleQueryError(error, 'INVALID SQL', [])).toThrow(
        expect.objectContaining({
          code: 'QUERY_SYNTAX_ERROR',
          statusCode: 400
        })
      );
    });

    it('should throw QUERY_ERROR for other query errors', () => {
      const error = new Error('Unknown query error');

      expect(() => adapter.handleQueryError(error, 'SELECT *', [])).toThrow(AppError);
      expect(() => adapter.handleQueryError(error, 'SELECT *', [])).toThrow(
        expect.objectContaining({
          code: 'QUERY_ERROR',
          statusCode: 500
        })
      );
    });

    it('should handle query error with parameters', () => {
      const error = new Error('Query error');
      const longQuery = 'SELECT * FROM very_long_query_' + 'x'.repeat(200);

      try {
        adapter.handleQueryError(error, longQuery, [1, 2, 3]);
      } catch (e) {
        expect(e).toBeInstanceOf(AppError);
        expect(e.statusCode).toBe(500);
      }
    });
  });

  describe('handleTransactionError', () => {
    it('should throw TRANSACTION_ERROR', () => {
      const error = new Error('Transaction failed');

      expect(() => adapter.handleTransactionError(error, 'test context')).toThrow(AppError);
      expect(() => adapter.handleTransactionError(error, 'test context')).toThrow(
        expect.objectContaining({
          code: 'TRANSACTION_ERROR',
          statusCode: 500
        })
      );
    });

    it('should include context in transaction error', () => {
      const error = new Error('Transaction failed');

      try {
        adapter.handleTransactionError(error, 'test context');
      } catch (e) {
        expect(e.details.context).toBe('test context');
      }
    });
  });

  describe('logSlowOperation', () => {
    it('should not throw when logging slow operation', () => {
      expect(() => adapter.logSlowOperation('test-op', 150, 100, { metadata: 'value' })).not.toThrow();
    });

    it('should not throw when duration is below threshold', () => {
      expect(() => adapter.logSlowOperation('test-op', 50, 100)).not.toThrow();
    });

    it('should use default threshold of 100ms', () => {
      expect(() => adapter.logSlowOperation('test-op', 150)).not.toThrow();
    });
  });

  describe('validateConnection', () => {
    it('should not throw when connected', () => {
      adapter.isConnected = true;
      expect(() => adapter.validateConnection()).not.toThrow();
    });

    it('should throw NOT_CONNECTED error when not connected', () => {
      adapter.isConnected = false;

      expect(() => adapter.validateConnection()).toThrow(AppError);
      expect(() => adapter.validateConnection()).toThrow(
        expect.objectContaining({
          code: 'NOT_CONNECTED',
          statusCode: 503
        })
      );
    });
  });

  describe('getStatus', () => {
    it('should return adapter status', () => {
      adapter.isConnected = true;
      const status = adapter.getStatus();

      expect(status).toEqual({
        adapter: 'BaseAdapter',
        isConnected: true,
        config: {
          maxRetries: 3,
          initialDelayMs: 10,
          maxDelayMs: 100,
          backoffMultiplier: 2
        }
      });
    });
  });

  describe('abstract methods', () => {
    it('should throw error for connect method', async () => {
      await expect(adapter.connect()).rejects.toThrow('BaseAdapter.connect() must be implemented by subclass');
    });

    it('should throw error for close method', async () => {
      await expect(adapter.close()).rejects.toThrow('BaseAdapter.close() must be implemented by subclass');
    });

    it('should throw error for healthCheck method', async () => {
      await expect(adapter.healthCheck()).rejects.toThrow('BaseAdapter.healthCheck() must be implemented by subclass');
    });
  });
});
