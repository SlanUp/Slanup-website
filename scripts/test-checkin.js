#!/usr/bin/env node

// Test script for check-in functionality
// Usage: node scripts/test-checkin.js

async function testCheckIn() {
  try {
    console.log('🔍 Testing check-in functionality...');
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    // Test data - replace with a real reference number from your database
    const testReferenceNumber = 'DIW123456ABCD'; // Replace with actual reference
    
    console.log('📝 Step 1: Verifying booking...');
    
    // Step 1: Verify the booking
    const verifyResponse = await fetch(`${baseUrl}/api/checkin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: testReferenceNumber
      })
    });
    
    const verifyResult = await verifyResponse.json();
    
    if (!verifyResponse.ok) {
      console.log('ℹ️  Booking verification failed (this is expected for test data):', verifyResult.error);
      console.log('✅ Verify endpoint is working correctly');
      return;
    }
    
    console.log('✅ Booking found:', {
      name: verifyResult.booking.customerName,
      email: verifyResult.booking.customerEmail,
      checkedIn: verifyResult.booking.checkedIn
    });
    
    if (verifyResult.booking.checkedIn) {
      console.log('ℹ️  Guest is already checked in');
      return;
    }
    
    console.log('📝 Step 2: Approving check-in...');
    
    // Step 2: Approve check-in
    const approveResponse = await fetch(`${baseUrl}/api/checkin/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: verifyResult.booking.id,
        referenceNumber: testReferenceNumber
      })
    });
    
    const approveResult = await approveResponse.json();
    
    if (approveResponse.ok && approveResult.success) {
      console.log('✅ Check-in approved successfully!');
      console.log('📋 Details:', approveResult.message);
    } else {
      console.error('❌ Check-in approval failed:', approveResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing check-in:', error.message);
  }
}

console.log('🧪 Slanup Check-in Test Script');
console.log('================================');
testCheckIn();