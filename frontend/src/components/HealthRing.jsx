import React from "react";

export default function HealthRing({ score = 0, category = "N/A" }) {
  // SVG arc for score (0-100)
  const R = 70;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;

  const color =
    score >= 90 ? "#22c55e" :
    score >= 75 ? "#84cc16" :
    score >= 55 ? "#f59e0b" :
    score >= 30 ? "#ef4444" : "#7b0814";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          {/* Track */}
          <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="90" cy="90" r={R}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.8s ease", filter: `drop-shadow(0 0 8px ${color}99)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tabular-nums text-white">{score}</span>
          <span className="mt-0.5 text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
            {category}
          </span>
        </div>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[["90+","Excellent","#22c55e"],["75+","Good","#84cc16"],["55+","Average","#f59e0b"],["<30","Critical","#ef4444"]].map(([val, lbl, c]) => (
          <div key={lbl} className="metric-tile">
            <p className="text-base font-black" style={{ color: c }}>{val}</p>
            <p className="text-[10px] text-zinc-500">{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
