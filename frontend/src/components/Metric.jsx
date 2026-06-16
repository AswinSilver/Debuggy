import React from "react";

export default function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <strong className="block text-xl font-black text-white">{value}</strong>
      <span className="mt-1 block text-xs leading-4 text-zinc-500">{label}</span>
    </div>
  );
}
