const eventBus = require('./EventBus');

class EventQueue {
  constructor(redisClient) {
    this.redis = redisClient;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async enqueue(event, data, priority = 0) {
    const queueItem = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      data,
      priority,
      attempts: 0,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await this.redis.zAdd('event_queue', {
      score: priority,
      value: JSON.stringify(queueItem)
    });

    return queueItem.id;
  }

  async process() {
    const items = await this.redis.zRange('event_queue', 0, 9);
    
    for (const item of items) {
      const queueItem = JSON.parse(item);
      
      try {
        await eventBus.emitAsync(queueItem.event, queueItem.data);
        await this.markComplete(queueItem.id);
        await this.redis.zRem('event_queue', item);
      } catch (error) {
        await this.handleFailure(queueItem, error);
      }
    }
  }

  async handleFailure(queueItem, error) {
    queueItem.attempts++;
    queueItem.lastError = error.message;

    if (queueItem.attempts >= this.maxRetries) {
      await this.moveToDeadLetter(queueItem);
      await this.redis.zRem('event_queue', JSON.stringify(queueItem));
    } else {
      const delay = this.retryDelay * Math.pow(2, queueItem.attempts);
      queueItem.nextRetry = new Date(Date.now() + delay).toISOString();
      await this.redis.zAdd('event_queue', {
        score: queueItem.priority,
        value: JSON.stringify(queueItem)
      });
    }
  }

  async moveToDeadLetter(queueItem) {
    queueItem.status = 'failed';
    await this.redis.lPush('dead_letter_queue', JSON.stringify(queueItem));
  }

  async markComplete(eventId) {
    await this.redis.hSet('event_audit', eventId, JSON.stringify({
      status: 'completed',
      completedAt: new Date().toISOString()
    }));
  }
}

module.exports = EventQueue;
