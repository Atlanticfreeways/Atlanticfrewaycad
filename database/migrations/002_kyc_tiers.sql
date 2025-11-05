-- KYC Tiered Access System

CREATE TYPE kyc_tier AS ENUM ('basic', 'standard', 'turbo', 'business');
CREATE TYPE card_network AS ENUM ('visa', 'mastercard');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_tier kyc_tier DEFAULT 'basic';
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(15,2) DEFAULT 5000.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS virtual_account_number VARCHAR(34);
ALTER TABLE users ADD COLUMN IF NOT EXISTS virtual_routing_number VARCHAR(9);
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_spent DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS limit_reset_at TIMESTAMP DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month');

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier kyc_tier NOT NULL,
  status kyc_status DEFAULT 'pending',
  documents JSONB,
  rejection_reason TEXT,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kyc_user ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status);
CREATE INDEX idx_users_tier ON users(kyc_tier);
