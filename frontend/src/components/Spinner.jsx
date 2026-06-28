import React from "react";

/** A loading spinner overlay for tool pages */
export default function Spinner({ label = "Analyzing with AI..." }) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center gap-5">
      {/* Rings */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500" />
        <div className="absolute inset-3 animate-spin-slow rounded-full border border-brand-500/10 border-r-brand-500/60" />
        <div className="absolute inset-6 animate-pulse-slow rounded-full bg-brand-500/10" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="mt-1 text-xs text-zinc-500">Nebula AI · Powered by Groq</p>
      </div>
    </div>
  );
}
