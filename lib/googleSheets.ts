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
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handles quoted fields)
    const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 11) continue;
    
    const cleanValue = (val: string) => val.replace(/^"|"$/g, '').trim();
    
    data.push({
      group: cleanValue(matches[0] || ''),
      name: cleanValue(matches[1] || ''),
      inviteCode: cleanValue(matches[2] || ''),
      email: cleanValue(matches[3] || ''),
      phone: cleanValue(matches[4] || ''),
      booked: cleanValue(matches[5] || 'No'),
      paymentStatus: cleanValue(matches[6] || ''),
      referenceNumber: cleanValue(matches[7] || ''),
      transactionId: cleanValue(matches[8] || ''),
      bookingDate: cleanValue(matches[9] || ''),
      checkedIn: cleanValue(matches[10] || 'No')
    });
  }
  
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
