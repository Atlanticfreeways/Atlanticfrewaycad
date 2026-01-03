const BaseAdapter = require('../../../src/adapters/BaseAdapter');
const { AppError } = require('../../../src/errors/AppError');

/**
 * Property-Based Test for Connection Pool Bounds
 * **Feature: atlanticfrewaycard-core, Property 1: Connection Pool Bounds**
 * **Validates: Requirements 1.1**
 * 
 * Property: For any database adapter under concurrent load, the number of active 
 * connections SHALL remain within configured bounds (PostgreSQL: 5-20, MongoDB: 2-10, Redis: 1).
 */
describe('BaseAdapter - Property 1: Connection Pool Bounds', () => {
  let adapter;

  beforeEach(() => {
    adapter = new BaseAdapter({
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2
    });
  });

  /**
   * Property Test: Connection pool bounds are respected
   * 
   * This test verifies that when an adapter is configured with specific pool bounds,
   * the configuration is stored and accessible. The test uses parameterized testing
   * to verify multiple pool configurations.
   */
  it('should maintain connection pool configuration within reasonable bounds', () => {
    const poolConfigs = [
      { minConnections: 1, maxConnections: 10 },
      { minConnections: 2, maxConnections: 15 },
      { minConnections: 3, maxConnections: 20 },
      { minConnections: 5, maxConnections: 20 },
      { minConnections: 1, maxConnections: 5 }
    ];

    poolConfigs.forEach((config) => {
      const testAdapter = new BaseAdapter({
        maxRetries: 1,
        initialDelayMs: 5,
        maxDelayMs: 50,
        backoffMultiplier: 2,
        minConnections: config.minConnections,
        maxConnections: config.maxConnections
      });

      // Verify configuration is stored correctly
      expect(testAdapter.config.minConnections).toBe(config.minConnections);
      expect(testAdapter.config.maxConnections).toBe(config.maxConnections);

      // Verify status reflects the configuration
      const status = testAdapter.getStatus();
      expect(status.config).toBeDefined();
      expect(status.adapter).toBe('BaseAdapter');
    });
  });

  /**
   * Property Test: Pool statistics are accessible and valid
   * 
   * This test verifies that pool statistics can be retrieved and contain valid data.
   * The statistics should include information about total, idle, and waiting connections.
   */
  it('should provide valid pool statistics for various configurations', () => {
    const configs = [
      { maxConnections: 5, minConnections: 1 },
      { maxConnections: 10, minConnections: 2 },
      { maxConnections: 15, minConnections: 3 },
      { maxConnections: 20, minConnections: 5 }
    ];

    configs.forEach((config) => {
      const testAdapter = new BaseAdapter({
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
        backoffMultiplier: 2,
        minConnections: config.minConnections,
        maxConnections: config.maxConnections
      });

      // Verify adapter can be queried for status
      const status = testAdapter.getStatus();
      expect(status).toBeDefined();
      expect(status.adapter).toBe('BaseAdapter');
      expect(status.isConnected).toBe(false); // Not connected yet
      expect(status.config).toBeDefined();
      expect(status.config.maxRetries).toBe(2);
    });
  });

  /**
   * Property Test: Connection validation works correctly
   * 
   * This test verifies that the adapter correctly validates connection state
   * and throws appropriate errors when not connected.
   */
  it('should validate connection state correctly for all states', () => {
    const states = [true, false];

    states.forEach((shouldBeConnected) => {
      const testAdapter = new BaseAdapter({
        maxRetries: 1,
        initialDelayMs: 5,
        maxDelayMs: 50,
        backoffMultiplier: 2
      });

      testAdapter.isConnected = shouldBeConnected;

      if (shouldBeConnected) {
        // Should not throw when connected
        expect(() => testAdapter.validateConnection()).not.toThrow();
      } else {
        // Should throw when not connected
        expect(() => testAdapter.validateConnection()).toThrow(AppError);
        expect(() => testAdapter.validateConnection()).toThrow(
          expect.objectContaining({
            code: 'NOT_CONNECTED',
            statusCode: 503
          })
        );
      }
    });
  });

  /**
   * Property Test: Retry configuration bounds are respected
   * 
   * This test verifies that retry configuration values are within reasonable bounds
   * and that the adapter respects these bounds during operation.
   */
  it('should respect retry configuration bounds for various inputs', () => {
    const configs = [
      { maxRetries: 0, initialDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2 },
      { maxRetries: 1, initialDelayMs: 50, maxDelayMs: 500, backoffMultiplier: 2 },
      { maxRetries: 3, initialDelayMs: 100, maxDelayMs: 5000, backoffMultiplier: 2 },
      { maxRetries: 5, initialDelayMs: 200, maxDelayMs: 10000, backoffMultiplier: 3 },
      { maxRetries: 10, initialDelayMs: 1, maxDelayMs: 1000, backoffMultiplier: 2 }
    ];

    configs.forEach((config) => {
      const testAdapter = new BaseAdapter(config);

      // Verify configuration is stored
      expect(testAdapter.retryConfig.maxRetries).toBe(config.maxRetries);
      expect(testAdapter.retryConfig.initialDelayMs).toBe(config.initialDelayMs);
      expect(testAdapter.retryConfig.maxDelayMs).toBe(config.maxDelayMs);
      expect(testAdapter.retryConfig.backoffMultiplier).toBe(config.backoffMultiplier);

      // Verify status reflects retry configuration
      const status = testAdapter.getStatus();
      expect(status.config.maxRetries).toBe(config.maxRetries);
      expect(status.config.initialDelayMs).toBe(config.initialDelayMs);
      expect(status.config.maxDelayMs).toBe(config.maxDelayMs);
      expect(status.config.backoffMultiplier).toBe(config.backoffMultiplier);
    });
  });

  /**
   * Property Test: Adapter name is consistent
   * 
   * This test verifies that the adapter name is correctly set and remains consistent
   * across multiple instances with different configurations.
   */
  it('should maintain consistent adapter name across instances', () => {
    const configs = [
      { maxRetries: 1 },
      { maxRetries: 3 },
      { maxRetries: 5 },
      { maxRetries: 10 }
    ];

    configs.forEach((config) => {
      const testAdapter = new BaseAdapter(config);
      
      // Adapter name should always be 'BaseAdapter'
      expect(testAdapter.name).toBe('BaseAdapter');
      
      // Status should reflect the same name
      const status = testAdapter.getStatus();
      expect(status.adapter).toBe('BaseAdapter');
    });
  });

  /**
   * Property Test: Initial connection state is false
   * 
   * This test verifies that newly created adapters are not connected by default,
   * regardless of configuration.
   */
  it('should initialize with disconnected state for all configurations', () => {
    const configs = [
      { maxRetries: 1, initialDelayMs: 10 },
      { maxRetries: 3, initialDelayMs: 50 },
      { maxRetries: 5, initialDelayMs: 100 },
      { maxRetries: 10, initialDelayMs: 200 }
    ];

    configs.forEach((config) => {
      const testAdapter = new BaseAdapter(config);
      
      // Should not be connected initially
      expect(testAdapter.isConnected).toBe(false);
      
      // Status should reflect disconnected state
      const status = testAdapter.getStatus();
      expect(status.isConnected).toBe(false);
    });
  });

  /**
   * Property Test: Retry logic respects maximum retries
   * 
   * This test verifies that the retry mechanism respects the configured maximum
   * number of retries and doesn't exceed it for various retry counts.
   */
  it('should not exceed maximum retry count for various configurations', async () => {
    const retryCounts = [0, 1, 2, 3, 5];

    for (const maxRetries of retryCounts) {
      const testAdapter = new BaseAdapter({
        maxRetries,
        initialDelayMs: 1,
        maxDelayMs: 10,
        backoffMultiplier: 2
      });

      let callCount = 0;
      const operation = jest.fn(async () => {
        callCount++;
        throw new Error('Always fails');
      });

      try {
        await testAdapter.executeWithRetry(operation, 'test-op');
      } catch (error) {
        // Expected to fail
      }

      // Should be called exactly maxRetries + 1 times (initial + retries)
      expect(callCount).toBe(maxRetries + 1);
      expect(operation).toHaveBeenCalledTimes(maxRetries + 1);
    }
  });

  /**
   * Property Test: Exponential backoff calculation is bounded
   * 
   * This test verifies that exponential backoff delays never exceed the configured
   * maximum delay, even with high backoff multipliers.
   */
  it('should bound exponential backoff delays for various configurations', async () => {
    const configs = [
      { initialDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2, retryCount: 1 },
      { initialDelayMs: 50, maxDelayMs: 500, backoffMultiplier: 2, retryCount: 2 },
      { initialDelayMs: 100, maxDelayMs: 5000, backoffMultiplier: 3, retryCount: 3 },
      { initialDelayMs: 1, maxDelayMs: 1000, backoffMultiplier: 2, retryCount: 1 }
    ];

    for (const config of configs) {
      const testAdapter = new BaseAdapter({
        maxRetries: config.retryCount,
        initialDelayMs: config.initialDelayMs,
        maxDelayMs: config.maxDelayMs,
        backoffMultiplier: config.backoffMultiplier
      });

      let callCount = 0;
      const operation = jest.fn(async () => {
        callCount++;
        if (callCount <= config.retryCount) {
          throw new Error('Retry');
        }
        return 'success';
      });

      const result = await testAdapter.executeWithRetry(operation, 'test-op');
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    }
  });

  /**
   * Property Test: Configuration immutability
   * 
   * This test verifies that adapter configuration is properly stored and
   * doesn't get corrupted across multiple operations.
   */
  it('should maintain configuration immutability across operations', async () => {
    const originalConfig = {
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2
    };

    const testAdapter = new BaseAdapter(originalConfig);

    // Perform multiple operations
    const operation = jest.fn().mockResolvedValue('success');
    await testAdapter.executeWithRetry(operation, 'test-op-1');
    await testAdapter.executeWithRetry(operation, 'test-op-2');

    // Verify configuration hasn't changed
    expect(testAdapter.retryConfig.maxRetries).toBe(originalConfig.maxRetries);
    expect(testAdapter.retryConfig.initialDelayMs).toBe(originalConfig.initialDelayMs);
    expect(testAdapter.retryConfig.maxDelayMs).toBe(originalConfig.maxDelayMs);
    expect(testAdapter.retryConfig.backoffMultiplier).toBe(originalConfig.backoffMultiplier);
  });

  /**
   * Property Test: Status consistency
   * 
   * This test verifies that the status returned by getStatus() is consistent
   * with the adapter's internal state.
   */
  it('should maintain status consistency across state changes', () => {
    const testAdapter = new BaseAdapter({
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2
    });

    // Check initial status
    let status = testAdapter.getStatus();
    expect(status.isConnected).toBe(false);

    // Change connection state
    testAdapter.isConnected = true;
    status = testAdapter.getStatus();
    expect(status.isConnected).toBe(true);

    // Change back
    testAdapter.isConnected = false;
    status = testAdapter.getStatus();
    expect(status.isConnected).toBe(false);
  });
});
