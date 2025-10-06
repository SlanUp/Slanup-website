"use client";

import { motion } from 'framer-motion';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Refund & Cancellation Policy</h1>
          <p className="text-gray-400">Slanup Events & Services</p>
          <p className="text-gray-500 text-sm mt-2">Last Updated: October 2025</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 space-y-8">
            
            {/* Service Details */}
            <section className="bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">About This Policy</h2>
              <div className="text-gray-300 space-y-3">
                <p><strong className="text-white">Service Provider:</strong> Slanup</p>
                <p><strong className="text-white">Primary Business:</strong> Social Media Platform for Planning Activities with Nearby People</p>
                <p><strong className="text-white">Services Covered:</strong> All event ticketing, activity planning, and event organization services</p>
              </div>
            </section>

            {/* Refund Policy */}
            <section className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-red-400 mb-4">No Refund Policy</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-white">All ticket sales are final and non-refundable.</strong> Once a ticket is purchased, no refunds will be issued under any circumstances, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Change of mind or plans</li>
                <li>Inability to attend the event</li>
                <li>Personal emergencies</li>
                <li>Travel issues or delays</li>
                <li>Weather conditions</li>
                <li>Being denied entry due to not meeting event requirements (age, dress code, etc.)</li>
                <li>Being removed from the event due to misconduct or policy violations</li>
              </ul>
            </section>

            {/* Cancellation by Organizer */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Event Cancellation by Organizers</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                In the unlikely event that Slanup cancels or postpones the Event, the following applies:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Full Cancellation</h3>
                  <p className="text-gray-300">
                    If the Event is fully cancelled by organizers, <strong className="text-white">full refunds</strong> will be processed to all ticket holders within <strong className="text-white">7-14 business days</strong> to the original payment method.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Postponement/Rescheduling</h3>
                  <p className="text-gray-300">
                    If the Event is postponed or rescheduled, <strong className="text-white">tickets remain valid</strong> for the new date. Attendees will be notified via email of the new date and time. Refunds will not be issued for rescheduled events unless the attendee cannot attend the new date and requests a refund within 48 hours of the rescheduling announcement.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Force Majeure</h3>
                  <p className="text-gray-300">
                    Slanup is not liable for cancellations due to circumstances beyond our control, including but not limited to: natural disasters, government restrictions, venue unavailability, or public health emergencies. In such cases, refunds or rescheduling will be handled on a case-by-case basis.
                  </p>
                </div>
              </div>
            </section>

            {/* Non-Transferable */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Non-Transferable Tickets</h2>
              <p className="text-gray-300 leading-relaxed">
                Tickets are <strong className="text-white">non-transferable</strong> and <strong className="text-white">cannot be resold</strong>. Each ticket is valid only for the person whose name and email are registered at the time of purchase. Unauthorized resale or transfer of tickets is strictly prohibited and may result in ticket cancellation without refund.
              </p>
            </section>

            {/* Payment Issues */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Payment Issues & Failed Transactions</h2>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Payment Failure</h3>
                  <p className="text-gray-300">
                    If your payment fails during the transaction, <strong className="text-white">no charges will be applied</strong> to your account. You may retry the purchase using the same invite code within 10 minutes.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Double Charge / Duplicate Payment</h3>
                  <p className="text-gray-300">
                    If you are accidentally charged twice for the same booking, please contact us immediately at <a href="mailto:hello@slanup.com" className="text-amber-400 hover:text-amber-300 underline">hello@slanup.com</a> with your order ID and transaction details. We will investigate and process a refund for the duplicate charge within 7-14 business days.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Payment Debited but Ticket Not Received</h3>
                  <p className="text-gray-300">
                    If payment was successful but you did not receive your ticket email within 30 minutes, please check your spam/junk folder. If still not received, contact us at <a href="mailto:hello@slanup.com" className="text-amber-400 hover:text-amber-300 underline">hello@slanup.com</a> with your order ID. We will resend your ticket or process a refund if the booking was not created.
                  </p>
                </div>
              </div>
            </section>

            {/* Refund Processing */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Refund Processing Timeline</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                In cases where refunds are applicable (e.g., event cancellation, duplicate payment):
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Refund Initiation:</strong> Within 3-5 business days of approval</li>
                <li><strong className="text-white">Credit to Bank Account:</strong> 7-14 business days (depending on your bank)</li>
                <li><strong className="text-white">Refund Method:</strong> Original payment method used for purchase</li>
                <li><strong className="text-white">Refund Amount:</strong> Full ticket price including gateway fees</li>
              </ul>
            </section>

            {/* Chargebacks */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Chargebacks & Disputes</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you initiate a chargeback or payment dispute without first contacting us, your ticket will be immediately cancelled and you will be denied entry to the Event. We encourage you to reach out to us first at <a href="mailto:hello@slanup.com" className="text-amber-400 hover:text-amber-300 underline">hello@slanup.com</a> to resolve any issues.
              </p>
            </section>

            {/* Contact for Refund Requests */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Contact for Refund Requests</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For any refund-related queries or issues, please contact us:
              </p>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white mb-2"><strong>Email:</strong> <a href="mailto:hello@slanup.com" className="text-amber-400 hover:text-amber-300 underline">hello@slanup.com</a></p>
                <p className="text-white mb-2"><strong>Phone:</strong> +91 7773861799</p>
                <p className="text-white"><strong>Response Time:</strong> Within 24-48 hours</p>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                Please include your order ID, transaction ID, and a detailed description of your issue when contacting us.
              </p>
            </section>

            {/* Policy Changes */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                Slanup reserves the right to modify this Refund & Cancellation Policy at any time. Changes will be posted on this page and attendees will be notified via email. Your continued use of our services after changes are posted constitutes acceptance of the modified policy.
              </p>
            </section>

            {/* Acceptance */}
            <section className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-6">
              <p className="text-amber-200 font-semibold text-center">
                By purchasing a ticket, you acknowledge that you have read, understood, and agree to this Refund & Cancellation Policy.
              </p>
            </section>

          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 Slanup. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
