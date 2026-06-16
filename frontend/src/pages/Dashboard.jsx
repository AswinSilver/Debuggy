import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  Radar,
  Activity,
  ShieldCheck,
  Gauge,
  FlaskConical,
  SearchCode,
  Repeat2,
} from "lucide-react";
import Editor from "../components/Editor";
import ScorePanel from "../components/ScorePanel";
import ResultCard from "../components/ResultCard";
import Metric from "../components/Metric";
import Severity from "../components/Severity";
import CopyButton from "../components/CopyButton";

const languages = ["Python", "Java", "JavaScript", "C", "C++", "C#", "Go"];

export default function Dashboard({
  language,
  setLanguage,
  code,
  setCode,
  analysis,
  loading,
  runAnalysis,
  showToast,
}) {
  async function handleCopy(text, msg) {
    await navigator.clipboard.writeText(text || "");
    showToast(msg);
  }

  return (
    <div className="space-y-8 animate-rise">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="glass-panel p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Main analysis</p>
              <h2 className="section-title">AI Code Review Console</h2>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="select-control"
              aria-label="Language selector"
            >
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <Editor code={code} setCode={setCode} />
          <button
            className="button-primary mt-4 w-full"
            onClick={runAnalysis}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <BrainCircuit size={18} />
            )}
            {loading ? "Analyzing Code" : "Analyze Code"}
          </button>
        </div>

        <ScorePanel
          healthScore={analysis.health_score}
          healthCategory={analysis.health_category}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ResultCard title="Errors Found" badge="AI diagnostic" icon={AlertTriangle}>
          <div className="space-y-3">
            {analysis.errors && analysis.errors.length > 0 ? (
              analysis.errors.map((item, index) => (
                <div
                  key={`${item.type}-${index}`}
                  className="rounded-lg border border-white/10 bg-black/35 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{item.type}</strong>
                    <Severity value={item.severity} />
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{item.detail}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No analysis performed yet.</p>
            )}
          </div>
        </ResultCard>

        <ResultCard
          title="Suggested Fix"
          badge="Corrected code"
          icon={CheckCircle2}
          action={
            <CopyButton
              onClick={() => handleCopy(analysis.fixed_code, "Fixed code copied")}
            />
          }
        >
          <pre className="code-output font-mono">{analysis.fixed_code || "No fix generated yet."}</pre>
        </ResultCard>

        <ResultCard title="Error Explanation" badge="Root cause" icon={Radar}>
          <div className="space-y-3">
            {analysis.explanations && analysis.explanations.length > 0 ? (
              analysis.explanations.map((item, idx) => (
                <p
                  key={idx}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300"
                >
                  {item}
                </p>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No explanations generated yet.</p>
            )}
          </div>
        </ResultCard>

        <ResultCard title="Quick Summary" badge="Metrics" icon={Activity}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label="Total errors"
              value={analysis.summary ? analysis.summary.total_errors : 0}
            />
            <Metric
              label="Security risks"
              value={analysis.summary ? analysis.summary.security_risks : 0}
            />
            <Metric
              label="Complexity rating"
              value={analysis.summary ? analysis.summary.complexity_rating : "N/A"}
            />
            <Metric
              label="Code quality rating"
              value={analysis.summary ? analysis.summary.code_quality_rating : "N/A"}
            />
          </div>
        </ResultCard>
      </section>

      <section>
        <div className="mb-4">
          <p className="eyebrow">Advanced Analysis Tools</p>
          <h2 className="section-title">Specialized engineering checks</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["/security", ShieldCheck, "Security Scanner", "SQL injection, XSS, auth risks"],
            ["/complexity", Gauge, "Complexity Analyzer", "Runtime growth and bottlenecks"],
            ["/tests", FlaskConical, "Test Case Generator", "Unit, edge, boundary, stress"],
            ["/smells", SearchCode, "Code Smell Detector", "Duplication and maintainability"],
            ["/converter", Repeat2, "Code Converter", "Python, Java, JS, C, C++, C#, Go"],
          ].map(([path, Icon, title, detail]) => (
            <Link key={path} to={path} className="tool-card group">
              <Icon size={28} />
              <strong>{title}</strong>
              <span>{detail}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
