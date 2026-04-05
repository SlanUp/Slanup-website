"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SafetyStandardsPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Safety Standards</h1>
          <p className="text-gray-400">Child Safety & User Protection Policy</p>
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

            {/* Our Commitment */}
            <section className="bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Our Commitment to Safety</h2>
              <p className="text-gray-300 leading-relaxed">
                Slanup is committed to creating a safe environment for all users. As a social platform where people create and join real-world plans and meetups, we take the safety and well-being of our community extremely seriously. We have zero tolerance for any form of abuse, exploitation, or harmful behavior on our platform.
              </p>
            </section>

            {/* Zero Tolerance for CSAE */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. Zero Tolerance for Child Sexual Abuse & Exploitation (CSAE)</h2>
              <div className="bg-gradient-to-r from-red-400/10 to-red-600/10 border border-red-400/30 rounded-xl p-6 mb-4">
                <p className="text-red-200 font-semibold">
                  Slanup maintains an absolute zero-tolerance policy for child sexual abuse and exploitation (CSAE) in any form. This includes but is not limited to:
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Any content that depicts, promotes, or glorifies child sexual abuse or exploitation</li>
                <li>Sharing, distributing, or soliciting child sexual abuse material (CSAM)</li>
                <li>Using the platform to groom, exploit, or endanger minors in any way</li>
                <li>Any attempt to contact or engage with minors for inappropriate purposes</li>
                <li>Sexualized content involving minors of any kind</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Any account found to be involved in CSAE will be <strong className="text-white">immediately and permanently terminated</strong>, and the incident will be reported to the relevant law enforcement authorities and the National Center for Missing &amp; Exploited Children (NCMEC) or equivalent local agencies.
              </p>
            </section>

            {/* Detection & Reporting */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. How We Detect & Report</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We employ multiple layers of detection and review to identify and address safety violations:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">User Reports:</strong> Any user can report concerning content, behavior, or profiles directly through the app</li>
                <li><strong className="text-white">Content Moderation:</strong> Our moderation team reviews flagged content and accounts to assess violations</li>
                <li><strong className="text-white">Flagging System:</strong> Users can flag plans, messages, and profiles that appear suspicious or harmful</li>
                <li><strong className="text-white">Profile Review:</strong> We review reported profiles and may proactively identify suspicious activity patterns</li>
                <li><strong className="text-white">Rapid Response:</strong> Safety reports are treated with the highest priority and reviewed as quickly as possible</li>
              </ul>
            </section>

            {/* Reporting Mechanisms */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. Reporting Mechanisms</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We provide multiple ways for users and the public to report safety concerns:
              </p>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">In-App Reporting</h3>
                  <p className="text-gray-300">
                    Every user profile, plan, and chat message includes a flag/report option. Tap the flag icon or &ldquo;Report&rdquo; button to submit a report directly from the app. Reports are reviewed by our safety team.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Email Reporting</h3>
                  <p className="text-gray-300">
                    You can report safety concerns via email at <a href="mailto:hello@slanup.com?subject=Safety%20Report" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a> with the subject line &ldquo;Safety Report&rdquo;. Please include as much detail as possible, including usernames, screenshots, and a description of the concern.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Anonymous Reporting</h3>
                  <p className="text-gray-300">
                    All reports can be submitted anonymously. We do not disclose the identity of the reporting user to the reported party.
                  </p>
                </div>
              </div>
            </section>

            {/* Law Enforcement */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. Cooperation with Law Enforcement</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Slanup fully cooperates with law enforcement agencies in investigations related to user safety:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>We respond promptly to valid legal requests and subpoenas from law enforcement</li>
                <li>We proactively report CSAE material and suspected child exploitation to NCMEC and relevant authorities</li>
                <li>We preserve account data and evidence when required for ongoing investigations</li>
                <li>We cooperate with local, national, and international law enforcement agencies as required by law</li>
              </ul>
            </section>

            {/* Age Restrictions */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. Age Restrictions</h2>
              <div className="bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/30 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-white">Slanup is strictly for users aged 18 and above.</strong> We do not allow anyone under the age of 18 to create an account or use the platform. Since Slanup facilitates real-world meetups between users, this age restriction is critical for user safety.
                </p>
                <p className="text-gray-300 leading-relaxed mt-4">
                  If we discover that a user under 18 has created an account, we will immediately terminate the account and delete all associated data. If you believe an underage user is on the platform, please report it immediately.
                </p>
              </div>
            </section>

            {/* User Safety Tips */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. Safety Tips for Users</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Always meet in public, well-lit places for your first meetups</li>
                <li>Tell a trusted friend or family member where you are going and who you are meeting</li>
                <li>Trust your instincts — if something feels off, leave the situation</li>
                <li>Use the in-app flagging and reporting features if you encounter concerning behavior</li>
                <li>Do not share personal information (home address, financial details) with people you&apos;ve just met</li>
                <li>Submit &ldquo;felt safe&rdquo; ratings after meetups to help the community</li>
              </ul>
            </section>

            {/* Contact for Safety */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. Contact for Safety Concerns</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have any safety concerns or need to report a violation, please contact us immediately:
              </p>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white mb-2"><strong>Email:</strong> <a href="mailto:hello@slanup.com?subject=Safety%20Report" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a> (Subject: Safety Report)</p>
                <p className="text-white mb-2"><strong>In-App:</strong> Use the flag/report button on any profile, plan, or message</p>
                <p className="text-white"><strong>Website:</strong> <a href="https://slanup.com/contact" className="text-green-400 hover:text-green-300 underline">slanup.com/contact</a></p>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                Safety reports are handled with the highest priority. If you believe someone is in immediate danger, please contact your local emergency services first.
              </p>
            </section>

            {/* Commitment */}
            <section className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
              <p className="text-green-200 font-semibold text-center">
                Slanup is committed to maintaining the highest standards of safety. We continuously review and update our safety practices to protect our community. Together, we can keep Slanup a safe place for everyone.
              </p>
            </section>

          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; 2026 Slanup. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</Link>
            <Link href="/community-guidelines" className="hover:text-green-400 transition-colors">Community Guidelines</Link>
            <Link href="/contact" className="hover:text-green-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
