"use client";

import { motion } from 'framer-motion';

export default function TermsPage() {
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
          <p className="text-gray-400">Slanup&apos;s BYOB Diwali Party 2025</p>
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
            
            {/* 1. Acceptance */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By purchasing a ticket and attending Slanup&apos;s BYOB Diwali Party 2025 (&quot;the Event&quot;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not purchase a ticket or attend the Event.
              </p>
            </section>

            {/* 2. Age Restriction */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">2. Age Restriction</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                This is a <strong className="text-white">21+ event</strong>. All attendees must be at least 21 years of age on the date of the Event.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Valid government-issued photo ID is mandatory for entry</li>
                <li>No entry will be granted without proper identification</li>
                <li>No refunds will be issued for being denied entry due to age</li>
              </ul>
            </section>

            {/* 3. Tickets */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">3. Tickets & Entry</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Invite-Only:</strong> Valid invite code required for ticket purchase</li>
                <li><strong className="text-white">Non-Transferable:</strong> Tickets are non-transferable and non-refundable</li>
                <li><strong className="text-white">Entry Requirement:</strong> Present your QR code ticket and valid ID at the venue</li>
                <li><strong className="text-white">No Resale:</strong> Unauthorized resale or transfer of tickets is prohibited</li>
                <li><strong className="text-white">Lost Tickets:</strong> Keep your ticket email safe; replacements not guaranteed</li>
              </ul>
            </section>

            {/* 4. BYOB Policy */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">4. BYOB (Bring Your Own Booze) Policy</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                Attendees are permitted to bring their own alcoholic beverages, subject to the following:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>All beverages must comply with local laws and venue regulations</li>
                <li>Mixers, ice, and soft drinks will be provided by the organizers</li>
                <li>Responsible consumption is mandatory; excessive intoxication may result in removal</li>
                <li>Outside food is not permitted unless specified by organizers</li>
              </ul>
            </section>

            {/* 5. Behavior & Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">5. Behavior & Conduct</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                All attendees must adhere to the following code of conduct:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Respect:</strong> Treat all attendees, staff, and venue property with respect</li>
                <li><strong className="text-white">No Violence:</strong> Physical altercations or aggressive behavior will result in immediate removal</li>
                <li><strong className="text-white">No Harassment:</strong> Any form of harassment (verbal, physical, or sexual) is strictly prohibited</li>
                <li><strong className="text-white">Dress Code:</strong> Classy traditionals; organizers reserve the right to deny entry for inappropriate clothing</li>
                <li><strong className="text-white">Photography:</strong> By attending, you consent to being photographed/recorded for promotional purposes</li>
              </ul>
            </section>

            {/* 6. Safety & Liability */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">6. Safety & Liability</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Assumption of Risk:</strong> You attend at your own risk and release Slanup and its organizers from all liability</li>
                <li><strong className="text-white">Personal Belongings:</strong> We are not responsible for lost, stolen, or damaged personal property</li>
                <li><strong className="text-white">Medical:</strong> Inform staff immediately if you require medical assistance</li>
                <li><strong className="text-white">Emergency:</strong> Follow all emergency procedures and staff instructions</li>
                <li><strong className="text-white">Intoxication:</strong> Overly intoxicated individuals may be denied entry or asked to leave</li>
              </ul>
            </section>

            {/* 7. Food & Beverages */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">7. Food & Beverages Provided</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Unlimited food and non-alcoholic beverages included in ticket price</li>
                <li>Menu is subject to change based on availability</li>
                <li>Special dietary requirements: Contact organizers in advance (no guarantees)</li>
                <li>Outside food is not permitted except for medical/dietary reasons (with prior approval)</li>
              </ul>
            </section>

            {/* 8. Cancellation & Refunds */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">8. Cancellation & Refunds</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">No Refunds:</strong> All ticket sales are final and non-refundable</li>
                <li><strong className="text-white">Event Cancellation:</strong> If the Event is cancelled by organizers, full refunds will be issued</li>
                <li><strong className="text-white">Rescheduling:</strong> Tickets remain valid for rescheduled dates</li>
                <li><strong className="text-white">Force Majeure:</strong> Organizers not liable for cancellation due to circumstances beyond control</li>
                <li><strong className="text-white">Partial Attendance:</strong> No refunds for early departure or partial attendance</li>
              </ul>
            </section>

            {/* 9. Entry & Removal */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">9. Right of Entry & Removal</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                Slanup and venue staff reserve the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Refuse entry to anyone without providing a reason</li>
                <li>Remove any attendee for violating these terms</li>
                <li>Remove anyone deemed a safety risk or disturbance</li>
                <li>Conduct security checks and searches as necessary</li>
                <li>Confiscate prohibited items</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong className="text-white">No refunds will be issued</strong> for denied entry or removal from the Event.
              </p>
            </section>

            {/* 10. Privacy & Data */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">10. Privacy & Data Protection</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Your personal information will be used solely for Event purposes</li>
                <li>We will not share your data with third parties (except payment processor)</li>
                <li>Photos/videos from the Event may be used for marketing purposes</li>
                <li>You may request removal from photos by contacting us</li>
              </ul>
            </section>

            {/* 11. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                Slanup reserves the right to modify these Terms and Conditions at any time. Changes will be posted on this page and attendees will be notified via email. Continued participation in the Event after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            {/* 12. Prohibited Items */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">12. Prohibited Items</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                The following items are strictly prohibited:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Weapons of any kind</li>
                <li>Illegal drugs or substances</li>
                <li>Outside food (unless pre-approved)</li>
                <li>Professional recording equipment (without permission)</li>
                <li>Fireworks or explosives</li>
                <li>Laser pointers or disruptive devices</li>
              </ul>
            </section>

            {/* 13. Contact */}
            <section>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">13. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                For questions about these Terms and Conditions or the Event, please contact us at:
              </p>
              <div className="bg-white/5 rounded-xl p-4 mt-4">
                <p className="text-white"><strong>Email:</strong> hello@slanup.com</p>
                <p className="text-white"><strong>Event Date:</strong> October 18, 2025</p>
                <p className="text-white"><strong>Organizer:</strong> Slanup</p>
              </div>
            </section>

            {/* Agreement */}
            <section className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-6">
              <p className="text-amber-200 font-semibold text-center">
                By purchasing a ticket, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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
