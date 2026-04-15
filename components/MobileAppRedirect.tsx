"use client";

import { useEffect, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/app/slanup/id6744076857";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function isMobile(): boolean {
  return isIOS() || isAndroid();
}

function isCapacitorApp(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor sets this on the window object
  return !!(window as unknown as Record<string, unknown>).Capacitor;
}

export default function MobileAppRedirect() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't redirect if already in Capacitor app
    if (isCapacitorApp()) return;
    // Don't redirect if already dismissed this session
    if (sessionStorage.getItem("app_redirect_dismissed")) return;

    if (isIOS() && isMobile()) {
      setShow(true);
    }
    // Android: no redirect, let them use website until Play Store is live
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 pb-8 text-center">
        <div className="w-16 h-16 bg-[var(--brand-green)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📱</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Get the Slanup App</h2>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          For the best experience with notifications, chats, and more — use our iOS app.
        </p>
        <a
          href={APP_STORE_URL}
          className="block w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3.5 rounded-2xl transition-colors text-center mb-3"
        >
          Download on App Store
        </a>
        <button
          onClick={() => {
            sessionStorage.setItem("app_redirect_dismissed", "1");
            setShow(false);
          }}
          className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Continue on website
        </button>
      </div>
    </div>
  );
}
