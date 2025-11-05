const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  async emitAsync(event, data) {
    const listeners = this.listeners(event);
    const promises = listeners.map(listener => 
      Promise.resolve(listener(data)).catch(err => {
        console.error(`Error in event handler for ${event}:`, err);
        return null;
      })
    );
    return Promise.all(promises);
  }

  subscribe(event, handler) {
    this.on(event, handler);
  }

  unsubscribe(event, handler) {
    this.off(event, handler);
  }
}

module.exports = new EventBus();
