const eventBus = require('../EventBus');
const EventAuditService = require('../../services/EventAuditService');

class TransactionEventHandler {
  constructor(repositories) {
    this.auditService = new EventAuditService(repositories);
    this.registerHandlers();
  }

  registerHandlers() {
    eventBus.subscribe('transaction.authorized', this.handleAuthorized.bind(this));
    eventBus.subscribe('transaction.cleared', this.handleCleared.bind(this));
    eventBus.subscribe('transaction.declined', this.handleDeclined.bind(this));
  }

  async handleAuthorized(data) {
    await this.auditService.logEvent('transaction.authorized', data, data.userId);
  }

  async handleCleared(data) {
    await this.auditService.logEvent('transaction.cleared', data, data.userId);
  }

  async handleDeclined(data) {
    await this.auditService.logEvent('transaction.declined', data, data.userId);
  }
}

module.exports = new TransactionEventHandler();
