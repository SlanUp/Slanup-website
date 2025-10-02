import CryptoJS from 'crypto-js';
import { PayUPaymentData } from './types';

// PayU Configuration - These will come from environment variables
export const PAYU_CONFIG = {
  // Test credentials - replace with your actual PayU credentials
  MERCHANT_KEY: process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || 'YOUR_MERCHANT_KEY',
  SALT: process.env.PAYU_SALT || 'YOUR_SALT', // Keep this secret, server-side only
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://secure.payu.in/_payment' 
    : 'https://test.payu.in/_payment', // Test URL for development
  SUCCESS_URL: process.env.NEXT_PUBLIC_BASE_URL + '/diwali/payment/success',
  FAILURE_URL: process.env.NEXT_PUBLIC_BASE_URL + '/diwali/payment/failure',
};

// Generate hash for PayU payment
export function generatePayUHash(data: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  // PayU hash formula: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
  const hashString = [
    data.key,
    data.txnid,
    data.amount,
    data.productinfo,
    data.firstname,
    data.email,
    data.udf1 || '',
    data.udf2 || '',
    data.udf3 || '',
    data.udf4 || '',
    data.udf5 || '',
    '',
    '',
    '',
    '',
    '',
    data.salt
  ].join('|');
  
  return CryptoJS.SHA512(hashString).toString();
}

// Verify PayU response hash
export function verifyPayUResponse(data: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  salt: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): boolean {
  // For response verification, the order is reversed
  const hashString = [
    data.salt,
    data.status,
    '',
    '',
    '',
    '',
    '',
    data.udf5 || '',
    data.udf4 || '',
    data.udf3 || '',
    data.udf2 || '',
    data.udf1 || '',
    data.email,
    data.firstname,
    data.productinfo,
    data.amount,
    data.txnid,
    data.key
  ].join('|');
  
  const calculatedHash = CryptoJS.SHA512(hashString).toString();
  return calculatedHash === data.key; // Compare with received hash
}

// Prepare PayU payment data
export function preparePayUPaymentData(data: {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  inviteCode?: string;
  bookingId?: string;
}): PayUPaymentData {
  const amountStr = data.amount.toFixed(2);
  
  const paymentData: PayUPaymentData = {
    key: PAYU_CONFIG.MERCHANT_KEY,
    txnid: data.txnid,
    amount: amountStr,
    productinfo: data.productinfo,
    firstname: data.firstname,
    email: data.email,
    phone: data.phone,
    surl: PAYU_CONFIG.SUCCESS_URL,
    furl: PAYU_CONFIG.FAILURE_URL,
    udf1: data.inviteCode || '',
    udf2: data.bookingId || '',
    udf3: '',
    udf4: '',
    udf5: '',
    hash: ''
  };
  
  // Generate hash (this should be done server-side for security)
  paymentData.hash = generatePayUHash({
    key: paymentData.key,
    txnid: paymentData.txnid,
    amount: paymentData.amount,
    productinfo: paymentData.productinfo,
    firstname: paymentData.firstname,
    email: paymentData.email,
    salt: PAYU_CONFIG.SALT,
    udf1: paymentData.udf1,
    udf2: paymentData.udf2,
    udf3: paymentData.udf3,
    udf4: paymentData.udf4,
    udf5: paymentData.udf5
  });
  
  return paymentData;
}

// Create PayU payment form and submit it
export function submitPayUPayment(paymentData: PayUPaymentData): void {
  // Create a form dynamically and submit it to PayU
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = PAYU_CONFIG.BASE_URL;
  
  // Add all payment data as hidden fields
  Object.entries(paymentData).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value || '';
    form.appendChild(input);
  });
  
  // Add form to document, submit, and remove
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
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

// Parse PayU response from URL parameters
export function parsePayUResponse(urlParams: URLSearchParams): {
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  mihpayid?: string;
  error_Message?: string;
  udf1?: string;
  udf2?: string;
} {
  return {
    status: urlParams.get('status') || '',
    txnid: urlParams.get('txnid') || '',
    amount: urlParams.get('amount') || '',
    productinfo: urlParams.get('productinfo') || '',
    firstname: urlParams.get('firstname') || '',
    email: urlParams.get('email') || '',
    phone: urlParams.get('phone') || '',
    mihpayid: urlParams.get('mihpayid') || '',
    error_Message: urlParams.get('error_Message') || '',
    udf1: urlParams.get('udf1') || '',
    udf2: urlParams.get('udf2') || ''
  };
}