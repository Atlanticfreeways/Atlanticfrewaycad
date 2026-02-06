class EventAuditService {
  constructor(repositories) {
    this.userRepo = repositories.user;
  }

  /**
   * Log an actionable event to the audit log
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.action - e.g. 'login', 'create_card', 'export_data'
   * @param {string} params.resourceType - e.g. 'user', 'card', 'transaction'
   * @param {string} params.resourceId - ID of the resource affected
   * @param {Object} params.metadata - Additional data
   * @param {Object} params.req - Express request object (optional) to extract IP/UA
   */
  async logAction({ userId, action, resourceType, resourceId, metadata = {}, req = null }) {
    const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, status, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const ipAddress = req ? req.ip : (metadata.ipAddress || null);
    const userAgent = req ? req.get('user-agent') : (metadata.userAgent || null);
    const status = metadata.status || 'success';

    try {
      const result = await this.userRepo.query(query, [
        userId || null,
        action,
        resourceType,
        resourceId || null,
        ipAddress,
        userAgent,
        status,
        JSON.stringify(metadata)
      ]);
      return result.rows[0];
    } catch (err) {
      console.error('Failed to write audit log:', err);
      // Don't throw, just log error so main flow isn't interrupted
      return null;
    }
  }

  // Legacy method support (mapped to new schema)
  async logEvent(eventType, data, userId = null) {
    return this.logAction({
      userId,
      action: eventType,
      resourceType: 'system',
      metadata: data
    });
  }

  async getEventHistory(filters = {}, limit = 100) {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.userId) {
      query += ` AND user_id = $${paramCount}`;
      params.push(filters.userId);
      paramCount++;
    }

    if (filters.action) {
      query += ` AND action = $${paramCount}`;
      params.push(filters.action);
      paramCount++;
    }

    if (filters.resourceType) {
      query += ` AND resource_type = $${paramCount}`;
      params.push(filters.resourceType);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit) || 100}`;

    const result = await this.userRepo.query(query, params);
    return result.rows;
  }
}

module.exports = EventAuditService;
