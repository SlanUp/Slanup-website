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

    const status = getInviteCodeStatus(inviteCode);

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error checking booking status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const inviteCode = searchParams.get('inviteCode');

  if (!inviteCode) {
    return NextResponse.json(
      { error: 'Invite code is required' },
      { status: 400 }
    );
  }

  try {
    const status = getInviteCodeStatus(inviteCode);

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error checking booking status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}