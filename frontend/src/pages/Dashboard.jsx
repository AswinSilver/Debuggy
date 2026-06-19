import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit, Loader2, AlertTriangle, CheckCircle2,
  Lightbulb, BarChart3, ShieldCheck, Gauge,
  FlaskConical, SearchCode, Repeat2, Sparkles,
} from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import HealthRing from "../components/HealthRing";
import SeverityBadge from "../components/SeverityBadge";
import CopyBtn from "../components/CopyBtn";
import SyntaxHighlight from "../components/SyntaxHighlight";
import { post } from "../lib/api";

const LANGUAGES = ["JavaScript","TypeScript","Python","Java","C","C++","C#","Go","Rust","Ruby","PHP","Swift","Kotlin"];

const TOOLS = [
  { to: "/security",   Icon: ShieldCheck,  title: "Security Scanner",    desc: "OWASP · XSS · SQLi · CVEs" },
  { to: "/complexity", Icon: Gauge,         title: "Complexity Analyzer", desc: "Big-O · bottlenecks · optimizations" },
  { to: "/tests",      Icon: FlaskConical,  title: "Test Generator",      desc: "Unit · edge · boundary · stress" },
  { to: "/smells",     Icon: SearchCode,    title: "Code Smell Detector", desc: "SOLID · Fowler patterns · refactoring" },
  { to: "/converter",  Icon: Repeat2,       title: "Code Converter",      desc: "Translate between 13 languages" },
];

const SAMPLE = `function login(user) {
  const password = "admin123";
  const query = "SELECT * FROM users WHERE name = '" + user + "'";
  eval("console.log(query)");
  if (user = "admin") {
    return true;
  }
}`;

export default function Dashboard({ sharedCode, setSharedCode, sharedLang, setSharedLang, toast, setAnalysis }) {
  const [code, setCode]         = useState(sharedCode || SAMPLE);
  const [lang, setLang]         = useState(sharedLang || "JavaScript");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);

  async function analyze() {
    if (!code.trim()) { toast("Paste some code first"); return; }
    setLoading(true);
    try {
      const data = await post("/analyze", { code, language: lang });
      setResult(data);
      setAnalysis?.(data);
      setSharedCode(code);
      setSharedLang(lang);
      toast("Analysis complete ✓");
    } catch {
      toast("Backend offline — start FastAPI server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero grid: editor + health ring */}
      <section className="grid gap-5 xl:grid-cols-[1fr_300px]">

        {/* Editor panel */}
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">AI Code Review</p>
              <h2 className="heading">Paste Your Code</h2>
            </div>
            <select value={lang} onChange={e => setLang(e.target.value)} className="select">
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <CodeEditor code={code} onChange={setCode} minHeight="380px" label="debuggy-buffer.ai" />
          <button
            className="btn-primary mt-4 w-full"
            onClick={analyze}
            disabled={loading}
          >
            {loading
              ? <><Loader2 size={17} className="animate-spin" /> Analyzing with AI…</>
              : <><BrainCircuit size={17} /> Analyze Code</>}
          </button>
        </div>

        {/* Health score */}
        <div className="card flex flex-col items-center justify-center p-6">
          <p className="eyebrow mb-4">Code Health Score</p>
          <HealthRing
            score={result?.health_score ?? 0}
            category={result?.health_category ?? "Awaiting"}
          />
        </div>
      </section>

      {/* Results — only show after analysis */}
      {result && (
        <section className="grid gap-5 xl:grid-cols-2 animate-fade-up">
          {/* Errors found */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-brand-500" />
              <h3 className="font-black text-white">Issues Found</h3>
              <span className="ml-auto rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-bold text-brand-400">
                {result.errors?.length ?? 0}
              </span>
            </div>
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {result.errors?.length ? result.errors.map((e, i) => (
                <div key={i} className="result-item">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider">{e.type}</span>
                      {e.line && <span className="ml-2 text-[10px] text-zinc-600">line {e.line}</span>}
                      <p className="mt-1 text-sm text-zinc-300">{e.detail}</p>
                    </div>
                    <SeverityBadge value={e.severity} />
                  </div>
                </div>
              )) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
                  <CheckCircle2 size={16} /> No issues detected
                </div>
              )}
            </div>
          </div>

          {/* Fixed code */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h3 className="font-black text-white">Fixed Code</h3>
              </div>
              <CopyBtn text={result.fixed_code} />
            </div>
            <SyntaxHighlight code={result.fixed_code} />
          </div>

          {/* Explanations */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400" />
              <h3 className="font-black text-white">AI Explanations</h3>
            </div>
            <div className="space-y-2.5">
              {result.explanations?.map((e, i) => (
                <div key={i} className="result-item flex gap-3">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-500" />
                  <p className="text-sm leading-6 text-zinc-300">{e}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary metrics */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-500" />
              <h3 className="font-black text-white">Quick Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Total Issues",      result.summary?.total_errors ?? 0],
                ["Security Risks",    result.summary?.security_risks ?? 0],
                ["Complexity",        result.summary?.complexity_rating ?? "—"],
                ["Code Quality",      result.summary?.code_quality_rating ?? "—"],
              ].map(([label, val]) => (
                <div key={label} className="metric-tile">
                  <p className="text-xl font-black text-white">{val}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tool navigation */}
      <section>
        <div className="mb-4">
          <p className="eyebrow">Advanced Tools</p>
          <h2 className="heading">Deep-Dive Analysis</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {TOOLS.map(({ to, Icon, title, desc }) => (
            <Link key={to} to={to} className="tool-card">
              <Icon size={26} className="text-brand-500" />
              <div>
                <p className="font-black text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
