const BaseRepository = require('../BaseRepository');

class WalletRepository extends BaseRepository {
  /**
   * Create a new wallet for a user.
   * Initializes with a default USD balance of 0.
   */
  async create(userId) {
    // 1. Create base wallet record
    const walletQuery = `
      INSERT INTO wallets (user_id, currency, crypto_addresses, bank_accounts)
      VALUES ($1, 'USD', '{}', '[]')
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `;
    let wallet = (await this.query(walletQuery, [userId])).rows[0];

    // Check if wallet already existed
    if (!wallet) {
      wallet = (await this.query('SELECT * FROM wallets WHERE user_id = $1', [userId])).rows[0];
    }

    // 2. Initialize default USD balance
    await this.query(`
      INSERT INTO wallet_balances (user_id, currency, balance)
      VALUES ($1, 'USD', 0.00)
      ON CONFLICT (user_id, currency) DO NOTHING
    `, [userId]);

    return this.findByUser(userId);
  }

  /**
   * Find wallet by user ID, including all currency balances.
   */
  async findByUser(userId) {
    const query = `
      SELECT w.*, 
             COALESCE(json_agg(json_build_object('currency', wb.currency, 'balance', wb.balance)) 
             FILTER (WHERE wb.currency IS NOT NULL), '[]') as balances
      FROM wallets w
      LEFT JOIN wallet_balances wb ON w.user_id = wb.user_id
      WHERE w.user_id = $1
      GROUP BY w.id
    `;
    const result = await this.query(query, [userId]);
    const wallet = result.rows[0];

    if (wallet && wallet.balances) {
      // Normalize balances array
      // Ensure strictly numeric types if needed, but JSON returns numbers usually.
    }

    return wallet;
  }

  /**
   * Get specific currency balance for a user
   */
  async getBalance(userId, currency) {
    const query = `
      SELECT balance FROM wallet_balances 
      WHERE user_id = $1 AND currency = $2
    `;
    const result = await this.query(query, [userId, currency]);
    return result.rows[0] ? parseFloat(result.rows[0].balance) : 0.00;
  }

  /**
   * Add funds to a user's wallet in a specific currency.
   */
  async addFunds(userId, amount, currency = 'USD') {
    const query = `
      INSERT INTO wallet_balances (user_id, currency, balance, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, currency) 
      DO UPDATE SET balance = wallet_balances.balance + $3, updated_at = NOW()
      RETURNING *
    `;
    const result = await this.query(query, [userId, currency, amount]);
    return result.rows[0];
  }

  /**
   * Deduct funds from a user's wallet.
   * Throws error if insufficient funds.
   */
  async deductFunds(userId, amount, currency = 'USD') {
    const query = `
      UPDATE wallet_balances 
      SET balance = balance - $1, updated_at = NOW()
      WHERE user_id = $2 AND currency = $3 AND balance >= $1
      RETURNING *
    `;
    const result = await this.query(query, [amount, userId, currency]);

    if (result.rows.length === 0) {
      // Check if it was because of insufficient funds or missing record
      const currentBalance = await this.getBalance(userId, currency);
      if (currentBalance < amount) {
        throw new Error(`Insufficient ${currency} funds`);
      } else {
        throw new Error('Wallet not found');
      }
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
