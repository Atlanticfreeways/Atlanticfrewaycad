const amqp = require('amqplib');
const logger = require('../utils/logger');

class MessageQueueManager {
  constructor(config) {
    this.config = config;
    this.connection = null;
    this.channel = null;
    this.consumers = new Map();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.config.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Set prefetch to 1 for fair dispatch
      await this.channel.prefetch(1);

      logger.info('RabbitMQ connection established');

      // Handle connection errors
      this.connection.on('error', (err) => {
        logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
      });

      // Declare exchanges
      await this.declareExchanges();

      // Declare queues
      await this.declareQueues();

      return this.channel;
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async declareExchanges() {
    try {
      // Topic exchange for transactions
      await this.channel.assertExchange('transactions', 'topic', {
        durable: true
      });

      // Topic exchange for events
      await this.channel.assertExchange('events', 'topic', {
        durable: true
      });

      logger.info('Exchanges declared');
    } catch (error) {
      logger.error('Failed to declare exchanges:', error);
      throw error;
    }
  }

  async declareQueues() {
    try {
      // JIT Funding Queue
      await this.channel.assertQueue('jit-funding-queue', {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'transactions',
          'x-dead-letter-routing-key': 'jit-funding.failed'
        }
      });

      // Transaction Processing Queue
      await this.channel.assertQueue('transaction-processing-queue', {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'transactions',
          'x-dead-letter-routing-key': 'transaction.failed'
        }
      });

      // Webhook Queue
      await this.channel.assertQueue('webhook-queue', {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'transactions',
          'x-dead-letter-routing-key': 'webhook.failed'
        }
      });

      // Dead Letter Queue
      await this.channel.assertQueue('jit-funding-dlq', {
        durable: true
      });

      // Bind queues to exchanges
      await this.channel.bindQueue(
        'jit-funding-queue',
        'transactions',
        'jit-funding.created'
      );

      await this.channel.bindQueue(
        'transaction-processing-queue',
        'transactions',
        'transaction.created'
      );

      await this.channel.bindQueue(
        'webhook-queue',
        'transactions',
        'transaction.webhook'
      );

      await this.channel.bindQueue(
        'jit-funding-dlq',
        'transactions',
        'jit-funding.failed'
      );

      logger.info('Queues declared and bound');
    } catch (error) {
      logger.error('Failed to declare queues:', error);
      throw error;
    }
  }

  async publishMessage(exchange, routingKey, message) {
    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));

      const published = this.channel.publish(
        exchange,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now()
        }
      );

      if (!published) {
        logger.warn('Message not published, buffer full', {
          exchange,
          routingKey
        });
      }

      return published;
    } catch (error) {
      logger.error('Failed to publish message:', {
        error: error.message,
        exchange,
        routingKey
      });
      throw error;
    }
  }

  async consumeMessage(queue, callback, options = {}) {
    try {
      const consumerTag = `consumer-${queue}-${Date.now()}`;

      await this.channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString());

            // Call the callback
            await callback(content);

            // Acknowledge the message
            this.channel.ack(msg);
          } catch (error) {
            logger.error('Message processing error:', {
              error: error.message,
              queue
            });

            // Requeue on error (up to 3 times)
            const retryCount = msg.properties.headers['x-retry-count'] || 0;
            if (retryCount < 3) {
              this.channel.nack(msg, false, true);
            } else {
              // Send to DLQ after 3 retries
              this.channel.nack(msg, false, false);
            }
          }
        },
        {
          noAck: false,
          ...options
        }
      );

      this.consumers.set(queue, consumerTag);
      logger.info(`Consumer started for queue: ${queue}`);
    } catch (error) {
      logger.error('Failed to consume message:', error);
      throw error;
    }
  }

  async cancelConsumer(queue) {
    try {
      const consumerTag = this.consumers.get(queue);
      if (consumerTag) {
        await this.channel.cancel(consumerTag);
        this.consumers.delete(queue);
        logger.info(`Consumer cancelled for queue: ${queue}`);
      }
    } catch (error) {
      logger.error('Failed to cancel consumer:', error);
    }
  }

  async getQueueStats(queue) {
    try {
      const queueInfo = await this.channel.checkQueue(queue);
      return {
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      return null;
    }
  }

  async purgeQueue(queue) {
    try {
      await this.channel.purgeQueue(queue);
      logger.info(`Queue purged: ${queue}`);
    } catch (error) {
      logger.error('Failed to purge queue:', error);
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Failed to close RabbitMQ connection:', error);
    }
  }
}

module.exports = MessageQueueManager;
