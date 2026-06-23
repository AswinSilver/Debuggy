import React, { useState } from "react";
import { Gauge, Loader2, Cpu, TrendingUp, Clock, Database } from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import Spinner from "../components/Spinner";
import LanguageSelect from "../components/LanguageSelect";
import { post } from "../lib/api";

function BigOChip({ label, value }) {
  return (
    <div className="card flex flex-col items-center justify-center p-5 text-center">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-mono text-3xl font-black text-white">{value || "—"}</p>
    </div>
  );
}

export default function Complexity({ sharedCode, setSharedCode, sharedLang, setSharedLang, toast }) {
  const [code, setCode]       = useState(sharedCode || "");
  const [lang, setLang]       = useState(sharedLang || "JavaScript");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!code.trim()) { toast("Paste some code first"); return; }
    setLoading(true); setResult(null);
    try {
      setResult(await post("/complexity", { code, language: lang }));
      toast("Complexity analysis done ✓");
    } catch { toast("Backend offline"); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr] animate-fade-up">
      {/* Input */}
      <div className="card p-5 h-fit">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
            <Gauge size={18} className="text-brand-500" />
          </div>
          <div>
            <p className="eyebrow">Advanced Tool</p>
            <h2 className="text-lg font-black text-white">Complexity Analyzer</h2>
          </div>
        </div>
        <LanguageSelect
          value={lang}
          onChange={(newLang) => {
            setLang(newLang);
            setSharedLang(newLang);
          }}
          className="mb-3"
        />
        <CodeEditor
          code={code}
          onChange={(newCode) => {
            setCode(newCode);
            setSharedCode(newCode);
          }}
          minHeight="320px"
        />
        <button className="btn-primary mt-3 w-full" onClick={run} disabled={loading}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</> : <><Gauge size={16} /> Analyze Complexity</>}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-5">
        {loading ? <div className="card p-6"><Spinner label="Computing algorithmic complexity…" /></div>
        : !result ? (
          <div className="empty-state">
            <Gauge size={40} className="text-zinc-700" />
            <p className="text-sm">Run the analyzer to get Big-O ratings and optimization tips</p>
          </div>
        ) : (
          <>
            {/* Big-O chips */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <BigOChip label="Time Complexity"  value={result.time_complexity} />
              <BigOChip label="Space Complexity" value={result.space_complexity} />
              <div className="card flex flex-col items-center justify-center p-5 text-center">
                <p className="eyebrow mb-2">Efficiency Rating</p>
                <p className="text-2xl font-black text-white">{result.rating}</p>
              </div>
              <div className="card flex flex-col items-center justify-center p-5 text-center">
                <p className="eyebrow mb-2">Efficiency Score</p>
                <p className="text-2xl font-black text-white">{result.score}/100</p>
                <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${result.score}%` }} />
                </div>
              </div>
            </div>

            {/* Bottlenecks */}
            {result.bottlenecks?.length > 0 && (
              <div className="card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Cpu size={17} className="text-brand-500" />
                  <h3 className="font-black text-white">Performance Bottlenecks</h3>
                </div>
                <div className="space-y-2">
                  {result.bottlenecks.map((b, i) => (
                    <div key={i} className="result-item flex gap-3">
                      <Clock size={14} className="mt-0.5 shrink-0 text-amber-500" />
                      <p className="text-sm text-zinc-300">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp size={17} className="text-emerald-400" />
                  <h3 className="font-black text-white">Optimization Suggestions</h3>
                </div>
                <div className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="result-item flex gap-3">
                      <Database size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                      <p className="text-sm text-zinc-300">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI narrative */}
            <div className="card p-5">
              <h3 className="mb-3 font-black text-white">AI Algorithmic Narrative</h3>
              <p className="text-sm leading-7 text-zinc-300 whitespace-pre-line">{result.analysis}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
