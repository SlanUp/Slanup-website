/**
 * Safe Google Sheets updater for check-in status
 * This fetches current data and only changes the check-in field
 */

import { getInviteCodeDetails } from './googleSheets';
import { sql } from '@vercel/postgres';

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2Gn2t3S8TzFcU8Nxc-7XqJ0XEkpBxUEJ4t_Z4s0Mop8ybWgfnHks2jnrBgEHqKKkG2g/exec';

export async function safeUpdateCheckIn(inviteCode: string): Promise<boolean> {
  try {
    console.log('[SafeSheetUpdate] Starting safe check-in update for:', inviteCode);
    
    // Step 1: Get current data from Google Sheets
    const currentSheetData = await getInviteCodeDetails(inviteCode);
    
    if (!currentSheetData) {
      console.error('[SafeSheetUpdate] Could not find invite code in sheet:', inviteCode);
      return false;
    }
    
    console.log('[SafeSheetUpdate] Current sheet data:', {
      inviteCode: currentSheetData.inviteCode,
      email: currentSheetData.email ? 'present' : 'missing',
      phone: currentSheetData.phone ? 'present' : 'missing',
      booked: currentSheetData.booked,
      checkedIn: currentSheetData.checkedIn
    });
    
    // Step 2: Get booking data from database as fallback
    const dbResult = await sql`
      SELECT * FROM bookings 
      WHERE invite_code = ${inviteCode}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const dbBooking = dbResult.rows[0];
    
    // Step 3: Prepare complete data with check-in update
    // Use sheet data first, fall back to DB data if missing
    const completeData = {
      inviteCode: inviteCode,
      email: currentSheetData.email || (dbBooking?.customer_email) || '',
      phone: currentSheetData.phone || (dbBooking?.customer_phone) || '',
      booked: 'Yes',
      paymentStatus: currentSheetData.paymentStatus || 'completed',
      referenceNumber: currentSheetData.referenceNumber || (dbBooking?.reference_number) || '',
      transactionId: currentSheetData.transactionId || (dbBooking?.id) || '',
      bookingDate: currentSheetData.bookingDate || (dbBooking?.created_at) || new Date().toISOString(),
      checkedIn: 'Yes'  // The ONLY field we're changing
    };
    
    console.log('[SafeSheetUpdate] Sending complete data with check-in update');
    
    // Step 4: Send the complete data to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completeData),
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[SafeSheetUpdate] ✅ Sheet updated successfully with check-in status');
      return true;
    } else {
      console.error('[SafeSheetUpdate] ❌ Sheet update failed:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('[SafeSheetUpdate] Error updating sheet:', error);
    return false;
  }
}

/**
 * Batch update all checked-in guests from database to sheet
 */
export async function syncAllCheckIns(): Promise<void> {
  try {
    console.log('[SafeSheetUpdate] Starting batch check-in sync...');
    
    // Get all checked-in guests from database
    const result = await sql`
      SELECT invite_code, customer_name, checked_in_at
      FROM bookings 
      WHERE checked_in = true
      ORDER BY checked_in_at DESC
    `;
    
    console.log(`[SafeSheetUpdate] Found ${result.rows.length} checked-in guests to sync`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const booking of result.rows) {
      console.log(`[SafeSheetUpdate] Syncing ${booking.invite_code} - ${booking.customer_name}`);
      
      const success = await safeUpdateCheckIn(booking.invite_code);
      
      if (success) {
        successCount++;
        console.log(`✅ ${booking.invite_code} synced`);
      } else {
        failCount++;
        console.log(`❌ ${booking.invite_code} failed`);
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`[SafeSheetUpdate] Sync complete: ${successCount} success, ${failCount} failed`);
    
  } catch (error) {
    console.error('[SafeSheetUpdate] Batch sync error:', error);
  }
}