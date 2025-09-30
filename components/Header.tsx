"use client";

import React from "react";

export default function Header() {
  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="flex items-end">
        <span className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight text-neutral-800">
          slanup
        </span>
        <span className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[var(--brand-green)] -ml-0.5">
          &apos;
        </span>
        <sup className="text-xs font-semibold text-[var(--brand-green)] ml-0.5 relative -top-3">
          beta
        </sup>
      </div>
      <button className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-2 px-5 md:px-6 rounded-full text-sm md:text-base transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:ring-opacity-50">
        Slanup&apos;s tropical Lau
      </button>
    </header>
  );
}