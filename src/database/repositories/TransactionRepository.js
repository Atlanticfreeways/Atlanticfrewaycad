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

  async findByUser(userId, filters = {}) {
    let query = `
      SELECT t.*, c.last_four, c.card_type 
      FROM transactions t 
      JOIN cards c ON t.card_id = c.id 
      WHERE t.user_id = $1 
    `;
    const params = [userId];
    let paramCount = 2;

    if (filters.startDate) {
      query += ` AND t.created_at >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND t.created_at <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    if (filters.minAmount) {
      query += ` AND t.amount >= $${paramCount}`;
      params.push(filters.minAmount);
      paramCount++;
    }

    if (filters.maxAmount) {
      query += ` AND t.amount <= $${paramCount}`;
      params.push(filters.maxAmount);
      paramCount++;
    }

    if (filters.merchant) {
      query += ` AND t.merchant_name ILIKE $${paramCount}`;
      params.push(`%${filters.merchant}%`);
      paramCount++;
    }

    if (filters.cardId) {
      query += ` AND t.card_id = $${paramCount}`;
      params.push(filters.cardId);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    // Sort
    query += ` ORDER BY t.created_at DESC`;

    // Pagination
    const limit = filters.limit ? parseInt(filters.limit) : 50;
    const page = filters.page ? parseInt(filters.page) : 1;
    const offset = (page - 1) * limit;

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await this.query(query, params);

    // Get total count for pagination metadata
    // Note: In high-volume systems, COUNT(*) can be slow. Consider an estimate or separate query.
    // For now, this suffices for a start-up scale.
    // To do this efficiently, we'd need a separate count query with the same WHERE clause.
    // For now we just return the rows.

    return result.rows;
  }

  async countByUser(userId, filters = {}) {
    let query = `
        SELECT COUNT(*) as total
        FROM transactions t 
        JOIN cards c ON t.card_id = c.id 
        WHERE t.user_id = $1 
      `;
    const params = [userId];
    let paramCount = 2;

    if (filters.startDate) { query += ` AND t.created_at >= $${paramCount}`; params.push(filters.startDate); paramCount++; }
    if (filters.endDate) { query += ` AND t.created_at <= $${paramCount}`; params.push(filters.endDate); paramCount++; }
    if (filters.minAmount) { query += ` AND t.amount >= $${paramCount}`; params.push(filters.minAmount); paramCount++; }
    if (filters.maxAmount) { query += ` AND t.amount <= $${paramCount}`; params.push(filters.maxAmount); paramCount++; }
    if (filters.merchant) { query += ` AND t.merchant_name ILIKE $${paramCount}`; params.push(`%${filters.merchant}%`); paramCount++; }
    if (filters.cardId) { query += ` AND t.card_id = $${paramCount}`; params.push(filters.cardId); paramCount++; }
    if (filters.status) { query += ` AND t.status = $${paramCount}`; params.push(filters.status); paramCount++; }

    const result = await this.query(query, params);
    return parseInt(result.rows[0].total);
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

  async getSpendingByMerchant(companyId, days = 30) {
    const query = `
      SELECT t.merchant_name, SUM(t.amount) as total_amount, COUNT(*) as transaction_count
      FROM transactions t
      JOIN cards c ON t.card_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.company_id = $1
      AND t.created_at >= NOW() - INTERVAL '1 day' * $2
      GROUP BY t.merchant_name
      ORDER BY total_amount DESC
    `;
    const result = await this.query(query, [companyId, days]);
    return result.rows;
  }

  async getSpendingByEmployee(companyId, days = 30) {
    const query = `
      SELECT u.first_name, u.last_name, SUM(t.amount) as total_amount, COUNT(*) as transaction_count
      FROM transactions t
      JOIN cards c ON t.card_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.company_id = $1
      AND t.created_at >= NOW() - INTERVAL '1 day' * $2
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY total_amount DESC
    `;
    const result = await this.query(query, [companyId, days]);
    return result.rows;
  }

  async getSpendingByCategory(companyId, days = 30) {
    const query = `
      SELECT t.merchant_category as category, SUM(t.amount) as total_amount, COUNT(*) as transaction_count
      FROM transactions t
      JOIN cards c ON t.card_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.company_id = $1
      AND t.created_at >= NOW() - INTERVAL '1 day' * $2
      GROUP BY t.merchant_category
      ORDER BY total_amount DESC
    `;
    const result = await this.query(query, [companyId, days]);
    return result.rows;
  }
}


module.exports = TransactionRepository;
