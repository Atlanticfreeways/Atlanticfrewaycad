const BaseRepository = require('../BaseRepository');

class CardRepository extends BaseRepository {
  async create(cardData) {
    const query = `
      INSERT INTO cards (user_id, marqeta_card_token, card_type, status, last_four, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await this.query(query, [
      cardData.userId,
      cardData.marqetaCardToken,
      cardData.cardType || 'virtual',
      cardData.status || 'active',
      cardData.lastFour || null,
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

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key === 'metadata') {
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

    const query = `UPDATE cards SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }
}

module.exports = CardRepository;
