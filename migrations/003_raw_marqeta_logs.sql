-- Migration: Add Raw Marqeta Webhook Logs
-- This table enables the "ISO 8583 Exposer" feature by storing the full raw payload
-- of every Marqeta webhook event for troubleshooting and compliance.

CREATE TABLE IF NOT EXISTS marqeta_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- e.g., 'transaction.authorization'
    event_token VARCHAR(255),         -- The 'token' field from the webhook
    payload JSONB NOT NULL,           -- The full raw JSON body
    headers JSONB,                    -- Headers for signature verification debugging
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookup by token (for troubleshooting specific declines)
CREATE INDEX IF NOT EXISTS idx_marqeta_logs_token ON marqeta_event_logs(event_token);
CREATE INDEX IF NOT EXISTS idx_marqeta_logs_type ON marqeta_event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_marqeta_logs_created ON marqeta_event_logs(created_at DESC);
