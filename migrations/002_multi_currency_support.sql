-- Multi-Currency Support Migration

-- 1. Add preferred_display_currency to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_display_currency VARCHAR(3) DEFAULT 'USD';

-- 2. Ensure wallets table exists (since it's referenced in code but missing in previous schemas)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) UNIQUE, -- Enforce one wallet per user
    balance DECIMAL(20, 8) DEFAULT 0.00, -- High precision for crypto (8 decimals)
    currency VARCHAR(10) DEFAULT 'USD',
    crypto_addresses JSONB DEFAULT '{}',
    bank_accounts JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create wallet_balances for multi-currency support
CREATE TABLE IF NOT EXISTS wallet_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    currency VARCHAR(10) NOT NULL, -- 'USD', 'BTC', 'ETH', 'USDC'
    balance DECIMAL(20, 8) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

-- 4. Migrate existing single-currency balances to new table
-- This ensures valid users with 'USD' wallets get a 'USD' balance entry
INSERT INTO wallet_balances (user_id, currency, balance)
SELECT user_id, currency, balance FROM wallets
ON CONFLICT (user_id, currency) DO UPDATE SET balance = EXCLUDED.balance;

-- 5. Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_wallet_balances_user_currency ON wallet_balances(user_id, currency);
