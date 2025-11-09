// Automated Commission Calculation Service
const memoryStore = require('../utils/memoryStore');

class CommissionCalculationService {
  constructor() {
    this.commissionRates = {
      tier1: { rate: 0.10, signupBonus: 50 },
      tier2: { rate: 0.25, signupBonus: 100 },
      tier3: { rate: 0.50, signupBonus: 500 },
      tier4: { rate: 0.15, signupBonus: 200 }
    };
  }

  // Calculate signup commission
  calculateSignupCommission(partner, referral) {
    const config = this.commissionRates[partner.tier];
    
    return {
      partner_id: partner.id,
      referral_id: referral.id,
      type: 'signup',
      amount: config.signupBonus,
      currency: 'USD',
      status: 'approved',
      calculated_at: new Date().toISOString()
    };
  }

  // Calculate recurring commission (monthly subscription)
  calculateRecurringCommission(partner, transaction) {
    const config = this.commissionRates[partner.tier];
    const baseAmount = transaction.amount * config.rate;
    
    // Apply volume bonus
    const volumeBonus = this.calculateVolumeBonus(partner);
    const finalAmount = baseAmount * (1 + volumeBonus);
    
    return {
      partner_id: partner.id,
      transaction_id: transaction.id,
      type: 'recurring',
      amount: finalAmount,
      currency: 'USD',
      status: 'approved',
      calculated_at: new Date().toISOString()
    };
  }

  // Calculate transaction-based commission
  calculateTransactionCommission(partner, transaction) {
    // Only tier2 gets transaction fees
    if (partner.tier !== 'tier2') return null;
    
    const transactionRate = 0.001; // 0.1%
    const amount = transaction.amount * transactionRate;
    
    return {
      partner_id: partner.id,
      transaction_id: transaction.id,
      type: 'transaction',
      amount,
      currency: 'USD',
      status: 'approved',
      calculated_at: new Date().toISOString()
    };
  }

  // Calculate volume bonus
  calculateVolumeBonus(partner) {
    const referrals = memoryStore.getReferralsByPartner(partner.id);
    const conversions = referrals.filter(r => r.status === 'converted').length;
    
    // Volume bonus tiers
    if (conversions >= 100) return 0.10; // +10%
    if (conversions >= 50) return 0.05;  // +5%
    return 0;
  }

  // Calculate total earnings for a partner
  calculateTotalEarnings(partnerId) {
    const partner = memoryStore.getPartner(partnerId);
    if (!partner) return 0;

    const referrals = memoryStore.getReferralsByPartner(partnerId);
    const conversions = referrals.filter(r => r.status === 'converted');
    
    const config = this.commissionRates[partner.tier];
    const signupTotal = conversions.length * config.signupBonus;
    
    // For demo, assume $100/month per conversion
    const recurringTotal = conversions.length * 100 * config.rate;
    
    return signupTotal + recurringTotal;
  }

  // Process commission for a new conversion
  processConversion(referralCode, userId) {
    const partner = memoryStore.getPartner(referralCode);
    if (!partner) return null;

    const referrals = memoryStore.getReferralsByCode(referralCode);
    const pendingReferral = referrals.find(r => r.status === 'pending');
    
    if (!pendingReferral) return null;

    // Mark referral as converted
    memoryStore.updateReferralStatus(pendingReferral.id, 'converted', userId);

    // Calculate and create commission
    const commission = this.calculateSignupCommission(partner, pendingReferral);
    
    return commission;
  }

  // Get commission summary for partner
  getCommissionSummary(partnerId) {
    const partner = memoryStore.getPartner(partnerId);
    if (!partner) return null;

    const referrals = memoryStore.getReferralsByPartner(partnerId);
    const conversions = referrals.filter(r => r.status === 'converted');
    
    const config = this.commissionRates[partner.tier];
    const signupCommissions = conversions.length * config.signupBonus;
    const recurringCommissions = conversions.length * 100 * config.rate;
    const volumeBonus = this.calculateVolumeBonus(partner);
    
    return {
      partner_id: partnerId,
      tier: partner.tier,
      commission_rate: partner.commission_rate,
      total_conversions: conversions.length,
      signup_commissions: signupCommissions,
      recurring_commissions: recurringCommissions,
      volume_bonus_rate: volumeBonus,
      total_earnings: signupCommissions + recurringCommissions,
      pending_payout: signupCommissions + recurringCommissions,
      lifetime_value: (signupCommissions + recurringCommissions) * 12 // Projected annual
    };
  }
}

module.exports = new CommissionCalculationService();
