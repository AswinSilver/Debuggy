# Debuggy AI

Debuggy AI is a modern AI-powered software engineering dashboard for code analysis, security review, complexity checks, test case generation, code smell detection, and code conversion.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: FastAPI, Pydantic, Uvicorn
- UI: Dark red/black developer dashboard with responsive glassmorphism panels

## Features

- Large code editor with line numbers
- Language selector and dynamic analysis
- Errors found by category
- Suggested fixed code with copy/export actions
- Error explanations and prevention guidance
- Code health score with progress indicator
- Quick summary metrics
- Advanced pages for:
  - Security Scanner
  - Complexity Analyzer
  - Test Case Generator
  - Code Smell Detector
  - Code Converter
- Downloadable analysis report
- Responsive sidebar navigation

## Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:5173`.

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`.
