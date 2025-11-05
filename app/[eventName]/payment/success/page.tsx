"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import BookingReference from '@/components/BookingReference';
import { Booking } from '@/lib/types';
import { getEventConfig } from '@/lib/eventConfig';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const eventName = (params?.eventName as string)?.toLowerCase() || '';
  const eventConfig = getEventConfig(eventName);
  
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // Debug: Log all URL parameters
        const allParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
        });
        console.log('All URL Parameters:', allParams);
        
        // Get Cashfree response parameters
        let orderId = searchParams.get('order_id') || searchParams.get('orderId');
        
        // Fallback: Check localStorage if order_id not in URL
        if (!orderId) {
          orderId = localStorage.getItem('pendingOrderId');
          console.log('Order ID from localStorage:', orderId);
        }
        
        console.log('Final Order ID:', orderId);
        
        if (!orderId) {
          setError('Missing order information');
          return;
        }
        
        // Clear localStorage after retrieving
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem('pendingBookingId');

        // Get booking by order ID via API
        console.log('[Success Page] Looking up booking with Order ID:', orderId);
        
        // Verify payment status with Cashfree
        try {
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          });
          const verifyData = await verifyResponse.json();
          console.log('[Success Page] Payment verification result:', verifyData);
          
          // If payment failed or still pending, redirect to failure page
          if (verifyData.status === 'failed' || verifyData.status === 'pending') {
            router.push(`/${eventName}/payment/failure?order_id=${orderId}`);
            return;
          }
        } catch (error) {
          console.error('[Success Page] Failed to verify payment:', error);
        }
        
        const response = await fetch(`/api/booking/get?id=${orderId}`);
        const existingBooking = response.ok ? await response.json() : null;
        console.log('[Success Page] Booking found:', existingBooking ? 'Yes' : 'No');
        
        if (!existingBooking) {
          console.error('[Success Page] Booking not found for order ID:', orderId);
          setError('Booking not found');
          return;
        }
        
        console.log('[Success Page] Booking details:', JSON.stringify(existingBooking, null, 2));

        // Check if payment is already confirmed via webhook
        if (existingBooking.paymentStatus === 'completed') {
          setBooking(existingBooking);
          return;
        }

        // If not confirmed yet, show pending status
        setBooking(existingBooking);
        
        // Poll for payment confirmation
        const pollInterval = setInterval(async () => {
          const pollResponse = await fetch(`/api/booking/get?id=${orderId}`);
          if (pollResponse.ok) {
            const updatedBooking = await pollResponse.json();
            if (updatedBooking && updatedBooking.paymentStatus === 'completed') {
              setBooking(updatedBooking);
              clearInterval(pollInterval);
            }
          }
        }, 2000);

        // Clear interval after 30 seconds
        setTimeout(() => clearInterval(pollInterval), 30000);
        
      } catch (error) {
        console.error('Error processing payment success:', error);
        setError('Failed to process payment confirmation');
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentSuccess();
  }, [searchParams, router, eventName]);

  const handleBackToEvent = () => {
    router.push(`/${eventName}`);
  };

  if (!eventConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
        </div>
      </div>
    );
  }

  const { theme } = eventConfig;

  // Get background and text colors based on theme
  const getSuccessPageBackground = () => {
    if (theme.primaryColor === 'teal') {
      return 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100';
    }
    return `bg-gradient-to-br ${theme.background}`;
  };

  const getSuccessPageTextColor = () => {
    if (theme.primaryColor === 'teal') {
      return 'text-neutral-800';
    }
    return theme.textColor;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${getSuccessPageBackground()} ${getSuccessPageTextColor()} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className={`w-16 h-16 animate-spin ${theme.primaryColor === 'teal' ? 'text-amber-600' : 'text-[var(--brand-green)]'} mx-auto mb-4`} />
          <h2 className={`text-2xl font-bold mb-2 ${getSuccessPageTextColor()}`}>Processing Payment...</h2>
          <p className={`${getSuccessPageTextColor()} opacity-70`}>Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={`min-h-screen ${getSuccessPageBackground()} ${getSuccessPageTextColor()} flex items-center justify-center p-4`}>
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">✗</span>
          </div>
          <h1 className={`text-2xl font-bold mb-4 ${getSuccessPageTextColor()}`}>Payment Processing Error</h1>
          <p className={`${getSuccessPageTextColor()} opacity-70 mb-6`}>
            {error || 'Unable to confirm your payment. Please contact support.'}
          </p>
          <button
            onClick={handleBackToEvent}
            className={`inline-flex items-center ${theme.primaryColor === 'teal' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/80 hover:bg-white text-neutral-800'} font-semibold py-3 px-6 rounded-xl transition-all shadow-lg`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {eventConfig.name.replace("Slanup's ", "").split(" -")[0]} Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getSuccessPageBackground()} ${getSuccessPageTextColor()} relative overflow-hidden`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 ${theme.primaryColor === 'teal' ? 'bg-amber-400' : `bg-${theme.accentColor}-400`} rounded-full opacity-30`}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 animate-bounce ${getSuccessPageTextColor()}`}>
            {theme.emoji === '🌺' ? '🏝️ WUHUUUUU! 🎉' : 'WUHUUUUU! 🎉'}
          </h1>
          <p className={`text-lg sm:text-xl ${getSuccessPageTextColor()} opacity-90 font-semibold`}>Payment Successful! ✨</p>
        </motion.div>

        {/* Booking Reference Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <BookingReference booking={booking} eventConfig={eventConfig} />
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={handleBackToEvent}
            className={`inline-flex items-center ${theme.primaryColor === 'teal' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/80 hover:bg-white text-neutral-800'} font-semibold py-3 px-6 rounded-xl transition-all shadow-lg`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {eventConfig.name.replace("Slanup's ", "").split(" -")[0]} Page
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[var(--brand-green)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-300">Please wait</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

