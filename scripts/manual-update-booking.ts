import 'dotenv/config';
import { sql } from '@vercel/postgres';
import { getBookingById, updateBookingPaymentStatus } from '../lib/db';
import { sendTicketEmail } from '../lib/emailService';
import { updateSheetAfterPayment } from '../lib/googleSheetsUpdate';

async function manuallyUpdateBooking() {
  const orderId = 'TXN1759664222767ou4omh';
  const transactionId = '4417671414';
  
  console.log('🔍 Searching for booking with order ID:', orderId);
  
  try {
    // First, check if booking exists
    const booking = await getBookingById(orderId);
    
    if (!booking) {
      console.log('❌ Booking not found with ID:', orderId);
      console.log('📋 Checking all bookings with this cashfree_order_id...');
      
      const result = await sql`
        SELECT * FROM bookings 
        WHERE cashfree_order_id = ${orderId}
        LIMIT 1
      `;
      
      if (result.rows.length === 0) {
        console.log('❌ No booking found with cashfree_order_id:', orderId);
        console.log('💡 The booking might not have been created. Check if the order was created before payment.');
        return;
      }
      
      console.log('✅ Found booking:', result.rows[0]);
    } else {
      console.log('✅ Found booking:', booking);
      console.log('📊 Current status:', booking.paymentStatus);
      
      if (booking.paymentStatus === 'completed') {
        console.log('⚠️  Booking is already marked as completed!');
        console.log('📧 Email sent status:', booking.emailSent);
        
        if (!booking.emailSent) {
          console.log('📧 Email was not sent. Sending now...');
          const emailSent = await sendTicketEmail(booking);
          if (emailSent) {
            console.log('✅ Email sent successfully!');
            await sql`UPDATE bookings SET email_sent = true WHERE id = ${orderId}`;
          }
        }
        
        return;
      }
      
      // Update payment status
      console.log('💳 Updating payment status to completed...');
      const updatedBooking = await updateBookingPaymentStatus(
        orderId,
        'completed',
        {
          orderId: orderId,
          paymentId: transactionId
        }
      );
      
      if (updatedBooking) {
        console.log('✅ Payment status updated successfully!');
        console.log('📧 Ticket email will be sent automatically by the update function');
        console.log('📊 Google Sheet will be updated automatically');
        console.log('\n✨ All done! Customer should receive their ticket shortly.');
      } else {
        console.log('❌ Failed to update booking');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
manuallyUpdateBooking()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
