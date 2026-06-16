import React from "react";
import Metric from "./Metric";

export default function ScorePanel({ healthScore = 0, healthCategory = "N/A" }) {
  return (
    <aside className="glass-panel p-5">
      <p className="eyebrow">Code health score</p>
      <div className="relative mx-auto mt-6 grid h-52 w-52 place-items-center rounded-full border border-debug-red/35 bg-debug-red/10 shadow-redglow">
        <div className="absolute inset-4 rounded-full border border-white/10" />
        <div className="text-center">
          <div className="text-6xl font-black">{healthScore}</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-[0.22em] text-debug-red">
            {healthCategory}
          </div>
        </div>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-debug-red to-red-300 transition-all duration-500"
          style={{ width: `${healthScore}%` }}
        />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Metric label="Excellent" value="90+" />
        <Metric label="Good" value="75+" />
        <Metric label="Average" value="55+" />
        <Metric label="Critical" value="&lt;30" />
      </div>
    </aside>
  );
}
