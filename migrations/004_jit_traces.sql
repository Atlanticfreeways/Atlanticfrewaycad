-- Migration: Add JIT Execution Traces
-- Stores the step-by-step logic flow of the JIT engine for visualization.

CREATE TABLE IF NOT EXISTS jit_execution_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marqeta_event_token VARCHAR(255) NOT NULL, -- Links to marqeta_event_logs
    trace_id VARCHAR(255),                     -- Correlation ID for the request
    steps JSONB NOT NULL,                      -- Array of steps: [{ step: "Check Balance", status: "PASS", latencyms: 12 }]
    final_decision VARCHAR(50),                -- 'APPROVED' or 'DECLINED'
    total_latency_ms INTEGER,                  -- Total time taken
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jit_traces_token ON jit_execution_traces(marqeta_event_token);
