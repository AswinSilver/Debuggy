import React, { useState } from "react";
import { Gauge, Loader2, Sparkles, AlertTriangle, Cpu, TrendingUp } from "lucide-react";
import Editor from "../components/Editor";
import ResultCard from "../components/ResultCard";
import Metric from "../components/Metric";
import { postJson } from "../utils/api";

export default function Complexity({ code, language, showToast }) {
  const [input, setInput] = useState(code);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runComplexityAnalysis() {
    setLoading(true);
    try {
      const data = await postJson("/complexity", { code: input, language });
      setResult(data);
      showToast("Complexity analysis complete");
    } catch (err) {
      setResult({
        error: "FastAPI server offline. Start backend to run complexity audit.",
      });
      showToast("Audit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] animate-rise">
      <section className="glass-panel p-5 h-fit">
        <div className="mb-4 flex items-center gap-3">
          <Gauge className="text-debug-red" size={28} />
          <div>
            <p className="eyebrow">Advanced Analysis Tools</p>
            <h2 className="section-title">Complexity Analyzer</h2>
          </div>
        </div>
        <div className="mt-4">
          <Editor code={input} setCode={setInput} minHeight="360px" />
        </div>
        <button
          className="button-primary mt-4 w-full"
          onClick={runComplexityAnalysis}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Gauge size={18} />
          )}
          {loading ? "Analyzing Complexity" : "Run Complexity Analysis"}
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
                  Time Complexity
                </span>
                <span className="text-4xl font-black text-debug-red mt-2 font-mono">
                  {result.time_complexity}
                </span>
              </div>
              <div className="glass-panel p-4 flex flex-col justify-center items-center text-center">
                <span className="text-xs text-zinc-500 uppercase font-black tracking-wider">
                  Space Complexity
                </span>
                <span className="text-4xl font-black text-white mt-2 font-mono">
                  {result.space_complexity}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Metric label="Efficiency Rating" value={result.rating} />
              <Metric label="Optimization Score" value={`${result.score}/100`} />
            </div>

            <ResultCard title="Performance Bottlenecks" badge="Critical issues" icon={Cpu}>
              <div className="space-y-2">
                {result.bottlenecks && result.bottlenecks.length > 0 ? (
                  result.bottlenecks.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-sm text-zinc-300"
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">No bottlenecks identified.</p>
                )}
              </div>
            </ResultCard>

            <ResultCard title="Optimization Tips" badge="Suggestions" icon={TrendingUp}>
              <div className="space-y-2">
                {result.suggestions && result.suggestions.length > 0 ? (
                  result.suggestions.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-sm text-zinc-300"
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">Code is already highly optimized.</p>
                )}
              </div>
            </ResultCard>

            <ResultCard title="AI Algorithmic Audit Narrative" badge="Deep Dive" icon={Sparkles}>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300 whitespace-pre-line font-sans">
                {result.ai_complexity_analysis}
              </div>
            </ResultCard>
          </div>
        ) : (
          <div className="empty-state">
            <Gauge size={36} className="text-zinc-600 mb-2" />
            <p>Paste code and run analysis to calculate performance metrics.</p>
          </div>
        )}
      </section>
    </div>
  );
}
