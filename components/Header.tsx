"use client";

import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-colors">
      <Link href="/" className="flex items-end cursor-pointer hover:opacity-80 transition-opacity">
        <span className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight text-neutral-800">
          slanup
        </span>
        <span className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[var(--brand-green)] -ml-0.5">
          &apos;
        </span>
        <sup className="text-xs font-semibold text-[var(--brand-green)] ml-0.5 relative -top-3">
          beta
        </sup>
      </Link>
      <Link 
        href="/events" 
        className="text-neutral-700 hover:text-[var(--brand-green)] font-semibold text-base md:text-lg transition-colors duration-300 cursor-pointer"
      >
        Slanup Events
      </Link>
    </header>
  );
}
