"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Play, Download, ChevronLeft, ChevronRight, MessageCircle, Instagram, FolderUp } from "lucide-react";
import Link from "next/link";
import TicketBooking from "@/components/TicketBooking";
import BookingReference from "@/components/BookingReference";
import { InviteCodeStatus } from "@/lib/types";
import { getEventConfig } from "@/lib/eventConfig";


// Google Drive folder ID for Diwali 2025 gallery
const DIWALI_2025_FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '';

// Real gallery items from Diwali Party 2024 (images only)
const GALLERY_ITEMS = [
  { type: "image", url: "/Gallery/diwali-party24/IMG_3260_Original.jpg", title: "Party Vibes" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3408_Original.jpg", title: "Good Times" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3388_Original.jpg", title: "Epic Moments" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3379_Original.jpg", title: "Celebration" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_2027_Original.jpg", title: "Friends" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3368_Original.jpg", title: "Night Out" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3343_Original.jpg", title: "Fun Times" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3337_Original.jpg", title: "Squad Goals" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3330_Original.jpg", title: "Cheers" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3311_Original.jpg", title: "Smiles" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3310_Original.jpg", title: "Laughter" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3306_Original.jpg", title: "Pure Joy" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3302_Original.jpg", title: "Crew" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3301_Original.jpg", title: "Good Vibes" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3300_Original.jpg", title: "Diwali Magic" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_7889_Original.jpg", title: "Unforgettable" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3281_Original.jpg", title: "Best Night" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3272_Original.jpg", title: "Friends Forever" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3267_Original.jpg", title: "Party Time" },
  { type: "image", url: "/Gallery/diwali-party24/IMG_3265_Original.jpg", title: "Last Year's Magic" },
];

export default function EventPage() {
  const eventConfig = getEventConfig('diwali');
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

  useEffect(() => {
    setIsClient(true);
    
    // Load custom fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Black+Ops+One&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load Cashfree SDK
    const cashfreeScript = document.createElement('script');
    cashfreeScript.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    cashfreeScript.async = true;
    document.head.appendChild(cashfreeScript);
  }, []);

  const loadGalleryFromDrive = async () => {
    if (!DIWALI_2025_FOLDER_ID) return;
    
    setIsLoadingGallery(true);
    try {
      const response = await fetch(`/api/drive-files?folderId=${DIWALI_2025_FOLDER_ID}`);
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
      // Special handling for diwali2025 - it's a gallery-only code
      if (code === "DIWALI2025") {
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
              Slanup&#39;s
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
            
            <h2 className="text-2xl font-bold text-center mb-2">This event is over, thank you for response</h2>
            <p className="text-gray-400 text-center mb-6">Type the gallery code shared by the team:</p>

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
                  disabled={isCheckingStatus}
                  className="w-full bg-gradient-to-r from-[var(--brand-green)] to-green-600 hover:from-green-600 hover:to-[var(--brand-green)] text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingStatus ? 'Checking...' : 'Unlock Gallery'}
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
                Don&#39;t have a code? Contact us for an exclusive invite!
              </p>
            )}
          </div>
        </motion.div>

        {/* Booking Section OR Gallery Section - Shows after validation */}
        <AnimatePresence>
          {isValidated && inviteCode.trim().toUpperCase() === "DIWALI2025" ? (
            // Show Google Drive Gallery for diwali2025 code
            <motion.div
              key="drive-gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-yellow-400 mr-2" />
                  <h3 className="text-4xl font-bold">Diwali 2025 Gallery</h3>
                  <Sparkles className="w-8 h-8 text-yellow-400 ml-2" />
                </div>
                <div className="max-w-2xl mx-auto">
                  <p className="text-amber-400 text-xl font-semibold mb-2">This event is over</p>
                  <p className="text-gray-300 text-lg mb-4">Thank you for this crazy experience! 🎉</p>
                  <p className="text-gray-400 text-sm mb-3">Pleaseee shareee all of your camera roll photos/videos:</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <a
                      href="https://drive.google.com/drive/folders/1bVEefzI0nyqPRgpmFrMC04OlRi6e78he?usp=share_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      <FolderUp className="w-5 h-5" />
                      Upload to Drive
                    </a>
                    <a
                      href="https://wa.link/l7il98"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Ping us on WhatsApp
                    </a>
                    <a
                      href="https://instagram.com/slanup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      <Instagram className="w-5 h-5" />
                      DM us on Instagram
                    </a>
                  </div>
                </div>
              </div>

              {/* Gallery Grid */}
              {isLoadingGallery ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading gallery...</p>
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
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
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
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
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
                        className="absolute bottom-2 right-2 bg-amber-400 hover:bg-amber-500 text-black p-2 rounded-full transition-all transform hover:scale-110 shadow-lg z-10"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No photos yet. Be the first to upload!</p>
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
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-amber-500/50 border-2 border-amber-400/30 animate-pulse"
                >
                  🔥 GET YOUR SPOT - LET&apos;S PARTYYYYYYYYY! 🎉
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
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400 mr-2" />
                <h3 className="text-4xl font-bold">From Our Last Year&#39;s</h3>
                <Sparkles className="w-8 h-8 text-yellow-400 ml-2" />
              </div>
              <p className="text-gray-400 text-lg">Relive the magic of Diwali Party 2024</p>
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
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
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
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
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
        <div className="text-center mt-16 py-8 border-t border-white/10">
          <Link
            href="/diwali/terms"
            className="text-gray-400 hover:text-amber-400 transition-colors underline text-sm font-medium inline-block mb-4"
          >
            Event Terms & Conditions
          </Link>
          <p className="text-gray-500 text-xs">© 2025 Slanup. All rights reserved.</p>
          <p className="text-gray-600 text-xs mt-1">Social Media Platform for Planning Activities with Nearby People</p>
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
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            {/* Previous Button */}
            {inviteCode.trim().toUpperCase() === "DIWALI2025" && selectedMedia > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(selectedMedia - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Next Button */}
            {inviteCode.trim().toUpperCase() === "DIWALI2025" && selectedMedia < driveFiles.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(selectedMedia + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
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
              {inviteCode.trim().toUpperCase() === "DIWALI2025" && driveFiles[selectedMedia] ? (
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
            {inviteCode.trim().toUpperCase() === "DIWALI2025" && driveFiles[selectedMedia] && (
              <a
                href={`/api/drive-image?id=${driveFiles[selectedMedia].id}`}
                download={driveFiles[selectedMedia].name}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 right-4 bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg z-10"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all z-10"
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
