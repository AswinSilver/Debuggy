import React, { useState } from "react";
import { ShieldCheck, Loader2, Sparkles, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import Editor from "../components/Editor";
import ResultCard from "../components/ResultCard";
import Severity from "../components/Severity";
import CopyButton from "../components/CopyButton";
import { postJson } from "../utils/api";

export default function Security({ code, language, showToast }) {
  const [input, setInput] = useState(code);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runAudit() {
    setLoading(true);
    try {
      const data = await postJson("/security", { code: input, language });
      setResult(data);
      showToast("Security scan complete");
    } catch (err) {
      setResult({
        error: "FastAPI server offline. Start backend to run security scan.",
      });
      showToast("Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] animate-rise">
      <section className="glass-panel p-5 h-fit">
        <div className="mb-4 flex items-center gap-3">
          <ShieldCheck className="text-debug-red" size={28} />
          <div>
            <p className="eyebrow">Advanced Analysis Tools</p>
            <h2 className="section-title">Security Scanner</h2>
          </div>
        </div>
        <div className="mt-4">
          <Editor code={input} setCode={setInput} minHeight="360px" />
        </div>
        <button
          className="button-primary mt-4 w-full"
          onClick={runAudit}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <ShieldCheck size={18} />
          )}
          {loading ? "Scanning Code" : "Run Security Scan"}
        </button>
      </section>

      <section className="space-y-5">
        {result && result.error ? (
          <div className="glass-panel p-8 text-center text-zinc-500">
            <AlertTriangle className="mx-auto text-yellow-500 mb-2" size={32} />
            <p>{result.error}</p>
          </div>
        ) : result ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-4 flex flex-col justify-center items-center text-center">
                <span className="text-xs text-zinc-500 uppercase font-black tracking-wider">
                  Security Score
                </span>
                <span className="text-5xl font-black text-white mt-1">
                  {result.score}/100
                </span>
                <div className="mt-2 h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-debug-red"
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
              <div className="glass-panel p-4 flex flex-col justify-center items-center text-center">
                <span className="text-xs text-zinc-500 uppercase font-black tracking-wider">
                  Risk Level
                </span>
                <span className="text-3xl font-black text-debug-red mt-2 uppercase tracking-wide">
                  {result.risk_level}
                </span>
              </div>
            </div>

            <ResultCard title="Vulnerability Findings" badge="Security Scanner" icon={ShieldAlert}>
              <div className="space-y-3">
                {result.findings && result.findings.length > 0 ? (
                  result.findings.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-white/10 bg-black/40 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-white">{item.title}</strong>
                        <Severity value={item.severity} />
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">
                        {item.recommendation}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-zinc-500 bg-white/[0.02] rounded-lg">
                    No immediate vulnerabilities detected.
                  </div>
                )}
              </div>
            </ResultCard>

            <ResultCard title="AI Security Narrative Audit" badge="Analysis" icon={Sparkles}>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300 whitespace-pre-line font-sans">
                {result.ai_security_audit}
              </div>
            </ResultCard>

            <ResultCard
              title="Hardened Secure Code"
              badge="Refactored Code"
              icon={CheckCircle}
              action={
                <CopyButton
                  onClick={() => {
                    navigator.clipboard.writeText(result.secure_code || "");
                    showToast("Secure code copied");
                  }}
                />
              }
            >
              <pre className="code-output font-mono text-xs max-h-[300px]">
                {result.secure_code}
              </pre>
            </ResultCard>
          </div>
        ) : (
          <div className="empty-state">
            <ShieldCheck size={36} className="text-zinc-600 mb-2" />
            <p>Paste code and run the security scanner to generate detailed AI reports.</p>
          </div>
        )}
      </section>
    </div>
  );
}
