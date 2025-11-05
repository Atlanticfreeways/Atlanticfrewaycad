const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class Database {
  async query(text, params) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // User operations
  async createUser(userData) {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, marqeta_user_token, company_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, role, status, created_at
    `;
    const result = await this.query(query, [
      userData.email,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.marqetaUserToken,
      userData.companyId
    ]);
    return result.rows[0];
  }

  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result.rows[0];
  }

  async getUserById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  // Card operations
  async createCard(cardData) {
    const query = `
      INSERT INTO cards (user_id, marqeta_card_token, card_product_id, daily_limit, monthly_limit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await this.query(query, [
      cardData.userId,
      cardData.marqetaCardToken,
      cardData.cardProductId,
      cardData.dailyLimit,
      cardData.monthlyLimit
    ]);
    return result.rows[0];
  }

  async getCardsByUserId(userId) {
    const query = `
      SELECT c.*, cp.name as product_name 
      FROM cards c 
      JOIN card_products cp ON c.card_product_id = cp.id 
      WHERE c.user_id = $1
    `;
    const result = await this.query(query, [userId]);
    return result.rows;
  }

  async getCardByToken(marqetaCardToken) {
    const query = 'SELECT * FROM cards WHERE marqeta_card_token = $1';
    const result = await this.query(query, [marqetaCardToken]);
    return result.rows[0];
  }

  // Transaction operations
  async createTransaction(transactionData) {
    const query = `
      INSERT INTO transactions (marqeta_transaction_token, card_id, user_id, amount, currency, merchant_name, merchant_category, status, authorization_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await this.query(query, [
      transactionData.marqetaTransactionToken,
      transactionData.cardId,
      transactionData.userId,
      transactionData.amount,
      transactionData.currency,
      transactionData.merchantName,
      transactionData.merchantCategory,
      transactionData.status,
      transactionData.authorizationCode
    ]);
    return result.rows[0];
  }

  async getTransactionsByUserId(userId, limit = 50) {
    const query = `
      SELECT t.*, c.marqeta_card_token 
      FROM transactions t 
      JOIN cards c ON t.card_id = c.id 
      WHERE t.user_id = $1 
      ORDER BY t.created_at DESC 
      LIMIT $2
    `;
    const result = await this.query(query, [userId, limit]);
    return result.rows;
  }

  // Company operations
  async getDefaultCompany() {
    const query = 'SELECT * FROM companies LIMIT 1';
    const result = await this.query(query);
    return result.rows[0];
  }

  async getDefaultCardProduct() {
    const query = 'SELECT * FROM card_products LIMIT 1';
    const result = await this.query(query);
    return result.rows[0];
  }
}

module.exports = new Database();