"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { api } from "@/lib/api/client";
import { hapticLight, hapticSuccess, hapticError, hapticSelection } from "@/lib/native/haptics";

export default function AppLoginPage() {
  const router = useRouter();
  const { isLoggedIn, isNewUser, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticLight();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setSending(true);
    try {
      await api.sendMagicLink(email);
      setStep("otp");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return;

    // iOS autofill may paste the full code into one input
    if (digits.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      hapticSelection();
      setOtp(newOtp);
      if (digits.length >= 6) {
        handleVerify(digits.slice(0, 6));
      } else {
        inputRefs.current[digits.length]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digits;
    hapticSelection();
    setOtp(newOtp);

    // Auto-advance to next input
    if (digits && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digits && index === 5) {
      const code = newOtp.join("");
      if (code.length === 6) {
        handleVerify(code);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      handleVerify(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setError("");
    setVerifying(true);
    try {
      const res = await api.verifyOtp(email, code);
      const { user, accessToken, refreshToken, isNewUser: isNew } = res.data;
      login(accessToken, refreshToken, user, isNew);
      hapticSuccess();
      setStep("success");
      setTimeout(() => {
        if (isNew) {
          router.replace("/app/onboarding");
        } else {
          router.replace("/app/feed");
        }
      }, 1500);
    } catch (err: unknown) {
      hapticError();
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    hapticLight();
    setError("");
    setSending(true);
    try {
      await api.sendMagicLink(email);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
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
      <main className="flex-grow flex flex-col items-center justify-start pt-16 md:justify-center md:pt-0 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="email"
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

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-lg text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent transition-all"
                      autoFocus
                      disabled={sending}
                      onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
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
                  We&apos;ll send you a 6-digit code to sign in — no password required.
                </p>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[var(--brand-green)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-[var(--brand-green)]" />
                </div>

                <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                  Enter your code
                </h1>
                <p className="text-neutral-500 mb-2">
                  We sent a 6-digit code to
                </p>
                <p className="text-neutral-800 font-semibold text-lg mb-8">
                  {email}
                </p>

                <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={i === 0 ? 6 : 1}
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={verifying}
                      className="w-12 h-14 text-center text-2xl font-bold bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-transparent transition-all disabled:opacity-50"
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mb-4"
                  >
                    {error}
                  </motion.p>
                )}

                {verifying && (
                  <div className="flex items-center justify-center gap-2 text-neutral-500 mb-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                )}

                <div className="flex flex-col items-center gap-3 mt-4">
                  <button
                    onClick={handleResend}
                    disabled={sending}
                    className="text-[var(--brand-green)] hover:text-[var(--brand-green-dark)] font-medium transition-colors disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Resend code"}
                  </button>
                  <button
                    onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                    className="text-neutral-400 hover:text-neutral-600 text-sm flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Use a different email
                  </button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                  You&apos;re in!
                </h1>
                <p className="text-neutral-500">
                  Redirecting...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
