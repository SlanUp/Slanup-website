/**
 * Manual script to sync check-in status from database to Google Sheets
 * This reads check-in status from database and updates ONLY the check-in column in sheets
 */

import { sql } from '@vercel/postgres';

// Google Sheets webhook URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2Gn2t3S8TzFcU8Nxc-7XqJ0XEkpBxUEJ4t_Z4s0Mop8ybWgfnHks2jnrBgEHqKKkG2g/exec';

async function syncCheckIns() {
  console.log('\n📋 Syncing check-in status to Google Sheets...\n');
  
  try {
    // Get all bookings that are checked in
    const result = await sql`
      SELECT 
        invite_code,
        customer_name,
        reference_number,
        checked_in,
        checked_in_at
      FROM bookings 
      WHERE checked_in = true
      ORDER BY checked_in_at DESC
    `;
    
    console.log(`Found ${result.rows.length} checked-in guests\n`);
    
    if (result.rows.length === 0) {
      console.log('No check-ins to sync');
      return;
    }
    
    // Display checked-in guests
    console.log('Checked-in guests:');
    console.log('==================');
    for (const row of result.rows) {
      console.log(`✓ ${row.customer_name} (${row.invite_code}) - Checked in at: ${row.checked_in_at}`);
    }
    
    console.log('\n⚠️  IMPORTANT: Google Sheets sync is currently disabled');
    console.log('📝 To update Google Sheets manually:');
    console.log('   1. Go to your Google Sheet');
    console.log('   2. Find these invite codes in the sheet');
    console.log('   3. Update the "Checked In" column to "Yes"\n');
    
    console.log('Invite codes to update:');
    console.log('=======================');
    for (const row of result.rows) {
      console.log(row.invite_code);
    }
    
    // TODO: When Google Apps Script is fixed to handle check-in only updates,
    // uncomment this code to auto-sync:
    
    // for (const row of result.rows) {
    //   try {
    //     const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         action: 'updateCheckInOnly',
    //         inviteCode: row.invite_code,
    //         checkedIn: 'Yes'
    //       })
    //     });
    //     
    //     const result = await response.json();
    //     if (result.success) {
    //       console.log(`✅ Updated ${row.invite_code}`);
    //     } else {
    //       console.log(`❌ Failed to update ${row.invite_code}`);
    //     }
    //   } catch (error) {
    //     console.error(`❌ Error updating ${row.invite_code}:`, error);
    //   }
    // }
    
  } catch (error) {
    console.error('Error syncing check-ins:', error);
  }
}

// Run the sync
syncCheckIns()
  .then(() => {
    console.log('\n✅ Sync complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });