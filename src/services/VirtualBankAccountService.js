const crypto = require('crypto');
const { ValidationError, ForbiddenError } = require('../errors/AppError');

class VirtualBankAccountService {
  constructor(repositories) {
    this.userRepo = repositories.user;
  }

  generateAccountNumber() {
    const random = crypto.randomBytes(8).toString('hex');
    return random.substring(0, 10).toUpperCase();
  }

  generateRoutingNumber() {
    return '123456789';
  }

  async createVirtualAccount(userId) {
    const user = await this.userRepo.findById(userId);
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (user.kyc_tier !== 'turbo' && user.kyc_tier !== 'business') {
      throw new ForbiddenError('Virtual bank account requires Turbo or Business tier');
    }

    if (user.virtual_account_number) {
      return {
        accountNumber: user.virtual_account_number,
        routingNumber: user.virtual_routing_number
      };
    }

    const accountNumber = this.generateAccountNumber();
    const routingNumber = this.generateRoutingNumber();

    await this.userRepo.update(userId, {
      virtual_account_number: accountNumber,
      virtual_routing_number: routingNumber
    });

    return { accountNumber, routingNumber };
  }

  async getAccountDetails(userId) {
    const user = await this.userRepo.findById(userId);
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (!user.virtual_account_number) {
      throw new ValidationError('No virtual account found');
    }

    return {
      accountNumber: user.virtual_account_number,
      routingNumber: user.virtual_routing_number,
      accountHolder: `${user.first_name} ${user.last_name}`,
      tier: user.kyc_tier
    };
  }

  async processACHTransfer(userId, amount, direction) {
    const user = await this.userRepo.findById(userId);
    
    if (!user || !user.virtual_account_number) {
      throw new ValidationError('Virtual account not found');
    }

    return {
      transactionId: crypto.randomUUID(),
      amount,
      direction,
      status: 'pending',
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };
  }
}

module.exports = VirtualBankAccountService;
