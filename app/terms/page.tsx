"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GeneralTermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
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

            {/* 1. Acceptance */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By downloading, installing, or using the Slanup mobile application (&ldquo;the App&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App. Slanup is a social platform where users create and join real-world plans and meetups with nearby people.
              </p>
            </section>

            {/* 2. Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">2. Account Registration</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Authentication:</strong> Accounts are created using email-based OTP (one-time password) verification</li>
                <li><strong className="text-white">One Account Per Person:</strong> Each individual may only maintain one Slanup account. Creating multiple accounts is prohibited</li>
                <li><strong className="text-white">Accurate Information:</strong> You agree to provide accurate and truthful information during registration and to keep your profile information up to date</li>
                <li><strong className="text-white">Account Security:</strong> You are responsible for maintaining the security of your account and for all activity that occurs under your account</li>
                <li><strong className="text-white">Age Requirement:</strong> You must be at least 18 years old to create an account and use Slanup</li>
              </ul>
            </section>

            {/* 3. User Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">3. User Conduct</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                When using Slanup, you agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Harassment & Bullying:</strong> No harassment, intimidation, threats, or bullying of any kind toward other users</li>
                <li><strong className="text-white">Hate Speech:</strong> No content or behavior promoting hatred or discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or any other protected characteristic</li>
                <li><strong className="text-white">Illegal Activity:</strong> No use of the platform to plan, coordinate, or facilitate illegal activities</li>
                <li><strong className="text-white">Impersonation:</strong> No impersonating other individuals, organizations, or entities</li>
                <li><strong className="text-white">Spam & Solicitation:</strong> No unsolicited commercial messages, spam, or unauthorized advertising</li>
                <li><strong className="text-white">Harmful Content:</strong> No sharing of violent, sexually explicit, or otherwise harmful content</li>
                <li><strong className="text-white">False Information:</strong> No spreading of misinformation or creating misleading plans</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Please refer to our <Link href="/community-guidelines" className="text-green-400 hover:text-green-300 underline">Community Guidelines</Link> for detailed expectations on behavior.
              </p>
            </section>

            {/* 4. Content Ownership */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">4. Content Ownership</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Your Content:</strong> You retain ownership of all content you create and share on Slanup, including plans, messages, photos, and profile information</li>
                <li><strong className="text-white">License to Slanup:</strong> By posting content on Slanup, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content within the App and for promotional purposes related to the platform</li>
                <li><strong className="text-white">Content Removal:</strong> You may delete your content at any time. Upon account deletion, your content will be removed in accordance with our Privacy Policy</li>
                <li><strong className="text-white">Slanup IP:</strong> The Slanup name, logo, design, and all platform features are the intellectual property of Slanup and may not be used without permission</li>
              </ul>
            </section>

            {/* 5. Plan Creation & Participation */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">5. Plan Creation & Participation</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">User Responsibility:</strong> Users who create plans are responsible for providing accurate details about the plan (location, time, activity type)</li>
                <li><strong className="text-white">Safety Awareness:</strong> Users participate in plans and meetups at their own risk. You are responsible for your own safety when meeting other users in person</li>
                <li><strong className="text-white">Public Spaces:</strong> We strongly encourage all meetups to take place in public, well-lit spaces</li>
                <li><strong className="text-white">No Guarantees:</strong> Slanup does not verify the identity, background, or intentions of users. We do not guarantee that plans will proceed as described or that other users will behave appropriately</li>
              </ul>
            </section>

            {/* 6. Safety Features */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">6. Safety Features</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Slanup provides several safety features to help maintain a safe community:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Felt Safe Ratings:</strong> After meetups, users can submit &ldquo;felt safe&rdquo; ratings to help the community identify trustworthy members</li>
                <li><strong className="text-white">Flagging:</strong> Users can flag inappropriate content, plans, or behavior for review</li>
                <li><strong className="text-white">Reporting:</strong> Users can report other users who violate these terms or community guidelines</li>
                <li><strong className="text-white">Moderation:</strong> Our team reviews reports and takes appropriate action, which may include content removal, warnings, or account suspension</li>
              </ul>
            </section>

            {/* 7. Termination */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">7. Termination</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Slanup reserves the right to suspend or terminate your account at any time if you violate these Terms and Conditions, our Community Guidelines, or for any reason at our sole discretion.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Violations:</strong> Accounts may be suspended or permanently banned for violating these terms</li>
                <li><strong className="text-white">No Prior Notice:</strong> In cases of severe violations (e.g., threats, illegal activity, exploitation), accounts may be terminated immediately without prior notice</li>
                <li><strong className="text-white">User-Initiated:</strong> You may delete your account at any time through the app settings</li>
                <li><strong className="text-white">Effect of Termination:</strong> Upon termination, your right to use the App ceases immediately, and your data will be handled per our Privacy Policy</li>
              </ul>
            </section>

            {/* 8. Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">8. Disclaimer</h2>
              <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed">
                  Slanup is a platform that facilitates connections between users. <strong className="text-white">We do not guarantee the safety of any meetup, plan, or interaction that occurs through the App.</strong> Users meet and interact at their own risk. Slanup does not conduct background checks, verify identities, or screen users. We strongly encourage users to exercise caution, meet in public places, and inform a trusted person of their plans.
                </p>
              </div>
            </section>

            {/* 9. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To the maximum extent permitted by applicable law:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Slanup is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied</li>
                <li>Slanup shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the App</li>
                <li>Slanup is not responsible for the actions, content, or behavior of any user, whether online or offline</li>
                <li>Slanup does not guarantee uninterrupted or error-free access to the App</li>
                <li>Our total liability for any claim related to the App shall not exceed the amount you paid to Slanup, if any, in the 12 months preceding the claim</li>
              </ul>
            </section>

            {/* 10. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                Slanup reserves the right to modify these Terms and Conditions at any time. Changes will be posted on this page with an updated date. We may also notify you of significant changes through the app. Your continued use of Slanup after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            {/* 11. Contact */}
            <section>
              <h2 className="text-2xl font-bold text-green-400 mb-4">11. Contact Information</h2>
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
                By using Slanup, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>

          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; 2026 Slanup. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy-policy" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
            <Link href="/safety" className="hover:text-green-400 transition-colors">Safety Standards</Link>
            <Link href="/contact" className="hover:text-green-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
