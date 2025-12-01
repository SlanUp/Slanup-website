"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, ChevronLeft, ChevronRight, MessageCircle, Instagram, FolderUp } from "lucide-react";
import Link from "next/link";
import TicketBooking from "@/components/TicketBooking";
import BookingReference from "@/components/BookingReference";
import { InviteCodeStatus } from "@/lib/types";
import { getEventConfig } from "@/lib/eventConfig";


// Google Drive folder ID for Mafia Soireé 2024 gallery
const MAFIA_2024_FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '';

// Previous party gallery items from best parties (exact filenames from folder)
const GALLERY_ITEMS = [
  // Single-digit numbered files first
  { type: "image", url: "/Gallery/best-parties/1.JPG", title: "Party Vibes" },
  { type: "image", url: "/Gallery/best-parties/2.JPG", title: "Good Times" },
  { type: "image", url: "/Gallery/best-parties/3.JPG", title: "Epic Night" },
  { type: "image", url: "/Gallery/best-parties/5.JPG", title: "Friends" },
  { type: "image", url: "/Gallery/best-parties/6.JPG", title: "Night Out" },
  { type: "image", url: "/Gallery/best-parties/7.JPG", title: "Fun Times" },
  { type: "image", url: "/Gallery/best-parties/8.JPG", title: "Squad Goals" },
  { type: "image", url: "/Gallery/best-parties/9.JPG", title: "Cheers" },
  // Single-digit starting UUIDs
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
  // IMG_ numbered files
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
  // Other UUID filenames
  { type: "image", url: "/Gallery/best-parties/ACDAC98B-904F-4380-B771-F286D3985A45.JPG", title: "Bounce" },
  { type: "image", url: "/Gallery/best-parties/C4F9DAD2-0BBD-4562-A01E-C74DB157CEF3.JPG", title: "Live" },
  { type: "image", url: "/Gallery/best-parties/CA6A0641-5F1C-46FC-8954-2C8925B82AC9.JPG", title: "Thrive" },
  { type: "image", url: "/Gallery/best-parties/CBD8D89D-9E0F-4E54-9259-6E6C6E868F31.JPG", title: "Legendary" },
  { type: "image", url: "/Gallery/best-parties/E533DA87-E331-4D05-8954-74848E0689F2.JPG", title: "Electric" },
  { type: "image", url: "/Gallery/best-parties/E81EFEE7-858B-42F5-985A-EE72B3FB7710.JPG", title: "Iconic" },
];

export default function MafiaSoireePage() {
  // Get Mafia Soireé event config
  const eventConfig = getEventConfig('mafia-soiree');
  
  // State declarations first
  const [inviteCode, setInviteCode] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showTicketBooking, setShowTicketBooking] = useState(false);
  const [inviteCodeStatus, setInviteCodeStatus] = useState<InviteCodeStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [driveFiles, setDriveFiles] = useState<Array<{id: string; name: string; mimeType: string}>>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  
  // Logging for debugging
  useEffect(() => {
    console.log('🎩 [Mafia Soireé Page] Component mounted');
    console.log('🎩 [Mafia Soireé Page] Event Config:', eventConfig);
    if (eventConfig) {
      console.log('🎩 [Mafia Soireé Page] Event ID:', eventConfig.id);
      console.log('🎩 [Mafia Soireé Page] Event Name:', eventConfig.name);
      console.log('🎩 [Mafia Soireé Page] Ticket Types:', eventConfig.ticketTypes);
      console.log('🎩 [Mafia Soireé Page] First Ticket Price:', eventConfig.ticketTypes[0]?.price);
      console.log('🎩 [Mafia Soireé Page] Theme Primary Color:', eventConfig.theme.primaryColor);
      console.log('🎩 [Mafia Soireé Page] Theme Emoji:', eventConfig.theme.emoji);
    } else {
      console.error('❌ [Mafia Soireé Page] Event config is null!');
    }
  }, [eventConfig]);
  
  // Log when TicketBooking is about to be rendered
  useEffect(() => {
    if (showTicketBooking && eventConfig) {
      console.log('🎩 [Mafia Soireé Page] Rendering TicketBooking with:', {
        inviteCode,
        eventConfigId: eventConfig.id,
        eventConfigName: eventConfig.name,
        ticketPrice: eventConfig.ticketTypes[0]?.price,
        themePrimaryColor: eventConfig.theme.primaryColor,
        themeEmoji: eventConfig.theme.emoji
      });
    }
  }, [showTicketBooking, eventConfig, inviteCode]);

  useEffect(() => {
    setIsClient(true);
    
    // Load mafia/gangster themed fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Bebas+Neue&family=Playfair+Display:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load Cashfree SDK
    const cashfreeScript = document.createElement('script');
    cashfreeScript.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    cashfreeScript.async = true;
    document.head.appendChild(cashfreeScript);
  }, []);

  const loadGalleryFromDrive = async () => {
    if (!MAFIA_2024_FOLDER_ID) return;
    
    setIsLoadingGallery(true);
    try {
      const response = await fetch(`/api/drive-files?folderId=${MAFIA_2024_FOLDER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setDriveFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleValidateCode = async () => {
    const code = inviteCode.trim().toUpperCase();
    setIsCheckingStatus(true);
    
    try {
      // Special handling for mafia2024 - it's a gallery-only code
      if (code === "MAFIA2024") {
        setIsValidated(true);
        setError("");
        setInviteCodeStatus({ code, isValid: true, isUsed: false });
        // Load gallery from Google Drive
        loadGalleryFromDrive();
        return;
      }
      
      // Check booking status for this invite code via API
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
    if (inviteCodeStatus?.isUsed) {
      // Code already used - this shouldn't happen due to UI state
      return;
    }
    setShowTicketBooking(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white relative overflow-hidden">
      {/* Animated mafia/gangster background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating fedora hats */}
        {isClient && [...Array(12)].map((_, i) => (
          <motion.div
            key={`hat-${i}`}
            className="absolute text-5xl opacity-20"
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 25 + 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          >
            🎩
          </motion.div>
        ))}
        
        {/* Red accent rays effect */}
        {isClient && [...Array(6)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute w-1 bg-gradient-to-b from-red-600/10 to-transparent opacity-30"
            style={{
              height: "70vh",
              left: `${15 + i * 15}%`,
              top: 0,
              transform: `rotate(${i * 8}deg)`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
            }}
          />
        ))}
        
        {/* Floating dollar signs / money */}
        {isClient && [...Array(10)].map((_, i) => (
          <motion.div
            key={`money-${i}`}
            className="absolute text-3xl opacity-15"
            animate={{
              x: [0, Math.random() * 150 - 75],
              y: [0, Math.random() * 150 - 75],
              rotate: [0, -360],
            }}
            transition={{
              duration: Math.random() * 18 + 12,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          >
            💰
          </motion.div>
        ))}
        
        {/* Red glow particles */}
        {isClient && [...Array(25)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-red-600 rounded-full opacity-30"
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
            <p className="text-3xl md:text-4xl text-red-500 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Slanup&#39;s
            </p>
            <div className="flex flex-col md:flex-row md:items-center md:gap-3 items-center">
              <h1 className="text-6xl md:text-7xl font-bold mb-2 md:mb-0 text-white" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em", textShadow: "4px 4px 0px rgba(220,38,38,0.5), 8px 8px 0px rgba(0,0,0,0.8)" }}>
                MAFIA
              </h1>
              <h1 className="text-6xl md:text-7xl font-bold text-red-600" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em", textShadow: "4px 4px 0px rgba(220,38,38,0.5), 8px 8px 0px rgba(0,0,0,0.8)" }}>
                SOIRÉE
              </h1>
            </div>
          </div>
          <div className="mt-6 text-4xl">
            🎩 💼 🎰 🍷 🎲
          </div>
          <p className="text-2xl md:text-3xl text-red-400 mt-4 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome to the Family</p>
        </motion.div>

        {/* Invite Code Section - Always on top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto mb-16"
        >
          <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-600/50 shadow-2xl shadow-red-900/30">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl">🎩</div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2 text-white">Join the Family!</h2>
            <p className="text-red-300 text-center mb-6">Enter your exclusive invite code:</p>

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
                className="w-full px-6 py-4 bg-gradient-to-r from-neutral-900 to-black border-2 border-red-600/50 rounded-xl text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-red-400/50 disabled:opacity-50 text-white"
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
                  className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed border border-red-600/30"
                >
                  {isCheckingStatus ? '🎩 Checking...' : '🎩 Unlock Access'}
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-2"
                >
                  <p className="text-red-400 font-semibold text-xl">🎩 Welcome to the Family! 🍷</p>
                </motion.div>
              )}
            </div>

            {!isValidated && (
              <p className="text-xs text-red-400/70 text-center mt-6">
                Don&#39;t have a code? <a href="https://forms.gle/pcjbWruv6q9cnViW9" target="_blank" rel="noopener noreferrer" className="text-red-300 hover:text-red-200 underline font-semibold">Request your invite by filling this quick form out!</a> 🎰
              </p>
            )}
          </div>
        </motion.div>

        {/* Booking Section OR Gallery Section - Shows after validation */}
        <AnimatePresence>
          {isValidated && inviteCode.trim().toUpperCase() === "MAFIA2024" ? (
            // Show Google Drive Gallery for mafia2024 code
            <motion.div
              key="drive-gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-4 text-5xl">
                  🎩
                  <h3 className="text-4xl md:text-5xl font-bold mx-4 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 bg-clip-text text-transparent" style={{ fontFamily: "'Bebas Neue', cursive" }}>Mafia Soireé Gallery</h3>
                  💼
                </div>
                <div className="max-w-2xl mx-auto">
                  <p className="text-red-400 text-2xl font-semibold mb-2">Welcome! 🎩</p>
                  <p className="text-red-300 text-lg mb-4">Share your mafia memories with us! 🎰</p>
                  <p className="text-red-400/80 text-sm mb-3">Upload all your photos/videos:</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <a
                      href="https://drive.google.com/drive/folders/1bVEefzI0nyqPRgpmFrMC04OlRi6e78he?usp=share_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-900/30 flex items-center gap-2 border border-red-600/30"
                    >
                      <FolderUp className="w-5 h-5" />
                      🎩 Upload to Drive
                    </a>
                    <a
                      href="https://wa.link/l7il98"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-800/30 flex items-center gap-2 border border-red-500/30"
                    >
                      <MessageCircle className="w-5 h-5" />
                      💼 WhatsApp Us
                    </a>
                    <a
                      href="https://instagram.com/slanup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-800 hover:to-red-800 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-rose-900/30 flex items-center gap-2 border border-rose-600/30"
                    >
                      <Instagram className="w-5 h-5" />
                      🎰 DM on Insta
                    </a>
                  </div>
                </div>
              </div>

              {/* Gallery Grid */}
              {isLoadingGallery ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-red-400">Loading memories... 🎩</p>
                </div>
              ) : driveFiles.length > 0 ? (
                <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                  {driveFiles.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border-2 border-red-600/30 shadow-lg"
                    >
                      <div onClick={() => setSelectedMedia(index)} className="w-full h-full">
                        {file.mimeType.startsWith('image/') ? (
                          <img
                            src={`/api/drive-image?id=${file.id}&size=thumb`}
                            alt={file.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <>
                            <img
                              src={`/api/drive-image?id=${file.id}&size=thumb`}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                          </>
                        )}
                      </div>
                      {/* Download button - always visible */}
                      <a
                        href={`/api/drive-image?id=${file.id}`}
                        download={file.name}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-2 right-2 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white p-2 rounded-full transition-all transform hover:scale-110 shadow-lg z-10 border border-red-600/30"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-red-400">
                  <div className="text-7xl mb-4">🎩</div>
                  <p>No photos yet. Be the first to share the family memories!</p>
                </div>
              )}
            </motion.div>
          ) : isValidated && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="text-center mb-16"
            >
              {inviteCodeStatus?.isUsed ? (
                // Show booking reference if already booked
                <BookingReference booking={inviteCodeStatus.booking!} eventConfig={eventConfig || undefined} />
              ) : (
                // Show book tickets button if not booked yet
                <button 
                  onClick={handleBookTickets}
                  className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white font-bold py-5 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-red-900/50 border-2 border-red-600/50 animate-pulse"
                  style={{ fontFamily: "'Bebas Neue', cursive" }}
                >
                  🎩 GET YOUR MAFIA PASS - JOIN THE FAMILY! 💼
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>


        {/* Gallery Section - Always visible when not authenticated */}
        {!isValidated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4 text-5xl">
                🎰
                <h3 className="text-4xl md:text-5xl font-bold mx-4 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 bg-clip-text text-transparent" style={{ fontFamily: "'Bebas Neue', cursive" }}>Previous Party Vibes</h3>
                🎩
              </div>
              <p className="text-red-300 text-lg">Get ready for an even more epic mafia night! 🍷</p>
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
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border-2 border-red-600/30 shadow-lg"
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer with Legal Links */}
        <div className="text-center mt-16 py-8 border-t border-red-600/30">
          <Link
            href="/diwali/terms"
            className="text-red-400 hover:text-red-300 transition-colors underline text-sm font-medium inline-block mb-4"
          >
            Event Terms & Conditions
          </Link>
          <p className="text-red-500/70 text-xs">© 2024 Slanup. All rights reserved. 🎩</p>
          <p className="text-red-600/60 text-xs mt-1">Social Media Platform for Planning Activities with Nearby People</p>
        </div>
      </div>

      {/* Media Lightbox */}
      <AnimatePresence>
        {selectedMedia !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-4"
          >
            {/* Previous Button */}
            {inviteCode.trim().toUpperCase() === "MAFIA2024" && selectedMedia > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(selectedMedia - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-700/80 hover:bg-red-800 text-white p-3 rounded-full transition-all z-10 border border-red-600/50"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Next Button */}
            {inviteCode.trim().toUpperCase() === "MAFIA2024" && selectedMedia < driveFiles.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(selectedMedia + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-800/80 hover:bg-red-900 text-white p-3 rounded-full transition-all z-10 border border-red-600/50"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              {inviteCode.trim().toUpperCase() === "MAFIA2024" && driveFiles[selectedMedia] ? (
                // Show Google Drive media
                driveFiles[selectedMedia].mimeType.startsWith('image/') ? (
                  <img
                    src={`/api/drive-image?id=${driveFiles[selectedMedia].id}`}
                    alt={driveFiles[selectedMedia].name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={`https://drive.google.com/uc?export=view&id=${driveFiles[selectedMedia].id}`}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                )
              ) : GALLERY_ITEMS[selectedMedia] ? (
                // Show static gallery items
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
            
            {/* Download Button */}
            {inviteCode.trim().toUpperCase() === "MAFIA2024" && driveFiles[selectedMedia] && (
              <a
                href={`/api/drive-image?id=${driveFiles[selectedMedia].id}`}
                download={driveFiles[selectedMedia].name}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 right-4 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-red-900/30 z-10 border border-red-600/30"
              >
                <Download className="w-5 h-5" />
                🎩 Download
              </a>
            )}

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
      
      {/* Ticket Booking Modal */}
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

