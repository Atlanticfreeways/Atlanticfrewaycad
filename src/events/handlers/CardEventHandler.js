const eventBus = require('../EventBus');

class CardEventHandler {
  constructor() {
    this.registerHandlers();
  }

  registerHandlers() {
    eventBus.subscribe('card.created', this.handleCreated.bind(this));
    eventBus.subscribe('card.activated', this.handleActivated.bind(this));
    eventBus.subscribe('card.frozen', this.handleFrozen.bind(this));
    eventBus.subscribe('card.terminated', this.handleTerminated.bind(this));
  }

  async handleCreated(data) {
    console.log('Card created:', data.cardToken);
    // Send welcome email, setup notifications
  }

  async handleActivated(data) {
    console.log('Card activated:', data.cardToken);
    // Enable spending, send confirmation
  }

  async handleFrozen(data) {
    console.log('Card frozen:', data.cardToken);
    // Send alert, log security event
  }

  async handleTerminated(data) {
    console.log('Card terminated:', data.cardToken);
    // Archive data, send final statement
  }
}

module.exports = new CardEventHandler();
