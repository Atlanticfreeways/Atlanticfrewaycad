const BaseRepository = require('../BaseRepository');

class SpendingControlRepository extends BaseRepository {
  async create(cardId, controls) {
    const query = `
      INSERT INTO spending_controls (card_id, daily_limit, monthly_limit, merchant_restrictions, location_restrictions, time_restrictions)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await this.query(query, [
      cardId,
      controls.dailyLimit || null,
      controls.monthlyLimit || null,
      JSON.stringify(controls.merchantRestrictions || []),
      JSON.stringify(controls.locationRestrictions || {}),
      JSON.stringify(controls.timeRestrictions || {})
    ]);
    return result.rows[0];
  }

  async findByCard(cardId) {
    const query = 'SELECT * FROM spending_controls WHERE card_id = $1';
    const result = await this.query(query, [cardId]);
    return result.rows[0];
  }

  async update(cardId, controls) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(controls).forEach(key => {
      if (['merchantRestrictions', 'locationRestrictions', 'timeRestrictions'].includes(key)) {
        fields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramCount}`);
        values.push(JSON.stringify(controls[key]));
      } else {
        fields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramCount}`);
        values.push(controls[key]);
      }
      paramCount++;
    });

    fields.push(`updated_at = NOW()`);
    values.push(cardId);

    const query = `UPDATE spending_controls SET ${fields.join(', ')} WHERE card_id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }
}

module.exports = SpendingControlRepository;
