const amqp = require('amqplib');
const logger = require('../utils/logger');

class MessageQueueManager {
  constructor(config) {
    this.config = config || {};
    this.connection = null;
    this.channel = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.config.RABBITMQ_URL || 'amqp://localhost');
      this.channel = await this.connection.createChannel();
      this.retryCount = 0;
      logger.info('RabbitMQ connected');
      await this.setupQueues();
      return this;
    } catch (error) {
      logger.error('RabbitMQ connection failed:', error.message);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
        logger.info(`Retrying RabbitMQ connection in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connect();
      }
      throw error;
    }
  }

  async setupQueues() {
    // Exchange
    await this.channel.assertExchange('transactions', 'topic', { durable: true });

    // Queues
    await this.channel.assertQueue('jit-funding-queue', { durable: true });
    await this.channel.assertQueue('transaction-processing-queue', { durable: true });
    await this.channel.assertQueue('webhook-queue', { durable: true });

    // Dead letter queue
    await this.channel.assertQueue('jit-funding-dlq', { durable: true });

    // Bindings
    await this.channel.bindQueue('jit-funding-queue', 'transactions', 'jit-funding.*');
    await this.channel.bindQueue('transaction-processing-queue', 'transactions', 'transaction.*');
    await this.channel.bindQueue('webhook-queue', 'transactions', 'webhook.*');

    logger.info('RabbitMQ queues and exchanges setup complete');
  }

  async publishMessage(exchange, routingKey, message, retries = 0) {
    try {
      if (!this.channel) throw new Error('Channel not connected');

      const payload = JSON.stringify(message);
      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(payload),
        { persistent: true }
      );

      logger.debug(`Message published to ${exchange}/${routingKey}`);
      return true;
    } catch (error) {
      logger.error(`Failed to publish message: ${error.message}`);

      if (retries < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.publishMessage(exchange, routingKey, message, retries + 1);
      }

      throw error;
    }
  }

  async consumeMessage(queue, callback, retries = 0) {
    try {
      if (!this.channel) throw new Error('Channel not connected');

      await this.channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel.ack(msg);
        } catch (error) {
          logger.error(`Error processing message from ${queue}:`, error.message);
          this.channel.nack(msg, false, true); // Requeue on error
        }
      });

      logger.info(`Consuming messages from ${queue}`);
    } catch (error) {
      logger.error(`Failed to consume from ${queue}: ${error.message}`);

      if (retries < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.consumeMessage(queue, callback, retries + 1);
      }

      throw error;
    }
  }

  async publishWithRetry(exchange, routingKey, message, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.publishMessage(exchange, routingKey, message);
      } catch (error) {
        if (attempt === maxRetries - 1) {
          // Route to DLQ on final failure
          logger.error(`Message failed after ${maxRetries} attempts, routing to DLQ`);
          await this.publishMessage('transactions', 'dlq.failed', {
            originalExchange: exchange,
            originalRoutingKey: routingKey,
            message,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          throw error;
        }

        const delay = this.retryDelay * Math.pow(2, attempt);
        logger.warn(`Publish attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error.message);
    }
  }

  /**
   * RPC Style Request
   * Publishes a message and waits for a response on a callback queue.
   */
  async request(exchange, routingKey, message, timeoutMs = 3000) {
    if (!this.channel) throw new Error('Channel not connected');

    const correlationId = require('uuid').v4();
    const { queue: replyQueue } = await this.channel.assertQueue('', { exclusive: true });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.channel.deleteQueue(replyQueue);
        reject(new Error('RPC Request Timed Out'));
      }, timeoutMs);

      this.channel.consume(replyQueue, (msg) => {
        if (msg && msg.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          const content = JSON.parse(msg.content.toString());
          this.channel.deleteQueue(replyQueue);
          resolve(content);
        }
      }, { noAck: true });

      this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: replyQueue
      });
    });
  }

  async health() {
    try {
      if (!this.channel) return { status: 'disconnected' };
      await this.channel.checkExchange('transactions');
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = MessageQueueManager;
