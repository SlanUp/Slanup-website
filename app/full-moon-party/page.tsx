"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, ChevronLeft, ChevronRight, MessageCircle, Instagram, FolderUp } from "lucide-react";
import Link from "next/link";
import TicketBooking from "@/components/TicketBooking";
import BookingReference from "@/components/BookingReference";
import { InviteCodeStatus } from "@/lib/types";
import { getEventConfig } from "@/lib/eventConfig";


// Previous party gallery items from best parties
const GALLERY_ITEMS = [
  { type: "image", url: "/Gallery/best-parties/1.JPG", title: "Party Vibes" },
  { type: "image", url: "/Gallery/best-parties/2.JPG", title: "Good Times" },
  { type: "image", url: "/Gallery/best-parties/3.JPG", title: "Epic Night" },
  { type: "image", url: "/Gallery/best-parties/5.JPG", title: "Friends" },
  { type: "image", url: "/Gallery/best-parties/6.JPG", title: "Night Out" },
  { type: "image", url: "/Gallery/best-parties/7.JPG", title: "Fun Times" },
  { type: "image", url: "/Gallery/best-parties/8.JPG", title: "Squad Goals" },
  { type: "image", url: "/Gallery/best-parties/9.JPG", title: "Cheers" },
  { type: "image", url: "/Gallery/best-parties/1A7A6317-4C05-4A44-B75C-0A4A35CE57E1.JPG", title: "Smiles" },
  { type: "image", url: "/Gallery/best-parties/1F790625-08C9-487C-B4CC-4C5FA38C37DE.JPG", title: "Laughter" },
  { type: "image", url: "/Gallery/best-parties/2830EE9F-7C84-46F2-8B08-D99639BB2E11.JPG", title: "Pure Joy" },
  { type: "image", url: "/Gallery/best-parties/3DF8E5E8-4523-4B21-B5E1-A2F8BEA3E0A4.JPG", title: "Crew" },
  { type: "image", url: "/Gallery/best-parties/47F96A65-070F-4149-A322-F42C80A54F42.JPG", title: "Good Vibes" },
  { type: "image", url: "/Gallery/best-parties/6DBBC89B-9756-42E4-A750-D47215B337CB.jpg", title: "Unforgettable" },
  { type: "image", url: "/Gallery/best-parties/72919371-E11C-4EB8-BF70-D603BA7FD5A9.JPG", title: "Best Night" },
  { type: "image", url: "/Gallery/best-parties/7B553836-8F88-4CDA-BE1E-06FE9746853F.JPG", title: "Forever" },
  { type: "image", url: "/Gallery/best-parties/7DAADBCD-AE6C-46C4-BF49-9D1AD672EF9A.JPG", title: "Magic" },
  { type: "image", url: "/Gallery/best-parties/975B849A-8BA1-45A5-A94E-A50C351589C1.JPG", title: "Amazing" },
  { type: "image", url: "/Gallery/best-parties/IMG_0180.JPG", title: "Great Times" },
  { type: "image", url: "/Gallery/best-parties/IMG_0270.JPG", title: "Young" },
  { type: "image", url: "/Gallery/best-parties/IMG_0293.JPG", title: "Energy" },
  { type: "image", url: "/Gallery/best-parties/IMG_0296.JPG", title: "Night Life" },
  { type: "image", url: "/Gallery/best-parties/IMG_0995.JPG", title: "Vibes" },
  { type: "image", url: "/Gallery/best-parties/IMG_1111.JPG", title: "Dance" },
  { type: "image", url: "/Gallery/best-parties/IMG_1505.JPG", title: "Together" },
  { type: "image", url: "/Gallery/best-parties/IMG_2243.JPG", title: "Moments" },
  { type: "image", url: "/Gallery/best-parties/IMG_2632.JPG", title: "Joy" },
  { type: "image", url: "/Gallery/best-parties/IMG_2644.JPG", title: "Memories" },
  { type: "image", url: "/Gallery/best-parties/IMG_2680.JPG", title: "Wild" },
  { type: "image", url: "/Gallery/best-parties/IMG_2921.JPG", title: "Squad" },
  { type: "image", url: "/Gallery/best-parties/IMG_3123.JPG", title: "Fire" },
  { type: "image", url: "/Gallery/best-parties/IMG_6712.JPG", title: "Fun" },
  { type: "image", url: "/Gallery/best-parties/IMG_6743.JPG", title: "Epic" },
  { type: "image", url: "/Gallery/best-parties/IMG_6755.JPG", title: "Glow" },
  { type: "image", url: "/Gallery/best-parties/IMG_6828.JPG", title: "Lit" },
  { type: "image", url: "/Gallery/best-parties/IMG_7764.WEBP", title: "Hype" },
  { type: "image", url: "/Gallery/best-parties/IMG_8259.JPG", title: "Blast" },
  { type: "image", url: "/Gallery/best-parties/IMG_8666.JPG", title: "Groove" },
  { type: "image", url: "/Gallery/best-parties/IMG_8775.JPG", title: "Turn Up" },
  { type: "image", url: "/Gallery/best-parties/IMG_9034.JPG", title: "Crazy" },
  { type: "image", url: "/Gallery/best-parties/IMG_9626.JPG", title: "Shine" },
  { type: "image", url: "/Gallery/best-parties/IMG_9642.JPG", title: "Glow Up" },
  { type: "image", url: "/Gallery/best-parties/ACDAC98B-904F-4380-B771-F286D3985A45.JPG", title: "Bounce" },
  { type: "image", url: "/Gallery/best-parties/C4F9DAD2-0BBD-4562-A01E-C74DB157CEF3.JPG", title: "Live" },
  { type: "image", url: "/Gallery/best-parties/CA6A0641-5F1C-46FC-8954-2C8925B82AC9.JPG", title: "Thrive" },
  { type: "image", url: "/Gallery/best-parties/CBD8D89D-9E0F-4E54-9259-6E6C6E868F31.JPG", title: "Legendary" },
  { type: "image", url: "/Gallery/best-parties/E533DA87-E331-4D05-8954-74848E0689F2.JPG", title: "Electric" },
  { type: "image", url: "/Gallery/best-parties/E81EFEE7-858B-42F5-985A-EE72B3FB7710.JPG", title: "Iconic" },
];

export default function FullMoonPartyPage() {
  const eventConfig = getEventConfig('full-moon-party');
  
  const [inviteCode, setInviteCode] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showTicketBooking, setShowTicketBooking] = useState(false);
  const [inviteCodeStatus, setInviteCodeStatus] = useState<InviteCodeStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Load fonts for Thailand Full Moon Party
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load Cashfree SDK
    const cashfreeScript = document.createElement('script');
    cashfreeScript.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    cashfreeScript.async = true;
    document.head.appendChild(cashfreeScript);
  }, []);

  const handleValidateCode = async () => {
    const code = inviteCode.trim().toUpperCase();
    setIsCheckingStatus(true);
    
    try {
      const response = await fetch('/api/invite/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code })
      });
      
      const status = await response.json();
      setInviteCodeStatus(status);
      
      if (status.isValid) {
        setIsValidated(true);
        setError("");
      } else {
        setError("Invalid invite code. Please try again.");
      }
    } catch (error) {
      console.error('Error validating code:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  const handleBookTickets = () => {
    if (inviteCodeStatus?.isUsed) return;
    setShowTicketBooking(true);
  };

  // Gold accent palette
  const goldAccents = ['#FFD700', '#FFC107', '#F5B800', '#E5A100', '#FFAA00'];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      
      {/* ===== ANIMATED BACKGROUND - Elegant Black & Gold ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        
        {/* Golden moon glow */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-44 h-44 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-yellow-400/10 via-amber-300/8 to-yellow-600/5 blur-3xl" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-yellow-300/15 via-amber-200/10 to-transparent blur-xl" />
        <motion.div
          className="absolute top-16 left-1/2 -translate-x-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-300/30 to-amber-400/20"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Floating golden particles */}
        {isClient && [...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-yellow-400/40"
            animate={{
              y: [0, -100 - Math.random() * 200],
              x: [0, Math.random() * 60 - 30],
              opacity: [0.2, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 12 + 8,
              repeat: Infinity,
              delay: Math.random() * 8,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 40}%`,
              boxShadow: '0 0 4px rgba(255,215,0,0.4)',
            }}
          />
        ))}

        {/* Subtle gold shimmer lines */}
        {isClient && [...Array(5)].map((_, i) => (
          <motion.div
            key={`shimmer-${i}`}
            className="absolute h-px w-32 md:w-48"
            style={{
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent)',
              transform: `rotate(${-15 + i * 8}deg)`,
            }}
            animate={{ opacity: [0, 0.4, 0], x: [-20, 20, -20] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.5 }}
          />
        ))}

        {/* Floating moon emojis — subtle */}
        {isClient && ['🌕', '✦', '✧', '🌕', '✦'].map((emoji, i) => (
          <motion.div
            key={`emoji-${i}`}
            className="absolute text-2xl md:text-3xl opacity-10"
            animate={{
              x: [0, Math.random() * 80 - 40],
              y: [0, Math.random() * 80 - 40],
            }}
            transition={{
              duration: Math.random() * 25 + 18,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {emoji}
          </motion.div>
        ))}

        {/* Bottom gold gradient line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col items-center">
            {/* Slanup's branding */}
            <motion.p 
              className="text-sm md:text-base font-medium mb-4 tracking-[0.3em] uppercase"
              style={{ 
                fontFamily: "'Poppins', sans-serif",
                color: '#B8860B',
              }}
            >
              Slanup&#39;s
            </motion.p>

            {/* FULL MOON PARTY title */}
            <div className="flex flex-col items-center gap-0">
              <h1 
                className="text-4xl md:text-6xl font-800 leading-tight tracking-[0.15em] uppercase"
                style={{ 
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  background: "linear-gradient(180deg, #FFD700 0%, #B8860B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 2px 10px rgba(255,215,0,0.2))",
                }}
              >
                Full Moon
              </h1>
              <h1 
                className="text-5xl md:text-7xl font-900 leading-tight tracking-[0.2em] uppercase"
                style={{ 
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  background: "linear-gradient(180deg, #FFF8DC 0%, #FFD700 50%, #B8860B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 2px 15px rgba(255,215,0,0.25))",
                }}
              >
                Party
              </h1>
            </div>
          </div>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center mt-5 gap-4">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-yellow-600/30" />
            <span className="text-xl text-yellow-500/60">✦</span>
            <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-yellow-600/30" />
          </div>

          {/* Tagline */}
          <motion.p 
            className="text-base md:text-lg mt-4 font-light tracking-[0.15em] uppercase"
            style={{ 
              fontFamily: "'Poppins', sans-serif",
              color: '#999',
            }}
          >
            One Night. Full Moon. No Rules.
          </motion.p>

        </motion.div>

        {/* ===== INVITE CODE SECTION ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto mb-16"
        >
          <div 
            className="backdrop-blur-xl rounded-3xl p-8 border shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(20,15,5,0.95) 100%)',
              borderColor: 'rgba(255,215,0,0.2)',
              boxShadow: '0 0 40px rgba(255,215,0,0.08), 0 0 80px rgba(255,215,0,0.04), inset 0 1px 0 rgba(255,215,0,0.1)',
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div 
                className="text-4xl"
                animate={{ 
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🌕
              </motion.div>
            </div>
            
            <h2 
              className="text-lg font-600 text-center mb-2 tracking-[0.1em] uppercase"
              style={{ 
                color: '#FFD700',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
              }}
            >
              Enter the Full Moon
            </h2>
            <p className="text-neutral-400 text-center mb-6 text-sm">
              Drop your exclusive invite code below
            </p>

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
                className="w-full px-6 py-4 rounded-xl text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all placeholder-yellow-600/30 disabled:opacity-50 text-white"
                style={{
                  background: 'rgba(255,215,0,0.03)',
                  border: '1px solid rgba(255,215,0,0.2)',
                }}
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
                  disabled={isCheckingStatus}
                  className="w-full font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-black text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #F5B800 50%, #E5A100 100%)',
                    boxShadow: '0 0 20px rgba(255,215,0,0.25), 0 0 40px rgba(255,215,0,0.1)',
                  }}
                >
                  {isCheckingStatus ? '🌕 Checking...' : '🌕 Unlock the Party'}
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-2"
                >
                  <p className="font-semibold text-xl" style={{ color: '#FFD700', textShadow: '0 0 15px rgba(255,215,0,0.4)' }}>
                    🌕 Welcome to the Full Moon! 🔥
                  </p>
                </motion.div>
              )}
            </div>

            {!isValidated && (
              <p className="text-xs text-neutral-500 text-center mt-6">
                Don&#39;t have a code? <a href="https://forms.gle/pcjbWruv6q9cnViW9" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400 underline font-semibold">Request your invite here!</a>
              </p>
            )}
          </div>
        </motion.div>

        {/* ===== BOOKING SECTION - After validation ===== */}
        <AnimatePresence>
          {isValidated && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="text-center mb-16"
            >
              {inviteCodeStatus?.isUsed ? (
                <BookingReference booking={inviteCodeStatus.booking!} eventConfig={eventConfig || undefined} />
              ) : (
                <motion.button 
                  onClick={handleBookTickets}
                  className="font-600 py-4 px-10 rounded-full text-base tracking-[0.1em] uppercase transition-all duration-300 transform hover:scale-105 text-black border"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #F5B800 50%, #E5A100 100%)',
                    borderColor: 'rgba(255,215,0,0.4)',
                    boxShadow: '0 0 25px rgba(255,215,0,0.2), 0 0 50px rgba(255,215,0,0.1)',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 25px rgba(255,215,0,0.2), 0 0 50px rgba(255,215,0,0.1)',
                      '0 0 40px rgba(255,215,0,0.35), 0 0 70px rgba(255,215,0,0.15)',
                      '0 0 25px rgba(255,215,0,0.2), 0 0 50px rgba(255,215,0,0.1)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Grab Your Full Moon Pass
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== WHAT TO EXPECT SECTION ===== */}
        {!isValidated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="text-center mb-10">
              <h3 
                className="text-xl md:text-2xl font-700 mb-3 tracking-[0.15em] uppercase"
                style={{ 
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  background: "linear-gradient(180deg, #FFD700, #B8860B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                WHAT AWAITS YOU
              </h3>
              <p className="text-neutral-500 text-sm md:text-base">
                Thailand&apos;s legendary Full Moon Party energy, right here in Delhi 🌕
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                { emoji: '🌕', title: 'Full Moon Magic', desc: 'Under the glow of the moon' },
                { emoji: '🎨', title: 'Neon Body Paint', desc: 'Free UV paint & glow gear' },
                { emoji: '👥', title: 'Curated Crowd', desc: 'Invite-only, handpicked people' },
                { emoji: '🎧', title: 'Non-Stop Music', desc: 'Pro DJs all night long' },
                { emoji: '😈', title: 'Unhinged Rules', desc: 'No boring rules, just vibes' },
                { emoji: '🎲', title: 'Party Games', desc: 'Wild games all night' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="rounded-2xl p-5 text-center backdrop-blur-sm border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.03) 0%, rgba(0,0,0,0.4) 100%)',
                    borderColor: 'rgba(255,215,0,0.12)',
                    boxShadow: '0 0 20px rgba(255,215,0,0.04)',
                  }}
                >
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <h4 className="font-semibold text-yellow-100/90 text-xs md:text-sm mb-1 tracking-wide uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</h4>
                  <p className="text-neutral-600 text-xs">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== GALLERY SECTION ===== */}
        {!isValidated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4 gap-4">
                <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-yellow-500/40" />
                <h3 
                  className="text-2xl md:text-3xl font-700 tracking-[0.12em] uppercase"
                  style={{ 
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    background: "linear-gradient(180deg, #FFD700, #B8860B)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Previous Party Vibes
                </h3>
                <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-yellow-500/40" />
              </div>
              <p className="text-neutral-500 text-lg">
                Get ready for the wildest Full Moon Party ever! 🌊
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {GALLERY_ITEMS.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.03 }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                  onClick={() => setSelectedMedia(index)}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  style={{
                    border: '1px solid rgba(255,215,0,0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Play className="w-16 h-16 text-white opacity-80" />
                      </div>
                    </>
                  )}
                  {/* Gold overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== FOOTER ===== */}
        <div className="text-center mt-16 py-8 border-t border-yellow-500/10">
          <Link
            href="/terms"
            className="text-yellow-600/70 hover:text-yellow-500 transition-colors underline text-sm font-medium inline-block mb-4"
          >
            Event Terms & Conditions
          </Link>
          <p className="text-neutral-600 text-xs">© 2026 Slanup. All rights reserved. 🌕</p>
          <p className="text-neutral-700 text-xs mt-1">Social Media Platform for Planning Activities with Nearby People</p>
        </div>
      </div>

      {/* ===== MEDIA LIGHTBOX ===== */}
      <AnimatePresence>
        {selectedMedia !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              {GALLERY_ITEMS[selectedMedia] ? (
                GALLERY_ITEMS[selectedMedia].type === "image" ? (
                  <img
                    src={GALLERY_ITEMS[selectedMedia].url}
                    alt={GALLERY_ITEMS[selectedMedia].title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={GALLERY_ITEMS[selectedMedia].url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                )
              ) : null}
            </motion.div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 bg-neutral-900/80 hover:bg-neutral-800 text-yellow-400 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all z-10 border border-yellow-500/20"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ===== TICKET BOOKING MODAL ===== */}
      <AnimatePresence>
        {showTicketBooking && eventConfig && (
          <TicketBooking
            inviteCode={inviteCode}
            eventConfig={eventConfig}
            onClose={() => setShowTicketBooking(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
