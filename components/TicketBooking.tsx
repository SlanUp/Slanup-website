"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { EventConfig, TicketType } from '@/lib/types';
import { formatCurrency } from '@/lib/cashfreeIntegration';
import { getTicketFees } from '@/lib/paymentFees';

interface TicketBookingProps {
  inviteCode: string;
  eventConfig: EventConfig;
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

export default function TicketBooking({ inviteCode, eventConfig, onClose }: TicketBookingProps) {
  // Logging for debugging
  useEffect(() => {
    console.log('🎟️ [TicketBooking] Component mounted');
    console.log('🎟️ [TicketBooking] Event Config received:', eventConfig);
    if (eventConfig) {
      console.log('🎟️ [TicketBooking] Event ID:', eventConfig.id);
      console.log('🎟️ [TicketBooking] Event Name:', eventConfig.name);
      console.log('🎟️ [TicketBooking] Invite Code:', inviteCode);
      console.log('🎟️ [TicketBooking] Ticket Types Count:', eventConfig.ticketTypes.length);
      eventConfig.ticketTypes.forEach((ticket, index) => {
        console.log(`🎟️ [TicketBooking] Ticket ${index + 1}:`, {
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          description: ticket.description
        });
      });
      console.log('🎟️ [TicketBooking] Theme:', {
        primaryColor: eventConfig.theme.primaryColor,
        secondaryColor: eventConfig.theme.secondaryColor,
        accentColor: eventConfig.theme.accentColor,
        emoji: eventConfig.theme.emoji,
        textColor: eventConfig.theme.textColor
      });
    } else {
      console.error('❌ [TicketBooking] Event config is null!');
    }
  }, [eventConfig, inviteCode]);
  
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
    // Use event theme colors for ticket card
    const { theme } = eventConfig;
    const color = theme.primaryColor === 'teal' 
      ? 'from-amber-400 via-orange-300 to-amber-500' // Cream/amber gradient instead of teal
      : 'from-slate-800 via-slate-700 to-slate-900';
    console.log(`🎨 [TicketBooking] getTicketColor(${ticketType}): primaryColor=${theme.primaryColor}, returning=${color}`);
    return color;
  };

  // Get theme-based classes
  const getModalBackground = () => {
    const { theme } = eventConfig;
    if (theme.primaryColor === 'teal') {
      // Luau - cream background matching page
      return 'bg-gradient-to-br from-amber-50/95 via-orange-50/95 to-amber-100/95 backdrop-blur-sm';
    } else {
      // Diwali - dark background
      return 'bg-black/80 backdrop-blur-sm';
    }
  };

  const getModalContainer = () => {
    const { theme } = eventConfig;
    if (theme.primaryColor === 'teal') {
      // Luau - cream container with subtle amber tones, less green
      return 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl border-2 border-amber-200 shadow-2xl shadow-amber-500/20';
    } else {
      // Diwali - dark container
      return 'bg-gradient-to-br from-gray-900 to-black rounded-3xl';
    }
  };

  const getTextColor = () => {
    return eventConfig.theme.textColor;
  };

  const getPrimaryButtonClass = () => {
    const { theme } = eventConfig;
    if (theme.primaryColor === 'teal') {
      // Use amber/orange instead of teal for buttons
      return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white';
    } else {
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900';
    }
  };

  const getPriceColor = () => {
    const { theme } = eventConfig;
    if (theme.primaryColor === 'teal') {
      // Dark text on light background
      return 'text-neutral-800 drop-shadow-lg';
    } else {
      return 'text-amber-400';
    }
  };

  const getBorderColor = () => {
    const { theme } = eventConfig;
    if (theme.primaryColor === 'teal') {
      // Amber border instead of teal
      return 'border-amber-300/50 hover:border-amber-400/70';
    } else {
      return 'border-amber-400/30 hover:border-amber-400/60';
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
          ticketCount: 1,
          eventName: eventConfig.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Something went wrong');
        return;
      }

      // Save the complete booking to localStorage (client-side)
      const bookingsKey = `${eventConfig.id}_bookings`;
      const bookingsData = localStorage.getItem(bookingsKey);
      const existingBookings = bookingsData ? JSON.parse(bookingsData) : [];
      const updatedBookings = [...existingBookings.filter((b: { id: string }) => b.id !== data.booking.id), data.booking];
      localStorage.setItem(bookingsKey, JSON.stringify(updatedBookings));
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
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${eventConfig.id}/payment/success?order_id=${data.cashfreeOrder.order_id}`,
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
        className={`fixed inset-0 ${getModalBackground()} z-50 flex items-center justify-center p-4`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`${getModalContainer()} max-w-3xl w-full max-h-[95vh] flex flex-col p-4 md:p-6`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Single scrollable container */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          {/* Header */}
          <div className="text-center mb-4 md:mb-6">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl md:text-3xl mr-2">{eventConfig.theme.emoji}</span>
              <h2 className={`text-2xl md:text-3xl font-bold ${getTextColor()}`} style={{ fontFamily: eventConfig.theme.fontFamily.title }}>
                GET READY TO PARTY!
              </h2>
              <span className="text-2xl md:text-3xl ml-2">{eventConfig.theme.emoji === '🌺' ? '🌴' : eventConfig.theme.emoji}</span>
            </div>
            <p className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-700' : getTextColor()} opacity-90 text-sm md:text-base`}>The most INSANE {eventConfig.name.replace("Slanup's ", "").split(" -")[0]} experience awaits you!</p>
            <p className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-amber-700' : 'text-yellow-400'} font-bold mt-1 text-sm md:text-base`}>
              {eventConfig.theme.emoji === '🌺' ? '🌺🌴 LET\'S GOOOO! 🎉🌺' : 'LET\'S PARTYYYYYYYYY! 🎉'}
            </p>
          </div>

          {/* Single Ticket Experience */}
          <div className="max-w-2xl mx-auto mb-4 md:mb-6">
            {eventConfig.ticketTypes.map((ticket) => {
              // Log ticket rendering
              console.log(`🎫 [TicketBooking] Rendering ticket card:`, {
                id: ticket.id,
                name: ticket.name,
                price: ticket.price,
                themePrimaryColor: eventConfig.theme.primaryColor,
                isTeal: eventConfig.theme.primaryColor === 'teal'
              });
              console.log(`💰 [TicketBooking] Displaying price:`, {
                ticketId: ticket.id,
                price: ticket.price,
                formatted: formatCurrency(ticket.price),
                priceColorClass: getPriceColor()
              });
              
              return (
              <motion.div
                key={ticket.id}
                whileHover={{ scale: 1.02 }}
                className={`relative ${eventConfig.theme.primaryColor === 'teal' ? 'bg-white/90 backdrop-blur-xl rounded-3xl p-4 md:p-6 border-2 border-amber-200 shadow-2xl shadow-amber-500/20' : `bg-gradient-to-br ${getTicketColor(ticket.id)} rounded-3xl p-4 md:p-6 border-2 ${getBorderColor()} shadow-2xl hover:shadow-amber-500/20`} cursor-pointer transition-all`}
                onClick={() => handleTicketSelect(ticket)}
              >


                {/* Price */}
                <div className="text-center mb-3 md:mb-4">
                  <span className={`text-3xl md:text-4xl font-bold ${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800 drop-shadow-lg' : getPriceColor()}`}>
                    {formatCurrency(ticket.price)}
                  </span>
                  <span className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-700' : 'text-white/90'} text-sm md:text-base block mt-1 drop-shadow-lg`}>One Epic Experience</span>
                </div>

                {/* Description */}
                <p className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800' : 'text-white'} text-sm md:text-base text-center mb-3 md:mb-4 font-semibold drop-shadow-lg`}>
                  {ticket.description}
                </p>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2 mb-4 md:mb-5">
                  {ticket.benefits.map((benefit, index) => (
                    <div key={index} className={`flex items-start ${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800 text-xs md:text-sm bg-white/60 backdrop-blur-sm rounded-lg p-1.5 md:p-2' : 'text-white text-xs md:text-sm'}`}>
                      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${eventConfig.theme.primaryColor === 'teal' ? 'bg-amber-500' : 'bg-white'} rounded-full mr-2 md:mr-3 flex-shrink-0 mt-1`} />
                      <span className="leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center mt-4 md:mt-6">
                  <div className={`${getPrimaryButtonClass()} rounded-xl px-4 md:px-6 py-2 md:py-3 inline-block shadow-lg transition-all ${eventConfig.theme.primaryColor === 'teal' ? 'hover:shadow-amber-500/30' : 'hover:shadow-amber-500/30'}`}>
                    <span className={`font-bold text-sm md:text-base ${eventConfig.theme.primaryColor === 'teal' ? 'text-white' : 'text-slate-900'}`}>
                      {eventConfig.theme.emoji === '🌺' ? '🌺🎟️ Click to Book Your Spot! 🌴' : '🎟️ Click to Book Your Spot!'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>

          </div>
          
          {/* Close Button - Fixed at bottom */}
          <div className={`text-center mt-4 pt-4 border-t ${eventConfig.theme.primaryColor === 'teal' ? 'border-amber-200/50' : 'border-white/10'} flex-shrink-0`}>
            <button
              onClick={onClose}
              className={`px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base ${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-600 hover:text-neutral-800' : 'text-gray-400 hover:text-white'} transition-colors font-medium`}
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
        className={`fixed inset-0 ${getModalBackground()} z-50 flex items-center justify-center p-4`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`${getModalContainer()} max-w-md w-full max-h-[95vh] flex flex-col p-4 md:p-6`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Single scrollable container */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          {/* Header */}
          <div className="text-center mb-6">
            <p className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-700' : getTextColor()} opacity-90 text-lg`}>{selectedTicket?.description}</p>
          </div>

          {/* Price Display */}
          <div className="text-center mb-6">
            <div className={`${eventConfig.theme.primaryColor === 'teal' ? 'bg-amber-50 border-2 border-amber-200' : 'bg-slate-800/50 border border-amber-400/30'} rounded-2xl p-4`}>
            {(() => {
              const fees = getTicketFees(selectedTicket?.price || 0);
              return (
                <>
                  <div className="space-y-2 mb-3">
                    <div className={`flex justify-between ${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800' : 'text-white/70'} text-sm`}>
                      <span>Ticket Price</span>
                      <span>{formatCurrency(fees.ticketPrice)}</span>
                    </div>
                    <div className={`flex justify-between ${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800' : 'text-white/70'} text-sm`}>
                      <span>Gateway charges</span>
                      <span>{formatCurrency(fees.gatewayCharges)}</span>
                    </div>
                    <div className={`border-t ${eventConfig.theme.primaryColor === 'teal' ? 'border-amber-200' : 'border-white/20'} pt-2 mt-2`}>
                      <div className="flex justify-between items-center">
                        <span className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800' : 'text-white/80'} text-sm font-medium`}>Total Amount</span>
                        <span className={`text-2xl font-bold ${eventConfig.theme.primaryColor === 'teal' ? 'text-amber-700' : 'text-amber-400'}`}>
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
        <form id="booking-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className={`block ${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800' : 'text-white'} font-medium mb-2`}>Full Name *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => handleFieldChange('customerName', e.target.value)}
              onBlur={() => handleFieldBlur('customerName')}
              className={`w-full px-4 py-3 ${eventConfig.theme.primaryColor === 'teal' ? 'bg-white border-2 rounded-xl text-neutral-800 placeholder-neutral-400' : 'bg-white/10 border rounded-xl text-white placeholder-white/50'} focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.customerName && touched.customerName
                  ? 'border-red-400 focus:ring-red-400'
                  : formData.customerName && !validationErrors.customerName && touched.customerName
                  ? 'border-green-400 focus:ring-green-400'
                  : eventConfig.theme.primaryColor === 'teal' ? 'border-amber-300 focus:ring-amber-500' : 'border-white/20 focus:ring-[var(--brand-green)]'
              }`}
              placeholder="e.g., John Doe"
            />
            {touched.customerName && validationErrors.customerName && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.customerName}
              </p>
            )}
            {!touched.customerName && (
              <p className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-600' : 'text-gray-400'} text-xs mt-1`}>💡 Use letters, spaces, dots, hyphens only</p>
            )}
            {touched.customerName && formData.customerName && !validationErrors.customerName && (
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <span className="mr-1">✓</span>
                Looks good!
              </p>
            )}
          </div>

          <div>
            <label className={`block ${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800' : 'text-white'} font-medium mb-2`}>Email Address *</label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) => handleFieldChange('customerEmail', e.target.value)}
              onBlur={() => handleFieldBlur('customerEmail')}
              className={`w-full px-4 py-3 ${eventConfig.theme.primaryColor === 'teal' ? 'bg-white border-2 rounded-xl text-neutral-800 placeholder-neutral-400' : 'bg-white/10 border rounded-xl text-white placeholder-white/50'} focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.customerEmail && touched.customerEmail
                  ? 'border-red-400 focus:ring-red-400'
                  : formData.customerEmail && !validationErrors.customerEmail && touched.customerEmail
                  ? 'border-green-400 focus:ring-green-400'
                  : eventConfig.theme.primaryColor === 'teal' ? 'border-amber-300 focus:ring-amber-500' : 'border-white/20 focus:ring-[var(--brand-green)]'
              }`}
              placeholder="e.g., john@example.com"
            />
            {touched.customerEmail && validationErrors.customerEmail && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.customerEmail}
              </p>
            )}
            {!touched.customerEmail && (
              <p className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-600' : 'text-gray-400'} text-xs mt-1`}>💡 We&apos;ll send your ticket here</p>
            )}
            {touched.customerEmail && formData.customerEmail && !validationErrors.customerEmail && (
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <span className="mr-1">✓</span>
                Valid email!
              </p>
            )}
          </div>

          <div>
            <label className={`block ${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-800' : 'text-white'} font-medium mb-2`}>Phone Number *</label>
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
              className={`w-full px-4 py-3 ${eventConfig.theme.primaryColor === 'teal' ? 'bg-white border-2 rounded-xl text-neutral-800 placeholder-neutral-400' : 'bg-white/10 border rounded-xl text-white placeholder-white/50'} focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.customerPhone && touched.customerPhone
                  ? 'border-red-400 focus:ring-red-400'
                  : formData.customerPhone && !validationErrors.customerPhone && touched.customerPhone
                  ? 'border-green-400 focus:ring-green-400'
                  : eventConfig.theme.primaryColor === 'teal' ? 'border-amber-300 focus:ring-amber-500' : 'border-white/20 focus:ring-[var(--brand-green)]'
              }`}
              placeholder="e.g., 9876543210"
              maxLength={10}
            />
            {touched.customerPhone && validationErrors.customerPhone && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.customerPhone}
              </p>
            )}
            {!touched.customerPhone && (
              <p className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-600' : 'text-gray-400'} text-xs mt-1`}>💡 10 digits, starting with 6, 7, 8, or 9</p>
            )}
            {touched.customerPhone && formData.customerPhone && !validationErrors.customerPhone && (
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <span className="mr-1">✓</span>
                Valid phone number!
              </p>
            )}
          </div>

          {/* Terms & Conditions Link */}
          <div className="text-center pt-2">
            <Link
              href={`/${eventConfig.id}/terms`}
              target="_blank"
              className={`${eventConfig.theme.primaryColor === 'teal' ? 'text-neutral-600 hover:text-neutral-800' : 'text-gray-400 hover:text-white'} transition-colors underline text-xs`}
            >
              Terms & Conditions
            </Link>
          </div>
        </form>
          </div>
          
          {/* Buttons - Fixed at bottom */}
          <div className={`flex flex-col sm:flex-row gap-3 sm:space-x-4 mt-6 pt-4 border-t ${eventConfig.theme.primaryColor === 'teal' ? 'border-amber-200/50' : 'border-white/10'} flex-shrink-0`}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 border-2 ${eventConfig.theme.primaryColor === 'teal' ? 'border-amber-300 text-neutral-700 hover:bg-amber-50' : 'border-white/20 text-white hover:bg-white/10'} rounded-xl transition-colors text-sm md:text-base`}
            >
              Back
            </button>
            <button
              type="submit"
              form="booking-form"
              disabled={isLoading}
              className={`flex-1 px-4 md:px-6 py-2 md:py-3 ${getPrimaryButtonClass()} font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm md:text-base`}
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </motion.div>
    </motion.div>
  );
}