import { NextRequest, NextResponse } from 'next/server';
import { getInviteCodeStatus } from '@/lib/bookingManager';
import { validateInviteCode } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate invite code
    const validation = validateInviteCode(body.inviteCode);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid invite code', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    const inviteCode = validation.data;
    const status = await getInviteCodeStatus(inviteCode);

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
  const inviteCodeParam = searchParams.get('inviteCode');

  // Validate invite code
  const validation = validateInviteCode(inviteCodeParam);
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: 'Invalid invite code', 
        details: validation.errors 
      },
      { status: 400 }
    );
  }
  
  const inviteCode = validation.data;

  try {
    const status = await getInviteCodeStatus(inviteCode);

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