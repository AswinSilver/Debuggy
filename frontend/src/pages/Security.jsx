import React, { useState } from "react";
import { ShieldCheck, Loader2, ShieldAlert, Lock, CheckCircle } from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import SeverityBadge from "../components/SeverityBadge";
import CopyBtn from "../components/CopyBtn";
import Spinner from "../components/Spinner";
import SyntaxHighlight from "../components/SyntaxHighlight";
import LanguageSelect from "../components/LanguageSelect";
import { post } from "../lib/api";

export default function Security({ sharedCode, sharedLang, toast }) {
  const [code, setCode]       = useState(sharedCode || "");
  const [lang, setLang]       = useState(sharedLang || "JavaScript");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!code.trim()) { toast("Paste some code first"); return; }
    setLoading(true); setResult(null);
    try {
      setResult(await post("/security", { code, language: lang }));
      toast("Security scan complete ✓");
    } catch { toast("Backend offline"); }
    finally { setLoading(false); }
  }

  const scoreColor =
    !result ? "#5a5466" :
    result.score >= 80 ? "#22c55e" :
    result.score >= 60 ? "#f59e0b" : "#ef1d32";

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr] animate-fade-up">
      {/* Input panel */}
      <div className="space-y-4">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15">
              <ShieldCheck size={18} className="text-brand-500" />
            </div>
            <div>
              <p className="eyebrow">Advanced Tool</p>
              <h2 className="text-lg font-black text-white">Security Scanner</h2>
            </div>
          </div>
          <LanguageSelect value={lang} onChange={setLang} className="mb-3" />
          <CodeEditor code={code} onChange={setCode} minHeight="320px" />
          <button className="btn-primary mt-3 w-full" onClick={run} disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Scanning…</> : <><ShieldCheck size={16} /> Run Security Scan</>}
          </button>
        </div>
      </div>

      {/* Results panel */}
      <div className="space-y-5">
        {loading ? <div className="card p-6"><Spinner label="Running security audit…" /></div>
        : !result ? (
          <div className="empty-state">
            <ShieldCheck size={40} className="text-zinc-700" />
            <p className="text-sm">Paste code and run the scan to see AI-powered security findings</p>
          </div>
        ) : (
          <>
            {/* Score + risk */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card flex flex-col items-center justify-center p-5 text-center">
                <p className="eyebrow mb-2">Security Score</p>
                <p className="text-5xl font-black" style={{ color: scoreColor }}>{result.score}</p>
                <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${result.score}%`, backgroundColor: scoreColor }} />
                </div>
              </div>
              <div className="card flex flex-col items-center justify-center p-5 text-center">
                <p className="eyebrow mb-2">Risk Level</p>
                <p className="text-3xl font-black text-white">{result.risk_level}</p>
                <SeverityBadge value={result.risk_level} />
              </div>
            </div>

            {/* Findings */}
            <div className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert size={17} className="text-brand-500" />
                <h3 className="font-black text-white">Vulnerability Findings</h3>
                <span className="ml-auto rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-bold text-brand-400">
                  {result.findings?.length ?? 0}
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
                      <p className="mt-1.5 text-xs leading-5 text-zinc-400">{f.description}</p>
                      <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-2.5">
                        <p className="text-xs text-emerald-400"><Lock size={11} className="mr-1 inline" />{f.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  <CheckCircle size={16} /> No vulnerabilities found
                </div>
              )}
            </div>

            {/* Secure code */}
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={17} className="text-emerald-400" />
                  <h3 className="font-black text-white">Hardened Code</h3>
                </div>
                <CopyBtn text={result.secure_code} />
              </div>
              <SyntaxHighlight code={result.secure_code} />
            </div>

            {/* AI narrative */}
            <div className="card p-5">
              <h3 className="mb-3 font-black text-white">AI Audit Narrative</h3>
              <p className="text-sm leading-7 text-zinc-300 whitespace-pre-line">{result.audit_summary}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
