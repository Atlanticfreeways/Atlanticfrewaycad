const BaseRepository = require('../BaseRepository');

class AffiliateRepository extends BaseRepository {
    // --- Partners ---
    async getPartnerByCode(referralCode) {
        const query = 'SELECT * FROM partners WHERE referral_code = $1';
        const result = await this.query(query, [referralCode]);
        return result.rows[0];
    }

    async getPartnerById(partnerId) {
        const query = 'SELECT * FROM partners WHERE id = $1';
        const result = await this.query(query, [partnerId]);
        return result.rows[0];
    }

    async createPartner(data) {
        const query = `
      INSERT INTO partners (user_id, referral_code, tier, commission_rate)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const result = await this.query(query, [data.userId, data.referralCode, data.tier || 'tier1', data.commissionRate || 0.10]);
        return result.rows[0];
    }

    // --- Clicks ---
    async logClick(data) {
        const query = `
      INSERT INTO referral_clicks 
      (referral_code, ip_address, user_agent, device_type, browser, country, referrer_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const result = await this.query(query, [
            data.referralCode, data.ip, data.userAgent, data.device, data.browser, data.country, data.referrer
        ]);
        return result.rows[0];
    }

    async getRecentClicks(referralCode, ip, timeWindowMs) {
        const query = `
      SELECT * FROM referral_clicks 
      WHERE referral_code = $1 
      AND ip_address = $2 
      AND created_at > NOW() - INTERVAL '1 millisecond' * $3
    `;
        const result = await this.query(query, [referralCode, ip, timeWindowMs]);
        return result.rows;
    }

    async getClickStats(referralCode) {
        const query = `
      SELECT 
        COUNT(*) as total_clicks,
        COUNT(DISTINCT ip_address) as unique_clicks,
        COUNT(CASE WHEN converted = TRUE THEN 1 END) as conversions
      FROM referral_clicks
      WHERE referral_code = $1
    `;
        const result = await this.query(query, [referralCode]);
        return result.rows[0];
    }

    async getClickTrends(referralCode, hours) {
        const query = `
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM referral_clicks
      WHERE referral_code = $1
      AND created_at >= NOW() - INTERVAL '1 hour' * $2
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `;
        const result = await this.query(query, [referralCode, hours]);
        return result.rows;
    }

    async markClickConverted(referralCode, ip) {
        // Find the most recent click for this IP/Code pair
        const query = `
        UPDATE referral_clicks
        SET converted = TRUE
        WHERE id = (
            SELECT id FROM referral_clicks 
            WHERE referral_code = $1 AND ip_address = $2
            ORDER BY created_at DESC 
            LIMIT 1
        )
      `;
        await this.query(query, [referralCode, ip]);
    }

    // --- Referrals ---
    async getReferralsByPartner(partnerId) {
        const query = 'SELECT * FROM referrals WHERE partner_id = $1 ORDER BY created_at DESC';
        const result = await this.query(query, [partnerId]);
        return result.rows;
    }

    async getReferralByCodeAndStatus(code, status) {
        const query = `
        SELECT r.* FROM referrals r
        JOIN partners p ON r.partner_id = p.id
        WHERE p.referral_code = $1 AND r.status = $2
     `;
        const result = await this.query(query, [code, status]);
        return result.rows;
    }

    async updateReferralStatus(referralId, status, userId = null) {
        const query = `
        UPDATE referrals 
        SET status = $1, referred_user_id = COALESCE($2, referred_user_id), converted_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
        const result = await this.query(query, [status, userId, referralId]);
        return result.rows[0];
    }

    // --- Commissions ---
    async createCommission(data) {
        const query = `
      INSERT INTO commissions 
      (partner_id, referral_id, transaction_id, type, amount, currency, status, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
        const result = await this.query(query, [
            data.partnerId, data.referralId, data.transactionId, data.type,
            data.amount, data.currency, data.status || 'pending', data.metadata
        ]);
        return result.rows[0];
    }

    async getCommissionsByPartner(partnerId) {
        const query = 'SELECT * FROM commissions WHERE partner_id = $1 ORDER BY created_at DESC';
        const result = await this.query(query, [partnerId]);
        return result.rows;
    }
}

module.exports = AffiliateRepository;
