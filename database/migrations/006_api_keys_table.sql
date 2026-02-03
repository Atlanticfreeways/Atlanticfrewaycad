-- API Keys Table
-- Stores user-generated API keys for programmatic access

CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON user_api_keys(key_hash);
CREATE INDEX idx_api_keys_expires ON user_api_keys(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE user_api_keys IS 'API keys for programmatic access (stored as bcrypt hashes)';
COMMENT ON COLUMN user_api_keys.key_hash IS 'Bcrypt hash of the API key (plaintext shown only once on creation)';
COMMENT ON COLUMN user_api_keys.name IS 'User-friendly name for the key (e.g., "Production Server", "Mobile App")';
