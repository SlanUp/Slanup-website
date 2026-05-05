import { NextRequest, NextResponse } from 'next/server';
import { updateGoogleSheet } from '@/lib/googleSheetsUpdate';
import { sendTicketEmail } from '@/lib/emailService';
import { getInviteCodeStatus } from '@/lib/bookingManager';
import { getEventConfig } from '@/lib/eventConfig';

/**
 * POST /api/offlyn/retry
 *
 * Re-runs Google Sheet update + ticket email for an existing booking.
 * Use when the original confirm's sheet/email failed (e.g. Vercel
 * killed the function before they completed).
 *
 * Body: { inviteCode, adminSecret }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inviteCode: string = body.inviteCode;
    if (!inviteCode) {
      return NextResponse.json({ error: 'inviteCode required' }, { status: 400 });
    }

    const eventConfig = getEventConfig('full-moon-party');
    if (!eventConfig) {
      return NextResponse.json({ error: 'Event config not found' }, { status: 400 });
    }

    const status = await getInviteCodeStatus(inviteCode, eventConfig.name);
    if (!status.isUsed || !status.booking) {
      return NextResponse.json({ error: 'No confirmed booking found for this code' }, { status: 404 });
    }

    const booking = status.booking;
    const results: { sheet?: boolean; email?: boolean; errors: string[] } = { errors: [] };

    // Re-run Google Sheet update
    try {
      await updateGoogleSheet({
        inviteCode,
        email: booking.customerEmail,
        phone: booking.customerPhone,
        paymentStatus: `OFFLYN_PAID (retry)`,
        referenceNumber: booking.referenceNumber,
        transactionId: booking.id,
        bookingDate: booking.createdAt.toISOString?.() ?? new Date(booking.createdAt).toISOString(),
      });
      results.sheet = true;
    } catch (err) {
      results.sheet = false;
      results.errors.push(`Sheet: ${err}`);
    }

    // Re-send ticket email
    if (booking.customerEmail && booking.customerEmail.includes('@') && booking.customerEmail !== 'see-offlyn-dashboard') {
      try {
        await sendTicketEmail(booking);
        results.email = true;
      } catch (err) {
        results.email = false;
        results.errors.push(`Email: ${err}`);
      }
    } else {
      results.email = false;
      results.errors.push('No valid email on booking');
    }

    return NextResponse.json({
      success: true,
      inviteCode,
      booking: {
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
        ref: booking.referenceNumber,
      },
      results,
    });
  } catch (error) {
    console.error('[Offlyn retry] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
