import React, { useMemo } from "react";

export default function CodeEditor({ code, onChange, minHeight = "360px", label = "Code Editor" }) {
  const lines = useMemo(
    () => Array.from({ length: code.split("\n").length }, (_, i) => i + 1).join("\n"),
    [code]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#07070b]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.025] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 font-mono text-[11px] text-zinc-600">{label}</span>
      </div>
      {/* Editor body */}
      <div className="flex">
        {/* Line numbers */}
        <pre
          aria-hidden
          className="select-none border-r border-white/[0.05] bg-white/[0.02] px-3 py-4
                     text-right font-mono text-xs leading-6 text-zinc-700 min-w-[44px]"
        >
          {lines}
        </pre>
        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight }}
          spellCheck={false}
          className="flex-1 resize-y bg-transparent py-4 pl-4 pr-3 font-mono text-sm
                     leading-6 text-zinc-100 outline-none placeholder:text-zinc-700"
          placeholder="// Paste your code here..."
          aria-label={label}
        />
      </div>
    </div>
  );
}
