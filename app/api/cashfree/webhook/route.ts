import { NextRequest, NextResponse } from 'next/server';
import { updateBookingPaymentStatus } from '@/lib/bookingManager';
import { verifyCashfreeSignature } from '@/lib/cashfreeIntegration';
import { validateCashfreeWebhook } from '@/lib/validation';
import { isWebhookProcessed, markWebhookProcessed } from '@/lib/webhookIdempotency';
import { sendPaymentFailedEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Debug: Log actual webhook payload structure
    console.log('🔍 Cashfree webhook received - Full payload:', JSON.stringify(body, null, 2));
    
    // Validate webhook payload structure
    const validation = validateCashfreeWebhook(body);
    
    if (!validation.success) {
      console.error('❌ Invalid webhook payload:', validation.errors);
      console.error('❌ Received payload structure:', Object.keys(body));
      console.error('❌ Received data field:', body.data ? Object.keys(body.data) : 'No data field');
      return NextResponse.json(
        { 
          error: 'Invalid webhook payload', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    // Cashfree webhook data structure
    const {
      orderId,
      orderAmount,
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime,
      signature
    } = validation.data.data;

    console.log('Cashfree webhook received:', {
      orderId,
      txStatus,
      orderAmount,
      paymentMode
    });

    // Check idempotency - prevent duplicate processing
    const webhookId = `${orderId}_${txTime || Date.now()}`;
    const alreadyProcessed = await isWebhookProcessed(webhookId);
    
    if (alreadyProcessed) {
      console.log(`⏭️ Webhook ${webhookId} already processed, skipping`);
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook already processed' 
      });
    }

    // Verify signature using HMAC-SHA256
    const isValidSignature = verifyCashfreeSignature({
      orderId,
      orderAmount,
      referenceId: referenceId || '',
      txStatus,
      paymentMode: paymentMode || '',
      txMsg: txMsg || '',
      txTime: txTime || '',
      signature: signature || ''
    });

    if (!isValidSignature) {
      console.error('❌ Invalid Cashfree webhook signature - possible attack!');
      console.error('Order ID:', orderId);
      console.error('Signature:', signature);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Update booking based on payment status
    if (txStatus === 'SUCCESS') {
      const updatedBooking = await updateBookingPaymentStatus(
        orderId, // booking ID
        'completed',
        {
          orderId: referenceId || orderId,
          paymentId: orderId
        }
      );

      if (updatedBooking) {
        console.log('✅ Booking updated successfully:', orderId);
        console.log('📧 Email will be sent by updateBookingPaymentStatus');
        
        // Mark webhook as processed
        await markWebhookProcessed(
          webhookId,
          'PAYMENT_SUCCESS',
          orderId,
          signature || '',
          body
        );
        
        return NextResponse.json({ 
          success: true, 
          message: 'Payment confirmed' 
        });
      } else {
        console.error('Booking not found for order:', orderId);
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
    } else {
      // Payment failed
      const updatedBooking = await updateBookingPaymentStatus(
        orderId,
        'failed',
        {
          orderId: referenceId || orderId,
          paymentId: orderId
        }
      );

      console.log('❌ Payment failed for order:', orderId);
      
      // Send payment failed email asynchronously
      if (updatedBooking) {
        sendPaymentFailedEmail(updatedBooking)
          .then(sent => {
            if (sent) {
              console.log('✅ Payment failed email sent for booking:', orderId);
            } else {
              console.error('❌ Failed to send payment failed email for booking:', orderId);
            }
          })
          .catch(error => {
            console.error('❌ Error sending payment failed email:', error);
          });
      }
      
      // Mark webhook as processed even for failures
      await markWebhookProcessed(
        webhookId,
        'PAYMENT_FAILED',
        orderId,
        signature || '',
        body
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payment failed - booking updated' 
      });
    }

  } catch (error) {
    console.error('Error processing Cashfree webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({ message: 'Cashfree webhook endpoint active' });
}