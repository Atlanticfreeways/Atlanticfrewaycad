const BaseRepository = require('../BaseRepository');

class WalletRepository extends BaseRepository {
  async create(userId) {
    const query = `
      INSERT INTO wallets (user_id, balance, currency)
      VALUES ($1, 0, 'USD')
      RETURNING *
    `;
    const result = await this.query(query, [userId]);
    return result.rows[0];
  }

  async findByUser(userId) {
    const query = 'SELECT * FROM wallets WHERE user_id = $1';
    const result = await this.query(query, [userId]);
    return result.rows[0];
  }

  async addFunds(userId, amount) {
    const query = `
      UPDATE wallets 
      SET balance = balance + $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING *
    `;
    const result = await this.query(query, [amount, userId]);
    return result.rows[0];
  }

  async deductFunds(userId, amount) {
    const query = `
      UPDATE wallets 
      SET balance = balance - $1, updated_at = NOW()
      WHERE user_id = $2 AND balance >= $1
      RETURNING *
    `;
    const result = await this.query(query, [amount, userId]);
    return result.rows[0];
  }

  async getBalance(userId) {
    const query = 'SELECT balance FROM wallets WHERE user_id = $1';
    const result = await this.query(query, [userId]);
    return result.rows[0]?.balance || 0;
  }

  async recordTransaction(userId, amount, type, description) {
    const query = `
      INSERT INTO wallet_transactions (user_id, amount, type, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await this.query(query, [userId, amount, type, description]);
    return result.rows[0];
  }

  async getTransactionHistory(userId, limit = 50) {
    const query = `
      SELECT * FROM wallet_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await this.query(query, [userId, limit]);
    return result.rows;
  }
}

module.exports = WalletRepository;