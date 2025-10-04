import { NextRequest, NextResponse } from 'next/server';
import { updateBookingPaymentStatus } from '@/lib/bookingManager';
import { sendPaymentFailedEmail } from '@/lib/emailService';
import { z } from 'zod';

const orderIdSchema = z.string().min(1, 'Order ID cannot be empty').trim();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate order ID
    const result = orderIdSchema.safeParse(body.orderId);
    
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.') || 'orderId',
        message: issue.message
      }));
      return NextResponse.json(
        { 
          error: 'Invalid order ID', 
          details: errors 
        },
        { status: 400 }
      );
    }
    
    const orderId = result.data;

    // Verify payment with Cashfree API
    const cashfreeResponse = await fetch(
      `${process.env.NODE_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'}/orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '',
          'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
          'x-api-version': '2023-08-01'
        }
      }
    );

    if (!cashfreeResponse.ok) {
      console.error('Failed to fetch order from Cashfree');
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      );
    }

    const orderData = await cashfreeResponse.json();
    console.log('Cashfree order status:', orderData.order_status);

    // Update booking based on Cashfree order status
    if (orderData.order_status === 'PAID') {
      const updatedBooking = await updateBookingPaymentStatus(
        orderId,
        'completed',
        {
          orderId: orderData.cf_order_id,
          paymentId: orderData.cf_order_id
        }
      );

      // Email will be sent automatically by updateBookingPaymentStatus
      if (updatedBooking) {
        console.log('✅ Payment verified - email sent by updateBookingPaymentStatus');
      }

      return NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Payment verified and booking updated'
      });
    } else if (orderData.order_status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        status: 'pending',
        message: 'Payment still pending'
      });
    } else {
      const updatedBooking = await updateBookingPaymentStatus(
        orderId,
        'failed',
        {
          orderId: orderData.cf_order_id
        }
      );

      // Send payment failed email for local testing
      if (updatedBooking) {
        console.log('📧 Payment failed, sending failure email...');
        sendPaymentFailedEmail(updatedBooking)
          .then(sent => {
            if (sent) {
              console.log('✅ Payment failed email sent successfully');
            } else {
              console.error('❌ Failed to send payment failed email');
            }
          })
          .catch(error => {
            console.error('❌ Error sending payment failed email:', error);
          });
      }

      return NextResponse.json({
        success: true,
        status: 'failed',
        message: 'Payment failed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
