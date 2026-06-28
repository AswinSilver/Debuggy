from __future__ import annotations

import json
import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Debuggy AI", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Groq client
# ─────────────────────────────────────────────────────────────────────────────

_key = os.environ.get("GROQ_API_KEY", "")
client: Groq | None = Groq(api_key=_key) if _key else None

MODEL = "llama-3.3-70b-versatile"


def ai(prompt: str, system: str, max_tokens: int = 3000) -> dict[str, Any] | None:
    """Call Groq in JSON mode. Returns parsed dict or None on failure."""
    if not client:
        return None
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.15,
            response_format={"type": "json_object"},
        )
        return json.loads(resp.choices[0].message.content)
    except Exception as exc:
        print(f"[GROQ ERROR] {exc}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic models
# ─────────────────────────────────────────────────────────────────────────────


class CodeRequest(BaseModel):
    code: str
    language: str = "JavaScript"


class ConvertRequest(CodeRequest):
    target_language: str = "Python"


class AlgorithmRequest(BaseModel):
    code: str
    language: str = "JavaScript"
    mode: str = "algorithm"          # "algorithm" | "pseudocode"
    direction: str = "code_to_algo"  # "code_to_algo" | "algo_to_code"


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────


@app.get("/")
def root() -> dict:
    return {"status": "ok", "ai": bool(client)}


# ── /analyze ─────────────────────────────────────────────────────────────────
@app.post("/analyze")
def analyze(req: CodeRequest) -> dict[str, Any]:
    result = ai(
        prompt=f"Analyze this {req.language} code:\n\n```\n{req.code}\n```",
        system="""You are an elite code reviewer. Analyze the code thoroughly and respond with ONLY this JSON:
{
  "health_score": <0-100 integer>,
  "health_category": "<Excellent|Good|Average|Poor|Critical>",
  "errors": [
    {"type": "<Logic error|Syntax error|Runtime error|Security concern|Bad practice>", "detail": "<specific explanation>", "severity": "<Critical|High|Medium|Low>", "line": "<line number or range if known, else null>"}
  ],
  "fixed_code": "<complete corrected source code, no markdown fences>",
  "explanations": ["<key insight 1>", "<key insight 2>", "<key insight 3>"],
  "summary": {
    "total_errors": <int>,
    "security_risks": <int>,
    "complexity_rating": "<Low|Medium|High>",
    "code_quality_rating": "<Excellent|Good|Average|Poor|Critical>"
  }
}
Be precise, thorough, and return real corrected code.""",
    )

    if result:
        result["language"] = req.language
        return result

    # Offline fallback
    return {
        "health_score": 40,
        "health_category": "Poor",
        "errors": [
            {"type": "Security concern", "detail": "Could not connect to AI — configure GROQ_API_KEY.", "severity": "High", "line": None}
        ],
        "fixed_code": req.code,
        "explanations": ["AI engine offline. Set GROQ_API_KEY in your environment."],
        "summary": {"total_errors": 1, "security_risks": 0, "complexity_rating": "Unknown", "code_quality_rating": "Unknown"},
        "language": req.language,
    }


# ── /security ─────────────────────────────────────────────────────────────────
@app.post("/security")
def security(req: CodeRequest) -> dict[str, Any]:
    result = ai(
        prompt=f"Security audit this {req.language} code:\n\n```\n{req.code}\n```",
        system="""You are an application security expert (OWASP Top 10, CVE patterns). Respond with ONLY this JSON:
{
  "score": <0-100 integer>,
  "risk_level": "<Critical|High|Medium|Low>",
  "findings": [
    {"title": "<vulnerability name>", "severity": "<Critical|High|Medium|Low>", "description": "<what it is and why it's dangerous>", "recommendation": "<exact fix>"}
  ],
  "secure_code": "<complete security-hardened code, no markdown fences>",
  "audit_summary": "<detailed narrative of all security issues and defense-in-depth recommendations>"
}""",
    )

    if result:
        return result

    return {
        "score": 50,
        "risk_level": "Unknown",
        "findings": [],
        "secure_code": req.code,
        "audit_summary": "AI offline — set GROQ_API_KEY.",
    }


# ── /complexity ───────────────────────────────────────────────────────────────
@app.post("/complexity")
def complexity(req: CodeRequest) -> dict[str, Any]:
    result = ai(
        prompt=f"Analyze algorithmic complexity of this {req.language} code:\n\n```\n{req.code}\n```",
        system="""You are an algorithms expert. Respond with ONLY this JSON:
{
  "time_complexity": "<Big-O notation>",
  "space_complexity": "<Big-O notation>",
  "rating": "<Low|Medium|High>",
  "score": <0-100 efficiency score>,
  "bottlenecks": ["<bottleneck description>"],
  "suggestions": ["<concrete optimization>"],
  "analysis": "<detailed narrative covering worst/avg/best case, hotspots, and data structure choices>"
}""",
    )

    if result:
        return result

    return {
        "time_complexity": "Unknown",
        "space_complexity": "Unknown",
        "rating": "Unknown",
        "score": 50,
        "bottlenecks": [],
        "suggestions": [],
        "analysis": "AI offline — set GROQ_API_KEY.",
    }


# ── /tests ────────────────────────────────────────────────────────────────────
@app.post("/tests")
def tests(req: CodeRequest) -> dict[str, Any]:
    result = ai(
        prompt=f"Generate comprehensive tests for this {req.language} code:\n\n```\n{req.code}\n```",
        system="""You are a senior QA engineer. Write real, runnable tests. Respond with ONLY this JSON:
{
  "cases": [
    {"type": "<Unit Test|Edge Case|Invalid Input|Boundary Condition|Stress Test>", "description": "<what this test validates>", "assertion": "<expected behavior>"}
  ],
  "test_code": "<complete runnable test file using the appropriate framework, no markdown fences>",
  "strategy": "<overall test coverage strategy, mocking approach, and framework configuration notes>"
}""",
    )

    if result:
        return result

    return {
        "cases": [],
        "test_code": "// AI offline — set GROQ_API_KEY.",
        "strategy": "AI offline — set GROQ_API_KEY.",
    }


# ── /smells ───────────────────────────────────────────────────────────────────
@app.post("/smells")
def smells(req: CodeRequest) -> dict[str, Any]:
    result = ai(
        prompt=f"Find code smells and maintainability issues in this {req.language} code:\n\n```\n{req.code}\n```",
        system="""You are a clean code and refactoring expert (Martin Fowler patterns). Respond with ONLY this JSON:
{
  "findings": [
    {"title": "<smell name>", "severity": "<High|Medium|Low>", "explanation": "<why it's bad>", "refactor": "<how to fix it>"}
  ],
  "refactored_code": "<cleanly refactored version of the code, no markdown fences>",
  "review": "<detailed narrative on design patterns, SOLID violations, and refactoring roadmap>"
}""",
    )

    if result:
        return result

    return {
        "findings": [],
        "refactored_code": req.code,
        "review": "AI offline — set GROQ_API_KEY.",
    }


# ── /convert ──────────────────────────────────────────────────────────────────
@app.post("/convert")
def convert(req: ConvertRequest) -> dict[str, Any]:
    result = ai(
        prompt=f"Convert this {req.language} code to idiomatic {req.target_language}:\n\n```\n{req.code}\n```",
        system=f"""You are a polyglot expert in {req.language} and {req.target_language}. Respond with ONLY this JSON:
{{
  "converted_code": "<complete idiomatic {req.target_language} code, no markdown fences>",
  "notes": "<explanation of key syntax translations, idiom changes, library mappings, and any important behavioral differences>"
}}""",
    )

    if result:
        return result

    return {
        "converted_code": f"# AI offline — set GROQ_API_KEY.\n{req.code}",
        "notes": "AI offline — set GROQ_API_KEY.",
    }


# ── /algorithm ────────────────────────────────────────────────────────────────
@app.post("/algorithm")
def algorithm(req: AlgorithmRequest) -> dict[str, Any]:
    if req.direction == "code_to_algo":
        if req.mode == "pseudocode":
            system = """You are an expert computer science educator. Given source code, produce clean, readable PSEUDOCODE that captures the logic without any syntax-specific details.
Format the pseudocode with clear indentation and use high-level constructs like:
  SET, READ, IF/ELSE, REPEAT WHILE, FOR EACH, RETURN, CALL, etc.
Respond with ONLY this JSON:
{
  "output": "<the pseudocode as a plain multiline string — no markdown fences>",
  "explanation": "<brief explanation of the algorithm's purpose and key steps>"
}"""
            prompt = f"Convert this {req.language} code to pseudocode:\n\n```\n{req.code}\n```"
        else:
            system = """You are an expert computer science educator. Given source code, produce a step-by-step ALGORITHM description in plain English.

STRICT FORMAT RULES — follow exactly:
1. Start with "Start"
2. Number each top-level step on its own line.
3. Use "Read", "Set", "Repeat while", "If", "Display", "Return", "Call", "Increment", "Decrement" etc. as action verbs.
4. Use indentation (4 spaces) for nested steps (loop body, if body).
5. End with "Stop."
6. Do NOT use any bullet points, dashes, or markdown — plain numbered lines only.
7. Write in full, natural English sentences for each step.

Example style:
Start
Read the number of elements n.
Read the n elements into the array.
Set i = 0.
Repeat while i < n - 1:
    Set j = 0.
    Repeat while j < n - i - 1:
        Compare the element at position j with the element at position j + 1.
        If the element at position j is greater than the element at position j + 1, swap the two elements.
        Increment j by 1.
    Increment i by 1.
Display the sorted array.
Stop.

Respond with ONLY this JSON:
{
  "output": "<the algorithm as a plain multiline string — no markdown fences>",
  "explanation": "<brief explanation of the algorithm's purpose and key steps>"
}"""
            prompt = f"Convert this {req.language} code to a step-by-step algorithm:\n\n```\n{req.code}\n```"
    else:
        # algo_to_code
        system = f"""You are an expert programmer. Given a step-by-step algorithm or pseudocode, produce clean, idiomatic {req.language} code that implements it exactly.
Respond with ONLY this JSON:
{{
  "output": "<the complete {req.language} code, no markdown fences>",
  "explanation": "<brief explanation of what was implemented and any assumptions made>"
}}"""
        prompt = f"Implement the following algorithm/pseudocode in {req.language}:\n\n{req.code}"

    result = ai(prompt=prompt, system=system, max_tokens=2000)

    if result:
        return result

    return {
        "output": "# AI offline — set GROQ_API_KEY.",
        "explanation": "AI offline — set GROQ_API_KEY.",
    }
