const BaseRepository = require('../BaseRepository');

class PartnerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'partners');
  }

  async findByReferralCode(code) {
    return this.db.query(
      'SELECT * FROM partners WHERE referral_code = $1',
      [code]
    ).then(res => res.rows[0]);
  }

  async findByUserId(userId) {
    return this.db.query(
      'SELECT * FROM partners WHERE user_id = $1',
      [userId]
    ).then(res => res.rows[0]);
  }

  async findByTier(tier) {
    return this.db.query(
      'SELECT * FROM partners WHERE tier = $1 AND status = $2',
      [tier, 'active']
    ).then(res => res.rows);
  }

  async updateStatus(id, status) {
    return this.db.query(
      'UPDATE partners SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    ).then(res => res.rows[0]);
  }

  async findActivePartners(limit = 100) {
    return this.db.query(
      'SELECT * FROM partners WHERE status = $1 ORDER BY created_at DESC LIMIT $2',
      ['active', limit]
    ).then(res => res.rows);
  }
}

module.exports = PartnerRepository;
