import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getInviteCodeStatus } from '@/lib/bookingManager';
import { generatePayUHash } from '@/lib/payuIntegration';
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
    const inviteStatus = getInviteCodeStatus(inviteCode);
    
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
    const booking = createBooking({
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

    // Generate PayU hash for payment
    const payuData = {
      key: process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || 'YOUR_MERCHANT_KEY',
      txnid: booking.id,
      amount: totalAmount.toFixed(2),
      productinfo: `${DIWALI_EVENT_CONFIG.name} - ${ticketTypeConfig.name} x${ticketCount}`,
      firstname: customerName,
      email: customerEmail,
      salt: process.env.PAYU_SALT || 'YOUR_SALT',
      udf1: inviteCode,
      udf2: booking.id
    };

    const hash = generatePayUHash(payuData);

    const paymentData = {
      ...payuData,
      hash,
      phone: customerPhone,
      surl: `${process.env.NEXT_PUBLIC_BASE_URL}/diwali/payment/success`,
      furl: `${process.env.NEXT_PUBLIC_BASE_URL}/diwali/payment/failure`
    };

    return NextResponse.json({
      success: true,
      booking,
      paymentData,
      payuUrl: process.env.NODE_ENV === 'production' 
        ? 'https://secure.payu.in/_payment' 
        : 'https://test.payu.in/_payment'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}