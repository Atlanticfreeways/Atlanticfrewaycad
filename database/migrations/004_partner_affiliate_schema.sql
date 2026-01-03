-- Partner & Affiliate Program Schema
-- Migration: 004_partner_affiliate_schema
-- Description: Complete partner ecosystem tables for multi-tier affiliate program
-- Dependencies: 001_enhanced_schema.sql (users, transactions tables)

-- ============================================================================
-- PARTNERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_type VARCHAR(20) NOT NULL CHECK (partner_type IN ('affiliate', 'reseller', 'whitelabel', 'technology')),
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('tier1', 'tier2', 'tier3', 'tier4')),
    company_name VARCHAR(255),
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
    api_key VARCHAR(255) UNIQUE,
    api_secret_hash VARCHAR(255),
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- REFERRALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'qualified', 'rejected')),
    conversion_date TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- COMMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    commission_type VARCHAR(20) NOT NULL CHECK (commission_type IN ('signup', 'recurring', 'transaction', 'bonus')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed', 'cancelled')),
    period_start DATE,
    period_end DATE,
    calculated_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PARTNER PAYOUTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_details JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    commission_ids JSONB DEFAULT '[]',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PARTNER API KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    api_secret_hash VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '[]',
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PARTNER WEBHOOKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    events JSONB DEFAULT '[]',
    secret VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'failed')),
    failure_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PARTNER ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    signups INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(partner_id, metric_date)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Partners indexes
CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_tier ON partners(tier);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);

-- Referrals indexes
CREATE INDEX IF NOT EXISTS idx_referrals_partner ON referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created ON referrals(created_at DESC);

-- Commissions indexes
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_period ON commissions(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_commissions_type ON commissions(commission_type);
CREATE INDEX IF NOT EXISTS idx_commissions_referral ON commissions(referral_id);

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON partner_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON partner_payouts(created_at DESC);

-- API keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_partner ON partner_api_keys(partner_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON partner_api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON partner_api_keys(api_key);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_partner_date ON partner_analytics(partner_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON partner_analytics(metric_date DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partner_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_updated_at();

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT EXISTS(SELECT 1 FROM partners WHERE referral_code = code) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DEMO DATA (Optional - for testing)
-- ============================================================================

-- Insert demo partner (only if users table has data)
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Get first user or create demo user
    SELECT id INTO demo_user_id FROM users LIMIT 1;
    
    IF demo_user_id IS NOT NULL THEN
        INSERT INTO partners (
            user_id,
            partner_type,
            tier,
            company_name,
            referral_code,
            commission_rate,
            status,
            settings
        ) VALUES (
            demo_user_id,
            'affiliate',
            'tier1',
            'Demo Affiliate',
            'DEMO' || substring(md5(random()::text) from 1 for 4),
            10.00,
            'active',
            '{"demo": true}'::jsonb
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE partners IS 'Partner accounts for affiliate, reseller, white-label, and technology partnerships';
COMMENT ON TABLE referrals IS 'Tracks referrals made by partners and their conversion status';
COMMENT ON TABLE commissions IS 'Commission records for partner earnings from referrals and transactions';
COMMENT ON TABLE partner_payouts IS 'Payout transactions to partners for earned commissions';
COMMENT ON TABLE partner_api_keys IS 'API keys for programmatic partner access';
COMMENT ON TABLE partner_webhooks IS 'Webhook configurations for partner event notifications';
COMMENT ON TABLE partner_analytics IS 'Daily analytics metrics for partner performance tracking';

COMMENT ON COLUMN partners.tier IS 'tier1=affiliate, tier2=reseller, tier3=whitelabel, tier4=technology';
COMMENT ON COLUMN partners.commission_rate IS 'Base commission rate as percentage (e.g., 10.00 = 10%)';
COMMENT ON COLUMN partners.settings IS 'Partner-specific settings: volume_bonuses, payout_schedule, etc.';
COMMENT ON COLUMN partners.branding IS 'White-label branding config: logo, colors, domain, etc.';

COMMENT ON COLUMN commissions.commission_type IS 'signup=one-time, recurring=monthly, transaction=per-tx, bonus=special';
COMMENT ON COLUMN commissions.period_start IS 'For recurring commissions, the billing period start date';
COMMENT ON COLUMN commissions.period_end IS 'For recurring commissions, the billing period end date';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
