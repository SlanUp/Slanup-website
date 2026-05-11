import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * POST /api/admin/detection-logs
 *
 * Returns recent detection logs — both matched and unmatched.
 * Use to trace which invite code was used when name matching fails.
 *
 * Body: { adminSecret, limit? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = body.limit || 50;
    const result = await sql`
      SELECT invite_code, holder_name, offlyn_guest_name, offlyn_guest_email, 
             offlyn_guest_phone, matched, source, created_at
      FROM offlyn_detection_log
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ logs: result.rows });
  } catch (error) {
    console.error('[detection-logs] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
