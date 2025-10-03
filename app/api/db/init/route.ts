import { NextResponse } from 'next/server';
import { createBookingsTable } from '@/lib/db';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create main bookings table
    await createBookingsTable();
    
    // Run security migrations
    // 1. Add unique constraint for invite codes
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_completed_invite_code 
      ON bookings(invite_code) 
      WHERE payment_status = 'completed'
    `;
    
    // 2. Add expires_at column
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON bookings(expires_at)`;
    
    // 3. Create webhook_events table for idempotency
    await sql`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id VARCHAR(255) PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        order_id VARCHAR(255) NOT NULL,
        signature VARCHAR(512) NOT NULL,
        payload JSONB NOT NULL,
        processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 4. Add indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_webhook_events_order_id ON webhook_events(order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_invite_payment ON bookings(invite_code, payment_status)`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized with security fixes successfully' 
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
