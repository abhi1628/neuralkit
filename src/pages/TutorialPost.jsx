import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import seriesData from "../posts/ml-foundations-series";
import part1Content from "../posts/ml-foundations-part-1";
import part2Content from "../posts/ml-foundations-part-2";
import part3Content from "../posts/ml-foundations-part-3";
import part4Content from '../posts/ml-foundations-part-4';
import pythonSeriesData from "../posts/python-unlocked-series";
import pythonPart1 from "../posts/python-unlocked-part-1";
import pythonPart2 from "../posts/python-unlocked-part-2";
import pythonPart3 from "../posts/python-unlocked-part-3";
import pythonPart4 from "../posts/python-unlocked-part-4";
import pythonPart5 from "../posts/python-unlocked-part-5";
import pythonPart6 from "../posts/python-unlocked-part-6";
import pythonPart7 from "../posts/python-unlocked-part-7";
import pythonPart8 from "../posts/python-unlocked-part-8";
import pythonPart9 from "../posts/python-unlocked-part-9";
import pythonPart10 from "../posts/python-unlocked-part-10";
import pythonPart11 from "../posts/python-unlocked-part-11";
import pythonPart12 from "../posts/python-unlocked-part-12";
import pythonPart13 from "../posts/python-unlocked-part-13";
import pythonPart14 from "../posts/python-unlocked-part-14";
import pythonPart15 from "../posts/python-unlocked-part-15";
import pythonPart16 from "../posts/python-unlocked-part-16";
import pythonPart17 from "../posts/python-unlocked-part-17";
import pythonPart18 from "../posts/python-unlocked-part-18";
import pythonPart19 from "../posts/python-unlocked-part-19";
import pythonPart20 from "../posts/python-unlocked-part-20";
import pythonPart21 from "../posts/python-unlocked-part-21";
import pythonPart22 from "../posts/python-unlocked-part-22";
import pythonPart23 from "../posts/python-unlocked-part-23";

const CONTENT_MAP = {
  "ml-foundations": {
    "part-1-linear-algebra": part1Content,
    "part-2-calculus-optimization": part2Content,
    "part-3-probability-information": part3Content,
    "part-4-ml-pipeline": part4Content
  },
  "python-unlocked": {
    "part-1-philosophy-origin": pythonPart1,
    "part-2-environment-craft": pythonPart2,
    "part-3-hello-world-anatomy": pythonPart3,
    "part-4-variables-memory": pythonPart4,
    "part-5-numbers-math": pythonPart5,
    "part-6-strings-unicode": pythonPart6,
    "part-7-string-formatting": pythonPart7,
    "part-8-boolean-operators": pythonPart8,
    "part-9-conditionals-match": pythonPart9,
    "part-10-lists-workhorse": pythonPart10,
    "part-11-tuples-immutability": pythonPart11,
    "part-12-dictionaries-hash-tables": pythonPart12,
    "part-13-sets-set-theory": pythonPart13,
    "part-14-range-enumerate-zip": pythonPart14,
    "part-15-for-while-loops": pythonPart15,
    "part-16-functions-building-blocks": pythonPart16,
    "part-17-recursion-advanced-functions": pythonPart17,
    "part-18-lambda-functional": pythonPart18,
    "part-19-closures-lexical": pythonPart19,
    "part-20-decorators-superpower": pythonPart20,
    "part-21-generators-iterators": pythonPart21,
    "part-22-file-handling": pythonPart22,
    "part-23-exception-handling": pythonPart23
  }
};

function renderContent(block, i, theme) {
  const isDark = theme === "dark";
  const text = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.8)";
  const muted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const seriesColor = "#10b981";

  switch (block.type) {
    case "intro":
      return <p key={i} style={{ fontSize: "1.05rem", color: text, lineHeight: 1.85, fontWeight: 400, marginBottom: "28px", borderLeft: `3px solid ${seriesColor}`, paddingLeft: "18px", textAlign: "left" }}>{block.text}</p>;

    case "h2":
      return <h2 key={i} style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.2rem,2.5vw,1.5rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", marginTop: "44px", marginBottom: "14px", letterSpacing: "-0.02em", textAlign: "left" }}>{block.text}</h2>;

    case "p":
      return <p key={i} style={{ fontSize: "0.95rem", color: text, lineHeight: 1.85, marginBottom: "18px", textAlign: "left" }}>{block.text}</p>;

    case "code-block":
      return (
        <div key={i} style={{ margin: "24px 0" }}>
          {block.label && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.62rem", color: seriesColor, letterSpacing: "0.08em", marginBottom: "8px", textTransform: "uppercase", textAlign: "left" }}>◆ {block.label}</div>}
          <pre style={{ background: isDark ? "#0d1117" : "#1a1a2e", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)"}`, borderRadius: "10px", padding: "20px", margin: 0, overflowX: "auto", fontFamily: "'Space Mono',monospace", fontSize: "0.78rem", lineHeight: 1.8, color: "#e6edf3", whiteSpace: "pre", textAlign: "left" }}>
            <code>{block.code}</code>
          </pre>
        </div>
      );

    case "callout":
      return (
        <div key={i} style={{ background: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.06)", border: `1px solid ${seriesColor}33`, borderRadius: "12px", padding: "18px 22px", margin: "28px 0", display: "flex", gap: "14px", alignItems: "flex-start" }}>
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
              <div style={{ background: seriesColor, color: "#000", fontFamily: "'Space Mono',monospace", fontSize: "0.75rem", fontWeight: 700, width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>{step.num}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: isDark ? "#fff" : "#1a1a1a", marginBottom: "4px" }}>{step.title}</div>
                <div style={{ fontSize: "0.85rem", color: text, lineHeight: 1.7 }}>{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      );

    case "checklist":
      return (
        <div key={i} style={{ margin: "24px 0", background: isDark ? "rgba(16,185,129,0.03)" : "rgba(16,185,129,0.04)", border: `1px solid ${seriesColor}22`, borderRadius: "14px", padding: "20px 22px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {block.items.map((item, j) => (
              <div key={j} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.85rem", color: text, lineHeight: 1.6 }}>
                <span style={{ color: seriesColor, fontWeight: 700, flexShrink: 0 }}>☐</span>{item}
              </div>
            ))}
          </div>
        </div>
      );

    case "sections-list":
      return (
        <div key={i} style={{ margin: "24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
          {block.items.map((item, j) => (
            <div key={j} style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, borderRadius: "10px", padding: "14px 18px" }}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: seriesColor, marginBottom: "5px", fontFamily: "'Space Mono',monospace" }}>{item.title}</div>
              <div style={{ fontSize: "0.84rem", color: text, lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      );

    case "cta":
      return (
        <div key={i} style={{ margin: "32px 0", textAlign: "center" }}>
          <a href={block.href} style={{ display: "inline-block", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, fontSize: "0.95rem", padding: "14px 32px", borderRadius: "12px", textDecoration: "none", fontFamily: "'Space Mono',monospace" }}>{block.text}</a>
          {block.note && <div style={{ marginTop: "10px", fontSize: "0.75rem", color: muted, fontFamily: "'Space Mono',monospace" }}>{block.note}</div>}
        </div>
      );

      case "image":
  return (
    <div key={i} style={{ margin: "32px 0", textAlign: "center" }}>
      <img 
        src={block.src} 
        alt={block.alt} 
        style={{ 
          maxWidth: "100%", 
          borderRadius: "12px", 
          border: `1px solid ${border}`,
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)"
        }} 
      />
      {block.caption && (
        <div style={{ 
          fontSize: "0.78rem", 
          color: muted, 
          marginTop: "12px", 
          fontStyle: "italic",
          fontFamily: "'Space Mono',monospace"
        }}>
          {block.caption}
        </div>
      )}
    </div>
  );

    default:
      return null;
  }
}

export default function TutorialPost({ theme }) {
  const { seriesSlug, partSlug } = useParams();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const seriesColor = "#10b981";

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Look up content in static map
      const seriesContent = CONTENT_MAP[seriesSlug];
      if (!seriesContent) {
        setError("Series not found");
        setLoading(false);
        return;
      }

      const content = seriesContent[partSlug];
      if (!content) {
        setError("Part not found");
        setLoading(false);
        return;
      }

      setPost(content);
      setLoading(false);
    } catch (err) {
      console.error("TutorialPost error:", err);
      setError("Failed to load content");
      setLoading(false);
    }

    window.scrollTo(0, 0);
  }, [seriesSlug, partSlug]);

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", color: seriesColor, fontSize: "0.85rem" }}>Loading tutorial...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "3rem" }}>📭</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a" }}>{error}</div>
        <button onClick={() => navigate("/tutorials")} style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: "10px", padding: "10px 24px", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>
          ← All Tutorials
        </button>
      </div>
    );
  }

  // Get series data for navigation
  const series = seriesSlug === "ml-foundations" ? seriesData : null;
  const currentPartIndex = series ? series.parts.findIndex(p => p.slug === partSlug) : -1;
  const currentPart = currentPartIndex >= 0 ? series.parts[currentPartIndex] : null;
  const prevPart = currentPartIndex > 0 ? series.parts[currentPartIndex - 1] : null;
  const nextPart = currentPartIndex < series.parts.length - 1 ? series.parts[currentPartIndex + 1] : null;

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", width: "100%" }}>
      {/* Series Header Banner */}
      <div style={{ background: isDark ? "rgba(16,185,129,0.04)" : "rgba(16,185,129,0.03)", borderBottom: `1px solid ${isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.15)"}` }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "72px 24px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <button onClick={() => navigate(`/tutorials/${seriesSlug}`)} style={{ background: "transparent", border: `1px solid ${isDark ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.3)"}`, borderRadius: "8px", color: seriesColor, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", padding: "6px 14px", fontWeight: 600 }}>
              ← Series Overview
            </button>
            <button onClick={() => navigate("/tutorials")} style={{ background: "transparent", border: `1px solid ${isDark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.2)"}`, borderRadius: "8px", color: isDark ? "#a78bfa" : "#7c3aed", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", padding: "6px 14px", fontWeight: 600 }}>
              All Tutorials
            </button>
          </div>

          {/* Part indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            {series && series.parts.map((p, i) => (
              <div key={i} style={{
                width: i === currentPartIndex ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: i === currentPartIndex ? seriesColor : i < currentPartIndex ? `${seriesColor}66` : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                transition: "all 0.3s"
              }} />
            ))}
            <span style={{ fontSize: "0.65rem", color: seriesColor, fontFamily: "'Space Mono',monospace", marginLeft: "4px" }}>
              Part {currentPartIndex + 1} of {series ? series.parts.length : 0}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            <span style={{ background: `${seriesColor}18`, border: `1px solid ${seriesColor}33`, borderRadius: "100px", padding: "4px 14px", fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", color: seriesColor }}>
              {post.category}
            </span>
            <span style={{ fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>
              {post.date} · {post.readTime}
            </span>
          </div>

          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,4vw,2.5rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "16px", textAlign: "left" }}>
            {post.title}
          </h1>
          <p style={{ fontSize: "1.05rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", lineHeight: 1.7, textAlign: "left", maxWidth: "680px" }}>
            {post.excerpt}
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
            {post.tags && post.tags.map(tag => (
              <span key={tag} style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", fontFamily: "'Space Mono',monospace" }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px", textAlign: "left" }}>
        {post.content && post.content.map((block, i) => renderContent(block, i, theme))}

        {/* Part Navigation */}
        <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: seriesColor, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "18px" }}>
            ◆ Series Navigation
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            {prevPart ? (
              <button onClick={() => navigate(`/tutorials/${seriesSlug}/${prevPart.slug}`)} style={{ flex: 1, minWidth: "200px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", padding: "16px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                <div style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontFamily: "'Space Mono',monospace", marginBottom: "6px" }}>← Previous</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: isDark ? "#fff" : "#1a1a1a" }}>{prevPart.title}</div>
              </button>
            ) : <div style={{ flex: 1, minWidth: "200px" }} />}

            {nextPart ? (
              <button onClick={() => navigate(`/tutorials/${seriesSlug}/${nextPart.slug}`)} style={{ flex: 1, minWidth: "200px", background: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.05)", border: `1px solid ${seriesColor}33`, borderRadius: "12px", padding: "16px 20px", cursor: "pointer", textAlign: "right", transition: "all 0.2s" }}>
                <div style={{ fontSize: "0.65rem", color: seriesColor, fontFamily: "'Space Mono',monospace", marginBottom: "6px" }}>Next →</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: isDark ? "#fff" : "#1a1a1a" }}>{nextPart.title}</div>
              </button>
            ) : (
              <button onClick={() => navigate(`/tutorials/${seriesSlug}`)} style={{ flex: 1, minWidth: "200px", background: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.05)", border: `1px solid ${seriesColor}33`, borderRadius: "12px", padding: "16px 20px", cursor: "pointer", textAlign: "right" }}>
                <div style={{ fontSize: "0.65rem", color: seriesColor, fontFamily: "'Space Mono',monospace", marginBottom: "6px" }}>Series Complete ✓</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: isDark ? "#fff" : "#1a1a1a" }}>Back to Overview</div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
