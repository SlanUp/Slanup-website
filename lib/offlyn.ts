/**
 * Offlyn API helper — manages host authentication and guest data retrieval.
 *
 * The slanup admin (who is the event HOST on offlyn) authenticates once
 * via OTP. The resulting JWT token is stored in the Vercel Postgres DB
 * so every serverless invocation can use it.
 *
 * The token lets us call offlyn's host endpoint to fetch the guest list
 * with embedded userDetails — giving us name, email, phone for every
 * buyer without asking them to re-enter data on slanup.
 */

import { sql } from '@vercel/postgres';

const OFFLYN_API = 'https://api.offlyn.club/api';
const APP_VERSION = '2.0.1';

// ── Host auth storage ────────────────────────────────────────────────

export async function ensureAuthTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS offlyn_host_auth (
      id INTEGER PRIMARY KEY DEFAULT 1,
      token TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function storeHostToken(token: string, phone?: string) {
  await ensureAuthTable();
  await sql`
    INSERT INTO offlyn_host_auth (id, token, phone) VALUES (1, ${token}, ${phone ?? null})
    ON CONFLICT (id) DO UPDATE SET token = ${token}, phone = ${phone ?? null}, created_at = CURRENT_TIMESTAMP
  `;
}

export async function getHostToken(): Promise<string | null> {
  // Fast path: env var (set during deploy or via Vercel dashboard)
  if (process.env.OFFLYN_HOST_TOKEN) return process.env.OFFLYN_HOST_TOKEN;
  try {
    await ensureAuthTable();
    const result = await sql`SELECT token FROM offlyn_host_auth WHERE id = 1`;
    return result.rows[0]?.token ?? null;
  } catch {
    return null;
  }
}

// ── OTP auth flow (server-side, called by admin setup endpoint) ──────

export async function requestOtp(phone: string): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    const res = await fetch(`${OFFLYN_API}/auth/request-otp-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-app-version': APP_VERSION },
      body: JSON.stringify({ phoneNumber: phone }),
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { success: true, requestId: data.requestId };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function verifyOtpAndStore(
  requestId: string,
  otp: string,
  phone: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${OFFLYN_API}/auth/verify-otp-and-login-without-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-app-version': APP_VERSION },
      body: JSON.stringify({ requestId, otp }),
    });

    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };

    const data = await res.json();
    const token: string | undefined = data.token;
    if (!token) {
      return { success: false, error: 'No token returned by offlyn' };
    }

    await storeHostToken(token, phone);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

// ── Guest data retrieval (requires host JWT) ─────────────────────────

export interface OfflynGuest {
  _id: string;
  experienceId: string;
  userId: string;
  createdAt: string;
  paymentInformation?: {
    amount: number;
    transactionId?: string;
  };
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
}

/**
 * Fetch the full guest list for an experience using the stored host JWT.
 * Endpoint: GET /api/guests/{experienceId} with Bearer token.
 */
export async function fetchGuestList(experienceId: string): Promise<OfflynGuest[]> {
  const token = await getHostToken();
  if (!token) return [];

  try {
    const res = await fetch(`${OFFLYN_API}/guests/${experienceId}`, {
      headers: {
        Accept: 'application/json',
        'x-app-version': APP_VERSION,
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[Offlyn] guest list fetch failed: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[Offlyn] guest list fetch error:', err);
    return [];
  }
}

/**
 * Get the most recently created guest for an experience.
 * After payment detection, this is very likely the buyer whose
 * invite code we need to lock.
 */
export async function getLatestGuest(experienceId: string): Promise<{
  name: string;
  email: string;
  phone: string;
  amount: number;
  transactionId: string;
} | null> {
  const guests = await fetchGuestList(experienceId);
  if (guests.length === 0) return null;

  // Sort by createdAt descending — newest first
  guests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latest = guests[0];

  const ud = latest.userDetails;
  return {
    name: ud?.name || 'Offlyn Guest',
    email: ud?.email || '',
    phone: ud?.phone || '',
    amount: latest.paymentInformation?.amount ?? 0,
    transactionId: latest.paymentInformation?.transactionId ?? '',
  };
}
