import { NextRequest, NextResponse } from 'next/server';
import { getInviteCodeStatus, generateReferenceNumber, generateTransactionId } from '@/lib/bookingManager';
import { validateInviteCode } from '@/lib/validation';
import { getEventConfig } from '@/lib/eventConfig';
import { updateGoogleSheet } from '@/lib/googleSheetsUpdate';
import { sendTicketEmail } from '@/lib/emailService';
import * as db from '@/lib/db';
import { getLatestGuest } from '@/lib/offlyn';
import type { Booking } from '@/lib/types';

/**
 * POST /api/offlyn/confirm
 *
 * Locks an invite code after offlyn payment is detected (via iframe
 * load-event signal). Attempts to fetch the buyer's real name, email,
 * and phone from offlyn's API using stored host credentials.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const codeValidation = validateInviteCode(body.inviteCode);
    if (!codeValidation.success) {
      return NextResponse.json(
        { error: 'Invalid invite code', details: codeValidation.errors },
        { status: 400 },
      );
    }
    const inviteCode = codeValidation.data;

    const eventKey: string = body.eventName || 'full-moon-party';
    const eventConfig = getEventConfig(eventKey);
    if (!eventConfig) {
      return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
    }

    // Idempotency — already confirmed?
    const status = await getInviteCodeStatus(inviteCode, eventConfig.name);
    if (!status.isValid) {
      return NextResponse.json(
        { error: 'Invite code is not valid for this event' },
        { status: 400 },
      );
    }
    if (status.isUsed) {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        booking: status.booking,
      });
    }

    const offlynRef: string = body.offlynRef || body.experienceId || 'offlyn';
    const source: string = body.source || 'unknown';
    const experienceId: string | undefined = body.experienceId;

    // Try to fetch real buyer data from offlyn (requires host auth)
    let buyerName = 'Confirmed via Offlyn';
    let buyerEmail = 'see-offlyn-dashboard';
    let buyerPhone = '-';
    let offlynAmount = 0;
    let offlynTxnId = '';

    if (experienceId) {
      try {
        const guest = await getLatestGuest(experienceId);
        if (guest) {
          buyerName = guest.name || buyerName;
          buyerEmail = guest.email || buyerEmail;
          buyerPhone = guest.phone || buyerPhone;
          offlynAmount = guest.amount;
          offlynTxnId = guest.transactionId;
          console.log(`[Offlyn Confirm] 🎯 Matched guest: ${buyerName} (${buyerEmail})`);
        }
      } catch (err) {
        console.warn('[Offlyn Confirm] Could not fetch guest data (host auth may not be set up):', err);
      }
    }

    const now = new Date();
    const referenceNumber = generateReferenceNumber(eventConfig.referencePrefix || 'OFL');
    const booking: Booking = {
      id: generateTransactionId(),
      inviteCode,
      customerName: buyerName,
      customerEmail: buyerEmail,
      customerPhone: buyerPhone,
      ticketType: 'standard',
      ticketCount: 1,
      totalAmount: offlynAmount,
      paymentStatus: 'completed',
      paymentMethod: 'offlyn',
      referenceNumber,
      cashfreeOrderId: offlynRef,
      createdAt: now,
      updatedAt: now,
      eventDate: eventConfig.date,
      eventName: eventConfig.name,
    };

    await db.insertBooking(booking);
    console.log(
      `[Offlyn Confirm] ✅ Locked invite ${inviteCode} via ${source} ` +
        `(ref: ${referenceNumber}, buyer: ${buyerName})`,
    );

    // Update Google Sheet (non-blocking)
    updateGoogleSheet({
      inviteCode,
      email: buyerEmail,
      phone: buyerPhone,
      paymentStatus: `OFFLYN_PAID (${source})`,
      referenceNumber,
      transactionId: offlynTxnId || booking.id,
      bookingDate: now.toISOString(),
    }).catch((err) => {
      console.error('[Offlyn Confirm] Sheet update failed (non-fatal):', err);
    });

    // Send ticket email if we have a real email address (non-blocking)
    if (buyerEmail && buyerEmail !== 'see-offlyn-dashboard' && buyerEmail.includes('@')) {
      sendTicketEmail(booking).catch((err) => {
        console.error('[Offlyn Confirm] Ticket email failed (non-fatal):', err);
      });
    }

    return NextResponse.json({
      success: true,
      alreadyConfirmed: false,
      referenceNumber,
      booking,
    });
  } catch (error) {
    console.error('[Offlyn Confirm] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
