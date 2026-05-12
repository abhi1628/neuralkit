import React, { useState, useRef } from "react";
import confetti from "canvas-confetti";

const GROQ_API_URL = "/api/ai";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

function trackEvent(n, p = {}) { if (window.gtag) window.gtag("event", n, p); }

function fireConfetti() {
  const colors = ["#00ffe0", "#a78bfa", "#ffffff", "#00aaff"];
  const defaults = { spread: 360, ticks: 100, gravity: 0.8, decay: 0.94, startVelocity: 20, colors };
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({ ...defaults, particleCount: 4, origin: { x: Math.random() * 0.3 + 0.35, y: Math.random() * 0.3 + 0.3 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// ═════════════════════════════════════════════════════════════
// CHALLENGE QUESTIONS - COMPLETE VERSION
// ═════════════════════════════════════════════════════════════

const CHALLENGE_QUESTIONS = {
  python: {
    easy: {
      mcqs: [
        {
          question: "What is the output of: print(2 ** 3 ** 2)?",
          options: ["A) 64", "B) 512", "C) 36", "D) 72"],
          answer: "B",
          explanation: "Exponentiation is RIGHT-associative: 3**2=9, then 2**9=512."
        },
        {
          question: "What does this print? x = [1, 2, 3]; y = x; y += [4]; print(x)",
          options: ["A) [1, 2, 3]", "B) [1, 2, 3, 4]", "C) Error", "D) None"],
          answer: "B",
          explanation: "y += [4] modifies the list IN-PLACE, so x also shows [1,2,3,4]."
        },
        {
          question: "What is the output of: print([] == [] and [] is [])?",
          options: ["A) True", "B) False", "C) Error", "D) None"],
          answer: "B",
          explanation: "[] == [] is True, but [] is [] is False (different objects)."
        },
        {
          question: "What prints? def f(x=[]): x.append(1); return x; print(f()); print(f())",
          options: ["A) [1] [1]", "B) [1] [1, 1]", "C) Error", "D) [1, 1] [1, 1, 1]"],
          answer: "B",
          explanation: "Mutable default argument trap! The list is created once, not each call."
        },
        {
          question: "What is the output? print(0.1 + 0.2 == 0.3)",
          options: ["A) True", "B) False", "C) Error", "D) Depends"],
          answer: "B",
          explanation: "Floating-point: 0.1+0.2=0.30000000000000004, not exactly 0.3."
        },
        {
          question: "What does this print? print(type(()) is tuple)",
          options: ["A) True", "B) False", "C) <class 'tuple'>", "D) Error"],
          answer: "A",
          explanation: "() creates an empty tuple. type(()) returns tuple class."
        },
        {
          question: "What is the output? print(bool('False'))",
          options: ["A) False", "B) True", "C) Error", "D) 'False'"],
          answer: "B",
          explanation: "Any non-empty string is truthy in Python. 'False' has characters, so True."
        },
        {
          question: "What does this print? print(5 > 3 > 2)",
          options: ["A) True", "B) False", "C) Error", "D) SyntaxError"],
          answer: "A",
          explanation: "Chained comparisons: (5 > 3) and (3 > 2) = True."
        },
        {
          question: "What is the output? print('hello'[::-1][::-1] is 'hello')",
          options: ["A) True", "B) False", "C) 'hello'", "D) Error"],
          answer: "B",
          explanation: "Slicing creates NEW string objects. 'is' checks identity, not equality."
        },
        {
          question: "What prints? a = [1, 2, 3]; print(a[3:])",
          options: ["A) [3]", "B) []", "C) IndexError", "D) None"],
          answer: "B",
          explanation: "Slicing never raises IndexError. a[3:] returns empty list []."
        }
      ],
      coding: [
        {
          title: "Fix the Mutable Default Trap",
          description: "Fix the function so it returns a NEW list [1] every time.",
          starter: `def f(x=None):
    if x is None:
        x = []
    x.append(1)
    return x

print(f())
print(f())
print(f())`,
          testCases: [{ input: "Call f() 3 times", expected: "[1] [1] [1]" }],
          validator: (output) => {
            const lines = output.trim().split('\n');
            return lines.length >= 3 && lines.every(l => l.includes('[1]'));
          }
        }
      ]
    },
    medium: {
      mcqs: [
        {
          question: "What is the output of: print((lambda x: x(x))(lambda y: y))?",
          options: ["A) <function>", "B) Error", "C) Infinite recursion", "D) None"],
          answer: "C",
          explanation: "Y-combinator-like self-application causes infinite recursion."
        },
        {
          question: "What does this print? d = {'a': 1, 'b': 2}; print(d.get('c', d['a'] + d['b']))",
          options: ["A) None", "B) 3", "C) KeyError", "D) {'a': 1}"],
          answer: "B",
          explanation: "d.get('c', default) returns default when key missing. Default = 1+2=3."
        },
        {
          question: "What is the output? class A: pass; print(A() == A()); print(A() is A())",
          options: ["A) True True", "B) False False", "C) True False", "D) False True"],
          answer: "B",
          explanation: "Different instances. Default __eq__ checks identity, so both False."
        },
        {
          question: "What prints? print([i for i in range(10) if i % 2 == 0 if i % 3 == 0])",
          options: ["A) [0, 6]", "B) [0, 2, 4, 6, 8]", "C) [0, 3, 6, 9]", "D) [6]"],
          answer: "A",
          explanation: "Multiple 'if' conditions are ANDed together. Multiples of 6 in range(10): 0,6."
        },
        {
          question: "What is the output? import copy; a = [[1], [2]]; b = copy.copy(a); b[0].append(3); print(a)",
          options: ["A) [[1], [2]]", "B) [[1, 3], [2]]", "C) [[1], [2], [3]]", "D) Error"],
          answer: "B",
          explanation: "Shallow copy! b[0] and a[0] point to the SAME inner list."
        },
        {
          question: "What does this print? print(sum([[1, 2], [3, 4]], []))",
          options: ["A) 10", "B) [1, 2, 3, 4]", "C) [[1, 2], [3, 4]]", "D) Error"],
          answer: "B",
          explanation: "sum(iterable, []) concatenates lists: [1,2]+[3,4]=[1,2,3,4]"
        },
        {
          question: "What is the output? x = {1, 2, 3}; x.add((4, 5)); print(len(x))",
          options: ["A) 4", "B) 5", "C) Error", "D) 3"],
          answer: "A",
          explanation: "Sets can contain tuples (immutable). Set has {1,2,3,(4,5)} → length 4."
        },
        {
          question: "What prints? def outer(): x = 1; def inner(): nonlocal x; x = 2; inner(); return x; print(outer())",
          options: ["A) 1", "B) 2", "C) UnboundLocalError", "D) None"],
          answer: "B",
          explanation: "'nonlocal x' modifies x in the enclosing scope. Returns 2."
        },
        {
          question: "What does this print? print({True: 'yes', 1: 'no', 1.0: 'maybe'})",
          options: ["A) {True: 'yes', 1: 'no', 1.0: 'maybe'}", "B) {True: 'maybe'}", "C) {1: 'maybe'}", "D) Error"],
          answer: "B",
          explanation: "True == 1 == 1.0, all hash to same value. Last value wins."
        },
        {
          question: "What is the output? def f(): return; print(f())",
          options: ["A) None", "B) 0", "C) Error", "D) ''"],
          answer: "A",
          explanation: "Functions without return statement return None."
        }
      ],
      coding: [
        {
          title: "LRU Cache Decorator",
          description: "Implement an LRU cache decorator that caches function results.",
          starter: `from collections import OrderedDict

def lru_cache(maxsize=128):
    def decorator(func):
        cache = OrderedDict()
        def wrapper(*args):
            if args in cache:
                cache.move_to_end(args)
                return cache[args]
            result = func(*args)
            cache[args] = result
            if len(cache) > maxsize:
                cache.popitem(last=False)
            return result
        return wrapper
    return decorator

@lru_cache(maxsize=3)
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

print(fib(10))
print(fib(15))`,
          testCases: [{ input: "fib(10)", expected: "55" }, { input: "fib(15)", expected: "610" }],
          validator: (output) => output.includes('55') && output.includes('610')
        }
      ]
    }
  },
  javascript: {
    easy: {
      mcqs: [
        {
          question: "What is the output? console.log(typeof []);",
          options: ["A) array", "B) object", "C) Array", "D) undefined"],
          answer: "B",
          explanation: "Arrays are objects in JavaScript. typeof [] returns 'object'."
        },
        {
          question: "What does this print? console.log(0.1 + 0.2 === 0.3);",
          options: ["A) true", "B) false", "C) Error", "D) NaN"],
          answer: "B",
          explanation: "IEEE 754 precision: 0.1+0.2=0.30000000000000004"
        },
        {
          question: "What is the output? console.log('5' - 3);",
          options: ["A) '53'", "B) 2", "C) NaN", "D) '2'"],
          answer: "B",
          explanation: "Subtraction triggers numeric conversion. '5'→5, 5-3=2."
        },
        {
          question: "What does this print? console.log(1 + '2' + 3);",
          options: ["A) 6", "B) '123'", "C) '15'", "D) NaN"],
          answer: "B",
          explanation: "Left to right: '12' + 3 = '123'. Once a string appears, + becomes concatenation."
        },
        {
          question: "What is the output? console.log([] == ![]);",
          options: ["A) true", "B) false", "C) Error", "D) NaN"],
          answer: "A",
          explanation: "![] = false. [] -> '' -> 0, false -> 0. 0==0 = true."
        },
        {
          question: "What does this print? console.log(typeof NaN);",
          options: ["A) NaN", "B) number", "C) undefined", "D) 'NaN'"],
          answer: "B",
          explanation: "NaN is 'Not a Number' but its type is 'number'."
        },
        {
          question: "What is the output? console.log(1 < 2 < 3); console.log(3 > 2 > 1);",
          options: ["A) true true", "B) true false", "C) false false", "D) Error"],
          answer: "B",
          explanation: "Left-to-right: true < 3 → 1 < 3 = true. 3>2=true, true>1 → 1>1 = false."
        },
        {
          question: "What does this print? console.log([] + []);",
          options: ["A) '[]'", "B) ''", "C) []", "D) undefined"],
          answer: "B",
          explanation: "[] converts to empty string. '' + '' = ''."
        },
        {
          question: "What is the output? console.log(typeof (() => {}));",
          options: ["A) function", "B) object", "C) arrow", "D) undefined"],
          answer: "A",
          explanation: "All functions (including arrow functions) have typeof 'function'."
        },
        {
          question: "What does this print? console.log(0 == '0'); console.log(0 === '0');",
          options: ["A) true true", "B) true false", "C) false false", "D) Error"],
          answer: "B",
          explanation: "== does type coercion (true), === checks type AND value (false)."
        }
      ],
      coding: [
        {
          title: "Fix the Closure Trap",
          description: "Fix the loop so each button alerts its own index.",
          starter: `// Fix: Use let instead of var, or IIFE
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Should print 0,1,2 not 3,3,3`,
          testCases: [{ input: "Loop", expected: "0,1,2" }],
          validator: (output) => true
        }
      ]
    }
  },
  sql: {
    easy: {
      mcqs: [
        {
          question: "What does SELECT NULL = NULL return?",
          options: ["A) TRUE", "B) FALSE", "C) NULL", "D) Error"],
          answer: "C",
          explanation: "NULL represents unknown, so NULL = NULL is UNKNOWN (NULL)."
        },
        {
          question: "What is the output? SELECT COUNT(*) FROM (VALUES (1), (NULL), (3)) AS t(x);",
          options: ["A) 2", "B) 3", "C) NULL", "D) Error"],
          answer: "B",
          explanation: "COUNT(*) counts ALL rows, including NULLs."
        },
        {
          question: "What does this return? SELECT 1/2;",
          options: ["A) 0.5", "B) 0", "C) 0.50", "D) Error"],
          answer: "B",
          explanation: "Integer division in SQL! 1/2 = 0 (truncated)."
        },
        {
          question: "Is BETWEEN 20 AND 30 inclusive?",
          options: ["A) Yes", "B) No", "C) Depends", "D) Only 20"],
          answer: "A",
          explanation: "BETWEEN is INCLUSIVE on both ends."
        },
        {
          question: "What does SELECT COALESCE(NULL, NULL, 5, 10) return?",
          options: ["A) NULL", "B) 5", "C) 10", "D) Error"],
          answer: "B",
          explanation: "COALESCE returns the FIRST non-NULL value."
        },
        {
          question: "What does SELECT * FROM table1, table2 do?",
          options: ["A) Inner join", "B) Cross join", "C) Error", "D) Left join"],
          answer: "B",
          explanation: "Comma without JOIN condition creates a CROSS JOIN (Cartesian product)."
        },
        {
          question: "What happens with UPDATE users SET age = age + 1 WHERE age = NULL?",
          options: ["A) All ages incremented", "B) No rows updated", "C) Error", "D) NULL set to 1"],
          answer: "B",
          explanation: "age = NULL is always UNKNOWN, so no rows match."
        },
        {
          question: "What does SELECT GREATEST(1, NULL, 3) return?",
          options: ["A) 3", "B) 1", "C) NULL", "D) Error"],
          answer: "C",
          explanation: "GREATEST returns NULL if ANY argument is NULL."
        },
        {
          question: "What does SELECT COUNT(column) vs COUNT(*) when column has NULLs?",
          options: ["A) Same", "B) COUNT(*) larger", "C) COUNT(column) larger", "D) Depends"],
          answer: "B",
          explanation: "COUNT(*) counts all rows. COUNT(column) excludes NULLs."
        },
        {
          question: "What does SELECT * FROM A LEFT JOIN B ON A.id = B.id WHERE B.id IS NULL return?",
          options: ["A) All rows", "B) Rows in A not in B", "C) Rows in both", "D) Error"],
          answer: "B",
          explanation: "This is the 'NOT EXISTS' pattern - finds rows with no match."
        }
      ],
      coding: [
        {
          title: "Find Duplicate Emails",
          description: "Find all duplicate emails in the users table.",
          starter: `-- Find duplicate emails
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;`,
          testCases: [{ input: "Find duplicates", expected: "alice@example.com" }],
          validator: (output) => true
        }
      ]
    }
  }
};

// Add empty placeholders for other languages to avoid errors
const languages = ['c', 'cpp', 'java'];
languages.forEach(lang => {
  if (!CHALLENGE_QUESTIONS[lang]) {
    CHALLENGE_QUESTIONS[lang] = {
      easy: { mcqs: [], coding: [] },
      medium: { mcqs: [], coding: [] }
    };
  }
});

// ═════════════════════════════════════════════════════════════
// REACT COMPONENT
// ═════════════════════════════════════════════════════════════

function ChallengeSystem() {
  const [step, setStep] = useState('select');
  const [language, setLanguage] = useState('python');
  const [difficulty, setDifficulty] = useState('easy');
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [code, setCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [codeRunning, setCodeRunning] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [score, setScore] = useState({ mcq: 0, coding: 0, total: 0 });

  const langData = CHALLENGE_QUESTIONS[language];
  const currentChallenge = langData ? langData[difficulty] : null;

  function startChallenge(lang, diff) {
    setLanguage(lang);
    setDifficulty(diff);
    setMcqAnswers({});
    setMcqSubmitted(false);
    setCode('');
    setCodeOutput('');
    setScore({ mcq: 0, coding: 0, total: 0 });
    setStep('mcq');
    trackEvent('challenge_start', { language: lang, difficulty: diff });
  }

  function submitMCQs() {
    if (!currentChallenge || !currentChallenge.mcqs) return;
    let correct = 0;
    currentChallenge.mcqs.forEach((q, idx) => {
      if (mcqAnswers[idx] === q.answer) correct++;
    });
    const mcqScore = currentChallenge.mcqs.length > 0 ? Math.round((correct / currentChallenge.mcqs.length) * 100) : 100;
    setScore(s => ({ ...s, mcq: mcqScore }));
    setMcqSubmitted(true);

    if (currentChallenge.coding && currentChallenge.coding.length > 0 && currentChallenge.coding[0].starter) {
      setCode(currentChallenge.coding[0].starter);
    }

    setTimeout(() => setStep('coding'), 1500);
  }

  async function runChallengeCode() {
    if (!code.trim() || !currentChallenge || !currentChallenge.coding || currentChallenge.coding.length === 0) return;
    setCodeRunning(true);
    setCodeOutput('');
    setCodeError(false);

    const problem = currentChallenge.coding[0];

    try {
      if (language === 'sql') {
        if (!window.initSqlJs) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js");
        }
        const SQL = await window.initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}` });
        const db = new SQL.Database();
        const statements = code.split(";").map(s => s.trim()).filter(s => s.length > 0);
        let result = "";
        for (const stmt of statements) {
          try {
            const res = db.exec(stmt + ";");
            if (res.length > 0) {
              const { columns, values } = res[0];
              result += columns.join(" | ") + "\n";
              result += values.map(row => row.join(" | ")).join("\n") + "\n";
            }
          } catch (e) { result += `Error: ${e.message}\n`; }
        }
        setCodeOutput(result || "Query executed");
        const passed = problem.validator ? problem.validator(result) : true;
        const codingScore = passed ? 100 : 30;
        setScore(s => ({ ...s, coding: codingScore, total: Math.round((s.mcq + codingScore) / 2) }));
      } else {
        const compilerMap = {
          python: 'python-3.14',
          javascript: 'typescript-deno',
          c: 'gcc-15',
          cpp: 'g++-15',
          java: 'openjdk-25'
        };
        const compiler = compilerMap[language];
        if (!compiler) {
          setCodeOutput(`Code execution for ${language} coming soon!`);
          setCodeError(false);
          const codingScore = 100;
          setScore(s => ({ ...s, coding: codingScore, total: Math.round((s.mcq + codingScore) / 2) }));
        } else {
          const res = await fetch("/api/run-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ compiler, code, input: "" })
          });
          const data = await res.json();
          const out = data?.output || "";
          const err = data?.error || data?.message || "";
          if (err.trim()) {
            setCodeOutput(err.trim());
            setCodeError(true);
            setScore(s => ({ ...s, coding: 0, total: Math.round(s.mcq / 2) }));
          } else {
            setCodeOutput(out.trim() || "(No output)");
            const passed = problem.validator ? problem.validator(out) : true;
            const codingScore = passed ? 100 : 30;
            setScore(s => ({ ...s, coding: codingScore, total: Math.round((s.mcq + codingScore) / 2) }));
          }
        }
      }
    } catch (e) {
      setCodeOutput("Error: " + e.message);
      setCodeError(true);
    }
    setCodeRunning(false);
  }

  function finishChallenge() {
    setStep('result');
    trackEvent('challenge_complete', { language, difficulty, score: score.total });
    if (score.total >= 70) fireConfetti();
  }

  function resetChallenge() {
    setStep('select');
  }

  // Language selector
  if (step === 'select') {
    const availableLanguages = [
      { id: 'python', icon: '🐍', name: 'Python', desc: 'Data structures, algorithms' },
      { id: 'javascript', icon: '🌐', name: 'JavaScript', desc: 'ES6+, closures, async' },
      { id: 'sql', icon: '🗄️', name: 'SQL', desc: 'Queries, joins, aggregation' }
    ];

    return (
      <section id="challenges" style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>◆ Coding Challenges</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}>Test Your Skills</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginTop: "14px", fontSize: "1rem" }}>10 MCQs + coding problems · Auto-graded</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {availableLanguages.map(lang => (
            <div key={lang.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px", transition: "all 0.3s", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,224,0.3)"; e.currentTarget.style.background = "rgba(0,255,224,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{lang.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "6px", color: "#fff" }}>{lang.name}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>{lang.desc}</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => startChallenge(lang.id, 'easy')} style={{ flex: 1, background: "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "8px", padding: "10px", color: "#00ffe0", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", cursor: "pointer", fontWeight: 700 }}>
                  Easy
                </button>
                {lang.id !== 'sql' && (
                  <button onClick={() => startChallenge(lang.id, 'medium')} style={{ flex: 1, background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: "8px", padding: "10px", color: "#febc2e", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", cursor: "pointer", fontWeight: 700 }}>
                    Medium
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // MCQ Section
  if (step === 'mcq' && currentChallenge && currentChallenge.mcqs && currentChallenge.mcqs.length > 0) {
    return (
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ marginBottom: "32px" }}>
          <button onClick={resetChallenge} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", marginBottom: "20px" }}>← Back to Languages</button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase" }}>◆ {language.toUpperCase()} · {difficulty.toUpperCase()}</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.8rem", fontWeight: 800, marginTop: "8px" }}>Multiple Choice Questions</h2>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>Score 70%+ to unlock coding challenge</div>
        </div>

        {currentChallenge.mcqs.map((q, idx) => (
          <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#00ffe0", marginBottom: "12px" }}>QUESTION {idx + 1} / {currentChallenge.mcqs.length}</div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "16px", lineHeight: 1.5 }}>{q.question}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {q.options.map(opt => {
                const isSelected = mcqAnswers[idx] === opt[0];
                const showCorrect = mcqSubmitted && opt[0] === q.answer;
                const showWrong = mcqSubmitted && isSelected && opt[0] !== q.answer;
                let bg = "rgba(255,255,255,0.04)";
                let border = "1px solid rgba(255,255,255,0.08)";
                let color = "rgba(255,255,255,0.8)";
                if (showCorrect) { bg = "rgba(0,255,224,0.12)"; border = "1px solid #00ffe0"; color = "#00ffe0"; }
                else if (showWrong) { bg = "rgba(255,80,80,0.1)"; border = "1px solid #ff6b6b"; color = "#ff6b6b"; }
                else if (isSelected && !mcqSubmitted) { bg = "rgba(0,255,224,0.08)"; border = "1px solid rgba(0,255,224,0.3)"; }
                return (
                  <button key={opt} onClick={() => !mcqSubmitted && setMcqAnswers({...mcqAnswers, [idx]: opt[0]})}
                    style={{ background: bg, border, borderRadius: "10px", padding: "12px 16px", color, fontSize: "0.85rem", cursor: mcqSubmitted ? "default" : "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {mcqSubmitted && (
              <div style={{ marginTop: "12px", padding: "12px", background: "rgba(0,255,224,0.04)", borderRadius: "8px", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        ))}

        {!mcqSubmitted ? (
          <button onClick={submitMCQs} disabled={Object.keys(mcqAnswers).length < currentChallenge.mcqs.length}
            style={{ width: "100%", background: Object.keys(mcqAnswers).length < currentChallenge.mcqs.length ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "12px", padding: "16px", color: Object.keys(mcqAnswers).length < currentChallenge.mcqs.length ? "rgba(255,255,255,0.3)" : "#000", fontWeight: 700, fontSize: "0.9rem", cursor: Object.keys(mcqAnswers).length < currentChallenge.mcqs.length ? "not-allowed" : "pointer", fontFamily: "'Space Mono', monospace" }}>
            Submit Answers →
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", background: "rgba(0,255,224,0.06)", borderRadius: "12px", border: "1px solid rgba(0,255,224,0.2)" }}>
            <div style={{ color: "#00ffe0", fontSize: "1.1rem", fontWeight: 700 }}>MCQ Score: {score.mcq}%</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "8px" }}>Moving to coding challenge...</div>
          </div>
        )}
      </section>
    );
  }

  // Coding Section
  if (step === 'coding' && currentChallenge && currentChallenge.coding && currentChallenge.coding.length > 0) {
    const problem = currentChallenge.coding[0];
    return (
      <section style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <button onClick={resetChallenge} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", marginBottom: "20px" }}>← Back to Languages</button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase" }}>◆ CODING PROBLEM</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, marginTop: "8px" }}>{problem.title}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#00ffe0", marginBottom: "12px", letterSpacing: "0.1em" }}>DESCRIPTION</div>
            <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{problem.description}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{language.toUpperCase()} Editor</span>
              <button onClick={() => setCode(problem.starter)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 12px", color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>Reset</button>
            </div>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={16}
              style={{ width: "100%", background: "#0d1117", border: "none", padding: "16px", color: "#e6edf3", fontFamily: "'Space Mono', monospace", fontSize: "0.82rem", lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button onClick={runChallengeCode} disabled={codeRunning}
            style={{ background: codeRunning ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "10px", padding: "12px 28px", color: codeRunning ? "rgba(255,255,255,0.3)" : "#000", fontWeight: 700, fontSize: "0.85rem", cursor: codeRunning ? "not-allowed" : "pointer", fontFamily: "'Space Mono', monospace", display: "flex", alignItems: "center", gap: "8px" }}>
            {codeRunning ? <><span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #00ffe0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Running...</> : "▶ Run Code"}
          </button>
          <button onClick={finishChallenge}
            style={{ background: "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "10px", padding: "12px 28px", color: "#00ffe0", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
            Submit Solution →
          </button>
        </div>

        {codeOutput && (
          <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: codeError ? "#ff6b6b" : "#00ffe0", marginBottom: "10px", letterSpacing: "0.1em" }}>{codeError ? "⚠ ERROR" : "◆ OUTPUT"}</div>
            <pre style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: "0.82rem", color: codeError ? "#ff6b6b" : "rgba(255,255,255,0.85)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{codeOutput}</pre>
          </div>
        )}
      </section>
    );
  }

  // Results
  if (step === 'result') {
    const passed = score.total >= 70;
    return (
      <section style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>{passed ? "🏆" : "📊"}</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>
          {passed ? "Challenge Passed!" : "Challenge Completed"}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "32px" }}>
          {passed ? "Great job! You've demonstrated solid skills." : "Keep practicing! Review the explanations and try again."}
        </p>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "24px" }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>MCQ SCORE</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, color: score.mcq >= 70 ? "#00ffe0" : "#febc2e" }}>{score.mcq}%</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>CODING SCORE</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, color: score.coding >= 70 ? "#00ffe0" : "#febc2e" }}>{score.coding}%</div>
            </div>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>TOTAL</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.5rem", fontWeight: 800, color: passed ? "#00ffe0" : "#ff6b6b" }}>{score.total}%</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={resetChallenge} style={{ background: "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "10px", padding: "14px 28px", color: "#000", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
            Try Another Challenge →
          </button>
          <button onClick={() => { navigator.clipboard.writeText(`I scored ${score.total}% on ZeroAPI ${language.toUpperCase()} ${difficulty} challenge!`); alert('Score copied!'); }}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "14px 24px", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
            📋 Share Score
          </button>
        </div>
      </section>
    );
  }

  return null;
}

export default ChallengeSystem;
