class EventAuditService {
  constructor(repositories) {
    this.userRepo = repositories.user;
  }

  async logEvent(eventType, data, userId = null) {
    const query = `
      INSERT INTO event_audit_log (event_type, event_data, user_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await this.userRepo.query(query, [
      eventType,
      JSON.stringify(data),
      userId,
      data.ipAddress || null,
      data.userAgent || null
    ]);

    return result.rows[0];
  }

  async getEventHistory(filters = {}) {
    let query = 'SELECT * FROM event_audit_log WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.userId) {
      query += ` AND user_id = $${paramCount}`;
      params.push(filters.userId);
      paramCount++;
    }

    if (filters.eventType) {
      query += ` AND event_type = $${paramCount}`;
      params.push(filters.eventType);
      paramCount++;
    }

    if (filters.startDate) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const result = await this.userRepo.query(query, params);
    return result.rows;
  }
}

module.exports = EventAuditService;
