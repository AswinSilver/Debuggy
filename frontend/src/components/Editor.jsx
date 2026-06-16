import React, { useMemo } from "react";

export default function Editor({ code, setCode, minHeight = "420px" }) {
  const lineNumbers = useMemo(() => {
    return Array.from({ length: code.split("\n").length }, (_, index) => index + 1).join("\n");
  }, [code]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#07070a]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-debug-red" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-emerald-500" />
        <span className="ml-3 font-mono text-xs text-zinc-500">debuggy-buffer.ai</span>
      </div>
      <div className="grid grid-cols-[54px_1fr]">
        <pre className="select-none border-r border-white/10 bg-white/[0.025] p-4 text-right font-mono text-sm leading-6 text-zinc-600">
          {lineNumbers}
        </pre>
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          style={{ minHeight }}
          className="w-full resize-y bg-transparent p-4 font-mono text-sm leading-6 text-zinc-100 outline-none"
          spellCheck="false"
          aria-label="Code editor"
        />
      </div>
    </div>
  );
}
