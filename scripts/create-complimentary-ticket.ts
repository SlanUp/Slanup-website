/**
 * Script to create complimentary (free) tickets for VIP guests
 * This creates a booking with 'completed' status, sends ticket email, and updates Google Sheet
 * Usage: npx ts-node scripts/create-complimentary-ticket.ts
 */

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

interface GuestData {
  inviteCode: string;
  name: string;
  email: string;
  phone: string;
}

async function createComplimentaryTicket(guest: GuestData): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎫 Creating complimentary ticket for: ${guest.name}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Check if invite code already has a booking
    const existingBooking = await db.getBookingByInviteCode(guest.inviteCode);
    if (existingBooking) {
      console.log(`⚠️  WARNING: Invite code ${guest.inviteCode} already has a booking!`);
      console.log(`   Existing booking ID: ${existingBooking.id}`);
      console.log(`   Customer: ${existingBooking.customerName}`);
      console.log(`   Status: ${existingBooking.paymentStatus}`);
      console.log(`\n❌ SKIPPING - Please use a different invite code or delete the existing booking.\n`);
      return;
    }

    // Create the complimentary booking
    const now = new Date();
    const booking: Booking = {
      id: generateTransactionId(),
      inviteCode: guest.inviteCode.trim().toUpperCase(),
      customerName: guest.name,
      customerEmail: guest.email,
      customerPhone: guest.phone,
      ticketType: 'ultimate',
      ticketCount: 1,
      totalAmount: 0, // Complimentary - no payment
      paymentStatus: 'completed', // Mark as completed
      paymentMethod: 'cash', // Use 'cash' to indicate complimentary
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

    // Insert booking into database
    console.log(`\n💾 Inserting booking into database...`);
    await db.insertBooking(booking);
    console.log(`✅ Booking saved to database`);

    // Send ticket email
    console.log(`\n📧 Sending ticket email to ${guest.email}...`);
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

  } catch (error) {
    console.error(`\n❌ Error creating complimentary ticket:`, error);
    throw error;
  }
}

// Main function to process multiple guests
async function main() {
  console.log(`\n🎉 COMPLIMENTARY TICKET CREATOR 🎉\n`);

  // Define your VIP guests here
  const vipGuests: GuestData[] = [
    // Example guests - replace with actual data
    // {
    //   inviteCode: 'G1-VIP-1',
    //   name: 'John Doe',
    //   email: 'john.doe@example.com',
    //   phone: '9876543210'
    // },
    // {
    //   inviteCode: 'G2-VIP-2',
    //   name: 'Jane Smith',
    //   email: 'jane.smith@example.com',
    //   phone: '9876543211'
    // }
  ];

  if (vipGuests.length === 0) {
    console.log(`⚠️  No guests defined!`);
    console.log(`\nPlease edit this script and add guest data to the vipGuests array.`);
    console.log(`Example:`);
    console.log(`  {`);
    console.log(`    inviteCode: 'G1-VIP-1',`);
    console.log(`    name: 'John Doe',`);
    console.log(`    email: 'john.doe@example.com',`);
    console.log(`    phone: '9876543210'`);
    console.log(`  }\n`);
    process.exit(1);
  }

  console.log(`📋 Processing ${vipGuests.length} VIP guest(s)...\n`);

  // Process each guest
  for (const guest of vipGuests) {
    try {
      await createComplimentaryTicket(guest);
    } catch (error) {
      console.error(`❌ Failed to process guest ${guest.name}:`, error);
      // Continue with next guest
    }
  }

  console.log(`\n✨ All done! Processed ${vipGuests.length} guest(s).\n`);
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
