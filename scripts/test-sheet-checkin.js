#!/usr/bin/env node

// Test Google Sheets check-in update directly
// Usage: node scripts/test-sheet-checkin.js INVITE_CODE

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2Gn2t3S8TzFcU8Nxc-7XqJ0XEkpBxUEJ4t_Z4s0Mop8ybWgfnHks2jnrBgEHqKKkG2g/exec';

async function testSheetUpdate() {
  const inviteCode = process.argv[2] || 'G12-RIS-4'; // Use command line arg or default
  
  console.log('🔍 Testing Google Sheets check-in update...');
  console.log('📝 Invite Code:', inviteCode);
  console.log('🌐 Apps Script URL:', GOOGLE_APPS_SCRIPT_URL);
  
  try {
    // Test the updateCheckInOnly action
    const testData = {
      action: 'updateCheckInOnly',
      inviteCode: inviteCode,
      checkedIn: 'Yes'
    };
    
    console.log('📤 Sending data:', testData);
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      redirect: 'follow'
    });
    
    console.log('📥 Response status:', response.status);
    
    const result = await response.json();
    console.log('📋 Response:', result);
    
    if (result.success) {
      console.log('✅ Google Sheets update successful!');
    } else {
      console.log('❌ Google Sheets update failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testSheetUpdate();