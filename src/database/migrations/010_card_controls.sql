-- Card Merchant Controls
-- Allows white/blacklisting specific merchants or categories (MCC)
CREATE TABLE IF NOT EXISTS card_merchant_controls (
    id SERIAL PRIMARY KEY,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    control_type VARCHAR(20) NOT NULL CHECK (control_type IN ('allow', 'block')),
    merchant_name VARCHAR(255), -- Specific merchant name (e.g. 'Netflix', 'Uber')
    mcc VARCHAR(10),            -- Merchant Category Code (e.g. '5812' for Restaurants)
    category_group VARCHAR(50), -- High level group (e.g. 'gambling', 'alcohol')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_controls_card ON card_merchant_controls(card_id);

-- Card Location Controls
-- Restrict usage by country
CREATE TABLE IF NOT EXISTS card_location_controls (
    id SERIAL PRIMARY KEY,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    control_type VARCHAR(20) NOT NULL CHECK (control_type IN ('allow', 'block')),
    country_code CHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 (e.g. 'US', 'GB')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(card_id, country_code) -- Prevent conflicting rules for same country
);

CREATE INDEX IF NOT EXISTS idx_location_controls_card ON card_location_controls(card_id);
