"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DIWALI_EVENT_CONFIG, TicketType } from '@/lib/types';
import { formatCurrency } from '@/lib/cashfreeIntegration';
import { getTicketFees } from '@/lib/paymentFees';

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

interface ValidationErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});


  const getTicketColor = (ticketType: string) => {
    switch (ticketType) {
      case 'ultimate': return 'from-slate-800 via-slate-700 to-slate-900';
      default: return 'from-slate-800 via-slate-700 to-slate-900';
    }
  };

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'customerName':
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name is too long';
        if (!/^[a-zA-Z\s.'-]+$/.test(value)) return 'Name can only contain letters, spaces, dots, hyphens, and apostrophes';
        return undefined;
      
      case 'customerEmail':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return undefined;
      
      case 'customerPhone':
        if (!value) return 'Phone number is required';
        if (!/^[0-9]{10}$/.test(value)) return 'Phone must be exactly 10 digits';
        if (!/^[6-9]/.test(value)) return 'Phone must start with 6, 7, 8, or 9';
        return undefined;
      
      default:
        return undefined;
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = formData[name as keyof BookingForm] as string;
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
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
    
    // Validate all fields before submission
    const errors: ValidationErrors = {
      customerName: validateField('customerName', formData.customerName),
      customerEmail: validateField('customerEmail', formData.customerEmail),
      customerPhone: validateField('customerPhone', formData.customerPhone)
    };
    
    // Mark all fields as touched
    setTouched({
      customerName: true,
      customerEmail: true,
      customerPhone: true
    });
    
    // Check if there are any errors
    if (Object.values(errors).some(error => error !== undefined)) {
      setValidationErrors(errors);
      return;
    }
    
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
      const updatedBookings = [...existingBookings.filter((b: { id: string }) => b.id !== data.booking.id), data.booking];
      localStorage.setItem('diwali_bookings', JSON.stringify(updatedBookings));
      console.log('[Client] Booking saved to localStorage:', data.booking.id);

      // Store booking information in localStorage before redirect
      localStorage.setItem('pendingBookingId', data.booking.id);
      localStorage.setItem('pendingOrderId', data.cashfreeOrder.order_id);
      
      // Initialize Cashfree Drop-in checkout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            {(() => {
              const fees = getTicketFees(selectedTicket?.price || 0);
              return (
                <>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-white/70 text-sm">
                      <span>Ticket Price</span>
                      <span>{formatCurrency(fees.ticketPrice)}</span>
                    </div>
                    <div className="flex justify-between text-white/70 text-sm">
                      <span>Gateway charges</span>
                      <span>{formatCurrency(fees.gatewayCharges)}</span>
                    </div>
                    <div className="border-t border-white/20 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm font-medium">Total Amount</span>
                        <span className="text-2xl font-bold text-amber-400">
                          {formatCurrency(fees.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
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
              onChange={(e) => handleFieldChange('customerName', e.target.value)}
              onBlur={() => handleFieldBlur('customerName')}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.customerName && touched.customerName
                  ? 'border-red-400 focus:ring-red-400'
                  : formData.customerName && !validationErrors.customerName && touched.customerName
                  ? 'border-green-400 focus:ring-green-400'
                  : 'border-white/20 focus:ring-[var(--brand-green)]'
              }`}
              placeholder="e.g., John Doe"
            />
            {touched.customerName && validationErrors.customerName && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.customerName}
              </p>
            )}
            {!touched.customerName && (
              <p className="text-gray-400 text-xs mt-1">💡 Use letters, spaces, dots, hyphens only</p>
            )}
            {touched.customerName && formData.customerName && !validationErrors.customerName && (
              <p className="text-green-400 text-sm mt-1 flex items-center">
                <span className="mr-1">✓</span>
                Looks good!
              </p>
            )}
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Email Address *</label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) => handleFieldChange('customerEmail', e.target.value)}
              onBlur={() => handleFieldBlur('customerEmail')}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.customerEmail && touched.customerEmail
                  ? 'border-red-400 focus:ring-red-400'
                  : formData.customerEmail && !validationErrors.customerEmail && touched.customerEmail
                  ? 'border-green-400 focus:ring-green-400'
                  : 'border-white/20 focus:ring-[var(--brand-green)]'
              }`}
              placeholder="e.g., john@example.com"
            />
            {touched.customerEmail && validationErrors.customerEmail && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.customerEmail}
              </p>
            )}
            {!touched.customerEmail && (
              <p className="text-gray-400 text-xs mt-1">💡 We&apos;ll send your ticket here</p>
            )}
            {touched.customerEmail && formData.customerEmail && !validationErrors.customerEmail && (
              <p className="text-green-400 text-sm mt-1 flex items-center">
                <span className="mr-1">✓</span>
                Valid email!
              </p>
            )}
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  handleFieldChange('customerPhone', value);
                }
              }}
              onBlur={() => handleFieldBlur('customerPhone')}
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.customerPhone && touched.customerPhone
                  ? 'border-red-400 focus:ring-red-400'
                  : formData.customerPhone && !validationErrors.customerPhone && touched.customerPhone
                  ? 'border-green-400 focus:ring-green-400'
                  : 'border-white/20 focus:ring-[var(--brand-green)]'
              }`}
              placeholder="e.g., 9876543210"
              maxLength={10}
            />
            {touched.customerPhone && validationErrors.customerPhone && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.customerPhone}
              </p>
            )}
            {!touched.customerPhone && (
              <p className="text-gray-400 text-xs mt-1">💡 10 digits, starting with 6, 7, 8, or 9</p>
            )}
            {touched.customerPhone && formData.customerPhone && !validationErrors.customerPhone && (
              <p className="text-green-400 text-sm mt-1 flex items-center">
                <span className="mr-1">✓</span>
                Valid phone number!
              </p>
            )}
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