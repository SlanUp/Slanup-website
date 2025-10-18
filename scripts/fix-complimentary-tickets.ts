/**
 * Script to delete test bookings and recreate with correct guest information
 */

import { sql } from '@vercel/postgres';
import * as db from '../lib/db';
import { sendTicketEmail } from '../lib/emailService';
import { updateSheetAfterPayment } from '../lib/googleSheetsUpdate';
import { Booking } from '../lib/types';
import { DIWALI_EVENT_CONFIG } from '../lib/types';

// Generate unique reference number
function generateReferenceNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `DIW${timestamp.toString().slice(-6)}${random}`;
}

// Generate unique transaction ID
function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  return `TXN${timestamp}${random}`;
}

async function deleteExistingBookings() {
  console.log('\n📝 Deleting existing test bookings...\n');
  
  try {
    // Delete bookings for G11-ABL-1 and G11-ABL-2
    const result1 = await sql`
      DELETE FROM bookings 
      WHERE invite_code = 'G11-ABL-1'
    `;
    console.log(`✅ Deleted bookings for G11-ABL-1: ${result1.rowCount} rows`);
    
    const result2 = await sql`
      DELETE FROM bookings 
      WHERE invite_code = 'G11-ABL-2'
    `;
    console.log(`✅ Deleted bookings for G11-ABL-2: ${result2.rowCount} rows`);
    
  } catch (error) {
    console.error('❌ Error deleting bookings:', error);
    throw error;
  }
}

async function createComplimentaryTicket(
  inviteCode: string,
  name: string,
  email: string,
  phone: string
) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎫 Creating complimentary ticket for: ${name}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const now = new Date();
    const booking: Booking = {
      id: generateTransactionId(),
      inviteCode: inviteCode.trim().toUpperCase(),
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      ticketType: 'ultimate',
      ticketCount: 1,
      totalAmount: 0, // Complimentary - no payment
      paymentStatus: 'completed', // Mark as completed
      paymentMethod: 'complimentary', // Clear indication this is complimentary
      referenceNumber: generateReferenceNumber(),
      cashfreeOrderId: 'COMPLIMENTARY',
      cashfreePaymentId: 'COMPLIMENTARY',
      createdAt: now,
      updatedAt: now,
      eventDate: DIWALI_EVENT_CONFIG.date,
      eventName: DIWALI_EVENT_CONFIG.name,
      emailSent: false
    };

    console.log(`📝 Booking details:`);
    console.log(`   Booking ID: ${booking.id}`);
    console.log(`   Invite Code: ${booking.inviteCode}`);
    console.log(`   Reference: ${booking.referenceNumber}`);
    console.log(`   Email: ${booking.customerEmail}`);
    console.log(`   Phone: ${booking.customerPhone}`);

    // Insert booking into database
    console.log(`\n💾 Inserting booking into database...`);
    await db.insertBooking(booking);
    console.log(`✅ Booking saved to database`);

    // Send ticket email
    console.log(`\n📧 Sending ticket email to ${email}...`);
    const emailSent = await sendTicketEmail(booking);
    
    if (emailSent) {
      console.log(`✅ Ticket email sent successfully`);
      
      // Mark email as sent in database
      await db.markEmailAsSent(booking.id);
      console.log(`✅ Email marked as sent in database`);
    } else {
      console.error(`❌ Failed to send ticket email`);
    }

    // Update Google Sheet
    console.log(`\n📊 Updating Google Sheet...`);
    try {
      await updateSheetAfterPayment(booking);
      console.log(`✅ Google Sheet updated successfully`);
    } catch (error) {
      console.error(`❌ Failed to update Google Sheet:`, error);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ COMPLIMENTARY TICKET CREATED SUCCESSFULLY!`);
    console.log(`${'='.repeat(60)}\n`);

    return booking;

  } catch (error) {
    console.error(`\n❌ Error creating complimentary ticket:`, error);
    throw error;
  }
}

async function main() {
  console.log(`\n🎉 FIXING COMPLIMENTARY TICKETS FOR DEEPAK & RITIKA 🎉\n`);

  try {
    // First, delete existing test bookings
    await deleteExistingBookings();
    
    console.log('\n✨ Now creating correct tickets...\n');
    
    // Create ticket for Deepak Jagwani
    await createComplimentaryTicket(
      'G11-ABL-1',
      'Deepak Jagwani',
      'Deepakjagwani6@gmail.com',
      '7000473748'
    );
    
    // Create ticket for Ritika Kewalramani
    await createComplimentaryTicket(
      'G11-ABL-2',
      'Ritika Kewalramani',
      'Djablazelive@gmail.com',
      '7000473748'
    );
    
    console.log(`\n✨ All done! Both tickets created successfully.\n`);
    console.log(`📧 Emails have been sent to:`);
    console.log(`   • Deepakjagwani6@gmail.com`);
    console.log(`   • Djablazelive@gmail.com\n`);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });