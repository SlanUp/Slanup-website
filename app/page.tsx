"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen flex flex-col bg-white text-neutral-800 relative overflow-x-hidden">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-8 pb-12 md:pb-16 text-center relative w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-2xl md:text-3xl font-semibold text-neutral-700 mb-1 md:mb-2"
        >
          explore nearby
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold my-3 md:my-4 text-[var(--brand-green)]"
        >
          plans
        </motion.h2>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          onClick={() => setIsWaitlistOpen(true)}
          className="my-5 bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-8 md:px-10 rounded-full text-base md:text-lg transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:ring-opacity-50"
        >
          join the waitlist
        </motion.button>

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
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10"></div>

      <WaitlistForm
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
}
