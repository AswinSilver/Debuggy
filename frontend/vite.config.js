import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Local dev proxy: only used when VITE_API_URL is NOT set
    // (api.js hits :8000 directly, so this proxy is just a safety net)
    proxy: {
      "/analyze":    { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/security":   { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/complexity": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/tests":      { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/smells":     { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/convert":    { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
});
