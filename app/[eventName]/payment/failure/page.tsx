"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { getEventConfig } from '@/lib/eventConfig';

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const eventName = (params?.eventName as string)?.toLowerCase() || '';
  const eventConfig = getEventConfig(eventName);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<{
    txnid: string;
    amount: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const processPaymentFailure = async () => {
      try {
        // Get Cashfree response parameters
        const orderId = searchParams.get('order_id');
        const cfPaymentId = searchParams.get('cf_payment_id');
        const errorMessage = searchParams.get('error_message');
        
        setPaymentDetails({
          txnid: cfPaymentId || orderId || 'N/A',
          amount: '0',
          status: 'FAILED'
        });

        // Set error message
        setErrorMessage(
          errorMessage || 
          'Payment failed. Please try again or contact support.'
        );

      } catch (error) {
        console.error('Error processing payment failure:', error);
        setErrorMessage('Unable to process payment response');
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentFailure();
  }, [searchParams]);

  const handleBackToEvent = () => {
    router.push(`/${eventName}`);
  };

  const handleRetryPayment = () => {
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

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} ${theme.textColor} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Processing Payment Response...</h2>
          <p className={`${theme.textColor} opacity-70`}>Please wait while we check your payment status</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} ${theme.textColor} relative overflow-hidden`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-400 rounded-full opacity-20"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 8 + 4,
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
            <XCircle className="w-16 h-16 text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-red-400">Payment Failed</h1>
          <p className={`text-xl ${theme.textColor} opacity-70`}>Your payment could not be processed</p>
        </motion.div>

        {/* Error Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="bg-red-500/10 backdrop-blur-xl rounded-3xl p-8 border border-red-400/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">What happened?</h2>
            <p className={`${theme.textColor} opacity-70 mb-6`}>
              {errorMessage}
            </p>

            {paymentDetails && (
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-white mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={`${theme.textColor} opacity-70`}>Transaction ID:</span>
                    <span className="text-white font-mono">{paymentDetails.txnid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme.textColor} opacity-70`}>Status:</span>
                    <span className="text-red-400 font-semibold">{paymentDetails.status}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4">
              <h3 className="font-semibold text-amber-400 mb-2">Next Steps:</h3>
              <ul className={`${theme.textColor} opacity-80 text-sm space-y-1`}>
                <li>• Check your internet connection and try again</li>
                <li>• Ensure you have sufficient balance in your account</li>
                <li>• Try using a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
                <li>• Reach out to us for support if needed</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleRetryPayment}
            className="inline-flex items-center bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={handleBackToEvent}
            className={`inline-flex items-center bg-white/80 hover:bg-white text-neutral-800 font-semibold py-3 px-6 rounded-xl transition-all shadow-lg`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {eventConfig.name.replace("Slanup's ", "").split(" -")[0]} Page
          </button>
        </motion.div>

        {/* Support Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className={`${theme.textColor} opacity-60 text-sm`}>
            Need help? Contact our support team for assistance with your payment
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-300">Please wait</p>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}

