import { NextRequest, NextResponse } from 'next/server';
import { fetchGuestList } from '@/lib/offlyn';

/**
 * POST /api/offlyn/check-new-guest
 *
 * Checks whether a new guest has been added to the offlyn experience
 * since a given baseline timestamp. Used by the iframe modal to verify
 * that a load event actually corresponds to a payment (not a logout
 * or other navigation).
 *
 * Body: { experienceId, baselineTimestamp }
 * Returns: { hasNewGuest, latestGuest? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const experienceId: string = body.experienceId;
    const baselineTimestamp: string | null = body.baselineTimestamp ?? null;

    if (!experienceId) {
      return NextResponse.json({ error: 'experienceId required' }, { status: 400 });
    }

    const guests = await fetchGuestList(experienceId);
    if (guests.length === 0) {
      return NextResponse.json({ hasNewGuest: false, guestCount: 0 });
    }

    // Sort newest first
    guests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = guests[0];
    const latestTime = new Date(latest.createdAt).toISOString();

    // If no baseline, just return current state (for initial snapshot)
    if (!baselineTimestamp) {
      return NextResponse.json({
        hasNewGuest: false,
        guestCount: guests.length,
        latestTimestamp: latestTime,
        latestGuest: latest.userDetails
          ? { name: latest.userDetails.name, email: latest.userDetails.email, phone: latest.userDetails.phone }
          : null,
      });
    }

    // Compare: is the latest guest newer than baseline?
    const baselineMs = new Date(baselineTimestamp).getTime();
    const latestMs = new Date(latest.createdAt).getTime();
    const hasNewGuest = latestMs > baselineMs;

    return NextResponse.json({
      hasNewGuest,
      guestCount: guests.length,
      latestTimestamp: latestTime,
      latestGuest: hasNewGuest && latest.userDetails
        ? { name: latest.userDetails.name, email: latest.userDetails.email, phone: latest.userDetails.phone }
        : null,
    });
  } catch (error) {
    console.error('[Offlyn check-new-guest] Error:', error);
    return NextResponse.json({ hasNewGuest: false, error: 'Internal error' }, { status: 200 });
  }
}
