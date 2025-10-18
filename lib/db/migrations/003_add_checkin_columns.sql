-- Migration 003: Add check-in functionality columns
-- This migration adds tracking for event check-ins

-- Add checked_in column to track if guest has been checked in
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN NOT NULL DEFAULT FALSE;

-- Add checked_in_at column to track when the guest was checked in
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP;

-- Create index for faster check-in lookups
CREATE INDEX IF NOT EXISTS idx_bookings_checked_in ON bookings(checked_in);
CREATE INDEX IF NOT EXISTS idx_bookings_reference_number ON bookings(reference_number);

-- Update any existing bookings based on Google Sheets data if needed
-- This is a placeholder - actual sync would need to be done via the API