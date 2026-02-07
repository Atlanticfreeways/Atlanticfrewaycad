-- Add Two-Factor Authentication fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB;

-- Add index for security auditing
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users(two_factor_enabled);
