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

  async createPersonalAccount(userData) {
    const marqetaUser = await userAdapter.createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone
    });

    const passwordHash = await require('../services/auth/PasswordService').hash(userData.password);

    const user = await this.userRepo.create({
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      accountType: 'personal',
      role: 'personal',
      marqetaUserToken: marqetaUser.token
    });

    await this.walletRepo.create(user.id);

    return user;
  }

  async issuePersonalCard(userId, cardConfig = {}) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

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

  async getCardDetails(cardId, userId) {
    const card = await this.cardRepo.findById(cardId);
    if (!card || card.user_id !== userId) throw new NotFoundError('Card');

    const panData = await cardAdapter.showPAN(card.marqeta_card_token);

    return {
      ...card,
      pan: panData.pan,
      cvv: panData.cvv_number,
      expiration: panData.expiration
    };
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

    return await this.walletRepo.addFunds(userId, amount);
  }

  async getTransactions(userId, limit = 50) {
    return await this.transactionRepo.findByUser(userId, limit);
  }
}

module.exports = PersonalService;
