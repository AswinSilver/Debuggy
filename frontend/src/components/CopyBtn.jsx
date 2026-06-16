import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { copyText } from "../lib/utils";

export default function CopyBtn({ text, className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy"}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08]
        bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-zinc-300
        transition hover:border-brand-500/40 hover:text-white ${className}`}
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
