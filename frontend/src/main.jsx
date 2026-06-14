import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clipboard,
  Code2,
  Copy,
  Download,
  FileDown,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  Menu,
  Radar,
  Repeat2,
  SearchCode,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import "./styles.css";

const sampleCode = `function login(user) {
  const password = "admin123";
  const query = "SELECT * FROM users WHERE name = '" + user + "'";
  eval("console.log(query)");
  if (user = "admin") {
    return true;
  }
}`;

const languages = ["Python", "Java", "JavaScript", "C", "C++", "C#", "Go"];

const pages = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "security", label: "Security Scanner", icon: ShieldCheck },
  { id: "complexity", label: "Complexity Analyzer", icon: Gauge },
  { id: "tests", label: "Test Case Generator", icon: FlaskConical },
  { id: "smells", label: "Code Smell Detector", icon: SearchCode },
  { id: "converter", label: "Code Converter", icon: Repeat2 },
];

const fallbackAnalysis = {
  errors: [
    { type: "Logic error", detail: "Assignment appears inside a conditional.", severity: "High" },
    { type: "Security concern", detail: "Hardcoded Credentials", severity: "High" },
    { type: "Security concern", detail: "SQL Injection", severity: "High" },
    { type: "Security concern", detail: "Dangerous Function", severity: "Critical" },
  ],
  fixed_code: sampleCode
    .replace('const password = "admin123";', "const password = process.env.SECRET_VALUE;")
    .replace('eval("console.log(query)");', "// Removed unsafe eval.")
    .replace('if (user = "admin")', 'if (user === "admin")'),
  explanations: [
    "The code trusts user input while building a database query.",
    "The conditional assigns a value instead of comparing it.",
    "Hardcoded secrets and dynamic execution increase production risk.",
  ],
  health_score: 42,
  health_category: "Poor",
  summary: {
    total_errors: 4,
    security_risks: 3,
    complexity_rating: "Medium",
    code_quality_rating: "Poor",
  },
};

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

async function postJson(path, body) {
  const response = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState(sampleCode);
  const [analysis, setAnalysis] = useState(fallbackAnalysis);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const lineNumbers = useMemo(
    () => Array.from({ length: code.split("\n").length }, (_, index) => index + 1).join("\n"),
    [code],
  );

  const pageTitle = pages.find((page) => page.id === activePage)?.label ?? "Dashboard";

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  async function copyText(text, message = "Copied to clipboard") {
    await navigator.clipboard.writeText(text || "");
    showToast(message);
  }

  function downloadFile(name, content, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function runAnalysis() {
    setLoading(true);
    try {
      const result = await postJson("/analyze", { code, language });
      setAnalysis(result);
      showToast("Analysis complete");
    } catch {
      setAnalysis(fallbackAnalysis);
      showToast("Using local demo analysis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-debug-black text-debug-ink">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,29,50,0.26),transparent_30%),radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.08),transparent_18%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />

      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-black/80 p-5 backdrop-blur-2xl transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded bg-debug-red text-xl font-black shadow-redglow">D</div>
            <div>
              <p className="text-lg font-extrabold">Debuggy AI</p>
              <p className="text-xs text-zinc-400">Software quality platform</p>
            </div>
          </div>
          <button className="rounded border border-white/10 p-2 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => navigate(page.id)}
                className={classNames(
                  "group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition",
                  activePage === page.id
                    ? "border-debug-red/70 bg-debug-red/15 text-white shadow-redglow"
                    : "border-white/5 bg-white/[0.03] text-zinc-400 hover:border-debug-red/40 hover:text-white",
                )}
              >
                <Icon size={18} />
                <span>{page.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-debug-red/30 bg-debug-red/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-debug-red shadow-redglow" />
            AI review engine online
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-400">Dynamic FastAPI analysis with secure local fallbacks.</p>
        </div>
      </aside>

      <main className="relative z-10 min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-debug-black/75 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-white/10 p-2 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu size={20} />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-debug-red">Developer dashboard</p>
                <h1 className="text-2xl font-black sm:text-3xl">{pageTitle}</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="button-secondary" onClick={() => downloadFile("debuggy-analysis-report.json", JSON.stringify(analysis, null, 2), "application/json")}>
                <Download size={16} /> Download Analysis Report
              </button>
              <button className="button-secondary" onClick={() => downloadFile(`debuggy-fixed-code.${language.toLowerCase().replace("#", "sharp")}.txt`, analysis.fixed_code || code)}>
                <FileDown size={16} /> Export Fixed Code
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 xl:p-8">
          {activePage === "dashboard" && (
            <Dashboard
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCode={setCode}
              lineNumbers={lineNumbers}
              analysis={analysis}
              loading={loading}
              runAnalysis={runAnalysis}
              copyText={copyText}
              navigate={navigate}
            />
          )}
          {activePage === "security" && <ToolPage title="Security Scanner" endpoint="/security" code={code} language={language} copyText={copyText} icon={ShieldCheck} />}
          {activePage === "complexity" && <ToolPage title="Complexity Analyzer" endpoint="/complexity" code={code} language={language} copyText={copyText} icon={Gauge} />}
          {activePage === "tests" && <ToolPage title="Test Case Generator" endpoint="/tests" code={code} language={language} copyText={copyText} icon={FlaskConical} />}
          {activePage === "smells" && <ToolPage title="Code Smell Detector" endpoint="/smells" code={code} language={language} copyText={copyText} icon={SearchCode} />}
          {activePage === "converter" && <ConverterPage code={code} language={language} copyText={copyText} />}
        </div>
      </main>

      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-debug-red/40 bg-black px-4 py-3 text-sm shadow-redglow">{toast}</div>}
    </div>
  );
}

function Dashboard({ language, setLanguage, code, setCode, lineNumbers, analysis, loading, runAnalysis, copyText, navigate }) {
  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="glass-panel p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Main analysis</p>
              <h2 className="section-title">AI Code Review Console</h2>
            </div>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="select-control" aria-label="Language selector">
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <Editor lineNumbers={lineNumbers} code={code} setCode={setCode} />
          <button className="button-primary mt-4 w-full" onClick={runAnalysis} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            {loading ? "Analyzing Code" : "Analyze Code"}
          </button>
        </div>

        <ScorePanel analysis={analysis} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ResultCard title="Errors Found" badge="Live scan" icon={AlertTriangle}>
          <div className="space-y-3">
            {analysis.errors.map((item, index) => (
              <div key={`${item.type}-${index}`} className="rounded-lg border border-white/10 bg-black/35 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{item.type}</strong>
                  <Severity value={item.severity} />
                </div>
                <p className="mt-2 text-sm text-zinc-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </ResultCard>

        <ResultCard title="Suggested Fix" badge="Corrected code" icon={CheckCircle2} action={<CopyButton onClick={() => copyText(analysis.fixed_code, "Fixed code copied")} />}>
          <pre className="code-output">{analysis.fixed_code}</pre>
        </ResultCard>

        <ResultCard title="Error Explanation" badge="Root cause" icon={Radar}>
          <div className="space-y-3">
            {analysis.explanations.map((item) => (
              <p key={item} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300">{item}</p>
            ))}
          </div>
        </ResultCard>

        <ResultCard title="Quick Summary" badge="Metrics" icon={Activity}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Total errors found" value={analysis.summary.total_errors} />
            <Metric label="Security risks found" value={analysis.summary.security_risks} />
            <Metric label="Complexity rating" value={analysis.summary.complexity_rating} />
            <Metric label="Code quality rating" value={analysis.summary.code_quality_rating} />
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
            ["security", ShieldCheck, "Security Scanner", "SQL injection, XSS, auth risks"],
            ["complexity", Gauge, "Complexity Analyzer", "Runtime growth and bottlenecks"],
            ["tests", FlaskConical, "Test Case Generator", "Unit, edge, boundary, stress"],
            ["smells", SearchCode, "Code Smell Detector", "Duplication and maintainability"],
            ["converter", Repeat2, "Code Converter", "Python, Java, JS, C, C++, C#, Go"],
          ].map(([id, Icon, title, detail]) => (
            <button key={id} className="tool-card" onClick={() => navigate(id)}>
              <Icon size={28} />
              <strong>{title}</strong>
              <span>{detail}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Editor({ lineNumbers, code, setCode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#07070a]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-debug-red" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-emerald-500" />
        <span className="ml-3 font-mono text-xs text-zinc-500">debuggy-buffer.ai</span>
      </div>
      <div className="grid grid-cols-[54px_1fr]">
        <pre className="select-none border-r border-white/10 bg-white/[0.025] p-4 text-right font-mono text-sm leading-6 text-zinc-600">{lineNumbers}</pre>
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="min-h-[420px] resize-y bg-transparent p-4 font-mono text-sm leading-6 text-zinc-100 outline-none"
          spellCheck="false"
          aria-label="Code editor"
        />
      </div>
    </div>
  );
}

function ScorePanel({ analysis }) {
  return (
    <aside className="glass-panel p-5">
      <p className="eyebrow">Code health score</p>
      <div className="relative mx-auto mt-6 grid h-52 w-52 place-items-center rounded-full border border-debug-red/35 bg-debug-red/10 shadow-redglow">
        <div className="absolute inset-4 rounded-full border border-white/10" />
        <div className="text-center">
          <div className="text-6xl font-black">{analysis.health_score}</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-[0.22em] text-debug-red">{analysis.health_category}</div>
        </div>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-debug-red to-red-300 transition-all duration-500" style={{ width: `${analysis.health_score}%` }} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Metric label="Excellent" value="90+" />
        <Metric label="Good" value="75+" />
        <Metric label="Average" value="55+" />
        <Metric label="Critical" value="<30" />
      </div>
    </aside>
  );
}

function ToolPage({ title, endpoint, code, language, copyText, icon: Icon }) {
  const [input, setInput] = useState(code);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      setResult(await postJson(endpoint, { code: input, language }));
    } catch {
      setResult({ message: "FastAPI server is offline. Start the backend to run live analysis." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="glass-panel p-5">
        <div className="mb-4 flex items-center gap-3">
          <Icon className="text-debug-red" size={28} />
          <div>
            <p className="eyebrow">Advanced Analysis Tools</p>
            <h2 className="section-title">{title}</h2>
          </div>
        </div>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} className="tool-input" spellCheck="false" />
        <button className="button-primary mt-4 w-full" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? "Running Analysis" : `Run ${title}`}
        </button>
      </section>

      <section className="glass-panel p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black">Results</h3>
          <CopyButton onClick={() => copyText(JSON.stringify(result, null, 2), "Tool results copied")} />
        </div>
        <RenderToolResult result={result} />
      </section>
    </div>
  );
}

function ConverterPage({ code, language, copyText }) {
  const [input, setInput] = useState(code);
  const [from, setFrom] = useState(language);
  const [to, setTo] = useState("Python");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      setResult(await postJson("/convert", { code: input, language: from, target_language: to }));
    } catch {
      setResult({ converted_code: `// Start FastAPI for live conversion\n${input}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="glass-panel p-5">
        <p className="eyebrow">Code Converter</p>
        <h2 className="section-title">Translate code between languages</h2>
        <div className="my-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <select value={from} onChange={(event) => setFrom(event.target.value)} className="select-control">
            {languages.map((item) => <option key={item}>{item}</option>)}
          </select>
          <span className="text-center text-sm text-zinc-500">to</span>
          <select value={to} onChange={(event) => setTo(event.target.value)} className="select-control">
            {languages.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} className="tool-input" spellCheck="false" />
        <button className="button-primary mt-4 w-full" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Repeat2 size={18} />}
          Convert Code
        </button>
      </section>
      <section className="glass-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black">Converted Code</h3>
          <CopyButton onClick={() => copyText(result?.converted_code ?? "", "Converted code copied")} />
        </div>
        <pre className="code-output min-h-[520px]">{result?.converted_code ?? "Converted code will appear here."}</pre>
      </section>
    </div>
  );
}

function RenderToolResult({ result }) {
  if (!result) {
    return <div className="empty-state"><Sparkles size={36} />Run the tool to generate findings, recommendations, and code output.</div>;
  }
  if (result.message) {
    return <div className="empty-state"><AlertTriangle size={36} />{result.message}</div>;
  }
  return (
    <div className="space-y-4">
      {Object.entries(result).map(([key, value]) => (
        <div key={key} className="rounded-xl border border-white/10 bg-black/35 p-4">
          <h4 className="mb-3 font-bold capitalize text-debug-red">{key.replaceAll("_", " ")}</h4>
          {typeof value === "string" || typeof value === "number" ? (
            <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-200">{value}</pre>
          ) : Array.isArray(value) ? (
            <div className="space-y-2">
              {value.map((item, index) => (
                <div key={index} className="rounded-lg bg-white/[0.04] p-3 text-sm text-zinc-300">
                  {typeof item === "object" ? Object.entries(item).map(([label, detail]) => <p key={label}><strong>{label}:</strong> {detail}</p>) : item}
                </div>
              ))}
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-200">{JSON.stringify(value, null, 2)}</pre>
          )}
        </div>
      ))}
    </div>
  );
}

function ResultCard({ title, badge, icon: Icon, action, children }) {
  return (
    <article className="glass-panel animate-rise p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className="text-debug-red" size={22} />
          <h3 className="text-xl font-black">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-debug-red/30 bg-debug-red/10 px-3 py-1 text-xs font-bold text-red-200">{badge}</span>
          {action}
        </div>
      </div>
      {children}
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <strong className="block text-xl font-black text-white">{value}</strong>
      <span className="mt-1 block text-xs leading-4 text-zinc-500">{label}</span>
    </div>
  );
}

function Severity({ value }) {
  const tone = value === "Critical" ? "bg-red-600 text-white" : value === "High" ? "bg-debug-red text-white" : value === "Medium" ? "bg-yellow-500 text-black" : "bg-zinc-700 text-zinc-100";
  return <span className={classNames("rounded-full px-2.5 py-1 text-xs font-black", tone)}>{value}</span>;
}

function CopyButton({ onClick }) {
  return (
    <button className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-zinc-300 transition hover:border-debug-red/50 hover:text-white" onClick={onClick} title="Copy">
      <Copy size={16} />
    </button>
  );
}

createRoot(document.getElementById("root")).render(<App />);
