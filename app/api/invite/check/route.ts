import { NextRequest, NextResponse } from 'next/server';
import { getInviteCodeStatus } from '@/lib/bookingManager';
import { validateInviteCode } from '@/lib/validation';
import { getEventConfig } from '@/lib/eventConfig';

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
    // Resolve event config key to actual event name stored in DB
    let eventName: string | undefined;
    if (body.eventName) {
      const config = getEventConfig(body.eventName);
      eventName = config?.name || body.eventName;
    }
    const status = await getInviteCodeStatus(inviteCode, eventName);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
