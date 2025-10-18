// Google Sheets check-in update - preserves existing data
// This is a specialized updater that ONLY modifies the check-in column

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2Gn2t3S8TzFcU8Nxc-7XqJ0XEkpBxUEJ4t_Z4s0Mop8ybWgfnHks2jnrBgEHqKKkG2g/exec';

interface CheckInUpdateData {
  inviteCode: string;
  checkedIn: 'Yes' | 'No';
}

export async function updateCheckInStatus(inviteCode: string, checkedIn: boolean = true): Promise<boolean> {
  try {
    console.log('[GoogleSheets CheckIn] Updating check-in status for:', inviteCode);
    
    const updateData: CheckInUpdateData = {
      inviteCode: inviteCode.trim().toUpperCase(),
      checkedIn: checkedIn ? 'Yes' : 'No'
    };
    
    console.log('[GoogleSheets CheckIn] Sending update:', updateData);
    
    // Send ONLY the check-in update, not other fields
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateCheckInOnly',  // Special action for check-in only
        ...updateData
      }),
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[GoogleSheets CheckIn] ✅ Check-in status updated successfully');
      return true;
    } else {
      console.error('[GoogleSheets CheckIn] ❌ Failed to update check-in status:', result.error);
      
      // Fallback: Try the regular update endpoint but with minimal data
      console.log('[GoogleSheets CheckIn] Attempting fallback update...');
      return await fallbackUpdate(inviteCode);
    }
  } catch (error) {
    console.error('[GoogleSheets CheckIn] Error:', error);
    
    // Try fallback
    return await fallbackUpdate(inviteCode);
  }
}

// Fallback method that uses the regular update but preserves data
async function fallbackUpdate(inviteCode: string): Promise<boolean> {
  try {
    // First fetch current data from Google Sheets
    const currentDataResponse = await fetch(
      `https://docs.google.com/spreadsheets/d/e/2PACX-1vRz2LJGIYgY4Fq1lp4_8DPs5p31YvPbVs7tFkS7pRU01oPYZkbqZmS8wg0ilJYnTtpsqJcQYi-kyf8z/pub?gid=636322054&single=true&output=csv`,
      { cache: 'no-store' }
    );
    
    if (!currentDataResponse.ok) {
      console.error('[GoogleSheets CheckIn] Failed to fetch current sheet data');
      return false;
    }
    
    const csvText = await currentDataResponse.text();
    const lines = csvText.split('\n');
    
    // Find the row with this invite code
    let rowData: any = null;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(inviteCode)) {
        // Parse the CSV line (basic parsing)
        const parts = line.split(',');
        if (parts[2] === inviteCode || parts[2] === `"${inviteCode}"`) {
          rowData = {
            inviteCode: inviteCode,
            email: parts[3] || '',
            phone: parts[4] || '',
            booked: parts[5] || 'Yes',
            paymentStatus: parts[6] || 'completed',
            referenceNumber: parts[7] || '',
            transactionId: parts[8] || '',
            bookingDate: parts[9] || '',
            checkedIn: 'Yes'  // Update only this
          };
          break;
        }
      }
    }
    
    if (!rowData) {
      console.error('[GoogleSheets CheckIn] Could not find row for invite code:', inviteCode);
      return false;
    }
    
    // Now update with preserved data
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rowData),
      redirect: 'follow'
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[GoogleSheets CheckIn] ✅ Fallback update successful');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[GoogleSheets CheckIn] Fallback error:', error);
    return false;
  }
}