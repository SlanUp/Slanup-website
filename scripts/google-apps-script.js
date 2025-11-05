/**
 * Google Apps Script for Slanup Diwali Event - Check-in Updates
 * 
 * This script handles updates to the Google Sheet, with special support 
 * for check-in only updates that preserve all other data.
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the default code with this script
 * 4. Save and deploy as a web app
 * 5. Copy the web app URL to your GOOGLE_APPS_SCRIPT_URL constant
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('Received data:', data);
    
    // Handle different actions
    if (data.action === 'updateCheckInOnly') {
      return updateCheckInOnly(data);
    } else {
      return updateBookingData(data);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update ONLY the check-in status, preserving all other data
 */
function updateCheckInOnly(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('FinalDB');
    if (!sheet) {
      throw new Error('Sheet "FinalDB" not found');
    }
    
    const inviteCode = data.inviteCode.trim().toUpperCase();
    console.log('Updating check-in for invite code:', inviteCode);
    
    // Get all data
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find header row to get column indices
    const headerRow = values[0];
    const inviteCodeCol = headerRow.indexOf('Invite Code');
    const checkedInCol = headerRow.indexOf('Checked In');
    
    if (inviteCodeCol === -1) {
      throw new Error('Invite Code column not found');
    }
    
    if (checkedInCol === -1) {
      // If Checked In column doesn't exist, add it
      const newCol = headerRow.length;
      sheet.getRange(1, newCol + 1).setValue('Checked In');
      checkedInCol = newCol;
    }
    
    // Find the row with this invite code
    let rowFound = false;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const cellInviteCode = row[inviteCodeCol];
      
      if (cellInviteCode && cellInviteCode.toString().trim().toUpperCase() === inviteCode) {
        console.log('Found row:', i + 1);
        
        // Update ONLY the checked-in column
        sheet.getRange(i + 1, checkedInCol + 1).setValue(data.checkedIn);
        
        rowFound = true;
        break;
      }
    }
    
    if (!rowFound) {
      throw new Error(`Invite code ${inviteCode} not found in sheet`);
    }
    
    console.log('Check-in status updated successfully');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Check-in status updated successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error updating check-in:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update complete booking data (existing functionality)
 */
function updateBookingData(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('FinalDB');
    if (!sheet) {
      throw new Error('Sheet "FinalDB" not found');
    }
    
    const inviteCode = data.inviteCode.trim().toUpperCase();
    console.log('📊 Updating booking data for invite code:', inviteCode);
    console.log('📊 Received data:', JSON.stringify(data));
    
    // Get all data
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find header row to get column indices
    const headerRow = values[0];
    console.log('📋 Header row:', headerRow);
    
    const colMap = {};
    headerRow.forEach((header, index) => {
      colMap[header] = index;
    });
    
    console.log('📋 Column map:', colMap);
    
    // Check if Invite Code column exists
    if (colMap['Invite Code'] === undefined) {
      console.error('❌ Invite Code column not found in headers:', headerRow);
      throw new Error('Invite Code column not found. Available columns: ' + headerRow.join(', '));
    }
    
    console.log('✅ Found Invite Code column at index:', colMap['Invite Code']);
    
    // Find the row with this invite code
    let targetRow = -1;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const cellInviteCode = row[colMap['Invite Code']];
      
      if (cellInviteCode && cellInviteCode.toString().trim().toUpperCase() === inviteCode) {
        targetRow = i;
        console.log('✅ Found invite code in row:', i + 1);
        break;
      }
    }
    
    if (targetRow === -1) {
      console.error('❌ Invite code not found. Searched', values.length - 1, 'rows');
      throw new Error(`Invite code ${inviteCode} not found in sheet`);
    }
    
    // Update only the provided fields
    const updates = [];
    
    if (data.email && colMap['Email'] !== undefined) {
      updates.push({ row: targetRow + 1, col: colMap['Email'] + 1, value: data.email });
    }
    
    if (data.phone && colMap['Phone'] !== undefined) {
      updates.push({ row: targetRow + 1, col: colMap['Phone'] + 1, value: data.phone });
    }
    
    if (data.paymentStatus && colMap['Payment Status'] !== undefined) {
      updates.push({ row: targetRow + 1, col: colMap['Payment Status'] + 1, value: data.paymentStatus });
    }
    
    if (data.referenceNumber && colMap['Reference Number'] !== undefined) {
      updates.push({ row: targetRow + 1, col: colMap['Reference Number'] + 1, value: data.referenceNumber });
    }
    
    if (data.transactionId && colMap['Transaction ID'] !== undefined) {
      updates.push({ row: targetRow + 1, col: colMap['Transaction ID'] + 1, value: data.transactionId });
    }
    
    if (data.bookingDate && colMap['Booking Date'] !== undefined) {
      updates.push({ row: targetRow + 1, col: colMap['Booking Date'] + 1, value: data.bookingDate });
    }
    
    if (data.checkedIn && colMap['Checked In'] !== undefined) {
      updates.push({ row: targetRow + 1, col: colMap['Checked In'] + 1, value: data.checkedIn });
    }
    
    // Always mark as booked if we're updating
    if (colMap['Booked'] !== undefined) {
      updates.push({ row: targetRow + 1, col: colMap['Booked'] + 1, value: 'Yes' });
    }
    
    // Log what will be updated
    console.log('📝 Updates to apply:', updates.length);
    updates.forEach(update => {
      console.log(`  - Row ${update.row}, Col ${update.col}: ${update.value}`);
    });
    
    // Apply all updates
    updates.forEach(update => {
      sheet.getRange(update.row, update.col).setValue(update.value);
    });
    
    console.log('✅ Booking data updated successfully for invite code:', inviteCode);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Booking data updated successfully',
        inviteCode: inviteCode,
        updatesApplied: updates.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error updating booking:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function - you can run this in the Apps Script editor to test
 */
function testScript() {
  console.log('Testing script...');
  
  const testData = {
    action: 'updateCheckInOnly',
    inviteCode: 'TEST123',
    checkedIn: 'Yes'
  };
  
  const result = updateCheckInOnly(testData);
  console.log('Test result:', result.getContent());
}