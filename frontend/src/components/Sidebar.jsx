import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ShieldCheck, Gauge, FlaskConical,
  SearchCode, Repeat2, X, BrainCircuit, Sparkles,
} from "lucide-react";
import { cx } from "../lib/utils";

const LINKS = [
  { to: "/",           label: "Dashboard",          icon: LayoutDashboard },
  { to: "/security",   label: "Security Scanner",   icon: ShieldCheck },
  { to: "/complexity", label: "Complexity Analyzer",icon: Gauge },
  { to: "/tests",      label: "Test Generator",     icon: FlaskConical },
  { to: "/smells",     label: "Code Smell Detector",icon: SearchCode },
  { to: "/converter",  label: "Code Converter",     icon: Repeat2 },
  { to: "/algorithm",    label: "Algorithm Generator",icon: BrainCircuit },
  { to: "/prompt-to-code", label: "Prompt to Code",   icon: Sparkles },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.07] bg-[#08080c]/95 backdrop-blur-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            {/* Nebula custom logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
                 style={{
                   background: "linear-gradient(135deg, #7b0814 0%, #d40e22 55%, #ef1d32 100%)",
                   boxShadow: "0 0 20px rgba(239,29,50,0.55), 0 0 45px rgba(239,29,50,0.2)",
                 }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9"
                         transform="rotate(-30 12 12)" />
                <ellipse cx="12" cy="12" rx="5.5" ry="2.8" stroke="rgba(255,255,255,0.65)" strokeWidth="0.9"
                         transform="rotate(40 12 12)" />
                <circle cx="12" cy="12" r="2.4" fill="white" opacity="1" />
                <circle cx="6.5" cy="8"   r="0.8" fill="white" opacity="0.85" />
                <circle cx="17" cy="15.5" r="0.7" fill="white" opacity="0.75" />
                <circle cx="15" cy="6.5"  r="0.6" fill="white" opacity="0.65" />
                <circle cx="8"  cy="16.5" r="0.6" fill="white" opacity="0.65" />
              </svg>
            </div>
            <p style={{
                 fontSize: "1.05rem",
                 fontWeight: 900,
                 letterSpacing: "0.12em",
                 color: "#ffffff",
                 textShadow: "0 0 20px rgba(239,29,50,0.6), 0 0 8px rgba(239,29,50,0.3)",
                 lineHeight: 1,
               }}>
              NEBULA
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cx("nav-link", isActive ? "nav-link-active" : "nav-link-inactive")
              }
            >
              <Icon size={17} className="shrink-0" />
              <span className="text-[13px]">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Status badge */}
        <div className="mx-3 mb-4 rounded-xl border border-brand-500/20 bg-brand-500/[0.06] p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse-slow rounded-full bg-emerald-400"
                  style={{ boxShadow: "0 0 6px #34d399" }} />
            <span className="text-xs font-bold text-white">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
