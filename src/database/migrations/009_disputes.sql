-- Dispute Management Schema

CREATE TABLE IF NOT EXISTS disputes (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    
    amount DECIMAL(12, 2) NOT NULL,
    reason VARCHAR(50) NOT NULL, -- 'fraud', 'duplicate', 'subscription_cancelled', 'product_not_received'
    status VARCHAR(50) DEFAULT 'opened', -- 'opened', 'under_review', 'evidence_submitted', 'won', 'lost'
    
    description TEXT,
    evidence_urls JSONB DEFAULT '[]', -- List of S3 URLs
    
    marqeta_dispute_token VARCHAR(255), -- If synced with Marqeta
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_disputes_user ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_transaction ON disputes(transaction_id);

-- Dispute Events / Timeline
CREATE TABLE IF NOT EXISTS dispute_events (
    id SERIAL PRIMARY KEY,
    dispute_id INTEGER REFERENCES disputes(id) NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
