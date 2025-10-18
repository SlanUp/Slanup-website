"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  Keyboard, 
  UserCheck, 
  UserX, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Shield
} from "lucide-react";
import { Booking } from "@/lib/types";
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export default function CheckInPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [scanMode, setScanMode] = useState<"qr" | "manual">("manual");
  const [manualCode, setManualCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"success" | "error" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [wasScanned, setWasScanned] = useState(false);
  const scanCallbackRef = useRef<boolean>(true);

  // Authentication check
  const handleAuth = () => {
    // Simple authentication - in production, use proper auth
    if (authCode === process.env.NEXT_PUBLIC_CHECKIN_CODE || authCode === "SLANUP2025") {
      setIsAuthenticated(true);
      localStorage.setItem("checkinAuth", "true");
    } else {
      alert("Invalid authentication code");
    }
  };

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem("checkinAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [codeReader]);

  // Start QR Scanner with ZXing
  const startQRScanner = async () => {
    try {
      setIsScanning(true);
      console.log('🎥 Starting ZXing QR scanner...');
      
      // Wait a moment for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        console.error('❌ Video element not found after waiting');
        throw new Error('Video element not available');
      }
      
      console.log('✅ Video element found, initializing ZXing reader...');
      
      // Initialize ZXing reader
      const reader = new BrowserMultiFormatReader();
      setCodeReader(reader);
      
      // Reset callback ref
      scanCallbackRef.current = true;
      
      // Start decoding from video element with device selection
      try {
        await reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          // Immediately check if we should still process callbacks
          if (!scanCallbackRef.current) {
            console.log('🚫 Ignoring callback - scanning stopped');
            return;
          }
          
          if (result && !isProcessing) {
            const rawCode = result.getText().trim();
            
            // Prevent processing the same code multiple times
            if (rawCode === lastScannedCode) {
              return;
            }
            
            console.log('✅ QR Code detected with ZXing:', rawCode);
            
            // Immediately disable further callbacks
            scanCallbackRef.current = false;
            
            setLastScannedCode(rawCode);
            setIsProcessing(true);
            
            // Process the detected QR code
            let referenceNumber = rawCode;
            
            // Handle different QR formats
            if (referenceNumber.includes("SLANUP-DIWALI-")) {
              const parts = referenceNumber.split("SLANUP-DIWALI-");
              if (parts[1]) {
                const refPart = parts[1].split("-")[0];
                referenceNumber = refPart;
              }
            } else if (referenceNumber.includes("DIW")) {
              const match = referenceNumber.match(/DIW\w+/i);
              if (match) {
                referenceNumber = match[0].toUpperCase();
              }
            }
            
            console.log('📝 Processed reference number:', referenceNumber);
            
            // Stop scanning immediately to prevent duplicates
            stopQRScanner();
            
            // Switch to manual mode to show the form UI
            setScanMode("manual");
            
            // Set the manual code input to show what was scanned
            setManualCode(referenceNumber);
            setWasScanned(true);
            
            // Process the check-in
            handleCheckIn(referenceNumber);
          }
          
          if (err && !(err instanceof NotFoundException)) {
            console.error('❌ QR scanning error:', err);
          }
        });
        
        console.log('✅ ZXing scanner started successfully');
      } catch (cameraError) {
        console.error('❌ Camera access error:', cameraError);
        const errorMessage = cameraError instanceof Error ? cameraError.message : 'Unknown error';
        throw new Error(`Camera access failed: ${errorMessage}`);
      }
      
    } catch (error) {
      console.error("❌ Error starting QR scanner:", error);
      setIsScanning(false);
      alert(
        "Unable to start QR scanner. This might be because:\n" +
        "1. Camera permission not granted\n" +
        "2. Camera is being used by another app\n" +
        "3. Browser compatibility issue\n" +
        "4. Video element not ready\n\n" +
        "Please use Manual Entry instead."
      );
      setScanMode("manual");
    }
  };

  // Stop QR Scanner
  const stopQRScanner = () => {
    console.log('⏹️ Stopping QR scanner...');
    
    // Immediately disable callbacks
    scanCallbackRef.current = false;
    
    setIsScanning(false);
    setIsProcessing(false);
    setLastScannedCode('');
    
    // Stop ZXing reader
    if (codeReader) {
      try {
        codeReader.reset();
      } catch (error) {
        console.log('⚠️ Error resetting code reader:', error);
      }
      setCodeReader(null);
    }
    
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    console.log('✅ QR scanner stopped');
  };


  // Handle check-in
  const handleCheckIn = async (code: string) => {
    setIsLoading(true);
    setCheckInStatus(null);
    setStatusMessage("");
    setIsProcessing(false); // Reset processing state

    try {
      // First, get booking details
      const response = await fetch("/api/checkin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        setCheckInStatus("error");
        setStatusMessage(data.error || "Invalid code");
        setBooking(null);
        return;
      }

      setBooking(data.booking);

      // Check if already checked in
      if (data.booking.checkedIn) {
        setCheckInStatus("error");
        setStatusMessage("Guest already checked in!");
      } else {
        setCheckInStatus(null);
        setStatusMessage("Guest found. Ready to check in.");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      setCheckInStatus("error");
      setStatusMessage("Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  // Approve check-in
  const handleApprove = async () => {
    if (!booking) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingId: booking.id,
          referenceNumber: booking.referenceNumber 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCheckInStatus("success");
        setStatusMessage(`✅ ${booking.customerName} checked in successfully!`);
        
        // Clear after 3 seconds
        setTimeout(() => {
          setBooking(null);
          setManualCode("");
          setCheckInStatus(null);
          setStatusMessage("");
        }, 3000);
      } else {
        setCheckInStatus("error");
        setStatusMessage(data.error || "Failed to check in");
      }
    } catch (error) {
      console.error("Error approving check-in:", error);
      setCheckInStatus("error");
      setStatusMessage("Failed to approve check-in");
    } finally {
      setIsLoading(false);
    }
  };

  // Reject check-in
  const handleReject = () => {
    setBooking(null);
    setManualCode("");
    setCheckInStatus(null);
    setStatusMessage("Check-in rejected");
    
    setTimeout(() => {
      setStatusMessage("");
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/10"
        >
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Event Check-In</h1>
          <p className="text-gray-400 text-center mb-6">Enter authentication code to access check-in system</p>
          
          <input
            type="password"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAuth()}
            placeholder="Enter security code"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          
          <button
            onClick={handleAuth}
            className="w-full mt-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold py-3 rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all"
          >
            Access Check-In System
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 pt-6 px-2"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Event Check-In</h1>
          <p className="text-sm sm:text-base text-gray-400">Slanup&apos;s Diwali Party 2025</p>
        </motion.div>

        {/* Mode Selection */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
          <button
            onClick={async () => {
              setScanMode("qr");
              setWasScanned(false);
              // Wait for state update and DOM render
              await new Promise(resolve => setTimeout(resolve, 50));
              startQRScanner();
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center ${
              scanMode === "qr"
                ? "bg-amber-400 text-slate-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <QrCode className="w-5 h-5 mr-2" />
            <span className="text-sm sm:text-base">Scan QR Code</span>
          </button>
          
          <button
            onClick={() => {
              setScanMode("manual");
              setWasScanned(false);
              stopQRScanner();
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center ${
              scanMode === "manual"
                ? "bg-amber-400 text-slate-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Keyboard className="w-5 h-5 mr-2" />
            <span className="text-sm sm:text-base">Manual Entry</span>
          </button>
        </div>

        {/* Scanner/Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 mb-6 sm:mb-8 mx-2"
        >
          {scanMode === "qr" ? (
            <div className="text-center">
              <div className="relative inline-block w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md mx-auto rounded-lg sm:rounded-xl mb-4"
                  style={{ maxHeight: '400px', height: '300px', objectFit: 'cover' }}
                />
                {/* QR Code targeting overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 border-2 border-amber-400 rounded-lg">
                    <div className="absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg"></div>
                  </div>
                </div>
              </div>
              
              
              <div className="space-y-2">
                <p className="text-gray-400">📱 Position QR code within the yellow frame</p>
                <p className="text-sm text-gray-500">
                  {isProcessing 
                    ? '⚙️ Processing QR code...' 
                    : isScanning 
                    ? '🔍 Scanning...' 
                    : '📷 Starting camera...'
                  }
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4">
                <button
                  onClick={stopQRScanner}
                  className="px-4 py-2 text-amber-400 hover:text-amber-300 border border-amber-400/30 rounded-lg text-sm sm:text-base"
                >
                  Cancel Scanning
                </button>
                <button
                  onClick={() => {
                    stopQRScanner();
                    setScanMode('manual');
                  }}
                  className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm sm:text-base"
                >
                  Switch to Manual
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                {wasScanned ? (
                  <span className="flex items-center gap-2">
                    🎯 QR Code Scanned Successfully
                    <span className="text-green-400 text-xs">✓</span>
                  </span>
                ) : (
                  "Enter Reference Number (e.g., DIW123456ABCD)"
                )}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => !wasScanned && setManualCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && !wasScanned && handleCheckIn(manualCode)}
                  placeholder={wasScanned ? "Scanned from QR Code" : "DIW123456ABCD"}
                  className={`w-full sm:flex-1 px-4 py-3 border rounded-lg sm:rounded-xl font-mono text-base sm:text-lg focus:outline-none ${
                    wasScanned 
                      ? 'bg-green-500/20 border-green-500/30 text-green-400 cursor-not-allowed'
                      : 'bg-white/10 border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-400 focus:border-transparent'
                  }`}
                  disabled={isLoading || wasScanned}
                  readOnly={wasScanned}
                />
                {wasScanned ? (
                  <button
                    onClick={async () => {
                      setManualCode('');
                      setWasScanned(false);
                      setScanMode("qr");
                      await new Promise(resolve => setTimeout(resolve, 50));
                      startQRScanner();
                    }}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold rounded-lg sm:rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all text-sm sm:text-base"
                  >
                    📷 Scan Again
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckIn(manualCode)}
                    disabled={isLoading || !manualCode}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold rounded-lg sm:rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-start sm:items-center gap-2 sm:gap-3 mx-2 ${
                checkInStatus === "success"
                  ? "bg-green-500/20 border border-green-500/30"
                  : checkInStatus === "error"
                  ? "bg-red-500/20 border border-red-500/30"
                  : "bg-amber-500/20 border border-amber-500/30"
              }`}
            >
              {checkInStatus === "success" ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
              ) : checkInStatus === "error" ? (
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 flex-shrink-0" />
              )}
              <span className="text-white text-sm sm:text-base">{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Details */}
        <AnimatePresence>
          {booking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 mx-2"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-amber-400">Guest Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Name</p>
                  <p className="text-lg sm:text-xl font-semibold break-words">{booking.customerName}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Reference Number</p>
                  <p className="text-base sm:text-xl font-mono break-all">{booking.referenceNumber}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Email</p>
                  <p className="text-sm sm:text-base break-all">{booking.customerEmail}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Phone</p>
                  <p className="text-sm sm:text-base">{booking.customerPhone}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Ticket Type</p>
                  <p className="capitalize text-sm sm:text-base">{booking.ticketType}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Payment Status</p>
                  <p className={`capitalize text-sm sm:text-base ${
                    booking.paymentStatus === "completed" ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {booking.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Check-in Status */}
              {booking.checkedIn && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <p className="text-yellow-400 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Guest Already Checked In!
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    Please verify guest identity before allowing re-entry.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {!booking.checkedIn && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" />
                        Approve Check-In
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleReject}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <UserX className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}