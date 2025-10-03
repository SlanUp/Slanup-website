import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refNumber = searchParams.get('ref');

    if (!refNumber) {
      return NextResponse.json({ error: 'Reference number is required' }, { status: 400 });
    }

    console.log(`🔍 Checking booking status for reference: ${refNumber}`);

    // Query booking by reference number
    const result = await sql`
      SELECT * FROM bookings 
      WHERE reference_number = ${refNumber}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        found: false, 
        message: `No booking found with reference number: ${refNumber}` 
      });
    }

    const booking = result.rows[0];

    return NextResponse.json({
      found: true,
      booking: {
        referenceNumber: booking.reference_number,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        paymentStatus: booking.payment_status,
        totalAmount: parseFloat(booking.total_amount),
        eventName: booking.event_name,
        eventDate: booking.event_date,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
        cashfreeOrderId: booking.cashfree_order_id,
        cashfreePaymentId: booking.cashfree_payment_id
      }
    });

  } catch (error) {
    console.error('❌ Error checking booking status:', error);
    return NextResponse.json({ 
      error: 'Failed to check booking status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}