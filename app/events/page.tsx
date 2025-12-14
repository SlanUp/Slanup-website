"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import EventCard, { Event } from "@/components/EventCard";

// All events (ordered by date - latest first)
const ALL_EVENTS: Event[] = [
  {
    id: 'mafia-soiree',
    name: "Slanup's Mafia Soireé",
    eventDate: new Date('2025-12-31'),
    venue: "Jabalpur",
    imageUrl: "/Gallery/Events-thumbs/MAFIA.jpg",
    link: "/mafia-soiree",
    emoji: "🎩"
  },
  {
    id: 'luau',
    name: "Slanup's Tropical Luau",
    eventDate: new Date('2025-11-22'),
    venue: "Hyderabad",
    imageUrl: "/Gallery/Events-thumbs/Luau.jpg",
    link: "/luau",
    emoji: "🌺"
  },
  {
    id: 'diwali',
    name: "Slanup's BYOB Diwali Party",
    eventDate: new Date('2025-10-18'),
    venue: "Jabalpur",
    imageUrl: "/Gallery/Events-thumbs/Diwali.jpg",
    link: "/diwali",
    emoji: "🪔"
  }
];

export default function EventsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-800 relative overflow-x-hidden transition-colors">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-8 pb-12 md:pb-16 text-center relative w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold my-3 md:my-4 text-[var(--brand-green)]"
        >
          Coolest Pull offs!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base md:text-lg text-neutral-600 mb-12 max-w-2xl"
        >
          join in, if you happen to be in the same city next time :)
        </motion.p>

        {/* Event Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full max-w-6xl mx-auto"
        >
          <div className="flex justify-center gap-8 md:gap-12 flex-wrap">
            {ALL_EVENTS.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.3 + index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Bottom gradient blur */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10"></div>

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
    </div>
  );
}

