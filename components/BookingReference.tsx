"use client";

import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Ticket, User, Mail, Phone, Copy } from 'lucide-react';
import { Booking } from '@/lib/types';
import { formatCurrency } from '@/lib/cashfreeIntegration';
import { useState } from 'react';

interface BookingReferenceProps {
  booking: Booking;
}

export default function BookingReference({ booking }: BookingReferenceProps) {
  const [copied, setCopied] = useState(false);

  const copyReferenceNumber = async () => {
    try {
      await navigator.clipboard.writeText(booking.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTicketTypeDisplay = (type: string) => {
    switch (type) {
      case 'ultimate': return 'Diwali Party Entry';
      default: return 'Diwali Party Entry';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '✓ Payment Confirmed';
      case 'pending': return '⏳ Payment Pending';
      case 'failed': return '✗ Payment Failed';
      default: return status;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
    >
      {/* Header - Different for pending vs completed */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="flex items-center justify-center mb-4"
        >
          {booking.paymentStatus === 'completed' ? (
            <CheckCircle className="w-16 h-16 text-green-400" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <span className="text-3xl">⏳</span>
            </div>
          )}
        </motion.div>
        
        {booking.paymentStatus === 'completed' ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">YOU&apos;RE IN! 🔥</h2>
            <p className="text-gray-300">Get ready for the most INSANE Diwali party ever!</p>
            <p className="text-yellow-400 font-bold mt-1">LET&apos;S PARTYYYYYYYYY! 🎉</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">PAYMENT PENDING ⏳</h2>
            <p className="text-gray-300">We&apos;re processing your payment...</p>
            <p className="text-yellow-300 font-medium mt-1">You&apos;ll be confirmed shortly! 🎯</p>
          </>
        )}
      </div>

      {/* Reference Number - Only show when payment is completed */}
      {booking.paymentStatus === 'completed' ? (
        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-2">🎫 Your Golden Ticket</p>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl font-bold text-amber-400 font-mono">
                {booking.referenceNumber}
              </span>
              <button
                onClick={copyReferenceNumber}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Copy reference number"
              >
                <Copy className="w-4 h-4 text-white" />
              </button>
            </div>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-sm mt-2"
              >
                ✓ Copied to clipboard
              </motion.p>
            )}
            <p className="text-amber-200 text-xs mt-2">Show this at the event entrance!</p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-400/10 rounded-2xl p-6 mb-6 border border-yellow-400/20">
          <div className="text-center">
            <p className="text-yellow-400 text-sm mb-2">📦 Order Tracking</p>
            <div className="text-lg font-bold text-yellow-300 font-mono mb-1">
              Order #{booking.id.slice(-8).toUpperCase()}
            </div>
            <p className="text-yellow-200 text-xs">Your reference number will appear once payment is confirmed</p>
          </div>
        </div>
      )}

      {/* Payment Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
          {getPaymentStatusText(booking.paymentStatus)}
        </div>
        
        {/* Pending Payment Helper Text */}
        {booking.paymentStatus === 'pending' && (
          <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
            <p className="text-yellow-200 text-sm mb-2">
              <strong>Don&apos;t worry!</strong> If the payment went through, this will be auto-updated in 10 mins.
            </p>
            <p className="text-yellow-200 text-sm">
              If it failed, you can use your invite code again in 10 mins.
            </p>
          </div>
        )}
      </div>

      {/* Booking Details */}
      <div className="space-y-4 mb-6">
        {/* Event Details */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Event Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Event:</span>
              <span className="text-white">{booking.eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Date:</span>
              <span className="text-white">{new Date(booking.eventDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center">
            <Ticket className="w-5 h-5 mr-2" />
            Ticket Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Ticket Type:</span>
              <span className="text-white">{getTicketTypeDisplay(booking.ticketType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Quantity:</span>
              <span className="text-white">{booking.ticketCount} ticket{booking.ticketCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-300">Total Amount:</span>
              <span className="text-amber-400">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Contact Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-3 text-gray-400" />
              <span className="text-white">{booking.customerName}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-3 text-gray-400" />
              <span className="text-white">{booking.customerEmail}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-3 text-gray-400" />
              <span className="text-white">{booking.customerPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4">
        <h3 className="font-semibold text-amber-400 mb-2">PARTY ESSENTIALS 🎉:</h3>
        <ul className="text-amber-200 text-sm space-y-1">
          <li>• Save this reference number - it&apos;s your GOLDEN TICKET!</li>
          <li>• Show this reference at entrance for VIP treatment</li>
          <li>• Bring valid photo ID + your party energy 🔥</li>
          <li>• BYOB - Bring your favorite booze 🍾</li>
          <li>• We provide all mixers & sides 🥤</li>
          <li>• Get ready for UNLIMITED food & drinks</li>
          <li>• Prepare for the craziest games ever!</li>
          {booking.paymentStatus === 'pending' && (
            <li>• Complete payment to secure your spot</li>
          )}
        </ul>
      </div>

      {/* Contact Support */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Need help? Contact us for support
        </p>
      </div>
    </motion.div>
  );
}