// Google Sheets update integration using Apps Script webhook

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2Gn2t3S8TzFcU8Nxc-7XqJ0XEkpBxUEJ4t_Z4s0Mop8ybWgfnHks2jnrBgEHqKKkG2g/exec';

interface SheetUpdateData {
  inviteCode: string;
  email: string;
  phone: string;
  paymentStatus: string;
  referenceNumber: string;
  transactionId: string;
  bookingDate: string;
  checkedIn?: string;  // Optional field for check-in status
}

export async function updateGoogleSheet(data: SheetUpdateData): Promise<boolean> {
  try {
    console.log('[GoogleSheets] Updating sheet for invite code:', data.inviteCode);
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[GoogleSheets] ✅ Sheet updated successfully:', result);
      return true;
    } else {
      console.error('[GoogleSheets] ❌ Sheet update failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('[GoogleSheets] Error updating sheet:', error);
    // Don't throw - we don't want to fail the booking if sheet update fails
    return false;
  }
}

// Update sheet after successful payment or check-in
export async function updateSheetAfterPayment(booking: {
  inviteCode: string;
  customerEmail: string;
  customerPhone: string;
  paymentStatus: string;
  referenceNumber: string;
  id: string;
  updatedAt?: Date;
  checkedIn?: boolean | string;  // Added for check-in updates
}): Promise<void> {
  try {
    const updateData: SheetUpdateData = {
      inviteCode: booking.inviteCode,
      email: booking.customerEmail,
      phone: booking.customerPhone,
      paymentStatus: booking.paymentStatus,
      referenceNumber: booking.referenceNumber,
      transactionId: booking.id,
      bookingDate: booking.updatedAt?.toISOString() || new Date().toISOString(),
      checkedIn: booking.checkedIn ? (typeof booking.checkedIn === 'string' ? booking.checkedIn : 'Yes') : undefined
    };
    
    const success = await updateGoogleSheet(updateData);
    
    if (success) {
      console.log('[GoogleSheets] Sheet updated for booking:', booking.id);
    } else {
      console.warn('[GoogleSheets] Failed to update sheet for booking:', booking.id);
    }
  } catch (error) {
    console.error('[GoogleSheets] Exception updating sheet:', error);
    // Silently fail - don't break the booking flow
  }
}
