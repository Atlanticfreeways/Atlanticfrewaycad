-- Double-Entry Ledger System

-- 1. Ledger Accounts (COA - Chart of Accounts)
CREATE TABLE ledger_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., '1000-PLATFORM-ASSET', '2000-USER-LIABILITY'
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    owner_id UUID REFERENCES users(id), -- Optional: for user-specific liability accounts
    company_id UUID REFERENCES companies(id), -- Optional: for company-specific accounts
    currency VARCHAR(3) DEFAULT 'USD',
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Ledger Transactions (Financial Events)
CREATE TABLE ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_type VARCHAR(50) NOT NULL, -- e.g., 'card_spend', 'wallet_load', 'payout'
    reference_id UUID, -- Links to external table (e.g., wallet_transaction_id)
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Ledger Entries (Debits and Credits)
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES ledger_transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES ledger_accounts(id),
    type VARCHAR(6) NOT NULL CHECK (type IN ('debit', 'credit')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ledger_entries_transaction ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_entries_account ON ledger_entries(account_id);
CREATE INDEX idx_ledger_accounts_owner ON ledger_accounts(owner_id);

-- Initialize Standard System Accounts
INSERT INTO ledger_accounts (name, code, type, currency) VALUES 
('Platform Operating Assets', '1000-ASSET-OP', 'asset', 'USD'),
('User Wallet Liabilities', '2000-LIAB-WALLETS', 'liability', 'USD'),
('Merchant Settlement Assets', '1100-ASSET-SETTLE', 'asset', 'USD'),
('Platform Revenue (Fees)', '4000-REV-FEES', 'revenue', 'USD'),
('Partner Referral Liabilities', '2100-LIAB-PARTNERS', 'liability', 'USD');
