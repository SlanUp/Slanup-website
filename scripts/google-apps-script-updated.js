/**
 * Google Apps Script for Slanup Events - Updated for New Column Structure
 * 
 * NEW COLUMN STRUCTURE:
 * Column A (0): Group
 * Column B (1): Name
 * Column C (2): Communication
 * Column D (3): Gender
 * Column E (4): Invite Code  ← UPDATED
 * Column F (5): Email       ← UPDATED
 * Column G (6): Phone       ← UPDATED
 * Column H (7): Booked      ← UPDATED
 * Column I (8): Payment Status ← UPDATED
 * Column J (9): Reference Number ← UPDATED
 * Column K (10): Transaction ID ← UPDATED
 * Column L (11): Booking Date ← UPDATED
 * Column M (12): Checked In ← UPDATED
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace ALL code with this script
 * 4. Save
 * 5. Deploy > Manage deployments > New deployment
 * 6. Choose "Web app" type
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Deploy and copy the new URL
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log('📥 Received data: ' + JSON.stringify(data));
    
    // Handle different actions
    if (data.action === 'updateCheckInOnly') {
      return updateCheckInOnly(data);
    } else {
      return updateBookingData(data);
    }
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update ONLY the check-in status
 */
function updateCheckInOnly(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('FinalDB');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet "FinalDB" not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const inviteCode = data.inviteCode.trim().toUpperCase();
    Logger.log('🔍 Searching for invite code: ' + inviteCode);
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // NEW: Use dynamic column lookup
    const headerRow = values[0];
    const inviteCodeCol = headerRow.indexOf('Invite Code');
    const checkedInCol = headerRow.indexOf('Checked In');
    
    if (inviteCodeCol === -1) {
      Logger.log('❌ Invite Code column not found in headers: ' + headerRow.join(', '));
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invite Code column not found. Available columns: ' + headerRow.join(', ')
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('✅ Found Invite Code column at index: ' + inviteCodeCol);
    
    // Find matching row (skip header)
    let foundRow = -1;
    for (let i = 1; i < values.length; i++) {
      const cellInviteCode = values[i][inviteCodeCol];
      if (cellInviteCode && cellInviteCode.toString().trim().toUpperCase() === inviteCode) {
        foundRow = i + 1; // +1 because sheet rows are 1-indexed
        Logger.log('✅ Found invite code in row: ' + foundRow);
        break;
      }
    }
    
    if (foundRow === -1) {
      Logger.log('❌ Invite code not found: ' + inviteCode);
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invite code not found: ' + inviteCode
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Update ONLY the checked-in column
    if (checkedInCol === -1) {
      // Add Checked In column if it doesn't exist
      const newCol = headerRow.length;
      sheet.getRange(1, newCol + 1).setValue('Checked In');
      sheet.getRange(foundRow, newCol + 1).setValue(data.checkedIn || 'Yes');
      Logger.log('✅ Added Checked In column and updated row ' + foundRow);
    } else {
      sheet.getRange(foundRow, checkedInCol + 1).setValue(data.checkedIn || 'Yes');
      Logger.log('✅ Updated check-in status for row ' + foundRow);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Check-in status updated successfully',
      row: foundRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ Check-in update error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update complete booking data - UPDATED FOR NEW COLUMN STRUCTURE
 */
function updateBookingData(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('FinalDB');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet "FinalDB" not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const inviteCode = data.inviteCode.trim().toUpperCase();
    Logger.log('📊 Updating booking data for invite code: ' + inviteCode);
    Logger.log('📊 Received data: ' + JSON.stringify(data));
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // NEW: Use dynamic column lookup by header names
    const headerRow = values[0];
    Logger.log('📋 Header row: ' + headerRow.join(', '));
    
    const colMap = {};
    headerRow.forEach((header, index) => {
      colMap[header] = index;
    });
    
    Logger.log('📋 Column map: ' + JSON.stringify(colMap));
    
    // Check if Invite Code column exists
    if (colMap['Invite Code'] === undefined) {
      Logger.log('❌ Invite Code column not found in headers');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invite Code column not found. Available columns: ' + headerRow.join(', ')
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('✅ Found Invite Code column at index: ' + colMap['Invite Code']);
    
    // Find matching row (skip header)
    let foundRow = -1;
    for (let i = 1; i < values.length; i++) {
      const cellInviteCode = values[i][colMap['Invite Code']];
      if (cellInviteCode && cellInviteCode.toString().trim().toUpperCase() === inviteCode) {
        foundRow = i + 1; // +1 because sheet rows are 1-indexed
        Logger.log('✅ Found invite code in row: ' + foundRow);
        break;
      }
    }
    
    if (foundRow === -1) {
      Logger.log('❌ Invite code not found. Searched ' + (values.length - 1) + ' rows');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invite code not found: ' + inviteCode
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Update the row using dynamic column mapping
    const updates = [];
    
    if (data.email && colMap['Email'] !== undefined) {
      updates.push({ row: foundRow, col: colMap['Email'] + 1, value: data.email, field: 'Email' });
    }
    
    if (data.phone && colMap['Phone'] !== undefined) {
      updates.push({ row: foundRow, col: colMap['Phone'] + 1, value: data.phone, field: 'Phone' });
    }
    
    if (colMap['Booked'] !== undefined) {
      updates.push({ row: foundRow, col: colMap['Booked'] + 1, value: 'Yes', field: 'Booked' });
    }
    
    if (data.paymentStatus && colMap['Payment Status'] !== undefined) {
      updates.push({ row: foundRow, col: colMap['Payment Status'] + 1, value: data.paymentStatus, field: 'Payment Status' });
    }
    
    if (data.referenceNumber && colMap['Reference Number'] !== undefined) {
      updates.push({ row: foundRow, col: colMap['Reference Number'] + 1, value: data.referenceNumber, field: 'Reference Number' });
    }
    
    if (data.transactionId && colMap['Transaction ID'] !== undefined) {
      updates.push({ row: foundRow, col: colMap['Transaction ID'] + 1, value: data.transactionId, field: 'Transaction ID' });
    }
    
    if (data.bookingDate && colMap['Booking Date'] !== undefined) {
      updates.push({ row: foundRow, col: colMap['Booking Date'] + 1, value: data.bookingDate, field: 'Booking Date' });
    }
    
    if (data.checkedIn && colMap['Checked In'] !== undefined) {
      updates.push({ row: foundRow, col: colMap['Checked In'] + 1, value: data.checkedIn, field: 'Checked In' });
    }
    
    // Apply all updates
    Logger.log('📝 Applying ' + updates.length + ' updates:');
    updates.forEach(update => {
      Logger.log('  - ' + update.field + ': Row ' + update.row + ', Col ' + update.col + ' = ' + update.value);
      sheet.getRange(update.row, update.col).setValue(update.value);
    });
    
    Logger.log('✅ Booking data updated successfully for invite code: ' + inviteCode);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Booking data updated successfully',
      inviteCode: inviteCode,
      row: foundRow,
      updatesApplied: updates.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ Booking update error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function - you can run this in the Apps Script editor
 */
function testUpdate() {
  const testData = {
    inviteCode: 'TEST-7',
    email: 'test@example.com',
    phone: '9876543210',
    paymentStatus: 'completed',
    referenceNumber: 'LUAU123TEST',
    transactionId: 'TXN123456',
    bookingDate: new Date().toISOString()
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  Logger.log(result.getContent());
}

