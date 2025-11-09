const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { NotFoundError, ValidationError } = require('../errors/AppError');

class PartnerService {
  constructor(repositories) {
    this.partnerRepo = repositories.partner;
    this.userRepo = repositories.user;
    this.referralRepo = repositories.referral;
  }

  async registerPartner(userId, partnerData) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User');

    const existing = await this.partnerRepo.findByUserId(userId);
    if (existing) throw new ValidationError('User is already a partner');

    const referralCode = await this.generateReferralCode(user);
    const tier = this.determineTier(partnerData.partner_type);

    return await this.partnerRepo.create({
      user_id: userId,
      partner_type: partnerData.partner_type || 'affiliate',
      tier,
      company_name: partnerData.company_name || `${user.first_name} ${user.last_name}`,
      referral_code: referralCode,
      commission_rate: this.getDefaultCommissionRate(tier),
      status: 'pending',
      settings: partnerData.settings || {}
    });
  }

  async getPartnerProfile(partnerId) {
    const partner = await this.partnerRepo.findById(partnerId);
    if (!partner) throw new NotFoundError('Partner');

    const totalReferrals = await this.referralRepo.countByStatus(partnerId, 'converted');
    
    return {
      ...partner,
      stats: {
        total_referrals: totalReferrals
      }
    };
  }

  async updatePartner(partnerId, updates) {
    const partner = await this.partnerRepo.findById(partnerId);
    if (!partner) throw new NotFoundError('Partner');

    const allowed = ['company_name', 'settings', 'branding'];
    const filtered = Object.keys(updates)
      .filter(key => allowed.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

    return await this.partnerRepo.update(partnerId, filtered);
  }

  async generateAPIKey(partnerId) {
    const partner = await this.partnerRepo.findById(partnerId);
    if (!partner) throw new NotFoundError('Partner');

    const apiKey = 'pk_' + crypto.randomBytes(32).toString('hex');
    const apiSecret = 'sk_' + crypto.randomBytes(32).toString('hex');
    const secretHash = await bcrypt.hash(apiSecret, 10);

    await this.partnerRepo.update(partnerId, {
      api_key: apiKey,
      api_secret_hash: secretHash
    });

    return { api_key: apiKey, api_secret: apiSecret };
  }

  async generateReferralCode(user) {
    const base = (user.first_name.substring(0, 3) + user.last_name.substring(0, 3)).toUpperCase();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${base}${random}`;
  }

  determineTier(partnerType) {
    const tierMap = {
      'affiliate': 'tier1',
      'reseller': 'tier2',
      'whitelabel': 'tier3',
      'technology': 'tier4'
    };
    return tierMap[partnerType] || 'tier1';
  }

  getDefaultCommissionRate(tier) {
    const rates = {
      'tier1': 10.00,
      'tier2': 25.00,
      'tier3': 50.00,
      'tier4': 15.00
    };
    return rates[tier] || 10.00;
  }
}

module.exports = PartnerService;
