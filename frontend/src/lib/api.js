// API base URL resolution:
//  1. If VITE_API_URL is set (set this in Vercel env vars = your Render URL)
//  2. Local dev fallback → direct to FastAPI on :8000
const BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||   // strip trailing slash
  "http://127.0.0.1:8000";

export async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} — ${path}`);
  return res.json();
}
