/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          50:  "#fff0f1",
          100: "#ffe0e3",
          200: "#ffc6cb",
          300: "#ff9aa3",
          400: "#ff5d6a",
          500: "#ef1d32",
          600: "#d40e22",
          700: "#b20a1d",
          800: "#930c1d",
          900: "#7a0f1e",
          950: "#430208",
        },
      },
      boxShadow: {
        glow:   "0 0 28px rgba(239,29,50,0.35)",
        "glow-lg": "0 0 60px rgba(239,29,50,0.25)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease both",
        "fade-in":    "fadeIn 0.4s ease both",
        "slide-in":   "slideIn 0.35s ease both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":  "spin 3s linear infinite",
        "scan":       "scan 2s ease-in-out infinite",
        "float":      "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:  { "0%": { opacity:"0", transform:"translateY(18px)" }, "100%": { opacity:"1", transform:"translateY(0)" } },
        fadeIn:  { "0%": { opacity:"0" }, "100%": { opacity:"1" } },
        slideIn: { "0%": { opacity:"0", transform:"translateX(-12px)" }, "100%": { opacity:"1", transform:"translateX(0)" } },
        scan:    { "0%,100%": { transform:"translateX(-100%)" }, "50%": { transform:"translateX(100%)" } },
        float:   { "0%,100%": { transform:"translateY(0)" }, "50%": { transform:"translateY(-8px)" } },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
