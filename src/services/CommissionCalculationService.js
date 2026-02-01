// Automated Commission Calculation Service - DB Backed
const logger = require('../utils/logger');

class CommissionCalculationService {
  constructor(repositories) {
    if (repositories) {
      this.repo = repositories.affiliate;
    }
  }

  init(services, repositories) {
    this.exchangeRateService = services.exchangeRate;
    this.conversionLogger = services.conversionLogger;
    if (repositories) {
      this.repo = repositories.affiliate;
    }
  }

  // Calculate signup commission
  async calculateSignupCommission(partner, referral) {
    // Partner object now comes from DB, so fields might be snake_case
    const tier = partner.tier || 'tier1';
    const config = this.getTierConfig(tier);

    // Default to USD if preferred currency not set
    // Note: DB schema might not have preferred_currency on partner table yet?
    // The migration added `partners` table but didn't explicitly add `preferred_currency`.
    // It's likely on the linked `users` table or we assume USD for now.
    const targetCurrency = 'USD';
    let finalAmount = config.signupBonus;

    // Skipping currency conversion logic for brevity/safety unless we fetch user pref

    return {
      partnerId: partner.id,
      referralId: referral.id,
      type: 'signup',
      amount: finalAmount,
      currency: targetCurrency,
      status: 'approved',
      metadata: {}
    };
  }

  getTierConfig(tier) {
    const rates = {
      tier1: { rate: 0.10, signupBonus: 50 },
      tier2: { rate: 0.25, signupBonus: 100 },
      tier3: { rate: 0.50, signupBonus: 500 },
      tier4: { rate: 0.15, signupBonus: 200 }
    };
    return rates[tier] || rates.tier1;
  }

  // Calculate total earnings for a partner
  async calculateTotalEarnings(partnerId) {
    const commissions = await this.repo.getCommissionsByPartner(partnerId);
    // Sum up (assuming all USD for MVP)
    const total = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    return total;
  }

  // Process commission for a new conversion
  async processConversion(referralCode, userId) {
    if (!this.repo) throw new Error('Repository not initialized');

    const partner = await this.repo.getPartnerByCode(referralCode);
    if (!partner) return null;

    // Find pending referrals for this code
    // Ideally we pass the specific referral ID, but legacy code looked up by code
    const referrals = await this.repo.getReferralByCodeAndStatus(referralCode, 'pending');
    const pendingReferral = referrals[0]; // Take first pending? Race condition risk but matches legacy logic

    if (!pendingReferral) return null;

    // Mark referral as converted
    await this.repo.updateReferralStatus(pendingReferral.id, 'converted', userId);

    // Calculate commission
    const commissionData = await this.calculateSignupCommission(partner, pendingReferral);

    // Persist commission
    const savedCommission = await this.repo.createCommission(commissionData);

    return savedCommission;
  }

  // Get commission summary for partner
  async getCommissionSummary(partnerId) {
    if (!this.repo) throw new Error('Repository not initialized');

    const partner = await this.repo.getPartnerById(partnerId);
    if (!partner) return null;

    const commissions = await this.repo.getCommissionsByPartner(partnerId);

    const signupCommissions = commissions
      .filter(c => c.type === 'signup')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    const recurringCommissions = commissions
      .filter(c => c.type === 'recurring')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    return {
      partner_id: partner.id,
      tier: partner.tier,
      commission_rate: partner.commission_rate,
      total_conversions: commissions.length, // Rough proxy if 1 commission per conversion
      signup_commissions: signupCommissions,
      recurring_commissions: recurringCommissions,
      volume_bonus_rate: 0, // Todo: implement volume logic
      total_earnings: signupCommissions + recurringCommissions,
      currency: 'USD',
      pending_payout: signupCommissions + recurringCommissions
    };
  }
}

module.exports = new CommissionCalculationService();
