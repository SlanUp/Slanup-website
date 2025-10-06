import 'dotenv/config';
import { sql } from '@vercel/postgres';
import { updateSheetAfterPayment } from '../lib/googleSheetsUpdate';
import { Booking } from '../lib/types';

async function updateSheetForBooking() {
  const inviteCode = 'G7-ZEE-5';
  
  console.log('🔍 Looking up booking with invite code:', inviteCode);
  
  try {
    // Fetch booking from database
    const result = await sql`
      SELECT * FROM bookings 
      WHERE invite_code = ${inviteCode} 
      AND payment_status = 'completed'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (result.rows.length === 0) {
      console.log('❌ No completed booking found with invite code:', inviteCode);
      
      // Check if there's a pending one
      const pendingResult = await sql`
        SELECT * FROM bookings 
        WHERE invite_code = ${inviteCode}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      if (pendingResult.rows.length > 0) {
        console.log('⚠️  Found booking but payment status is:', pendingResult.rows[0].payment_status);
      }
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
    
    console.log('✅ Found booking:');
    console.log('  - Name:', booking.customerName);
    console.log('  - Email:', booking.customerEmail);
    console.log('  - Phone:', booking.customerPhone);
    console.log('  - Order ID:', booking.id);
    console.log('  - Payment Status:', booking.paymentStatus);
    console.log('  - Email Sent:', booking.emailSent ? 'Yes' : 'No');
    
    console.log('\n📊 Updating Google Sheet...');
    await updateSheetAfterPayment(booking);
    console.log('✅ Google Sheet updated successfully!');
    
    console.log('\n🎉 Done! Check your Google Sheet.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
updateSheetForBooking()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
