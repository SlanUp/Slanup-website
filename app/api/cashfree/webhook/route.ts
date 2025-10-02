import { NextRequest, NextResponse } from 'next/server';
import { updateBookingPaymentStatus } from '@/lib/bookingManager';
import { verifyCashfreeSignature } from '@/lib/cashfreeIntegration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
    } = body.data;

    console.log('Cashfree webhook received:', {
      orderId,
      txStatus,
      orderAmount,
      paymentMode
    });

    // Verify signature (simplified for now)
    const isValidSignature = verifyCashfreeSignature({
      orderId,
      orderAmount,
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime,
      signature
    });

    if (!isValidSignature) {
      console.error('Invalid Cashfree signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update booking based on payment status
    if (txStatus === 'SUCCESS') {
      const updatedBooking = await updateBookingPaymentStatus(
        orderId, // booking ID
        'completed',
        {
          orderId: referenceId,
          paymentId: orderId
        }
      );

      if (updatedBooking) {
        console.log('Booking updated successfully:', orderId);
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
          orderId: referenceId,
          paymentId: orderId
        }
      );

      console.log('Payment failed for order:', orderId);
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