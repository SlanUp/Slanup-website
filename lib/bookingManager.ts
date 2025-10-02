import { Booking, InviteCodeStatus } from './types';

// Valid invite codes - you can expand this list
const VALID_INVITE_CODES = ["SLANUP2025", "DIWALI24", "TROPICALLAU"];

// Local storage keys
const BOOKINGS_STORAGE_KEY = 'diwali_bookings';
const BOOKING_COUNTER_KEY = 'booking_counter';

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

// Get all bookings from localStorage
export function getAllBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const bookingsData = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!bookingsData) return [];
    
    const bookings = JSON.parse(bookingsData);
    // Convert date strings back to Date objects
    return bookings.map((booking: Booking) => ({
      ...booking,
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt),
      eventDate: new Date(booking.eventDate)
    }));
  } catch (error) {
    console.error('Error loading bookings:', error);
    return [];
  }
}

// Save booking to localStorage
export function saveBooking(booking: Booking): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existingBookings = getAllBookings();
    const updatedBookings = [...existingBookings.filter(b => b.id !== booking.id), booking];
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
  } catch (error) {
    console.error('Error saving booking:', error);
  }
}

// Check if invite code is valid
export function isValidInviteCode(code: string): boolean {
  return VALID_INVITE_CODES.includes(code.trim().toUpperCase());
}

// Get booking status for an invite code
export function getInviteCodeStatus(code: string): InviteCodeStatus {
  const normalizedCode = code.trim().toUpperCase();
  const isValid = isValidInviteCode(normalizedCode);
  
  if (!isValid) {
    return {
      code: normalizedCode,
      isValid: false,
      isUsed: false
    };
  }
  
  const bookings = getAllBookings();
  const existingBooking = bookings.find(b => 
    b.inviteCode === normalizedCode && 
    (b.paymentStatus === 'completed' || b.paymentStatus === 'pending')
  );
  
  return {
    code: normalizedCode,
    isValid: true,
    isUsed: !!existingBooking,
    booking: existingBooking
  };
}

// Create a new booking
export function createBooking(data: {
  inviteCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketType: 'regular' | 'premium' | 'vip';
  ticketCount: number;
  totalAmount: number;
  eventName: string;
  eventDate: Date;
}): Booking {
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
    paymentMethod: 'payu',
    referenceNumber: generateReferenceNumber(),
    createdAt: new Date(),
    updatedAt: new Date(),
    eventDate: data.eventDate,
    eventName: data.eventName
  };
  
  saveBooking(booking);
  return booking;
}

// Update booking payment status
export function updateBookingPaymentStatus(
  bookingId: string, 
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  payuData?: {
    transactionId: string;
    paymentId?: string;
  }
): Booking | null {
  const bookings = getAllBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) return null;
  
  const updatedBooking: Booking = {
    ...booking,
    paymentStatus: status,
    updatedAt: new Date(),
    ...(payuData && {
      payuTransactionId: payuData.transactionId,
      payuPaymentId: payuData.paymentId
    })
  };
  
  saveBooking(updatedBooking);
  return updatedBooking;
}

// Get booking by ID
export function getBookingById(id: string): Booking | null {
  const bookings = getAllBookings();
  return bookings.find(b => b.id === id) || null;
}

// Get booking by transaction ID
export function getBookingByTransactionId(txnId: string): Booking | null {
  const bookings = getAllBookings();
  return bookings.find(b => b.payuTransactionId === txnId) || null;
}

// Clear all bookings (for testing purposes)
export function clearAllBookings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BOOKINGS_STORAGE_KEY);
}

// Export booking data as JSON (for backup)
export function exportBookings(): string {
  const bookings = getAllBookings();
  return JSON.stringify(bookings, null, 2);
}