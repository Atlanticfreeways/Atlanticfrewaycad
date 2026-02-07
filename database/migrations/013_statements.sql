CREATE TABLE statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, generated, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fetching user statements
CREATE INDEX idx_statements_user ON statements(user_id);
