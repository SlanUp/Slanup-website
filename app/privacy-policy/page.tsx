"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Slanup App</p>
          <p className="text-gray-500 text-sm mt-2">Last Updated: April 2026</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 space-y-8">

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to Slanup — a social platform where users create and join real-world plans and meetups with nearby people. We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use the Slanup mobile application and related services.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                By creating an account or using Slanup, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Data We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. Data We Collect</h2>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Account Information</h3>
                  <p className="text-gray-300 mb-2">When you create an account, we collect:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Name</li>
                    <li>Email address (used for OTP-based authentication)</li>
                    <li>Profile photos you upload</li>
                    <li>Bio and other profile details you choose to provide</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">App Usage Data</h3>
                  <p className="text-gray-300 mb-2">As you use the app, we collect:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Chat messages exchanged within plan groups</li>
                    <li>Plans you create, join, or interact with</li>
                    <li>Felt-safe ratings and feedback you submit after meetups</li>
                    <li>Reports and flags you submit</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Location Data</h3>
                  <p className="text-gray-300">
                    We collect your city-level location to show you nearby plans and relevant content. We do not continuously track your precise GPS location in the background.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Device Information</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Push notification tokens (for delivering notifications)</li>
                    <li>Device type and operating system</li>
                    <li>App version</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Data */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. How We Use Your Data</h2>
              <p className="text-gray-300 leading-relaxed mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Account Creation & Authentication:</strong> To create and manage your account using email-based OTP verification</li>
                <li><strong className="text-white">App Functionality:</strong> To display nearby plans, enable chat within plan groups, and facilitate meetup coordination</li>
                <li><strong className="text-white">Notifications:</strong> To send push notifications about plan updates, new messages, and relevant activity</li>
                <li><strong className="text-white">Safety & Moderation:</strong> To review reports, enforce community guidelines, and maintain a safe environment</li>
                <li><strong className="text-white">Platform Improvement:</strong> To analyze usage patterns and improve the app experience</li>
                <li><strong className="text-white">Communication:</strong> To send important service-related updates and announcements</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. Data Sharing</h2>
              <div className="bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/30 rounded-xl p-6 mb-4">
                <p className="text-green-200 font-semibold">We do not sell your personal data to third parties. Period.</p>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">We may share limited data only in the following circumstances:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Safety & Legal Compliance:</strong> When required by law, legal process, or to protect the safety of our users and the public</li>
                <li><strong className="text-white">Law Enforcement:</strong> In response to valid legal requests from law enforcement authorities</li>
                <li><strong className="text-white">Service Providers:</strong> With trusted service providers who help operate the app (e.g., cloud hosting, push notification services), under strict data protection agreements</li>
                <li><strong className="text-white">User-Initiated Sharing:</strong> Your profile name, photo, and plan activity are visible to other Slanup users as part of the app&apos;s core functionality</li>
              </ul>
            </section>

            {/* Data Retention & Deletion */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. Data Retention & Deletion</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We retain your personal data for as long as your account is active or as needed to provide you with our services.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Account Deletion:</strong> You can delete your account at any time through the app settings. Upon deletion, we will remove your personal data, profile information, and associated content within 30 days.</li>
                <li><strong className="text-white">Retained Data:</strong> Some data may be retained for longer periods where required by law or for legitimate safety purposes (e.g., records of reported safety violations).</li>
                <li><strong className="text-white">Chat Messages:</strong> When you delete your account, your messages in plan group chats will be removed.</li>
              </ul>
            </section>

            {/* Cookies & Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. Cookies & Tracking</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Slanup uses minimal tracking. We do not use third-party advertising trackers or sell data to ad networks.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>We may use basic analytics to understand app usage and improve performance</li>
                <li>Our website (slanup.com) may use essential cookies for functionality purposes only</li>
                <li>We do not engage in cross-app tracking or behavioral advertising</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. Children&apos;s Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Slanup is not intended for use by anyone under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected data from a child under 13, we will take immediate steps to delete that information. If you believe a child under 13 is using Slanup, please contact us at <a href="mailto:hello@slanup.com" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a>.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-white">Deletion:</strong> Delete your account and associated data through the app</li>
                <li><strong className="text-white">Opt-Out:</strong> Disable push notifications through your device settings</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:hello@slanup.com" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a>.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. We may also notify you of significant changes through the app. Continued use of Slanup after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">10. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For questions about this Privacy Policy or to exercise your data rights, please contact us:
              </p>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white mb-2"><strong>Email:</strong> <a href="mailto:hello@slanup.com" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a></p>
                <p className="text-white"><strong>Website:</strong> <a href="https://slanup.com" className="text-green-400 hover:text-green-300 underline">slanup.com</a></p>
              </div>
            </section>

            {/* Consent */}
            <section className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
              <p className="text-green-200 font-semibold text-center">
                By using Slanup, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and processing of your personal information as described herein.
              </p>
            </section>

          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; 2026 Slanup. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</Link>
            <Link href="/safety" className="hover:text-green-400 transition-colors">Safety Standards</Link>
            <Link href="/contact" className="hover:text-green-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
