"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CommunityGuidelinesPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Guidelines</h1>
          <p className="text-gray-400">How we keep Slanup a great place for everyone</p>
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
            <section className="bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/30 rounded-xl p-6">
              <p className="text-gray-300 leading-relaxed">
                Slanup is a community where people create and join real-world plans and meetups with nearby people. These guidelines exist to ensure everyone has a positive, safe, and respectful experience. By using Slanup, you agree to follow these guidelines.
              </p>
            </section>

            {/* 1. Be Respectful */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. Be Respectful</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Treat every person on Slanup the way you&apos;d want to be treated. Remember that behind every profile is a real person.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Be kind and considerate in all interactions — in plan descriptions, chats, and in-person meetups</li>
                <li>Respect people&apos;s boundaries, preferences, and comfort levels</li>
                <li>Be open-minded and welcoming to people from different backgrounds and walks of life</li>
                <li>If someone declines a plan or leaves a group, respect their decision without pressure</li>
              </ul>
            </section>

            {/* 2. No Harassment */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. No Harassment or Bullying</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Harassment and bullying have no place on Slanup. This includes:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Repeated unwanted messages or contact after someone has asked you to stop</li>
                <li>Threats, intimidation, or aggressive behavior — online or in person</li>
                <li>Stalking or tracking someone&apos;s plans without their consent</li>
                <li>Sharing someone&apos;s personal information without permission (doxxing)</li>
                <li>Humiliating, mocking, or targeting individuals publicly or privately</li>
              </ul>
            </section>

            {/* 3. No Hate Speech */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. No Hate Speech or Discrimination</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Slanup is for everyone. We do not tolerate hate speech or discrimination of any kind:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>No content or behavior that promotes hatred or violence based on race, ethnicity, nationality, religion, gender, gender identity, sexual orientation, age, disability, or any other protected characteristic</li>
                <li>No slurs, derogatory language, or symbols associated with hate groups</li>
                <li>No creating plans that exclude people based on protected characteristics</li>
                <li>No promoting or glorifying extremist ideologies</li>
              </ul>
            </section>

            {/* 4. No Illegal Activity */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. No Illegal Activity</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Do not use Slanup to plan, organize, promote, or engage in illegal activities:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>No plans involving drug dealing, theft, vandalism, or any criminal activity</li>
                <li>No sharing or soliciting illegal substances</li>
                <li>No content that violates local, state, or national laws</li>
                <li>No facilitating activities that endanger public safety</li>
              </ul>
            </section>

            {/* 5. No Spam */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. No Spam or Commercial Solicitation</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Do not use Slanup to send unsolicited advertisements or promotional messages</li>
                <li>Do not create fake plans solely for the purpose of promoting a business, product, or service</li>
                <li>Do not send repetitive, identical, or irrelevant messages to users</li>
                <li>Do not use bots or automated tools to interact with the platform</li>
              </ul>
            </section>

            {/* 6. No Impersonation */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. No Impersonation</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Do not pretend to be someone you are not — use your real identity</li>
                <li>Do not create accounts impersonating other people, celebrities, organizations, or brands</li>
                <li>Do not use misleading profile photos or information to deceive other users</li>
                <li>Parody or fan accounts are not allowed on Slanup</li>
              </ul>
            </section>

            {/* 7. Safety First */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. Safety First</h2>
              <div className="bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/30 rounded-xl p-6 mb-4">
                <p className="text-green-200 font-semibold">
                  Your safety is your top priority. Slanup connects you with real people for real-world meetups — always take precautions.
                </p>
              </div>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Meet in Public:</strong> Always choose public, well-lit, and populated locations for meetups — especially for the first time</li>
                <li><strong className="text-white">Tell Someone:</strong> Let a trusted friend or family member know where you&apos;re going, who you&apos;re meeting, and when you expect to return</li>
                <li><strong className="text-white">Trust Your Instincts:</strong> If something doesn&apos;t feel right, leave. You are never obligated to stay</li>
                <li><strong className="text-white">Stay Sober:</strong> Be cautious about consuming substances when meeting new people</li>
                <li><strong className="text-white">Arrange Your Own Transport:</strong> Have your own way to get to and from the meetup</li>
                <li><strong className="text-white">Use the App&apos;s Safety Features:</strong> Submit felt-safe ratings, flag suspicious behavior, and report concerns</li>
              </ul>
            </section>

            {/* 8. Reporting */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8. Reporting Violations</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you see behavior that violates these guidelines, please report it:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">In-App:</strong> Use the flag/report button available on profiles, plans, and messages</li>
                <li><strong className="text-white">Email:</strong> Send a detailed report to <a href="mailto:hello@slanup.com?subject=Guideline%20Violation%20Report" className="text-green-400 hover:text-green-300 underline">hello@slanup.com</a></li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                All reports are reviewed by our team. Reports are confidential — we will not reveal your identity to the reported user. False or malicious reporting is itself a violation of these guidelines.
              </p>
            </section>

            {/* 9. Consequences */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">9. Consequences of Violations</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Violations of these guidelines may result in the following actions, depending on severity:
              </p>
              <div className="space-y-4">
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-2">⚠️ Warning</h3>
                  <p className="text-gray-300">
                    For first-time or minor violations, you may receive a warning with an explanation of the rule you violated. Repeated warnings will lead to further action.
                  </p>
                </div>

                <div className="bg-orange-400/10 border border-orange-400/30 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-orange-400 mb-2">⏸️ Temporary Suspension</h3>
                  <p className="text-gray-300">
                    For repeated or moderate violations, your account may be temporarily suspended. During suspension, you will not be able to access the app, create or join plans, or message other users.
                  </p>
                </div>

                <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4">
                  <h3 className="text-xl font-semibold text-red-400 mb-2">🚫 Permanent Ban</h3>
                  <p className="text-gray-300">
                    For severe violations — including but not limited to threats, exploitation, CSAE, illegal activity, or repeated violations after warnings — your account will be permanently banned. Banned users may not create new accounts.
                  </p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                Slanup reserves the right to take any action it deems appropriate, including immediate termination without prior warning, depending on the nature and severity of the violation.
              </p>
            </section>

            {/* Closing */}
            <section className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
              <p className="text-green-200 font-semibold text-center">
                By using Slanup, you agree to follow these Community Guidelines. Together, we can build a community where everyone feels welcome, respected, and safe. Thank you for being part of Slanup.
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
