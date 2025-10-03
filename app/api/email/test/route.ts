import { NextRequest, NextResponse } from 'next/server';
import { sendTicketEmail } from '@/lib/emailService';
import { Booking } from '@/lib/types';

// Test endpoint to manually send emails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Create a test booking object
    const testBooking: Booking = {
      id: 'TEST123456789',
      inviteCode: 'TEST1',
      customerName: name,
      customerEmail: email,
      customerPhone: '9876543210',
      ticketType: 'vip',
      ticketCount: 1,
      totalAmount: 10,
      paymentStatus: 'completed',
      paymentMethod: 'cashfree',
      referenceNumber: 'DIW' + Date.now().toString().slice(-6) + 'TEST',
      createdAt: new Date(),
      updatedAt: new Date(),
      eventDate: new Date('2025-10-18'),
      eventName: "Slanup's ULTIMATE Diwali Party 2025"
    };

    const emailSent = await sendTicketEmail(testBooking);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        booking: testBooking
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in test email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint ready. Use POST with { email, name } to test.'
  });
}