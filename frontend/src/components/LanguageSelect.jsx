import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/* ── Per-language colour + icon data ────────────────────────────────────── */
const LANG_META = {
  JavaScript: {
    color: "#F7DF1E",
    bg: "rgba(247,223,30,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <rect width="32" height="32" rx="4" fill="#F7DF1E" />
        <path d="M6 26.5l3.2-1.95c.62 1.1 1.18 2.03 2.53 2.03 1.3 0 2.12-.5 2.12-2.47V13h3.95v11.17c0 4.07-2.38 5.92-5.85 5.92-3.14 0-4.96-1.63-5.87-3.59zm13.2-.37l3.2-1.85c.84 1.37 1.93 2.38 3.86 2.38 1.62 0 2.65-.81 2.65-1.93 0-1.34-1.06-1.81-2.85-2.59l-.98-.42c-2.82-1.2-4.7-2.71-4.7-5.9 0-2.93 2.24-5.17 5.73-5.17 2.49 0 4.28.87 5.57 3.13l-3.05 1.96c-.67-1.2-1.4-1.67-2.52-1.67-1.14 0-1.87.72-1.87 1.67 0 1.17.73 1.64 2.41 2.36l.98.42c3.32 1.42 5.2 2.88 5.2 6.14 0 3.52-2.76 5.46-6.47 5.46-3.63 0-5.97-1.73-7.1-4z" fill="#000" />
      </svg>
    ),
  },
  TypeScript: {
    color: "#3178C6",
    bg: "rgba(49,120,198,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <rect width="32" height="32" rx="4" fill="#3178C6" />
        <path d="M18.5 14.5h-4V12h11v2.5h-4V26H18.5V14.5zM8 19.5c.5 1.5 1.6 2.3 3 2.3 1.3 0 2-.6 2-1.5 0-1-.7-1.3-2.2-1.9l-.8-.3c-2.2-.9-3.4-2.1-3.4-4.2 0-2.4 1.9-4.1 4.7-4.1 2 0 3.5.7 4.5 2.5l-2.4 1.5c-.5-1-.95-1.3-2.1-1.3-.95 0-1.55.55-1.55 1.3 0 .9.6 1.25 2 1.85l.8.3c2.6 1.1 3.8 2.25 3.8 4.4 0 2.85-2.3 4.45-5.3 4.45-2.95 0-4.9-1.4-5.8-3.5L8 19.5z" fill="#fff" />
      </svg>
    ),
  },
  Python: {
    color: "#3776AB",
    bg: "rgba(55,118,171,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <path d="M15.9 2C9.4 2 9.8 4.8 9.8 4.8l.01 2.9h6.2v.9H7.4S2 8 2 14.6s4.8 6.4 4.8 6.4H9v-3.1s-.1-4.8 4.7-4.8h8.1s4.5.07 4.5-4.4V6.3S26.9 2 15.9 2zM12.7 4.3c.8 0 1.45.65 1.45 1.45S13.5 7.2 12.7 7.2s-1.45-.65-1.45-1.45S11.9 4.3 12.7 4.3z" fill="#3776AB" />
        <path d="M16.1 30c6.5 0 6.1-2.8 6.1-2.8l-.01-2.9h-6.2v-.9h8.61S30 23.1 30 16.5s-4.8-6.4-4.8-6.4H23v3.1s.1 4.8-4.7 4.8H10.2S5.7 17.93 5.7 22.4v4.4S4.8 30 16.1 30zm3.2-2.3c-.8 0-1.45-.65-1.45-1.45s.65-1.45 1.45-1.45 1.45.65 1.45 1.45-.65 1.45-1.45 1.45z" fill="#FFD43B" />
      </svg>
    ),
  },
  Java: {
    color: "#ED8B00",
    bg: "rgba(237,139,0,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <path d="M11.2 21.8s-1.1.64.78.86c2.28.26 3.45.22 5.96-.25 0 0 .66.41 1.58.77-5.62 2.4-12.72-.14-8.32-1.38z" fill="#5382A1"/>
        <path d="M10.5 18.8s-1.23.9.65 1.1c2.43.31 4.35.34 7.67-.46 0 0 .46.47 1.18.72-6.79 1.99-14.36.16-9.5-1.36z" fill="#5382A1"/>
        <path d="M15.7 13.3c1.38 1.59-.36 3.02-.36 3.02s3.5-1.81 1.9-4.07c-1.5-2.1-2.65-3.14 3.57-6.73 0 0-9.75 2.44-5.11 7.78z" fill="#E76F00"/>
        <path d="M22.4 23.7s.81.67-.9 1.19c-3.25 1-13.53 1.3-16.39.04-1.03-.45.9-1.07 1.5-1.2.62-.13.98-.1.98-.1-1.13-.8-7.3 1.56-3.14 2.24 11.37 1.84 20.73-.83 17.95-2.17z" fill="#5382A1"/>
        <path d="M11.7 15.7s-5.17 1.23-1.83 1.67c1.41.19 4.22.15 6.84-.08 2.14-.19 4.29-.59 4.29-.59s-.75.32-1.3.7c-5.23 1.38-15.33.74-12.44-.68 2.46-1.21 4.44-1.02 4.44-1.02z" fill="#5382A1"/>
        <path d="M19.4 20.3c5.32-2.76 2.86-5.42 1.14-5.07-.42.09-.61.17-.61.17s.16-.25.46-.36c3.4-1.19 6.02 3.52-1.1 5.39 0 0 .08-.07.11-.13z" fill="#5382A1"/>
        <path d="M16.4 2s2.96 2.96-2.81 7.5c-4.62 3.66-1.05 5.74 0 8.12-2.7-2.44-4.68-4.59-3.35-6.59C12.18 8.4 17.6 6.97 16.4 2z" fill="#E76F00"/>
        <path d="M12.1 29.7c5.1.33 12.94-.18 13.13-2.6 0 0-.36.91-4.22 1.64-4.35.82-9.7.72-12.88.2 0 0 .65.54 3.97.76z" fill="#5382A1"/>
      </svg>
    ),
  },
  C: {
    color: "#A8B9CC",
    bg: "rgba(168,185,204,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <circle cx="16" cy="16" r="14" fill="#A8B9CC"/>
        <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff">C</text>
      </svg>
    ),
  },
  "C++": {
    color: "#00599C",
    bg: "rgba(0,89,156,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <circle cx="16" cy="16" r="14" fill="#00599C"/>
        <text x="13" y="21" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">C++</text>
      </svg>
    ),
  },
  "C#": {
    color: "#9B4993",
    bg: "rgba(155,73,147,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <circle cx="16" cy="16" r="14" fill="#9B4993"/>
        <text x="15" y="21" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">C#</text>
      </svg>
    ),
  },
  Go: {
    color: "#00ACD7",
    bg: "rgba(0,172,215,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <rect width="32" height="32" rx="4" fill="#00ACD7"/>
        <path d="M5 16.2c0-.1.1-.2.2-.2h21.6c.1 0 .2.1.2.2v1.6c0 .1-.1.2-.2.2H5.2c-.1 0-.2-.1-.2-.2v-1.6zm3-3c0-.1.1-.2.2-.2h15.6c.1 0 .2.1.2.2v1.6c0 .1-.1.2-.2.2H8.2c-.1 0-.2-.1-.2-.2v-1.6zm3 6c0-.1.1-.2.2-.2h9.6c.1 0 .2.1.2.2v1.6c0 .1-.1.2-.2.2H11.2c-.1 0-.2-.1-.2-.2v-1.6z" fill="#fff"/>
      </svg>
    ),
  },
  Rust: {
    color: "#CE422B",
    bg: "rgba(206,66,43,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <circle cx="16" cy="16" r="14" fill="#CE422B"/>
        <text x="16" y="21" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">Rs</text>
      </svg>
    ),
  },
  Ruby: {
    color: "#CC342D",
    bg: "rgba(204,52,45,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <path d="M7 25l3-14 5 2 5-2 3 14L16 29 7 25z" fill="#CC342D"/>
        <path d="M20 11l5 4-2 10-7-4V11z" fill="#A31515"/>
        <path d="M12 11l-5 4 2 10 7-4V11z" fill="#E05252"/>
        <path d="M12 11h8l2-4H10l2 4z" fill="#FF6B6B"/>
      </svg>
    ),
  },
  PHP: {
    color: "#777BB4",
    bg: "rgba(119,123,180,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <ellipse cx="16" cy="16" rx="14" ry="9" fill="#777BB4"/>
        <text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">PHP</text>
      </svg>
    ),
  },
  Swift: {
    color: "#FA7343",
    bg: "rgba(250,115,67,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <rect width="32" height="32" rx="7" fill="#FA7343"/>
        <path d="M24 10.5C21.5 6.5 16.3 4.7 11.7 6.7c-3.2 1.3-5.5 4-6.2 7.3 1.4-1.8 3.4-3 5.7-3.4C9 14 8.1 19 12 22.5c-.4-.7-.6-1.4-.6-2.2 0-2.4 2-4.3 4.8-5.7 1.9-.9 3.5-2 4.9-3.5.7 2.3.3 4.8-1.1 6.8 1.8-1 3.1-2.6 3.6-4.5.4 1.2.5 2.5.1 3.8C22.7 21 20 23.5 16.4 24.7c-4.3 1.4-8.9-.3-11.4-4.1 1.8 3.6 5.5 5.9 9.7 5.9 5.7 0 10.5-4.3 11.1-10 .3-2.2-.2-4.5-1.8-6z" fill="#fff"/>
      </svg>
    ),
  },
  Kotlin: {
    color: "#7F52FF",
    bg: "rgba(127,82,255,0.12)",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
        <path d="M2 2h14l-14 14V2z" fill="#7F52FF"/>
        <path d="M2 30L16 16l14 14H2z" fill="#C757BC"/>
        <path d="M16 2h14L16 16 2 2h14z" fill="#E44857"/>
      </svg>
    ),
  },
};

/* ── Component ───────────────────────────────────────────────────────────── */
export default function LanguageSelect({ value, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const languages = Object.keys(LANG_META);

  /* Close on outside click */
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const selected = LANG_META[value] ?? LANG_META["JavaScript"];

  return (
    <div
      ref={ref}
      className={`lang-select-root ${className}`}
      style={{ position: "relative", minWidth: 170 }}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="lang-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Left: icon + label */}
        <span className="lang-select-left">
          <span
            className="lang-select-icon-wrap"
            style={{ background: selected.bg, borderColor: selected.color + "40" }}
          >
            {selected.icon}
          </span>
          <span className="lang-select-label">{value}</span>
        </span>
        {/* Right: chevron */}
        <ChevronDown
          size={14}
          className="lang-select-chevron"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          role="listbox"
          className="lang-select-dropdown"
        >
          {languages.map((lang) => {
            const meta = LANG_META[lang];
            const isActive = lang === value;
            return (
              <li
                key={lang}
                role="option"
                aria-selected={isActive}
                className={`lang-select-option ${isActive ? "lang-select-option--active" : ""}`}
                onClick={() => { onChange(lang); setOpen(false); }}
              >
                <span
                  className="lang-select-icon-wrap"
                  style={{ background: meta.bg, borderColor: meta.color + "40" }}
                >
                  {meta.icon}
                </span>
                <span className="lang-select-option-label">{lang}</span>
                {isActive && (
                  <span className="lang-select-check">✓</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
