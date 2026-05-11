import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * POST /api/offlyn/log-detection
 *
 * Logs every payment detection attempt — matched or not.
 * When name matching fails, this is the only way to trace
 * which invite code the user entered + which offlyn guest paid.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await sql`
      INSERT INTO offlyn_detection_log 
        (invite_code, holder_name, offlyn_guest_name, offlyn_guest_email, offlyn_guest_phone, matched, source)
      VALUES 
        (${body.inviteCode || ''}, ${body.holderName || ''}, ${body.guestName || ''}, 
         ${body.guestEmail || ''}, ${body.guestPhone || ''}, ${body.matched ?? false}, ${body.source || ''})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[log-detection] Error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
