import { NextResponse } from 'next/server';
import { updateSheetAfterPayment } from '@/lib/googleSheetsUpdate';

export async function GET() {
  try {
    console.log('[Test] Testing Google Sheets update...');
    
    // Simulate a booking
    const testBooking = {
      inviteCode: 'G10-TEST-2',
      customerEmail: 'localtest@example.com',
      customerPhone: '9999999999',
      paymentStatus: 'completed',
      referenceNumber: 'DIW999LOCAL',
      id: 'TXN999LOCAL',
      updatedAt: new Date()
    };
    
    console.log('[Test] Simulated booking:', testBooking);
    
    // Call the update function
    await updateSheetAfterPayment(testBooking);
    
    return NextResponse.json({
      success: true,
      message: 'Sheet update triggered! Check your Google Sheet.',
      testData: testBooking
    });
  } catch (error) {
    console.error('[Test] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
