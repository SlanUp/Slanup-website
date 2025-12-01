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

        <div className="flex flex-col gap-4 my-5">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            onClick={() => setIsWaitlistOpen(true)}
            className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-8 md:px-10 rounded-full text-base md:text-lg transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:ring-opacity-50"
          >
            join the waitlist
          </motion.button>
          
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            href="/mafia-soiree"
            className="bg-gradient-to-r from-red-700 via-rose-800 to-red-900 hover:from-red-800 hover:via-rose-900 hover:to-red-950 text-white font-semibold py-3 px-8 md:px-10 rounded-full text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            🎩 Slanup&apos;s Mafia Soiree
          </motion.a>
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
              href="/refund-policy"
              className="text-neutral-600 hover:text-[var(--brand-green)] transition-colors text-sm font-medium"
            >
              Refund Policy
            </Link>
            <Link
              href="/contact"
              className="text-neutral-600 hover:text-[var(--brand-green)] transition-colors text-sm font-medium"
            >
              Contact Us
            </Link>
          </div>
          <p className="text-neutral-500 text-xs text-center">© 2025 Slanup. All rights reserved.</p>
          <p className="text-neutral-400 text-xs text-center mt-1">Social Media Platform for Planning Activities with Nearby People</p>
        </div>
      </footer>

      <WaitlistForm
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
}
