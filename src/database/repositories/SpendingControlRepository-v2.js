const BaseRepository = require('../BaseRepository');

class SpendingControlRepository extends BaseRepository {
  async create(cardId, controlData) {
    const query = `
      INSERT INTO spending_controls (card_id, daily_limit, monthly_limit, merchant_restrictions, location_restrictions, time_restrictions)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await this.query(query, [
      cardId,
      controlData.dailyLimit || null,
      controlData.monthlyLimit || null,
      JSON.stringify(controlData.merchantRestrictions || {}),
      JSON.stringify(controlData.locationRestrictions || {}),
      JSON.stringify(controlData.timeRestrictions || {})
    ]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM spending_controls WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async findByCard(cardId) {
    const query = 'SELECT * FROM spending_controls WHERE card_id = $1';
    const result = await this.query(query, [cardId]);
    return result.rows[0];
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
      paramCount++;
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE spending_controls SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM spending_controls WHERE id = $1';
    await this.query(query, [id]);
  }

  async findByCompany(companyId) {
    const query = `
      SELECT sc.* FROM spending_controls sc
      JOIN cards c ON sc.card_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE u.company_id = $1
    `;
    const result = await this.query(query, [companyId]);
    return result.rows;
  }
}

module.exports = SpendingControlRepository;