from __future__ import annotations

import os
import re
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Debuggy AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Groq client — None if key missing (fallback to regex silently)
# ---------------------------------------------------------------------------

_groq_key = os.environ.get("GROQ_API_KEY", "")
groq_client: Groq | None = Groq(api_key=_groq_key) if _groq_key else None


def ask_groq(prompt: str, system: str = "") -> str | None:
    """Call Groq. Return text or None on any failure."""
    if not groq_client:
        return None
    try:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        response = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages,
            max_tokens=1024,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class CodeRequest(BaseModel):
    code: str
    language: str = "JavaScript"


class ConvertRequest(CodeRequest):
    target_language: str = "Python"


# ---------------------------------------------------------------------------
# Regex-based helpers (always run — fast, free, no latency)
# ---------------------------------------------------------------------------


def security_findings(code: str) -> list[dict[str, str]]:
    patterns = [
        (r"\bSELECT\b.+\+|f[\"'].*SELECT|format\(.*SELECT", "SQL Injection", "High", "Use parameterized queries or prepared statements."),
        (r"\beval\s*\(|new Function\s*\(", "Dangerous Function", "Critical", "Remove dynamic code execution and use explicit parsing."),
        (r"exec\s*\(|system\s*\(|popen\s*\(|child_process", "Command Injection", "Critical", "Validate inputs and avoid shell invocation."),
        (r"password\s*=\s*[\"'][^\"']+|api[_-]?key\s*=\s*[\"'][^\"']+|secret\s*=\s*[\"'][^\"']+", "Hardcoded Credentials", "High", "Move secrets into a vault or environment variables."),
        (r"innerHTML|document\.write|dangerouslySetInnerHTML", "XSS Vulnerability", "High", "Render text safely and sanitize trusted HTML."),
        (r"\bmd5\b|\bsha1\b|DES|RC4", "Weak Encryption", "Medium", "Use modern hashing and encryption primitives."),
        (r"verify\s*=\s*False|rejectUnauthorized\s*:\s*false", "Unsafe API Usage", "High", "Keep TLS verification enabled."),
        (r"auth\s*=\s*False|isAdmin\s*=\s*true|user\s*=\s*[\"']admin", "Authentication Risk", "Medium", "Enforce server-side authorization checks."),
    ]
    return [
        {"title": title, "severity": severity, "recommendation": recommendation}
        for pattern, title, severity, recommendation in patterns
        if re.search(pattern, code, re.IGNORECASE | re.DOTALL)
    ]


def smell_findings(code: str) -> list[dict[str, str]]:
    lines = code.splitlines()
    findings: list[dict[str, str]] = []
    if len(lines) > 45:
        findings.append({"title": "Long Function", "severity": "Medium", "explanation": "Large blocks are harder to test and reason about."})
    if max((len(line) - len(line.lstrip(" ")) for line in lines), default=0) >= 16:
        findings.append({"title": "Deep Nesting", "severity": "High", "explanation": "Nested branches increase cognitive load and bug risk."})
    if re.search(r"\b(var|let|const)\s+(x|y|z|tmp|foo|bar)\b|\b(x|y|z|tmp|foo|bar)\s*=", code):
        findings.append({"title": "Poor Variable Names", "severity": "Low", "explanation": "Names should describe intent, not storage."})
    if re.search(r"TODO|FIXME|console\.log|print\(", code, re.IGNORECASE):
        findings.append({"title": "Debug Artifacts", "severity": "Low", "explanation": "Temporary logging or TODO markers should be resolved before release."})
    if len(set(line.strip() for line in lines if line.strip())) < max(1, len([line for line in lines if line.strip()]) * 0.75):
        findings.append({"title": "Duplicate Code", "severity": "Medium", "explanation": "Repeated lines indicate extractable logic or brittle copy-paste."})
    if re.search(r"return\s+[^;\n]+\n\s+.+", code):
        findings.append({"title": "Dead Code", "severity": "Medium", "explanation": "Statements after return are unreachable."})
    return findings


def complexity_metrics(code: str) -> dict[str, Any]:
    loop_count = len(re.findall(r"\b(for|while|map|forEach)\b", code))
    nested_loop = bool(re.search(r"(for|while)[\s\S]{0,160}(for|while)", code))
    branches = len(re.findall(r"\b(if|else if|switch|case|catch)\b", code))
    score = min(100, loop_count * 18 + branches * 8 + (24 if nested_loop else 0))
    if nested_loop:
        time_c = "O(n^2)"
        rating = "High"
    elif loop_count:
        time_c = "O(n)"
        rating = "Medium"
    else:
        time_c = "O(1)"
        rating = "Low"
    space = "O(n)" if re.search(r"\[\]|{}|new Map|new Set|append|push", code) else "O(1)"
    return {
        "time_complexity": time_c,
        "space_complexity": space,
        "rating": rating,
        "score": score,
        "bottlenecks": [
            "Nested iteration can become expensive on large inputs." if nested_loop else "No severe nested-loop bottleneck detected.",
            "Branch-heavy code may benefit from smaller functions." if branches > 3 else "Control flow is easy to scan.",
        ],
        "suggestions": [
            "Cache repeated calculations.",
            "Prefer early returns to flatten branching.",
            "Use hash maps or sets for repeated lookups.",
        ],
    }


def suggest_fixed_code(code: str) -> str:
    fixed = re.sub(r"\bif\s*\(([^)]*?)\s=\s([^=][^)]*)\)", r"if (\1 === \2)", code)
    fixed = re.sub(r"\beval\s*\((.*?)\);?", "// Removed unsafe eval. Replace with explicit logic.", fixed)
    fixed = re.sub(r"(password|api[_-]?key|secret)\s*=\s*[\"'][^\"']+[\"']", r"\1 = process.env.SECRET_VALUE", fixed, flags=re.IGNORECASE)
    fixed = fixed.replace("innerHTML", "textContent")
    return fixed


# ---------------------------------------------------------------------------
# Core analyze (regex base, unchanged)
# ---------------------------------------------------------------------------


def analyze_code(code: str, language: str) -> dict[str, Any]:
    sec = security_findings(code)
    smells = smell_findings(code)
    complexity = complexity_metrics(code)
    errors: list[dict[str, str]] = []

    if re.search(r"\bif\s*\([^)]*=[^=][^)]*\)", code) or re.search(r"\bif\s+[^:\n]*=[^=]", code):
        errors.append({"type": "Logic error", "detail": "Assignment appears inside a conditional.", "severity": "High"})
    if code.count("(") != code.count(")") or code.count("{") != code.count("}"):
        errors.append({"type": "Syntax error", "detail": "Unbalanced brackets or parentheses detected.", "severity": "High"})
    if re.search(r"\b(undefined|null)\.\w+|None\.\w+", code):
        errors.append({"type": "Runtime error", "detail": "Possible property access on an empty value.", "severity": "Medium"})
    errors.extend({"type": "Security concern", "detail": item["title"], "severity": item["severity"]} for item in sec)
    errors.extend({"type": "Bad coding practice", "detail": item["title"], "severity": item["severity"]} for item in smells[:3])

    risk_penalty = sum({"Critical": 22, "High": 16, "Medium": 10, "Low": 5}.get(item["severity"], 6) for item in errors)
    health_score = max(5, 100 - risk_penalty - int(complexity["score"] / 5))
    category = "Excellent" if health_score >= 90 else "Good" if health_score >= 75 else "Average" if health_score >= 55 else "Poor" if health_score >= 30 else "Critical"

    return {
        "errors": errors or [{"type": "No errors", "detail": "No obvious issues were detected.", "severity": "Info"}],
        "fixed_code": suggest_fixed_code(code),
        "explanations": [
            "The scanner checks syntax balance, risky APIs, common logic slips, and maintainability signals.",
            "Most issues happen when input is trusted too early, control flow becomes too dense, or temporary debug code reaches production.",
            "Prevent regressions with smaller functions, parameterized APIs, typed boundaries, and unit tests around edge cases.",
        ],
        "health_score": health_score,
        "health_category": category,
        "summary": {
            "total_errors": len(errors),
            "security_risks": len(sec),
            "complexity_rating": complexity["rating"],
            "code_quality_rating": category,
        },
        "complexity": complexity,
        "security": sec,
        "smells": smells,
        "language": language,
    }


# ---------------------------------------------------------------------------
# API endpoints
# ---------------------------------------------------------------------------


@app.get("/")
def home() -> dict[str, str]:
    return {
        "message": "Debuggy AI API is running",
        "ai_powered": "yes" if groq_client else "no — set GROQ_API_KEY",
    }


@app.post("/analyze")
def analyze(request: CodeRequest) -> dict[str, Any]:
    result = analyze_code(request.code, request.language)

    ai = ask_groq(
        prompt=(
            f"Analyze this {request.language} code. List bugs, security issues, and improvements. "
            f"Then provide a corrected version. Be concise and specific.\n\n```\n{request.code}\n```"
        ),
        system="You are an expert code reviewer. Give precise, actionable feedback. No fluff.",
    )
    result["ai_insight"] = ai or "AI unavailable — showing regex analysis only."
    result["ai_fixed_code"] = None

    if ai:
        fix = ask_groq(
            prompt=(
                f"Return ONLY the corrected {request.language} code with no explanation, no markdown fences.\n\n```\n{request.code}\n```"
            ),
            system="You are a code fixer. Output only the fixed code, nothing else.",
        )
        if fix:
            result["ai_fixed_code"] = fix

    return result


@app.post("/security")
def security(request: CodeRequest) -> dict[str, Any]:
    findings = security_findings(request.code)
    score = max(0, 100 - len(findings) * 17)
    risk = "Critical" if score < 35 else "High" if score < 55 else "Medium" if score < 75 else "Low"

    ai = ask_groq(
        prompt=(
            f"Perform a security audit of this {request.language} code. "
            f"List every vulnerability with severity (Critical/High/Medium/Low) and how to fix it.\n\n```\n{request.code}\n```"
        ),
        system="You are a security expert. Be specific. List CVE patterns where relevant.",
    )

    secure_fix = None
    if ai:
        secure_fix = ask_groq(
            prompt=(
                f"Return ONLY the security-hardened version of this {request.language} code. No explanation, no markdown.\n\n```\n{request.code}\n```"
            ),
            system="You are a security code fixer. Output only secure fixed code.",
        )

    return {
        "score": score,
        "risk_level": risk,
        "findings": findings,
        "recommendations": [item["recommendation"] for item in findings] or ["No immediate security risks detected."],
        "secure_code": secure_fix or suggest_fixed_code(request.code),
        "ai_security_audit": ai or "AI unavailable — showing pattern scan only.",
    }


@app.post("/complexity")
def complexity(request: CodeRequest) -> dict[str, Any]:
    result = complexity_metrics(request.code)

    ai = ask_groq(
        prompt=(
            f"Analyze the time and space complexity of this {request.language} code. "
            f"Identify bottlenecks and suggest specific optimizations.\n\n```\n{request.code}\n```"
        ),
        system="You are an algorithms expert. Give Big-O analysis with concrete optimization tips.",
    )
    result["ai_complexity_analysis"] = ai or "AI unavailable — showing keyword-based analysis only."
    return result


@app.post("/tests")
def tests(request: CodeRequest) -> dict[str, Any]:
    name = "targetFunction"
    match = re.search(r"function\s+(\w+)|def\s+(\w+)", request.code)
    if match:
        name = next(group for group in match.groups() if group)

    fallback_cases = [
        {"type": "Unit Test", "case": f"Verify {name} returns the expected result for a valid input."},
        {"type": "Edge Case", "case": "Pass empty strings, empty arrays, zero, and null-like values."},
        {"type": "Invalid Input", "case": "Pass malformed objects and unsupported types; assert clear errors."},
        {"type": "Boundary Condition", "case": "Test minimum, maximum, and just-over-limit values."},
        {"type": "Stress Test", "case": "Run the function with a large input set and assert acceptable timing."},
    ]
    fallback_copyable = (
        f"describe('{name}', () => {{\n"
        f"  it('handles valid input', () => {{ /* assert expected output */ }});\n"
        f"  it('handles edge values', () => {{ /* empty, zero, null */ }});\n"
        f"  it('rejects invalid input', () => {{ /* malformed payload */ }});\n"
        f"  it('handles boundaries', () => {{ /* min/max */ }});\n"
        f"  it('survives stress input', () => {{ /* large dataset */ }});\n"
        f"}});"
    )

    ai = ask_groq(
        prompt=(
            f"Generate comprehensive test cases for this {request.language} code. "
            f"Include unit tests, edge cases, invalid inputs, boundary conditions, and stress tests. "
            f"Write actual test code using the appropriate testing framework.\n\n```\n{request.code}\n```"
        ),
        system="You are a QA engineer. Write real, runnable test code. Be thorough.",
    )

    return {
        "cases": fallback_cases,
        "copyable": fallback_copyable,
        "ai_tests": ai or "AI unavailable — showing template tests only.",
    }


@app.post("/smells")
def smells(request: CodeRequest) -> dict[str, Any]:
    findings = smell_findings(request.code)

    ai = ask_groq(
        prompt=(
            f"Identify all code smells and maintainability issues in this {request.language} code. "
            f"For each issue explain what it is, why it's bad, and how to refactor it.\n\n```\n{request.code}\n```"
        ),
        system="You are a clean code expert. Reference Martin Fowler's refactoring patterns where applicable.",
    )

    return {
        "findings": findings or [{"title": "Clean Structure", "severity": "Info", "explanation": "No obvious code smells detected."}],
        "ai_smell_analysis": ai or "AI unavailable — showing heuristic scan only.",
    }


@app.post("/convert")
def convert(request: ConvertRequest) -> dict[str, str]:
    ai_converted = ask_groq(
        prompt=(
            f"Convert this {request.language} code to {request.target_language}. "
            f"Return ONLY the converted code, no explanation, no markdown fences.\n\n```\n{request.code}\n```"
        ),
        system=(
            f"You are an expert {request.language} and {request.target_language} developer. "
            f"Produce idiomatic, production-quality {request.target_language} code."
        ),
    )

    fallback = f"// Converted from {request.language} to {request.target_language} by Debuggy AI\n" + suggest_fixed_code(request.code)

    return {
        "original_code": request.code,
        "converted_code": ai_converted or fallback,
        "note": (
            f"Converted from {request.language} to {request.target_language} using Groq AI."
            if ai_converted
            else "AI unavailable — showing local conversion only. Set GROQ_API_KEY for full conversion."
        ),
    }