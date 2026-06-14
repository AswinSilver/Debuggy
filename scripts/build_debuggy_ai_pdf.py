from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs"
PDF_PATH = OUT_DIR / "Debuggy_AI_Project_Report.pdf"

RED = colors.HexColor("#B40C1C")
BLACK = colors.HexColor("#111216")
BLUE = colors.HexColor("#2E74B5")
DARK_BLUE = colors.HexColor("#1F4D78")
MUTED = colors.HexColor("#5B6270")
LIGHT = colors.HexColor("#F2F4F7")
GRID = colors.HexColor("#DADDE4")


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D9DDE5"))
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, letter[1] - 0.62 * inch, letter[0] - doc.rightMargin, letter[1] - 0.62 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 0.55 * inch, "Debuggy AI Project Report")
    canvas.drawRightString(letter[0] - doc.rightMargin, 0.55 * inch, f"Page {doc.page}")
    canvas.restoreState()


def p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text.replace("&", "&amp;"), style)


def bullets(items: list[str], style: ParagraphStyle) -> ListFlowable:
    return ListFlowable(
        [ListItem(p(item, style), leftIndent=12) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=18,
        bulletFontName="Helvetica",
        bulletFontSize=7,
    )


def numbers(items: list[str], style: ParagraphStyle) -> ListFlowable:
    return ListFlowable(
        [ListItem(p(item, style), leftIndent=12) for item in items],
        bulletType="1",
        leftIndent=18,
        bulletFontName="Helvetica",
        bulletFontSize=9,
    )


def make_table(headers: list[str], rows: list[list[str]], widths: list[float], styles) -> Table:
    data = [[p(header, styles["TableHeader"]) for header in headers]]
    for row in rows:
        data.append([p(value, styles["TableCell"]) for value in row])
    table = Table(data, colWidths=[width * inch for width in widths], repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
                ("TEXTCOLOR", (0, 0), (-1, 0), BLACK),
                ("GRID", (0, 0), (-1, -1), 0.5, GRID),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def build_styles():
    sample = getSampleStyleSheet()
    return {
        "Title": ParagraphStyle(
            "Title",
            parent=sample["Title"],
            fontName="Helvetica-Bold",
            fontSize=30,
            leading=34,
            textColor=RED,
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "Subtitle": ParagraphStyle(
            "Subtitle",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=12,
            leading=17,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=22,
        ),
        "H1": ParagraphStyle(
            "H1",
            parent=sample["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=BLUE,
            spaceBefore=14,
            spaceAfter=8,
        ),
        "H2": ParagraphStyle(
            "H2",
            parent=sample["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=BLUE,
            spaceBefore=10,
            spaceAfter=6,
        ),
        "Body": ParagraphStyle(
            "Body",
            parent=sample["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            textColor=BLACK,
            spaceAfter=7,
        ),
        "Small": ParagraphStyle(
            "Small",
            parent=sample["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=MUTED,
            spaceAfter=4,
        ),
        "Code": ParagraphStyle(
            "Code",
            parent=sample["Code"],
            fontName="Courier",
            fontSize=9,
            leading=12,
            textColor=BLACK,
            backColor=colors.HexColor("#F6F7FA"),
            borderColor=colors.HexColor("#E1E4EA"),
            borderWidth=0.5,
            borderPadding=6,
            spaceAfter=8,
        ),
        "TableHeader": ParagraphStyle(
            "TableHeader",
            parent=sample["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.8,
            leading=11,
            textColor=BLACK,
        ),
        "TableCell": ParagraphStyle(
            "TableCell",
            parent=sample["BodyText"],
            fontName="Helvetica",
            fontSize=8.6,
            leading=11,
            textColor=BLACK,
        ),
    }


def build() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        rightMargin=1 * inch,
        leftMargin=1 * inch,
        topMargin=0.82 * inch,
        bottomMargin=0.82 * inch,
        title="Debuggy AI Project Report",
    )

    story = []
    story.append(Spacer(1, 0.4 * inch))
    story.append(p("Debuggy AI", styles["Title"]))
    story.append(p("Complete Project Report, Launch Guide, Features, and Working", styles["Subtitle"]))
    story.append(
        make_table(
            ["Item", "Details"],
            [
                ["Project type", "AI-powered software engineering assistant and code quality dashboard"],
                ["Frontend", "React, Vite, Tailwind CSS, lucide-react"],
                ["Backend", "FastAPI, Pydantic, Uvicorn"],
                ["Design", "Professional dark developer dashboard with red and black color system"],
                ["Repository status", "Ready to run locally after dependencies are installed"],
            ],
            [1.45, 5.05],
            styles,
        )
    )

    story.append(p("1. Project Overview", styles["H1"]))
    story.append(
        p(
            "Debuggy AI is a modern developer dashboard that helps engineers review code, understand bugs, detect risky patterns, improve maintainability, estimate complexity, generate tests, and convert code between languages.",
            styles["Body"],
        )
    )
    story.append(
        p(
            "The app has been converted from a static HTML/JavaScript page into a React frontend with a FastAPI backend. It is not just a simple debugging website; it is structured as a software quality platform with separate analysis tools.",
            styles["Body"],
        )
    )

    story.append(p("2. Is It Really React and FastAPI?", styles["H1"]))
    story.append(
        make_table(
            ["Layer", "Evidence in Repository", "Purpose"],
            [
                ["React frontend", "frontend/src/main.jsx", "React component tree, dashboard state, tool pages, API calls, and dynamic rendering."],
                ["Tailwind CSS", "frontend/src/styles.css and frontend/tailwind.config.js", "Red/black dashboard styling, glass panels, responsive layout, and animations."],
                ["Vite", "frontend/package.json and frontend/vite.config.js", "Frontend dev server, production build, and development API proxy."],
                ["FastAPI backend", "backend/app.py", "API app, CORS middleware, Pydantic models, and analysis endpoints."],
                ["Backend dependencies", "backend/requirements.txt", "fastapi, uvicorn, pydantic, and python-dotenv."],
            ],
            [1.2, 2.3, 3.0],
            styles,
        )
    )

    story.append(p("3. How To Launch It Locally", styles["H1"]))
    story.append(p("After cloning from GitHub, run backend and frontend in two separate terminals.", styles["Body"]))
    story.append(p("Backend terminal", styles["H2"]))
    story.append(p("cd backend\npip install -r requirements.txt\nuvicorn app:app --reload --host 127.0.0.1 --port 8000", styles["Code"]))
    story.append(p("Frontend terminal", styles["H2"]))
    story.append(p("cd frontend\nnpm install\nnpm run dev", styles["Code"]))
    story.append(p("Then open http://127.0.0.1:5173 in your browser.", styles["Body"]))

    story.append(p("4. GitHub and Deployment Notes", styles["H1"]))
    story.append(
        bullets(
            [
                "GitHub stores your project source code. It does not automatically run the React frontend or FastAPI backend.",
                "For local use, clone the repository and run the two-terminal launch process above.",
                "For public hosting, deploy the backend to Render, Railway, Fly.io, or a VPS.",
                "Deploy the frontend to Vercel, Netlify, or another Vite-compatible static host.",
                "In production, route frontend /api requests to the FastAPI backend, or configure the frontend to call the backend URL directly.",
            ],
            styles["Body"],
        )
    )

    story.append(PageBreak())
    story.append(p("5. Application Architecture", styles["H1"]))
    story.append(
        numbers(
            [
                "The user opens the React dashboard in the browser.",
                "The user writes or pastes code into the editor and selects a language.",
                "React sends JSON requests to the FastAPI API using /api routes in development.",
                "FastAPI analyzes the code and returns structured JSON.",
                "React renders errors, fixed code, explanations, scores, and tool results dynamically.",
            ],
            styles["Body"],
        )
    )

    story.append(p("6. Main Dashboard Features", styles["H1"]))
    story.append(
        bullets(
            [
                "Large code editor with line numbers and monospace formatting.",
                "Language selector for Python, Java, JavaScript, C, C++, C#, and Go.",
                "Analyze Code button with loading state.",
                "Errors Found section covering syntax errors, logic errors, runtime risks, bad practices, and security concerns.",
                "Suggested Fix section with corrected code and one-click copy.",
                "Error Explanation section explaining cause, reason, and prevention.",
                "Code Health Score from 0 to 100 with category and visual progress bar.",
                "Quick Summary showing total errors, security risks, complexity rating, and code quality rating.",
                "Download Analysis Report and Export Fixed Code actions.",
            ],
            styles["Body"],
        )
    )

    story.append(p("7. Advanced Analysis Tools", styles["H1"]))
    story.append(
        make_table(
            ["Tool", "What It Analyzes", "What It Displays"],
            [
                ["Security Scanner", "SQL injection, command injection, hardcoded credentials, XSS, unsafe APIs, weak encryption, dangerous functions, authentication risks.", "Overall security score, risk level, findings, recommendations, and secure code."],
                ["Complexity Analyzer", "Loops, nested loops, branches, runtime growth, memory growth, and performance bottlenecks.", "Time complexity, space complexity, rating, bottlenecks, and optimization suggestions."],
                ["Test Case Generator", "Function intent and likely input classes.", "Unit tests, edge cases, invalid inputs, boundary conditions, stress tests, and copyable test block."],
                ["Code Smell Detector", "Duplicate code, long functions, deep nesting, poor names, dead code, debug artifacts, and maintainability issues.", "Severity, explanation, and improvement direction."],
                ["Code Converter", "Original code and selected source/target languages.", "Original code, converted code area, and copy button."],
            ],
            [1.35, 2.85, 2.3],
            styles,
        )
    )

    story.append(PageBreak())
    story.append(p("8. Backend API Endpoints", styles["H1"]))
    story.append(
        make_table(
            ["Endpoint", "Method", "Purpose"],
            [
                ["/", "GET", "Health check confirming the API is running."],
                ["/analyze", "POST", "Full dashboard analysis with errors, fixed code, explanations, score, summary, security, smells, and complexity."],
                ["/security", "POST", "Dedicated security analysis."],
                ["/complexity", "POST", "Dedicated complexity and performance analysis."],
                ["/tests", "POST", "Generated test case recommendations."],
                ["/smells", "POST", "Dedicated code smell and maintainability analysis."],
                ["/convert", "POST", "Code conversion response with original and converted code."],
            ],
            [1.25, 0.85, 4.4],
            styles,
        )
    )

    story.append(p("9. How The Analysis Works", styles["H1"]))
    story.append(
        p(
            "The backend currently uses deterministic local analysis heuristics. It scans code for patterns such as unsafe dynamic execution, query concatenation, weak crypto names, hardcoded secrets, nested loops, assignment inside conditionals, bracket imbalance, and maintainability smells.",
            styles["Body"],
        )
    )
    story.append(
        p(
            "This keeps the app usable without requiring a paid AI key. Later, a real LLM provider can be connected behind the same FastAPI endpoints for deeper reasoning, better code conversion, and richer explanations.",
            styles["Body"],
        )
    )

    story.append(p("10. User Experience and Design", styles["H1"]))
    story.append(
        bullets(
            [
                "Dark developer dashboard layout with red highlights and black surfaces.",
                "Glassmorphism cards, soft borders, glowing primary actions, and animated result cards.",
                "Responsive sidebar navigation for desktop and mobile.",
                "Professional engineering-tool feel instead of a simple debugging form.",
                "Copy buttons, report download, export fixed code, and interactive advanced pages.",
            ],
            styles["Body"],
        )
    )

    story.append(p("11. Recommended Future Improvements", styles["H1"]))
    story.append(
        bullets(
            [
                "Add authentication and per-user analysis history.",
                "Connect an LLM provider for more accurate explanations and code conversion.",
                "Add file upload and GitHub repository scanning.",
                "Add real syntax highlighting with Monaco Editor or CodeMirror.",
                "Add project-level reports and PDF export directly from the browser.",
                "Add CI checks and automated backend/frontend test suites.",
            ],
            styles["Body"],
        )
    )

    story.append(p("12. Quick Troubleshooting", styles["H1"]))
    story.append(
        make_table(
            ["Problem", "Likely Cause", "Fix"],
            [
                ["Frontend opens but analysis fails", "FastAPI backend is not running.", "Start backend on port 8000."],
                ["npm command fails", "Dependencies were not installed.", "Run npm install inside frontend."],
                ["uvicorn command not found", "Python dependencies missing or venv not active.", "Run pip install -r requirements.txt."],
                ["GitHub page does not run backend", "GitHub stores code but does not host FastAPI automatically.", "Deploy backend separately and route /api to it."],
            ],
            [1.8, 2.2, 2.5],
            styles,
        )
    )

    story.append(Spacer(1, 16))
    story.append(
        p(
            "Debuggy AI: React + Tailwind frontend, FastAPI backend, professional AI-powered code review and software quality dashboard.",
            ParagraphStyle("FooterNote", parent=styles["Small"], alignment=TA_CENTER),
        )
    )

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(PDF_PATH)


if __name__ == "__main__":
    build()
