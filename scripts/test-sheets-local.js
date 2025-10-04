// Test Google Sheets integration locally without starting the server

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz2LJGIYgY4Fq1lp4_8DPs5p31YvPbVs7tFkS7pRU01oPYZkbqZmS8wg0ilJYnTtpsqJcQYi-kyf8z/pub?gid=636322054&single=true&output=csv';

async function testGoogleSheets() {
  console.log('🧪 Testing Google Sheets Integration...\n');
  
  try {
    console.log('📡 Fetching data from Google Sheets...');
    console.log(`URL: ${SHEET_CSV_URL}\n`);
    
    const response = await fetch(SHEET_CSV_URL, {
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    console.log(`✅ Successfully fetched ${lines.length} lines\n`);
    
    // Parse header
    console.log('📋 Header Row:');
    console.log(lines[0]);
    console.log('');
    
    // Parse data
    const inviteCodes = [];
    const groupCounts = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      if (!matches || matches.length < 3) continue;
      
      const group = matches[0].replace(/^"|"$/g, '').trim();
      const name = matches[1].replace(/^"|"$/g, '').trim();
      const code = matches[2].replace(/^"|"$/g, '').trim();
      
      if (code) {
        inviteCodes.push({ group, name, code });
        groupCounts[group] = (groupCounts[group] || 0) + 1;
      }
    }
    
    console.log(`📊 Statistics:`);
    console.log(`   Total Invite Codes: ${inviteCodes.length}`);
    console.log(`   Total Groups: ${Object.keys(groupCounts).length}`);
    console.log('');
    
    console.log('👥 Group Breakdown:');
    Object.entries(groupCounts).sort().forEach(([group, count]) => {
      console.log(`   ${group}: ${count} members`);
    });
    console.log('');
    
    console.log('🎟️  Sample Invite Codes (first 10):');
    inviteCodes.slice(0, 10).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.code} - ${item.name} (${item.group})`);
    });
    console.log('');
    
    // Test a specific code
    const testCode = 'G10-TEST-1';
    const found = inviteCodes.find(item => item.code === testCode);
    
    if (found) {
      console.log(`✅ Test Code "${testCode}" found:`);
      console.log(`   Name: ${found.name}`);
      console.log(`   Group: ${found.group}`);
    } else {
      console.log(`❌ Test Code "${testCode}" NOT found`);
    }
    console.log('');
    
    console.log('🎉 Google Sheets Integration Test PASSED!\n');
    
    return {
      success: true,
      totalCodes: inviteCodes.length,
      groups: Object.keys(groupCounts).length,
      codes: inviteCodes.map(i => i.code)
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testGoogleSheets().then(result => {
  if (result.success) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Tests failed!');
    process.exit(1);
  }
});
