// Google Sheets integration for invite codes management

const SHEET_ID = '1q05oFF-xEquICKxj2_q64tStByCrz6IS-WF3YaNwPIw';
const SHEET_NAME = 'FinalDB';

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
    
    // Must have at least 3 columns (group, name, inviteCode)
    if (values.length < 3) continue;
    
    const inviteCode = values[2];
    if (!inviteCode) continue; // Skip rows without invite code
    
    data.push({
      group: values[0] || '',
      name: values[1] || '',
      inviteCode: inviteCode,
      email: values[3] || '',
      phone: values[4] || '',
      booked: values[5] || 'No',
      paymentStatus: values[6] || '',
      referenceNumber: values[7] || '',
      transactionId: values[8] || '',
      bookingDate: values[9] || '',
      checkedIn: values[10] || 'No'
    });
  }
  
  console.log(`[GoogleSheets] Parsed ${data.length} invite codes`);
  return data;
}

// Fetch invite codes from Google Sheets
export async function fetchInviteCodesFromSheet(): Promise<InviteCodeRow[]> {
  try {
    console.log('[GoogleSheets] Fetching invite codes from sheet...');
    
    const response = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      redirect: 'follow', // Follow redirects
      cache: 'no-store' // Don't cache during development
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
