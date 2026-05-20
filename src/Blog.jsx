import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// ── Blog Posts Data ───────────────────────────────────────────
export const BLOG_POSTS = [
  {
    slug: "ats-resume-2026",
    title: "How to Write an ATS-Friendly Resume in 2026",
    date: "May 16, 2026",
    readTime: "10 min read",
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
        text: "An Applicant Tracking System (ATS) is software that companies use to collect, sort, and filter job applications automatically. Think of it as a gatekeeper robot that reads your resume before any human does. Companies like TCS, Infosys, Wipro, Google, Amazon, and virtually every MNC uses one. Popular ATS platforms include Workday (used by Amazon, Google), Greenhouse (used by Stripe, Airbnb), Lever (used by Netflix, Shopify), and iCIMS (used by TCS, Infosys) — each parses resumes slightly differently, but all follow the same core rules."
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
        text: "File Naming & LinkedIn — The Details That Matter"
      },
      {
        type: "p",
        text: "Small details separate professional candidates from the rest. Your file name should be: FirstName_LastName_Role.pdf (e.g., 'Rahul_Sharma_Frontend_Developer.pdf'). Never submit 'Resume_Final_v3.pdf'."
      },
      {
        type: "p",
        text: "Recruiters often cross-reference your resume with your LinkedIn profile. Make sure your LinkedIn headline matches your target role, your 'About' section contains keywords from your industry, and your skills section is filled out with endorsements."
      },
      {
        type: "h2",
        text: "Handling Career Gaps and Job Changes"
      },
      {
        type: "p",
        text: "ATS systems don't penalize gaps — humans do. But if your gap is formatted confusingly, the ATS may misparse your timeline. Use a simple format: 'Jan 2022 – Mar 2023' followed by 'Apr 2023 – Present'. If you have a gap, consider adding a one-line explanation in your cover letter, not the resume."
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
          "File named: FirstName_LastName_Role.pdf",
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
    date: "May 17, 2026",
    readTime: "12 min read",
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

# Benchmark results (approximate, x86_64, 8-core):
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
        label: "t-strings vs f-strings — SQL injection safe",
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
# Safe! The injection attempt is just a parameter, not executed code`
      },
      {
        type: "code-block",
        label: "t-strings for HTML escaping — XSS protection",
        code: `# t-strings also prevent XSS in HTML templates
from string.templatelib import Template
import html

def safe_html(template: Template) -> str:
    """Escape all interpolated values for HTML"""
    parts = []
    for part in template:
        if isinstance(part, str):
            parts.append(part)
        else:
            parts.append(html.escape(str(part.value)))
    return "".join(parts)

user_input = "<script>alert('xss')</script>"
template = t"<div class='comment'>{user_input}</div>"

result = safe_html(template)
print(result)
# <div class='comment'>&lt;script&gt;alert('xss')&lt;/script&gt;</div>
# Safe! The script tag is escaped and won't execute`
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
        text: "10. Safe Migration Guide — Upgrading Without Breaking"
      },
      {
        type: "p",
        text: "Upgrading Python versions can break dependencies. Here's a safe approach:"
      },
      {
        type: "steps",
        items: [
          {
            num: "1",
            title: "Check compatibility first",
            text: "Run `python -m pip check` and review your dependencies on PyPI for version support."
          },
          {
            num: "2",
            title: "Use a virtual environment",
            text: "Never upgrade system Python. Create a fresh venv: `python3.14 -m venv venv314`"
          },
          {
            num: "3",
            title: "Install and test",
            text: "Install requirements, run your test suite. Fix any deprecation warnings — they become errors in the next version."
          },
          {
            num: "4",
            title: "Use tox or nox",
            text: "Test across multiple Python versions automatically. `tox -e py312,py313,py314`"
          },
          {
            num: "5",
            title: "Deploy gradually",
            text: "Start with staging environments. Monitor for performance regressions, especially if using JIT or free-threaded builds."
          }
        ]
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
  },
  {
    slug: "git-github-first-job",
    title: "Git & GitHub for Your First Job: Beyond git push",
    date: "May 18, 2026",
    readTime: "9 min read",
    category: "Developer Tools",
    categoryColor: "#f472b6",
    excerpt: "You know git add, commit, and push. But your first week at work will hit you with rebase, merge conflicts, squash commits, and PR reviews. Here's the survival guide no one gave you.",
    coverEmoji: "🔀",
    tags: ["Git", "GitHub", "Developer", "Career"],
    content: [
      {
        type: "intro",
        text: "Every computer science student learns git init, git add, git commit, and git push. That's enough for college projects. It's not enough for your first job. Within your first week, you'll face merge conflicts, rebasing, squashing commits, and writing PR descriptions that determine whether your code gets approved or rejected. This guide fills the gap."
      },
      {
        type: "h2",
        text: "The Git Commands You Actually Need Day 1"
      },
      {
        type: "p",
        text: "Before we dive into scenarios, here are the commands that appear in 90% of real workflows — and what they actually do beyond the surface level."
      },
      {
        type: "code-block",
        label: "The real day-1 git workflow",
        code: `# 1. Start fresh from main
git checkout main
git pull origin main  # Always pull before branching

# 2. Create a feature branch with a clear name
git checkout -b feat/user-authentication
# Naming conventions: feat/, fix/, docs/, refactor/ + descriptive name

# 3. Make atomic commits (one logical change per commit)
git add src/auth/login.js
git commit -m "feat: add JWT-based login endpoint"

# 4. Keep your branch updated with main
git fetch origin
git rebase origin/main  # Prefer rebase over merge for clean history

# 5. Push and create PR
git push -u origin feat/user-authentication
# Then open PR on GitHub with a proper description`
      },
      {
        type: "h2",
        text: "Scenario 1: Your Senior Asked You to Rebase Instead of Merge"
      },
      {
        type: "p",
        text: "You branched off main three days ago. Since then, three teammates merged their PRs. Your branch is now 'behind' main. You have two options: merge main into your branch (creates a merge commit, messy history) or rebase your commits on top of the latest main (clean linear history). Most teams prefer rebase."
      },
      {
        type: "code-block",
        label: "Rebasing correctly — step by step",
        code: `# Step 1: Save your current state (just in case)
git stash

# Step 2: Fetch latest changes without switching branches
git fetch origin

# Step 3: Rebase your branch onto latest main
git rebase origin/main

# If you get conflicts, Git pauses and shows you which files:
# <<<<<<< HEAD
# code from main
# =======
# your code
# >>>>>>> your-branch

# Edit the file, keep the correct code, remove conflict markers
git add <resolved-file>
git rebase --continue

# If you mess up badly, abort and start over:
# git rebase --abort

# Step 4: Force push (safe on feature branches, NEVER on main)
git push --force-with-lease  # Safer than --force`
      },
      {
        type: "callout",
        icon: "⚠️",
        text: "Never use git push --force on shared branches like main, develop, or staging. --force-with-lease checks that no one else pushed since you last fetched — it's a safety net."
      },
      {
        type: "h2",
        text: "Scenario 2: You Committed a 500MB Dataset by Accident"
      },
      {
        type: "p",
        text: "It happens. You added a CSV file, committed it, pushed it, and now the repo is bloated. Deleting it in a new commit doesn't remove it from Git history — it's still in the repository, making clones slow."
      },
      {
        type: "code-block",
        label: "Removing large files from Git history",
        code: `# Step 1: Find the large files in history
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(restpath)' | awk '$1 == "blob" && $3 > 1000000 {print $3, $4}' | sort -rn

# Step 2: Use git filter-repo (modern replacement for filter-branch)
# Install first: pip install git-filter-repo
git filter-repo --strip-blobs-bigger-than 50M

# Alternative: remove specific file from all history
git filter-repo --path data/large-dataset.csv --invert-paths

# Step 3: Force push the cleaned history
git push origin --force --all

# Step 4: Add the file to .gitignore so it never happens again
echo "data/*.csv" >> .gitignore
git add .gitignore
git commit -m "chore: ignore large data files"`
      },
      {
        type: "h2",
        text: "Scenario 3: Writing a PR Description That Gets Approved in One Review"
      },
      {
        type: "p",
        text: "Your PR description is your pitch. A good description saves your reviewer 10 minutes of guessing. A bad description guarantees follow-up questions and delays."
      },
      {
        type: "do-dont",
        items: [
          { do: "What changed and why (1-2 sentences)", dont: "'Fixed bug' or 'Updated code'" },
          { do: "Link to the ticket/issue: Closes #123", dont: "No context on what problem this solves" },
          { do: "Screenshots for UI changes", dont: "Making reviewers check out your branch to see visual changes" },
          { do: "Testing steps: 'Run npm test, check /auth/login'", dont: "'It works on my machine'" },
          { do: "Breaking changes listed upfront", dont: "Hiding API changes that break other services" },
        ]
      },
      {
        type: "code-block",
        label: "PR template that works",
        code: `## What
Added JWT-based authentication to the login endpoint.

## Why
Current session-based auth doesn't scale to mobile apps.
Closes #142

## How to test
1. Run npm run dev
2. POST /api/auth/login with {email, password}
3. Check response contains accessToken and refreshToken
4. Verify token expires in 15 minutes

## Screenshots
[Postman screenshot showing successful login]

## Breaking changes
- Old session cookies are no longer issued
- Frontend must send Authorization: Bearer <token> header

## Checklist
- [x] Tests pass
- [x] API docs updated
- [x] No console errors`
      },
      {
        type: "h2",
        text: "Scenario 4: Squashing 12 'WIP' Commits Into One Clean Commit"
      },
      {
        type: "p",
        text: "You committed 'fix typo', 'debug logging', 'almost working', 'WIP', 'final fix', 'actually final fix' — 12 messy commits for one feature. Before merging, squash them into a single, descriptive commit."
      },
      {
        type: "code-block",
        label: "Interactive rebase to squash commits",
        code: `# Step 1: Start interactive rebase for last 12 commits
git rebase -i HEAD~12

# Git opens an editor showing:
# pick a1b2c3d fix typo
# pick e4f5g6h debug logging
# pick i7j8k9l almost working
# ...

# Step 2: Change 'pick' to 'squash' (or just 's') for all except the first
# pick a1b2c3d feat: add user authentication
# s e4f5g6h debug logging
# s i7j8k9l almost working
# ...

# Step 3: Save and close editor
# Git opens another editor to write the combined commit message
# Write a clean message, save, close

# Step 4: Force push the rewritten history
git push --force-with-lease`
      },
      {
        type: "h2",
        text: "Scenario 5: You Broke main and Need to Revert Fast"
      },
      {
        type: "p",
        text: "You merged a PR that broke production. The CI is red. Your manager is pinging you. You need to undo the merge immediately — but you also need to preserve the work for later fixing."
      },
      {
        type: "code-block",
        label: "Safe revert vs dangerous reset",
        code: `# ✅ SAFE: Revert creates a new commit that undoes the changes
# This preserves history and is safe for shared branches
git revert <commit-hash-of-the-bad-merge>
git push origin main

# ❌ DANGEROUS: Reset erases commits permanently
# Only use this on your own feature branch before pushing
git reset --hard HEAD~1  # Deletes last commit forever

# If you already pushed the bad commit and others pulled it,
# resetting will cause chaos. Always revert on shared branches.`
      },
      {
        type: "h2",
        text: "Git Commands Cheat Sheet for Day 1 at Work"
      },
      {
        type: "p",
        text: "Print this. Keep it on your second monitor. You'll use these daily."
      },
      {
        type: "code-block",
        label: "Essential commands reference",
        code: `# Daily workflow
git checkout -b feat/name          # New feature branch
git add -p                         # Stage changes interactively (review each chunk)
git commit -m "type: description"  # Conventional commits format
git fetch && git rebase origin/main  # Stay up to date
git push -u origin branch          # Push new branch

# Undoing mistakes
git reset --soft HEAD~1            # Undo last commit, keep changes staged
git reset --mixed HEAD~1         # Undo last commit, keep changes unstaged
git checkout -- <file>             # Discard changes in a file
git restore --staged <file>        # Unstage a file

# History and inspection
git log --oneline --graph          # Pretty history with branch graph
git blame <file>                   # Who wrote each line
git diff HEAD~1                    # What changed in last commit
git stash push -m "WIP login"      # Save work with a description
git stash pop                      # Restore stashed work

# Collaboration
git rebase -i HEAD~N               # Squash last N commits
git cherry-pick <commit>           # Copy a commit to current branch
git bisect start                   # Find which commit introduced a bug`
      },
      {
        type: "h2",
        text: "Common Mistakes That Make You Look Junior"
      },
      {
        type: "mistakes",
        items: [
          { title: "Committing directly to main", text: "Always branch. Even for 'quick fixes'. Direct commits to main break CI, bypass review, and create revert headaches." },
          { title: "Giant commits with 20 files changed", text: "A PR that touches auth, UI, database schema, and 3 config files is impossible to review. Split into logical chunks." },
          { title: "Writing vague commit messages", text: "'Fix bug' or 'Update' tells your team nothing. Use conventional commits: 'feat:', 'fix:', 'docs:', 'refactor:', 'test:'" },
          { title: "Ignoring .gitignore", text: "Committing node_modules, .env files, or IDE configs marks you as careless. Set up .gitignore on day 0." },
          { title: "Panic-pushing broken code at 5 PM", text: "If it's not working, don't push. Use git stash, go home, come back fresh. Broken code in the repo blocks your teammates." },
        ]
      },
      {
        type: "h2",
        text: "GitHub Features Beyond the Basics"
      },
      {
        type: "p",
        text: "GitHub is more than a git remote. These features will make you look like a senior developer from week one."
      },
      {
        type: "sections-list",
        items: [
          {
            title: "Pull Request Templates",
            desc: "Create .github/pull_request_template.md in your repo. Every new PR auto-fills with your template — no more blank descriptions."
          },
          {
            title: "Issue Templates",
            desc: "Bug reports and feature requests with structured fields. Saves 5 back-and-forth messages per issue."
          },
          {
            title: "GitHub Actions (CI/CD)",
            desc: "Automated tests run on every PR. If tests fail, the PR can't merge. This is standard in every professional team."
          },
          {
            title: "Code Review Requests",
            desc: "Request specific reviewers, not just 'anyone'. Tag the person who knows that codebase. Faster reviews, better feedback."
          },
          {
            title: "Draft PRs",
            desc: "Open a PR as 'Draft' when you want early feedback but it's not ready to merge. Signals intent without blocking review queues."
          }
        ]
      },
      {
        type: "h2",
        text: "The Bottom Line"
      },
      {
        type: "p",
        text: "Git is a tool you'll use every day for the next 40 years. Spending one weekend to truly understand rebase, squash, and clean commit history will save you hundreds of hours and prevent countless embarrassing moments. The developers who get promoted fastest aren't the ones who write the most code — they're the ones whose code is easiest to review, revert, and build upon."
      },
      {
        type: "p",
        text: "Start with the cheat sheet. Practice on a personal project. When you join your first team, you'll already move like someone with two years of experience."
      }
    ]
  },
  {
    slug: "system-design-interview-patterns",
    title: "System Design for Interviews: The 5 Patterns You Actually Need",
    date: "May 19, 2026",
    readTime: "11 min read",
    category: "Interview Prep",
    categoryColor: "#fb923c",
    excerpt: "Every MAANG interview now includes system design — even for 2 YOE candidates. Skip the 500-page books. These 5 patterns cover 80% of interview questions.",
    coverEmoji: "🏗️",
    tags: ["System Design", "Interview", "MAANG", "Career"],
    content: [
      {
        type: "intro",
        text: "Two years ago, system design was reserved for senior engineers with 5+ years of experience. Today, Flipkart, Razorpay, and even Series-A startups ask system design questions to candidates with 2 years of experience. The good news: you don't need to read Designing Data-Intensive Applications cover-to-cover. You need to recognize patterns. Here are the 5 patterns that appear in 80% of interviews."
      },
      {
        type: "h2",
        text: "The 45-Minute Interview Structure"
      },
      {
        type: "p",
        text: "Before diving into patterns, understand the clock. A typical system design round is 45 minutes. Senior engineers spend the first 5 minutes clarifying requirements. Juniors jump straight into drawing boxes. Don't be a junior."
      },
      {
        type: "steps",
        items: [
          {
            num: "1",
            title: "Clarify (4-5 minutes)",
            text: "Ask: functional requirements (what does it do?), non-functional (scale? latency? consistency?), and constraints (budget? team size?)."
          },
          {
            num: "2",
            title: "High-Level Design (10 minutes)",
            text: "Draw the main components: client, load balancer, application servers, database, cache. Explain data flow. Don't over-engineer."
          },
          {
            num: "3",
            title: "Deep Dive (20 minutes)",
            text: "The interviewer picks one area: database schema, scaling strategy, consistency model, or failure handling. This is where you prove your depth."
          },
          {
            num: "4",
            title: "Trade-offs & Bottlenecks (10 minutes)",
            text: "Discuss what breaks first as scale increases. Show you understand there are no perfect solutions, only optimized compromises."
          }
        ]
      },
      {
        type: "h2",
        text: "Pattern 1: Load Balancing + Caching"
      },
      {
        type: "p",
        text: "This is the bread and butter. Every system design question starts here: 'Design a URL shortener', 'Design a rate limiter', 'Design a caching layer'. The answer always involves distributing traffic and caching hot data."
      },
      {
        type: "code-block",
        label: "Load balancer + cache architecture",
        code: `# High-Level Design: URL Shortener

# Components:
# 1. Client → sends POST /shorten with long URL
# 2. Load Balancer (Nginx/HAProxy) → distributes to app servers
# 3. App Servers (Node.js/Python) → business logic
# 4. Cache (Redis) → stores hot mappings (1M+ QPS possible)
# 5. Database (PostgreSQL) → persistent storage, sharded by hash

# Why this works:
# - 95% of traffic hits top 1% of URLs (Pareto principle)
# - Redis handles 100k+ QPS per node → cache eliminates DB load
# - Load balancer uses consistent hashing → same URL → same server

# Scaling numbers:
# - 1 Redis node: ~100k QPS
# - 1 PostgreSQL node: ~5k QPS
# - With cache: handle 1M QPS with 10 Redis + 2 DB nodes

# Interview tip: Always mention cache invalidation strategy
# - TTL (Time To Live): auto-expire after 1 hour
# - Write-through: update DB + cache simultaneously
# - Cache-aside: check cache first, fall back to DB`
      },
      {
        type: "callout",
        icon: "💡",
        text: "The magic phrase in interviews: 'I'll use a cache because this workload follows the Pareto principle — 95% of requests hit 5% of data.' This shows you think about data access patterns, not just technologies."
      },
      {
        type: "h2",
        text: "Pattern 2: Database Sharding"
      },
      {
        type: "p",
        text: "When your data doesn't fit on one machine, you shard. The interviewer wants to hear your sharding strategy, not just 'use a bigger database'."
      },
      {
        type: "code-block",
        label: "Sharding strategies with examples",
        code: `# Problem: 1 billion users, 1TB of data. Single DB can't handle it.

# Strategy 1: Hash-based Sharding
# shard = hash(user_id) % num_shards
# Pros: Even distribution, simple
# Cons: Re-sharding is painful (change num_shards = move all data)

# Strategy 2: Range-based Sharding
# Shard 1: user_id 1-1,000,000
# Shard 2: user_id 1,000,001-2,000,000
# Pros: Easy range queries, simple re-sharding
# Cons: Hot shards (new users all hit Shard N)

# Strategy 3: Directory-based Sharding (most flexible)
# Lookup table: user_id → shard_id
# Pros: Move users between shards without hash changes
# Cons: Single point of failure (the lookup table)

# Interview answer for 'Design Twitter':
# - Tweets table: shard by user_id ( user's tweets together)
# - Timeline table: shard by tweet_id (even distribution)
# - Use directory sharding for flexibility, cache the lookup table`
      },
      {
        type: "h2",
        text: "Pattern 3: Message Queues for Async Processing"
      },
      {
        type: "p",
        text: "Not everything needs to happen immediately. When a user uploads a video, you don't transcode it synchronously. You queue it. This pattern appears in 'Design YouTube', 'Design WhatsApp', and 'Design an Email Service'."
      },
      {
        type: "code-block",
        label: "Queue-based async architecture",
        code: `# Design: Video Upload + Processing Pipeline

# Synchronous (BAD):
# User uploads 4K video → server transcodes → waits 5 minutes → responds
# Problem: HTTP timeout, server blocked, terrible UX

# Asynchronous (GOOD):
# 1. User uploads video → API returns immediately: "Processing"
# 2. API writes job to message queue (RabbitMQ, SQS, Kafka)
# 3. Worker nodes pick up jobs, transcode in background
# 4. WebSocket/SSE notifies user when done

# Queue choice interview guide:
# - RabbitMQ: Complex routing, guaranteed delivery
# - Kafka: High throughput, event sourcing, replay capability
# - SQS: Managed, simple, AWS ecosystem
# - Redis Streams: Simple, already have Redis for cache

# Key concepts to mention:
# - Idempotency: same job twice = same result (prevent double-charge)
# - Dead Letter Queue: failed jobs go here for inspection
# - Back-pressure: queue full → slow down producers, not crash
# - At-least-once vs exactly-once delivery semantics`
      },
      {
        type: "h2",
        text: "Pattern 4: Rate Limiting"
      },
      {
        type: "p",
        text: "'Design a rate limiter' is a classic interview question. It tests your understanding of distributed systems, consistency, and trade-offs."
      },
      {
        type: "code-block",
        label: "Rate limiting algorithms",
        code: `# Algorithm 1: Token Bucket (most common)
# - Bucket holds N tokens, refills at rate R per second
# - Request consumes 1 token; if empty, reject
# - Pros: Allows bursts, smooth average rate
# - Cons: Needs memory per user (Redis)

# Algorithm 2: Sliding Window Log
# - Store timestamps of each request in sorted set
# - Count requests in last window (e.g., last 60 seconds)
# - Pros: Precise, no burst allowance
# - Cons: More memory (store every timestamp)

# Algorithm 3: Fixed Window (simplest, less accurate)
# - Count requests in current minute/hour
# - Reset counter at window boundary
# - Pros: Simple, low memory
# - Cons: Burst at window boundary (2x limit in 1 second)

# Distributed rate limiting:
# - Single Redis node: single point of failure
# - Redis Cluster: consistency issues between shards
# - Solution: Sticky sessions (same user → same rate limiter)
#   or eventual consistency with small over-limit tolerance`
      },
      {
        type: "h2",
        text: "Pattern 5: CDN + Edge Caching"
      },
      {
        type: "p",
        text: "When the interviewer says 'global scale' or 'users in India, US, and Europe', you need a CDN. This pattern appears in 'Design Netflix', 'Design a News Feed', and 'Design an E-commerce Site'."
      },
      {
        type: "code-block",
        label: "Multi-region architecture with CDN",
        code: `# Design: Global Video Streaming (Netflix-like)

# Without CDN (terrible):
# User in Mumbai → requests video → server in Virginia → 250ms latency
# Video stutters, user rage-quits

# With CDN (smooth):
# 1. Static assets (images, CSS, JS) → CloudFront/Cloudflare CDN
#    - Cached at edge locations: Mumbai, Singapore, London
#    - 95% reduction in origin server load
#
# 2. Video content → Dedicated CDN (Akamai, Fastly, AWS CloudFront)
#    - Adaptive bitrate: 240p on slow connection, 4K on fast
#    - Pre-position popular content at edge during off-peak
#
# 3. Dynamic API (recommendations, user data) → Origin servers
#    - Can't cache (personalized), but keep API lightweight
#    - GraphQL to fetch exactly what's needed
#
# Interview talking points:
# - Cache invalidation: TTL vs active purge
# - Stale-while-revalidate: serve old version, fetch new in background
# - Geo-routing: DNS routes to nearest healthy region
# - Failover: if Mumbai edge fails, route to Singapore`
      },
      {
        type: "h2",
        text: "The 'Design Twitter' Walkthrough"
      },
      {
        type: "p",
        text: "Let's apply all 5 patterns to the most common interview question. This is your template for any social media / feed-based system."
      },
      {
        type: "steps",
        items: [
          {
            num: "1",
            title: "Requirements",
            text: "Functional: post tweet, follow user, view timeline. Non-functional: 100M DAU, 500M tweets/day, <200ms timeline load."
          },
          {
            num: "2",
            title: "High-Level Design",
            text: "Load balancer → API Gateway → Tweet Service / Timeline Service / User Service → Cache layer → Sharded DB."
          },
          {
            num: "3",
            title: "Pattern 1: Load Balancer + Cache",
            text: "Redis caches user profiles and hot tweets. Timeline Service checks cache first. 95% hit rate expected."
          },
          {
            num: "4",
            title: "Pattern 2: Database Sharding",
            text: "Tweets table: shard by tweet_id (even distribution). User table: shard by user_id. Directory-based for flexibility."
          },
          {
            num: "5",
            title: "Pattern 3: Message Queue",
            text: "When user posts tweet, push to Kafka. Timeline workers fan out to followers' timelines asynchronously."
          },
          {
            num: "6",
            title: "Pattern 4: Rate Limiting",
            text: "Token bucket per user: 100 tweets/hour, 1000 follows/day. Prevents spam and abuse."
          },
          {
            num: "7",
            title: "Pattern 5: CDN + Edge",
            text: "Images and videos to CloudFront. Static assets cached globally. API responses use stale-while-revalidate."
          }
        ]
      },
      {
        type: "h2",
        text: "Common Pitfalls That Fail Interviews"
      },
      {
        type: "mistakes",
        items: [
          { title: "Starting with microservices", text: "'I'll use Kubernetes with 50 microservices' for a system that needs 2 servers. Start monolith, split when you have a reason." },
          { title: "Ignoring the read/write ratio", text: "Twitter is 1000:1 read:write. Optimize for reads (cache, CDN). Don't design a write-optimized system for a read-heavy workload." },
          { title: "No failure handling", text: "What happens when Redis dies? When a shard is full? When the queue backs up? Always discuss failure modes." },
          { title: "Over-engineering early", text: "Don't mention Cassandra, Kubernetes, and Kafka for a system with 1000 users. Show you can start simple and evolve." },
          { title: "Forgetting consistency", text: "If a user deletes a tweet, when does it disappear from followers' timelines? Eventual consistency vs strong consistency matters." },
        ]
      },
      {
        type: "h2",
        text: "Quick Reference — Which Pattern for Which Question"
      },
      {
        type: "version-guide",
        items: [
          { version: "URL Shortener", points: ["Pattern 1 (Cache hot URLs)", "Pattern 2 (Shard by hash)", "Pattern 4 (Rate limit creation)"] },
          { version: "Twitter / Feed", points: ["All 5 patterns", "Fan-out via message queue", "CDN for media", "Sharding for scale"] },
          { version: "Chat / WhatsApp", points: ["Pattern 3 (Queue messages)", "Pattern 1 (Cache recent chats)", "WebSocket for real-time delivery"] },
          { version: "E-commerce", points: ["Pattern 5 (CDN for product images)", "Pattern 4 (Rate limit checkout)", "Pattern 2 (Shard orders by region)"] },
          { version: "Video Streaming", points: ["Pattern 5 (CDN is everything)", "Pattern 3 (Queue transcoding)", "Adaptive bitrate encoding"] },
        ]
      },
      {
        type: "h2",
        text: "The Bottom Line"
      },
      {
        type: "p",
        text: "System design interviews aren't about knowing every technology. They're about recognizing patterns, understanding trade-offs, and communicating clearly under pressure. Master these 5 patterns, practice the 45-minute structure, and you'll outperform candidates who memorized entire books but can't think on their feet."
      },
      {
        type: "p",
        text: "Start with 'Design Twitter' — draw it on paper, time yourself, record yourself explaining it. Then move to URL shortener, chat app, and e-commerce. By your fifth practice round, you'll sound like someone who's built these systems before."
      }
    ]
  },
  {
    slug: "ai-coding-assistants-2026",
    title: "AI Coding Assistants in 2026: How to Use Them Without Becoming Replaceable",
    date: "May 20, 2026",
    readTime: "10 min read",
    category: "Career",
    categoryColor: "#c084fc",
    excerpt: "Every student uses Cursor, Copilot, or Claude Code. But interviewers are asking: 'How do you know this code is correct?' Here's the framework for using AI without letting it use you.",
    coverEmoji: "🤖",
    tags: ["AI", "Career", "Developer", "Productivity"],
    content: [
      {
        type: "intro",
        text: "In 2024, using AI for coding was a competitive advantage. In 2026, it's table stakes. The question is no longer whether you use AI — it's whether you can survive without it. Companies are starting to filter candidates who can't explain their own code, debug without autocomplete, or spot when AI hallucinates an API that doesn't exist. This guide gives you the framework to use AI as a multiplier, not a crutch."
      },
      {
        type: "h2",
        text: "The AI Tools Landscape in 2026"
      },
      {
        type: "p",
        text: "Before we talk strategy, know your tools. Each has strengths, blind spots, and ideal use cases."
      },
      {
        type: "versions-table",
        rows: [
          { version: "GitHub Copilot", released: "2021", status: "Mature", highlight: "Best for autocomplete, inline suggestions, boilerplate" },
          { version: "Cursor", released: "2023", status: "Popular", highlight: "Best for refactoring, codebase-wide changes, AI chat" },
          { version: "Claude Code", released: "2024", status: "Growing", highlight: "Best for complex reasoning, debugging, multi-file tasks" },
          { version: "Windsurf", released: "2024", status: "New", highlight: "Best for agentic workflows, autonomous task completion" },
          { version: "Gemini Code Assist", released: "2024", status: "Enterprise", highlight: "Best for large orgs, security compliance, Google Cloud" },
        ]
      },
      {
        type: "h2",
        text: "The Golden Rule: AI for Boilerplate, You for Logic"
      },
      {
        type: "p",
        text: "The developers who get replaced are the ones who let AI think for them. The developers who get promoted use AI to execute faster while keeping ownership of decisions. Here's the framework."
      },
      {
        type: "do-dont",
        items: [
          { do: "Use AI to generate repetitive boilerplate (API routes, tests, CRUD)", dont: "Let AI architect your database schema without understanding normalization" },
          { do: "Ask AI to explain complex code you inherited", dont: "Accept AI explanations without verifying against documentation" },
          { do: "Use AI for rubber-duck debugging — explain the problem, get suggestions", dont: "Copy-paste AI fixes without reading or testing them" },
          { do: "Generate test cases with AI, then add edge cases yourself", dont: "Ship AI-generated tests without running them — they often have false positives" },
          { do: "Use AI to learn new patterns: 'Explain dependency injection with examples'", dont: "Use AI to skip learning fundamentals — you can't prompt what you don't understand" },
        ]
      },
      {
        type: "h2",
        text: "How AI Hallucinates — And How to Catch It"
      },
      {
        type: "p",
        text: "AI doesn't know what's true. It predicts what words are likely to appear together. This leads to confident, plausible-sounding nonsense. Here's how to spot it before it reaches production."
      },
      {
        type: "code-compare",
        label: "AI hallucination example — fake API",
        before: { version: "AI-generated (WRONG)", code: `# AI confidently suggests this React hook:
import { useAuth } from '@company/auth';  # ❌ Doesn't exist

function Dashboard() {
  const { user, permissions } = useAuth();  # ❌ Returns different shape
  
  # AI suggests this permission check:
  if (permissions.includes('admin')) {     # ❌ Method doesn't exist
    return <AdminPanel />
  }
}` },
        after: { version: "Human-verified (CORRECT)", code: `# Check the actual auth module first:
import { useAuth } from '../hooks/useAuth';  # ✅ Correct import path

function Dashboard() {
  const { user, isAdmin } = useAuth();      # ✅ Correct destructuring
  
  # Verify the actual API:
  if (isAdmin === true) {                   # ✅ Boolean check, not array method
    return <AdminPanel />
  }
}` }
      },
      {
        type: "code-compare",
        label: "AI over-engineering example",
        before: { version: "AI-generated (OVER-ENGINEERED)", code: `# AI suggests microservices for a todo app:
# - Kubernetes cluster with 5 services
# - Kafka for event streaming between services
# - GraphQL federation layer
# - Distributed tracing with Jaeger
#
# Reality: This is a todo app with 3 users.` },
        after: { version: "Human-corrected (APPROPRIATE)", code: `# Start simple, evolve when needed:
# - Single Next.js app with API routes
# - SQLite database (upgrade to PostgreSQL at 1000 users)
# - Deploy to Vercel or Railway
# - Add Redis caching when latency becomes an issue
#
# Principle: Complexity is a liability, not a virtue.` }
      },
      {
        type: "h2",
        text: "The 3 Skills That Make You Irreplaceable in 2026"
      },
      {
        type: "p",
        text: "AI can generate code. It cannot replace these three human capabilities. Double down on them."
      },
      {
        type: "sections-list",
        items: [
          {
            title: "1. Debugging Without AI",
            desc: "When production is down at 2 AM, AI won't help. You need to read stack traces, use gdb/lldb, analyze core dumps, and reason about race conditions. Practice debugging legacy code without autocomplete."
          },
          {
            title: "2. Code Review",
            desc: "AI generates code; humans review it. The ability to spot security flaws, performance bottlenecks, and maintainability issues in others' code is a senior-level skill that AI can't replicate."
          },
          {
            title: "3. System Thinking",
            desc: "AI writes functions. Humans design systems. Understanding how services interact, where data flows, what fails first under load, and how to evolve architecture — this is strategic thinking, not code generation."
          }
        ]
      },
      {
        type: "h2",
        text: "Prompt Engineering for Developers — The Real Patterns"
      },
      {
        type: "p",
        text: "Bad prompts get bad code. Good prompts get good code that you still need to verify. Here are the patterns that actually work for software engineering tasks."
      },
      {
        type: "code-block",
        label: "Effective prompts for coding tasks",
        code: `# ❌ BAD PROMPT:
# "Write a login system"
# → Generic, bloated, probably insecure

# ✅ GOOD PROMPT:
# "Write a JWT-based login endpoint in Express.js with:
# - Input validation using zod
# - Password hashing with bcrypt (cost factor 12)
# - Rate limiting: 5 attempts per IP per minute
# - Error handling that doesn't leak stack traces
# - Follow OWASP authentication cheat sheet guidelines
# - Include unit tests for happy path and edge cases"

# The difference: constraints, standards, and context
# AI works best with guardrails, not open-ended requests`
      },
      {
        type: "code-block",
        label: "Context-rich prompts for legacy code",
        code: `# ❌ BAD PROMPT:
# "Fix this function" [pastes 500 lines]
# → AI misses dependencies, breaks other things

# ✅ GOOD PROMPT:
# "This function in src/payments/process.js is failing
# with 'Cannot read property of undefined' at line 147.
# 
# Related files:
# - src/payments/validate.js (input validation)
# - src/db/transactions.js (database layer)
# - src/config/fees.js (fee calculation rules)
# 
# The error occurs when processing international transactions
# where fee.currency is null. Fix the null handling without
# breaking domestic transactions. Include a test case."

# The difference: error context, related files,
# specific scenario, and constraints`
      },
      {
        type: "h2",
        text: "The 'AI Parrot' Test — Are You One?"
      },
      {
        type: "p",
        text: "Interviewers are adapting. Here are the questions that separate AI-dependent developers from capable engineers. Can you answer these without looking at your IDE?"
      },
      {
        type: "checklist",
        items: [
          "Explain the time and space complexity of your solution in Big-O notation",
          "Walk through your code line-by-line and explain why you chose each data structure",
          "Identify three edge cases your code doesn't handle and how you'd fix them",
          "Explain the trade-off between your approach and an alternative (e.g., array vs linked list)",
          "Debug a piece of code with a subtle bug — without running it",
          "Refactor your solution to use 50% less memory — what's the trade-off?",
          "Explain how your code behaves under concurrent access (race conditions, deadlocks)",
        ]
      },
      {
        type: "h2",
        text: "Building an AI-Proof Career"
      },
      {
        type: "p",
        text: "The developers who thrive in the AI era aren't the ones who avoid AI — they're the ones who use it strategically while building skills AI can't replicate."
      },
      {
        type: "steps",
        items: [
          {
            num: "1",
            title: "Master one domain deeply",
            text: "AI is broad. You need to be deep. Pick one area (distributed systems, security, performance, ML infrastructure) and know it better than any generalist tool."
          },
          {
            num: "2",
            title: "Build things end-to-end",
            text: "Deploy a full-stack app, handle production incidents, optimize database queries under load. Theory without scars is forgettable."
          },
          {
            num: "3",
            title: "Contribute to open source",
            text: "Real code review from real maintainers. You'll learn standards, collaboration, and how to accept feedback — none of which AI can teach you."
          },
          {
            num: "4",
            title: "Teach what you learn",
            text: "Write blog posts, mentor juniors, give tech talks. Teaching forces clarity. If you can't explain it simply, you don't understand it — and AI certainly doesn't either."
          },
          {
            num: "5",
            title: "Stay skeptical",
            text: "Every AI suggestion is a hypothesis, not a fact. Verify, test, and question. The best engineers are professionally paranoid."
          }
        ]
      },
      {
        type: "h2",
        text: "The Bottom Line"
      },
      {
        type: "p",
        text: "AI coding assistants are the most powerful productivity tool since the IDE itself. But they're a multiplier of your skills, not a replacement. A 10x developer with AI becomes 50x. A 0x developer with AI becomes dangerous."
      },
      {
        type: "p",
        text: "The framework is simple: use AI for speed, not for thinking. Generate boilerplate, not architecture. Ask for explanations, not answers. Verify everything, trust nothing. Build the three irreplaceable skills — debugging, code review, and system thinking — and you'll outlast every AI hype cycle."
      },
      {
        type: "p",
        text: "The future belongs to developers who can write great code with AI and great code without it. Be both."
      }
    ]
  }
];

// ── Blog Components ───────────────────────────────────────────
function renderContent(block, i, theme) {
  const isDark = theme === "dark";
  const text = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.8)";
  const muted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const ac = "#0891b2";
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
  const ac = "#0891b2";

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
  const ac = "#0891b2";

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
