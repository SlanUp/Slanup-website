import crypto from 'crypto';

// Cashfree Configuration (Direct API Integration)
export const CASHFREE_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_CASHFREE_APP_ID || 'YOUR_APP_ID',
  SECRET_KEY: process.env.CASHFREE_SECRET_KEY || 'YOUR_SECRET_KEY', // Keep this secret, server-side only
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg', // Sandbox for development
  SUCCESS_URL: process.env.NEXT_PUBLIC_BASE_URL + '/diwali/payment/success',
  FAILURE_URL: process.env.NEXT_PUBLIC_BASE_URL + '/diwali/payment/failure',
};

// Create Cashfree payment session using direct API call
export async function createCashfreePaymentSession(data: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}) {
  const request = {
    order_amount: data.amount,
    order_currency: 'INR',
    order_id: data.orderId,
    customer_details: {
      customer_id: data.orderId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
    },
    order_meta: {
      return_url: data.returnUrl,
      notify_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/cashfree/webhook',
    },
  };

  try {
    const response = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CASHFREE_CONFIG.APP_ID,
        'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cashfree API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating Cashfree order:', error);
    throw error;
  }
}

// Verify Cashfree payment signature using HMAC-SHA256
export function verifyCashfreeSignature(data: {
  orderId: string;
  orderAmount: string;
  referenceId: string;
  txStatus: string;
  paymentMode: string;
  txMsg: string;
  txTime: string;
  signature: string;
}): boolean {
  try {
    // Cashfree v3 API signature verification
    // The signature is computed as: base64(HMAC-SHA256(data, secret_key))
    
    // Build the signature data string according to Cashfree documentation
    // Format: orderId|orderAmount|referenceId|txStatus|paymentMode|txMsg|txTime
    const signatureData = `${data.orderId}${data.orderAmount}${data.referenceId}${data.txStatus}${data.paymentMode}${data.txMsg}${data.txTime}`;
    
    // Compute HMAC-SHA256 using the secret key
    const expectedSignature = crypto
      .createHmac('sha256', CASHFREE_CONFIG.SECRET_KEY)
      .update(signatureData)
      .digest('base64');
    
    // Compare signatures (constant-time comparison to prevent timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(data.signature)
    );
    
    if (!isValid) {
      console.error('❌ Webhook signature verification failed');
      console.error('Expected:', expectedSignature);
      console.error('Received:', data.signature);
      console.error('Data string:', signatureData);
    } else {
      console.log('✅ Webhook signature verified successfully');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}



// Utility to format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

