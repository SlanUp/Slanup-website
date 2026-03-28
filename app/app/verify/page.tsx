"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import { Suspense } from "react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (verifiedRef.current) return;
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setError("Your login link has expired or is invalid. Please request a new one.");
      return;
    }

    // If opened in a mobile browser (not inside the Capacitor WebView),
    // redirect to the app via custom URL scheme
    const isCapacitor = typeof window !== 'undefined' && !!(window as unknown as Record<string, unknown>).Capacitor;
    if (!isCapacitor && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = `slanup://verify?token=${token}`;
      // Give the app a moment to open; if it doesn't, the page continues normally
      return;
    }

    verifiedRef.current = true;

    (async () => {
      try {
        const res = await api.verifyMagicLink(token);
        const { user, accessToken, refreshToken, isNewUser } = res.data;
        login(accessToken, refreshToken, user, isNewUser);
        setStatus("success");

        setTimeout(() => {
          if (isNewUser) {
            router.replace("/app/onboarding");
          } else {
            router.replace("/app/feed");
          }
        }, 1500);
      } catch (err: unknown) {
        setStatus("error");
        setError("Your login link has expired. Please request a new one.");
      }
    })();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-[var(--brand-green)] animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Signing you in...</h1>
            <p className="text-neutral-500">Just a moment</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">You&apos;re in!</h1>
            <p className="text-neutral-500">Redirecting...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Link expired</h1>
            <p className="text-neutral-500 mb-6">{error}</p>
            <a
              href="/app"
              className="inline-block bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-8 rounded-2xl transition-colors"
            >
              Try again
            </a>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--brand-green)] animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
