"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock } from "lucide-react";
import Image from "next/image";

// Mock invite codes - replace with your actual codes
const VALID_INVITE_CODES = ["SLANUP2025", "DIWALI24", "TROPICALLAU"];

// Placeholder gallery items - replace with your actual media
const GALLERY_ITEMS = [
  { type: "image", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800", title: "Last Year's Celebration" },
  { type: "image", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800", title: "Epic Moments" },
  { type: "image", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800", title: "Dance Floor" },
  { type: "image", url: "https://images.unsplash.com/photo-1470229538611-16a7c00becd4?w=800", title: "Live Performance" },
  { type: "image", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800", title: "Lights & Energy" },
  { type: "image", url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800", title: "Crowd Vibes" },
];

export default function EventPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
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
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            Slanup's Diwali Party
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">Diwali 2025 🪔</p>
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
              <button className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-orange-500/50">
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
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                onClick={() => setSelectedImage(index)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
              >
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white font-semibold">{item.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-4xl aspect-video"
            >
              <Image
                src={GALLERY_ITEMS[selectedImage].url}
                alt={GALLERY_ITEMS[selectedImage].title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
