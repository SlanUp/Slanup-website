"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GeneralTermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
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
            
            {/* Service Provider & Details */}
            <section className="bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">About Slanup</h2>
              <div className="space-y-3 text-gray-300">
                <p><strong className="text-white">Service Provider:</strong> Slanup</p>
                <p><strong className="text-white">Primary Business:</strong> Social Media Platform for Planning Activities with Nearby People</p>
                <p><strong className="text-white">Services Offered:</strong> Social networking, event discovery, event ticketing, and activity planning</p>
                <p><strong className="text-white">Business Category:</strong> Technology Platform & Event Management</p>
              </div>
            </section>

            {/* 1. Acceptance */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing or using Slanup&apos;s platform, purchasing tickets to our events, or attending any event organized by Slanup, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services or attend our events.
              </p>
            </section>

            {/* 2. Services Provided */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. Services Provided</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                Slanup provides the following services:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Platform:</strong> Social media platform for discovering and planning activities with nearby people</li>
                <li><strong className="text-white">Event Organization:</strong> Organizing and hosting various events (parties, gatherings, activities)</li>
                <li><strong className="text-white">Ticketing:</strong> Online ticket sales and booking management for events</li>
                <li><strong className="text-white">Community:</strong> Connecting people with similar interests for shared activities</li>
              </ul>
            </section>

            {/* 3. Event-Specific Terms */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. Event-Specific Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                Each event organized by Slanup may have its own specific terms and conditions, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Age restrictions</li>
                <li>Dress code requirements</li>
                <li>Entry requirements and timing</li>
                <li>Specific rules and policies</li>
                <li>What&apos;s included in the ticket price</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong className="text-white">You must read and agree to event-specific terms</strong> when purchasing tickets. Event-specific terms take precedence over these general terms for that particular event.
              </p>
            </section>

            {/* 4. Tickets & Bookings */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. Tickets & Bookings</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Ticket Validity:</strong> Tickets are valid only for the specific event, date, and time mentioned</li>
                <li><strong className="text-white">Non-Transferable:</strong> Unless stated otherwise, tickets are non-transferable</li>
                <li><strong className="text-white">Entry Requirements:</strong> Valid ticket (QR code) and government-issued ID required for entry</li>
                <li><strong className="text-white">No Resale:</strong> Unauthorized resale or transfer of tickets is prohibited</li>
                <li><strong className="text-white">Pricing:</strong> All prices are inclusive of applicable taxes and payment gateway fees unless stated otherwise</li>
              </ul>
            </section>

            {/* 5. Payment */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. Payment</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Payment Gateway:</strong> We use third-party payment gateways (e.g., Cashfree) for processing payments</li>
                <li><strong className="text-white">Gateway Fees:</strong> Payment gateway fees are typically added to the ticket price and clearly displayed before checkout</li>
                <li><strong className="text-white">Secure Transactions:</strong> All payment information is encrypted and processed securely</li>
                <li><strong className="text-white">Payment Confirmation:</strong> You will receive a confirmation email upon successful payment</li>
              </ul>
            </section>

            {/* 6. Refunds & Cancellations */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. Refunds & Cancellations</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our refund policy varies by event. Please refer to our <Link href="/refund-policy" className="text-green-400 hover:text-green-300 underline">Refund & Cancellation Policy</Link> page and the specific event&apos;s refund terms for details.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Generally, tickets are non-refundable unless the event is cancelled by Slanup.
              </p>
            </section>

            {/* 7. User Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. User Conduct</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                When using our platform or attending our events, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Respect:</strong> Treat all users, attendees, and staff with respect</li>
                <li><strong className="text-white">No Harassment:</strong> No harassment, discrimination, or hate speech of any kind</li>
                <li><strong className="text-white">Safety:</strong> Follow all safety guidelines and venue rules</li>
                <li><strong className="text-white">Legal Compliance:</strong> Comply with all applicable laws and regulations</li>
                <li><strong className="text-white">Prohibited Activities:</strong> No violence, illegal activities, or disruptive behavior</li>
              </ul>
            </section>

            {/* 8. Privacy & Data */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8. Privacy & Data Protection</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Personal information is used for providing services and communication</li>
                <li>We do not sell your data to third parties</li>
                <li>Payment information is processed by secure third-party payment gateways</li>
                <li>Photos/videos from events may be used for marketing purposes</li>
                <li>You can request removal from marketing materials by contacting us</li>
              </ul>
            </section>

            {/* 8.5. Camera & Recording Consent */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8.5. Camera & Recording Consent</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-white">By purchasing tickets to any Slanup event, you explicitly consent to being photographed, videotaped, and recorded during the event for promotional purposes.</strong>
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Consent to Recording:</strong> By purchasing a ticket, you consent to being recorded (photography, video, audio) during the event. This content will be used for promotional purposes by Slanup.</li>
                <li><strong className="text-white">Public Sharing:</strong> After posting, recorded content will be shared publicly on social media, our website, and other marketing channels. This content will be accessible to everyone.</li>
                <li><strong className="text-white">Removal Requests:</strong> You may request removal of content featuring you, but such requests must be made within <strong className="text-white">3 hours</strong> of the content being posted. Requests made after 3 hours may not be honored.</li>
                <li><strong className="text-white">Content Preferences:</strong> If you do not wish to appear in certain types of content (e.g., images showing drinking, or any activity you&apos;re not comfortable with), please inform our photographers/videographers at the event by flagging your name or speaking with event staff at the time of recording.</li>
                <li><strong className="text-white">No Guarantee:</strong> While we will make reasonable efforts to honor your preferences, we cannot guarantee that you will not appear in any recordings.</li>
                <li><strong className="text-white">No Compensation:</strong> You will not receive any compensation for the use of your likeness in promotional materials.</li>
              </ul>
            </section>

            {/* 9. Liability */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">9. Liability & Disclaimers</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Assumption of Risk:</strong> You attend events at your own risk</li>
                <li><strong className="text-white">Personal Belongings:</strong> We are not responsible for lost, stolen, or damaged personal property</li>
                <li><strong className="text-white">Platform Availability:</strong> We do not guarantee uninterrupted access to our platform</li>
                <li><strong className="text-white">Third-Party Services:</strong> We are not liable for third-party services (venues, payment gateways, etc.)</li>
              </ul>
            </section>

            {/* 10. Right to Refuse Service */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">10. Right to Refuse Service</h2>
              <p className="text-gray-300 leading-relaxed">
                Slanup reserves the right to refuse service, deny entry to events, or remove any user from the platform or events without providing a reason. No refunds will be issued in such cases.
              </p>
            </section>

            {/* 11. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                Slanup reserves the right to modify these Terms and Conditions at any time. Changes will be posted on this page. Your continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            {/* 12. Contact */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">12. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white mb-2"><strong>Email:</strong> <a href="mailto:hello@slanup.com" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a></p>
                <p className="text-white"><strong>Website:</strong> <a href="https://slanup.com" className="text-green-400 hover:text-green-300 underline">slanup.com</a></p>
              </div>
            </section>

            {/* Agreement */}
            <section className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
              <p className="text-green-200 font-semibold text-center">
                By using Slanup&apos;s services or attending our events, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>

          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 Slanup. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/refund-policy" className="hover:text-green-400 transition-colors">Refund Policy</Link>
            <Link href="/contact" className="hover:text-green-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
