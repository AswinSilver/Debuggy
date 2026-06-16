import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Security from "./pages/Security";
import Complexity from "./pages/Complexity";
import Tests from "./pages/Tests";
import Smells from "./pages/Smells";
import Converter from "./pages/Converter";
import { postJson } from "./utils/api";

const sampleCode = `function login(user) {
  const password = "admin123";
  const query = "SELECT * FROM users WHERE name = '" + user + "'";
  eval("console.log(query)");
  if (user = "admin") {
    return true;
  }
}`;

const fallbackAnalysis = {
  errors: [
    {
      type: "Logic error",
      detail: "Assignment appears inside a conditional.",
      severity: "High",
    },
    { type: "Security concern", detail: "Hardcoded Credentials", severity: "High" },
    { type: "Security concern", detail: "SQL Injection", severity: "High" },
    { type: "Security concern", detail: "Dangerous Function", severity: "Critical" },
  ],
  fixed_code: `function login(user) {
  const password = process.env.SECRET_VALUE;
  const query = "SELECT * FROM users WHERE name = '" + user + "'";
  // Removed unsafe eval.
  if (user === "admin") {
    return true;
  }
}`,
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

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState(sampleCode);
  const [analysis, setAnalysis] = useState(fallbackAnalysis);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/security":
        return "Security Scanner";
      case "/complexity":
        return "Complexity Analyzer";
      case "/tests":
        return "Test Case Generator";
      case "/smells":
        return "Code Smell Detector";
      case "/converter":
        return "Code Converter";
      default:
        return "Dashboard";
    }
  };

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
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
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,29,50,0.26),transparent_30%),radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.08),transparent_18%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30 pointer-events-none" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="relative z-10 min-h-screen lg:pl-72">
        <Header
          title={getPageTitle()}
          onMenuOpen={() => setSidebarOpen(true)}
          analysis={location.pathname === "/" ? analysis : null}
          code={code}
          language={language}
        />

        <div className="p-4 sm:p-6 xl:p-8">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  language={language}
                  setLanguage={setLanguage}
                  code={code}
                  setCode={setCode}
                  analysis={analysis}
                  loading={loading}
                  runAnalysis={runAnalysis}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/security"
              element={
                <Security code={code} language={language} showToast={showToast} />
              }
            />
            <Route
              path="/complexity"
              element={
                <Complexity code={code} language={language} showToast={showToast} />
              }
            />
            <Route
              path="/tests"
              element={
                <Tests code={code} language={language} showToast={showToast} />
              }
            />
            <Route
              path="/smells"
              element={
                <Smells code={code} language={language} showToast={showToast} />
              }
            />
            <Route
              path="/converter"
              element={
                <Converter code={code} language={language} showToast={showToast} />
              }
            />
          </Routes>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-debug-red/40 bg-black px-4 py-3 text-sm shadow-redglow">
          {toast}
        </div>
      )}
    </div>
  );
}
