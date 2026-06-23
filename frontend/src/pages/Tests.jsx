import React, { useState } from "react";
import { FlaskConical, Loader2, CheckSquare, FileCode, BookOpen } from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import CopyBtn from "../components/CopyBtn";
import Spinner from "../components/Spinner";
import SyntaxHighlight from "../components/SyntaxHighlight";
import LanguageSelect from "../components/LanguageSelect";
import { post } from "../lib/api";

const TYPE_COLOR = {
  "Unit Test":          "border-sky-500/30 bg-sky-500/[0.06] text-sky-400",
  "Edge Case":          "border-amber-500/30 bg-amber-500/[0.06] text-amber-400",
  "Invalid Input":      "border-red-500/30 bg-red-500/[0.06] text-red-400",
  "Boundary Condition": "border-purple-500/30 bg-purple-500/[0.06] text-purple-400",
  "Stress Test":        "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400",
};

export default function Tests({ sharedCode, setSharedCode, sharedLang, setSharedLang, toast }) {
  const [code, setCode]       = useState(sharedCode || "");
  const [lang, setLang]       = useState(sharedLang || "JavaScript");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!code.trim()) { toast("Paste some code first"); return; }
    setLoading(true); setResult(null);
    try {
      setResult(await post("/tests", { code, language: lang }));
      toast("Tests generated ✓");
    } catch { toast("Backend offline"); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr] animate-fade-up">
      {/* Input */}
      <div className="card p-5 h-fit">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
            <FlaskConical size={18} className="text-brand-500" />
          </div>
          <div>
            <p className="eyebrow">Advanced Tool</p>
            <h2 className="text-lg font-black text-white">Test Generator</h2>
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
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><FlaskConical size={16} /> Generate Tests</>}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-5">
        {loading ? <div className="card p-6"><Spinner label="Generating AI test suites…" /></div>
        : !result ? (
          <div className="empty-state">
            <FlaskConical size={40} className="text-zinc-700" />
            <p className="text-sm">Generate comprehensive unit, edge, boundary, and stress tests</p>
          </div>
        ) : (
          <>
            {/* Test case matrix */}
            <div className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckSquare size={17} className="text-brand-500" />
                <h3 className="font-black text-white">Test Case Matrix</h3>
                <span className="ml-auto rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-bold text-brand-400">
                  {result.cases?.length ?? 0} cases
                </span>
              </div>
              <div className="space-y-2.5">
                {result.cases?.map((c, i) => {
                  const cls = TYPE_COLOR[c.type] || "border-white/10 bg-white/[0.03] text-zinc-400";
                  return (
                    <div key={i} className={`rounded-xl border p-3.5 ${cls}`}>
                      <p className="text-[11px] font-black uppercase tracking-wider mb-1">{c.type}</p>
                      <p className="text-sm text-zinc-300">{c.description}</p>
                      {c.assertion && (
                        <p className="mt-1.5 text-xs text-zinc-500 italic">→ {c.assertion}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Runnable test code */}
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode size={17} className="text-emerald-400" />
                  <h3 className="font-black text-white">Runnable Test Suite</h3>
                </div>
                <CopyBtn text={result.test_code} />
              </div>
              <SyntaxHighlight code={result.test_code} />
            </div>

            {/* Strategy */}
            <div className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen size={17} className="text-amber-400" />
                <h3 className="font-black text-white">Testing Strategy</h3>
              </div>
              <p className="text-sm leading-7 text-zinc-300 whitespace-pre-line">{result.strategy}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
