import React, { useState } from "react";
import { Repeat2, Loader2, Sparkles, AlertTriangle, FileCode } from "lucide-react";
import Editor from "../components/Editor";
import ResultCard from "../components/ResultCard";
import CopyButton from "../components/CopyButton";
import { postJson } from "../utils/api";

const languages = ["Python", "Java", "JavaScript", "C", "C++", "C#", "Go"];

export default function Converter({ code, language, showToast }) {
  const [input, setInput] = useState(code);
  const [from, setFrom] = useState(language);
  const [to, setTo] = useState("Python");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function convertCode() {
    setLoading(true);
    try {
      const data = await postJson("/convert", {
        code: input,
        language: from,
        target_language: to,
      });
      setResult(data);
      showToast("Conversion complete");
    } catch (err) {
      setResult({
        converted_code: `// FastAPI server offline.\n// Start backend to convert code.`,
        note: "Failed to connect to the backend server.",
      });
      showToast("Conversion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2 animate-rise">
      <section className="glass-panel p-5 h-fit">
        <p className="eyebrow">Code Converter</p>
        <h2 className="section-title">Translate code between languages</h2>
        <div className="my-4 grid gap-3 grid-cols-[1fr_auto_1fr] items-center">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="select-control w-full"
            aria-label="Source language select"
          >
            {languages.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <span className="text-center text-sm text-zinc-500 font-bold">to</span>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="select-control w-full"
            aria-label="Target language select"
          >
            {languages.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <Editor code={input} setCode={setInput} minHeight="360px" />
        </div>
        <button
          className="button-primary mt-4 w-full"
          onClick={convertCode}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Repeat2 size={18} />
          )}
          {loading ? "Converting Code" : "Convert Code"}
        </button>
      </section>

      <section className="space-y-5">
        {result ? (
          <div className="space-y-5">
            <ResultCard
              title="Converted Code"
              badge={to}
              icon={FileCode}
              action={
                <CopyButton
                  onClick={() => {
                    navigator.clipboard.writeText(result.converted_code || "");
                    showToast("Converted code copied");
                  }}
                />
              }
            >
              <pre className="code-output font-mono text-xs min-h-[460px]">
                {result.converted_code}
              </pre>
            </ResultCard>

            <ResultCard title="AI Conversion Considerations" badge="Analysis" icon={Sparkles}>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300 whitespace-pre-line font-sans">
                {result.note}
              </div>
            </ResultCard>
          </div>
        ) : (
          <div className="empty-state">
            <Repeat2 size={36} className="text-zinc-600 mb-2" />
            <p>Select target language and convert code to view AI translation outputs and API compatibility logs.</p>
          </div>
        )}
      </section>
    </div>
  );
}
