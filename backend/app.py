from __future__ import annotations

import re
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="Debuggy AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeRequest(BaseModel):
    code: str
    language: str = "JavaScript"


class ConvertRequest(CodeRequest):
    target_language: str = "Python"


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
        time = "O(n^2)"
        rating = "High"
    elif loop_count:
        time = "O(n)"
        rating = "Medium"
    else:
        time = "O(1)"
        rating = "Low"
    space = "O(n)" if re.search(r"\[\]|{}|new Map|new Set|append|push", code) else "O(1)"
    return {
        "time_complexity": time,
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
    fixed_code = suggest_fixed_code(code)

    return {
        "errors": errors or [{"type": "No errors", "detail": "No obvious issues were detected.", "severity": "Info"}],
        "fixed_code": fixed_code,
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


def suggest_fixed_code(code: str) -> str:
    fixed = re.sub(r"\bif\s*\(([^)]*?)\s=\s([^=][^)]*)\)", r"if (\1 === \2)", code)
    fixed = re.sub(r"\beval\s*\((.*?)\);?", "// Removed unsafe eval. Replace with explicit logic.", fixed)
    fixed = re.sub(r"(password|api[_-]?key|secret)\s*=\s*[\"'][^\"']+[\"']", r"\1 = process.env.SECRET_VALUE", fixed, flags=re.IGNORECASE)
    fixed = fixed.replace("innerHTML", "textContent")
    return fixed


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "Debuggy AI API is running"}


@app.post("/analyze")
def analyze(request: CodeRequest) -> dict[str, Any]:
    return analyze_code(request.code, request.language)


@app.post("/security")
def security(request: CodeRequest) -> dict[str, Any]:
    findings = security_findings(request.code)
    score = max(0, 100 - len(findings) * 17)
    risk = "Critical" if score < 35 else "High" if score < 55 else "Medium" if score < 75 else "Low"
    return {
        "score": score,
        "risk_level": risk,
        "findings": findings,
        "recommendations": [item["recommendation"] for item in findings] or ["No immediate security risks detected."],
        "secure_code": suggest_fixed_code(request.code),
    }


@app.post("/complexity")
def complexity(request: CodeRequest) -> dict[str, Any]:
    return complexity_metrics(request.code)


@app.post("/tests")
def tests(request: CodeRequest) -> dict[str, Any]:
    name = "targetFunction"
    match = re.search(r"function\s+(\w+)|def\s+(\w+)", request.code)
    if match:
        name = next(group for group in match.groups() if group)
    return {
        "cases": [
            {"type": "Unit Test", "case": f"Verify {name} returns the expected result for a valid input."},
            {"type": "Edge Case", "case": "Pass empty strings, empty arrays, zero, and null-like values."},
            {"type": "Invalid Input", "case": "Pass malformed objects and unsupported types; assert clear errors."},
            {"type": "Boundary Condition", "case": "Test minimum, maximum, and just-over-limit values."},
            {"type": "Stress Test", "case": "Run the function with a large input set and assert acceptable timing."},
        ],
        "copyable": f"describe('{name}', () => {{\n  it('handles valid input', () => {{ /* assert expected output */ }});\n  it('handles edge values', () => {{ /* empty, zero, null */ }});\n  it('rejects invalid input', () => {{ /* malformed payload */ }});\n  it('handles boundaries', () => {{ /* min/max */ }});\n  it('survives stress input', () => {{ /* large dataset */ }});\n}});",
    }


@app.post("/smells")
def smells(request: CodeRequest) -> dict[str, Any]:
    findings = smell_findings(request.code)
    return {"findings": findings or [{"title": "Clean Structure", "severity": "Info", "explanation": "No obvious code smells detected."}]}


@app.post("/convert")
def convert(request: ConvertRequest) -> dict[str, str]:
    header = f"// Converted from {request.language} to {request.target_language} by Debuggy AI\n"
    return {
        "original_code": request.code,
        "converted_code": header + suggest_fixed_code(request.code),
        "note": "This local converter preserves intent and highlights cleanup opportunities. Connect an LLM provider for production-grade translation.",
    }
