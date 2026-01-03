const MessageQueueManager = require('../../../src/queue/MessageQueueManager');

describe('MessageQueueManager', () => {
  let manager;
  let mockChannel;
  let mockConnection;

  beforeEach(() => {
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue(undefined),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockReturnValue(true),
      consume: jest.fn().mockResolvedValue(undefined),
      ack: jest.fn(),
      nack: jest.fn(),
      checkExchange: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined)
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined)
    };

    manager = new MessageQueueManager({ RABBITMQ_URL: 'amqp://localhost' });
    manager.channel = mockChannel;
    manager.connection = mockConnection;
  });

  describe('publishMessage', () => {
    it('should publish message with persistence flag', async () => {
      const message = { id: 1, type: 'test' };
      await manager.publishMessage('transactions', 'test.event', message);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'transactions',
        'test.event',
        expect.any(Buffer),
        { persistent: true }
      );
    });

    it('should retry on publish failure', async () => {
      mockChannel.publish = jest.fn()
        .mockImplementationOnce(() => { throw new Error('Connection lost'); })
        .mockImplementationOnce(() => true);

      const message = { id: 1 };
      await manager.publishMessage('transactions', 'test.event', message, 0);

      expect(mockChannel.publish).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      mockChannel.publish = jest.fn().mockImplementation(() => {
        throw new Error('Connection lost');
      });

      const message = { id: 1 };
      await expect(manager.publishMessage('transactions', 'test.event', message, 3))
        .rejects.toThrow('Connection lost');
    });
  });

  describe('consumeMessage', () => {
    it('should consume messages from queue', async () => {
      const callback = jest.fn().mockResolvedValue(undefined);
      await manager.consumeMessage('jit-funding-queue', callback);

      expect(mockChannel.consume).toHaveBeenCalledWith(
        'jit-funding-queue',
        expect.any(Function)
      );
    });

    it('should acknowledge message on successful processing', async () => {
      const callback = jest.fn().mockResolvedValue(undefined);
      const msg = { content: Buffer.from(JSON.stringify({ id: 1 })) };

      mockChannel.consume.mockImplementation((queue, handler) => {
        handler(msg);
      });

      await manager.consumeMessage('jit-funding-queue', callback);

      expect(mockChannel.ack).toHaveBeenCalledWith(msg);
    });

    it('should nack and requeue message on error', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('Processing failed'));
      const msg = { content: Buffer.from(JSON.stringify({ id: 1 })) };

      mockChannel.consume.mockImplementation((queue, handler) => {
        handler(msg);
      });

      await manager.consumeMessage('jit-funding-queue', callback);

      expect(mockChannel.nack).toHaveBeenCalledWith(msg, false, true);
    });
  });

  describe('publishWithRetry', () => {
    it('should route to DLQ after max retries', async () => {
      mockChannel.publish = jest.fn().mockImplementation(() => {
        throw new Error('Connection lost');
      });

      const message = { id: 1 };
      await expect(manager.publishWithRetry('transactions', 'test.event', message, 2))
        .rejects.toThrow();

      const dlqCall = mockChannel.publish.mock.calls.find(
        call => call[1] === 'dlq.failed'
      );
      expect(dlqCall).toBeDefined();
    });

    it('should succeed on retry', async () => {
      mockChannel.publish = jest.fn()
        .mockImplementationOnce(() => { throw new Error('Connection lost'); })
        .mockImplementationOnce(() => true);

      const message = { id: 1 };
      const result = await manager.publishWithRetry('transactions', 'test.event', message, 3);

      expect(result).toBe(true);
      expect(mockChannel.publish).toHaveBeenCalledTimes(2);
    });
  });

  describe('health', () => {
    it('should return healthy status when connected', async () => {
      const health = await manager.health();
      expect(health.status).toBe('healthy');
    });

    it('should return disconnected status when no channel', async () => {
      manager.channel = null;
      const health = await manager.health();
      expect(health.status).toBe('disconnected');
    });

    it('should return unhealthy status on error', async () => {
      mockChannel.checkExchange.mockRejectedValue(new Error('Connection failed'));
      const health = await manager.health();
      expect(health.status).toBe('unhealthy');
    });
  });

  describe('close', () => {
    it('should close channel and connection', async () => {
      await manager.close();
      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });
});
