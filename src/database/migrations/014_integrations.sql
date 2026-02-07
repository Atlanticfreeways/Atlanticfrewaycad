-- Integrations Table (Stores OAuth tokens and status)
CREATE TABLE IF NOT EXISTS integrations (
    id SERIAL PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'quickbooks', 'xero', 'netsuite'
    
    -- OAuth Data
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    realm_id VARCHAR(100), -- QuickBooks Realm ID / Xero Tenant ID
    
    -- Config
    is_active BOOLEAN DEFAULT FALSE,
    sync_settings JSONB DEFAULT '{}', -- e.g. { "sync_date": "2024-01-01", "auto_sync": true }
    
    -- Sync Status
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(20), -- 'success', 'failed', 'partial'
    last_sync_error TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, provider)
);

-- GL Mappings (Maps our Categories to Their Accounts)
CREATE TABLE IF NOT EXISTS integration_mappings (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER REFERENCES integrations(id) ON DELETE CASCADE,
    
    internal_category VARCHAR(100) NOT NULL, -- e.g. 'Software', 'Travel'
    external_account_id VARCHAR(100) NOT NULL, -- e.g. 'QB-123', 'XERO-456'
    external_account_name VARCHAR(200), -- for UI display
    
    UNIQUE(integration_id, internal_category)
);
