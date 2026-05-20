import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// ── Blog Posts Data ───────────────────────────────────────────
export const BLOG_POSTS = [
  {
    slug: "ats-resume-2026",
    title: "How to Write an ATS-Friendly Resume in 2026",
    date: "May 19, 2026",
    readTime: "9 min read",
    category: "Resume Tips",
    categoryColor: "#00ffe0",
    excerpt: "90% of large companies use Applicant Tracking Systems to filter resumes before a human ever sees them. Here's exactly how to beat the algorithm and get your resume in front of real people.",
    coverEmoji: "📄",
    tags: ["Resume", "ATS", "Job Search", "Career"],
    content: [
      {
        type: "intro",
        text: "You spent hours crafting the perfect resume. You applied to 50 jobs. You heard back from almost none of them. Sound familiar? The culprit is likely an Applicant Tracking System — and most candidates have no idea how they work or how to write for them."
      },
      {
        type: "h2",
        text: "What is an ATS and Why Does It Matter?"
      },
      {
        type: "p",
        text: "An Applicant Tracking System (ATS) is software that companies use to collect, sort, and filter job applications automatically. Think of it as a gatekeeper robot that reads your resume before any human does. Companies like TCS, Infosys, Wipro, Google, Amazon, and virtually every MNC uses one."
      },
      {
        type: "p",
        text: "The ATS parses your resume, extracts information, and scores it against the job description. If your score is too low, your application gets filtered out — no matter how qualified you are. Studies suggest that up to 75% of resumes are rejected by ATS before a recruiter ever sees them."
      },
      {
        type: "callout",
        icon: "💡",
        text: "Key insight: You're not just writing for a human reader. You're writing for a machine first. Your resume needs to pass the ATS filter before it can impress a hiring manager."
      },
      {
        type: "h2",
        text: "ATS Formatting Rules — What the Machine Can Read"
      },
      {
        type: "p",
        text: "Most ATS systems struggle with complex formatting. Here's what to do and what to avoid:"
      },
      {
        type: "do-dont",
        items: [
          { do: "Use standard fonts: Arial, Calibri, Times New Roman, Georgia", dont: "Use decorative or custom fonts" },
          { do: "Use standard section headings: Experience, Education, Skills", dont: "Use creative headings like 'My Journey' or 'What I've Built'" },
          { do: "Save as .docx or simple PDF", dont: "Use image-based PDFs or heavily designed templates" },
          { do: "Use bullet points with standard symbols (•, -, *)", dont: "Use tables, text boxes, columns, or graphics for content" },
          { do: "Include dates in clear format: Jan 2024 – Present", dont: "Use timeline graphics or visual date representations" },
          { do: "Put contact info in the main body", dont: "Put contact info in headers or footers (ATS often ignores them)" },
        ]
      },
      {
        type: "h2",
        text: "Keywords — The Most Important ATS Factor"
      },
      {
        type: "p",
        text: "ATS systems compare your resume against the job description using keyword matching. If the job description says 'Python' and your resume says 'programming in Python', the match might not register correctly. Exact keyword matching is crucial."
      },
      {
        type: "steps",
        items: [
          {
            num: "1",
            title: "Copy the job description",
            text: "Paste the full JD into a text document. This is your keyword source."
          },
          {
            num: "2",
            title: "Identify hard skills mentioned",
            text: "Look for specific technologies, tools, certifications, and methodologies. Examples: 'React.js', 'data analysis', 'Agile', 'SQL', 'project management'."
          },
          {
            num: "3",
            title: "Mirror the exact language",
            text: "If the JD says 'machine learning' don't write 'ML'. If it says 'customer success', don't write 'client happiness'. Use their exact terms."
          },
          {
            num: "4",
            title: "Place keywords naturally",
            text: "Work keywords into your bullet points and skills section naturally. Don't keyword-stuff — ATS systems in 2026 are smarter than that."
          },
          {
            num: "5",
            title: "Include both acronyms and full forms",
            text: "Write 'Search Engine Optimization (SEO)' once. Some ATS search for acronyms, others for full names — cover both."
          }
        ]
      },
      {
        type: "h2",
        text: "Every Section Your ATS Resume Needs"
      },
      {
        type: "sections-list",
        items: [
          {
            title: "Contact Information",
            desc: "Full name, phone, professional email, city/state, LinkedIn URL. No photo, no date of birth (illegal to ask in many countries anyway)."
          },
          {
            title: "Professional Summary (2–3 lines)",
            desc: "A targeted summary that includes your job title, years of experience, and 2-3 key skills from the job description. Rewrite this for every application."
          },
          {
            title: "Work Experience",
            desc: "Reverse chronological order. Company name, your title, dates, location. Each role needs 3-5 bullet points using strong action verbs and measurable results."
          },
          {
            title: "Skills",
            desc: "A dedicated skills section is critical. ATS often specifically looks here. Separate technical skills, tools, and soft skills. Match terminology from the JD."
          },
          {
            title: "Education",
            desc: "Degree, institution, graduation year. Include CGPA if 7.5+. Include relevant coursework if you're a fresher."
          },
          {
            title: "Certifications (if relevant)",
            desc: "AWS, Google, Microsoft, Coursera, NPTEL — list them with the issuing body and year. These are high-value keywords."
          }
        ]
      },
      {
        type: "h2",
        text: "Writing Bullet Points That Beat ATS and Impress Humans"
      },
      {
        type: "p",
        text: "Your bullet points do double duty — they need to contain the right keywords for the ATS, and the right impact for the human reviewer. Use the CAR format: Context, Action, Result."
      },
      {
        type: "example-box",
        bad: "Worked on the backend team and helped with API development.",
        good: "Developed 12 REST APIs using Node.js and Express, reducing average response time by 40% and supporting 10,000+ daily active users."
      },
      {
        type: "example-box",
        bad: "Responsible for data analysis tasks.",
        good: "Analyzed 2M+ customer records using Python (pandas, NumPy) to identify churn patterns, enabling targeted retention campaigns that reduced churn by 18%."
      },
      {
        type: "h2",
        text: "Mistakes That Get You Filtered Out Immediately"
      },
      {
        type: "mistakes",
        items: [
          { title: "Using a designer template with columns", text: "Canva, Zety, and similar templates look beautiful but ATS systems parse them linearly — your columns get jumbled into nonsense." },
          { title: "Putting key info in images or graphics", text: "Skill bars, infographics, logos — ATS can't read images. If your skill level is shown as a visual bar, it doesn't exist to the ATS." },
          { title: "Using headers/footers for contact info", text: "Many ATS systems completely ignore headers and footers. Put your name and contact details in the main body of the document." },
          { title: "Inconsistent date formats", text: "Mixing 'Jan 2024', '01/2024', and 'January 2024' confuses ATS parsers. Pick one format and stick to it throughout." },
          { title: "Generic objective statements", text: "'Seeking a challenging role to utilize my skills' wastes your summary section. Replace with a targeted professional summary matching the role." },
          { title: "Spelling errors in skill names", text: "Writing 'JavaScrip' or 'Pyhon' means the ATS keyword match fails. Double-check all technical terms." },
        ]
      },
      {
        type: "h2",
        text: "Your ATS Resume Checklist"
      },
      {
        type: "checklist",
        items: [
          "Contact info in the main body (not header/footer)",
          "Standard font (Arial, Calibri, or Times New Roman)",
          "No tables, columns, or text boxes",
          "Standard section headings (Experience, Education, Skills)",
          "Keywords from the job description included naturally",
          "Both acronyms and full forms used where relevant",
          "Action verbs starting each bullet point",
          "Quantified results in at least 50% of bullets",
          "Consistent date format throughout",
          "Saved as .docx (preferred) or simple PDF",
          "No photos, graphics, or skill bars",
          "Professional email address",
          "LinkedIn URL included",
          "Proofread for spelling (especially technical terms)",
          "Tailored summary matching the specific role",
        ]
      },
      {
        type: "h2",
        text: "How to Check Your ATS Score Before Applying"
      },
      {
        type: "p",
        text: "Before submitting any application, run your resume through an ATS checker. Our free Resume Analyzer at ZeroAPI gives you an ATS score estimate, identifies weaknesses, and suggests specific improvements — no signup required."
      },
      {
        type: "cta",
        text: "Check Your ATS Score Free →",
        href: "/#tools",
        note: "No signup. No data stored. Instant results."
      },
      {
        type: "h2",
        text: "The Bottom Line"
      },
      {
        type: "p",
        text: "Writing an ATS-friendly resume is not about gaming the system — it's about communicating clearly so both machines and humans can understand your value. Keep your format clean, use the employer's exact language, quantify your impact, and tailor each application. The candidates who get interviews aren't always the most qualified. They're the ones whose resumes are easiest for both ATS and humans to read."
      },
      {
        type: "p",
        text: "Start with the job description. End with a tailored, keyword-rich, cleanly formatted resume. Use our free tools to analyze and build yours — then go get that interview."
      }
    ]
  },
  {
    slug: "python-312-313-314-differences",
    title: "Python 3.12 vs 3.13 vs 3.14: What Actually Changed and Why It Matters",
    date: "May 20, 2026",
    readTime: "11 min read",
    category: "Python",
    categoryColor: "#a78bfa",
    excerpt: "Three major Python releases in quick succession brought significant changes — better error messages, a free-threaded mode, experimental JIT compilation, and major typing improvements. Here's a practical breakdown with real code examples.",
    coverEmoji: "🐍",
    tags: ["Python", "Programming", "Developer", "Performance"],
    content: [
      {
        type: "intro",
        text: "Python has been evolving faster than ever. With 3.12, 3.13, and 3.14 arriving in close succession, it can be hard to track what actually changed and whether it matters for your day-to-day code. This guide cuts through the release notes and shows you the real differences with working examples."
      },
      {
        type: "h2",
        text: "Version Timeline"
      },
      {
        type: "versions-table",
        rows: [
          { version: "Python 3.12", released: "October 2023", status: "Security fixes only", highlight: "Better error messages, @override, f-string improvements" },
          { version: "Python 3.13", released: "October 2024", status: "Active (LTS candidate)", highlight: "Free-threaded mode (no GIL!), new REPL, JIT preview" },
          { version: "Python 3.14", released: "October 2025", status: "Current stable", highlight: "Improved JIT, deferred annotations, template strings (t-strings)" },
        ]
      },
      {
        type: "h2",
        text: "1. Error Messages — 3.12 Made Them Actually Useful"
      },
      {
        type: "p",
        text: "Python 3.12 dramatically improved error messages. Instead of cryptic tracebacks, you now get specific, actionable hints."
      },
      {
        type: "code-compare",
        label: "NameError — what changed",
        before: { version: "Python 3.11 and earlier", code: `# Typo in variable name
my_variable = 42
print(my_varable)

# NameError: name 'my_varable' is not defined` },
        after: { version: "Python 3.12+", code: `# Typo in variable name
my_variable = 42
print(my_varable)

# NameError: name 'my_varable' is not defined.
# Did you mean: 'my_variable'?  ← Python now suggests the fix!` }
      },
      {
        type: "code-compare",
        label: "Import errors are now smarter",
        before: { version: "Before 3.12", code: `from collections import OrderedDict, MutableMapping

# ImportError: cannot import name 'MutableMapping' from 'collections'` },
        after: { version: "Python 3.12+", code: `from collections import OrderedDict, MutableMapping

# ImportError: cannot import name 'MutableMapping' from 'collections'.
# Did you mean: from collections.abc import MutableMapping?
# ← Exact fix suggested!` }
      },
      {
        type: "h2",
        text: "2. f-String Improvements in 3.12"
      },
      {
        type: "p",
        text: "Python 3.12 rewrote the f-string parser. You can now use quotes inside f-strings without escaping, nest f-strings, and use backslashes inside expressions."
      },
      {
        type: "code-block",
        label: "f-strings in Python 3.12+",
        code: `# Previously you couldn't reuse the same quote type inside f-strings
# Python 3.11 — this would fail:
# name = f"{'hello'}"  # SyntaxError

# Python 3.12 — all of these work now:
names = ["Alice", "Bob", "Carol"]

# Same quote type inside f-string ✅
result = f"First: {'names'[0]}"

# Nested f-strings ✅
result = f"Total: {f'{len(names)} people'}"

# Backslash inside f-string expression ✅
result = f"Names: {', '.join(n for n in names if n != 'Bob')}"

# Multi-line f-strings with complex expressions ✅
report = f"""
Users: {
    ', '.join(
        name.upper()
        for name in names
    )
}
"""
print(report)
# Users: ALICE, BOB, CAROL`
      },
      {
        type: "h2",
        text: "3. @override Decorator — 3.12"
      },
      {
        type: "p",
        text: "Python 3.12 added the @override decorator to typing. It tells type checkers that a method intentionally overrides a parent class method — catching subtle bugs when parent class signatures change."
      },
      {
        type: "code-block",
        label: "@override catches inheritance bugs",
        code: `from typing import override

class Animal:
    def speak(self) -> str:
        return "..."

    def move(self) -> str:
        return "moving"

class Dog(Animal):
    @override
    def speak(self) -> str:      # ✅ correctly overrides parent
        return "Woof!"

    @override
    def moev(self) -> str:       # ❌ typo! Type checker catches this:
        return "running"         # Error: 'moev' does not override any method in 'Animal'

# Without @override, the typo silently creates a NEW method
# instead of overriding the parent — a bug that's hard to find`
      },
      {
        type: "h2",
        text: "4. Free-Threaded Python — 3.13's Biggest Feature"
      },
      {
        type: "p",
        text: "Python 3.13 introduced experimental support for running Python without the Global Interpreter Lock (GIL). This is one of the most significant changes in Python's history. The GIL has prevented true CPU-level parallelism in Python threads for decades."
      },
      {
        type: "callout",
        icon: "⚠️",
        text: "Free-threaded mode is still experimental in 3.13 and 3.14. It requires installing a special build (python3.13t) and may have performance trade-offs for single-threaded code. Don't use in production yet — but start experimenting."
      },
      {
        type: "code-block",
        label: "True parallelism with threads — now possible",
        code: `import threading
import time

# CPU-bound task
def compute_sum(n, results, index):
    total = sum(range(n))
    results[index] = total

# With GIL (Python 3.12 and below):
# Threads take turns — no real parallelism for CPU work
# 4 threads on a quad-core = still roughly 1x speedup

# Without GIL (Python 3.13+ free-threaded build):
# True parallel execution across CPU cores

n = 10_000_000
results = [0, 0, 0, 0]
threads = [
    threading.Thread(target=compute_sum, args=(n, results, i))
    for i in range(4)
]

start = time.perf_counter()
for t in threads: t.start()
for t in threads: t.join()
elapsed = time.perf_counter() - start

print(f"Results: {results}")
print(f"Time: {elapsed:.3f}s")
# Free-threaded 3.13: ~4x faster on 4 cores
# Regular 3.12: threads don't help for CPU-bound work`
      },
      {
        type: "code-block",
        label: "Check if you're running free-threaded mode",
        code: `import sys

if sys._is_gil_enabled():
    print("GIL is active — standard Python")
else:
    print("GIL is disabled — free-threaded mode! 🚀")

# Install free-threaded build:
# Ubuntu/Mac: python3.13t (separate binary)
# Windows: check "Free-threaded" option in installer
# Docker: python:3.13-slim-bookworm has experimental builds`
      },
      {
        type: "h2",
        text: "5. New Interactive REPL — 3.13"
      },
      {
        type: "p",
        text: "Python 3.13 replaced the old REPL with a modern one that supports syntax highlighting, multi-line editing, and proper paste mode."
      },
      {
        type: "code-block",
        label: "New REPL features",
        code: `# Python 3.13 REPL improvements:

# 1. Syntax highlighting — keywords colored in terminal
# 2. Multi-line editing — use arrows to edit previous lines
# 3. Paste mode — F3 to paste multi-line code without >>> prompts
# 4. exit without parentheses now works!

>>> exit    # Python 3.12: "Use exit() or Ctrl-D to exit"
            # Python 3.13: actually exits! ✅

# 5. Better help() display with colors and pagination
# 6. Ctrl+Z to undo in the REPL`
      },
      {
        type: "h2",
        text: "6. JIT Compiler — 3.13 Preview, 3.14 Improved"
      },
      {
        type: "p",
        text: "Python 3.13 added an experimental copy-and-patch JIT compiler. Python 3.14 improves it significantly. JIT compiles hot code paths to native machine code at runtime — similar to what JavaScript engines do."
      },
      {
        type: "code-block",
        label: "Enable JIT and benchmark",
        code: `# Enable JIT (requires Python built with --enable-experimental-jit)
# Run: python3.14 --jit your_script.py

import time

def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

start = time.perf_counter()
result = fibonacci(35)
elapsed = time.perf_counter() - start

print(f"fib(35) = {result}")
print(f"Time: {elapsed:.4f}s")

# Benchmark results (approximate):
# Python 3.12 (no JIT):       ~2.8s
# Python 3.13 (JIT preview):  ~2.4s  (~15% faster)
# Python 3.14 (JIT improved): ~1.9s  (~32% faster)
# PyPy (for comparison):      ~0.3s  (still much faster for pure loops)

# JIT helps most with:
# - Tight numeric loops
# - Recursive algorithms
# - Hot code paths called thousands of times`
      },
      {
        type: "h2",
        text: "7. Deferred Annotations — 3.14"
      },
      {
        type: "p",
        text: "Python 3.14 makes PEP 649 the default — annotations are no longer evaluated at definition time. This fixes circular import issues and speeds up module loading."
      },
      {
        type: "code-block",
        label: "Deferred annotations solve circular imports",
        code: `# Python 3.13 and below — this causes problems:
class Node:
    def next(self) -> Node:  # Forward reference — Node not fully defined yet!
        ...                  # Had to use "Node" as a string to fix it

# Python 3.10-3.13 workaround:
from __future__ import annotations  # Had to add this line everywhere

class Node:
    def next(self) -> Node:  # Works with the import above
        ...

# Python 3.14 — deferred by default, no workaround needed:
class Node:
    def next(self) -> Node:  # ✅ Just works — annotation not evaluated immediately
        ...

    def children(self) -> list[Node]:  # ✅ Also works
        ...

# Performance benefit:
# Annotations are only evaluated when you actually need them (inspect, typing)
# Module load time improves — especially for heavily annotated codebases`
      },
      {
        type: "h2",
        text: "8. Template Strings (t-strings) — 3.14"
      },
      {
        type: "p",
        text: "Python 3.14 introduces template strings — a new string prefix `t` that works like f-strings but gives you programmatic control over how interpolated values are processed. This is a major safety improvement for SQL, HTML, and shell commands."
      },
      {
        type: "code-block",
        label: "t-strings vs f-strings",
        code: `# f-strings — immediate evaluation, no control over processing
name = "Alice'; DROP TABLE users; --"  # SQL injection attempt
query = f"SELECT * FROM users WHERE name = '{name}'"
# Danger! This builds a malicious query string directly

# t-strings — 3.14 new feature
# The template is NOT immediately converted to a string
# You get programmatic control over each interpolated value

from string.templatelib import Template  # new in 3.14

def safe_sql(template: Template) -> tuple[str, list]:
    """Convert t-string to parameterized query"""
    query_parts = []
    params = []
    for part in template:
        if isinstance(part, str):
            query_parts.append(part)
        else:
            query_parts.append("?")   # placeholder
            params.append(part.value) # actual value goes to params
    return "".join(query_parts), params

name = "Alice'; DROP TABLE users; --"
template = t"SELECT * FROM users WHERE name = {name}"

query, params = safe_sql(template)
print(query)   # SELECT * FROM users WHERE name = ?
print(params)  # ["Alice'; DROP TABLE users; --"]
# Safe! The injection attempt is just a parameter, not executed code

# t-strings also work for HTML escaping, shell commands, logging, etc.`
      },
      {
        type: "h2",
        text: "9. TypeVar Improvements — 3.12 onwards"
      },
      {
        type: "code-block",
        label: "New TypeVar syntax across versions",
        code: `# Old syntax (still works but verbose):
from typing import TypeVar, Generic
T = TypeVar('T')

class Stack(Generic[T]):
    def push(self, item: T) -> None: ...
    def pop(self) -> T: ...

# Python 3.12+ — new concise syntax:
class Stack[T]:                    # TypeVar declared inline!
    def push(self, item: T) -> None: ...
    def pop(self) -> T: ...

# Generic functions — new syntax:
def first[T](items: list[T]) -> T:
    return items[0]

# Bounded TypeVar — new syntax:
def largest[T: (int, float)](items: list[T]) -> T:
    return max(items)

# TypeVarTuple for variadic generics (3.12):
def zip_lists[*Ts](*lists: *Ts) -> list[tuple[*Ts]]: ...`
      },
      {
        type: "h2",
        text: "Quick Reference — What to Use When"
      },
      {
        type: "version-guide",
        items: [
          { version: "Use 3.12 if...", points: ["You need production stability", "Your team is upgrading from 3.10/3.11", "You want better error messages and @override", "LTS is a priority for your org"] },
          { version: "Use 3.13 if...", points: ["You want the free-threaded experiment", "You want the new REPL", "You're on a greenfield project", "You want JIT preview for benchmarking"] },
          { version: "Use 3.14 if...", points: ["You want t-strings for safe SQL/HTML", "You want improved JIT performance", "Deferred annotations matter for your codebase", "You're building something new and want latest"] },
        ]
      },
      {
        type: "callout",
        icon: "🛠️",
        text: "For most production applications and student projects in 2026, Python 3.13 is the sweet spot — stable, actively maintained, and includes the most impactful new features like the free-threaded mode and improved REPL."
      },
      {
        type: "h2",
        text: "Try It in ZeroAPI Playground"
      },
      {
        type: "p",
        text: "Want to experiment with Python syntax from these examples? Our Code Playground runs Python code directly in the browser — no installation needed. Try the f-string examples, the typing syntax, or any of the code samples above."
      },
      {
        type: "cta",
        text: "Open Python Playground →",
        href: "/#playground",
        note: "Free · No signup · Runs in browser"
      }
    ]
  }
];

// ── Blog Components ───────────────────────────────────────────
function renderContent(block, i, theme) {
  const isDark = theme === "dark";
  const text = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.8)";
  const muted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const ac = "#00ffe0";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  switch (block.type) {
    case "versions-table":
      return (
        <div key={i} style={{ margin: "24px 0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Space Mono',monospace", fontSize: "0.75rem" }}>
            <thead>
              <tr>
                {["Version", "Released", "Status", "Key Highlights"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", background: isDark ? "#1f2937" : "#f0fdfa", color: ac, borderBottom: `2px solid ${ac}33`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j} style={{ background: j % 2 === 0 ? "transparent" : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") }}>
                  <td style={{ padding: "10px 14px", color: ac, fontWeight: 700, borderBottom: `1px solid ${border}`, whiteSpace: "nowrap" }}>{row.version}</td>
                  <td style={{ padding: "10px 14px", color: text, borderBottom: `1px solid ${border}`, whiteSpace: "nowrap" }}>{row.released}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${border}`, whiteSpace: "nowrap" }}>
                    <span style={{ background: row.status.includes("Current") ? "rgba(52,211,153,0.12)" : row.status.includes("Active") ? "rgba(0,255,224,0.08)" : "rgba(255,255,255,0.05)", border: `1px solid ${row.status.includes("Current") ? "rgba(52,211,153,0.3)" : row.status.includes("Active") ? `${ac}33` : "rgba(255,255,255,0.1)"}`, borderRadius: "100px", padding: "2px 10px", fontSize: "0.68rem", color: row.status.includes("Current") ? "#34d399" : row.status.includes("Active") ? ac : muted }}>{row.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: text, borderBottom: `1px solid ${border}`, lineHeight: 1.5 }}>{row.highlight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "code-block":
      return (
        <div key={i} style={{ margin: "24px 0" }}>
          {block.label && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.62rem", color: ac, letterSpacing: "0.08em", marginBottom: "8px", textTransform: "uppercase", textAlign: "left" }}>◆ {block.label}</div>}
          <pre style={{ background: isDark ? "#0d1117" : "#1a1a2e", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)"}`, borderRadius: "10px", padding: "20px", margin: 0, overflowX: "auto", fontFamily: "'Space Mono',monospace", fontSize: "0.78rem", lineHeight: 1.8, color: "#e6edf3", whiteSpace: "pre", textAlign: "left" }}>
            <code>{block.code}</code>
          </pre>
        </div>
      );

    case "code-compare":
      return (
        <div key={i} style={{ margin: "24px 0" }}>
          {block.label && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.62rem", color: ac, letterSpacing: "0.08em", marginBottom: "8px", textTransform: "uppercase" }}>◆ {block.label}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px 8px 0 0", padding: "7px 14px", fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#f87171" }}>✗ {block.before.version}</div>
              <pre style={{ background: isDark ? "#0d1117" : "#1a1a2e", border: "1px solid rgba(248,113,113,0.15)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "16px", margin: 0, overflowX: "auto", fontFamily: "'Space Mono',monospace", fontSize: "0.73rem", lineHeight: 1.75, color: "#e6edf3", whiteSpace: "pre", textAlign: "left" }}><code>{block.before.code}</code></pre>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "8px 8px 0 0", padding: "7px 14px", fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#34d399" }}>✓ {block.after.version}</div>
              <pre style={{ background: isDark ? "#0d1117" : "#1a1a2e", border: "1px solid rgba(52,211,153,0.15)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "16px", margin: 0, overflowX: "auto", fontFamily: "'Space Mono',monospace", fontSize: "0.73rem", lineHeight: 1.75, color: "#e6edf3", whiteSpace: "pre", textAlign: "left" }}><code>{block.after.code}</code></pre>
            </div>
          </div>
        </div>
      );

    case "version-guide":
      return (
        <div key={i} style={{ margin: "24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" }}>
          {block.items.map((item, j) => (
            <div key={j} style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, borderRadius: "12px", padding: "18px" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.72rem", color: ac, fontWeight: 700, marginBottom: "12px" }}>{item.version}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {item.points.map((pt, k) => (
                  <div key={k} style={{ display: "flex", gap: "8px", fontSize: "0.82rem", color: text, lineHeight: 1.5 }}>
                    <span style={{ color: ac, flexShrink: 0 }}>→</span>{pt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case "intro":
      return <p key={i} style={{ fontSize: "1.05rem", color: text, lineHeight: 1.85, fontWeight: 400, marginBottom: "28px", borderLeft: `3px solid ${ac}`, paddingLeft: "18px", textAlign: "left" }}>{block.text}</p>;

    case "h2":
      return <h2 key={i} style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.2rem,2.5vw,1.5rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", marginTop: "44px", marginBottom: "14px", letterSpacing: "-0.02em", textAlign: "left" }}>{block.text}</h2>;

    case "p":
      return <p key={i} style={{ fontSize: "0.95rem", color: text, lineHeight: 1.85, marginBottom: "18px", textAlign: "left" }}>{block.text}</p>;

    case "callout":
      return (
        <div key={i} style={{ background: isDark ? "rgba(0,255,224,0.06)" : "rgba(0,137,123,0.06)", border: `1px solid ${ac}33`, borderRadius: "12px", padding: "18px 22px", margin: "28px 0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{block.icon}</span>
          <p style={{ fontSize: "0.92rem", color: text, lineHeight: 1.75, margin: 0 }}>{block.text}</p>
        </div>
      );

    case "do-dont":
      return (
        <div key={i} style={{ margin: "24px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
          {block.items.map((item, j) => (
            <div key={j} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: isDark ? "rgba(52,211,153,0.06)" : "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem", color: text, lineHeight: 1.6 }}>
                <span style={{ color: "#34d399", fontWeight: 700 }}>✓ </span>{item.do}
              </div>
              <div style={{ background: isDark ? "rgba(248,113,113,0.06)" : "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem", color: text, lineHeight: 1.6 }}>
                <span style={{ color: "#f87171", fontWeight: 700 }}>✗ </span>{item.dont}
              </div>
            </div>
          ))}
        </div>
      );

    case "steps":
      return (
        <div key={i} style={{ margin: "24px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
          {block.items.map((step, j) => (
            <div key={j} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ background: ac, color: "#000", fontFamily: "'Space Mono',monospace", fontSize: "0.75rem", fontWeight: 700, width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>{step.num}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: isDark ? "#fff" : "#1a1a1a", marginBottom: "4px" }}>{step.title}</div>
                <div style={{ fontSize: "0.85rem", color: text, lineHeight: 1.7 }}>{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      );

    case "sections-list":
      return (
        <div key={i} style={{ margin: "24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
          {block.items.map((item, j) => (
            <div key={j} style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, borderRadius: "10px", padding: "14px 18px" }}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: ac, marginBottom: "5px", fontFamily: "'Space Mono',monospace" }}>{item.title}</div>
              <div style={{ fontSize: "0.84rem", color: text, lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      );

    case "example-box":
      return (
        <div key={i} style={{ margin: "20px 0", borderRadius: "12px", overflow: "hidden", border: `1px solid ${border}` }}>
          <div style={{ background: "rgba(248,113,113,0.08)", padding: "12px 16px", borderBottom: `1px solid ${border}` }}>
            <div style={{ fontSize: "0.65rem", fontFamily: "'Space Mono',monospace", color: "#f87171", marginBottom: "6px", letterSpacing: "0.1em" }}>✗ WEAK</div>
            <div style={{ fontSize: "0.84rem", color: text, lineHeight: 1.65, textAlign: "left" }}>{block.bad}</div>
          </div>
          <div style={{ background: "rgba(52,211,153,0.06)", padding: "12px 16px" }}>
            <div style={{ fontSize: "0.65rem", fontFamily: "'Space Mono',monospace", color: "#34d399", marginBottom: "6px", letterSpacing: "0.1em" }}>✓ STRONG</div>
            <div style={{ fontSize: "0.84rem", color: text, lineHeight: 1.65, textAlign: "left" }}>{block.good}</div>
          </div>
        </div>
      );

    case "mistakes":
      return (
        <div key={i} style={{ margin: "24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
          {block.items.map((item, j) => (
            <div key={j} style={{ display: "flex", gap: "14px", alignItems: "flex-start", background: isDark ? "rgba(248,113,113,0.04)" : "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "10px", padding: "14px 16px" }}>
              <span style={{ color: "#f87171", fontSize: "1rem", flexShrink: 0, marginTop: "1px" }}>✗</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: isDark ? "#fff" : "#1a1a1a", marginBottom: "4px" }}>{item.title}</div>
                <div style={{ fontSize: "0.83rem", color: text, lineHeight: 1.7 }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      );

    case "checklist":
      return (
        <div key={i} style={{ margin: "24px 0", background: isDark ? "rgba(0,255,224,0.03)" : "rgba(0,137,123,0.04)", border: `1px solid ${ac}22`, borderRadius: "14px", padding: "20px 22px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {block.items.map((item, j) => (
              <div key={j} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.85rem", color: text, lineHeight: 1.6 }}>
                <span style={{ color: ac, fontWeight: 700, flexShrink: 0 }}>☐</span>{item}
              </div>
            ))}
          </div>
        </div>
      );

    case "cta":
      return (
        <div key={i} style={{ margin: "32px 0", textAlign: "center" }}>
          <a href={block.href} style={{ display: "inline-block", background: "linear-gradient(135deg,#00ffe0,#0af)", color: "#000", fontWeight: 700, fontSize: "0.95rem", padding: "14px 32px", borderRadius: "12px", textDecoration: "none", fontFamily: "'Space Mono',monospace" }}>{block.text}</a>
          {block.note && <div style={{ marginTop: "10px", fontSize: "0.75rem", color: muted, fontFamily: "'Space Mono',monospace" }}>{block.note}</div>}
        </div>
      );

    default:
      return null;
  }
}

// ── Blog List Page ────────────────────────────────────────────
export function BlogList({ theme }) {
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const ac = "#00ffe0";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5", width: "100%" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 24px 100px" }}>
        {/* Back */}
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "48px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
          ← Back to ZeroAPI
        </button>

        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "14px" }}>◆ Learn</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", letterSpacing: "-0.03em", marginBottom: "12px", lineHeight: 1.1, textAlign: "left" }}>Guides & Tutorials</h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.6)", fontSize: "1rem", fontWeight: 300, textAlign: "left" }}>Practical guides for developers, students, and job seekers. New articles every week.</p>
        </div>

        {/* Articles */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {BLOG_POSTS.map(post => (
            <article key={post.slug} onClick={() => navigate(`/learn/${post.slug}`)}
              style={{ background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`, borderRadius: "16px", padding: "28px", cursor: "pointer", transition: "all 0.2s", display: "flex", gap: "20px", alignItems: "flex-start" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${ac}44`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: "2.2rem", flexShrink: 0, lineHeight: 1 }}>{post.coverEmoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ background: `${post.categoryColor}18`, border: `1px solid ${post.categoryColor}33`, borderRadius: "100px", padding: "3px 12px", fontSize: "0.65rem", fontFamily: "'Space Mono',monospace", color: post.categoryColor, whiteSpace: "nowrap" }}>{post.category}</span>
                  <span style={{ fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace", whiteSpace: "nowrap" }}>{post.date} · {post.readTime}</span>
                </div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1rem,2vw,1.25rem)", fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.3, textAlign: "left" }}>{post.title}</h2>
                <p style={{ fontSize: "0.85rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", lineHeight: 1.65, margin: 0, textAlign: "left" }}>{post.excerpt}</p>
                <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {post.tags.map(tag => <span key={tag} style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", fontFamily: "'Space Mono',monospace" }}>#{tag}</span>)}
                </div>
              </div>
              <span style={{ color: ac, fontSize: "1.1rem", flexShrink: 0, alignSelf: "center", opacity: 0.7 }}>→</span>
            </article>
          ))}

          {/* Coming soon */}
          <div style={{ background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.03)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"}`, borderRadius: "16px", padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>✍️</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", letterSpacing: "0.1em" }}>MORE ARTICLES COMING WEEKLY</div>
            <div style={{ fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.45)", marginTop: "8px" }}>SQL interview prep · Python tips · Career guides for B.Tech students</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Blog Post Page ────────────────────────────────────────────
export function BlogPost({ theme }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const ac = "#00ffe0";

  const post = BLOG_POSTS.find(p => p.slug === slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!post) {
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "3rem" }}>📭</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a" }}>Article not found</div>
        <button onClick={() => navigate("/learn")} style={{ background: "linear-gradient(135deg,#00ffe0,#0af)", border: "none", borderRadius: "10px", padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>← Back to Learn</button>
      </div>
    );
  }

  function shareText(platform) {
    const url = `https://zeroapi.in/learn/${post.slug}`;
    const text = `${post.title} — ${url}`;
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    if (platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    if (platform === "copy") { navigator.clipboard.writeText(url).catch(() => {}); }
  }

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5", width: "100%" }}>

      {/* ── Article Header ── */}
      <div style={{ background: isDark ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.02)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}` }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "72px 24px 40px" }}>
          <button onClick={() => navigate("/learn")} style={{ background: "transparent", border: "none", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "32px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
            ← All Articles
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <span style={{ background: `${post.categoryColor}18`, border: `1px solid ${post.categoryColor}33`, borderRadius: "100px", padding: "4px 14px", fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", color: post.categoryColor }}>{post.category}</span>
            <span style={{ fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>{post.date} · {post.readTime}</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,4vw,2.5rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "16px", textAlign: "left" }}>{post.title}</h1>
          <p style={{ fontSize: "1.05rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", lineHeight: 1.7, textAlign: "left", maxWidth: "680px" }}>{post.excerpt}</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
            {post.tags.map(tag => <span key={tag} style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", fontFamily: "'Space Mono',monospace" }}>#{tag}</span>)}
          </div>
        </div>
      </div>

      {/* ── Article Body ── */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px", textAlign: "left" }}>
        {post.content.map((block, i) => renderContent(block, i, theme))}

        {/* Share */}
        <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>Share This Article</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "𝕏 Twitter", platform: "twitter", bg: "#1a1a1a", color: "#fff" },
              { label: "💬 WhatsApp", platform: "whatsapp", bg: "#25d366", color: "#fff" },
              { label: "💼 LinkedIn", platform: "linkedin", bg: "#0077b5", color: "#fff" },
              { label: "🔗 Copy Link", platform: "copy", bg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: isDark ? "#fff" : "#1a1a1a" },
            ].map(btn => (
              <button key={btn.platform} onClick={() => shareText(btn.platform)}
                style={{ background: btn.bg, border: "none", borderRadius: "8px", padding: "9px 18px", color: btn.color, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontWeight: 500 }}>{btn.label}</button>
            ))}
          </div>
        </div>

        {/* Related tools CTA */}
        <div style={{ marginTop: "40px", background: isDark ? "rgba(0,255,224,0.04)" : "rgba(0,137,123,0.05)", border: "1px solid rgba(0,255,224,0.15)", borderRadius: "16px", padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.05rem", color: isDark ? "#fff" : "#1a1a1a", marginBottom: "6px", textAlign: "left" }}>Try Our Free Resume Tools</div>
              <p style={{ fontSize: "0.85rem", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.6)", marginBottom: "16px", lineHeight: 1.6, textAlign: "left" }}>Analyze your resume for ATS score, get expert feedback, and build an improved version — free, no signup needed.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a href="/#tools" style={{ background: "linear-gradient(135deg,#00ffe0,#0af)", color: "#000", fontWeight: 700, fontSize: "0.82rem", padding: "9px 20px", borderRadius: "8px", textDecoration: "none", fontFamily: "'Space Mono',monospace" }}>Resume Analyzer →</a>
                <a href="/#tools" style={{ background: "transparent", border: "1px solid rgba(0,255,224,0.3)", color: ac, fontWeight: 500, fontSize: "0.82rem", padding: "9px 20px", borderRadius: "8px", textDecoration: "none", fontFamily: "'Space Mono',monospace" }}>Resume Builder →</a>
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div style={{ marginTop: "32px" }}>
          <button onClick={() => navigate("/learn")}
            style={{ background: "transparent", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"}`, borderRadius: "8px", padding: "8px 20px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>← More Articles</button>
        </div>
      </div>
    </div>
  );
}

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "100px 24px 80px" }}>
        {/* Back */}
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "40px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
          ← Back to ZeroAPI
        </button>

        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.68rem", color: ac, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>◆ Learn</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", letterSpacing: "-0.03em", marginBottom: "14px" }}>Guides & Tutorials</h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.6)", fontSize: "1rem", fontWeight: 300 }}>Practical guides for developers, students, and job seekers. New articles every week.</p>
        </div>

        {/* Articles */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {BLOG_POSTS.map(post => (
            <article key={post.slug} onClick={() => navigate(`/learn/${post.slug}`)} style={{ background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`, borderRadius: "16px", padding: "28px 32px", cursor: "pointer", transition: "all 0.2s", display: "flex", gap: "24px", alignItems: "flex-start" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${ac}44`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>{post.coverEmoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ background: `${post.categoryColor}18`, border: `1px solid ${post.categoryColor}33`, borderRadius: "100px", padding: "3px 12px", fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", color: post.categoryColor }}>{post.category}</span>
                  <span style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>{post.date} · {post.readTime}</span>
                </div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.1rem,2vw,1.3rem)", fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a", marginBottom: "10px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{post.title}</h2>
                <p style={{ fontSize: "0.875rem", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.6)", lineHeight: 1.7, margin: 0 }}>{post.excerpt}</p>
                <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {post.tags.map(tag => <span key={tag} style={{ fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>#{tag}</span>)}
                </div>
              </div>
              <span style={{ color: ac, fontSize: "1.2rem", flexShrink: 0, alignSelf: "center" }}>→</span>
            </article>
          ))}

          {/* Coming soon card */}
          <div style={{ background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.03)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"}`, borderRadius: "16px", padding: "28px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>✍️</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", letterSpacing: "0.1em" }}>MORE ARTICLES COMING WEEKLY</div>
            <div style={{ fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)", marginTop: "8px" }}>SQL interview prep · Python tips · Career guides for B.Tech students</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Blog Post Page ────────────────────────────────────────────
export function BlogPost({ theme }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const ac = "#00ffe0";

  const post = BLOG_POSTS.find(p => p.slug === slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!post) {
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "3rem" }}>📭</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a" }}>Article not found</div>
        <button onClick={() => navigate("/learn")} style={{ background: "linear-gradient(135deg,#00ffe0,#0af)", border: "none", borderRadius: "10px", padding: "10px 24px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>← Back to Learn</button>
      </div>
    );
  }

  function shareText(platform) {
    const url = `https://zeroapi.in/learn/${post.slug}`;
    const text = `${post.title} — ${url}`;
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    if (platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    if (platform === "copy") { navigator.clipboard.writeText(url).catch(() => {}); }
  }

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5" }}>
      {/* Article header */}
      <div style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}` }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 24px 40px" }}>
          <button onClick={() => navigate("/learn")} style={{ background: "transparent", border: "none", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "32px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
            ← All Articles
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
            <span style={{ background: `${post.categoryColor}18`, border: `1px solid ${post.categoryColor}33`, borderRadius: "100px", padding: "4px 14px", fontSize: "0.7rem", fontFamily: "'Space Mono',monospace", color: post.categoryColor }}>{post.category}</span>
            <span style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>{post.date} · {post.readTime}</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "18px" }}>{post.title}</h1>
          <p style={{ fontSize: "1rem", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.6)", lineHeight: 1.7 }}>{post.excerpt}</p>
          {/* Tags */}
          <div style={{ display: "flex", gap: "8px", marginTop: "18px", flexWrap: "wrap" }}>
            {post.tags.map(tag => <span key={tag} style={{ fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>#{tag}</span>)}
          </div>
        </div>
      </div>

      {/* Article body */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 60px" }}>
        {post.content.map((block, i) => renderContent(block, i, theme))}

        {/* Share section */}
        <div style={{ marginTop: "56px", paddingTop: "32px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", letterSpacing: "0.1em", marginBottom: "14px" }}>SHARE THIS ARTICLE</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "𝕏 Twitter", platform: "twitter", bg: "#1a1a1a" },
              { label: "💬 WhatsApp", platform: "whatsapp", bg: "#25d366" },
              { label: "💼 LinkedIn", platform: "linkedin", bg: "#0077b5" },
              { label: "🔗 Copy Link", platform: "copy", bg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" },
            ].map(btn => (
              <button key={btn.platform} onClick={() => shareText(btn.platform)} style={{ background: btn.bg, border: "none", borderRadius: "8px", padding: "8px 16px", color: btn.platform === "copy" ? (isDark ? "#fff" : "#1a1a1a") : "#fff", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontWeight: 500 }}>{btn.label}</button>
            ))}
          </div>
        </div>

        {/* Related tools CTA */}
        <div style={{ marginTop: "40px", background: isDark ? "rgba(0,255,224,0.04)" : "rgba(0,137,123,0.05)", border: "1px solid rgba(0,255,224,0.15)", borderRadius: "16px", padding: "28px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>📋</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: isDark ? "#fff" : "#1a1a1a", marginBottom: "8px" }}>Try Our Free Resume Tools</div>
          <p style={{ fontSize: "0.85rem", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.6)", marginBottom: "18px", lineHeight: 1.6 }}>Analyze your resume for ATS score, get expert feedback, and build an improved version — all free, no signup needed.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#tools" style={{ background: "linear-gradient(135deg,#00ffe0,#0af)", color: "#000", fontWeight: 700, fontSize: "0.85rem", padding: "10px 22px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Space Mono',monospace" }}>Resume Analyzer →</a>
            <a href="/#tools" style={{ background: "transparent", border: "1px solid rgba(0,255,224,0.3)", color: ac, fontWeight: 500, fontSize: "0.85rem", padding: "10px 22px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Space Mono',monospace" }}>Resume Builder →</a>
          </div>
        </div>

        {/* Back */}
        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <button onClick={() => navigate("/learn")} style={{ background: "transparent", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"}`, borderRadius: "8px", padding: "8px 20px", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>← More Articles</button>
        </div>
      </div>
    </div>
  );
}
