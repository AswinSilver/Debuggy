import React, { useState } from "react";
import { Repeat2, Loader2, ArrowRight, FileCode2, Info } from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import CopyBtn from "../components/CopyBtn";
import Spinner from "../components/Spinner";
import { post } from "../lib/api";

const LANGUAGES = ["JavaScript","TypeScript","Python","Java","C","C++","C#","Go","Rust","Ruby","PHP","Swift","Kotlin"];

export default function Converter({ sharedCode, sharedLang, toast }) {
  const [code, setCode]       = useState(sharedCode || "");
  const [from, setFrom]       = useState(sharedLang || "JavaScript");
  const [to, setTo]           = useState("Python");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!code.trim()) { toast("Paste some code first"); return; }
    if (from === to) { toast("Source and target must differ"); return; }
    setLoading(true); setResult(null);
    try {
      setResult(await post("/convert", { code, language: from, target_language: to }));
      toast("Conversion complete ✓");
    } catch { toast("Backend offline"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Language selectors row */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
            <Repeat2 size={18} className="text-brand-500" />
          </div>
          <div>
            <p className="eyebrow">Advanced Tool</p>
            <h2 className="text-lg font-black text-white">Code Converter</h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={from} onChange={e => setFrom(e.target.value)} className="select flex-1 min-w-[140px]">
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <ArrowRight size={16} className="text-brand-500" />
          </div>
          <select value={to} onChange={e => setTo(e.target.value)} className="select flex-1 min-w-[140px]">
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
          <button className="btn-primary shrink-0" onClick={run} disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Converting…</> : <><Repeat2 size={16} /> Convert</>}
          </button>
        </div>
      </div>

      {/* Editor + output side by side */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Input */}
        <div className="card p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
            Source — {from}
          </p>
          <CodeEditor code={code} onChange={setCode} minHeight="420px" label={`input.${from.toLowerCase()}`} />
        </div>

        {/* Output */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Output — {to}
            </p>
            {result && <CopyBtn text={result.converted_code} />}
          </div>
          {loading ? (
            <Spinner label={`Converting to ${to}…`} />
          ) : result ? (
            <pre className="code-block min-h-[420px] text-xs">{result.converted_code}</pre>
          ) : (
            <div className="empty-state min-h-[420px]">
              <FileCode2 size={36} className="text-zinc-700" />
              <p className="text-sm">Converted code will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversion notes */}
      {result?.notes && (
        <div className="card p-5 animate-fade-in">
          <div className="mb-3 flex items-center gap-2">
            <Info size={17} className="text-amber-400" />
            <h3 className="font-black text-white">Conversion Notes</h3>
          </div>
          <p className="text-sm leading-7 text-zinc-300 whitespace-pre-line">{result.notes}</p>
        </div>
      )}
    </div>
  );
}
