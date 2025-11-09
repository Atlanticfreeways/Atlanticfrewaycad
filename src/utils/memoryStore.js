// In-memory storage for partner/referral system (no database needed)
class MemoryStore {
  constructor() {
    this.partners = new Map();
    this.referrals = new Map();
    this.users = new Map();
    this.initDemoData();
  }

  initDemoData() {
    // Demo partner for testing
    this.partners.set('DEMO123', {
      id: 'partner-demo',
      username: 'demo_user',
      referral_code: 'DEMO123',
      tier: 'tier1',
      commission_rate: 10.00,
      email: 'demo@atlanticfrewaycard.com',
      company_name: 'Demo Partner',
      status: 'active',
      created_at: new Date().toISOString()
    });

    // Demo referrals
    this.referrals.set('ref-1', {
      id: 'ref-1',
      partner_id: 'partner-demo',
      referral_code: 'DEMO123',
      status: 'converted',
      clicked_at: new Date(Date.now() - 86400000).toISOString(),
      converted_at: new Date().toISOString()
    });
  }

  // Partners
  getPartner(code) {
    return this.partners.get(code);
  }

  getAllPartners() {
    return Array.from(this.partners.values());
  }

  addPartner(partner) {
    this.partners.set(partner.referral_code, {
      ...partner,
      id: 'partner-' + Date.now(),
      created_at: new Date().toISOString()
    });
    return this.partners.get(partner.referral_code);
  }

  // Referrals
  addReferral(referral) {
    const id = 'ref-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    this.referrals.set(id, {
      ...referral,
      id,
      created_at: new Date().toISOString()
    });
    return this.referrals.get(id);
  }

  getReferralsByPartner(partnerId) {
    return Array.from(this.referrals.values())
      .filter(r => r.partner_id === partnerId);
  }

  getReferralsByCode(code) {
    return Array.from(this.referrals.values())
      .filter(r => r.referral_code === code);
  }

  updateReferralStatus(id, status, userId = null) {
    const referral = this.referrals.get(id);
    if (referral) {
      referral.status = status;
      if (status === 'converted') {
        referral.converted_at = new Date().toISOString();
        referral.user_id = userId;
      }
      this.referrals.set(id, referral);
    }
    return referral;
  }

  // Users
  addUser(user) {
    const id = 'user-' + Date.now();
    this.users.set(id, {
      ...user,
      id,
      created_at: new Date().toISOString()
    });
    return this.users.get(id);
  }

  getUser(id) {
    return this.users.get(id);
  }

  // Stats
  getPartnerStats(partnerId) {
    const referrals = this.getReferralsByPartner(partnerId);
    const conversions = referrals.filter(r => r.status === 'converted');
    const pending = referrals.filter(r => r.status === 'pending');

    return {
      total_clicks: referrals.length,
      total_referrals: conversions.length,
      pending_referrals: pending.length,
      conversion_rate: referrals.length > 0 
        ? ((conversions.length / referrals.length) * 100).toFixed(2) 
        : 0,
      total_earnings: conversions.length * 50 // $50 per conversion
    };
  }

  // Clear all data (for testing)
  clear() {
    this.partners.clear();
    this.referrals.clear();
    this.users.clear();
    this.initDemoData();
  }
}

module.exports = new MemoryStore();
