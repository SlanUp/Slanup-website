import { NextRequest, NextResponse } from 'next/server';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz2LJGIYgY4Fq1lp4_8DPs5p31YvPbVs7tFkS7pRU01oPYZkbqZmS8wg0ilJYnTtpsqJcQYi-kyf8z/pub?gid=636322054&single=true&output=csv';

function parseCSVLine(line: string): string[] {
  const vals: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { vals.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  vals.push(current.trim());
  return vals;
}

/**
 * POST /api/admin/sheet-stats
 *
 * Reads the raw CSV to count ALL rows including ones without invite codes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    const csvText = await res.text();
    const lines = csvText.trim().split('\n');

    let paid = 0;
    let active = 0;
    let backedOut = 0;
    let paidMale = 0;
    let paidFemale = 0;
    const activeList: { code: string; name: string; group: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = parseCSVLine(lines[i]);
      if (vals.length < 5) continue;

      const group = vals[0] || '';
      const name = vals[1] || '';
      const gender = (vals[3] || '').toUpperCase();
      const code = vals[4] || '';
      const email = vals[5] || '';
      const booked = vals[7] || '';
      const paymentStatus = vals[8] || '';

      if (!code) {
        if (name) backedOut++;
        continue;
      }

      const isPaid =
        booked.toLowerCase() === 'yes' ||
        (email && paymentStatus);

      if (isPaid) {
        paid++;
        if (gender === 'M') paidMale++;
        else if (gender === 'F') paidFemale++;
      } else {
        active++;
        activeList.push({ code, name, group });
      }
    }

    return NextResponse.json({
      total: paid + active + backedOut,
      paid,
      paidMale,
      paidFemale,
      active,
      backedOut,
      activeList,
    });
  } catch (error) {
    console.error('[sheet-stats] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
