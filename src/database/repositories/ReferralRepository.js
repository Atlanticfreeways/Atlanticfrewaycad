const BaseRepository = require('../BaseRepository');

class ReferralRepository extends BaseRepository {
  constructor(db) {
    super(db, 'referrals');
  }

  async findByCode(code) {
    return this.db.query(
      'SELECT * FROM referrals WHERE referral_code = $1 ORDER BY created_at DESC',
      [code]
    ).then(res => res.rows);
  }

  async findByPartner(partnerId, limit = 100) {
    return this.db.query(
      'SELECT * FROM referrals WHERE partner_id = $1 ORDER BY created_at DESC LIMIT $2',
      [partnerId, limit]
    ).then(res => res.rows);
  }

  async countByStatus(partnerId, status) {
    return this.db.query(
      'SELECT COUNT(*) as count FROM referrals WHERE partner_id = $1 AND status = $2',
      [partnerId, status]
    ).then(res => parseInt(res.rows[0].count));
  }

  async markConverted(id, userId) {
    return this.db.query(
      'UPDATE referrals SET status = $1, referred_user_id = $2, conversion_date = NOW() WHERE id = $3 RETURNING *',
      ['converted', userId, id]
    ).then(res => res.rows[0]);
  }

  async findPendingByCode(code) {
    return this.db.query(
      'SELECT * FROM referrals WHERE referral_code = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [code, 'pending']
    ).then(res => res.rows[0]);
  }
}

module.exports = ReferralRepository;
