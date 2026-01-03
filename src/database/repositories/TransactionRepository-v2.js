const BaseRepository = require('../BaseRepository');

class TransactionRepository extends BaseRepository {
  async create(transactionData) {
    const query = `
      INSERT INTO transactions (card_id, amount, merchant_name, merchant_category, status, transaction_type, marqeta_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await this.query(query, [
      transactionData.cardId,
      transactionData.amount,
      transactionData.merchantName || null,
      transactionData.merchantCategory || null,
      transactionData.status || 'pending',
      transactionData.transactionType || 'purchase',
      transactionData.marqetaToken || null
    ]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async findByCard(cardId, limit = 50) {
    const query = `
      SELECT * FROM transactions 
      WHERE card_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await this.query(query, [cardId, limit]);
    return result.rows;
  }

  async findByUser(userId, limit = 50) {
    const query = `
      SELECT t.* FROM transactions t
      JOIN cards c ON t.card_id = c.id
      WHERE c.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `;
    const result = await this.query(query, [userId, limit]);
    return result.rows;
  }

  async findByCompany(companyId, limit = 50) {
    const query = `
      SELECT t.* FROM transactions t
      JOIN cards c ON t.card_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.company_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `;
    const result = await this.query(query, [companyId, limit]);
    return result.rows;
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getSpendingByMerchant(companyId, days = 30) {
    const query = `
      SELECT 
        merchant_name,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM transactions t
      JOIN cards c ON t.card_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.company_id = $1 
        AND t.created_at >= NOW() - INTERVAL '${days} days'
        AND t.status = 'completed'
      GROUP BY merchant_name
      ORDER BY total_amount DESC
    `;
    const result = await this.query(query, [companyId]);
    return result.rows;
  }

  async getSpendingByEmployee(companyId, days = 30) {
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(t.id) as transaction_count,
        SUM(t.amount) as total_amount
      FROM users u
      LEFT JOIN cards c ON u.id = c.user_id
      LEFT JOIN transactions t ON c.id = t.card_id 
        AND t.created_at >= NOW() - INTERVAL '${days} days'
        AND t.status = 'completed'
      WHERE u.company_id = $1 AND u.status = 'active'
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY total_amount DESC
    `;
    const result = await this.query(query, [companyId]);
    return result.rows;
  }
}

module.exports = TransactionRepository;