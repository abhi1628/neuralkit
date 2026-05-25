import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import atsResume       from "./posts/ats-resume-2026";
import python          from "./posts/python-312-313-314-differences";
import gitGuide        from "./posts/git-github-first-job";
import systemDesign    from "./posts/system-design-interview-patterns";
import aiCoding        from "./posts/ai-coding-assistants-2026";
import sqlWindow       from "./posts/sql-window-functions-ctes-2026";
import ciscoIdeathon   from "./posts/cisco-ideathon-2026";
import modelSwapping   from "./posts/model-swapping-ai-engineering-2026";
import fullstackRoadmap from "./posts/fullstack-roadmap-2026";

export const BLOG_POSTS = [
  atsResume, python, gitGuide, systemDesign, aiCoding,
  sqlWindow, ciscoIdeathon, modelSwapping, fullstackRoadmap,
].sort((a, b) => new Date(b.date) - new Date(a.date));

// ── renderContent (unchanged) ─────────────────────────────────
function renderContent(block, i, theme) {
  const isDark = theme === "dark";
  const text   = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.8)";
  const muted  = isDark ? "rgba(255,255,255,0.5)"  : "rgba(0,0,0,0.5)";
  const ac     = "#0891b2";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  switch (block.type) {
    case "versions-table":
      return (
        <div key={i} style={{ margin: "24px 0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Space Mono',monospace", fontSize: "0.75rem" }}>
            <thead>
              <tr>
                {["Version","Released","Status","Key Highlights"].map(h => (
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
            <div key={j} style={{ display: "flex", gap: "14px", alignItems: "flex-start", background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "10px", padding: "14px 16px" }}>
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

// ── BlogComments component ────────────────────────────────────
function BlogComments({ slug, theme }) {
  const isDark = theme === "dark";
  const ac     = "#0891b2";

  const [likeCount,  setLikeCount]  = useState(0);
  const [liked,      setLiked]      = useState(false);
  const [likeAnim,   setLikeAnim]   = useState(false);
  const [comments,   setComments]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liking,     setLiking]     = useState(false);
  const [name,       setName]       = useState("");
  const [message,    setMessage]    = useState("");
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);
  const [commentErr, setCommentErr] = useState("");
  const formRef = useRef(null);

  // ── Fetch likes + comments ──────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        setLikeCount(data.likeCount || 0);
        setLiked(data.liked || false);
        setComments(data.comments || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Like handler ────────────────────────────────────────────
  async function handleLike() {
    if (liked || liking) return;
    setLiking(true);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
    try {
      const r = await fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}&type=like`, {
        method: "POST", headers: { "Content-Type": "application/json" },
      });
      const data = await r.json();
      if (r.ok || r.status === 409) {
        setLikeCount(data.likeCount ?? likeCount + 1);
        setLiked(true);
      }
    } catch {}
    setLiking(false);
  }

  // ── Comment submit ──────────────────────────────────────────
  async function handleComment(e) {
    e.preventDefault();
    if (!message.trim()) { setCommentErr("Please write something before submitting."); return; }
    if (message.trim().length > 500) { setCommentErr("Comment too long (max 500 chars)."); return; }
    setSubmitting(true); setCommentErr(""); setError("");
    try {
      const r = await fetch(`/api/blog-reactions?slug=${encodeURIComponent(slug)}&type=comment`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      const data = await r.json();
      if (r.ok) {
        setComments(prev => [data, ...prev]);
        setName(""); setMessage(""); setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
      } else {
        setCommentErr(data.error || "Failed to post comment.");
      }
    } catch { setCommentErr("Connection error. Please try again."); }
    setSubmitting(false);
  }

  // ── Shared styles ───────────────────────────────────────────
  const card = {
    background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)"}`,
    borderRadius: "14px",
    padding: "18px 20px",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`,
    borderRadius: "10px",
    padding: "10px 14px",
    color: isDark ? "#fff" : "#1a1a1a",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.88rem",
    outline: "none",
  };

  const labelStyle = {
    fontFamily: "'Space Mono',monospace",
    fontSize: "0.62rem",
    color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "7px",
    display: "block",
  };

  const textPrimary   = isDark ? "#fff"                      : "#1a1a1a";
  const textSecondary = isDark ? "rgba(255,255,255,0.6)"     : "rgba(0,0,0,0.6)";
  const textMuted     = isDark ? "rgba(255,255,255,0.35)"    : "rgba(0,0,0,0.4)";
  const divider       = isDark ? "rgba(255,255,255,0.06)"    : "rgba(0,0,0,0.07)";

  return (
    <div style={{ marginTop: "56px" }}>

      {/* ── Section header ── */}
      <div style={{ borderTop: `1px solid ${divider}`, paddingTop: "40px", marginBottom: "32px" }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "6px" }}>◆ Reactions</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.3rem", fontWeight: 800, color: textPrimary, letterSpacing: "-0.02em", margin: 0 }}>
            Likes & Comments
          </h3>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: textMuted }}>
            {loading ? "Loading..." : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {/* ── Like button ── */}
      <div style={{ marginBottom: "36px" }}>
        <button
          onClick={handleLike}
          disabled={liked || liking}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: liked
              ? (isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)")
              : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
            border: `1px solid ${liked
              ? "rgba(239,68,68,0.4)"
              : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)")}`,
            borderRadius: "100px",
            padding: "10px 22px",
            cursor: liked ? "default" : "pointer",
            transition: "all 0.25s",
            transform: likeAnim ? "scale(1.1)" : "scale(1)",
          }}
          aria-label={liked ? "Already liked" : "Like this article"}
        >
          <span style={{
            fontSize: "1.3rem",
            transition: "transform 0.3s",
            display: "inline-block",
            transform: likeAnim ? "scale(1.4)" : "scale(1)",
          }}>
            {liked ? "❤️" : "🤍"}
          </span>
          <span style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: liked ? "#ef4444" : textSecondary,
          }}>
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>
          {!liked && (
            <span style={{ fontSize: "0.72rem", color: textMuted, fontFamily: "'Space Mono',monospace" }}>
              · tap to like
            </span>
          )}
        </button>
        {liked && (
          <div style={{ marginTop: "8px", fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: isDark ? "rgba(239,68,68,0.7)" : "#dc2626" }}>
            ✓ You liked this article
          </div>
        )}
      </div>

      {/* ── Comment form ── */}
      <div style={{ ...card, marginBottom: "28px" }} ref={formRef}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "18px" }}>
          💬 Leave a Comment
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🎉</div>
            <div style={{ color: "#34d399", fontFamily: "'Space Mono',monospace", fontSize: "0.82rem", fontWeight: 700 }}>
              Comment posted!
            </div>
            <div style={{ color: textMuted, fontSize: "0.78rem", marginTop: "4px" }}>
              Thanks for sharing your thoughts.
            </div>
          </div>
        ) : (
          <form onSubmit={handleComment} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Your Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Anonymous"
                maxLength={50}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = `${ac}66`}
                onBlur={e => e.target.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}
              />
            </div>
            <div>
              <label style={labelStyle}>Comment *</label>
              <textarea
                value={message}
                onChange={e => { setMessage(e.target.value); setCommentErr(""); }}
                placeholder="Share your thoughts, questions, or feedback about this article..."
                rows={4}
                maxLength={500}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, minHeight: "100px" }}
                onFocus={e => e.target.style.borderColor = `${ac}66`}
                onBlur={e => e.target.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                {commentErr
                  ? <span style={{ color: "#ef4444", fontSize: "0.72rem", fontFamily: "'Space Mono',monospace" }}>⚠ {commentErr}</span>
                  : <span />
                }
                <span style={{ fontSize: "0.65rem", color: message.length > 450 ? "#f59e0b" : textMuted, fontFamily: "'Space Mono',monospace" }}>
                  {message.length}/500
                </span>
              </div>
            </div>

            {/* Privacy notice */}
            <div style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`, borderRadius: "8px", padding: "10px 14px", fontSize: "0.72rem", color: textMuted, fontFamily: "'Space Mono',monospace", lineHeight: 1.6 }}>
              🔒 Your name is masked publicly (A***). No account needed.
            </div>

            <button
              type="submit"
              disabled={submitting || !message.trim()}
              style={{
                alignSelf: "flex-start",
                background: submitting || !message.trim()
                  ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")
                  : "linear-gradient(135deg,#00ffe0,#0af)",
                border: "none",
                borderRadius: "10px",
                padding: "10px 24px",
                color: submitting || !message.trim()
                  ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)")
                  : "#000",
                fontFamily: "'Space Mono',monospace",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: submitting || !message.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              {submitting
                ? <><span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Posting...</>
                : "Post Comment →"
              }
            </button>
          </form>
        )}
      </div>

      {/* ── Comments list ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "32px", color: textMuted, fontFamily: "'Space Mono',monospace", fontSize: "0.78rem" }}>
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 20px", border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, borderRadius: "14px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>💬</div>
          <div style={{ color: textMuted, fontFamily: "'Space Mono',monospace", fontSize: "0.78rem" }}>
            No comments yet. Be the first!
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {comments.map((c, i) => (
            <div key={c.id || i} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Avatar */}
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `${ac}20`, border: `1px solid ${ac}33`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono',monospace", fontSize: "0.75rem", fontWeight: 700, color: ac, flexShrink: 0 }}>
                    {(c.name === "Anonymous" ? "A" : c.name.charAt(0)).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.88rem", color: textPrimary }}>
                    {c.name || "Anonymous"}
                  </span>
                </div>
                <span style={{ fontSize: "0.65rem", color: textMuted, fontFamily: "'Space Mono',monospace", whiteSpace: "nowrap" }}>
                  {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p style={{ fontSize: "0.88rem", color: textSecondary, lineHeight: 1.75, margin: 0, textAlign: "left", wordBreak: "break-word" }}>
                {c.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "48px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
          ← Back to ZeroAPI
        </button>

        <div style={{ marginBottom: "56px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "14px" }}>◆ Learn</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", letterSpacing: "-0.03em", marginBottom: "12px", lineHeight: 1.1, textAlign: "left" }}>Guides & Tutorials</h1>
          <p style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.6)", fontSize: "1rem", fontWeight: 300, textAlign: "left" }}>Practical guides for developers, students, and job seekers. New articles every week.</p>
        </div>

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
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const isDark     = theme === "dark";
  const ac         = "#0891b2";
  const post       = BLOG_POSTS.find(p => p.slug === slug);

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
    const url  = `https://zeroapi.in/learn/${post.slug}`;
    const text = `${post.title} — ${url}`;
    if (platform === "twitter")  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    if (platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    if (platform === "copy")     navigator.clipboard.writeText(url).catch(() => {});
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
              { label: "𝕏 Twitter",   platform: "twitter",  bg: "#1a1a1a",                                              color: "#fff"                        },
              { label: "💬 WhatsApp", platform: "whatsapp", bg: "#25d366",                                              color: "#fff"                        },
              { label: "💼 LinkedIn", platform: "linkedin", bg: "#0077b5",                                              color: "#fff"                        },
              { label: "🔗 Copy Link",platform: "copy",     bg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: isDark ? "#fff" : "#1a1a1a"  },
            ].map(btn => (
              <button key={btn.platform} onClick={() => shareText(btn.platform)}
                style={{ background: btn.bg, border: "none", borderRadius: "8px", padding: "9px 18px", color: btn.color, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontWeight: 500 }}>
                {btn.label}
              </button>
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

        {/* ── Likes & Comments ── */}
        <BlogComments slug={post.slug} theme={theme} />

        {/* Back button */}
        <div style={{ marginTop: "40px" }}>
          <button onClick={() => navigate("/learn")}
            style={{ background: "transparent", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"}`, borderRadius: "8px", padding: "8px 20px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>
            ← More Articles
          </button>
        </div>
      </div>
    </div>
  );
}
