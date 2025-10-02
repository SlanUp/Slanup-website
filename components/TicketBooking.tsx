"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DIWALI_EVENT_CONFIG, TicketType } from '@/lib/types';
import { formatCurrency } from '@/lib/cashfreeIntegration';

interface TicketBookingProps {
  inviteCode: string;
  onClose: () => void;
}

interface BookingForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketType: string;
  ticketCount: number;
}

export default function TicketBooking({ inviteCode, onClose }: TicketBookingProps) {
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BookingForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    ticketType: '',
    ticketCount: 1
  });


  const getTicketColor = (ticketType: string) => {
    switch (ticketType) {
      case 'ultimate': return 'from-slate-800 via-slate-700 to-slate-900';
      default: return 'from-slate-800 via-slate-700 to-slate-900';
    }
  };

  const handleTicketSelect = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setFormData(prev => ({
      ...prev,
      ticketType: ticket.id,
      ticketCount: 1
    }));
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode,
          ...formData,
          ticketCount: 1
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Something went wrong');
        return;
      }

      // Save the complete booking to localStorage (client-side)
      const bookingsData = localStorage.getItem('diwali_bookings');
      const existingBookings = bookingsData ? JSON.parse(bookingsData) : [];
      const updatedBookings = [...existingBookings.filter((b: any) => b.id !== data.booking.id), data.booking];
      localStorage.setItem('diwali_bookings', JSON.stringify(updatedBookings));
      console.log('[Client] Booking saved to localStorage:', data.booking.id);

      // Store booking information in localStorage before redirect
      localStorage.setItem('pendingBookingId', data.booking.id);
      localStorage.setItem('pendingOrderId', data.cashfreeOrder.order_id);
      
      // Initialize Cashfree Drop-in checkout
      const cashfree = await (window as any).Cashfree({
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      });

      // Configure checkout options - append order_id to return URL
      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/diwali/payment/success?order_id=${data.cashfreeOrder.order_id}`,
        redirectTarget: '_self'
      };

      console.log('Opening Cashfree checkout with session:', data.paymentSessionId);
      console.log('Order ID:', data.cashfreeOrder.order_id);
      
      // Open Cashfree checkout
      cashfree.checkout(checkoutOptions);

    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl mr-2">🔥</span>
              <h2 className="text-3xl font-bold text-white">GET READY TO PARTY!</h2>
              <span className="text-2xl ml-2">🔥</span>
            </div>
            <p className="text-gray-300">The most INSANE Diwali experience awaits you!</p>
            <p className="text-yellow-400 font-bold mt-2">LET&apos;S PARTYYYYYYYYY! 🎉</p>
          </div>

          {/* Single Ticket Experience */}
          <div className="max-w-2xl mx-auto mb-8">
            {DIWALI_EVENT_CONFIG.ticketTypes.map((ticket) => (
              <motion.div
                key={ticket.id}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-gradient-to-br ${getTicketColor(ticket.id)} rounded-3xl p-8 cursor-pointer border-2 border-amber-400/30 hover:border-amber-400/60 transition-all shadow-2xl hover:shadow-amber-500/20`}
                onClick={() => handleTicketSelect(ticket)}
              >


                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-amber-400">
                    {formatCurrency(ticket.price)}
                  </span>
                  <span className="text-white/80 text-lg block mt-1">One Epic Experience</span>
                </div>

                {/* Description */}
                <p className="text-white/90 text-lg text-center mb-6 font-semibold">
                  {ticket.description}
                </p>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {ticket.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center text-white/95 text-sm">
                      <div className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center mt-8">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl px-6 py-3 inline-block shadow-lg hover:shadow-amber-500/30 transition-all">
                    <span className="text-slate-900 font-bold text-lg">🎟️ Click to Book Your Spot!</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-gray-300 text-lg">{selectedTicket?.description}</p>
        </div>

        {/* Price Display */}
        <div className="text-center mb-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-amber-400/30">
            <p className="text-white/80 text-sm mb-2">Your Total</p>
            <span className="text-3xl font-bold text-amber-400">
              {formatCurrency(selectedTicket?.price || 0)}
            </span>
            <p className="text-white/60 text-sm mt-1">One incredible experience 🔥</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Email Address *</label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}