import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Booking } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Reference code is required' },
        { status: 400 }
      );
    }
    
    // Clean the code - remove any prefix like "SLANUP-DIWALI-"
    let referenceNumber = code.trim().toUpperCase();
    
    // If the code contains "SLANUP-DIWALI-", extract just the reference number
    if (referenceNumber.includes('SLANUP-DIWALI-')) {
      const parts = referenceNumber.split('SLANUP-DIWALI-');
      if (parts[1]) {
        referenceNumber = parts[1].split('-')[0]; // Get just the DIW number part
      }
    }
    
    console.log('[Check-in] Verifying reference number:', referenceNumber);
    
    // Look up booking by reference number
    const result = await sql`
      SELECT * FROM bookings 
      WHERE reference_number = ${referenceNumber}
      AND payment_status = 'completed'
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      // Try with the original code as well
      const alternateResult = await sql`
        SELECT * FROM bookings 
        WHERE reference_number = ${code.trim().toUpperCase()}
        AND payment_status = 'completed'
        LIMIT 1
      `;
      
      if (alternateResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found or payment not completed' },
          { status: 404 }
        );
      }
      
      result.rows[0] = alternateResult.rows[0];
    }
    
    const row = result.rows[0];
    
    // Check if guest is already checked in
    const isCheckedIn = row.checked_in === true || row.checked_in === 'Yes';
    
    const booking: Booking & { checkedIn?: boolean } = {
      id: row.id,
      inviteCode: row.invite_code,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      ticketType: row.ticket_type as 'regular' | 'premium' | 'vip',
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
      updatedAt: new Date(row.updated_at),
      checkedIn: isCheckedIn
    };
    
    console.log('[Check-in] Booking found:', {
      name: booking.customerName,
      referenceNumber: booking.referenceNumber,
      checkedIn: booking.checkedIn
    });
    
    return NextResponse.json({ booking });
    
  } catch (error) {
    console.error('[Check-in] Error verifying booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}