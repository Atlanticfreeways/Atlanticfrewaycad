-- Add alerting state columns
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS alert_history JSONB DEFAULT '{}', -- Tracks triggered alerts { "80": "2024-02-06T...", "90": null }
ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;

-- We already have alert_threshold_percent and notify_emails from previous migration
