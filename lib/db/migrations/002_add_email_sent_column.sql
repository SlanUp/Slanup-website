-- Migration 002: Add email_sent column to prevent duplicate ticket emails
-- This migration adds tracking for sent emails to avoid duplicate notifications

-- Add email_sent column to existing bookings table
ALTER TABLE bookings 
ADD COLUMN email_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster email_sent lookups
CREATE INDEX IF NOT EXISTS idx_bookings_email_sent ON bookings(email_sent);

-- For any existing bookings with 'completed' status, mark emails as sent
-- (since they likely already received emails before this fix)
UPDATE bookings 
SET email_sent = true 
WHERE payment_status = 'completed';