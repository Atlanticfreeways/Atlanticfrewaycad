// Personal Service - Freeway Cards functionality
class PersonalService {
  constructor(marqetaAdapter, database, cryptoService, stripeService) {
    this.marqeta = marqetaAdapter;
    this.db = database;
    this.crypto = cryptoService;
    this.stripe = stripeService;
  }

  // Personal account creation
  async createPersonalAccount(userData) {
    const user = await this.db.users.create({
      ...userData,
      accountType: 'personal',
      role: 'personal',
      cryptoEnabled: true
    });

    // Create Marqeta user
    const marqetaUser = await this.marqeta.createUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });

    await this.db.users.update(user.id, {
      marqetaUserToken: marqetaUser.token
    });

    return user;
  }

  // Personal virtual card issuance
  async issuePersonalCard(userId, cardConfig) {
    const user = await this.db.users.findById(userId);
    
    const marqetaCard = await this.marqeta.issueCard({
      cardProductToken: 'personal_card_product',
      userToken: user.marqetaUserToken,
      firstName: user.firstName,
      lastName: user.lastName
    });

    return await this.db.cards.create({
      userId,
      marqetaCardToken: marqetaCard.token,
      cardType: 'personal',
      dailyLimit: cardConfig.dailyLimit || 1000,
      monthlyLimit: cardConfig.monthlyLimit || 5000,
      fundingSource: 'personal_wallet'
    });
  }

  // Crypto funding
  async fundWithCrypto(userId, amount, cryptoType, walletAddress) {
    // Process crypto deposit
    const cryptoTransaction = await this.crypto.processDeposit({
      userId,
      amount,
      cryptoType,
      walletAddress
    });

    // Update user wallet balance
    await this.db.wallets.addFunds(userId, amount, {
      source: 'crypto',
      transactionId: cryptoTransaction.id,
      cryptoType
    });

    return cryptoTransaction;
  }

  // Bank transfer funding
  async fundWithBank(userId, amount, bankAccount) {
    // Process bank transfer via Stripe
    const bankTransfer = await this.stripe.createTransfer({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      source: bankAccount.stripeSourceId
    });

    // Update user wallet balance
    await this.db.wallets.addFunds(userId, amount, {
      source: 'bank_transfer',
      transactionId: bankTransfer.id
    });

    return bankTransfer;
  }

  // KYC verification
  async submitKYC(userId, kycData) {
    return await this.db.kyc.create({
      userId,
      ...kycData,
      status: 'pending',
      submittedAt: new Date()
    });
  }

  // Card controls
  async freezeCard(cardId, reason) {
    const card = await this.db.cards.findById(cardId);
    
    await this.marqeta.updateCardStatus(
      card.marqetaCardToken, 
      'frozen', 
      reason
    );

    return await this.db.cards.update(cardId, { status: 'frozen' });
  }

  async unfreezeCard(cardId) {
    const card = await this.db.cards.findById(cardId);
    
    await this.marqeta.updateCardStatus(
      card.marqetaCardToken, 
      'active'
    );

    return await this.db.cards.update(cardId, { status: 'active' });
  }
}

module.exports = PersonalService;