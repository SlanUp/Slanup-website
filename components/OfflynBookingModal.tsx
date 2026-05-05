"use client";

import { motion } from "framer-motion";
import { X, ExternalLink, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface OfflynBookingModalProps {
  ticketUrl: string;
  experienceId?: string;
  inviteCode: string;
  eventName?: string;
  displayName?: string;
  onClose: () => void;
  onConfirmed?: () => void;
}

type ConfirmStatus = "idle" | "confirming" | "confirmed" | "error";

export default function OfflynBookingModal({
  ticketUrl,
  experienceId,
  inviteCode,
  eventName,
  displayName = "Get Your Tickets",
  onClose,
  onConfirmed,
}: OfflynBookingModalProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatus>("idle");
  const confirmedRef = useRef(false);

  // Whether the iframe has been initialized (credentialless + src set).
  // We render the <iframe> WITHOUT a src, then use a callback ref to
  // set credentialless FIRST, then src — avoiding the race condition
  // where the iframe loads with the real cookie jar before credentialless
  // takes effect.
  const iframeInitialized = useRef(false);

  // Count iframe load events.
  //
  // From the HAR: offlyn uses Next.js RSC for ALL in-app navigations
  // (signup, auth, checkout) — these are client-side route changes that
  // do NOT fire the iframe "load" event.
  //
  // The ONLY full-document navigation after initial load is the
  // post-payment 307 redirect:
  //   /experiences/{id}/ticket  →  307  →  /e/{slug}/ticket
  //
  // So:  load #1 = initial page render  (skip)
  //      load #2 = ticket page landed   = PAYMENT SUCCESS
  const loadCountRef = useRef(0);

  // Unique key per modal mount — React recreates the iframe DOM element,
  // and the cache-busting param avoids stale HTTP cache.
  const [iframeKey] = useState(() => Date.now());

  // ── Lock body scroll while modal is open ──────────────────────────
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // ── Fallback link if iframe doesn't render within 8 s ─────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (!iframeLoaded) setLoadError(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [iframeLoaded]);

  // ── Idempotent confirm — locks invite code on our backend ─────────
  const confirm = useCallback(
    async (source: "iframe-nav" | "postmessage") => {
      if (confirmedRef.current) return;
      confirmedRef.current = true;
      setConfirmStatus("confirming");
      try {
        const res = await fetch("/api/offlyn/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviteCode,
            eventName,
            experienceId,
            offlynRef: experienceId || ticketUrl,
            source,
          }),
        });
        if (!res.ok) throw new Error(`Confirm failed: ${res.status}`);
        setConfirmStatus("confirmed");
        onConfirmed?.();
      } catch (err) {
        console.error("[Offlyn] Confirm error:", err);
        setConfirmStatus("error");
        confirmedRef.current = false;
      }
    },
    [inviteCode, eventName, experienceId, ticketUrl, onConfirmed],
  );

  // Baseline: the latest guest timestamp when the modal opened.
  // Used to verify that a new guest was actually added (vs. logout nav).
  const baselineTimestampRef = useRef<string | null>(null);

  // Fetch the baseline snapshot of the latest guest
  const snapshotBaseline = useCallback(async () => {
    if (!experienceId) return;
    try {
      const res = await fetch("/api/offlyn/check-new-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experienceId }),
      });
      const data = await res.json();
      if (data?.latestTimestamp) {
        baselineTimestampRef.current = data.latestTimestamp;
        console.log(`[Offlyn] baseline guest timestamp: ${data.latestTimestamp} (${data.guestCount} guests)`);
      }
    } catch (err) {
      console.warn("[Offlyn] baseline snapshot failed:", err);
    }
  }, [experienceId]);

  // Verify that a new guest exists since baseline (confirms real payment)
  const verifyNewGuest = useCallback(async (): Promise<boolean> => {
    if (!experienceId) return false;
    try {
      const res = await fetch("/api/offlyn/check-new-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId,
          baselineTimestamp: baselineTimestampRef.current,
        }),
      });
      const data = await res.json();
      return data?.hasNewGuest === true;
    } catch {
      return false;
    }
  }, [experienceId]);

  // ── PRIMARY SIGNAL: iframe load event + guest-list verification ────
  //
  // Load events fire on full-document navigations inside the iframe.
  // Offlyn uses Next.js RSC for most in-app nav (no load events), but
  // BOTH payment-success AND sign-out cause full navigations:
  //   - Payment: /experiences/{id}/ticket → 307 → /e/{slug}/ticket
  //   - Sign-out: navigates to /e/{slug}/signup
  //
  // So we can't trust load events alone. After load #2+, we verify
  // with the offlyn guest API: if a new guest was added since we
  // opened the modal, it's a real payment. Otherwise it's just a
  // navigation (logout, page refresh, etc).
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = async () => {
      loadCountRef.current++;
      setIframeLoaded(true);

      if (loadCountRef.current === 1) {
        console.log("[Offlyn] iframe initial load — snapshotting baseline");
        await snapshotBaseline();
        return;
      }

      console.log(`[Offlyn] iframe load #${loadCountRef.current} — verifying with guest API…`);

      // Verify: did a new guest actually appear?
      // Retry up to 3 times with delays (offlyn API may lag a few seconds)
      for (let attempt = 0; attempt < 3; attempt++) {
        if (confirmedRef.current) return;
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 2000));
        }
        const hasNew = await verifyNewGuest();
        if (hasNew) {
          console.log(`[Offlyn] ✅ New guest verified (attempt ${attempt + 1}) — confirming payment`);
          confirm("iframe-nav");
          return;
        }
      }

      console.log("[Offlyn] ⚠️ No new guest found — ignoring navigation (likely sign-out)");
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [confirm, snapshotBaseline, verifyNewGuest]);

  // Cache-busting URL — ensures no HTTP cache serves a stale page
  const iframeSrc = `${ticketUrl}${ticketUrl.includes("?") ? "&" : "?"}_t=${iframeKey}`;

  // ── FUTURE-PROOF: postMessage listener ────────────────────────────
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!/offlyn\.(life|club)/i.test(event.origin)) return;
      const d = event.data;
      if (
        d?.type === "payment_success" ||
        d?.event === "ticket_confirmed" ||
        (typeof d === "string" && /ticket|paid|success/i.test(d))
      ) {
        confirm("postmessage");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [confirm]);

  // ── BACKGROUND POLLER: catches payments even if load event is missed ──
  // Polls every 5s after baseline is set. Acts as a safety net.
  useEffect(() => {
    if (!experienceId) return;

    const interval = setInterval(async () => {
      if (confirmedRef.current || !baselineTimestampRef.current) return;
      const hasNew = await verifyNewGuest();
      if (hasNew) {
        console.log("[Offlyn] ✅ Background poll detected new guest");
        confirm("iframe-nav");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [experienceId, confirm, verifyNewGuest]);

  // ── Callback ref: sets credentialless BEFORE src ──────────────────
  // Chrome/Edge: `credentialless` gives the iframe an ephemeral storage
  // partition (localStorage + cookies) — completely fresh session.
  // Safari/Firefox: not supported; the iframe reuses offlyn.life's
  // existing localStorage. A small hint tells the user how to log out
  // within offlyn if they see a stale session.
  const iframeCallbackRef = useCallback(
    (el: HTMLIFrameElement | null) => {
      iframeRef.current = el;
      if (!el || iframeInitialized.current) return;
      iframeInitialized.current = true;

      if (
        typeof HTMLIFrameElement !== "undefined" &&
        "credentialless" in HTMLIFrameElement.prototype
      ) {
        el.setAttribute("credentialless", "");
        console.log("[Offlyn] credentialless iframe (fresh session)");
      }

      el.src = iframeSrc;
    },
    [iframeSrc],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-black w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl overflow-hidden border border-amber-500/20 shadow-2xl flex flex-col"
        style={{
          height: "min(92vh, 900px)",
          boxShadow:
            "0 0 60px rgba(255,215,0,0.15), 0 25px 50px -12px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-amber-500/20 bg-gradient-to-r from-black via-neutral-950 to-black flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-amber-400 text-lg">🎟️</span>
            <h2
              className="text-white text-base font-semibold tracking-wide truncate"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {displayName}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400/80 hover:text-amber-400 p-2 rounded-full hover:bg-amber-500/10 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe */}
        <div className="relative flex-1 bg-white overflow-hidden">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-amber-300 text-sm tracking-wider">
                Loading checkout…
              </p>
              {loadError && (
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 text-xs text-amber-400 underline"
                >
                  Taking too long? Open checkout in a new tab →
                </a>
              )}
            </div>
          )}
          <iframe
            key={iframeKey}
            ref={iframeCallbackRef}
            title={displayName}
            className="w-full h-full"
            style={{ border: "none" }}
            allow="payment; clipboard-write; encrypted-media; geolocation"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals allow-storage-access-by-user-activation"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-black border-t border-amber-500/10 text-center flex-shrink-0">
          {confirmStatus === "confirmed" ? (
            <div className="flex items-center justify-center gap-2 text-green-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Booking confirmed — you can close this window.</span>
            </div>
          ) : confirmStatus === "confirming" ? (
            <p className="text-[11px] text-amber-300 tracking-wider">
              Confirming your booking…
            </p>
          ) : confirmStatus === "error" ? (
            <p className="text-[11px] text-red-400 tracking-wider">
              Something went wrong — try closing and reopening.
            </p>
          ) : (
            <p className="text-[10px] text-neutral-500 tracking-wider">
              Secure checkout powered by{" "}
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500/70 hover:text-amber-400 underline"
              >
                offlyn
              </a>
              <span className="mx-1.5">·</span>
              Seeing someone else&apos;s ticket? Tap ☰ inside offlyn to sign out.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
