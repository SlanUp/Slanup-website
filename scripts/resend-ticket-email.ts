import 'dotenv/config';
import { sql } from '@vercel/postgres';
import { sendTicketEmail } from '../lib/emailService';
import { Booking } from '../lib/types';

async function resendTicketEmail() {
  // Order ID from the sheet
  const orderId = 'TXN1759741170597863lgg';
  
  console.log('🔍 Looking up booking with order ID:', orderId);
  
  try {
    // Fetch booking from database
    const result = await sql`
      SELECT * FROM bookings WHERE id = ${orderId} LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      console.log('❌ Booking not found with ID:', orderId);
      return;
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
    
    console.log('✅ Found booking:', booking);
    console.log('📧 Customer Email:', booking.customerEmail);
    console.log('📧 Email Sent Status:', booking.emailSent ? 'Yes' : 'No');
    console.log('💳 Payment Status:', booking.paymentStatus);
    
    if (booking.paymentStatus !== 'completed') {
      console.log('⚠️  Warning: Payment status is not completed. Current status:', booking.paymentStatus);
    }
    
    console.log('\n📧 Attempting to send ticket email...');
    const emailSent = await sendTicketEmail(booking);
    
    if (emailSent) {
      console.log('✅ Email sent successfully!');
      
      // Mark as sent in database
      await sql`
        UPDATE bookings 
        SET email_sent = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId}
      `;
      console.log('✅ Email marked as sent in database');
      
      console.log('\n🎉 Done! Customer should receive their ticket shortly.');
    } else {
      console.log('❌ Failed to send email. Check Resend API logs.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
resendTicketEmail()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
