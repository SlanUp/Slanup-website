import { NextResponse } from 'next/server';
import { updateSheetAfterPayment } from '@/lib/googleSheetsUpdate';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { inviteCode, adminSecret } = await request.json();
    
    // Simple security check
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Missing inviteCode' },
        { status: 400 }
      );
    }
    
    console.log('[Admin] Updating sheet for invite code:', inviteCode);
    
    // Get booking from database by invite code
    const result = await sql`
      SELECT * FROM bookings 
      WHERE invite_code = ${inviteCode} 
      AND payment_status = 'completed'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      console.log('[Admin] No completed booking found with invite code:', inviteCode);
      
      // Check if there's any booking
      const anyResult = await sql`
        SELECT * FROM bookings 
        WHERE invite_code = ${inviteCode}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      if (anyResult.rows.length > 0) {
        return NextResponse.json({
          error: 'Booking found but payment not completed',
          paymentStatus: anyResult.rows[0].payment_status
        }, { status: 400 });
      }
      
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    const row = result.rows[0];
    const booking = {
      id: row.id,
      inviteCode: row.invite_code,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      ticketType: row.ticket_type,
      ticketCount: row.ticket_count,
      totalAmount: parseFloat(row.total_amount),
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      referenceNumber: row.reference_number,
      cashfreeOrderId: row.cashfree_order_id,
      cashfreePaymentId: row.cashfree_payment_id,
      eventName: row.event_name,
      eventDate: new Date(row.event_date),
      emailSent: row.email_sent || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
    
    console.log('[Admin] Found booking:', {
      id: booking.id,
      name: booking.customerName,
      email: booking.customerEmail,
      paymentStatus: booking.paymentStatus
    });
    
    // Update Google Sheet
    console.log('[Admin] Updating Google Sheet...');
    await updateSheetAfterPayment(booking);
    console.log('[Admin] Google Sheet updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Google Sheet updated successfully',
      booking: {
        id: booking.id,
        inviteCode: booking.inviteCode,
        name: booking.customerName,
        email: booking.customerEmail
      }
    });
    
  } catch (error) {
    console.error('[Admin] Error updating sheet:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
