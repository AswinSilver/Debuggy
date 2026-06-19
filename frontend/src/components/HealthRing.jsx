import React, { useEffect, useRef } from "react";

const TIERS = [
  { label: "Excellent", min: 90,  max: 100, color: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  { label: "Good",      min: 75,  max: 89,  color: "#84cc16", glow: "rgba(132,204,22,0.5)" },
  { label: "Average",   min: 55,  max: 74,  color: "#f59e0b", glow: "rgba(245,158,11,0.5)" },
  { label: "Critical",  min: 0,   max: 54,  color: "#ef1d32", glow: "rgba(239,29,50,0.5)"  },
];

function getTier(score) {
  return TIERS.find(t => score >= t.min && score <= t.max) ?? TIERS[3];
}

/* Maps 0-100 score → angle on the half-arc (-135° to +135° sweep, 270° total) */
function scoreToAngle(score) {
  return -135 + (score / 100) * 270;
}

export default function HealthRing({ score = 0, category = "Awaiting" }) {
  const needleRef = useRef(null);
  const prevAngle = useRef(-135);

  const tier    = getTier(score);
  const angle   = scoreToAngle(score);

  /* Animate needle */
  useEffect(() => {
    const el = needleRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.transform  = `rotate(${prevAngle.current}deg)`;
    // Force reflow then animate
    void el.offsetWidth;
    el.style.transition = "transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)";
    el.style.transform  = `rotate(${angle}deg)`;
    prevAngle.current   = angle;
  }, [angle]);

  /* SVG dimensions */
  const W = 260, H = 160, cx = 130, cy = 140, R = 110, r = 70;

  /* Build arc path helper */
  function arcPath(startDeg, endDeg, outerR, innerR) {
    const toRad = d => (d * Math.PI) / 180;
    const cos = Math.cos, sin = Math.sin;
    const s = toRad(startDeg), e = toRad(endDeg);
    const x1 = cx + outerR * cos(s), y1 = cy + outerR * sin(s);
    const x2 = cx + outerR * cos(e), y2 = cy + outerR * sin(e);
    const x3 = cx + innerR * cos(e), y3 = cy + innerR * sin(e);
    const x4 = cx + innerR * cos(s), y4 = cy + innerR * sin(s);
    const lg = endDeg - startDeg > 180 ? 1 : 0;
    return `M${x1},${y1} A${outerR},${outerR},0,${lg},1,${x2},${y2} L${x3},${y3} A${innerR},${innerR},0,${lg},0,${x4},${y4} Z`;
  }

  /* Arc segments per tier (sweep 270° total from -135° to +135°) */
  const segments = [
    { tier: TIERS[3], from: -135,  to: -54 },  // Critical  0-54   → -135 to -54
    { tier: TIERS[2], from: -54,   to:  27 },  // Average   55-74  → -54  to 27
    { tier: TIERS[1], from:  27,   to:  81 },  // Good      75-89  → 27 to 81
    { tier: TIERS[0], from:  81,   to: 135 },  // Excellent 90-100 → 81 to 135
  ];

  return (
    <div className="health-gauge-root">
      {/* Label */}
      <p className="eyebrow mb-3 text-center">Code Health Score</p>

      {/* Gauge SVG */}
      <div className="health-gauge-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ overflow: "visible" }}
        >
          <defs>
            {TIERS.map(t => (
              <filter key={t.label} id={`glow-${t.label}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Dark track background */}
          <path
            d={arcPath(-135, 135, R, r)}
            fill="rgba(255,255,255,0.04)"
          />

          {/* Coloured tier segments */}
          {segments.map(({ tier: t, from, to }) => (
            <path
              key={t.label}
              d={arcPath(from + 1, to - 1, R, r)}
              fill={t.color}
              opacity="0.22"
            />
          ))}

          {/* Active filled arc up to score */}
          {score > 0 && (
            <path
              d={arcPath(-135, angle, R, r)}
              fill={tier.color}
              style={{
                filter: `drop-shadow(0 0 8px ${tier.glow})`,
                transition: "d 0.8s ease",
              }}
            />
          )}

          {/* Segment tick marks */}
          {[-54, 27, 81].map(deg => {
            const toRad = d => (d * Math.PI) / 180;
            const x1 = cx + (r - 2) * Math.cos(toRad(deg));
            const y1 = cy + (r - 2) * Math.sin(toRad(deg));
            const x2 = cx + (R + 2) * Math.cos(toRad(deg));
            const y2 = cy + (R + 2) * Math.sin(toRad(deg));
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#08080c" strokeWidth="2.5" />;
          })}

          {/* Needle pivot */}
          <g
            ref={needleRef}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${angle}deg)`,
            }}
          >
            {/* Needle stick */}
            <line
              x1={cx} y1={cy}
              x2={cx} y2={cy - 90}
              stroke={tier.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${tier.color})` }}
            />
          </g>

          {/* Needle centre hub */}
          <circle cx={cx} cy={cy} r="8" fill="#111116" stroke={tier.color} strokeWidth="2" />
          <circle cx={cx} cy={cy} r="3.5" fill={tier.color} style={{ filter: `drop-shadow(0 0 5px ${tier.color})` }} />

          {/* Score text */}
          <text
            x={cx} y={cy - 22}
            textAnchor="middle"
            fontSize="36"
            fontWeight="900"
            fontFamily="Inter, sans-serif"
            fill="#fff"
          >
            {score}
          </text>

          {/* Category label */}
          <text
            x={cx} y={cy - 6}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
            fill={tier.color}
            letterSpacing="2"
            style={{ textTransform: "uppercase" }}
          >
            {score === 0 ? "AWAITING" : tier.label.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Legend chips */}
      <div className="health-gauge-legend">
        {TIERS.slice().reverse().map(t => (
          <div
            key={t.label}
            className={`health-gauge-chip ${tier.label === t.label && score > 0 ? "health-gauge-chip--active" : ""}`}
            style={{ "--chip-color": t.color }}
          >
            <span className="health-gauge-chip-val">
              {t.min === 0 ? "<30" : `${t.min}+`}
            </span>
            <span className="health-gauge-chip-label">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
