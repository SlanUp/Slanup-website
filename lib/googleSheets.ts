// Google Sheets integration for invite codes management

// CSV export URL (public)
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRz2LJGIYgY4Fq1lp4_8DPs5p31YvPbVs7tFkS7pRU01oPYZkbqZmS8wg0ilJYnTtpsqJcQYi-kyf8z/pub?gid=636322054&single=true&output=csv`;

interface InviteCodeRow {
  group: string;
  name: string;
  inviteCode: string;
  email: string;
  phone: string;
  booked: string;
  paymentStatus: string;
  referenceNumber: string;
  transactionId: string;
  bookingDate: string;
  checkedIn: string;
}

// Parse CSV data
function parseCSV(csvText: string): InviteCodeRow[] {
  const lines = csvText.split('\n');
  const data: InviteCodeRow[] = [];
  
  console.log(`[GoogleSheets] Parsing ${lines.length} lines from CSV`);
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma, handling quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value
    
    // Must have at least 5 columns (group, name, communication, gender, inviteCode)
    if (values.length < 5) {
      console.log(`[GoogleSheets] Skipping row ${i + 1}: Only ${values.length} columns found (need at least 5)`);
      continue;
    }
    
    // Debug: Log first few rows to verify column structure
    if (i <= 3) {
      console.log(`[GoogleSheets] Row ${i + 1} columns:`, {
        group: values[0],
        name: values[1],
        communication: values[2],
        gender: values[3],
        inviteCode: values[4],
        email: values[5]
      });
    }
    
    const inviteCode = values[4]; // Invite Code is now column 5 (index 4) - Column E
    if (!inviteCode) {
      console.log(`[GoogleSheets] Skipping row ${i + 1}: No invite code in column E (index 4)`);
      continue; // Skip rows without invite code
    }
    
    data.push({
      group: values[0] || '',           // Column 1: Group
      name: values[1] || '',            // Column 2: Name
      inviteCode: inviteCode,            // Column 5: Invite Code (was column 3)
      email: values[5] || '',           // Column 6: Email (was column 4)
      phone: values[6] || '',           // Column 7: Phone (was column 5)
      booked: values[7] || 'No',        // Column 8: Booked (was column 6)
      paymentStatus: values[8] || '',   // Column 9: Payment Status (was column 7)
      referenceNumber: values[9] || '', // Column 10: Reference Number (was column 8)
      transactionId: values[10] || '',  // Column 11: Transaction ID (was column 9)
      bookingDate: values[11] || '',    // Column 12: Booking Date (was column 10)
      checkedIn: values[12] || 'No'     // Column 13: Checked In (was column 11)
    });
  }
  
  console.log(`[GoogleSheets] Parsed ${data.length} invite codes`);
  return data;
}

// Fetch invite codes from Google Sheets
export async function fetchInviteCodesFromSheet(): Promise<InviteCodeRow[]> {
  try {
    console.log('[GoogleSheets] Fetching invite codes from sheet...');
    
    // Force fresh fetch every time - no caching
    const response = await fetch(SHEET_CSV_URL, {
      cache: 'no-store', // Don't cache
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`);
    }
    
    const csvText = await response.text();
    const data = parseCSV(csvText);
    
    console.log(`[GoogleSheets] Loaded ${data.length} invite codes`);
    return data;
  } catch (error) {
    console.error('[GoogleSheets] Error fetching invite codes:', error);
    throw error;
  }
}

// Get all valid invite codes (just the codes)
export async function getValidInviteCodes(): Promise<string[]> {
  const data = await fetchInviteCodesFromSheet();
  return data.map(row => row.inviteCode.toUpperCase()).filter(code => code);
}

// Check if invite code is valid
export async function isInviteCodeValid(code: string): Promise<boolean> {
  const validCodes = await getValidInviteCodes();
  return validCodes.includes(code.trim().toUpperCase());
}

// Get invite code details
export async function getInviteCodeDetails(code: string): Promise<InviteCodeRow | null> {
  const data = await fetchInviteCodesFromSheet();
  const normalizedCode = code.trim().toUpperCase();
  
  return data.find(row => row.inviteCode.toUpperCase() === normalizedCode) || null;
}

// Check if invite code is already booked
export async function isInviteCodeBooked(code: string): Promise<boolean> {
  const details = await getInviteCodeDetails(code);
  return details ? details.booked.toLowerCase() === 'yes' : false;
}

// Export for local caching (optional - can be used to update bookingManager.ts)
export async function exportInviteCodesAsArray(): Promise<string[]> {
  try {
    const codes = await getValidInviteCodes();
    console.log(`[GoogleSheets] Exported ${codes.length} invite codes`);
    return codes;
  } catch (error) {
    console.error('[GoogleSheets] Error exporting codes:', error);
    // Return empty array as fallback
    return [];
  }
}
