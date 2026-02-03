-- User Profile Extensions
-- Additional fields for user profiles (bio, company, address, preferences)

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS company VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "security": {
      "two_factor_enabled": false
    }
  }'::jsonb;

-- Index on company for team queries
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company) WHERE company IS NOT NULL;

COMMENT ON COLUMN users.bio IS 'User biography or description';
COMMENT ON COLUMN users.company IS 'Company name for business accounts';
COMMENT ON COLUMN users.address IS 'User address as JSONB (street, city, state, zip, country)';
COMMENT ON COLUMN users.preferences IS 'User preferences for notifications and security settings';
