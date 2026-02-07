-- Migration: Add Virtual Accounts for GPR (General Purpose Reloadable)
-- This enables users to have unique Account and Routing numbers for Direct Deposit (Payroll).

CREATE TABLE IF NOT EXISTS virtual_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL UNIQUE, -- The Virtual Account Number
    routing_number VARCHAR(50) NOT NULL,        -- The Bank Routing Number
    bank_name VARCHAR(100) DEFAULT 'Atlantic Base Bank',
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active',        -- active, suspended
    marqeta_token VARCHAR(255),                 -- Link to Marqeta Direct Deposit Account Token
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_virtual_accounts_user ON virtual_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_accounts_number ON virtual_accounts(account_number);

-- Add column to transactions to denote source is Direct Deposit if needed, 
-- or we just use 'funding' type and metadata.
