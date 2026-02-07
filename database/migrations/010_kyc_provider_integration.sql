-- Enhance kyc_verifications for external provider integration
ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'manual';
ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Index for lookup by provider ID (common for webhooks)
CREATE INDEX IF NOT EXISTS idx_kyc_external_id ON kyc_verifications(external_id);
