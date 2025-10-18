import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getInviteCodeDetails } from '@/lib/googleSheets';
import { updateSheetAfterPayment } from '@/lib/googleSheetsUpdate';
import { safeUpdateCheckIn } from '@/lib/safeSheetUpdate';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, referenceNumber } = body;
    
    if (!bookingId || !referenceNumber) {
      return NextResponse.json(
        { error: 'Booking ID and reference number are required' },
        { status: 400 }
      );
    }
    
    console.log('[Check-in] Approving check-in for:', {
      bookingId,
      referenceNumber
    });
    
    // First, verify the booking exists and is not already checked in
    const checkResult = await sql`
      SELECT id, invite_code, checked_in FROM bookings 
      WHERE id = ${bookingId}
      AND reference_number = ${referenceNumber}
      AND payment_status = 'completed'
      LIMIT 1
    `;
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found or invalid' },
        { status: 404 }
      );
    }
    
    const booking = checkResult.rows[0];
    
    if (booking.checked_in === true || booking.checked_in === 'Yes') {
      return NextResponse.json(
        { error: 'Guest already checked in' },
        { status: 400 }
      );
    }
    
    // Update database to mark as checked in
    const updateResult = await sql`
      UPDATE bookings 
      SET 
        checked_in = true,
        checked_in_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
      AND reference_number = ${referenceNumber}
      RETURNING *
    `;
    
    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update check-in status' },
        { status: 500 }
      );
    }
    
    console.log('[Check-in] ✅ Database updated - Guest checked in');
    
    // Update Google Sheet with safe check-in update
    try {
      console.log('[Check-in] Updating Google Sheet check-in status for:', booking.invite_code);
      
      const sheetUpdateSuccess = await safeUpdateCheckIn(booking.invite_code);
      
      if (sheetUpdateSuccess) {
        console.log('[Check-in] ✅ Google Sheet updated with check-in status');
      } else {
        console.warn('[Check-in] ⚠️ Failed to update Google Sheet, but check-in was successful in database');
      }
    } catch (error) {
      console.error('[Check-in] Error updating sheet:', error);
      // Don't fail the check-in if sheet update fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Guest checked in successfully',
      checkedInAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Check-in] Error approving check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}