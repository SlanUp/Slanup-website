import { Booking, InviteCodeStatus } from './types';
import * as db from './db';
import { getValidInviteCodes } from './googleSheets';

// Booking expiry time in minutes
const BOOKING_EXPIRY_MINUTES = 7;

// Cache for invite codes (refreshed periodically)
let cachedInviteCodes: string[] = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 60000; // 60 seconds

// Fallback codes in case Google Sheets is down
const FALLBACK_INVITE_CODES = [
  "SLANUP2025", 
  "DIWALI24", 
  "TROPICALLAU"
];

// Generate unique reference number with dynamic prefix
export function generateReferenceNumber(eventPrefix: string = 'DIW'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${eventPrefix}${timestamp.toString().slice(-6)}${random}`;
}

// Generate unique transaction ID
export function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  return `TXN${timestamp}${random}`;
}

// Get all bookings
export async function getAllBookings(): Promise<Booking[]> {
  return await db.getAllBookings();
}

// Fetch and cache invite codes from Google Sheets
async function getInviteCodesWithCache(): Promise<string[]> {
  const now = Date.now();
  
  // Return cached codes if still valid
  if (cachedInviteCodes.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION) {
    return cachedInviteCodes;
  }
  
  try {
    // Fetch fresh codes from Google Sheets
    const codes = await getValidInviteCodes();
    if (codes.length > 0) {
      cachedInviteCodes = codes;
      lastCacheUpdate = now;
      console.log(`[BookingManager] Loaded ${codes.length} invite codes from Google Sheets`);
      return codes;
    }
  } catch (error) {
    console.error('[BookingManager] Error fetching invite codes from Google Sheets:', error);
  }
  
  // Fallback to cached codes or fallback list
  if (cachedInviteCodes.length > 0) {
    console.warn('[BookingManager] Using cached invite codes');
    return cachedInviteCodes;
  }
  
  console.warn('[BookingManager] Using fallback invite codes');
  return FALLBACK_INVITE_CODES;
}

// Check if invite code is valid (async now)
export async function isValidInviteCode(code: string): Promise<boolean> {
  const validCodes = await getInviteCodesWithCache();
  return validCodes.includes(code.trim().toUpperCase());
}

// Check if booking has expired (pending bookings older than 30 minutes)
export function isBookingExpired(booking: Booking): boolean {
  if (booking.paymentStatus !== 'pending') {
    return false; // Only pending bookings can expire
  }
  
  const createdAt = new Date(booking.createdAt);
  const now = new Date();
  const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  
  return diffInMinutes > BOOKING_EXPIRY_MINUTES;
}

// Get booking status for an invite code
export async function getInviteCodeStatus(code: string): Promise<InviteCodeStatus> {
  const normalizedCode = code.trim().toUpperCase();
  const isValid = await isValidInviteCode(normalizedCode);
  
  if (!isValid) {
    return {
      code: normalizedCode,
      isValid: false,
      isUsed: false
    };
  }
  
  const existingBooking = await db.getBookingByInviteCode(normalizedCode);
  
  // If booking exists but is expired and pending, treat as available
  if (existingBooking && isBookingExpired(existingBooking)) {
    console.log(`⏰ Booking ${existingBooking.id} has expired, invite code available`);
    return {
      code: normalizedCode,
      isValid: true,
      isUsed: false, // Expired pending bookings free up the code
      booking: undefined
    };
  }
  
  return {
    code: normalizedCode,
    isValid: true,
    isUsed: !!existingBooking,
    booking: existingBooking || undefined
  };
}

// Create a new booking
export async function createBooking(data: {
  inviteCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketType: 'regular' | 'premium' | 'vip';
  ticketCount: number;
  totalAmount: number;
  eventName: string;
  eventDate: Date;
  eventPrefix?: string; // Optional reference prefix
}): Promise<Booking> {
  // Check for existing expired bookings and clean them up
  const existingBooking = await db.getBookingByInviteCode(data.inviteCode.trim().toUpperCase());
  if (existingBooking && isBookingExpired(existingBooking)) {
    console.log(`🗑️ Deleting expired booking ${existingBooking.id} for invite code ${data.inviteCode}`);
    await db.deleteBooking(existingBooking.id);
  }
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + BOOKING_EXPIRY_MINUTES * 60 * 1000);
  
  const booking: Booking = {
    id: generateTransactionId(),
    inviteCode: data.inviteCode.trim().toUpperCase(),
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    ticketType: data.ticketType,
    ticketCount: data.ticketCount,
    totalAmount: data.totalAmount,
    paymentStatus: 'pending',
    paymentMethod: 'cashfree',
    referenceNumber: generateReferenceNumber(data.eventPrefix || 'DIW'),
    createdAt: now,
    updatedAt: now,
    eventDate: data.eventDate,
    eventName: data.eventName,
    expiresAt // Set expiry time
  };
  
  console.log(`[BookingManager] Creating booking: ${booking.id} (expires at ${expiresAt.toISOString()})`);
  await db.insertBooking(booking);
  console.log('[BookingManager] Booking saved to database');
  
  return booking;
}

// Update booking payment status
export async function updateBookingPaymentStatus(
  bookingId: string, 
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  cashfreeData?: {
    orderId?: string;
    paymentId?: string;
  }
): Promise<Booking | null> {
  return await db.updateBookingPaymentStatus(bookingId, status, cashfreeData);
}

// Get booking by ID
export async function getBookingById(id: string): Promise<Booking | null> {
  console.log('[BookingManager] getBookingById called with ID:', id);
  return await db.getBookingById(id);
}

