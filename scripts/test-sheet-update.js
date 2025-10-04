// Test Google Sheets update endpoint

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2Gn2t3S8TzFcU8Nxc-7XqJ0XEkpBxUEJ4t_Z4s0Mop8ybWgfnHks2jnrBgEHqKKkG2g/exec';

async function testSheetUpdate() {
  console.log('🧪 Testing Google Sheets Update...\n');
  
  const testData = {
    inviteCode: 'G10-TEST-1',
    email: 'test@example.com',
    phone: '9876543210',
    paymentStatus: 'completed',
    referenceNumber: 'DIW123TEST',
    transactionId: 'TXN123456',
    bookingDate: new Date().toISOString()
  };
  
  console.log('📤 Sending test data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');
  
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      redirect: 'follow'
    });
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('📥 Response Data:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    
    if (result.success) {
      console.log('✅ SUCCESS! Google Sheet updated!');
      console.log(`   Updated row: ${result.row}`);
      console.log('');
      console.log('👉 Check your Google Sheet to see the updated row!');
    } else {
      console.log('❌ FAILED!');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSheetUpdate();
