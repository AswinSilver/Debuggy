import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Gauge,
  FlaskConical,
  SearchCode,
  Repeat2,
  X,
} from "lucide-react";
import { classNames } from "../utils/helpers";

const pages = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/security", label: "Security Scanner", icon: ShieldCheck },
  { path: "/complexity", label: "Complexity Analyzer", icon: Gauge },
  { path: "/tests", label: "Test Case Generator", icon: FlaskConical },
  { path: "/smells", label: "Code Smell Detector", icon: SearchCode },
  { path: "/converter", label: "Code Converter", icon: Repeat2 },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={classNames(
        "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-black/85 p-5 backdrop-blur-2xl transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-debug-red text-xl font-black shadow-redglow">
            D
          </div>
          <div>
            <p className="text-lg font-extrabold">Debuggy AI</p>
            <p className="text-xs text-zinc-400">Software quality platform</p>
          </div>
        </div>
        <button
          className="rounded border border-white/10 p-2 lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="space-y-2">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <NavLink
              key={page.path}
              to={page.path}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  "group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition",
                  isActive
                    ? "border-debug-red/70 bg-debug-red/15 text-white shadow-redglow"
                    : "border-white/5 bg-white/[0.03] text-zinc-400 hover:border-debug-red/40 hover:text-white"
                )
              }
            >
              <Icon size={18} />
              <span>{page.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-debug-red/30 bg-debug-red/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2.5 w-2.5 rounded-full bg-debug-red shadow-redglow" />
          AI review engine online
        </div>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          Pure Groq LLM orchestration with structured schema response mapping.
        </p>
      </div>
    </aside>
  );
}
