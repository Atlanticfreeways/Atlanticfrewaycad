-- Migration: Settlement Reconciliation
-- Enable Automated Treasury Management by tracking daily settlements

CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_date DATE NOT NULL UNIQUE,      -- One settlement report per day
    total_amount_settled NUMERIC(20, 2) NOT NULL DEFAULT 0,
    total_transactions_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',      -- PENDING, MATCHED, DISCREPANCY
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settlement_discrepancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id), -- Link to our ledger if found
    marqeta_token VARCHAR(255),                      -- Link to external reference
    marqeta_amount NUMERIC(20, 2),
    ledger_amount NUMERIC(20, 2),
    reason VARCHAR(50) NOT NULL,                     -- AMOUNT_MISMATCH, MISSING_IN_LEDGER
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_settlements_date ON settlements(settlement_date);
CREATE INDEX IF NOT EXISTS idx_discrepancies_settlement ON settlement_discrepancies(settlement_id);
