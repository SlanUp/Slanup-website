import { NextRequest, NextResponse } from 'next/server';
import { getInviteCodeStatus, generateReferenceNumber, generateTransactionId } from '@/lib/bookingManager';
import { validateInviteCode } from '@/lib/validation';
import { getEventConfig } from '@/lib/eventConfig';
import { updateGoogleSheet } from '@/lib/googleSheetsUpdate';
import { sendTicketEmail } from '@/lib/emailService';
import * as db from '@/lib/db';
import type { Booking } from '@/lib/types';

/**
 * POST /api/offlyn/manual-book
 *
 * Admin endpoint for offline/UPI payments. Creates a booking, updates
 * the Google Sheet, and sends the slanup ticket email.
 *
 * Body: { inviteCode, name, email, phone, adminSecret }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone } = body;
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'name, email, and phone are required' },
        { status: 400 },
      );
    }

    const codeValidation = validateInviteCode(body.inviteCode);
    if (!codeValidation.success) {
      return NextResponse.json(
        { error: 'Invalid invite code', details: codeValidation.errors },
        { status: 400 },
      );
    }
    const inviteCode = codeValidation.data;

    const eventConfig = getEventConfig('full-moon-party');
    if (!eventConfig) {
      return NextResponse.json({ error: 'Event config not found' }, { status: 400 });
    }

    // Idempotency — already booked?
    let status;
    try {
      status = await getInviteCodeStatus(inviteCode, eventConfig.name);
    } catch (err) {
      console.error('[Manual Book] getInviteCodeStatus failed:', err);
      // Skip validation — admin override for manual bookings
      status = { isValid: true, isUsed: false };
    }
    if (!status.isValid) {
      return NextResponse.json({ error: 'Invite code is not valid' }, { status: 400 });
    }
    if (status.isUsed) {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        booking: status.booking,
      });
    }

    const now = new Date();
    const referenceNumber = generateReferenceNumber(eventConfig.referencePrefix || 'FMP');
    const booking: Booking = {
      id: generateTransactionId(),
      inviteCode,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      ticketType: 'standard',
      ticketCount: 1,
      totalAmount: 1999,
      paymentStatus: 'completed',
      paymentMethod: 'offlyn',
      referenceNumber,
      cashfreeOrderId: 'UPI-DIRECT',
      createdAt: now,
      updatedAt: now,
      eventDate: eventConfig.date,
      eventName: eventConfig.name,
    };

    await db.insertBooking(booking);
    console.log(`[Manual Book] ✅ Booked ${inviteCode} for ${name} (${email})`);

    // Update Google Sheet
    try {
      await updateGoogleSheet({
        inviteCode,
        email,
        phone,
        paymentStatus: 'UPI_DIRECT',
        referenceNumber,
        transactionId: booking.id,
        bookingDate: now.toISOString(),
      });
    } catch (err) {
      console.error('[Manual Book] Sheet update failed:', err);
    }

    // Send ticket email
    try {
      await sendTicketEmail(booking);
    } catch (err) {
      console.error('[Manual Book] Email failed:', err);
    }

    return NextResponse.json({
      success: true,
      referenceNumber,
      booking: {
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
        ref: booking.referenceNumber,
      },
    });
  } catch (error) {
    console.error('[Manual Book] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
