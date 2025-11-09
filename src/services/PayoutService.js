// Payout Processing Service
const memoryStore = require('../utils/memoryStore');
const commissionService = require('./CommissionCalculationService');

class PayoutService {
  constructor() {
    this.payouts = new Map();
    this.minimumPayouts = {
      tier1: 50,
      tier2: 100,
      tier3: 1000,
      tier4: 200
    };
  }

  // Request a payout
  requestPayout(partnerId, amount) {
    const partner = memoryStore.getPartner(partnerId);
    if (!partner) {
      throw new Error('Partner not found');
    }

    // Check minimum threshold
    const minimum = this.minimumPayouts[partner.tier];
    if (amount < minimum) {
      throw new Error(`Minimum payout for ${partner.tier} is $${minimum}`);
    }

    // Check available balance
    const availableBalance = commissionService.calculateTotalEarnings(partnerId);
    if (amount > availableBalance) {
      throw new Error(`Insufficient balance. Available: $${availableBalance}`);
    }

    // Create payout request
    const payoutId = 'payout-' + Date.now();
    const payout = {
      id: payoutId,
      partner_id: partnerId,
      partner_code: partner.referral_code,
      amount,
      currency: 'USD',
      status: 'pending',
      payment_method: 'stripe',
      requested_at: new Date().toISOString(),
      processed_at: null
    };

    this.payouts.set(payoutId, payout);
    return payout;
  }

  // Process payout (simulate Stripe transfer)
  async processPayout(payoutId) {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'pending') {
      throw new Error(`Payout already ${payout.status}`);
    }

    // Simulate Stripe processing
    await this.simulateStripeTransfer(payout);

    // Update payout status
    payout.status = 'completed';
    payout.processed_at = new Date().toISOString();
    payout.stripe_transfer_id = 'tr_' + Math.random().toString(36).substring(7);

    this.payouts.set(payoutId, payout);
    return payout;
  }

  // Simulate Stripe Connect transfer
  async simulateStripeTransfer(payout) {
    // In production, this would call Stripe API:
    // const transfer = await stripe.transfers.create({
    //   amount: payout.amount * 100,
    //   currency: 'usd',
    //   destination: partner.stripe_account_id
    // });
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: 'tr_' + Math.random().toString(36).substring(7),
          amount: payout.amount,
          status: 'succeeded'
        });
      }, 1000);
    });
  }

  // Get payout history for partner
  getPayoutHistory(partnerId) {
    return Array.from(this.payouts.values())
      .filter(p => p.partner_id === partnerId)
      .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));
  }

  // Get payout by ID
  getPayout(payoutId) {
    return this.payouts.get(payoutId);
  }

  // Get available balance for payout
  getAvailableBalance(partnerId) {
    const totalEarnings = commissionService.calculateTotalEarnings(partnerId);
    const payoutHistory = this.getPayoutHistory(partnerId);
    const totalPaidOut = payoutHistory
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return totalEarnings - totalPaidOut;
  }

  // Get payout summary
  getPayoutSummary(partnerId) {
    const partner = memoryStore.getPartner(partnerId);
    if (!partner) return null;

    const totalEarnings = commissionService.calculateTotalEarnings(partnerId);
    const payoutHistory = this.getPayoutHistory(partnerId);
    const totalPaidOut = payoutHistory
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayouts = payoutHistory
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      partner_id: partnerId,
      partner_code: partner.referral_code,
      tier: partner.tier,
      total_earnings: totalEarnings,
      total_paid_out: totalPaidOut,
      pending_payouts: pendingPayouts,
      available_balance: totalEarnings - totalPaidOut - pendingPayouts,
      minimum_payout: this.minimumPayouts[partner.tier],
      payout_count: payoutHistory.filter(p => p.status === 'completed').length,
      last_payout: payoutHistory.find(p => p.status === 'completed')
    };
  }

  // Cancel pending payout
  cancelPayout(payoutId) {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'pending') {
      throw new Error('Can only cancel pending payouts');
    }

    payout.status = 'cancelled';
    payout.cancelled_at = new Date().toISOString();
    this.payouts.set(payoutId, payout);
    
    return payout;
  }
}

module.exports = new PayoutService();
