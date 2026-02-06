const BaseRepository = require('../BaseRepository');

class CardRepository extends BaseRepository {
  async create(cardData) {
    const query = `
      INSERT INTO cards (user_id, marqeta_card_token, card_type, status, last_four, daily_limit, monthly_limit, transaction_limit, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await this.query(query, [
      cardData.userId,
      cardData.marqetaCardToken,
      cardData.cardType || 'virtual',
      cardData.status || 'active',
      cardData.lastFour || null,
      cardData.dailyLimit || 1000.00,
      cardData.monthlyLimit || 5000.00,
      cardData.transactionLimit || 500.00,
      JSON.stringify(cardData.metadata || {})
    ]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM cards WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async findByMarqetaToken(token) {
    const query = 'SELECT * FROM cards WHERE marqeta_card_token = $1';
    const result = await this.query(query, [token]);
    return result.rows[0];
  }

  async findByUser(userId) {
    const query = 'SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [userId]);
    return result.rows;
  }

  async findByCompany(companyId) {
    const query = `
      SELECT c.*, u.first_name, u.last_name 
      FROM cards c 
      JOIN users u ON c.user_id = u.id 
      WHERE u.company_id = $1 
      ORDER BY c.created_at DESC
    `;
    const result = await this.query(query, [companyId]);
    return result.rows;
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Map camelCase to snake_case for DB columns
    const keys = Object.keys(updates);
    for (const key of keys) {
      let dbColumn = key;

      // Manual mapping for known fields
      if (key === 'dailyLimit') dbColumn = 'daily_limit';
      else if (key === 'monthlyLimit') dbColumn = 'monthly_limit';
      else if (key === 'transactionLimit') dbColumn = 'transaction_limit';

      if (dbColumn === 'metadata') {
        fields.push(`${dbColumn} = $${paramCount}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${dbColumn} = $${paramCount}`);
        values.push(updates[key]);
      }
      paramCount++;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE cards SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }
}

module.exports = CardRepository;
