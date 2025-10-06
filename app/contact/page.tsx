"use client";

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-400">Get in touch with Slanup</p>
          <p className="text-gray-500 text-sm mt-2">We&apos;re here to help with events, platform support, and inquiries</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          
          {/* Company Details */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-green-400 mb-6">Company Information</h2>
            <div className="space-y-4 text-gray-300">
              <p><strong className="text-white">Business Name:</strong> Slanup</p>
              <p><strong className="text-white">Legal Name:</strong> BINDU DUBEY</p>
              <p><strong className="text-white">What We Do:</strong> Social Media Platform for Planning Activities with Nearby People</p>
              <p><strong className="text-white">Services:</strong> Event discovery, activity planning, event ticketing, and community connections</p>
              <p><strong className="text-white">Business Type:</strong> Technology Platform & Event Organizer</p>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-green-400/10 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
                  <a 
                    href="mailto:hello@slanup.com" 
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    hello@slanup.com
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    For bookings, refunds, platform support, and general inquiries
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-green-400/10 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Phone</h3>
                  <a 
                    href="tel:+917773861799" 
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    +91 7773861799
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    Available Mon-Sat, 10 AM - 7 PM IST
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-green-400/10 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Location</h3>
                  <p className="text-gray-300">
                    Jabalpur, Madhya Pradesh<br />
                    India
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Response Time */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-green-400/10 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Response Time</h3>
                  <p className="text-gray-300">
                    Within 24-48 hours
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    We respond to all inquiries promptly
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Support Topics */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-green-400 mb-6">How Can We Help?</h2>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">🎫 Booking Issues</h3>
                <p className="text-sm">Trouble purchasing tickets or invite code issues</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">💳 Payment Problems</h3>
                <p className="text-sm">Payment failures, double charges, or refund requests</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">📧 Ticket Not Received</h3>
                <p className="text-sm">Didn&apos;t receive your QR code ticket via email</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">❓ Event Information</h3>
                <p className="text-sm">Questions about venue, timing, or event details</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">🔄 Cancellations</h3>
                <p className="text-sm">Policy questions or cancellation requests</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">🕹️ Platform Support</h3>
                <p className="text-sm">Help with using Slanup app or features</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">👥 Other Support</h3>
                <p className="text-sm">Any other questions or concerns</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-4">Need Immediate Assistance?</h2>
            <p className="text-black/80 mb-6">
              We&apos;re here to help! Reach out via email or phone for quick support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@slanup.com"
                className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-black/90 transition-all"
              >
                Send Email
              </a>
              <a
                href="tel:+917773861799"
                className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all"
              >
                Call Us
              </a>
            </div>
          </div>

        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 Slanup. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</a>
            <a href="/privacy-policy" className="hover:text-green-400 transition-colors">Privacy Policy</a>
            <a href="/refund-policy" className="hover:text-green-400 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
