const { ValidationError, ForbiddenError } = require('../errors/AppError');

const KYC_TIERS = {
  basic: {
    cardNetworks: ['visa'],
    monthlyLimit: 5000,
    cardTypes: ['virtual'],
    features: ['basic_transactions'],
    requiredDocs: ['email', 'phone', 'basic_info']
  },
  standard: {
    cardNetworks: ['mastercard'],
    monthlyLimit: 50000,
    cardTypes: ['virtual', 'physical'],
    features: ['crypto_funding', 'international'],
    requiredDocs: ['photo_id', 'proof_of_address', 'selfie']
  },
  turbo: {
    cardNetworks: ['mastercard'],
    monthlyLimit: 100000,
    cardTypes: ['virtual', 'physical', 'premium'],
    features: ['virtual_bank_account', 'ach_transfers', 'wire_transfers', 'crypto_funding', 'international', 'premium_support'],
    requiredDocs: ['two_photo_ids', 'proof_of_income', 'enhanced_address_verification', 'video_kyc']
  },
  business: {
    cardNetworks: ['visa', 'mastercard'],
    monthlyLimit: 20000000,
    cardTypes: ['virtual', 'physical', 'corporate'],
    features: ['multi_user', 'advanced_controls', 'api_access', 'custom_limits', 'dedicated_manager'],
    requiredDocs: ['business_registration', 'tax_docs', 'ubo_verification', 'financial_statements']
  }
};

class KYCService {
  constructor(repositories) {
    this.userRepo = repositories.user;
  }

  async submitVerification(userId, tier, documents) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new ValidationError('User not found');

    const query = `
      INSERT INTO kyc_verifications (user_id, tier, documents, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    const result = await this.userRepo.query(query, [userId, tier, JSON.stringify(documents)]);
    return result.rows[0];
  }

  async approveVerification(verificationId, adminId) {
    const query = `
      UPDATE kyc_verifications 
      SET status = 'approved', verified_by = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.userRepo.query(query, [verificationId, adminId]);
    const verification = result.rows[0];

    if (verification) {
      await this.userRepo.update(verification.user_id, {
        kyc_tier: verification.tier,
        kyc_verified_at: new Date(),
        monthly_limit: KYC_TIERS[verification.tier].monthlyLimit
      });
    }

    return verification;
  }

  async checkLimit(userId, amount) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new ValidationError('User not found');

    const now = new Date();
    if (new Date(user.limit_reset_at) < now) {
      await this.userRepo.query(
        'UPDATE users SET monthly_spent = 0, limit_reset_at = $1 WHERE id = $2',
        [new Date(now.getFullYear(), now.getMonth() + 1, 1), userId]
      );
      user.monthly_spent = 0;
    }

    const remaining = user.monthly_limit - (parseFloat(user.monthly_spent) || 0);
    if (amount > remaining) {
      throw new ForbiddenError(`Monthly limit exceeded. Remaining: $${remaining.toFixed(2)}`);
    }

    return { allowed: true, remaining };
  }

  async recordSpending(userId, amount) {
    await this.userRepo.query(
      'UPDATE users SET monthly_spent = monthly_spent + $1 WHERE id = $2',
      [amount, userId]
    );
  }

  canIssueCard(userTier, cardNetwork, cardType) {
    const tier = KYC_TIERS[userTier];
    if (!tier) return false;
    
    return tier.cardNetworks.includes(cardNetwork) && tier.cardTypes.includes(cardType);
  }

  getTierLimits(tier) {
    return KYC_TIERS[tier] || KYC_TIERS.basic;
  }
}

module.exports = KYCService;
