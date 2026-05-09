import { useState, useEffect, useRef } from "react";

// ── Google Analytics ──────────────────────────────────────────
const GA_ID = "G-XXXXXXXXXX"; // ← Replace with your Measurement ID

function loadGA(id) {
  if (document.getElementById("ga-script")) return;
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: tool.systemPrompt,
          messages: [{ role: "user", content: input }],
        }),
      });
      const data = await res.json();
      if (data?.content?.[0]?.text) {
        setOutput(data.content[0].text);
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
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

export default function App() {
  const [activeTool, setActiveTool] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Load GA once on mount
  useEffect(() => { loadGA(GA_ID); }, []);

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
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "linear-gradient(135deg, #00ffe0, #0af)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            ◈
          </div>
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
          {["Tools", "About", "Blog"].map((item) => (
            <span
              key={item}
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
              {item}
            </span>
          ))}
          <button
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
            Learn More
          </button>
        </div>

        {/* Stats strip */}
        <div
          style={{
            marginTop: "56px",
            display: "flex",
            gap: "60px",
            whiteSpace: "nowrap",
            justifyContent: "center",
          }}
        >
          {[
            { n: "10+", label: "Free Tools" },
            { n: "0", label: "Signup Required" },
            { n: "∞", label: "Possibilities" },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #00ffe0, #0af)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {label}
              </div>
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
            Powered by Claude AI. No API key needed.
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

      {/* COMING SOON TOOLS STRIP */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "48px 32px",
          textAlign: "center",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.68rem",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          Coming Soon
        </div>
        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            "📄 PDF Chat",
            "🏗 Agent Builder",
            "📊 Data Analyzer",
            "✍️ Prompt Engineer",
            "🔗 RAG Playground",
            "🧪 LLM Comparator",
          ].map((item) => (
            <div
              key={item}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "100px",
                padding: "10px 20px",
                fontSize: "0.83rem",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "100px 32px",
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
          <span
            style={{
              background: "linear-gradient(135deg, #00ffe0, #0af)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            AI Researcher
          </span>
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>, for everyone.</span>
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.8,
            fontSize: "1rem",
            fontWeight: 300,
            marginBottom: "36px",
          }}
        >
          NeuralKit is crafted by Abhishek Singh, Professor of CS & AI at BGIEM Jabalpur
          and author of <em>Agentic AI Systems: Design & Engineering</em>. These tools
          are built from real research, for real engineers.
        </p>
        <button
          style={{
            background: "linear-gradient(135deg, #00ffe0 0%, #0af 100%)",
            border: "none",
            borderRadius: "12px",
            padding: "16px 40px",
            color: "#000",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            fontFamily: "'Space Mono', monospace",
            boxShadow: "0 0 40px rgba(0,255,224,0.25)",
          }}
        >
          Explore the Book →
        </button>
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
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          © 2026 NeuralKit · Built by Abhishek Singh
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Terms", "Contact"].map((item) => (
            <span
              key={item}
              style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
