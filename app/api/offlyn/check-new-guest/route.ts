import { NextRequest, NextResponse } from 'next/server';
import { fetchGuestList } from '@/lib/offlyn';

/**
 * Fuzzy name match — checks if the expected name (from invite code)
 * plausibly matches the offlyn guest name. Handles partial matches,
 * case differences, and first-name-only scenarios.
 *
 * e.g. "Ketika" matches "Ketika Anand", "ketika anand", "KETIKA"
 */
function namesMatch(expected: string, actual: string): boolean {
  const e = expected.toLowerCase().trim();
  const a = actual.toLowerCase().trim();
  if (!e || !a) return false;

  // Exact or substring match
  if (a.includes(e) || e.includes(a)) return true;

  // First-name match (invite sheet often has just first name)
  const expectedFirst = e.split(/\s+/)[0];
  const actualFirst = a.split(/\s+/)[0];
  if (expectedFirst.length >= 3 && actualFirst.startsWith(expectedFirst)) return true;
  if (actualFirst.length >= 3 && expectedFirst.startsWith(actualFirst)) return true;

  // Levenshtein distance for typo tolerance (e.g. "Chetnya" vs "Chetanya")
  if (expectedFirst.length >= 4 && actualFirst.length >= 4) {
    const lev = levenshtein(expectedFirst, actualFirst);
    if (lev <= 2) return true;
  }

  return false;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * POST /api/offlyn/check-new-guest
 *
 * Checks whether a new guest has been added to the offlyn experience
 * since a given baseline timestamp. When `expectedName` is provided,
 * only matches guests whose name fuzzy-matches the invite code holder.
 * This prevents concurrent-user cross-confirmation.
 *
 * Body: { experienceId, baselineTimestamp?, expectedName? }
 * Returns: { hasNewGuest, latestGuest?, latestTimestamp?, guestCount }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const experienceId: string = body.experienceId;
    const baselineTimestamp: string | null = body.baselineTimestamp ?? null;
    const expectedName: string | null = body.expectedName ?? null;

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

    // Find all guests newer than baseline
    const baselineMs = new Date(baselineTimestamp).getTime();
    const newGuests = guests.filter(
      (g) => new Date(g.createdAt).getTime() > baselineMs,
    );

    if (newGuests.length === 0) {
      return NextResponse.json({
        hasNewGuest: false,
        guestCount: guests.length,
        latestTimestamp: latestTime,
      });
    }

    // If expectedName is provided, find a matching guest
    if (expectedName) {
      const matched = newGuests.find(
        (g) => g.userDetails?.name && namesMatch(expectedName, g.userDetails.name),
      );

      if (matched) {
        console.log(
          `[check-new-guest] ✅ Name match: "${expectedName}" ↔ "${matched.userDetails?.name}"`,
        );
        return NextResponse.json({
          hasNewGuest: true,
          guestCount: guests.length,
          latestTimestamp: latestTime,
          latestGuest: matched.userDetails
            ? { name: matched.userDetails.name, email: matched.userDetails.email, phone: matched.userDetails.phone }
            : null,
        });
      }

      // New guests exist but none match this name — likely someone else's payment
      console.log(
        `[check-new-guest] ⚠️ No name match for "${expectedName}" among ${newGuests.length} new guest(s): ${newGuests.map((g) => g.userDetails?.name).join(', ')}`,
      );
      const unmatchedGuest = newGuests[0].userDetails;
      return NextResponse.json({
        hasNewGuest: false,
        guestCount: guests.length,
        latestTimestamp: latestTime,
        nameMatchFailed: true,
        unmatchedGuest: unmatchedGuest
          ? { name: unmatchedGuest.name, email: unmatchedGuest.email, phone: unmatchedGuest.phone }
          : null,
      });
    }

    // No expectedName — fall back to any-new-guest check (legacy behavior)
    return NextResponse.json({
      hasNewGuest: true,
      guestCount: guests.length,
      latestTimestamp: latestTime,
      latestGuest: newGuests[0].userDetails
        ? { name: newGuests[0].userDetails.name, email: newGuests[0].userDetails.email, phone: newGuests[0].userDetails.phone }
        : null,
    });
  } catch (error) {
    console.error('[Offlyn check-new-guest] Error:', error);
    return NextResponse.json({ hasNewGuest: false, error: 'Internal error' }, { status: 200 });
  }
}
