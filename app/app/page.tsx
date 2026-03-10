"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";

export default function AppLoginPage() {
  const router = useRouter();
  const { isLoggedIn, isNewUser, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      if (isNewUser) {
        router.replace("/app/onboarding");
      } else {
        router.replace("/app/feed");
      }
    }
  }, [isLoading, isLoggedIn, isNewUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setSending(true);
    try {
      await api.sendMagicLink(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 md:px-10 flex justify-between items-center w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-end hover:opacity-80 transition-opacity">
          <span className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight text-neutral-800">
            slanup
          </span>
          <span className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[var(--brand-green)] -ml-0.5">
            &apos;
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[var(--brand-green)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-[var(--brand-green)]" />
                </div>

                <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                  Welcome to Slanup
                </h1>
                <p className="text-neutral-500 mb-8">
                  Enter your email to get started. No passwords needed.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent transition-all"
                      autoFocus
                      disabled={sending}
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-4 px-6 rounded-2xl text-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Continue with email
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-neutral-400 text-xs mt-6">
                  We&apos;ll send you a magic link to sign in — no password required.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                  Check your email
                </h1>
                <p className="text-neutral-500 mb-4">
                  We sent a magic link to
                </p>
                <p className="text-neutral-800 font-semibold text-lg mb-6">
                  {email}
                </p>
                <p className="text-neutral-400 text-sm mb-8">
                  Click the link in the email to sign in. The link expires in 15 minutes.
                </p>

                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-[var(--brand-green)] hover:text-[var(--brand-green-dark)] font-medium transition-colors"
                >
                  Use a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
