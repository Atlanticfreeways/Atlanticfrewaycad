CREATE TABLE IF NOT EXISTS currency_conversion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    amount_source DECIMAL(20, 8) NOT NULL,
    amount_target DECIMAL(20, 8) NOT NULL,
    rate_applied DECIMAL(20, 8) NOT NULL,
    spread_fee DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster reporting queries by date
CREATE INDEX IF NOT EXISTS idx_conversion_logs_created_at ON currency_conversion_logs(created_at);
-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_conversion_logs_user_id ON currency_conversion_logs(user_id);
