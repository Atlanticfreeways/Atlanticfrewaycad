const BaseRepository = require('../BaseRepository');

class CompanyRepository extends BaseRepository {
  async create(companyData) {
    const query = `
      INSERT INTO companies (name, industry, size, card_product_token, settings, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `;
    const result = await this.query(query, [
      companyData.name,
      companyData.industry || null,
      companyData.size || null,
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
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE companies SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async findAll(limit = 50) {
    const query = 'SELECT * FROM companies WHERE status = \'active\' ORDER BY created_at DESC LIMIT $1';
    const result = await this.query(query, [limit]);
    return result.rows;
  }

  async getStats(companyId) {
    const query = `
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT u.id) as employee_count,
        COUNT(DISTINCT ca.id) as card_count,
        COALESCE(SUM(t.amount), 0) as total_spending
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id AND u.status = 'active'
      LEFT JOIN cards ca ON u.id = ca.user_id AND ca.status = 'active'
      LEFT JOIN transactions t ON ca.id = t.card_id AND t.status = 'completed'
      WHERE c.id = $1
      GROUP BY c.id, c.name
    `;
    const result = await this.query(query, [companyId]);
    return result.rows[0];
  }
}

module.exports = CompanyRepository;