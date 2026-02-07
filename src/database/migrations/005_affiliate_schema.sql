-- Migration: Affiliate and Click Tracking Schema
-- Replaces memoryStore.js with persistent tables

-- 1. Partners Table (Extends User or Standalone)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id), -- If partners are users
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    tier VARCHAR(20) DEFAULT 'tier1',
    commission_rate DECIMAL(5, 4) DEFAULT 0.10,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id),
    referred_user_id UUID REFERENCES users(id), -- Nullable initially until conversion
    campaign_code VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- pending, converted, approved, rejected
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Clicks Table (High Volume)
CREATE TABLE IF NOT EXISTS referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(20),
    browser VARCHAR(20),
    country VARCHAR(2),
    referrer_url TEXT,
    converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_clicks_referral_code ON referral_clicks(referral_code);
CREATE INDEX idx_clicks_created_at ON referral_clicks(created_at);

-- 4. Commissions Table (Financial Record)
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id),
    referral_id UUID REFERENCES referrals(id),
    transaction_id UUID REFERENCES transactions(id), -- If tied to a transaction
    type VARCHAR(20) NOT NULL, -- signup, recurring, transaction
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, rejected
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Index for financial reporting
CREATE INDEX idx_commissions_partner ON commissions(partner_id);
CREATE INDEX idx_commissions_status ON commissions(status);
