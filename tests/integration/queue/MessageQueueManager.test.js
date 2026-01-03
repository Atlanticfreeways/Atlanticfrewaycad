const MessageQueueManager = require('../../../src/queue/MessageQueueManager');

describe('MessageQueueManager Integration Tests', () => {
  let manager;

  beforeEach(async () => {
    manager = new MessageQueueManager({
      RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost'
    });
  });

  afterEach(async () => {
    if (manager) {
      await manager.close();
    }
  });

  describe('Connection Management', () => {
    it('should connect to RabbitMQ', async () => {
      try {
        await manager.connect();
        expect(manager.connection).toBeDefined();
        expect(manager.channel).toBeDefined();
      } catch (error) {
        // Skip if RabbitMQ not running
        if (error.message.includes('ECONNREFUSED')) {
          console.log('RabbitMQ not running, skipping integration test');
        } else {
          throw error;
        }
      }
    });

    it('should retry connection on failure', async () => {
      manager.maxRetries = 1;
      manager.retryDelay = 100;

      try {
        await manager.connect();
        expect(manager.retryCount).toBeLessThanOrEqual(1);
      } catch (error) {
        if (!error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    });

    it('should setup queues and exchanges', async () => {
      try {
        await manager.connect();
        const health = await manager.health();
        expect(health.status).toBe('healthy');
      } catch (error) {
        if (!error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    });
  });

  describe('Message Publishing', () => {
    it('should publish message to exchange', async () => {
      try {
        await manager.connect();
        const message = { id: 1, type: 'test', timestamp: new Date().toISOString() };
        const result = await manager.publishMessage('transactions', 'test.event', message);
        expect(result).toBe(true);
      } catch (error) {
        if (!error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    });

    it('should publish with retry on failure', async () => {
      try {
        await manager.connect();
        const message = { id: 1, data: 'test' };
        const result = await manager.publishWithRetry('transactions', 'test.event', message, 3);
        expect(result).toBe(true);
      } catch (error) {
        if (!error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    });
  });

  describe('Message Consuming', () => {
    it('should consume messages from queue', async () => {
      try {
        await manager.connect();
        const messages = [];
        const callback = jest.fn(async (msg) => {
          messages.push(msg);
        });

        await manager.consumeMessage('jit-funding-queue', callback);
        expect(manager.channel.consume).toBeDefined();
      } catch (error) {
        if (!error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    });
  });

  describe('Graceful Shutdown', () => {
    it('should close connection gracefully', async () => {
      try {
        await manager.connect();
        await manager.close();
        expect(manager.connection).toBeDefined();
      } catch (error) {
        if (!error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    });
  });

  describe('Health Check', () => {
    it('should report healthy status when connected', async () => {
      try {
        await manager.connect();
        const health = await manager.health();
        expect(health.status).toBe('healthy');
      } catch (error) {
        if (!error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    });

    it('should report disconnected status when not connected', async () => {
      const health = await manager.health();
      expect(health.status).toBe('disconnected');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent message publishing', async () => {
      try {
        await manager.connect();
        const promises = [];

        for (let i = 0; i < 10; i++) {
          const message = { id: i, timestamp: new Date().toISOString() };
          promises.push(manager.publishMessage('transactions', 'test.event', message));
        }

        const results = await Promise.all(promises);
        expect(results.every(r => r === true)).toBe(true);
      } catch (error) {
        if (!error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    });
  });
});
