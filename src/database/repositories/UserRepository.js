const BaseRepository = require('../BaseRepository');

class UserRepository extends BaseRepository {
  async create(userData) {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, account_type, role, company_id, marqeta_user_token, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, first_name, last_name, phone, account_type, role, company_id, status, created_at
    `;
    const result = await this.query(query, [
      userData.email,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.phone || null,
      userData.accountType,
      userData.role || 'employee',
      userData.companyId || null,
      userData.marqetaUserToken || null,
      JSON.stringify(userData.metadata || {})
    ]);
    return result.rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result.rows[0];
  }

  async findByMarqetaToken(token) {
    const query = 'SELECT * FROM users WHERE marqeta_user_token = $1';
    const result = await this.query(query, [token]);
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

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async findByCompany(companyId) {
    const query = 'SELECT * FROM users WHERE company_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [companyId]);
    return result.rows;
  }
}

module.exports = UserRepository;
