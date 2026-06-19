import React, { useState, useCallback } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar    from "./components/Sidebar";
import Header     from "./components/Header";
import SpaceBg   from "./components/SpaceBg";
import Dashboard  from "./pages/Dashboard";
import Security   from "./pages/Security";
import Complexity from "./pages/Complexity";
import Tests      from "./pages/Tests";
import Smells     from "./pages/Smells";
import Converter  from "./pages/Converter";
import AuthModal  from "./pages/AuthPage";
import { getSession, clearSession } from "./lib/auth";

const PAGE_TITLES = {
  "/":           "Dashboard",
  "/security":   "Security Scanner",
  "/complexity": "Complexity Analyzer",
  "/tests":      "Test Generator",
  "/smells":     "Code Smell Detector",
  "/converter":  "Code Converter",
};

export default function App() {
  // Restore session from localStorage on first load
  const [user,        setUser]        = useState(() => getSession());
  const [authModal,   setAuthModal]   = useState(null); // null | "login" | "register"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sharedCode,  setSharedCode]  = useState("");
  const [sharedLang,  setSharedLang]  = useState("JavaScript");
  const [analysis,    setAnalysis]    = useState(null);
  const [toastMsg,    setToastMsg]    = useState("");

  const location = useLocation();
  const title    = PAGE_TITLES[location.pathname] ?? "Dashboard";

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  }, []);

  function handleAuth(authUser) {
    setUser(authUser);
    setAuthModal(null);
    toast(`Welcome, ${authUser.name}! 👋`);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    toast("Signed out successfully.");
  }

  const pageProps = { sharedCode, setSharedCode, sharedLang, setSharedLang, toast };

  return (
    <div className="noise min-h-screen bg-[#060608] text-[#f1eef0]">
      {/* Animated space background */}
      <SpaceBg />
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-60" style={{ zIndex: 1 }} />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="relative z-10 lg:pl-64">
        <Header
          title={title}
          onMenuOpen={() => setSidebarOpen(true)}
          analysis={analysis}
          code={sharedCode}
          language={sharedLang}
          user={user}
          onSignUp={() => setAuthModal("register")}
          onLogin={() => setAuthModal("login")}
          onLogout={handleLogout}
        />

        <main className="p-4 sm:p-6 xl:p-8">
          <Routes>
            <Route path="/"           element={<Dashboard  {...pageProps} setAnalysis={setAnalysis} />} />
            <Route path="/security"   element={<Security   {...pageProps} />} />
            <Route path="/complexity" element={<Complexity {...pageProps} />} />
            <Route path="/tests"      element={<Tests      {...pageProps} />} />
            <Route path="/smells"     element={<Smells     {...pageProps} />} />
            <Route path="/converter"  element={<Converter  {...pageProps} />} />
          </Routes>
        </main>
      </div>

      {/* Auth modal — renders over the dashboard */}
      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onClose={() => setAuthModal(null)}
          onAuth={handleAuth}
        />
      )}

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-up rounded-xl
                        border border-white/10 bg-[#111116] px-4 py-3 text-sm
                        font-semibold text-white shadow-2xl backdrop-blur-xl">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
