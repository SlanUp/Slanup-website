import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database migration...');

    // Run migration 002: Add email_sent column
    console.log('📝 Adding email_sent column...');
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT FALSE
    `;

    // Create index for better performance
    console.log('📊 Creating index for email_sent...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_email_sent ON bookings(email_sent)
    `;

    // Mark existing completed bookings as emails sent (to avoid re-sending)
    console.log('✅ Marking existing completed bookings as email sent...');
    const updateResult = await sql`
      UPDATE bookings 
      SET email_sent = true 
      WHERE payment_status = 'completed' AND email_sent = false
    `;

    console.log(`✅ Migration complete! Updated ${updateResult.rowCount} existing bookings.`);

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      updatedBookings: updateResult.rowCount
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for checking migration status
export async function GET() {
  try {
    // Check if email_sent column exists
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'email_sent'
    `;

    const migrated = result.rows.length > 0;

    return NextResponse.json({
      migrated,
      message: migrated ? 'Migration already applied' : 'Migration needed'
    });

  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
}