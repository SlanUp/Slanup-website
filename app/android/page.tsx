"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Users, Download, Globe, ExternalLink } from "lucide-react";
import Header from "@/components/Header";

const GOOGLE_GROUP_URL = "https://groups.google.com/g/slanup-test";
const PLAY_OPTIN_URL = "https://play.google.com/apps/testing/com.slanup.app";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.slanup.app";

export default function AndroidPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-800">
      <Header />

      <main className="flex-grow w-full max-w-xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
            Slanup on Android
          </h1>
          <p className="text-neutral-500 text-base mb-10">
            We&apos;re in closed beta on Google Play. Pick your path:
          </p>
        </motion.div>

        {/* Option 1: Beta install */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-green)]/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-[var(--brand-green)]" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Get the beta app
            </h2>
          </div>

          <ol className="space-y-5 mb-2">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center">
                1
              </span>
              <div className="flex-1">
                <p className="text-sm text-neutral-800 font-medium mb-2">
                  Join our testers Google Group
                </p>
                <a
                  href={GOOGLE_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] px-4 py-2 rounded-full transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Open group
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  On the group page, ignore any &quot;you don&apos;t have permission&quot; message and tap the
                  <span className="font-semibold text-neutral-800"> &quot;Join group&quot; </span>
                  button at the top right. Make sure you&apos;re signed into Google.
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center">
                2
              </span>
              <div className="flex-1">
                <p className="text-sm text-neutral-800 font-medium mb-2">
                  Become a tester
                </p>
                <a
                  href={PLAY_OPTIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-2 rounded-full transition-colors"
                >
                  Become tester
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Sign in with the same Google account you used for the group.
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center">
                3
              </span>
              <div className="flex-1">
                <p className="text-sm text-neutral-800 font-medium mb-2">
                  Install from Play Store
                </p>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 px-4 py-2 rounded-full transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Open Play Store
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  May take a few minutes to appear after opting in.
                </p>
              </div>
            </li>
          </ol>
        </motion.section>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-neutral-200"></div>
          <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
            or
          </span>
          <div className="flex-1 h-px bg-neutral-200"></div>
        </div>

        {/* Option 2: Web */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
              <Globe className="w-5 h-5 text-neutral-700" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Use it in your browser
            </h2>
          </div>
          <p className="text-neutral-600 text-sm mb-5 leading-relaxed">
            No install needed. Works on any modern Android browser.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 px-6 rounded-full text-sm transition-colors shadow-md"
          >
            Open web app
          </Link>
        </motion.section>
      </main>
    </div>
  );
}
