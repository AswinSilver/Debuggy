import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles, Loader2, Wand2, Copy, Check,
  Lightbulb, Code2, Info, RefreshCw,
} from "lucide-react";
import SyntaxHighlight from "../components/SyntaxHighlight";
import LanguageSelect from "../components/LanguageSelect";
import Spinner from "../components/Spinner";
import { post } from "../lib/api";

/* ─── Example prompts ────────────────────────────────────────────────────── */
const EXAMPLES = [
  { icon: "🔢", label: "Check if a number is even or odd", tag: "Basics" },
  { icon: "🔁", label: "Find the factorial of a number using recursion", tag: "Recursion" },
  { icon: "📊", label: "Sort an array using bubble sort", tag: "Sorting" },
  { icon: "🔍", label: "Binary search in a sorted array", tag: "Search" },
  { icon: "🌀", label: "Print the Fibonacci series up to N terms", tag: "Math" },
  { icon: "🔗", label: "Reverse a linked list", tag: "Data Structures" },
  { icon: "📝", label: "Count vowels and consonants in a string", tag: "Strings" },
  { icon: "🏦", label: "Simple bank account with deposit and withdraw", tag: "OOP" },
  { icon: "📈", label: "Find the largest and smallest element in an array", tag: "Arrays" },
  { icon: "🔐", label: "Check if a string is a palindrome", tag: "Strings" },
];

export default function PromptToCode({ sharedCode, setSharedCode, sharedLang, setSharedLang, toast }) {
  const [prompt, setPrompt]     = useState("");
  const [language, setLanguage] = useState(sharedLang || "Python");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const textareaRef             = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [prompt]);

  async function generate() {
    if (!prompt.trim()) { toast("Describe what code you want first"); return; }
    setLoading(true); setResult(null);
    try {
      const data = await post("/prompt_to_code", { prompt, language });
      setResult(data);
      setSharedCode(data.code);
      setSharedLang(language);
      toast("Code generated ✓");
    } catch {
      toast("Backend offline");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!result?.code) return;
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function useExample(ex) {
    setPrompt(ex.label);
    if (textareaRef.current) textareaRef.current.focus();
  }

  function regenerate() {
    setResult(null);
    generate();
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Page header card ──────────────────────────────────────── */}
      <div className="card p-6 relative z-[30]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl
                          bg-brand-500/15 border border-brand-500/20">
            <Sparkles size={20} className="text-brand-400" />
          </div>
          <div>
            <p className="eyebrow">AI Feature</p>
            <h2 className="text-lg font-black text-white">Prompt to Code</h2>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 rounded-full
                          border border-brand-500/25 bg-brand-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
            <span className="text-[11px] font-bold text-brand-300">AI Powered</span>
          </div>
        </div>

        {/* Prompt textarea */}
        <div className="relative mb-4">
          <div className="pointer-events-none absolute left-4 top-4">
            <Wand2 size={16} className="text-brand-500/60" />
          </div>
          <textarea
            ref={textareaRef}
            id="ptc-prompt-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate(); }}
            placeholder={`Describe the code you want… e.g. "Check if a number is even or odd"`}
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03]
                       py-4 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600
                       outline-none transition focus:border-brand-500/50 focus:bg-brand-500/[0.04]
                       leading-relaxed"
            style={{ minHeight: 80, maxHeight: 200 }}
          />
          <span className="absolute bottom-3 right-3 text-[10px] text-zinc-700 select-none">
            Ctrl+Enter to generate
          </span>
        </div>

        {/* Language + Generate row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[160px]">
            <LanguageSelect
              value={language}
              onChange={l => { setLanguage(l); setSharedLang(l); }}
            />
          </div>
          <button
            id="ptc-generate-btn"
            className="btn-primary shrink-0"
            onClick={generate}
            disabled={loading}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
              : <><Sparkles size={16} /> Generate Code</>}
          </button>
        </div>
      </div>

      {/* ── Example prompt chips ──────────────────────────────────── */}
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb size={15} className="text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Quick Examples — click to use
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              id={`ptc-example-${ex.tag.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => useExample(ex)}
              className="group flex items-center gap-2 rounded-xl border border-white/[0.07]
                         bg-white/[0.025] px-3 py-2 text-left transition-all duration-200
                         hover:border-brand-500/40 hover:bg-brand-500/[0.07]"
            >
              <span className="text-base leading-none">{ex.icon}</span>
              <span className="text-[12px] font-medium text-zinc-400 group-hover:text-zinc-200 transition">
                {ex.label}
              </span>
              <span className="ml-1 rounded-md border border-white/[0.06] bg-white/[0.02]
                               px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide
                               text-zinc-600 group-hover:border-brand-500/20 group-hover:text-brand-400 transition">
                {ex.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Result area ───────────────────────────────────────────── */}
      {loading && (
        <div className="card p-8">
          <Spinner label={`Generating ${language} code…`} />
        </div>
      )}

      {!loading && result && (
        <>
          {/* Generated code panel */}
          <div className="card overflow-hidden">
            {/* Code panel header */}
            <div className="flex items-center justify-between border-b border-white/[0.07]
                            bg-white/[0.02] px-5 py-3">
              <div className="flex items-center gap-2">
                <Code2 size={15} className="text-brand-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Generated {language} Code
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="ptc-regenerate-btn"
                  onClick={regenerate}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10
                             bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-bold text-zinc-400
                             transition hover:border-brand-500/30 hover:bg-brand-500/10 hover:text-brand-300"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button
                  id="ptc-copy-btn"
                  onClick={copyCode}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10
                             bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-bold text-zinc-400
                             transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  {copied
                    ? <><Check size={12} className="text-emerald-400" /> Copied!</>
                    : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Code output */}
            <SyntaxHighlight code={result.code} className="min-h-[200px]" />
          </div>

          {/* Explanation */}
          {result.explanation && (
            <div className="card p-5 animate-fade-in">
              <div className="mb-3 flex items-center gap-2">
                <Info size={16} className="text-brand-500" />
                <h3 className="font-black text-white">How it works</h3>
              </div>
              <p className="text-sm leading-7 text-zinc-300 whitespace-pre-line">
                {result.explanation}
              </p>
            </div>
          )}

          {/* Usage hints */}
          {result.usage_hints && result.usage_hints.length > 0 && (
            <div className="card p-5 animate-fade-in">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-400" />
                <h3 className="font-black text-white">Usage Tips</h3>
              </div>
              <ul className="space-y-2">
                {result.usage_hints.map((hint, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-brand-500/20
                                     text-brand-400 text-[10px] font-black
                                     flex items-center justify-center">{i + 1}</span>
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !result && (
        <div className="empty-state min-h-[260px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl
                          border border-brand-500/20 bg-brand-500/10">
            <Sparkles size={28} className="text-brand-500/70" />
          </div>
          <div className="space-y-1 text-center">
            <p className="font-semibold text-zinc-500">Your generated code will appear here</p>
            <p className="text-xs text-zinc-700">
              Type a description above or pick an example prompt to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
