import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getInviteCodeStatus } from '@/lib/bookingManager';
import { createCashfreePaymentSession } from '@/lib/cashfreeIntegration';
import { getEventConfig } from '@/lib/eventConfig';
import { validateBookingData } from '@/lib/validation';
import { getTicketFees } from '@/lib/paymentFees';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and sanitize input
    const validation = validateBookingData(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    const {
      inviteCode,
      customerName,
      customerEmail,
      customerPhone,
      ticketType,
      ticketCount,
      eventName // Get event name from request
    } = validation.data;

    // Get event configuration
    const eventConfig = getEventConfig(eventName || 'diwali'); // Default to diwali for backward compatibility
    if (!eventConfig) {
      return NextResponse.json(
        { error: 'Invalid event name' },
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
    const ticketTypeConfig = eventConfig.ticketTypes.find(t => t.id === ticketType);
    
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

    const ticketPrice = ticketTypeConfig.price * ticketCount;
    
    // Calculate total with payment gateway fees
    const fees = getTicketFees(ticketPrice);
    const totalAmount = fees.totalAmount; // This includes gateway charges

    // Create booking
    const booking = await createBooking({
      inviteCode,
      customerName,
      customerEmail,
      customerPhone,
      ticketType: ticketType as 'regular' | 'premium' | 'vip',
      ticketCount,
      totalAmount, // Store the total amount (with gateway fees)
      eventName: eventConfig.name,
      eventDate: eventConfig.date,
      eventPrefix: eventConfig.referencePrefix
    });

    // Create Cashfree payment session with total amount (including fees)
    const cashfreeOrder = await createCashfreePaymentSession({
      orderId: booking.id,
      amount: totalAmount, // Charge customer the total including gateway fees
      customerName,
      customerEmail,
      customerPhone,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${eventConfig.id}/payment/success`
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