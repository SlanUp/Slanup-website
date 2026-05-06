import { NextRequest, NextResponse } from 'next/server';
import { fetchInviteCodesFromSheet } from '@/lib/googleSheets';

/**
 * POST /api/invite/lookup-name
 *
 * Returns the holder's name for an invite code from the Google Sheet.
 * Used by the offlyn modal to do fuzzy name matching against offlyn
 * guests, preventing concurrent-user cross-confirmation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inviteCode: string = (body.inviteCode || '').trim().toUpperCase();
    if (!inviteCode) {
      return NextResponse.json({ error: 'inviteCode required' }, { status: 400 });
    }

    const rows = await fetchInviteCodesFromSheet();
    const row = rows.find((r) => r.inviteCode.toUpperCase() === inviteCode);

    return NextResponse.json({
      name: row?.name || null,
      inviteCode,
    });
  } catch (error) {
    console.error('[invite/lookup-name] Error:', error);
    return NextResponse.json({ name: null, inviteCode: '' });
  }
}
