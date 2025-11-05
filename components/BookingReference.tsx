"use client";

import { motion } from 'framer-motion';
import { Calendar, Ticket, User, Mail, Phone, Copy } from 'lucide-react';
import { Booking, EventConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/cashfreeIntegration';
import { useState } from 'react';

interface BookingReferenceProps {
  booking: Booking;
  eventConfig?: EventConfig;
}

export default function BookingReference({ booking, eventConfig }: BookingReferenceProps) {
  const [copied, setCopied] = useState(false);

  // Get theme-aware colors - matching TicketBooking modal design
  const isLuau = eventConfig?.theme.primaryColor === 'teal';
  
  // Match exact ticket modal container styling
  const containerClass = isLuau
    ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-8 border-2 border-amber-200 shadow-2xl shadow-amber-500/20'
    : 'bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl';
  
  const textColor = isLuau ? 'text-neutral-800' : 'text-white';
  const textSecondaryColor = isLuau ? 'text-neutral-700' : 'text-gray-300';
  const textMutedColor = isLuau ? 'text-neutral-600' : 'text-gray-400';
  
  // Match ticket modal section styling
  const sectionBg = isLuau ? 'bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-amber-200/50' : 'bg-white/5 rounded-xl p-4';
  const referenceBg = isLuau ? 'bg-gradient-to-br from-amber-400 via-orange-300 to-amber-500 rounded-2xl p-6 border-2 border-amber-300/50 shadow-lg' : 'bg-white/10 rounded-2xl p-6';

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
    if (eventConfig) {
      const ticketType = eventConfig.ticketTypes.find(t => t.id === type);
      return ticketType ? ticketType.name : `${eventConfig.name.replace("Slanup's ", "").split(" -")[0]} Entry`;
    }
    switch (type) {
      case 'ultimate': return 'Party Entry';
      default: return 'Party Entry';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    if (isLuau) {
      switch (status) {
        case 'completed': return 'text-green-700 bg-green-100';
        case 'pending': return 'text-amber-700 bg-amber-100';
        case 'failed': return 'text-red-700 bg-red-100';
        default: return 'text-neutral-600 bg-neutral-100';
      }
    } else {
      switch (status) {
        case 'completed': return 'text-green-400 bg-green-400/10';
        case 'pending': return 'text-yellow-400 bg-yellow-400/10';
        case 'failed': return 'text-red-400 bg-red-400/10';
        default: return 'text-gray-400 bg-gray-400/10';
      }
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
      className={containerClass}
    >
      {/* Header - Matching ticket modal design */}
      <div className="text-center mb-8">
        {booking.paymentStatus === 'completed' ? (
          <>
            <div className="text-center mb-4">
              <h2 className={`text-2xl md:text-3xl font-semibold ${textColor} mb-2 tracking-wide`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                YOU&apos;RE IN!
              </h2>
            </div>
            <p className={`${textSecondaryColor} opacity-90 text-lg`}>
              Get ready for the most INSANE {eventConfig?.name.replace("Slanup's ", "").split(" -")[0] || 'party'} experience!
            </p>
            <p className={`${isLuau ? 'text-amber-700' : 'text-yellow-400'} font-bold mt-2 text-lg`}>
              {isLuau ? '🏝️ LET\'S GOOOO! 🍹' : 'LET\'S PARTYYYYYYYYY! 🎉'}
            </p>
            <p className={`text-sm ${textMutedColor} mt-4 px-4`}>
              Tickets have been mailed to your email ID. Please also check spam if it ain&apos;t in your inbox.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl">⏳</span>
            </div>
            <h2 className={`text-2xl font-bold ${isLuau ? 'text-amber-700' : 'text-yellow-400'} mb-2`}>PAYMENT PENDING ⏳</h2>
            <p className={textSecondaryColor}>We&apos;re processing your payment...</p>
            <p className={`${isLuau ? 'text-amber-600' : 'text-yellow-300'} font-medium mt-1`}>You&apos;ll be confirmed shortly! 🎯</p>
          </>
        )}
      </div>

      {/* Reference Number - Styled like ticket card */}
      {booking.paymentStatus === 'completed' ? (
        <div className={`${referenceBg} mb-8`}>
          <div className="text-center">
            <p className={`${isLuau ? 'text-neutral-800' : 'text-white'} text-lg mb-4 font-semibold drop-shadow-lg`}>
              🎫 Your Golden Ticket
            </p>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className={`text-3xl md:text-4xl font-bold ${isLuau ? 'text-neutral-800 drop-shadow-lg' : 'text-white'} font-mono`}>
                {booking.referenceNumber}
              </span>
              <button
                onClick={copyReferenceNumber}
                className={`p-2 rounded-lg ${isLuau ? 'bg-white/80 hover:bg-white' : 'bg-white/20 hover:bg-white/30'} transition-colors`}
                title="Copy reference number"
              >
                <Copy className={`w-5 h-5 ${isLuau ? 'text-neutral-800' : 'text-white'}`} />
              </button>
            </div>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm mt-2 ${isLuau ? 'text-green-700' : 'text-green-300'}`}
              >
                ✓ Copied to clipboard
              </motion.p>
            )}
            <p className={`${isLuau ? 'text-neutral-800' : 'text-white/90'} text-sm mt-3 drop-shadow-lg`}>
              Show this at the event entrance!
            </p>
          </div>
        </div>
      ) : (
        <div className={`${isLuau ? 'bg-amber-100 border-2 border-amber-300' : 'bg-yellow-400/10 border border-yellow-400/20'} rounded-2xl p-6 mb-6`}>
          <div className="text-center">
            <p className={`${isLuau ? 'text-amber-700' : 'text-yellow-400'} text-sm mb-2`}>📦 Order Tracking</p>
            <div className={`text-lg font-bold ${isLuau ? 'text-neutral-800' : 'text-yellow-300'} font-mono mb-1`}>
              Order #{booking.id.slice(-8).toUpperCase()}
            </div>
            <p className={`${isLuau ? 'text-neutral-600' : 'text-yellow-200'} text-xs`}>Your reference number will appear once payment is confirmed</p>
          </div>
        </div>
      )}

      {/* Payment Status */}
      <div className="mb-6 text-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
          {getPaymentStatusText(booking.paymentStatus)}
        </div>
        
        {/* Pending Payment Helper Text */}
        {booking.paymentStatus === 'pending' && (
          <div className={`mt-4 p-4 ${isLuau ? 'bg-white/60 backdrop-blur-sm border border-amber-200/50' : 'bg-yellow-400/10 border border-yellow-400/20'} rounded-lg`}>
            <p className={`${isLuau ? 'text-neutral-800' : 'text-yellow-200'} text-sm mb-2`}>
              <strong>Don&apos;t worry!</strong> If the payment went through, this will be auto-updated in 10 mins.
            </p>
            <p className={`${isLuau ? 'text-neutral-700' : 'text-yellow-200'} text-sm`}>
              If it failed, you can use your invite code again in 10 mins.
            </p>
          </div>
        )}
      </div>

      {/* Booking Details - Matching ticket modal section styling */}
      <div className="space-y-4 mb-6">
        {/* Event Details */}
        <div className={sectionBg}>
          <h3 className={`font-semibold ${textColor} mb-3 flex items-center`}>
            <Calendar className={`w-5 h-5 mr-2 ${isLuau ? 'text-neutral-700' : 'text-white'}`} />
            Event Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={textSecondaryColor}>Event:</span>
              <span className={textColor}>{booking.eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondaryColor}>Date:</span>
              <span className={textColor}>{new Date(booking.eventDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className={sectionBg}>
          <h3 className={`font-semibold ${textColor} mb-3 flex items-center`}>
            <Ticket className={`w-5 h-5 mr-2 ${isLuau ? 'text-neutral-700' : 'text-white'}`} />
            Ticket Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={textSecondaryColor}>Ticket Type:</span>
              <span className={textColor}>{getTicketTypeDisplay(booking.ticketType)}</span>
            </div>
            <div className="flex justify-between">
              <span className={textSecondaryColor}>Quantity:</span>
              <span className={textColor}>{booking.ticketCount} ticket{booking.ticketCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className={textSecondaryColor}>Total Amount:</span>
              <span className={isLuau ? 'text-neutral-800' : 'text-amber-400'}>{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className={sectionBg}>
          <h3 className={`font-semibold ${textColor} mb-3 flex items-center`}>
            <User className={`w-5 h-5 mr-2 ${isLuau ? 'text-neutral-700' : 'text-white'}`} />
            Contact Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <User className={`w-4 h-4 mr-3 ${isLuau ? 'text-neutral-600' : 'text-gray-400'}`} />
              <span className={textColor}>{booking.customerName}</span>
            </div>
            <div className="flex items-center">
              <Mail className={`w-4 h-4 mr-3 ${isLuau ? 'text-neutral-600' : 'text-gray-400'}`} />
              <span className={textColor}>{booking.customerEmail}</span>
            </div>
            <div className="flex items-center">
              <Phone className={`w-4 h-4 mr-3 ${isLuau ? 'text-neutral-600' : 'text-gray-400'}`} />
              <span className={textColor}>{booking.customerPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes - Matching ticket modal benefits styling */}
      <div className={`${isLuau ? 'bg-white/60 backdrop-blur-sm border border-amber-200/50' : 'bg-amber-400/10 border border-amber-400/20'} rounded-lg p-4`}>
        <h3 className={`font-semibold ${isLuau ? 'text-neutral-800' : 'text-amber-400'} mb-3 text-lg`}>PARTY ESSENTIALS {isLuau ? '🥥' : '🎉'}:</h3>
        <div className={`grid grid-cols-1 ${isLuau ? 'gap-2' : 'gap-3'}`}>
          {[
            'Save this reference number - it\'s your GOLDEN TICKET!',
            'Show this reference at entrance for VIP treatment',
            `Bring valid photo ID + your party energy ${isLuau ? '🌊' : '🔥'}`,
            isLuau ? 'Get your best tropical fits out for the event 🍾' : 'BYOB - Bring your favorite booze 🍾',
            isLuau ? 'Prepare for a night you\'re gonna smile while dreaming of' : 'We provide all mixers & sides 🥤',
            isLuau ? 'Please schedule your return cab 1 hour prior' : 'Get ready for UNLIMITED food & drinks',
            isLuau ? 'Drink safely, because playing with the rules and games is gonna get you a lot wasted, so be careful' : 'Prepare for the craziest games ever!',
            ...(booking.paymentStatus === 'pending' ? ['Complete payment to secure your spot'] : [])
          ].map((item, index) => (
            <div key={index} className={`flex items-center ${isLuau ? 'text-neutral-800 text-sm bg-white/40 backdrop-blur-sm rounded-lg p-2' : 'text-amber-200 text-sm'}`}>
              <div className={`w-2 h-2 ${isLuau ? 'bg-amber-500' : 'bg-white'} rounded-full mr-3 flex-shrink-0`} />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-6 text-center">
        <p className={`${isLuau ? 'text-neutral-600' : 'text-gray-400'} text-sm`}>
          Need help? Contact us for support
        </p>
      </div>
    </motion.div>
  );
}