class JITFundingService {
  constructor(repositories) {
    this.cardRepo = repositories.card;
    this.transactionRepo = repositories.transaction;
    this.walletRepo = repositories.wallet;
  }

  async processAuthorization(authRequest) {
    const startTime = Date.now();

    try {
      const card = await this.cardRepo.findByMarqetaToken(authRequest.card_token);
      
      if (!card || card.status !== 'active') {
        return this.decline('Card not active');
      }

      const amount = parseFloat(authRequest.amount);
      const dailySpending = await this.transactionRepo.getDailySpending(card.id);
      const metadata = card.metadata || {};
      const dailyLimit = metadata.daily_limit || 1000;

      if (dailySpending + amount > dailyLimit) {
        return this.decline('Daily limit exceeded');
      }

      if (card.user_id) {
        const wallet = await this.walletRepo.findByUser(card.user_id);
        if (wallet && wallet.balance < amount) {
          return this.decline('Insufficient funds');
        }
      }

      const duration = Date.now() - startTime;
      console.log(`JIT authorization approved in ${duration}ms`);

      return this.approve(amount);
    } catch (error) {
      console.error('JIT funding error:', error);
      return this.decline('Processing error');
    }
  }

  approve(amount) {
    return {
      jit_funding: {
        method: 'pgfs.authorization',
        amount: amount
      }
    };
  }

  decline(reason) {
    return {
      jit_funding: {
        method: 'pgfs.authorization_decline',
        memo: reason
      }
    };
  }
}

module.exports = JITFundingService;
