"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Play } from "lucide-react";
import Image from "next/image";

// Mock invite codes - replace with your actual codes
const VALID_INVITE_CODES = ["SLANUP2025", "DIWALI24", "TROPICALLAU"];

// Real gallery items from Diwali Party 2024
const GALLERY_ITEMS = [
  { type: "image", url: "/Gallery/diwali-party24/IMG_3260_Original.jpg", title: "Party Vibes" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3408_Original.jpg", title: "Good Times" },
  { type: "video", url: "/Gallery/diwali-party24/IMG_3396.mov", title: "Dance Floor" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3388_Original.jpg", title: "Epic Moments" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3379_Original.jpg", title: "Celebration" },
  { type: "video", url: "/Gallery/diwali-party24/IMG_3382.mov", title: "Party Energy" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_2027_Original.jpg", title: "Friends" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3368_Original.jpg", title: "Night Out" },
  { type: "video", url: "/Gallery/diwali-party24/IMG_3375.mov", title: "Live Action" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3360_Original.jpg", title: "Memories" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3354_Original.jpg", title: "Group Photo" },
  { type: "video", url: "/Gallery/diwali-party24/IMG_3373.mov", title: "Dance Moves" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3343_Original.jpg", title: "Fun Times" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3337_Original.jpg", title: "Squad Goals" },
  { type: "video", url: "/Gallery/diwali-party24/IMG_3340.mov", title: "Party Mode" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3333_Original.jpg", title: "Night Life" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3330_Original.jpg", title: "Cheers" },
  { type: "video", url: "/Gallery/diwali-party24/IMG_3369.mov", title: "Moments" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3323_Original.jpg", title: "Together" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3311_Original.jpg", title: "Smiles" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3310_Original.jpg", title: "Laughter" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3306_Original.jpg", title: "Pure Joy" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3302_Original.jpg", title: "Crew" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3301_Original.jpg", title: "Good Vibes" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3300_Original.jpg", title: "Diwali Magic" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3297_Original.jpg", title: "Party People" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_7889_Original.jpg", title: "Unforgettable" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3281_Original.jpg", title: "Best Night" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3272_Original.jpg", title: "Friends Forever" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3267_Original.jpg", title: "Party Time" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3265_Original.jpg", title: "Last Year's Magic" },
];

export default function EventPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleValidateCode = () => {
    const code = inviteCode.trim().toUpperCase();
    if (VALID_INVITE_CODES.includes(code)) {
      setIsValidated(true);
      setError("");
    } else {
      setError("Invalid invite code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isClient && [...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-20"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col items-center">
            <p className="text-2xl md:text-3xl text-white mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>
              Slanup's
            </p>
            <h1 className="text-6xl md:text-8xl font-bold mb-2 text-white" style={{ fontFamily: "'Black Ops One', cursive", letterSpacing: "0.05em", textShadow: "3px 3px 0px rgba(255,200,0,0.3), 6px 6px 0px rgba(255,100,0,0.2)" }}>
              Diwali Party
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mt-4">Diwali 2025 🪔</p>
        </motion.div>

        {/* Invite Code Section - Always on top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto mb-16"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Lock className="w-12 h-12 text-[var(--brand-green)]" />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">Got Your Invite From Us?</h2>
            <p className="text-gray-400 text-center mb-6">Enter your exclusive invite code below</p>

            <div className="space-y-4">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && handleValidateCode()}
                placeholder="ENTER CODE"
                disabled={isValidated}
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent transition-all placeholder-gray-500 disabled:opacity-50"
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              {!isValidated ? (
                <button
                  onClick={handleValidateCode}
                  className="w-full bg-gradient-to-r from-[var(--brand-green)] to-green-600 hover:from-green-600 hover:to-[var(--brand-green)] text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Unlock Experience
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-2"
                >
                  <p className="text-green-400 font-semibold">✓ Access Granted!</p>
                </motion.div>
              )}
            </div>

            {!isValidated && (
              <p className="text-xs text-gray-500 text-center mt-6">
                Don't have a code? Contact us for an exclusive invite!
              </p>
            )}
          </div>
        </motion.div>

        {/* Book Tickets Button - Shows only after validation */}
        <AnimatePresence>
          {isValidated && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="text-center mb-16"
            >
              <button className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-amber-500/50 border-2 border-amber-400/30">
                🎟️ Book Your Tickets Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Section - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400 mr-2" />
              <h3 className="text-4xl font-bold">From Our Last Year's</h3>
              <Sparkles className="w-8 h-8 text-yellow-400 ml-2" />
            </div>
            <p className="text-gray-400 text-lg">Relive the magic of Diwali Party 2024</p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                onClick={() => setSelectedMedia(index)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
              >
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <>
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-16 h-16 text-white opacity-80" />
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Media Lightbox */}
      <AnimatePresence>
        {selectedMedia !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              {GALLERY_ITEMS[selectedMedia].type === "image" ? (
                <Image
                  src={GALLERY_ITEMS[selectedMedia].url}
                  alt={GALLERY_ITEMS[selectedMedia].title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              ) : (
                <video
                  src={GALLERY_ITEMS[selectedMedia].url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              )}
            </motion.div>
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
