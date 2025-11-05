const BaseRepository = require('../BaseRepository');

class WalletRepository extends BaseRepository {
  async create(userId) {
    const query = `
      INSERT INTO wallets (user_id, balance, currency, crypto_addresses, bank_accounts)
      VALUES ($1, 0.00, 'USD', '{}', '[]')
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
    if (result.rows.length === 0) {
      throw new Error('Insufficient funds');
    }
    return result.rows[0];
  }

  async updateCryptoAddresses(userId, addresses) {
    const query = `
      UPDATE wallets 
      SET crypto_addresses = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING *
    `;
    const result = await this.query(query, [JSON.stringify(addresses), userId]);
    return result.rows[0];
  }
}

module.exports = WalletRepository;
