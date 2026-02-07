CREATE TABLE reconciliation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'matched', 'discrepancy_found', 'error', 'pending'
    discrepancies JSONB, -- Details of any found issues
    processed_count INTEGER DEFAULT 0,
    total_volume DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for date lookups
CREATE INDEX idx_recon_date ON reconciliation_reports(date);
