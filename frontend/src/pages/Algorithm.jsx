import React, { useState } from "react";
import {
  BrainCircuit, Loader2, ArrowRightLeft, ChevronDown,
  BookOpenText, Info, Wand2,
} from "lucide-react";
import CodeEditor from "../components/CodeEditor";
import CopyBtn from "../components/CopyBtn";
import Spinner from "../components/Spinner";
import LanguageSelect from "../components/LanguageSelect";
import SyntaxHighlight from "../components/SyntaxHighlight";
import { post } from "../lib/api";

const OUTPUT_MODES = [
  { value: "algorithm",  label: "Algorithm (Step-by-step)" },
  { value: "pseudocode", label: "Pseudocode" },
];

/* Quick example prompts for the Algorithm→Code direction */
const PROMPT_EXAMPLES = [
  {
    label: "Check even or odd",
    code: `Start
Read a number n.
If n modulo 2 equals 0:
    Display "n is Even".
Else:
    Display "n is Odd".
Stop.`,
  },
  {
    label: "Find factorial",
    code: `Start
Read a number n.
Set result = 1.
Set i = 1.
Repeat while i <= n:
    Set result = result * i.
    Increment i by 1.
Display result.
Stop.`,
  },
  {
    label: "Fibonacci sequence",
    code: `Start
Read the number of terms n.
Set a = 0, b = 1.
Repeat n times:
    Display a.
    Set temp = a + b.
    Set a = b.
    Set b = temp.
Stop.`,
  },
  {
    label: "Linear search",
    code: `Start
Read the array and the target value.
Set i = 0.
Repeat while i < length of array:
    If array[i] equals target:
        Display "Found at index i".
        Stop.
    Increment i by 1.
Display "Not found".
Stop.`,
  },
  {
    label: "Reverse a string",
    code: `Start
Read the string s.
Set reversed = empty string.
Set i = length of s minus 1.
Repeat while i >= 0:
    Append s[i] to reversed.
    Decrement i by 1.
Display reversed.
Stop.`,
  },
];

export default function Algorithm({ sharedCode, setSharedCode, sharedLang, setSharedLang, toast }) {
  const [code, setCode]         = useState(sharedCode || "");
  const [language, setLanguage] = useState(sharedLang || "JavaScript");
  const [mode, setMode]         = useState("algorithm");
  const [direction, setDir]     = useState("code_to_algo"); // "code_to_algo" | "algo_to_code"
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [prompt, setPrompt]     = useState("");

  function applyPrompt() {
    if (!prompt.trim()) return;
    // Find a matching example first
    const match = PROMPT_EXAMPLES.find(ex =>
      ex.label.toLowerCase().includes(prompt.toLowerCase()) ||
      prompt.toLowerCase().includes(ex.label.toLowerCase())
    );
    if (match) {
      setCode(match.code);
      setSharedCode(match.code);
    } else {
      // Generic: pre-fill with a template the user can edit
      const template = `Start\nRead the input.\n// Describe your algorithm here for: ${prompt}\nStop.`;
      setCode(template);
      setSharedCode(template);
    }
  }

  const isCodeToAlgo = direction === "code_to_algo";
  const currentModeLabel = OUTPUT_MODES.find(m => m.value === mode)?.label ?? "Algorithm";

  async function run() {
    if (!code.trim()) {
      toast(isCodeToAlgo ? "Paste some code first" : "Enter an algorithm or pseudocode first");
      return;
    }
    setLoading(true); setResult(null);
    try {
      const data = await post("/algorithm", { code, language, mode, direction });
      setResult(data);
      toast("Generation complete ✓");
    } catch {
      toast("Backend offline");
    } finally {
      setLoading(false);
    }
  }

  function flipDirection() {
    // If there's a result output, pre-fill the editor with it for chaining
    if (result?.output) {
      setCode(result.output);
      setSharedCode(result.output);
    }
    setDir(d => d === "code_to_algo" ? "algo_to_code" : "code_to_algo");
    setResult(null);
  }

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ── Controls card ─────────────────────────────────────────── */}
      <div className="card p-5 relative z-[30]">  
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15">
            <BrainCircuit size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="eyebrow">Advanced Tool</p>
            <h2 className="text-lg font-black text-white">Algorithm Generator</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Language selector (always shown — used in both directions) */}
          <LanguageSelect
            value={language}
            onChange={(l) => { setLanguage(l); setSharedLang(l); }}
            className="flex-1 min-w-[140px]"
          />

          {/* Direction flip button */}
          <button
            id="algo-direction-toggle"
            onClick={flipDirection}
            title={isCodeToAlgo ? "Switch to: Algorithm → Code" : "Switch to: Code → Algorithm"}
            className="flex h-9 shrink-0 items-center gap-2 rounded-xl border border-white/10
                       bg-white/[0.04] px-3 text-xs font-semibold text-zinc-300 transition
                       hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
          >
            <ArrowRightLeft size={14} className="text-violet-400" />
            {isCodeToAlgo ? "Code → Algorithm" : "Algorithm → Code"}
          </button>

          {/* Output mode dropdown (only for code→algo) */}
          {isCodeToAlgo && (
            <div className="relative shrink-0">
              <button
                id="algo-mode-dropdown"
                onClick={() => setModeOpen(o => !o)}
                className="flex h-9 items-center gap-2 rounded-xl border border-white/10
                           bg-white/[0.04] px-3 text-xs font-semibold text-zinc-300 transition
                           hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
              >
                <BookOpenText size={14} className="text-violet-400" />
                {currentModeLabel}
                <ChevronDown size={13} className={`transition-transform ${modeOpen ? "rotate-180" : ""}`} />
              </button>
              {modeOpen && (
                <div className="absolute left-0 top-full z-[9000] mt-1 w-52 overflow-hidden rounded-xl
                                border border-white/10 bg-[#111116] shadow-2xl">
                  {OUTPUT_MODES.map(opt => (
                    <button
                      key={opt.value}
                      id={`algo-mode-${opt.value}`}
                      onClick={() => { setMode(opt.value); setModeOpen(false); setResult(null); }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold
                        transition hover:bg-white/5
                        ${mode === opt.value ? "text-violet-400" : "text-zinc-300"}`}
                    >
                      {mode === opt.value && <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                      {mode !== opt.value && <span className="h-1.5 w-1.5 rounded-full bg-transparent" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generate button */}
          <button
            id="algo-generate-btn"
            className="btn-primary shrink-0"
            onClick={run}
            disabled={loading}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
              : <><Wand2 size={16} /> Generate</>}
          </button>
        </div>
      </div>

      {/* ── Direction label strip ──────────────────────────────────── */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {isCodeToAlgo
            ? `${language} Code`
            : (mode === "pseudocode" ? "Pseudocode" : "Algorithm / Pseudocode")}
        </span>
        <div className="flex-1 border-t border-white/[0.06]" />
        <ArrowRightLeft size={13} className="text-violet-400/60" />
        <div className="flex-1 border-t border-white/[0.06]" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {isCodeToAlgo
            ? (mode === "pseudocode" ? "Pseudocode" : "Algorithm")
            : `${language} Code`}
        </span>
      </div>

      {/* ── Editor + Output side by side ─────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-2">

        {/* Input panel */}
        <div className="card p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
            {isCodeToAlgo ? `Source — ${language}` : "Algorithm / Pseudocode Input"}
          </p>

          {/* Prompt helper — only shown in algo→code direction */}
          {!isCodeToAlgo && (
            <div className="mb-3">
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                <Wand2 size={11} className="text-violet-400" />
                Quick Prompt — type a description to auto-fill the editor
              </label>
              <div className="flex gap-2">
                <input
                  id="algo-prompt-input"
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') applyPrompt(); }}
                  placeholder="e.g. code to check even or odd"
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2
                             text-sm text-zinc-200 placeholder:text-zinc-600 outline-none
                             focus:border-violet-500/50 focus:bg-violet-500/5 transition"
                />
                <button
                  id="algo-prompt-apply"
                  onClick={applyPrompt}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-500/30
                             bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-300
                             transition hover:bg-violet-500/20 hover:text-white"
                >
                  <Wand2 size={13} /> Fill
                </button>
              </div>
              {/* Quick example chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PROMPT_EXAMPLES.map(ex => (
                  <button
                    key={ex.label}
                    onClick={() => { setPrompt(ex.label); setCode(ex.code); setSharedCode(ex.code); }}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1
                               text-[11px] font-medium text-zinc-400 transition
                               hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <CodeEditor
            code={code}
            onChange={(v) => { setCode(v); setSharedCode(v); }}
            minHeight="340px"
            label={isCodeToAlgo ? `input.${language.toLowerCase()}` : "algorithm.txt"}
          />
        </div>

        {/* Output panel */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {isCodeToAlgo
                ? (mode === "pseudocode" ? "Pseudocode Output" : "Algorithm Output")
                : `Generated ${language} Code`}
            </p>
            {result && <CopyBtn text={result.output} />}
          </div>

          {loading ? (
            <Spinner label="Generating…" />
          ) : result ? (
            isCodeToAlgo ? (
              /* Algorithm / pseudocode: render as pretty monospace block */
              <AlgoOutput text={result.output} />
            ) : (
              /* Code output: use syntax highlight */
              <SyntaxCodeOutput code={result.output} language={language} />
            )
          ) : (
            <div className="empty-state min-h-[420px]">
              <BrainCircuit size={36} className="text-zinc-700" />
              <p className="text-sm">
                {isCodeToAlgo
                  ? "Algorithm or pseudocode will appear here"
                  : "Generated code will appear here"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Explanation panel ─────────────────────────────────────── */}
      {result?.explanation && (
        <div className="card p-5 animate-fade-in">
          <div className="mb-3 flex items-center gap-2">
            <Info size={17} className="text-violet-400" />
            <h3 className="font-black text-white">Explanation</h3>
          </div>
          <p className="text-sm leading-7 text-zinc-300 whitespace-pre-line">
            {result.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function AlgoOutput({ text }) {
  const lines = (text || "").split("\n");
  return (
    <div
      className="min-h-[420px] overflow-auto rounded-xl bg-[#0d0d12] p-5
                 font-mono text-sm leading-7 text-zinc-100"
      style={{ whiteSpace: "pre" }}
    >
      {lines.map((line, i) => {
        const trimmed = line.trimStart();
        const indent  = line.length - trimmed.length;

        // Colour-code key keywords for readability
        const highlighted = applyKeywordColours(line);
        return (
          <div key={i} style={{ paddingLeft: indent * 0 }}>
            <span dangerouslySetInnerHTML={{ __html: highlighted }} />
          </div>
        );
      })}
    </div>
  );
}

function applyKeywordColours(line) {
  // Escape HTML first
  const escaped = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const rules = [
    { re: /\b(Start|Stop\.?)\b/g,        cls: "text-emerald-400 font-bold" },
    { re: /\b(Repeat while|Repeat for|For each|While)\b/gi, cls: "text-violet-400 font-semibold" },
    { re: /\b(If|Else if|Else|End if)\b/gi, cls: "text-amber-400 font-semibold" },
    { re: /\b(Set|Read|Display|Output|Print|Return|Call|Increment|Decrement|Swap|Compare|Write)\b/g,
      cls: "text-sky-400 font-semibold" },
  ];

  let result = escaped;
  for (const { re, cls } of rules) {
    result = result.replace(re, (m) => `<span class="${cls}">${m}</span>`);
  }
  return result;
}

function SyntaxCodeOutput({ code }) {
  return <SyntaxHighlight code={code} className="min-h-[420px]" />;
}
