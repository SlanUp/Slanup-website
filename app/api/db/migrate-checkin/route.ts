import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminSecret } = body;
    
    // Simple security check
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Running check-in migration...');
    
    // Add checked_in column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS checked_in BOOLEAN NOT NULL DEFAULT FALSE
    `;
    console.log('✅ Added checked_in column');
    
    // Add checked_in_at column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP
    `;
    console.log('✅ Added checked_in_at column');
    
    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_checked_in ON bookings(checked_in)
    `;
    console.log('✅ Created checked_in index');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_reference_number ON bookings(reference_number)
    `;
    console.log('✅ Created reference_number index');
    
    return NextResponse.json({
      success: true,
      message: 'Check-in migration completed successfully'
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}