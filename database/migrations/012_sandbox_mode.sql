-- Developer Sandbox Mode

-- 1. Add environment to API keys
ALTER TABLE user_api_keys ADD COLUMN environment VARCHAR(20) DEFAULT 'production';

-- 2. Add sandbox flag to ledger and transactions
ALTER TABLE ledger_transactions ADD COLUMN is_sandbox BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN is_sandbox BOOLEAN DEFAULT FALSE;

-- 3. Create indices for performance in filtering reports
CREATE INDEX idx_user_api_keys_env ON user_api_keys(environment);
CREATE INDEX idx_ledger_transactions_sandbox ON ledger_transactions(is_sandbox);
CREATE INDEX idx_transactions_sandbox ON transactions(is_sandbox);

COMMENT ON COLUMN user_api_keys.environment IS 'production or sandbox';
COMMENT ON COLUMN ledger_transactions.is_sandbox IS 'TRUE if this transaction was initiated in sandbox environment';
