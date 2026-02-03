-- Account Deletion Requests (GDPR Compliance)
-- Tracks user requests to delete their account with 30-day grace period

CREATE TYPE deletion_status AS ENUM ('pending', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  scheduled_for TIMESTAMP NOT NULL,
  status deletion_status DEFAULT 'pending',
  reason TEXT,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id)
);

-- Index for cron job to process pending deletions
CREATE INDEX idx_deletion_requests_scheduled ON account_deletion_requests(scheduled_for) 
  WHERE status = 'pending';

-- Index for user lookup
CREATE INDEX idx_deletion_requests_user_id ON account_deletion_requests(user_id);

COMMENT ON TABLE account_deletion_requests IS 'GDPR-compliant account deletion requests with grace period';
COMMENT ON COLUMN account_deletion_requests.scheduled_for IS 'When the account will be deleted (30 days from request)';
COMMENT ON COLUMN account_deletion_requests.reason IS 'Optional user-provided reason for deletion';
