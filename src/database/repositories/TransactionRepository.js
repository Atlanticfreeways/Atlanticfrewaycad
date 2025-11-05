const BaseRepository = require('../BaseRepository');

class TransactionRepository extends BaseRepository {
  async create(txData) {
    const query = `
      INSERT INTO transactions (marqeta_transaction_token, card_id, user_id, amount, currency, merchant_name, merchant_category, status, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await this.query(query, [
      txData.marqetaTransactionToken,
      txData.cardId,
      txData.userId,
      txData.amount,
      txData.currency || 'USD',
      txData.merchantName,
      txData.merchantCategory || null,
      txData.status,
      JSON.stringify(txData.metadata || {})
    ]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async findByMarqetaToken(token) {
    const query = 'SELECT * FROM transactions WHERE marqeta_transaction_token = $1';
    const result = await this.query(query, [token]);
    return result.rows[0];
  }

  async findByUser(userId, limit = 50) {
    const query = `
      SELECT t.*, c.last_four, c.card_type 
      FROM transactions t 
      JOIN cards c ON t.card_id = c.id 
      WHERE t.user_id = $1 
      ORDER BY t.created_at DESC 
      LIMIT $2
    `;
    const result = await this.query(query, [userId, limit]);
    return result.rows;
  }

  async findByCard(cardId, limit = 50) {
    const query = 'SELECT * FROM transactions WHERE card_id = $1 ORDER BY created_at DESC LIMIT $2';
    const result = await this.query(query, [cardId, limit]);
    return result.rows;
  }

  async getDailySpending(cardId, date = new Date()) {
    const query = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE card_id = $1 
      AND DATE(created_at) = DATE($2)
      AND status = 'approved'
    `;
    const result = await this.query(query, [cardId, date]);
    return parseFloat(result.rows[0].total);
  }

  async getMonthlySpending(cardId, year, month) {
    const query = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE card_id = $1 
      AND EXTRACT(YEAR FROM created_at) = $2
      AND EXTRACT(MONTH FROM created_at) = $3
      AND status = 'approved'
    `;
    const result = await this.query(query, [cardId, year, month]);
    return parseFloat(result.rows[0].total);
  }
}

module.exports = TransactionRepository;
