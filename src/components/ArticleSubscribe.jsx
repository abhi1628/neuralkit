// src/components/ArticleSubscribe.jsx
import { useState } from "react";

export default function ArticleSubscribe({ theme, postSlug }) {
  const isDark = theme === "dark";
  const ac     = isDark ? "#a78bfa" : "#7c3aed";

  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState("idle"); // idle | loading | success | duplicate | error
  const [errMsg,  setErrMsg]  = useState("");

  async function handleSubscribe() {
    const trimmed = email.trim();
    if (!trimmed) return;

    // Basic client-side email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source: postSlug || "blog",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      if (data.message === "already_subscribed") {
        setStatus("duplicate");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setErrMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubscribe();
  }

  // ── Styles ──────────────────────────────────────────────────
  const containerStyle = {
    marginTop: "40px",
    background: isDark
      ? "rgba(167,139,250,0.04)"
      : "rgba(124,58,237,0.04)",
    border: `1px solid ${isDark ? "rgba(167,139,250,0.15)" : "rgba(124,58,237,0.15)"}`,
    borderRadius: "16px",
    padding: "28px 32px",
  };

  const labelStyle = {
    fontFamily: "'Space Mono',monospace",
    fontSize: "0.62rem",
    color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "14px",
  };

  const headingStyle = {
    fontFamily: "'Syne',sans-serif",
    fontWeight: 700,
    fontSize: "1.05rem",
    color: isDark ? "#fff" : "#1a1a1a",
    marginBottom: "6px",
    textAlign: "left",
  };

  const subtitleStyle = {
    fontSize: "0.85rem",
    color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)",
    marginBottom: "18px",
    lineHeight: 1.6,
    textAlign: "left",
  };

  const rowStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  };

  const inputStyle = {
    flex: "1 1 220px",
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    border: `1px solid ${
      status === "error"
        ? "rgba(248,113,113,0.5)"
        : isDark
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.12)"
    }`,
    borderRadius: "8px",
    padding: "10px 14px",
    color: isDark ? "#fff" : "#1a1a1a",
    fontSize: "0.88rem",
    fontFamily: "'DM Sans',sans-serif",
    outline: "none",
    minWidth: 0,
  };

  const btnStyle = {
    background:
      status === "loading"
        ? isDark ? "rgba(167,139,250,0.3)" : "rgba(124,58,237,0.3)"
        : "linear-gradient(135deg,#a78bfa,#818cf8)",
    border: "none",
    borderRadius: "8px",
    padding: "10px 22px",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.82rem",
    fontFamily: "'Space Mono',monospace",
    cursor: status === "loading" ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "opacity 0.15s",
  };

  // ── States ───────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}>✅</div>
          <div>
            <div style={headingStyle}>You're in!</div>
            <p style={{ ...subtitleStyle, marginBottom: 0 }}>
              New articles, Python tutorials, and AI deep-dives — straight to your inbox. No spam, ever.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ fontSize: "1.8rem", lineHeight: 1, flexShrink: 0 }}>👋</div>
          <div>
            <div style={headingStyle}>Already subscribed!</div>
            <p style={{ ...subtitleStyle, marginBottom: 0 }}>
              You're already on the list. New articles will land in your inbox automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div
          style={{
            fontSize: "1.5rem",
            lineHeight: 1,
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          📬
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={labelStyle}>◆ Newsletter</div>
          <div style={headingStyle}>Enjoyed this article?</div>
          <p style={subtitleStyle}>
            Get new deep-dives on AI, Python, and engineering — delivered free. No API key, no signup friction.
          </p>

          <div style={rowStyle}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setStatus("idle"); setErrMsg(""); }}
              onKeyDown={handleKeyDown}
              disabled={status === "loading"}
              style={inputStyle}
              aria-label="Email address"
            />
            <button
              onClick={handleSubscribe}
              disabled={status === "loading"}
              style={btnStyle}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe →"}
            </button>
          </div>

          {status === "error" && errMsg && (
            <div style={{
              marginTop: "10px",
              fontSize: "0.78rem",
              color: "#f87171",
              fontFamily: "'Space Mono',monospace",
            }}>
              ⚠ {errMsg}
            </div>
          )}

          <div style={{
            marginTop: "10px",
            fontSize: "0.72rem",
            color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.35)",
            fontFamily: "'Space Mono',monospace",
          }}>
            No spam. Unsubscribe any time.
          </div>
        </div>
      </div>
    </div>
  );
}
