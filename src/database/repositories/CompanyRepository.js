const BaseRepository = require('../BaseRepository');

class CompanyRepository extends BaseRepository {
  async create(companyData) {
    const query = `
      INSERT INTO companies (name, marqeta_business_token, card_product_token, settings)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await this.query(query, [
      companyData.name,
      companyData.marqetaBusinessToken || null,
      companyData.cardProductToken || null,
      JSON.stringify(companyData.settings || {})
    ]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM companies WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key === 'settings') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
      paramCount++;
    });

    values.push(id);
    const query = `UPDATE companies SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async list(limit = 50, offset = 0) {
    const query = 'SELECT * FROM companies ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }
}

module.exports = CompanyRepository;
