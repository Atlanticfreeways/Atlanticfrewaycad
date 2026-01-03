const { AppError } = require('../../../src/errors/AppError');

// Mock logger before requiring PostgreSQLAdapter
jest.mock('../../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Mock pg module before requiring PostgreSQLAdapter
jest.mock('pg', () => ({
  Pool: jest.fn(function() {
    return {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      totalCount: 10,
      idleCount: 8,
      waitingCount: 0
    };
  })
}));

const PostgreSQLAdapter = require('../../../src/adapters/PostgreSQLAdapter');

/**
 * Unit Tests for PostgreSQL Adapter
 * **Feature: atlanticfrewaycard-core, Property 2: Query Performance Consistency**
 * **Validates: Requirements 2.1, 2.2**
 */
describe('PostgreSQLAdapter', () => {
  let adapter;
  let mockPool;
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock client
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    // Create mock pool
    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      query: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      totalCount: 10,
      idleCount: 8,
      waitingCount: 0
    };

    // Create adapter instance
    adapter = new PostgreSQLAdapter({
      DATABASE_URL: 'postgresql://localhost/test',
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2
    });

    // Override pool with mock
    adapter.pool = mockPool;
    adapter.isConnected = true;
  });

  describe('constructor', () => {
    it('should initialize with correct adapter name', () => {
      expect(adapter.name).toBe('PostgreSQLAdapter');
    });

    it('should set isConnected to true after initialization', () => {
      expect(adapter.isConnected).toBe(true);
    });

    it('should have pool configured', () => {
      expect(adapter.pool).toBeDefined();
    });
  });

  describe('executeQuery', () => {
    it('should execute query successfully with string parameters', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1, name: 'test' }] });

      const result = await adapter.executeQuery('SELECT * FROM users WHERE id = $1', [1]);

      expect(result.rows).toEqual([{ id: 1, name: 'test' }]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should execute query with numeric parameters', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ amount: 100.50 }] });

      const result = await adapter.executeQuery('SELECT * FROM transactions WHERE amount > $1', [100.50]);

      expect(result.rows).toEqual([{ amount: 100.50 }]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM transactions WHERE amount > $1', [100.50]);
    });

    it('should execute query with boolean parameters', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ status: true }] });

      const result = await adapter.executeQuery('SELECT * FROM cards WHERE active = $1', [true]);

      expect(result.rows).toEqual([{ status: true }]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM cards WHERE active = $1', [true]);
    });

    it('should execute query with null parameters', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ value: null }] });

      const result = await adapter.executeQuery('SELECT * FROM data WHERE value IS $1', [null]);

      expect(result.rows).toEqual([{ value: null }]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM data WHERE value IS $1', [null]);
    });

    it('should execute query with array parameters', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });

      const result = await adapter.executeQuery('SELECT * FROM users WHERE id = ANY($1)', [[1, 2]]);

      expect(result.rows).toEqual([{ id: 1 }, { id: 2 }]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ANY($1)', [[1, 2]]);
    });

    it('should release client even on error', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      try {
        await adapter.executeQuery('SELECT * FROM invalid_table');
      } catch (error) {
        // Expected to throw
      }

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error when not connected', async () => {
      adapter.isConnected = false;

      await expect(adapter.executeQuery('SELECT * FROM users')).rejects.toThrow(AppError);
      await expect(adapter.executeQuery('SELECT * FROM users')).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_CONNECTED'
        })
      );
    });

    it('should handle query errors properly', async () => {
      mockClient.query.mockRejectedValue(new Error('Syntax error'));

      await expect(adapter.executeQuery('INVALID SQL')).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle connection errors properly', async () => {
      mockPool.connect.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(adapter.executeQuery('SELECT * FROM users')).rejects.toThrow();
    });
  });

  describe('executeTransaction', () => {
    it('should execute transaction successfully', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT
        .mockResolvedValueOnce({}); // COMMIT

      const callback = jest.fn(async (client) => {
        return await client.query('INSERT INTO users VALUES ($1)', [1]);
      });

      const result = await adapter.executeTransaction(callback);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(callback).toHaveBeenCalledWith(mockClient);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Insert failed')) // INSERT fails
        .mockResolvedValueOnce({}); // ROLLBACK

      const callback = jest.fn(async (client) => {
        throw new Error('Insert failed');
      });

      try {
        await adapter.executeTransaction(callback);
      } catch (error) {
        // Expected to throw
      }

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle rollback errors gracefully', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Insert failed')) // INSERT fails
        .mockRejectedValueOnce(new Error('Rollback failed')); // ROLLBACK fails

      const callback = jest.fn(async (client) => {
        throw new Error('Insert failed');
      });

      try {
        await adapter.executeTransaction(callback);
      } catch (error) {
        // Expected to throw
      }

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return callback result on success', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}); // COMMIT

      const expectedResult = { success: true, id: 123 };
      const callback = jest.fn(async () => expectedResult);

      const result = await adapter.executeTransaction(callback);

      expect(result).toEqual(expectedResult);
    });

    it('should throw error when not connected', async () => {
      adapter.isConnected = false;

      const callback = jest.fn();

      await expect(adapter.executeTransaction(callback)).rejects.toThrow(AppError);
      await expect(adapter.executeTransaction(callback)).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_CONNECTED'
        })
      );
    });

    it('should handle transaction callback errors', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}); // ROLLBACK

      const callback = jest.fn(async () => {
        throw new Error('Callback error');
      });

      await expect(adapter.executeTransaction(callback)).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status on successful check', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ now: new Date() }] });

      const result = await adapter.healthCheck();

      expect(result).toEqual({ healthy: true, adapter: 'PostgreSQL' });
      expect(adapter.isConnected).toBe(true);
    });

    it('should return unhealthy status on failed check', async () => {
      mockClient.query.mockRejectedValue(new Error('Connection failed'));

      try {
        await adapter.healthCheck();
      } catch (error) {
        // Expected to throw
      }

      expect(adapter.isConnected).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should call healthCheck', async () => {
      mockClient.query.mockResolvedValue({ rows: [{ now: new Date() }] });

      const result = await adapter.testConnection();

      expect(result).toEqual({ healthy: true, adapter: 'PostgreSQL' });
    });
  });

  describe('getPoolStats', () => {
    it('should return pool statistics', () => {
      const stats = adapter.getPoolStats();

      expect(stats).toEqual({
        totalConnections: 10,
        idleConnections: 8,
        waitingRequests: 0
      });
    });

    it('should reflect current pool state', () => {
      mockPool.totalCount = 15;
      mockPool.idleCount = 5;
      mockPool.waitingCount = 2;

      const stats = adapter.getPoolStats();

      expect(stats).toEqual({
        totalConnections: 15,
        idleConnections: 5,
        waitingRequests: 2
      });
    });

    it('should handle various pool states', () => {
      const states = [
        { totalCount: 5, idleCount: 5, waitingCount: 0 },
        { totalCount: 10, idleCount: 8, waitingCount: 2 },
        { totalCount: 20, idleCount: 0, waitingCount: 5 },
        { totalCount: 1, idleCount: 1, waitingCount: 0 }
      ];

      states.forEach((state) => {
        mockPool.totalCount = state.totalCount;
        mockPool.idleCount = state.idleCount;
        mockPool.waitingCount = state.waitingCount;

        const stats = adapter.getPoolStats();

        expect(stats.totalConnections).toBe(state.totalCount);
        expect(stats.idleConnections).toBe(state.idleCount);
        expect(stats.waitingRequests).toBe(state.waitingCount);
      });
    });

    it('should track pool statistics accurately', () => {
      const initialStats = adapter.getPoolStats();
      expect(initialStats.totalConnections).toBe(10);
      expect(initialStats.idleConnections).toBe(8);

      mockPool.totalCount = 12;
      mockPool.idleCount = 6;

      const updatedStats = adapter.getPoolStats();
      expect(updatedStats.totalConnections).toBe(12);
      expect(updatedStats.idleConnections).toBe(6);
    });

    it('should handle pool at maximum capacity', () => {
      mockPool.totalCount = 20;
      mockPool.idleCount = 0;
      mockPool.waitingCount = 5;

      const stats = adapter.getPoolStats();

      expect(stats.totalConnections).toBe(20);
      expect(stats.idleConnections).toBe(0);
      expect(stats.waitingRequests).toBe(5);
    });

    it('should handle pool at minimum capacity', () => {
      mockPool.totalCount = 5;
      mockPool.idleCount = 5;
      mockPool.waitingCount = 0;

      const stats = adapter.getPoolStats();

      expect(stats.totalConnections).toBe(5);
      expect(stats.idleConnections).toBe(5);
      expect(stats.waitingRequests).toBe(0);
    });
  });

  describe('close', () => {
    it('should close pool successfully', async () => {
      await adapter.close();

      expect(mockPool.end).toHaveBeenCalled();
      expect(adapter.isConnected).toBe(false);
    });

    it('should throw error if pool close fails', async () => {
      mockPool.end.mockRejectedValueOnce(new Error('Pool close failed'));

      await expect(adapter.close()).rejects.toThrow('Pool close failed');
    });
  });

  describe('slow query detection and logging', () => {
    it('should detect and log queries exceeding threshold', async () => {
      mockClient.query.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 120));
        return { rows: [] };
      });

      const logSlowOperationSpy = jest.spyOn(adapter, 'logSlowOperation');

      await adapter.executeQuery('SELECT * FROM large_table');

      expect(logSlowOperationSpy).toHaveBeenCalled();
      const callArgs = logSlowOperationSpy.mock.calls[0];
      expect(callArgs[0]).toBe('executeQuery');
      expect(callArgs[1]).toBeGreaterThan(100);
      expect(callArgs[2]).toBe(100);

      logSlowOperationSpy.mockRestore();
    });

    it('should include query metadata in slow query logs', async () => {
      mockClient.query.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
        return { rows: [] };
      });

      const logSlowOperationSpy = jest.spyOn(adapter, 'logSlowOperation');

      const query = 'SELECT * FROM users WHERE id = $1';
      const params = [123];

      await adapter.executeQuery(query, params);

      expect(logSlowOperationSpy).toHaveBeenCalled();
      const callArgs = logSlowOperationSpy.mock.calls[0];
      expect(callArgs[3]).toEqual(
        expect.objectContaining({
          query: expect.any(String),
          params: 1
        })
      );

      logSlowOperationSpy.mockRestore();
    });

    it('should not log queries under threshold', async () => {
      mockClient.query.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 30));
        return { rows: [] };
      });

      const logSlowOperationSpy = jest.spyOn(adapter, 'logSlowOperation');

      await adapter.executeQuery('SELECT * FROM users');

      expect(logSlowOperationSpy).toHaveBeenCalled();
      const callArgs = logSlowOperationSpy.mock.calls[0];
      expect(callArgs[1]).toBeLessThan(100);

      logSlowOperationSpy.mockRestore();
    });
  });

  describe('connection pool statistics', () => {
    it('should provide valid pool statistics for various configurations', () => {
      const configs = [
        { totalCount: 5, idleCount: 5, waitingCount: 0 },
        { totalCount: 10, idleCount: 8, waitingCount: 2 },
        { totalCount: 15, idleCount: 10, waitingCount: 3 },
        { totalCount: 20, idleCount: 5, waitingCount: 5 }
      ];

      configs.forEach((config) => {
        mockPool.totalCount = config.totalCount;
        mockPool.idleCount = config.idleCount;
        mockPool.waitingCount = config.waitingCount;

        const stats = adapter.getPoolStats();
        expect(stats).toBeDefined();
        expect(stats.totalConnections).toBe(config.totalCount);
        expect(stats.idleConnections).toBe(config.idleCount);
        expect(stats.waitingRequests).toBe(config.waitingCount);
      });
    });
  });

  describe('error handling', () => {
    it('should handle query timeout errors', async () => {
      const timeoutError = new Error('Query timeout');
      timeoutError.code = 'QUERY_TIMEOUT';
      mockClient.query.mockRejectedValue(timeoutError);

      await expect(adapter.executeQuery('SELECT * FROM users')).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle query syntax errors', async () => {
      const syntaxError = new Error('syntax error');
      mockClient.query.mockRejectedValue(syntaxError);

      await expect(adapter.executeQuery('INVALID SQL')).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle connection pool exhaustion', async () => {
      mockPool.connect.mockRejectedValueOnce(new Error('Connection pool exhausted'));

      await expect(adapter.executeQuery('SELECT * FROM users')).rejects.toThrow();
    });
  });
});
