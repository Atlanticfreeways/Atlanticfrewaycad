const { ValidationError, ForbiddenError } = require('../errors/AppError');
const logger = require('../utils/logger');

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
  constructor(repositories, kycAdapter = null, auditService = null, notificationService = null) {
    this.userRepo = repositories.user;
    this.adapter = kycAdapter;
    this.audit = auditService;
    this.notification = notificationService;
  }

  /**
   * Start a verification session with the external provider
   * @param {string} userId 
   * @param {string} tier 
   * @returns {Promise<Object>} Verification details and SDK token
   */
  async initiateVerification(userId, tier) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new ValidationError('User not found');

    if (!this.adapter) {
      // Fallback to manual mode if no adapter configured
      return this.submitVerification(userId, tier, { mode: 'manual' });
    }

    try {
      // 1. Create applicant in external system
      const externalId = await this.adapter.createApplicant(user);

      // 2. Generate SDK token for frontend
      const sdkToken = await this.adapter.generateSdkToken(externalId);

      // 3. Create local record
      const query = `
        INSERT INTO kyc_verifications (user_id, tier, status, provider, external_id)
        VALUES ($1, $2, 'pending', $3, $4)
        RETURNING *
      `;
      const result = await this.userRepo.query(query, [userId, tier, 'onfido', externalId]);

      if (this.audit) {
        await this.audit.logEvent('kyc_initiated', { userId, tier, externalId, provider: 'onfido' }, userId);
      }

      return {
        success: true,
        verification: result.rows[0],
        sdkToken
      };
    } catch (error) {
      logger.error('Failed to initiate external KYC', error);
      throw error;
    }
  }

  async submitVerification(userId, tier, documents) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new ValidationError('User not found');

    const query = `
      INSERT INTO kyc_verifications (user_id, tier, documents, status, provider)
      VALUES ($1, $2, $3, 'pending', 'manual')
      RETURNING *
    `;
    const result = await this.userRepo.query(query, [userId, tier, JSON.stringify(documents)]);
    return result.rows[0];
  }

  /**
   * Handle webhook from external KYC provider
   * @param {string} provider 
   * @param {Object} payload 
   */
  async handleWebhook(provider, payload) {
    if (provider === 'onfido') {
      const { applicant_id, status, result, check_id } = payload;
      const internalStatus = this.adapter.mapStatus(status, result);

      const query = `
        SELECT * FROM kyc_verifications 
        WHERE external_id = $1 
        ORDER BY created_at DESC LIMIT 1
      `;
      const verificationResult = await this.userRepo.query(query, [applicant_id]);
      const verification = verificationResult.rows[0];

      if (!verification) {
        logger.warn('KYC Webhook received for unknown applicant', { applicant_id });
        return;
      }

      // Update verification record
      await this.userRepo.query(`
        UPDATE kyc_verifications 
        SET status = $1, metadata = $2, completed_at = NOW(), updated_at = NOW()
        WHERE id = $3
      `, [internalStatus, JSON.stringify(payload), verification.id]);

      // If approved, upgrade user tier
      if (internalStatus === 'approved') {
        await this.userRepo.update(verification.user_id, {
          kyc_tier: verification.tier,
          kyc_verified_at: new Date(),
          monthly_limit: KYC_TIERS[verification.tier].monthlyLimit
        });

        if (this.audit) {
          await this.audit.logEvent('kyc_approved_auto', {
            userId: verification.user_id,
            externalId: applicant_id
          }, verification.user_id);
        }

        if (this.notification) {
          this.notification.sendUserAlert(verification.user_id, 'kyc_status_updated', {
            status: 'approved',
            tier: verification.tier,
            message: `You have been verified for ${verification.tier} tier!`
          });
        }

        logger.info('User KYC upgraded via automated external check', { userId: verification.user_id, tier: verification.tier });
      } else if (internalStatus === 'rejected') {
        if (this.audit) {
          await this.audit.logEvent('kyc_rejected_auto', {
            userId: verification.user_id,
            tier: verification.tier,
            externalId: applicant_id,
            reason: result
          }, verification.user_id);
        }
      }
    }
  }

  async approveVerification(verificationId, adminId) {
    const query = `
      UPDATE kyc_verifications 
      SET status = 'approved', verified_by = $2, updated_at = NOW(), completed_at = NOW()
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
