"use client";

import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Slanup - Operated by BINDU DUBEY</p>
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
            
            {/* Business Information */}
            <section className="bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Business Information</h2>
              <div className="space-y-3 text-gray-300">
                <p><strong className="text-white">Business Name:</strong> Slanup</p>
                <p><strong className="text-white">Legal Name:</strong> BINDU DUBEY</p>
                <p><strong className="text-white">Service Type:</strong> Social Media Platform for Planning Activities with Nearby People</p>
                <p><strong className="text-white">Location:</strong> Jabalpur, Madhya Pradesh, India</p>
                <p><strong className="text-white">Contact:</strong> hello@slanup.com | +91 7773861799</p>
              </div>
            </section>

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to Slanup, operated by <strong className="text-white">BINDU DUBEY</strong>. We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform and services.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                By using Slanup, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. Information We Collect</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Personal Information</h3>
                  <p className="text-gray-300 mb-2">When you use our services, we may collect:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Payment information (processed securely by third-party payment gateways)</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Event & Activity Information</h3>
                  <p className="text-gray-300 mb-2">When you book tickets or participate in activities:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Event registrations and bookings</li>
                    <li>Invite codes used</li>
                    <li>Ticket purchase history</li>
                    <li>Event participation records</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Usage Information</h3>
                  <p className="text-gray-300 mb-2">We automatically collect:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Device information (browser type, operating system)</li>
                    <li>IP address and location data</li>
                    <li>Usage patterns and preferences</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Service Delivery:</strong> To process bookings, send tickets, and provide customer support</li>
                <li><strong className="text-white">Communication:</strong> To send confirmation emails, event updates, and important notifications</li>
                <li><strong className="text-white">Payment Processing:</strong> To process payments securely through third-party payment gateways (e.g., Cashfree)</li>
                <li><strong className="text-white">Platform Improvement:</strong> To analyze usage patterns and improve our services</li>
                <li><strong className="text-white">Marketing:</strong> To send promotional content about events (with your consent, you can opt-out anytime)</li>
                <li><strong className="text-white">Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            {/* Data Storage & Security */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. Data Storage & Security</h2>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">How We Store Your Data</h3>
                  <p className="text-gray-300">
                    Your data is stored securely in encrypted databases hosted on Vercel (cloud infrastructure). We use industry-standard security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Security Measures</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Secure database with access controls</li>
                    <li>Regular security audits and updates</li>
                    <li>Payment information handled by PCI-DSS compliant payment processors</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Data Retention</h3>
                  <p className="text-gray-300">
                    We retain your personal information for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. Event booking data is retained for record-keeping and tax compliance purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">We use the following third-party services:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Payment Gateway:</strong> Cashfree Payments - for secure payment processing</li>
                <li><strong className="text-white">Email Service:</strong> Resend - for sending tickets and notifications</li>
                <li><strong className="text-white">Hosting:</strong> Vercel - for website and database hosting</li>
                <li><strong className="text-white">Data Storage:</strong> Google Sheets - for event management (limited to necessary booking info)</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                These third parties have their own privacy policies. We do not sell or share your personal information with third parties for their marketing purposes.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. Your Rights & Choices</h2>
              <p className="text-gray-300 leading-relaxed mb-4">You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                <li><strong className="text-white">Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong className="text-white">Data Portability:</strong> Request your data in a portable format</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:hello@slanup.com" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a>
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. Cookies & Tracking</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small files stored on your device that help us:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Improve our services and user experience</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                You can control cookie settings through your browser. However, disabling cookies may affect the functionality of our platform.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our services are not intended for individuals under the age of 18 (or 21 for certain events). We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it immediately.
              </p>
            </section>

            {/* Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">9. Data Protection & Compliance</h2>
              <p className="text-gray-300 leading-relaxed">
                We comply with applicable data protection laws and regulations in India. We implement appropriate technical and organizational measures to ensure data security and protect your rights.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. We encourage you to review this policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">11. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For questions about this Privacy Policy or to exercise your rights, please contact us:
              </p>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white mb-2"><strong>Business Name:</strong> Slanup</p>
                <p className="text-white mb-2"><strong>Legal Name:</strong> BINDU DUBEY</p>
                <p className="text-white mb-2"><strong>Email:</strong> <a href="mailto:hello@slanup.com" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a></p>
                <p className="text-white mb-2"><strong>Phone:</strong> +91 7773861799</p>
                <p className="text-white"><strong>Location:</strong> Jabalpur, Madhya Pradesh, India</p>
              </div>
            </section>

            {/* Consent */}
            <section className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
              <p className="text-green-200 font-semibold text-center">
                By using Slanup&apos;s services, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and processing of your personal information as described herein.
              </p>
            </section>

          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 Slanup (BINDU DUBEY). All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</a>
            <a href="/refund-policy" className="hover:text-green-400 transition-colors">Refund Policy</a>
            <a href="/contact" className="hover:text-green-400 transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
}
