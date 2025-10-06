import { NextResponse } from 'next/server';
import { getBookingById, markEmailAsSent } from '@/lib/db';
import { sendTicketEmail } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const { bookingId, adminSecret } = await request.json();
    
    // Simple security check - replace with your own secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing bookingId' },
        { status: 400 }
      );
    }
    
    console.log('[Admin] Resending email for booking:', bookingId);
    
    // Get booking from database
    const booking = await getBookingById(bookingId);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    console.log('[Admin] Found booking:', {
      id: booking.id,
      email: booking.customerEmail,
      name: booking.customerName,
      paymentStatus: booking.paymentStatus,
      emailSent: booking.emailSent
    });
    
    // Send email
    console.log('[Admin] Sending ticket email...');
    const emailSent = await sendTicketEmail(booking);
    
    if (emailSent) {
      console.log('[Admin] Email sent successfully');
      
      // Mark as sent in database
      await markEmailAsSent(bookingId);
      console.log('[Admin] Email marked as sent in database');
      
      return NextResponse.json({
        success: true,
        message: 'Email resent successfully',
        booking: {
          id: booking.id,
          email: booking.customerEmail,
          name: booking.customerName
        }
      });
    } else {
      console.error('[Admin] Failed to send email');
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[Admin] Error resending email:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
