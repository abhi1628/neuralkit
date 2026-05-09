import { useState, useEffect, useRef } from "react";

// ── Google Analytics ──────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_KEY;
const GA_ID = "G-FTQS5X9WF3";

function loadGA(id) {
  const s = document.createElement("script");
  s.id = "ga-script";
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);
}

function trackEvent(eventName, params = {}) {
  if (window.gtag) window.gtag("event", eventName, params);
}
// ─────────────────────────────────────────────────────────────

// ── Visitor Counter ───────────────────────────────────────────
async function fetchVisitorCount() {
  try {
    const res = await fetch("https://api.countapi.xyz/hit/neuralkit-abhishek/visits");
    const data = await res.json();
    return data.value;
  } catch { return null; }
}
// ─────────────────────────────────────────────────────────────

// ── Daily AI Trivia ───────────────────────────────────────────
function TriviaSection() {
  const [trivia, setTrivia] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadTrivia() {
    setLoading(true);
    setSelected(null);
    setTrivia(null);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 300,
          messages: [{
            role: "system",
            content: `Generate a single AI/tech trivia question. Respond ONLY in this exact JSON format with no extra text:
{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","fact":"one interesting sentence about the answer"}`
          }, {
            role: "user",
            content: "Give me a fresh AI trivia question about machine learning, LLMs, AI history, or famous researchers."
          }]
        }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || "";
      const json = JSON.parse(text.replace(/```json|```/g, "").trim());
      setTrivia(json);
    } catch { setTrivia({ error: true }); }
    setLoading(false);
  }

  useEffect(() => { loadTrivia(); }, []);

  const isCorrect = selected && trivia && selected.startsWith(trivia.answer);

  return (
    <section style={{
      borderTop: "1px solid rgba(255,255,255,0.05)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      padding: "60px 32px",
      background: "rgba(255,255,255,0.01)",
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.68rem",
          color: "#00ffe0",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}>◆ Daily AI Trivia</div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginBottom: "28px", fontFamily: "'Space Mono', monospace" }}>
          Test your AI knowledge — new question every time
        </p>

        {loading && (
          <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem" }}>
            <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #00ffe0", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: "10px", verticalAlign: "middle" }} />
            Generating question...
          </div>
        )}

        {trivia && !trivia.error && !loading && (
          <div>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "24px",
              lineHeight: 1.5,
            }}>{trivia.question}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {trivia.options.map((opt) => {
                const isThis = selected === opt;
                const correct = opt.startsWith(trivia.answer);
                let bg = "rgba(255,255,255,0.04)";
                let border = "1px solid rgba(255,255,255,0.08)";
                let color = "rgba(255,255,255,0.8)";
                if (selected) {
                  if (correct) { bg = "rgba(0,255,224,0.12)"; border = "1px solid #00ffe0"; color = "#00ffe0"; }
                  else if (isThis) { bg = "rgba(255,80,80,0.1)"; border = "1px solid #ff6b6b"; color = "#ff6b6b"; }
                }
                return (
                  <button key={opt} onClick={() => !selected && setSelected(opt)} style={{
                    background: bg, border, borderRadius: "10px",
                    padding: "14px 16px", color, fontSize: "0.85rem",
                    cursor: selected ? "default" : "pointer",
                    fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                    transition: "all 0.2s",
                  }}>{opt}</button>
                );
              })}
            </div>

            {selected && (
              <div style={{
                background: isCorrect ? "rgba(0,255,224,0.06)" : "rgba(255,180,0,0.06)",
                border: `1px solid ${isCorrect ? "rgba(0,255,224,0.2)" : "rgba(255,180,0,0.2)"}`,
                borderRadius: "12px", padding: "16px", marginBottom: "20px",
                fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7,
              }}>
                {isCorrect ? "✅ Correct! " : `❌ Not quite. The answer is ${trivia.answer}. `}
                {trivia.fact}
              </div>
            )}

            <button onClick={loadTrivia} style={{
              background: "rgba(0,255,224,0.08)",
              border: "1px solid rgba(0,255,224,0.2)",
              borderRadius: "10px", padding: "10px 24px",
              color: "#00ffe0", fontFamily: "'Space Mono', monospace",
              fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.05em",
            }}>↻ New Question</button>
          </div>
        )}

        {trivia?.error && !loading && (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            Couldn't load trivia. <button onClick={loadTrivia} style={{ background: "none", border: "none", color: "#00ffe0", cursor: "pointer" }}>Try again</button>
          </div>
        )}
      </div>
    </section>
  );
}

const TOOLS = [
  {
    id: "summarizer",
    icon: "⚡",
    name: "Research Summarizer",
    tagline: "Paste any paper, article, or abstract. Get instant structured insights.",
    placeholder: "Paste your research paper, abstract, or any long text here...",
    inputLabel: "Input Text",
    cta: "Summarize Now",
    systemPrompt: `You are an expert research analyst. When given text, produce a concise structured summary with these sections:
🎯 Core Idea (1-2 sentences)
🔍 Key Findings (3-5 bullet points)
💡 Practical Implications (2-3 points)
⚠️ Limitations or Gaps (1-2 points)
Be precise, technical yet accessible. Use bullet points. Keep it under 300 words.`,
  },
  {
    id: "codeExplainer",
    icon: "🧠",
    name: "Code Explainer",
    tagline: "Paste any Python, JS, or pseudocode. Get a crystal-clear breakdown.",
    placeholder: "# Paste your code snippet here...\ndef my_agent(state):\n    ...",
    inputLabel: "Code Snippet",
    cta: "Explain This Code",
    systemPrompt: `You are an expert software engineer and educator. When given a code snippet:
1. **What it does** — one sentence overview
2. **Step-by-step walkthrough** — explain each major block/function clearly
3. **Key concepts used** — list any patterns, algorithms, or libraries
4. **Gotchas or improvements** — flag any bugs, inefficiencies, or suggestions
Use markdown-style bold for section headers. Be educational but concise.`,
  },
];

function ToolCard({ tool, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? "linear-gradient(135deg, #00ffe0 0%, #0af 100%)"
          : "rgba(255,255,255,0.04)",
        border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "24px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.3s ease",
        transform: active ? "scale(1.02)" : "scale(1)",
        boxShadow: active ? "0 0 40px rgba(0,255,224,0.25)" : "none",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{tool.icon}</div>
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "1rem",
          fontWeight: 700,
          color: active ? "#000" : "#fff",
          marginBottom: "6px",
          letterSpacing: "-0.02em",
        }}
      >
        {tool.name}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: active ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.5)",
          lineHeight: 1.5,
        }}
      >
        {tool.tagline}
      </div>
    </button>
  );
}

function ToolPanel({ tool }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef(null);

  useEffect(() => {
    setInput("");
    setOutput("");
    setError("");
  }, [tool.id]);

  async function runTool() {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setError("");
    trackEvent("tool_run", { tool_name: tool.name, input_length: input.length });
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [
            { role: "system", content: tool.systemPrompt },
            { role: "user", content: input },
          ],
        }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        setOutput(data.choices[0].message.content);
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
      } else if (data?.error) {
        setError(`API Error: ${data.error.message}`);
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (e) {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  function formatOutput(text) {
    return text.split("\n").map((line, i) => {
      const isBold = line.startsWith("**") || line.match(/^[🎯🔍💡⚠️1-9]/);
      return (
        <div
          key={i}
          style={{
            marginBottom: line === "" ? "12px" : "4px",
            fontWeight: isBold ? 700 : 400,
            color: isBold ? "#00ffe0" : "rgba(255,255,255,0.85)",
            fontSize: "0.88rem",
            lineHeight: 1.7,
          }}
        >
          {line.replace(/\*\*/g, "")}
        </div>
      );
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label
          style={{
            display: "block",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.72rem",
            color: "#00ffe0",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          {tool.inputLabel}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tool.placeholder}
          rows={8}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            padding: "16px",
            color: "#fff",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.82rem",
            lineHeight: 1.7,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            transition: "border 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,224,0.4)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
        />
      </div>

      <button
        onClick={runTool}
        disabled={loading || !input.trim()}
        style={{
          background:
            loading || !input.trim()
              ? "rgba(255,255,255,0.08)"
              : "linear-gradient(135deg, #00ffe0 0%, #0af 100%)",
          border: "none",
          borderRadius: "10px",
          padding: "14px 28px",
          color: loading || !input.trim() ? "rgba(255,255,255,0.3)" : "#000",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.85rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: "center",
          boxShadow:
            !loading && input.trim() ? "0 0 24px rgba(0,255,224,0.3)" : "none",
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.2)",
                borderTop: "2px solid #00ffe0",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Analyzing...
          </>
        ) : (
          `→ ${tool.cta}`
        )}
      </button>

      {error && (
        <div
          style={{
            background: "rgba(255,80,80,0.1)",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: "10px",
            padding: "14px",
            color: "#ff6b6b",
            fontSize: "0.82rem",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {output && (
        <div
          ref={outputRef}
          style={{
            background: "rgba(0,255,224,0.04)",
            border: "1px solid rgba(0,255,224,0.15)",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.68rem",
              color: "#00ffe0",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "16px",
              opacity: 0.8,
            }}
          >
            ◆ Output
          </div>
          {formatOutput(output)}
        </div>
      )}
    </div>
  );
}

function Particle({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: "50%",
        background: "rgba(0,255,224,0.15)",
        animation: "float linear infinite",
        ...style,
      }}
    />
  );
}

function AskAuthor() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask() {
    if (!question.trim()) return;
    setLoading(true); setAnswer(""); setError("");
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 500,
          messages: [{
            role: "system",
            content: `You are Prof. Abhishek Singh, Assistant Professor of CSE at Baderia Global Institute of Engineering and Management, Jabalpur, India. You have M.Tech in Data Science and VLSI Design, and you authored "Agentic AI Systems: Design & Engineering". Answer questions about AI, Agentic Systems, LLMs, Python, research, and your book in a friendly, knowledgeable, professor-like tone. Be concise but insightful. Speak in first person as Prof. Abhishek Singh.`
          }, { role: "user", content: question }]
        }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) setAnswer(data.choices[0].message.content);
      else setError("Couldn't get a response. Please try again.");
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="e.g. What is an AI agent? How do I start with LangGraph?"
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
            padding: "12px 16px", color: "#fff", fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem", outline: "none",
          }}
          onFocus={(e) => e.target.style.borderColor = "rgba(0,255,224,0.4)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
        <button onClick={ask} disabled={loading || !question.trim()} style={{
          background: loading || !question.trim() ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0, #0af)",
          border: "none", borderRadius: "10px", padding: "12px 20px",
          color: loading || !question.trim() ? "rgba(255,255,255,0.3)" : "#000",
          fontWeight: 700, fontSize: "0.85rem", cursor: loading || !question.trim() ? "not-allowed" : "pointer",
          fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap",
        }}>
          {loading ? "..." : "Ask →"}
        </button>
      </div>
      {error && <div style={{ color: "#ff6b6b", fontSize: "0.82rem", marginBottom: "12px" }}>⚠ {error}</div>}
      {answer && (
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px", padding: "18px",
          fontSize: "0.88rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.8,
          textAlign: "left",
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#00ffe0", marginBottom: "10px", letterSpacing: "0.1em" }}>◆ PROF. ABHISHEK SINGH</div>
          {answer}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTool, setActiveTool] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => { loadGA(GA_ID); }, []);
  useEffect(() => { fetchVisitorCount().then(setVisitorCount); }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleToolSwitch(index) {
    setActiveTool(index);
    trackEvent("tool_selected", { tool_name: TOOLS[index].name });
  }

  const particles = [
    { width: 6, height: 6, left: "10%", top: "20%", animationDuration: "8s", animationDelay: "0s", opacity: 0.6 },
    { width: 4, height: 4, left: "80%", top: "30%", animationDuration: "11s", animationDelay: "2s", opacity: 0.4 },
    { width: 8, height: 8, left: "55%", top: "15%", animationDuration: "9s", animationDelay: "1s", opacity: 0.3 },
    { width: 3, height: 3, left: "30%", top: "70%", animationDuration: "14s", animationDelay: "3s", opacity: 0.5 },
    { width: 5, height: 5, left: "70%", top: "80%", animationDuration: "10s", animationDelay: "0.5s", opacity: 0.4 },
    { width: 4, height: 4, left: "20%", top: "50%", animationDuration: "13s", animationDelay: "4s", opacity: 0.3 },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060a0f",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes float {
          0% { transform: translateY(0px) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-120vh) scale(0.5); opacity: 0; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .hero-title {
          animation: fadeUp 0.9s ease forwards;
        }
        .hero-sub {
          animation: fadeUp 0.9s ease 0.2s both;
        }
        .hero-cta {
          animation: fadeUp 0.9s ease 0.4s both;
        }
        .tools-section {
          animation: fadeUp 0.9s ease 0.15s both;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #060a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,224,0.3); border-radius: 3px; }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "18px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(6,10,15,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="-80 -80 160 160" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffe0"/>
                <stop offset="100%" stopColor="#00aaff"/>
              </linearGradient>
            </defs>
            <polygon points="0,-70 61,-35 61,35 0,70 -61,35 -61,-35" fill="none" stroke="url(#lg1)" strokeWidth="3"/>
            <line x1="0" y1="-38" x2="32" y2="19" stroke="rgba(0,255,224,0.3)" strokeWidth="1.5"/>
            <line x1="0" y1="-38" x2="-32" y2="19" stroke="rgba(0,170,255,0.3)" strokeWidth="1.5"/>
            <line x1="32" y1="19" x2="-32" y2="19" stroke="rgba(0,255,224,0.25)" strokeWidth="1.5"/>
            <line x1="0" y1="-38" x2="0" y2="-70" stroke="rgba(0,255,224,0.4)" strokeWidth="1.5"/>
            <line x1="32" y1="19" x2="61" y2="35" stroke="rgba(0,170,255,0.4)" strokeWidth="1.5"/>
            <line x1="-32" y1="19" x2="-61" y2="35" stroke="rgba(0,255,224,0.4)" strokeWidth="1.5"/>
            <circle cx="0" cy="-38" r="6" fill="#00ffe0"/>
            <circle cx="32" cy="19" r="6" fill="#00aaff"/>
            <circle cx="-32" cy="19" r="6" fill="#00ffe0"/>
            <circle cx="0" cy="0" r="3" fill="rgba(0,170,255,0.7)"/>
          </svg>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "-0.02em",
            }}
          >
            NeuralKit
          </span>
        </div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {[
            { label: "Tools", action: () => document.getElementById("tools").scrollIntoView({ behavior: "smooth" }) },
            { label: "About", action: () => document.getElementById("about").scrollIntoView({ behavior: "smooth" }) },
          ].map(({ label, action }) => (
            <span
              key={label}
              onClick={action}
              style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.55)",
                cursor: "pointer",
                transition: "color 0.2s",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.target.style.color = "#fff")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.55)")}
            >
              {label}
            </span>
          ))}
          {/* YouTube icon */}
          <span
            onClick={() => window.open("https://www.youtube.com/@pyofpython9668", "_blank")}
            title="YouTube: pyofpython"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", opacity: 0.6, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="5" fill="#ff0000" opacity="0.9"/>
              <polygon points="9.5,7.5 9.5,16.5 17,12" fill="white"/>
            </svg>
          </span>
          <button
            onClick={() => document.getElementById("tools").scrollIntoView({ behavior: "smooth" })}
            style={{
              background: "linear-gradient(135deg, #00ffe0 0%, #0af 100%)",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              color: "#000",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "0.03em",
            }}
          >
            Try Free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 40px 80px",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,255,224,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,224,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,170,255,0.07) 0%, transparent 70%)",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,255,224,0.06) 0%, transparent 70%)",
            bottom: "10%",
            right: "10%",
            pointerEvents: "none",
          }}
        />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <Particle key={i} style={p} />
        ))}

        {/* Badge */}
        <div
          className="hero-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0,255,224,0.08)",
            border: "1px solid rgba(0,255,224,0.2)",
            borderRadius: "100px",
            padding: "6px 16px",
            marginBottom: "32px",
            fontSize: "0.75rem",
            fontFamily: "'Space Mono', monospace",
            color: "#00ffe0",
            letterSpacing: "0.08em",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#00ffe0",
              animation: "pulse 1.5s ease infinite",
              display: "inline-block",
            }}
          />
          FREE AI TOOLS FOR DEVELOPERS & RESEARCHERS
        </div>

        {/* Title */}
        <h1
          className="hero-title"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(3rem, 7vw, 6.5rem)",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            marginBottom: "24px",
            maxWidth: "900px",
            color: "#fff",
          }}
        >
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>Your AI </span>
          <span
            style={{
              background: "linear-gradient(135deg, #00ffe0 0%, #0af 60%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            Superpower
          </span>
          <br />
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>Starts Here</span>
        </h1>

        <p
          className="hero-sub"
          style={{
            fontSize: "1.15rem",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "560px",
            lineHeight: 1.7,
            marginBottom: "48px",
            fontWeight: 300,
          }}
        >
          Free, browser-based AI tools for developers, researchers, and engineers.
          No signup. No cost. Just intelligence at your fingertips.
        </p>

        <div
          className="hero-cta"
          style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}
        >
          <button
            onClick={() =>
              document.getElementById("tools").scrollIntoView({ behavior: "smooth" })
            }
            style={{
              background: "linear-gradient(135deg, #00ffe0 0%, #0af 100%)",
              border: "none",
              borderRadius: "12px",
              padding: "16px 36px",
              color: "#000",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              boxShadow: "0 0 40px rgba(0,255,224,0.3)",
              letterSpacing: "0.03em",
            }}
          >
            Try Tools Free →
          </button>
          <button
            onClick={() => window.open("https://news.ycombinator.com/news", "_blank")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              padding: "16px 36px",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            AI News →
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ marginTop: "56px", display: "flex", gap: "60px", whiteSpace: "nowrap", justifyContent: "center" }}>
          {[
            { n: visitorCount ? visitorCount.toLocaleString() : "...", label: "Visitors" },
            { n: "0", label: "Signup Required" },
            { n: "∞", label: "Possibilities" },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800,
                background: "linear-gradient(135deg, #00ffe0, #0af)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{n}</div>
              <div style={{
                fontSize: "0.72rem", color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "'Space Mono', monospace",
              }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS SECTION */}
      <section
        id="tools"
        className="tools-section"
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "80px 32px 120px",
        }}
      >
        {/* Section header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.7rem",
              color: "#00ffe0",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            ◆ Live AI Tools
          </div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#fff",
              WebkitTextFillColor: "#fff",
            }}
          >
            Pick a Tool. Run It. Free.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              marginTop: "14px",
              fontSize: "1rem",
              fontWeight: 300,
            }}
          >
            Powered by Groq AI &nbsp;·&nbsp; No API Key &nbsp;·&nbsp; No Subscription &nbsp;·&nbsp; Always Free
          </p>
        </div>

        {/* Tool selector */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "36px",
            flexWrap: "wrap",
          }}
        >
          {TOOLS.map((tool, i) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              active={activeTool === i}
              onClick={() => handleToolSwitch(i)}
            />
          ))}
        </div>

        {/* Tool panel */}
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "36px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "28px",
              paddingBottom: "20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{TOOLS[activeTool].icon}</span>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                {TOOLS[activeTool].name}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.45)",
                  marginTop: "2px",
                }}
              >
                {TOOLS[activeTool].tagline}
              </div>
            </div>
          </div>
          <ToolPanel tool={TOOLS[activeTool]} />
        </div>
      </section>

      <TriviaSection />

      {/* FOOTER CTA */}
      <section
        id="about"
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "100px 32px 60px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: "20px",
            color: "#fff",
          }}
        >
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>Built by an </span>
          <span style={{ background: "linear-gradient(135deg, #00ffe0, #0af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>
            AI Researcher
          </span>
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>, for everyone.</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.9, fontSize: "1rem", fontWeight: 300, marginBottom: "36px" }}>
          NeuralKit is built by <strong style={{ color: "#fff", fontWeight: 600 }}>Prof. Abhishek Singh</strong>, CSE Department at Baderia Global Institute of Engineering and Management, Jabalpur, MP, India — and author of <em>Agentic AI Systems: Design & Engineering</em>.
          <br/><br/>
          This platform exists because powerful AI tools shouldn't be locked behind paywalls or API keys. <strong style={{ color: "#00ffe0", fontWeight: 500 }}>Everything here runs free, instantly, with zero signup.</strong> NeuralKit is also the practical companion to the book — real tools, real AI, no gatekeeping.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          <button
            onClick={() => window.open("https://www.amazon.com/Agentic-Systems-Engineering-intelligent-collaborate/dp/B0GX5FBCSM/ref=tmm_pap_swatch_0", "_blank")}
            style={{
              background: "linear-gradient(135deg, #00ffe0 0%, #0af 100%)",
              border: "none", borderRadius: "12px", padding: "14px 32px",
              color: "#000", fontWeight: 700, fontSize: "0.9rem",
              cursor: "pointer", fontFamily: "'Space Mono', monospace",
              boxShadow: "0 0 30px rgba(0,255,224,0.2)",
            }}
          >
            📘 Explore the Book →
          </button>
          <button
            onClick={() => window.open("https://www.youtube.com/@pyofpython9668", "_blank")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px", padding: "14px 24px",
              color: "rgba(255,255,255,0.7)", fontWeight: 500, fontSize: "0.9rem",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,0,0,0.5)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="5" fill="#ff0000"/>
              <polygon points="9.5,7.5 9.5,16.5 17,12" fill="white"/>
            </svg>
            pyofpython
          </button>
        </div>
      </section>

      {/* ASK THE AUTHOR */}
      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "0 32px 100px" }}>
        <div style={{
          background: "rgba(0,255,224,0.03)", border: "1px solid rgba(0,255,224,0.12)",
          borderRadius: "20px", padding: "36px",
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>◆ Ask the Author</div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginBottom: "20px" }}>
            Ask Prof. Abhishek Singh anything about AI, Agentic Systems, LLMs, or research.
          </p>
          <AskAuthor />
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "28px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
          © 2026 NeuralKit · Prof. Abhishek Singh · All Rights Reserved
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {[
            { label: "Privacy", action: () => alert("Privacy Policy\n\nNeuralKit does not collect or store any personal data. Your AI queries are processed via Groq API and are never stored on our servers. Google Analytics is used for anonymous traffic insights only. No login or account is ever required.") },
            { label: "Terms", action: () => alert("Terms of Use\n\nNeuralKit is a free platform for educational and research purposes. Tools are provided as-is. Do not use tools to generate harmful or illegal content. The creator reserves the right to modify or discontinue any feature at any time.") },
            { label: "Contact", action: () => window.location.href = "mailto:abhi16.2007@gmail.com" },
          ].map(({ label, action }) => (
            <span key={label} onClick={action} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.target.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.3)")}
            >{label}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
