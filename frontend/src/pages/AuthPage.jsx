import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, ArrowRight, Mail, Lock, User, Sparkles, ShieldCheck, Gauge, FlaskConical, Zap } from "lucide-react";
import { register, login } from "../lib/auth";

const FEATURES = [
  { Icon: ShieldCheck,  title: "Security Scanner",    desc: "OWASP, XSS, SQLi detection" },
  { Icon: Gauge,        title: "Complexity Analyzer", desc: "Big-O and bottleneck analysis" },
  { Icon: FlaskConical, title: "Test Generator",      desc: "Unit, edge & stress tests" },
];

export default function AuthModal({ defaultMode = "login", onClose, onAuth }) {
  const [mode,    setMode]    = useState(defaultMode);
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [error,   setError]   = useState("");

  /* Close on Escape */
  useEffect(() => {
    function handler(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setError("");
  }

  function switchMode(m) {
    setMode(m);
    setError("");
    setForm({ name: "", email: "", password: "" });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (mode === "register" && !form.name.trim()) { setError("Name is required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 600));

    const result = mode === "register"
      ? register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      : login({ email: form.email.trim(), password: form.password });

    setLoading(false);

    if (!result.ok) { setError(result.error); return; }
    onAuth(result.user);
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="auth-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="auth-modal-panel">

        {/* Close button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Left branding strip */}
        <div className="auth-modal-left">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Zap size={20} className="text-white" />
              <span className="auth-logo-dot" />
            </div>
            <div>
              <p className="auth-logo-name">Codexa</p>
              <p className="auth-logo-sub">Code Analysis Platform</p>
            </div>
          </div>

          <div className="auth-hero">
            <p className="eyebrow mb-3">AI-Powered Analysis</p>
            <h2 className="auth-headline">
              Debug Smarter.<br />
              Ship <span className="auth-headline-accent">Faster.</span>
            </h2>
            <p className="auth-subheadline">
              Catch bugs, security flaws, and performance issues before they reach production.
            </p>
          </div>

          <div className="auth-features">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Icon size={15} className="text-brand-500" />
                </div>
                <div>
                  <p className="auth-feature-title">{title}</p>
                  <p className="auth-feature-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>

        {/* Right form */}
        <div className="auth-modal-right">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "auth-tab--active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
            <div
              className="auth-tab-slider"
              style={{ transform: mode === "register" ? "translateX(100%)" : "translateX(0%)" }}
            />
          </div>

          <div className="mb-6">
            <h3 className="auth-form-title">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h3>
            <p className="auth-form-sub">
              {mode === "login"
                ? "Sign in to save your analysis history."
                : "Join and unlock all analysis tools."}
            </p>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <User size={14} className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    className="auth-input"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={14} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  className="auth-input"
                  autoComplete="email"
                  autoFocus={mode === "login"}
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="flex items-center justify-between mb-1.5">
                <label className="auth-label">Password</label>
                {mode === "login" && (
                  <button type="button" className="auth-forgot">Forgot password?</button>
                )}
              </div>
              <div className="auth-input-wrap">
                <Lock size={14} className="auth-input-icon" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  className="auth-input"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="auth-eye-btn"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <span className="auth-error-dot" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <span className="auth-submit-loading">
                  <span className="auth-spinner" />
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </span>
              ) : (
                <>
                  <Sparkles size={15} />
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={14} className="auth-arrow" />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch-hint">
            {mode === "login"
              ? <>Don't have an account?{" "}<button className="auth-switch-btn" onClick={() => switchMode("register")}>Register free →</button></>
              : <>Already have an account?{" "}<button className="auth-switch-btn" onClick={() => switchMode("login")}>Sign in →</button></>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
