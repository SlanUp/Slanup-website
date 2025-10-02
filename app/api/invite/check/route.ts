import { NextRequest, NextResponse } from 'next/server';
import { getInviteCodeStatus } from '@/lib/bookingManager';

export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json();
    
    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    const status = await getInviteCodeStatus(inviteCode);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
