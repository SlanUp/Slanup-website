-- Security Fix #1: Prevent duplicate bookings with same invite code
-- This creates a partial unique index that only applies to completed bookings
CREATE UNIQUE INDEX IF NOT EXISTS unique_completed_invite_code 
ON bookings(invite_code) 
WHERE payment_status = 'completed';

-- Security Fix #2: Add expires_at for booking expiry (30 minutes)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Create index on expires_at for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON bookings(expires_at);

-- Security Fix #3: Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  signature VARCHAR(512) NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast duplicate detection
CREATE INDEX IF NOT EXISTS idx_webhook_events_order_id ON webhook_events(order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_invite_payment ON bookings(invite_code, payment_status);
