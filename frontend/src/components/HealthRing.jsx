import React, { useEffect, useRef, useState } from "react";

const TIERS = [
  { label: "Excellent", min: 90,  color: "#22c55e", chipVal: "90+" },
  { label: "Good",      min: 75,  color: "#84cc16", chipVal: "75+" },
  { label: "Average",   min: 55,  color: "#f59e0b", chipVal: "55+" },
  { label: "Critical",  min: 0,   color: "#ef1d32", chipVal: "<30" },
];

function getTier(score) {
  if (score >= 90) return TIERS[0];
  if (score >= 75) return TIERS[1];
  if (score >= 55) return TIERS[2];
  return TIERS[3];
}

export default function HealthRing({ score = 0, category = "Awaiting" }) {
  const [displayScore, setDisplayScore] = useState(0);
  const animRef = useRef(null);

  /* Animate the number counter */
  useEffect(() => {
    let start = null;
    const duration = 1000;
    const from = 0;
    const to = score;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(from + (to - from) * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  const tier = getTier(score);

  /* 
   * SVG semicircle: half-circle arc from 180° to 0° (left to right across top)
   * We use a circle with a clip / stroke-dasharray trick for the semicircle.
   *
   * Radius R, centre (cx, cy). The stroke goes 0° to 180° (bottom half hidden).
   * Total circumference = 2πR. We only show top half = πR.
   * strokeDasharray = "πR πR" (visible top, hidden bottom)
   * strokeDashoffset shifts into that top half based on score.
   */
  const R  = 80;
  const cx = 110;
  const cy = 110;
  const circ = 2 * Math.PI * R;        // full circumference
  const half  = Math.PI * R;           // half circumference (semicircle length)
  const filled = (score / 100) * half; // how much to fill

  // dasharray: show [half] then hide [half]
  // dashoffset: start at -half (so arc starts at left = 180°), then offset back by filled amount
  // Actually: rotate SVG -90deg, dasharray = half circ half circ, offset = half - filled
  const trackDash  = `${half} ${circ}`;
  const scoreDash  = `${filled} ${circ}`;
  // Offset to start from left side of the semicircle
  // SVG 0° is right, rotating -90° puts 0° at top, we want arc from left to right across top:
  // rotate SVG container by 180° → arc goes from right at bottom to left at bottom across top
  // Actually simplest: rotate the SVG by -180deg and use dashoffset from half.
  // Let's use the transform approach.

  return (
    <div className="hring-root">
      <p className="eyebrow mb-4 text-center">Code Health Score</p>

      {/* Semicircle SVG */}
      <div className="hring-svg-wrap">
        <svg
          viewBox="0 0 220 130"
          width="100%"
          style={{ maxWidth: 280, display: "block", margin: "0 auto", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={score < 55 ? "#ef1d32" : score < 75 ? "#f59e0b" : score < 90 ? "#84cc16" : "#22c55e"} stopOpacity="0.7" />
              <stop offset="100%" stopColor={tier.color} />
            </linearGradient>
            <filter id="arc-glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Track — grey semicircle */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="13"
            strokeDasharray={trackDash}
            strokeLinecap="round"
            transform={`rotate(180 ${cx} ${cy})`}
          />

          {/* Score arc — animates via CSS transition on strokeDasharray */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={score === 0 ? "transparent" : "url(#arc-grad)"}
            strokeWidth="13"
            strokeDasharray={scoreDash}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(180 ${cx} ${cy})`}
            filter="url(#arc-glow)"
            style={{
              transition: "stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)",
            }}
          />

          {/* Glow dot at arc tip */}
          {score > 2 && (() => {
            // position tip dot: angle goes from 180° (left) to 360° (right) as score 0→100
            const deg = 180 + (score / 100) * 180;
            const rad = (deg * Math.PI) / 180;
            const tx = cx + R * Math.cos(rad);
            const ty = cy + R * Math.sin(rad);
            return (
              <circle
                cx={tx} cy={ty} r="7"
                fill="#ffffff"
                stroke={tier.color}
                strokeWidth="3"
                filter="url(#arc-glow)"
                style={{ transition: "cx 1.1s cubic-bezier(0.4,0,0.2,1), cy 1.1s cubic-bezier(0.4,0,0.2,1)" }}
              />
            );
          })()}

          {/* Score number */}
          <text
            x={cx} y={cy - 8}
            textAnchor="middle"
            fontSize="38"
            fontWeight="900"
            fontFamily="Inter, sans-serif"
            fill="#ffffff"
          >
            {displayScore}
          </text>

          {/* Status label */}
          <text
            x={cx} y={cy + 16}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
            fill={score === 0 ? "#5a5466" : tier.color}
            letterSpacing="2.5"
          >
            {score === 0 ? "AWAITING ANALYSIS" : tier.label.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Legend chips */}
      <div className="hring-chips">
        {TIERS.map(t => {
          const isActive = tier.label === t.label && score > 0;
          return (
            <div
              key={t.label}
              className={`hring-chip ${isActive ? "hring-chip--on" : ""}`}
              style={{ "--c": t.color }}
            >
              <span className="hring-chip-val">{t.chipVal}</span>
              <span className="hring-chip-lbl">{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
