import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ShieldCheck, Gauge, FlaskConical,
  SearchCode, Repeat2, X, Zap, BrainCircuit,
} from "lucide-react";
import { cx } from "../lib/utils";

const LINKS = [
  { to: "/",           label: "Dashboard",          icon: LayoutDashboard },
  { to: "/security",   label: "Security Scanner",   icon: ShieldCheck },
  { to: "/complexity", label: "Complexity Analyzer",icon: Gauge },
  { to: "/tests",      label: "Test Generator",     icon: FlaskConical },
  { to: "/smells",     label: "Code Smell Detector",icon: SearchCode },
  { to: "/converter",  label: "Code Converter",     icon: Repeat2 },
  { to: "/algorithm",  label: "Algorithm Generator",icon: BrainCircuit },
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
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-glow">
              <Zap size={18} className="text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#08080c]" />
            </div>
            <div>
              <p className="text-sm font-black leading-none text-white">Codexa</p>
              <p className="mt-0.5 text-[10px] text-zinc-500">Code Analysis Platform</p>
            </div>
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
        <div className="mx-3 mb-4 rounded-xl border border-brand-500/20 bg-brand-500/[0.07] p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse-slow rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-white">System Online</span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-zinc-500">
            All analysis engines ready
          </p>
        </div>
      </aside>
    </>
  );
}
