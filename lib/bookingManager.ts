import { Booking, InviteCodeStatus } from './types';
import * as db from './db';

// Booking expiry time in minutes
const BOOKING_EXPIRY_MINUTES = 7;

// Valid invite codes - you can expand this list
const VALID_INVITE_CODES = [
  "SLANUP2025", 
  "DIWALI24", 
  "TROPICALLAU",
  "TEST1",
  "TEST2",
  "TEST3",
  "TEST4",
  "TEST5",
  "TEST6",
  "TEST7",
  "TEST8",
  "TEST9",
  "TEST10",
  "TEST11",
  "TEST12",
  "TEST13",
  "TEST14",
  "TEST15",
  "TEST16",
  "TEST17",
  "TEST18",
  "TEST19",
  "TEST20"
];

// Generate unique reference number
export function generateReferenceNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `DIW${timestamp.toString().slice(-6)}${random}`;
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

// Check if invite code is valid
export function isValidInviteCode(code: string): boolean {
  return VALID_INVITE_CODES.includes(code.trim().toUpperCase());
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
  const isValid = isValidInviteCode(normalizedCode);
  
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
    referenceNumber: generateReferenceNumber(),
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

