-- Event Audit Log Table

CREATE TABLE IF NOT EXISTS event_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_event_audit_user ON event_audit_log(user_id);
CREATE INDEX idx_event_audit_type ON event_audit_log(event_type);
CREATE INDEX idx_event_audit_created ON event_audit_log(created_at);
CREATE INDEX idx_event_audit_status ON event_audit_log(status);
