"use client";

import { motion } from 'framer-motion';
import { Mail, Shield, Wrench, Bug } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Link */}
        <Link href="/" className="text-green-400 hover:text-green-300 transition-colors text-sm mb-8 inline-block">&larr; Back to Home</Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-green-400 font-semibold tracking-wide mb-2">slanup&apos;</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-400">Get in touch with Slanup</p>
          <p className="text-gray-500 text-sm mt-2">We&apos;re here to help with app support, safety concerns, and general inquiries</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >

          {/* Contact Methods */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* General Inquiries */}
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
                  <h3 className="text-xl font-semibold text-white mb-2">General Inquiries</h3>
                  <a
                    href="mailto:hello@slanup.com"
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    hello@slanup.com
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    For general questions, feedback, partnerships, and business inquiries
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Safety Concerns */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-red-400/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-red-400/10 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Safety Concerns</h3>
                  <a
                    href="mailto:hello@slanup.com?subject=Safety%20Report"
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    hello@slanup.com
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    Subject: Safety Report — For reporting safety issues, harassment, or abuse. These are handled with highest priority.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* App Support */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-green-400/10 p-3 rounded-full">
                  <Wrench className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">App Support</h3>
                  <a
                    href="mailto:hello@slanup.com"
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    hello@slanup.com
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    For help with your account, plans, chat, notifications, or any app features
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bug Reports */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-green-400/10 p-3 rounded-full">
                  <Bug className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Bug Reports</h3>
                  <a
                    href="mailto:hello@slanup.com?subject=Bug%20Report"
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    hello@slanup.com
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    Subject: Bug Report — Found a bug? Let us know with details about what happened and your device info.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Response Time */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-green-400 mb-6">Response Times</h2>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">🚨 Safety Reports</h3>
                <p className="text-sm">Reviewed within 24 hours — highest priority</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">📱 App Support</h3>
                <p className="text-sm">Response within 24-48 hours</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">🐛 Bug Reports</h3>
                <p className="text-sm">Acknowledged within 48 hours</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">💬 General Inquiries</h3>
                <p className="text-sm">Response within 2-3 business days</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-4">Need Help?</h2>
            <p className="text-black/80 mb-6">
              Whether it&apos;s a question about the app, a safety concern, or a bug you&apos;ve found — we&apos;re here for you.
            </p>
            <a
              href="mailto:hello@slanup.com"
              className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-black/90 transition-all inline-block"
            >
              Send us an Email
            </a>
          </div>

        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; 2026 Slanup. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</Link>
            <Link href="/privacy-policy" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
            <Link href="/safety" className="hover:text-green-400 transition-colors">Safety Standards</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
