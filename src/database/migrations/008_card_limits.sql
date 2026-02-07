-- Add Spending Limits to Cards
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(12, 2) DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(12, 2) DEFAULT 5000.00,
ADD COLUMN IF NOT EXISTS transaction_limit DECIMAL(12, 2) DEFAULT 500.00;

-- Add indexes for performance if needed
-- CREATE INDEX IF NOT EXISTS idx_cards_limits ON cards(daily_limit, monthly_limit);
