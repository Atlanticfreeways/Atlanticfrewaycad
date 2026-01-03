const userAdapter = require('../adapters/marqeta/UserAdapter');
const cardAdapter = require('../adapters/marqeta/CardAdapter');
const { NotFoundError } = require('../errors/AppError');

class PersonalService {
  constructor(repositories) {
    this.userRepo = repositories.user;
    this.cardRepo = repositories.card;
    this.walletRepo = repositories.wallet;
    this.transactionRepo = repositories.transaction;
  }

  async createPersonalAccount(userId, accountData) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const marqetaUser = await userAdapter.createUser({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone
    });

    await this.userRepo.update(userId, {
      marqeta_user_token: marqetaUser.token,
      account_type: 'personal'
    });

    const wallet = await this.walletRepo.create(userId);
    return { user, wallet };
  }

  async submitKYCVerification(userId, kycData) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const query = `
      INSERT INTO kyc_verifications (user_id, tier, documents, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    const result = await this.userRepo.query(query, [
      userId,
      kycData.tier || 'tier_1',
      JSON.stringify(kycData.documents || {})
    ]);
    return result.rows[0];
  }

  async getKYCStatus(userId) {
    const query = 'SELECT * FROM kyc_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await this.userRepo.query(query, [userId]);
    return result.rows[0] || { status: 'not_started' };
  }

  async issuePersonalCard(userId, cardConfig = {}) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    if (!user.marqeta_user_token) {
      throw new Error('User not registered with Marqeta');
    }

    const cardProductToken = process.env.MARQETA_PERSONAL_CARD_PRODUCT || 'personal_card_product';

    const marqetaCard = await cardAdapter.issueCard({
      userToken: user.marqeta_user_token,
      cardProductToken
    });

    return await this.cardRepo.create({
      userId,
      marqetaCardToken: marqetaCard.token,
      cardType: 'virtual',
      status: 'active',
      lastFour: marqetaCard.last_four,
      metadata: {
        nickname: cardConfig.nickname || 'Personal Card',
        dailyLimit: cardConfig.dailyLimit || 1000,
        monthlyLimit: cardConfig.monthlyLimit || 5000
      }
    });
  }

  async freezeCard(cardId, userId) {
    const card = await this.cardRepo.findById(cardId);
    if (!card || card.user_id !== userId) throw new NotFoundError('Card');

    await cardAdapter.updateCardStatus(card.marqeta_card_token, 'frozen');
    return await this.cardRepo.update(cardId, { status: 'frozen' });
  }

  async unfreezeCard(cardId, userId) {
    const card = await this.cardRepo.findById(cardId);
    if (!card || card.user_id !== userId) throw new NotFoundError('Card');

    await cardAdapter.updateCardStatus(card.marqeta_card_token, 'active');
    return await this.cardRepo.update(cardId, { status: 'active' });
  }

  async getWallet(userId) {
    return await this.walletRepo.findByUser(userId);
  }

  async addFunds(userId, amount, source = 'bank_transfer') {
    const wallet = await this.walletRepo.findByUser(userId);
    if (!wallet) throw new NotFoundError('Wallet');

    const updated = await this.walletRepo.addFunds(userId, amount);
    await this.walletRepo.recordTransaction(userId, amount, 'deposit', source);
    return updated;
  }

  async getTransactions(userId, limit = 50) {
    return await this.transactionRepo.findByUser(userId, limit);
  }
}

module.exports = PersonalService;
