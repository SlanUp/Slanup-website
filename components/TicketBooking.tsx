"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { DIWALI_EVENT_CONFIG, TicketType } from '@/lib/types';
import { formatCurrency } from '@/lib/payuIntegration';

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

  const getTicketIcon = (ticketType: string) => {
    switch (ticketType) {
      case 'ultimate': return <Zap className="w-8 h-8" />;
      default: return <Zap className="w-8 h-8" />;
    }
  };

  const getTicketColor = (ticketType: string) => {
    switch (ticketType) {
      case 'ultimate': return 'from-orange-500 via-pink-500 to-purple-600';
      default: return 'from-orange-500 via-pink-500 to-purple-600';
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

      // Create PayU payment form and submit
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.payuUrl;
      
      // Add all payment data as hidden fields
      Object.entries(data.paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string || '';
        form.appendChild(input);
      });
      
      // Submit to PayU
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

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
              <Zap className="w-8 h-8 text-yellow-400 mr-2" />
              <h2 className="text-3xl font-bold text-white">GET READY TO PARTY! 🔥</h2>
              <Zap className="w-8 h-8 text-yellow-400 ml-2" />
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
                className={`relative bg-gradient-to-br ${getTicketColor(ticket.id)} rounded-3xl p-8 cursor-pointer border-2 border-transparent hover:border-white/20 transition-all shadow-2xl`}
                onClick={() => handleTicketSelect(ticket)}
              >
                {/* Ticket Icon */}
                <div className="flex items-center justify-center mb-6 text-white">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    {getTicketIcon(ticket.id)}
                  </div>
                </div>

                {/* Ticket Name */}
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
                  {ticket.name}
                </h3>

                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {formatCurrency(ticket.price)}
                  </span>
                  <span className="text-white/70 text-lg block mt-1">One Epic Experience</span>
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
                  <div className="bg-white/10 rounded-xl px-4 py-2 inline-block">
                    <span className="text-white font-bold text-lg">🎟️ Click to Book Your Spot!</span>
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
          <div className="flex items-center justify-center mb-2">
            {getTicketIcon(selectedTicket?.id || '')}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {selectedTicket?.name}
          </h3>
          <p className="text-gray-300">{selectedTicket?.description}</p>
        </div>

        {/* Price Display */}
        <div className="text-center mb-6">
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/80 text-sm mb-2">Your Total</p>
            <span className="text-3xl font-bold text-[var(--brand-green)]">
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--brand-green)] to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-[var(--brand-green)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}