-- Approval Rules
-- Define policies like "Transactions > $1000 require Admin approval"
CREATE TABLE IF NOT EXISTS approval_rules (
    id SERIAL PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "High Value Spend"
    min_amount DECIMAL(12, 2) DEFAULT 0,
    max_amount DECIMAL(12, 2), -- Optional constraint
    required_role VARCHAR(50) NOT NULL, -- 'admin', 'finance_manager'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Requests
-- Represents a user asking for permission (e.g. for a new card, or a specific large purchase)
CREATE TABLE IF NOT EXISTS approval_requests (
    id SERIAL PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    requester_id UUID REFERENCES users(id),
    
    request_type VARCHAR(50) NOT NULL, -- 'new_card', 'limit_increase', 'expense'
    amount DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    reason TEXT,
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    
    -- Snapshot of rule applied at time of request
    applied_rule_id INTEGER REFERENCES approval_rules(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Logs (Audit Trail)
-- Tracks who approved/rejected and when
CREATE TABLE IF NOT EXISTS approval_logs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES approval_requests(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id), -- The approver/rejecter
    action VARCHAR(20) NOT NULL, -- 'approve', 'reject', 'comment'
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookup of pending requests
CREATE INDEX idx_approval_requests_company_status ON approval_requests(company_id, status);
CREATE INDEX idx_approval_requests_requester ON approval_requests(requester_id);
