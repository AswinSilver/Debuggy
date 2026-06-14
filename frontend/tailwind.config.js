/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        debug: {
          black: "#050506",
          panel: "#0c0c10",
          red: "#ef1d32",
          redDark: "#7f0814",
          line: "#26262d",
          ink: "#f6f3f4",
        },
      },
      boxShadow: {
        redglow: "0 0 40px rgba(239, 29, 50, 0.22)",
      },
      animation: {
        rise: "rise 0.45s ease both",
        scan: "scan 1.35s ease-in-out infinite",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%, 100%": { transform: "translateX(-80%)" },
          "50%": { transform: "translateX(80%)" },
        },
      },
    },
  },
  plugins: [],
};
