class BaseRepository {
  constructor(db) {
    this.db = db;
  }

  async query(text, params) {
    const start = Date.now();
    const result = await this.db.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 100) {
      console.warn(`Slow query (${duration}ms):`, text);
    }
    
    return result;
  }

  async transaction(callback) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = BaseRepository;
