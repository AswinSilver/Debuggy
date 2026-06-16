# Debuggy AI

> AI-powered software quality platform — code review, security scanning, complexity analysis, test generation, smell detection and code conversion. **100% powered by Groq's LLM (llama-3.3-70b-versatile).**

## Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 · React Router · Vite · Tailwind CSS |
| Backend  | FastAPI · Uvicorn · Pydantic · Groq SDK |
| AI       | Groq Cloud — llama-3.3-70b-versatile (JSON Mode) |

## Features
- **Dashboard** — Paste code → AI analysis → errors, corrected code, explanations, health score
- **Security Scanner** — OWASP / CVE vulnerability audit + hardened code
- **Complexity Analyzer** — Big-O time & space, bottlenecks, optimizations
- **Test Generator** — Unit, edge, boundary, stress tests + runnable code
- **Code Smell Detector** — Fowler patterns, refactoring suggestions
- **Code Converter** — Translate between 13 languages

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env          # add your GROQ_API_KEY
uvicorn app:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

## Deploy — Render (Backend) + Vercel (Frontend)
See the full deployment guide: [DEPLOY.md](./DEPLOY.md)
