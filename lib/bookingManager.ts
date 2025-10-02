import { Booking, InviteCodeStatus } from './types';
import * as db from './db';

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
  "TEST10"
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
    createdAt: new Date(),
    updatedAt: new Date(),
    eventDate: data.eventDate,
    eventName: data.eventName
  };
  
  console.log('[BookingManager] Creating booking:', booking.id);
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

