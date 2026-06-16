import React, { useState } from "react";
import { FlaskConical, Loader2, Sparkles, AlertTriangle, FileCode, CheckSquare } from "lucide-react";
import Editor from "../components/Editor";
import ResultCard from "../components/ResultCard";
import CopyButton from "../components/CopyButton";
import { postJson } from "../utils/api";

export default function Tests({ code, language, showToast }) {
  const [input, setInput] = useState(code);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generateTests() {
    setLoading(true);
    try {
      const data = await postJson("/tests", { code: input, language });
      setResult(data);
      showToast("Test cases generated");
    } catch (err) {
      setResult({
        error: "FastAPI server offline. Start backend to generate tests.",
      });
      showToast("Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] animate-rise">
      <section className="glass-panel p-5 h-fit">
        <div className="mb-4 flex items-center gap-3">
          <FlaskConical className="text-debug-red" size={28} />
          <div>
            <p className="eyebrow">Advanced Analysis Tools</p>
            <h2 className="section-title">Test Case Generator</h2>
          </div>
        </div>
        <div className="mt-4">
          <Editor code={input} setCode={setInput} minHeight="360px" />
        </div>
        <button
          className="button-primary mt-4 w-full"
          onClick={generateTests}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <FlaskConical size={18} />
          )}
          {loading ? "Generating Tests" : "Generate Test Cases"}
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
            <ResultCard title="Recommended Test Matrix" badge="QA Matrix" icon={CheckSquare}>
              <div className="space-y-3">
                {result.cases && result.cases.length > 0 ? (
                  result.cases.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-white/10 bg-black/40 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-white text-sm font-black uppercase tracking-wider text-debug-red">
                          {item.type}
                        </strong>
                      </div>
                      <p className="mt-2 text-sm text-zinc-300">
                        {item.case}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">No test cases suggested.</p>
                )}
              </div>
            </ResultCard>

            <ResultCard
              title="Runnable Test Script"
              badge="Copyable code"
              icon={FileCode}
              action={
                <CopyButton
                  onClick={() => {
                    navigator.clipboard.writeText(result.copyable || "");
                    showToast("Test code copied");
                  }}
                />
              }
            >
              <pre className="code-output font-mono text-xs max-h-[320px]">
                {result.copyable}
              </pre>
            </ResultCard>

            <ResultCard title="AI QA Testing Strategy" badge="Theory" icon={Sparkles}>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300 whitespace-pre-line font-sans">
                {result.ai_tests}
              </div>
            </ResultCard>
          </div>
        ) : (
          <div className="empty-state">
            <FlaskConical size={36} className="text-zinc-600 mb-2" />
            <p>Paste code and generate tests to receive runnable unit suites and validation coverage matrices.</p>
          </div>
        )}
      </section>
    </div>
  );
}
