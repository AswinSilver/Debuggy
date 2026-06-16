import React, { useState } from "react";
import { SearchCode, Loader2, Wrench, Code2, BookText } from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import SeverityBadge from "../components/SeverityBadge";
import CopyBtn from "../components/CopyBtn";
import Spinner from "../components/Spinner";
import { post } from "../lib/api";

const LANGUAGES = ["JavaScript","TypeScript","Python","Java","C","C++","C#","Go","Rust","Ruby","PHP","Swift","Kotlin"];

export default function Smells({ sharedCode, sharedLang, toast }) {
  const [code, setCode]       = useState(sharedCode || "");
  const [lang, setLang]       = useState(sharedLang || "JavaScript");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!code.trim()) { toast("Paste some code first"); return; }
    setLoading(true); setResult(null);
    try {
      setResult(await post("/smells", { code, language: lang }));
      toast("Smell scan complete ✓");
    } catch { toast("Backend offline"); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr] animate-fade-up">
      {/* Input */}
      <div className="card p-5 h-fit">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
            <SearchCode size={18} className="text-brand-500" />
          </div>
          <div>
            <p className="eyebrow">Advanced Tool</p>
            <h2 className="text-lg font-black text-white">Code Smell Detector</h2>
          </div>
        </div>
        <select value={lang} onChange={e => setLang(e.target.value)} className="select mb-3 w-full">
          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
        </select>
        <CodeEditor code={code} onChange={setCode} minHeight="320px" />
        <button className="btn-primary mt-3 w-full" onClick={run} disabled={loading}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Scanning…</> : <><SearchCode size={16} /> Detect Code Smells</>}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-5">
        {loading ? <div className="card p-6"><Spinner label="Analyzing code quality…" /></div>
        : !result ? (
          <div className="empty-state">
            <SearchCode size={40} className="text-zinc-700" />
            <p className="text-sm">Find SOLID violations, long methods, dead code, and maintainability issues</p>
          </div>
        ) : (
          <>
            {/* Findings */}
            <div className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Wrench size={17} className="text-brand-500" />
                <h3 className="font-black text-white">Detected Smells</h3>
                <span className="ml-auto rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-bold text-brand-400">
                  {result.findings?.length ?? 0} found
                </span>
              </div>
              {result.findings?.length ? (
                <div className="space-y-3">
                  {result.findings.map((f, i) => (
                    <div key={i} className="result-item">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <strong className="text-sm font-bold text-white">{f.title}</strong>
                        <SeverityBadge value={f.severity} />
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-zinc-400">{f.explanation}</p>
                      {f.refactor && (
                        <div className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/[0.05] p-2.5">
                          <p className="text-xs text-sky-400">🔧 {f.refactor}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  Code is clean — no smells detected.
                </div>
              )}
            </div>

            {/* Refactored code */}
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 size={17} className="text-emerald-400" />
                  <h3 className="font-black text-white">Refactored Code</h3>
                </div>
                <CopyBtn text={result.refactored_code} />
              </div>
              <pre className="code-block text-xs">{result.refactored_code}</pre>
            </div>

            {/* AI review */}
            <div className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <BookText size={17} className="text-amber-400" />
                <h3 className="font-black text-white">Maintainability Review</h3>
              </div>
              <p className="text-sm leading-7 text-zinc-300 whitespace-pre-line">{result.review}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
