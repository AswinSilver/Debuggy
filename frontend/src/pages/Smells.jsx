import React, { useState } from "react";
import { SearchCode, Loader2, Sparkles, AlertTriangle, HelpCircle } from "lucide-react";
import Editor from "../components/Editor";
import ResultCard from "../components/ResultCard";
import Severity from "../components/Severity";
import { postJson } from "../utils/api";

export default function Smells({ code, language, showToast }) {
  const [input, setInput] = useState(code);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function checkSmells() {
    setLoading(true);
    try {
      const data = await postJson("/smells", { code: input, language });
      setResult(data);
      showToast("Code smell scan complete");
    } catch (err) {
      setResult({
        error: "FastAPI server offline. Start backend to check for code smells.",
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
          <SearchCode className="text-debug-red" size={28} />
          <div>
            <p className="eyebrow">Advanced Analysis Tools</p>
            <h2 className="section-title">Code Smell Detector</h2>
          </div>
        </div>
        <div className="mt-4">
          <Editor code={input} setCode={setInput} minHeight="360px" />
        </div>
        <button
          className="button-primary mt-4 w-full"
          onClick={checkSmells}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <SearchCode size={18} />
          )}
          {loading ? "Scanning Code" : "Run Code Smell Scan"}
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
            <ResultCard title="Detected Code Smells" badge="Refactor Targets" icon={HelpCircle}>
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
                        {item.explanation}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">No code smells detected.</p>
                )}
              </div>
            </ResultCard>

            <ResultCard title="AI Maintainability Review" badge="Fowler Standards" icon={Sparkles}>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300 whitespace-pre-line font-sans">
                {result.ai_smell_analysis}
              </div>
            </ResultCard>
          </div>
        ) : (
          <div className="empty-state">
            <SearchCode size={36} className="text-zinc-600 mb-2" />
            <p>Paste code and run the detector to find structure, formatting, and naming anti-patterns.</p>
          </div>
        )}
      </section>
    </div>
  );
}
