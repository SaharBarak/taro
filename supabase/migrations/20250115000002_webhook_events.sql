-- Webhook Events Table
--
-- Purpose: Track processed webhook events to prevent replay attacks.
-- This provides an additional layer of security beyond signature verification.
--
-- Why this matters:
-- - HMAC signatures prove authenticity but not freshness
-- - An attacker who captures a valid webhook can replay it indefinitely
-- - This table tracks event IDs and timestamps to detect duplicates
--
-- Security features:
-- - event_id UNIQUE constraint prevents duplicate processing
-- - received_at timestamp enables stale event rejection (> 5 min)
-- - payload_hash provides forensic verification capability
-- - Auto-cleanup of old events (30 days retention)

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,       -- Unique event ID from webhook provider
  provider TEXT NOT NULL,               -- Provider name: 'green_invoice', 'stripe', etc.
  event_type TEXT NOT NULL,             -- Event type: 'payment.succeeded', 'payment.failed', etc.
  payload_hash TEXT NOT NULL,           -- SHA256 hash of raw payload for forensic verification
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,             -- NULL if processing failed/pending
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'skipped')),
  error_message TEXT,                   -- Error details if status = 'failed'
  idempotency_key TEXT,                 -- Original payment/order ID for correlation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast event_id lookups (already unique, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);

-- Index for cleanup queries (finding old events)
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Index for provider-specific queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider);

-- Index for monitoring failed events
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status) WHERE status = 'failed';

-- Function to cleanup old webhook events (called by cron or manually)
-- Retains events for 30 days for audit purposes
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_events
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('processed', 'skipped');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on cleanup function
GRANT EXECUTE ON FUNCTION cleanup_old_webhook_events() TO service_role;

-- RLS Policy: Webhook events are internal, no user access needed
-- Service role will handle all operations
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access to webhook_events"
  ON webhook_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comment on table for documentation
COMMENT ON TABLE webhook_events IS 'Tracks processed webhook events to prevent replay attacks. Events older than 30 days are auto-cleaned.';
COMMENT ON COLUMN webhook_events.event_id IS 'Unique identifier from the webhook provider (e.g., x-green-invoice-event-id header or payload id)';
COMMENT ON COLUMN webhook_events.payload_hash IS 'SHA256 hash of raw payload for forensic verification if needed';
COMMENT ON COLUMN webhook_events.idempotency_key IS 'Correlation ID linking to original payment/order for audit trail';
