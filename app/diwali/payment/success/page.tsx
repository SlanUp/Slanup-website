"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { updateBookingPaymentStatus } from '@/lib/bookingManager';
import { parsePayUResponse } from '@/lib/payuIntegration';
import BookingReference from '@/components/BookingReference';
import { Booking } from '@/lib/types';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // Parse PayU response from URL parameters
        const payuResponse = parsePayUResponse(searchParams);
        
        if (payuResponse.status !== 'success') {
          setError('Payment was not successful');
          return;
        }

        // Update booking status
        const updatedBooking = updateBookingPaymentStatus(
          payuResponse.udf2 || '', // booking ID stored in udf2
          'completed',
          {
            transactionId: payuResponse.txnid,
            paymentId: payuResponse.mihpayid
          }
        );

        if (!updatedBooking) {
          setError('Booking not found');
          return;
        }

        setBooking(updatedBooking);
      } catch (error) {
        console.error('Error processing payment success:', error);
        setError('Failed to process payment confirmation');
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentSuccess();
  }, [searchParams]);

  const handleBackToDiwali = () => {
    router.push('/diwali');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[var(--brand-green)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Processing Payment...</h2>
          <p className="text-gray-300">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-400 text-2xl">✗</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Payment Processing Error</h1>
          <p className="text-gray-300 mb-6">
            {error || 'Unable to confirm your payment. Please contact support.'}
          </p>
          <button
            onClick={handleBackToDiwali}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold py-3 px-6 rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all shadow-lg"
          >
            Back to Diwali Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-30"
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
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">YOU&apos;RE OFFICIALLY IN! 🔥</h1>
          <p className="text-xl text-gray-300">GET READY FOR THE MOST EPIC DIWALI PARTY EVER!</p>
          <p className="text-2xl text-yellow-400 font-bold mt-2 animate-bounce">LET&apos;S PARTYYYYYYYYY! 🎉🎆</p>
        </motion.div>

        {/* Booking Reference Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <BookingReference booking={booking} />
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={handleBackToDiwali}
            className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Diwali Page
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white flex items-center justify-center">
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
