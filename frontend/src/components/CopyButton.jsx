import React from "react";
import { Copy } from "lucide-react";

export default function CopyButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-zinc-300 transition hover:border-debug-red/50 hover:text-white"
      title="Copy"
    >
      <Copy size={16} />
    </button>
  );
}
