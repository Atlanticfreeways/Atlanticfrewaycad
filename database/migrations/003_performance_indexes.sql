-- 003_performance_indexes.sql
-- Optimizing query performance for transactions, cards, and users

-- Transactions: Filter by Merchant, Category, Amount
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_name);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(merchant_category);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);

-- Transactions: Composite index for user + date range (most common query)
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC);

-- Cards: Filter by Status per User
CREATE INDEX IF NOT EXISTS idx_cards_user_status ON cards(user_id, status);

-- Users: Social Auth Lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- Audit Logs: Action types
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
