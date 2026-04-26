"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import MarqueeRow from "@/components/MarqueeRow";
import WaitlistForm from "@/components/WaitlistForm";
import { SAMPLE_PLANS } from "@/lib/data";

export default function Home() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  // Split plans into 3 rows
  const plansPerRow = Math.ceil(SAMPLE_PLANS.length / 3);
  const row1 = SAMPLE_PLANS.slice(0, plansPerRow);
  const row2 = SAMPLE_PLANS.slice(plansPerRow, plansPerRow * 2);
  const row3 = SAMPLE_PLANS.slice(plansPerRow * 2);

  return (
    <div className="min-h-screen flex flex-col bg-white  text-neutral-800  relative overflow-x-hidden transition-colors">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-8 pb-12 md:pb-16 text-center relative w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-2xl md:text-3xl font-semibold text-neutral-700  mb-1 md:mb-2"
        >
          create/join nearby
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold my-3 md:my-4 text-[var(--brand-green)]"
        >
          plans
        </motion.h2>

        <div className="flex flex-col gap-3 my-5 w-full max-w-md">
          {/* Download row — App Store + Android Web App */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <motion.a
              href="https://apps.apple.com/in/app/slanup/id6761677380"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 bg-black hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-full text-sm md:text-base transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              <span>App Store</span>
            </motion.a>

            <motion.a
              href="/android"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="flex-1 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-6 rounded-full text-sm md:text-base transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341a1 1 0 110-2 1 1 0 010 2m-11.046 0a1 1 0 110-2 1 1 0 010 2m11.405-6.02l1.997-3.46a.416.416 0 00-.152-.567.416.416 0 00-.568.152l-2.022 3.503a12.582 12.582 0 00-10.273 0L5.842 5.446a.416.416 0 00-.568-.152.416.416 0 00-.152.567l1.998 3.461C3.69 11.158 1.342 14.572 1 18.5h22c-.342-3.928-2.69-7.342-6.118-9.179"/></svg>
              <span>Google Play</span>
            </motion.a>
          </div>

          {/* Full Moon Party CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="w-full"
          >
            <Link
              href="/full-moon-party"
              className="block w-full bg-black hover:bg-neutral-900 text-yellow-400 font-bold py-3 px-6 rounded-full text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg text-center tracking-wide"
            >
              🌕 Full Moon Party
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full mt-6 mb-8 md:mb-12"
        >
          <MarqueeRow plans={row1} direction="left" />
          <MarqueeRow plans={row2} direction="right" />
          <MarqueeRow plans={row3} direction="left" />
        </motion.div>
      </main>

      {/* Bottom gradient blur */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white  via-white/80  to-transparent pointer-events-none z-10"></div>

      {/* Footer */}
      <footer className="relative z-20 bg-white border-t border-neutral-200 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link
              href="/terms"
              className="text-neutral-600 hover:text-[var(--brand-green)] transition-colors text-sm font-medium"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy-policy"
              className="text-neutral-600 hover:text-[var(--brand-green)] transition-colors text-sm font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              href="/safety"
              className="text-neutral-600 hover:text-[var(--brand-green)] transition-colors text-sm font-medium"
            >
              Safety Standards
            </Link>
            <Link
              href="/community-guidelines"
              className="text-neutral-600 hover:text-[var(--brand-green)] transition-colors text-sm font-medium"
            >
              Community Guidelines
            </Link>
            <Link
              href="/contact"
              className="text-neutral-600 hover:text-[var(--brand-green)] transition-colors text-sm font-medium"
            >
              Contact Us
            </Link>
          </div>
          <p className="text-neutral-500 text-xs text-center">© 2026 Slanup. All rights reserved.</p>
          <p className="text-neutral-400 text-xs text-center mt-1">Squad Your Plans Up — Connect with real people nearby.</p>
        </div>
      </footer>

      <WaitlistForm
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
}
