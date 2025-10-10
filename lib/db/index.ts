import { sql } from '@vercel/postgres';
import { Booking } from '../types';
import { sendTicketEmail } from '../emailService';
import { updateSheetAfterPayment } from '../googleSheetsUpdate';

// Create bookings table (run this once)
export async function createBookingsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(255) PRIMARY KEY,
        invite_code VARCHAR(50) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        ticket_type VARCHAR(50) NOT NULL,
        ticket_count INTEGER NOT NULL DEFAULT 1,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(50) NOT NULL DEFAULT 'cashfree',
        reference_number VARCHAR(255) NOT NULL,
        cashfree_order_id VARCHAR(255),
        cashfree_payment_id VARCHAR(255),
        event_name VARCHAR(255) NOT NULL,
        event_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_invite_code ON bookings(invite_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_cashfree_order_id ON bookings(cashfree_order_id)`;
    
    console.log('Bookings table created successfully');
  } catch (error) {
    console.error('Error creating bookings table:', error);
    throw error;
  }
}

// Insert a new booking
export async function insertBooking(booking: Booking) {
  try {
    await sql`
      INSERT INTO bookings (
        id, invite_code, customer_name, customer_email, customer_phone,
        ticket_type, ticket_count, total_amount, payment_status, payment_method,
        reference_number, cashfree_order_id, event_name, event_date,
        created_at, updated_at, expires_at
      ) VALUES (
        ${booking.id}, ${booking.inviteCode}, ${booking.customerName}, 
        ${booking.customerEmail}, ${booking.customerPhone},
        ${booking.ticketType}, ${booking.ticketCount}, ${booking.totalAmount},
        ${booking.paymentStatus}, ${booking.paymentMethod},
        ${booking.referenceNumber}, ${booking.id}, ${booking.eventName},
        ${booking.eventDate.toISOString()}, ${booking.createdAt.toISOString()},
        ${booking.updatedAt.toISOString()},
        ${booking.expiresAt ? booking.expiresAt.toISOString() : null}
      )
    `;
    console.log('[Database] Booking inserted:', booking.id);
    return booking;
  } catch (error) {
    console.error('[Database] Error inserting booking:', error);
    throw error;
  }
}

// Mark email as sent for a booking to prevent duplicates
export async function markEmailAsSent(bookingId: string): Promise<void> {
  try {
    await sql`
      UPDATE bookings 
      SET email_sent = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
    `;
    console.log('[Database] Email marked as sent for booking:', bookingId);
  } catch (error) {
    console.error('[Database] Error marking email as sent:', error);
    throw error;
  }
}

// Get booking by ID
export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    console.log('[Database] Fetching booking with ID:', id);
    const result = await sql`
      SELECT * FROM bookings WHERE id = ${id} LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      console.log('[Database] Booking not found');
      return null;
    }
    
    const row = result.rows[0];
    const booking: Booking = {
      id: row.id,
      inviteCode: row.invite_code,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      ticketType: row.ticket_type as 'regular' | 'premium' | 'vip',
      ticketCount: row.ticket_count,
      totalAmount: parseFloat(row.total_amount),
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      referenceNumber: row.reference_number,
      cashfreeOrderId: row.cashfree_order_id,
      cashfreePaymentId: row.cashfree_payment_id,
      eventName: row.event_name,
      eventDate: new Date(row.event_date),
      emailSent: row.email_sent || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
    
    console.log('[Database] Booking found:', booking.id);
    return booking;
  } catch (error) {
    console.error('[Database] Error fetching booking:', error);
    throw error;
  }
}

// Get booking by invite code (checks both completed and pending)
export async function getBookingByInviteCode(inviteCode: string): Promise<Booking | null> {
  try {
    // First check for completed bookings
    const completedResult = await sql`
      SELECT * FROM bookings 
      WHERE invite_code = ${inviteCode} 
      AND payment_status = 'completed'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (completedResult.rows.length > 0) {
      const row = completedResult.rows[0];
      return {
        id: row.id,
        inviteCode: row.invite_code,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        ticketType: row.ticket_type as 'regular' | 'premium' | 'vip',
        ticketCount: row.ticket_count,
        totalAmount: parseFloat(row.total_amount),
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        referenceNumber: row.reference_number,
        cashfreeOrderId: row.cashfree_order_id,
        cashfreePaymentId: row.cashfree_payment_id,
        eventName: row.event_name,
        eventDate: new Date(row.event_date),
        emailSent: row.email_sent || false,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        expiresAt: row.expires_at ? new Date(row.expires_at) : undefined
      };
    }
    
    // If no completed booking, check for pending bookings (for expiry logic)
    const pendingResult = await sql`
      SELECT * FROM bookings 
      WHERE invite_code = ${inviteCode} 
      AND payment_status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (pendingResult.rows.length === 0) return null;
    
    const row = pendingResult.rows[0];
    return {
      id: row.id,
      inviteCode: row.invite_code,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      ticketType: row.ticket_type as 'regular' | 'premium' | 'vip',
      ticketCount: row.ticket_count,
      totalAmount: parseFloat(row.total_amount),
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      referenceNumber: row.reference_number,
      cashfreeOrderId: row.cashfree_order_id,
      cashfreePaymentId: row.cashfree_payment_id,
      eventName: row.event_name,
      eventDate: new Date(row.event_date),
      emailSent: row.email_sent || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined
    };
  } catch (error) {
    console.error('[Database] Error fetching booking by invite code:', error);
    throw error;
  }
}

// Delete booking (for expired bookings cleanup)
export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM bookings WHERE id = ${bookingId}
    `;
    console.log('[Database] Booking deleted:', bookingId);
  } catch (error) {
    console.error('[Database] Error deleting booking:', error);
    throw error;
  }
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
  try {
    await sql`
      UPDATE bookings 
      SET 
        payment_status = ${status},
        cashfree_order_id = COALESCE(${cashfreeData?.orderId || null}, cashfree_order_id),
        cashfree_payment_id = COALESCE(${cashfreeData?.paymentId || null}, cashfree_payment_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
    `;
    
    console.log('[Database] Booking payment status updated:', bookingId, status, '- Build:', new Date().toISOString());
    const updatedBooking = await getBookingById(bookingId);
    
    // Automatically send emails when payment status changes
    if (updatedBooking && status === 'completed') {
      console.log('📧 Payment completed - checking if ticket email needed for:', bookingId);
      
      // CRITICAL: Check if email was already sent to prevent duplicates
      if (updatedBooking.emailSent) {
        console.log('⏭️ Email already sent for booking:', bookingId, '- skipping duplicate send');
      } else {
        console.log('📧 Email not sent yet - triggering ticket email for:', bookingId);
        
        try {
          // Send email asynchronously (don't block the response)
          sendTicketEmail(updatedBooking)
            .then(async (sent) => {
              if (sent) {
                console.log('✅ Ticket email sent automatically for booking:', bookingId);
                // Mark email as sent in database
                await markEmailAsSent(bookingId);
                console.log('✅ Email marked as sent in database');
              } else {
                console.error('❌ Failed to send ticket email for booking:', bookingId);
              }
            })
            .catch(error => {
              console.error('❌ Error in sendTicketEmail promise:', error);
              console.error('❌ Error stack:', error.stack);
            });
          
          // Update Google Sheets asynchronously (don't block the response)
          updateSheetAfterPayment(updatedBooking)
            .then(() => {
              console.log('✅ Google Sheet update triggered for booking:', bookingId);
            })
            .catch(error => {
              console.error('❌ Error updating Google Sheet:', error);
            });
        } catch (error) {
          console.error('❌ Error calling sendTicketEmail:', error);
          console.error('❌ Error type:', typeof error);
          console.error('❌ Error details:', JSON.stringify(error, null, 2));
        }
      }
    }
    
    return updatedBooking;
  } catch (error) {
    console.error('[Database] Error updating booking payment status:', error);
    throw error;
  }
}

// Get all bookings (for admin)
export async function getAllBookings(): Promise<Booking[]> {
  try {
    const result = await sql`
      SELECT * FROM bookings 
      ORDER BY created_at DESC
    `;
    
    return result.rows.map((row) => ({
      id: row.id,
      inviteCode: row.invite_code,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      ticketType: row.ticket_type as 'regular' | 'premium' | 'vip',
      ticketCount: row.ticket_count,
      totalAmount: parseFloat(row.total_amount),
      paymentStatus: row.payment_status,
      paymentMethod: row.payment_method,
      referenceNumber: row.reference_number,
      cashfreeOrderId: row.cashfree_order_id,
      cashfreePaymentId: row.cashfree_payment_id,
      eventName: row.event_name,
      eventDate: new Date(row.event_date),
      emailSent: row.email_sent || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  } catch (error) {
    console.error('[Database] Error fetching all bookings:', error);
    throw error;
  }
}
