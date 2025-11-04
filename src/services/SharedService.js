// Shared Service - Common functionality for both platforms
class SharedService {
  constructor(marqetaAdapter, database, notificationService) {
    this.marqeta = marqetaAdapter;
    this.db = database;
    this.notifications = notificationService;
  }

  // Authentication
  async authenticateUser(email, password) {
    const user = await this.db.users.findByEmail(email);
    if (!user || !await this.verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid credentials');
    }
    return user;
  }

  // Transaction processing
  async processTransaction(transactionData) {
    const transaction = await this.db.transactions.create(transactionData);
    
    // Send notification
    await this.notifications.sendTransactionAlert(
      transaction.userId,
      transaction
    );

    return transaction;
  }

  // JIT Funding (shared by both platforms)
  async handleJITFunding(authorizationRequest) {
    const { cardToken, amount, merchantName } = authorizationRequest;
    
    const card = await this.db.cards.findByMarqetaToken(cardToken);
    if (!card) {
      return { approved: false, reason: 'Card not found' };
    }

    // Check spending limits
    const dailySpent = await this.db.transactions.getDailySpending(card.id);
    if (dailySpent + amount > card.dailyLimit) {
      return { approved: false, reason: 'Daily limit exceeded' };
    }

    // Business-specific approval logic
    if (card.cardType === 'corporate') {
      return await this.handleCorporateApproval(card, amount, merchantName);
    }

    // Personal card approval logic
    if (card.cardType === 'personal') {
      return await this.handlePersonalApproval(card, amount, merchantName);
    }

    return { approved: true, amount };
  }

  async handleCorporateApproval(card, amount, merchantName) {
    // Check company budget
    const user = await this.db.users.findById(card.userId);
    const company = await this.db.companies.findById(user.companyId);
    
    if (company.monthlyBudget && company.monthlySpent + amount > company.monthlyBudget) {
      return { approved: false, reason: 'Company budget exceeded' };
    }

    // Check for restricted merchants
    if (company.restrictedMerchants?.includes(merchantName)) {
      return { approved: false, reason: 'Merchant not allowed' };
    }

    return { approved: true, amount };
  }

  async handlePersonalApproval(card, amount, merchantName) {
    // Check wallet balance
    const wallet = await this.db.wallets.findByUserId(card.userId);
    if (wallet.balance < amount) {
      return { approved: false, reason: 'Insufficient funds' };
    }

    return { approved: true, amount };
  }

  // Analytics (shared)
  async getTransactionAnalytics(userId, accountType, period = '30d') {
    const filters = { userId, period };
    
    if (accountType === 'business') {
      const user = await this.db.users.findById(userId);
      filters.companyId = user.companyId;
    }

    return await this.db.analytics.getTransactionMetrics(filters);
  }

  // Webhook processing
  async processMarqetaWebhook(webhookData) {
    const { type, data } = webhookData;

    switch (type) {
      case 'transaction.authorization':
        return await this.processTransaction({
          marqetaTransactionToken: data.token,
          cardId: await this.getCardIdByToken(data.cardToken),
          amount: data.amount,
          merchantName: data.merchant?.name,
          status: 'authorized'
        });

      case 'transaction.clearing':
        return await this.db.transactions.updateStatus(
          data.token,
          'cleared'
        );

      case 'card.transition':
        return await this.db.cards.updateStatus(
          await this.getCardIdByToken(data.cardToken),
          data.state
        );

      default:
        console.log('Unknown webhook type:', type);
    }
  }

  async getCardIdByToken(marqetaToken) {
    const card = await this.db.cards.findByMarqetaToken(marqetaToken);
    return card?.id;
  }

  async verifyPassword(password, hash) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
  }
}

module.exports = SharedService;