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
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&family=Bebas+Neue&family=Permanent+Marker&display=swap';
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

  // Neon color palette
  const neonColors = ['#00fff2', '#ff00ff', '#ffff00', '#ff6b00', '#00ff88'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white relative overflow-hidden">
      
      {/* ===== ANIMATED BACKGROUND - Thailand Full Moon Party Vibes ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Giant glowing full moon */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-44 h-44 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-100 opacity-25 blur-3xl" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50 opacity-40 blur-xl" />
        <motion.div
          className="absolute top-16 left-1/2 -translate-x-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-50 to-amber-100 opacity-60"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Floating sky lanterns (Yi Peng style) */}
        {isClient && [...Array(8)].map((_, i) => (
          <motion.div
            key={`lantern-${i}`}
            className="absolute"
            animate={{
              y: [-20, -200 - Math.random() * 300],
              x: [0, Math.random() * 80 - 40],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 12,
              repeat: Infinity,
              delay: Math.random() * 10,
            }}
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: `${Math.random() * 30}%`,
            }}
          >
            <div className="relative">
              <div className="w-6 h-8 md:w-8 md:h-10 rounded-t-full bg-gradient-to-b from-amber-300/80 to-orange-400/60 shadow-lg shadow-amber-400/40" />
              <div className="w-2 h-2 mx-auto bg-amber-200 rounded-full opacity-80 blur-[2px] -mt-3" />
            </div>
          </motion.div>
        ))}

        {/* Neon paint splashes */}
        {isClient && [...Array(15)].map((_, i) => (
          <motion.div
            key={`neon-${i}`}
            className="absolute rounded-full opacity-20 blur-xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: neonColors[i % neonColors.length],
            }}
          />
        ))}
        
        {/* Floating emojis - fire, moon, waves, lanterns */}
        {isClient && ['🌕', '🔥', '🌊', '🏖️', '🪩', '🎑', '🥥', '🌴', '🎶', '🎨'].map((emoji, i) => (
          <motion.div
            key={`emoji-${i}`}
            className="absolute text-3xl md:text-4xl opacity-20"
            animate={{
              x: [0, Math.random() * 160 - 80],
              y: [0, Math.random() * 160 - 80],
              rotate: [0, 360],
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

        {/* Neon glow particles */}
        {isClient && [...Array(30)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full"
            animate={{
              x: [0, Math.random() * 80 - 40],
              y: [0, Math.random() * 80 - 40],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 6 + 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: neonColors[i % neonColors.length],
              boxShadow: `0 0 8px ${neonColors[i % neonColors.length]}`,
            }}
          />
        ))}

        {/* Horizon ocean shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-900/20 via-indigo-950/10 to-transparent" />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
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
              className="text-2xl md:text-3xl font-semibold mb-2"
              style={{ 
                fontFamily: "'Poppins', sans-serif",
                color: '#00fff2',
                textShadow: '0 0 20px rgba(0,255,242,0.5), 0 0 40px rgba(0,255,242,0.3)'
              }}
              animate={{ textShadow: ['0 0 20px rgba(0,255,242,0.5)', '0 0 40px rgba(0,255,242,0.8)', '0 0 20px rgba(0,255,242,0.5)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Slanup&#39;s
            </motion.p>

            {/* FULL MOON PARTY title */}
            <div className="flex flex-col items-center gap-1">
              <h1 
                className="text-6xl md:text-8xl font-bold leading-none"
                style={{ 
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "0.08em",
                  background: "linear-gradient(135deg, #00fff2 0%, #ff00ff 50%, #ffff00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(0,255,242,0.4)) drop-shadow(0 0 60px rgba(255,0,255,0.3))",
                }}
              >
                FULL MOON
              </h1>
              <h1 
                className="text-7xl md:text-9xl font-bold leading-none"
                style={{ 
                  fontFamily: "'Permanent Marker', cursive",
                  letterSpacing: "0.04em",
                  background: "linear-gradient(135deg, #ff00ff 0%, #ffff00 50%, #ff6b00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(255,0,255,0.4)) drop-shadow(0 0 60px rgba(255,255,0,0.3))",
                }}
              >
                PARTY
              </h1>
            </div>
          </div>
          
          {/* Emoji row */}
          <motion.div 
            className="mt-6 text-3xl md:text-4xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌕 🔥 🌊 🎨 🪩 🌴
          </motion.div>

          {/* Tagline */}
          <motion.p 
            className="text-xl md:text-2xl mt-4 font-bold"
            style={{ 
              fontFamily: "'Poppins', sans-serif",
              color: '#ff00ff',
              textShadow: '0 0 15px rgba(255,0,255,0.5)'
            }}
            animate={{ 
              textShadow: ['0 0 15px rgba(255,0,255,0.5)', '0 0 30px rgba(255,0,255,0.8)', '0 0 15px rgba(255,0,255,0.5)']
            }}
            transition={{ duration: 3, repeat: Infinity }}
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
            className="backdrop-blur-xl rounded-3xl p-8 border-2 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(15,0,40,0.9) 0%, rgba(30,0,60,0.9) 100%)',
              borderColor: 'rgba(0,255,242,0.3)',
              boxShadow: '0 0 40px rgba(0,255,242,0.15), 0 0 80px rgba(255,0,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div 
                className="text-6xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🌕
              </motion.div>
            </div>
            
            <h2 
              className="text-2xl font-bold text-center mb-2"
              style={{ 
                color: '#00fff2',
                textShadow: '0 0 15px rgba(0,255,242,0.5)',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              Enter the Full Moon!
            </h2>
            <p className="text-fuchsia-300 text-center mb-6 text-sm" style={{ textShadow: '0 0 10px rgba(255,0,255,0.3)' }}>
              Drop your exclusive invite code below:
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
                className="w-full px-6 py-4 rounded-xl text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 transition-all placeholder-cyan-400/40 disabled:opacity-50 text-white"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,255,242,0.05) 0%, rgba(255,0,255,0.05) 100%)',
                  border: '2px solid rgba(0,255,242,0.3)',
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
                  className="w-full font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #00fff2 0%, #ff00ff 50%, #ffff00 100%)',
                    boxShadow: '0 0 20px rgba(0,255,242,0.4), 0 0 40px rgba(255,0,255,0.2)',
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
                  <p className="font-semibold text-xl" style={{ color: '#00fff2', textShadow: '0 0 15px rgba(0,255,242,0.5)' }}>
                    🌕 Welcome to the Full Moon! 🔥
                  </p>
                </motion.div>
              )}
            </div>

            {!isValidated && (
              <p className="text-xs text-purple-300/70 text-center mt-6">
                Don&#39;t have a code? <a href="https://forms.gle/pcjbWruv6q9cnViW9" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:text-cyan-200 underline font-semibold" style={{ textShadow: '0 0 8px rgba(0,255,242,0.3)' }}>Request your invite here!</a> 🌕
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
                  className="font-bold py-5 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-110 text-white border-2"
                  style={{
                    background: 'linear-gradient(135deg, #00fff2 0%, #ff00ff 50%, #ffff00 100%)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    boxShadow: '0 0 30px rgba(0,255,242,0.4), 0 0 60px rgba(255,0,255,0.3), 0 0 90px rgba(255,255,0,0.2)',
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: '0.05em',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(0,255,242,0.4), 0 0 60px rgba(255,0,255,0.3)',
                      '0 0 50px rgba(255,0,255,0.5), 0 0 80px rgba(0,255,242,0.4)',
                      '0 0 30px rgba(0,255,242,0.4), 0 0 60px rgba(255,0,255,0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🌕 GRAB YOUR FULL MOON PASS - LET&#39;S GO! 🔥
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
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ 
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: '0.05em',
                  background: "linear-gradient(135deg, #00fff2, #ff00ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                WHAT AWAITS YOU
              </h3>
              <p className="text-purple-300 text-lg" style={{ textShadow: '0 0 10px rgba(168,85,247,0.3)' }}>
                Thailand&apos;s legendary Full Moon Party energy, right here in Delhi 🌕
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {[
                { emoji: '🌕', title: 'Full Moon Magic', desc: 'Under the glow of the moon' },
                { emoji: '🎨', title: 'Neon Body Paint', desc: 'Free UV paint & glow gear' },
                { emoji: '🔥', title: 'Fire Performances', desc: 'Mesmerizing fire dancers' },
                { emoji: '🎧', title: 'Non-Stop Music', desc: 'Pro DJs all night long' },
                { emoji: '🍹', title: 'Tropical Drinks', desc: 'Thai-inspired cocktails' },
                { emoji: '🪩', title: 'Dance All Night', desc: 'Beach party vibes' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="rounded-2xl p-5 text-center backdrop-blur-sm border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,255,242,0.05) 0%, rgba(255,0,255,0.05) 100%)',
                    borderColor: `${neonColors[i % neonColors.length]}33`,
                    boxShadow: `0 0 20px ${neonColors[i % neonColors.length]}15`,
                  }}
                >
                  <div className="text-4xl mb-2">{item.emoji}</div>
                  <h4 className="font-bold text-white text-sm md:text-base mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.title}</h4>
                  <p className="text-purple-300 text-xs md:text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== GALLERY SECTION - Always visible when not authenticated ===== */}
        {!isValidated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4 text-5xl">
                🔥
                <h3 
                  className="text-4xl md:text-5xl font-bold mx-4"
                  style={{ 
                    fontFamily: "'Bebas Neue', cursive",
                    background: "linear-gradient(135deg, #00fff2, #ff00ff, #ffff00)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Previous Party Vibes
                </h3>
                🌕
              </div>
              <p className="text-purple-300 text-lg" style={{ textShadow: '0 0 10px rgba(168,85,247,0.3)' }}>
                Get ready for the wildest Full Moon Party ever! 🌊
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GALLERY_ITEMS.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  onClick={() => setSelectedMedia(index)}
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
                  style={{
                    border: `2px solid ${neonColors[index % neonColors.length]}30`,
                    boxShadow: `0 0 15px ${neonColors[index % neonColors.length]}10`,
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
                  {/* Neon overlay on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${neonColors[index % neonColors.length]}40, transparent)` }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== FOOTER ===== */}
        <div className="text-center mt-16 py-8 border-t border-cyan-400/20">
          <Link
            href="/terms"
            className="text-cyan-300/70 hover:text-cyan-200 transition-colors underline text-sm font-medium inline-block mb-4"
          >
            Event Terms & Conditions
          </Link>
          <p className="text-purple-400/50 text-xs">© 2026 Slanup. All rights reserved. 🌕</p>
          <p className="text-purple-500/40 text-xs mt-1">Social Media Platform for Planning Activities with Nearby People</p>
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
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all z-10 border border-white/20"
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
