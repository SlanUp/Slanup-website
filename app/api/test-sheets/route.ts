import { NextResponse } from 'next/server';
import { getValidInviteCodes, fetchInviteCodesFromSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    console.log('[TestSheets] Testing Google Sheets integration...');
    
    // Fetch all codes
    const codes = await getValidInviteCodes();
    
    // Fetch detailed data
    const allData = await fetchInviteCodesFromSheet();
    
    // Count by group
    const groupCounts: Record<string, number> = {};
    allData.forEach(row => {
      groupCounts[row.group] = (groupCounts[row.group] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      totalCodes: codes.length,
      groupCounts,
      sampleCodes: codes.slice(0, 10), // First 10 codes
      message: 'Google Sheets integration working! ✅'
    });
  } catch (error) {
    console.error('[TestSheets] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
