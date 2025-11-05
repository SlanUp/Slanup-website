"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Play, Download, ChevronLeft, ChevronRight, MessageCircle, Instagram, FolderUp } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import TicketBooking from "@/components/TicketBooking";
import BookingReference from "@/components/BookingReference";
import { InviteCodeStatus } from "@/lib/types";
import { getEventConfig, isValidEventName } from "@/lib/eventConfig";

// Static gallery items - can be overridden per event in config
const DEFAULT_GALLERY_ITEMS: Array<{ type: "image" | "video"; url: string; title: string }> = [];

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventName = (params?.eventName as string)?.toLowerCase() || '';
  
  // Get event configuration
  const eventConfig = getEventConfig(eventName);
  
  // Logging for debugging
  useEffect(() => {
    console.log(`📅 [EventPage] Dynamic route - eventName:`, eventName);
    console.log(`📅 [EventPage] Event Config:`, eventConfig);
    if (eventConfig) {
      console.log(`📅 [EventPage] Event ID:`, eventConfig.id);
      console.log(`📅 [EventPage] Event Name:`, eventConfig.name);
      console.log(`📅 [EventPage] Ticket Price:`, eventConfig.ticketTypes[0]?.price);
      console.log(`📅 [EventPage] Theme:`, eventConfig.theme);
    } else {
      console.error(`❌ [EventPage] No event config found for:`, eventName);
    }
  }, [eventName, eventConfig]);
  
  // Redirect to 404 if event doesn't exist
  useEffect(() => {
    if (!eventConfig || !isValidEventName(eventName)) {
      router.push('/404');
    }
  }, [eventConfig, eventName, router]);

  if (!eventConfig || !isValidEventName(eventName)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

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
  const [galleryKey, setGalleryKey] = useState(0);

  const { theme, galleryCode, googleDriveFolderId } = eventConfig;
  
  // Log when TicketBooking is about to be rendered
  useEffect(() => {
    if (showTicketBooking && eventConfig) {
      console.log(`📅 [EventPage] Rendering TicketBooking with:`, {
        eventName,
        eventConfigId: eventConfig.id,
        eventConfigName: eventConfig.name,
        ticketPrice: eventConfig.ticketTypes[0]?.price,
        inviteCode
      });
    }
  }, [showTicketBooking, eventConfig, eventName, inviteCode]);

  useEffect(() => {
    setIsClient(true);
    
    // Load custom fonts based on event theme
    const link = document.createElement('link');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.fontFamily.title.split("'")[1])}:wght@400;500;600;700&family=${encodeURIComponent(theme.fontFamily.subtitle.split("'")[1])}:wght@400;500;600;700&display=swap`;
    link.href = fontUrl;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load Cashfree SDK
    const cashfreeScript = document.createElement('script');
    cashfreeScript.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    cashfreeScript.async = true;
    document.head.appendChild(cashfreeScript);
  }, [theme]);

  const loadGalleryFromDrive = async () => {
    if (!googleDriveFolderId) return;
    
    setIsLoadingGallery(true);
    try {
      const response = await fetch(`/api/drive-files?folderId=${googleDriveFolderId}`);
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
      // Special handling for gallery code - it's a gallery-only code
      if (code === galleryCode) {
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
      return;
    }
    setShowTicketBooking(true);
  };

  // Dynamic color classes - using CSS variables and conditional classes
  const getPrimaryButtonClass = () => {
    const colorMap: Record<string, string> = {
      teal: 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700',
      amber: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700',
      green: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    };
    return colorMap[theme.primaryColor] || colorMap.teal;
  };

  const getAccentTextClass = () => {
    const colorMap: Record<string, string> = {
      amber: 'text-amber-400',
      teal: 'text-teal-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
    };
    return colorMap[theme.accentColor] || 'text-amber-400';
  };

  const getPrimaryTextClass = () => {
    const colorMap: Record<string, string> = {
      teal: 'text-teal-500',
      amber: 'text-amber-500',
      green: 'text-green-500',
    };
    return colorMap[theme.primaryColor] || 'text-teal-500';
  };

  const primaryColorClass = getPrimaryButtonClass();
  const accentColorClass = getAccentTextClass();
  const primaryTextClass = getPrimaryTextClass();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} ${theme.textColor} relative overflow-hidden`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isClient && [...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 bg-${theme.accentColor}-400 rounded-full opacity-20`}
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
            <p className={`text-2xl md:text-3xl ${theme.textColor} mb-1`} style={{ fontFamily: theme.fontFamily.subtitle }}>
              Slanup&#39;s
            </p>
            <h1 className={`text-6xl md:text-8xl font-bold mb-2 ${theme.textColor}`} style={{ fontFamily: theme.fontFamily.title, letterSpacing: "0.05em" }}>
              {eventConfig.name.replace("Slanup's ", "").replace(" - Hyderabad", "")}
            </h1>
          </div>
          <p className={`text-xl md:text-2xl ${theme.textColor} mt-4 opacity-80`}>{theme.emoji} {new Date(eventConfig.date).getFullYear()}</p>
        </motion.div>

        {/* Invite Code Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto mb-16"
        >
          <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl`}>
            <div className="flex items-center justify-center mb-6">
              <Lock className={`w-12 h-12 ${primaryTextClass}`} />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">Enter Your Invite Code</h2>
            <p className={`${theme.textColor} opacity-70 text-center mb-6`}>Type the code shared by the team:</p>

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
                className={`w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 ${primaryTextClass.replace('text-', 'focus:ring-')} focus:border-transparent transition-all placeholder-gray-500 disabled:opacity-50 ${theme.textColor}`}
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
                  className={`w-full ${primaryColorClass} text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isCheckingStatus ? 'Checking...' : 'Unlock Access'}
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-2"
                >
                  <p className={`${primaryTextClass.replace('500', '400')} font-semibold`}>✓ Access Granted!</p>
                </motion.div>
              )}
            </div>

            {!isValidated && (
              <p className={`text-xs ${theme.textColor} opacity-50 text-center mt-6`}>
                Don&#39;t have a code? Contact us for an exclusive invite!
              </p>
            )}
          </div>
        </motion.div>

        {/* Booking Section OR Gallery Section */}
        <AnimatePresence>
          {isValidated && inviteCode.trim().toUpperCase() === galleryCode ? (
            // Show Google Drive Gallery for gallery code
            <motion.div
              key={galleryKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className={`w-8 h-8 ${accentColorClass} mr-2`} />
                  <h3 className="text-4xl font-bold">{eventConfig.name} Gallery</h3>
                  <Sparkles className={`w-8 h-8 ${accentColorClass} ml-2`} />
                </div>
                <div className="max-w-2xl mx-auto">
                  <p className={`${accentColorClass} text-xl font-semibold mb-2`}>Share your memories!</p>
                  <p className={`${theme.textColor} opacity-70 text-lg mb-4`}>Upload all your photos/videos:</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <a
                      href={`https://drive.google.com/drive/folders/${googleDriveFolderId}?usp=share_link`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${primaryColorClass} text-white px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2`}
                    >
                      <FolderUp className="w-5 h-5" />
                      Upload to Drive
                    </a>
                    <a
                      href="https://wa.link/l7il98"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${primaryColorClass} text-white px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp Us
                    </a>
                    <a
                      href="https://instagram.com/slanup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${primaryColorClass} text-white px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2`}
                    >
                      <Instagram className="w-5 h-5" />
                      DM on Insta
                    </a>
                  </div>
                </div>
              </div>

              {/* Gallery Grid */}
              {isLoadingGallery ? (
                <div className="text-center py-12">
                  <div className={`animate-spin w-12 h-12 border-4 border-${theme.primaryColor}-500 border-t-transparent rounded-full mx-auto mb-4`}></div>
                  <p className={`${theme.textColor} opacity-70`}>Loading gallery...</p>
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
                      <a
                        href={`/api/drive-image?id=${file.id}`}
                        download={file.name}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute bottom-2 right-2 ${primaryColorClass} text-white p-2 rounded-full transition-all transform hover:scale-110 shadow-lg z-10`}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 ${theme.textColor} opacity-70`}>
                  <div className="text-7xl mb-4">{theme.emoji}</div>
                  <p>No photos yet. Be the first to share!</p>
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
                <BookingReference booking={inviteCodeStatus.booking!} eventConfig={eventConfig} />
              ) : (
                <button 
                  onClick={handleBookTickets}
                  className={`${primaryColorClass} text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-2xl border-2 border-white/20 animate-pulse`}
                >
                  {theme.emoji} GET YOUR PASS - LET&apos;S GOOO! 🎉
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className={`text-center mt-16 py-8 border-t ${theme.textColor} opacity-20`}>
          <Link
            href={`/${eventName}/terms`}
            className={`${theme.textColor} opacity-70 hover:opacity-100 transition-colors underline text-sm font-medium inline-block mb-4`}
          >
            Event Terms & Conditions
          </Link>
          <p className={`${theme.textColor} opacity-50 text-xs`}>© 2025 Slanup. All rights reserved.</p>
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
            {inviteCode.trim().toUpperCase() === galleryCode && selectedMedia > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(selectedMedia - 1);
                }}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${primaryColorClass} text-white p-3 rounded-full transition-all z-10`}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {inviteCode.trim().toUpperCase() === galleryCode && selectedMedia < driveFiles.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(selectedMedia + 1);
                }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${primaryColorClass} text-white p-3 rounded-full transition-all z-10`}
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
              {inviteCode.trim().toUpperCase() === galleryCode && driveFiles[selectedMedia] ? (
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
              ) : null}
            </motion.div>
            
            {inviteCode.trim().toUpperCase() === galleryCode && driveFiles[selectedMedia] && (
              <a
                href={`/api/drive-image?id=${driveFiles[selectedMedia].id}`}
                download={driveFiles[selectedMedia].name}
                onClick={(e) => e.stopPropagation()}
                className={`absolute bottom-4 right-4 ${primaryColorClass} text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg z-10`}
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            )}

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
        {showTicketBooking && (
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

