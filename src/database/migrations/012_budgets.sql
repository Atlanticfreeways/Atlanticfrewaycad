-- Budgets
-- Represents a spending limit for a scope (Team or Category) over a period
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Marketing Q3", "Engineering SaaS"
    
    -- Scope
    scope_type VARCHAR(20) NOT NULL, -- 'company', 'team', 'category', 'project' (user-defined tag)
    scope_value VARCHAR(100), -- Team ID, Category Name, or Project Tag
    
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Period
    period VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annual', 'one_time'
    start_date DATE NOT NULL,
    end_date DATE, -- Optional for recurring
    
    -- Alerting
    alert_threshold_percent INTEGER DEFAULT 80, -- Notify when 80% used
    notify_emails TEXT[], -- Array of emails
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookup of active budgets
CREATE INDEX idx_budgets_company_period ON budgets(company_id, period);
