import { NextRequest, NextResponse } from 'next/server';
import { requestOtp, verifyOtpAndStore } from '@/lib/offlyn';

/**
 * POST /api/offlyn/host-setup
 *
 * Two-step OTP flow for the slanup admin to authenticate as the
 * offlyn event HOST. Once authenticated, the stored cookies let
 * the confirm endpoint fetch real buyer data (name, email, phone).
 *
 * Step 1: { step: "request-otp", phone: "9876543210" }
 * Step 2: { step: "verify-otp", requestId: "...", otp: "123456", phone: "9876543210" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const step: string = body.step;

    if (step === 'request-otp') {
      const phone: string = body.phone;
      if (!phone) {
        return NextResponse.json({ error: 'phone is required' }, { status: 400 });
      }
      const result = await requestOtp(phone);
      return NextResponse.json(result);
    }

    if (step === 'verify-otp') {
      const { requestId, otp, phone } = body;
      if (!requestId || !otp) {
        return NextResponse.json({ error: 'requestId and otp are required' }, { status: 400 });
      }
      const result = await verifyOtpAndStore(requestId, otp, phone || '');
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
  } catch (error) {
    console.error('[Offlyn host-setup] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
