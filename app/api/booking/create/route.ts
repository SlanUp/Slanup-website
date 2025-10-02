import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getInviteCodeStatus } from '@/lib/bookingManager';
import { createCashfreePaymentSession } from '@/lib/cashfreeIntegration';
import { DIWALI_EVENT_CONFIG } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const {
      inviteCode,
      customerName,
      customerEmail,
      customerPhone,
      ticketType,
      ticketCount
    } = await request.json();

    // Validation
    if (!inviteCode || !customerName || !customerEmail || !customerPhone || !ticketType || !ticketCount) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if invite code is valid and not used
    const inviteStatus = await getInviteCodeStatus(inviteCode);
    
    if (!inviteStatus.isValid) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      );
    }

    if (inviteStatus.isUsed) {
      return NextResponse.json(
        { error: 'Invite code already used', booking: inviteStatus.booking },
        { status: 400 }
      );
    }

    // Find ticket type configuration
    const ticketTypeConfig = DIWALI_EVENT_CONFIG.ticketTypes.find(t => t.id === ticketType);
    
    if (!ticketTypeConfig) {
      return NextResponse.json(
        { error: 'Invalid ticket type' },
        { status: 400 }
      );
    }

    // Validate ticket count
    if (ticketCount > ticketTypeConfig.maxQuantity) {
      return NextResponse.json(
        { error: `Maximum ${ticketTypeConfig.maxQuantity} tickets allowed for this type` },
        { status: 400 }
      );
    }

    const totalAmount = ticketTypeConfig.price * ticketCount;

    // Create booking
    const booking = await createBooking({
      inviteCode,
      customerName,
      customerEmail,
      customerPhone,
      ticketType: ticketType as 'regular' | 'premium' | 'vip',
      ticketCount,
      totalAmount,
      eventName: DIWALI_EVENT_CONFIG.name,
      eventDate: DIWALI_EVENT_CONFIG.date
    });

    // Create Cashfree payment session
    const cashfreeOrder = await createCashfreePaymentSession({
      orderId: booking.id,
      amount: totalAmount,
      customerName,
      customerEmail,
      customerPhone,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/diwali/payment/success`
    });

    // Debug: Log the Cashfree response
    console.log('Cashfree API Response:', JSON.stringify(cashfreeOrder, null, 2));

    return NextResponse.json({
      success: true,
      booking,
      cashfreeOrder,
      paymentSessionId: cashfreeOrder.payment_session_id
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}