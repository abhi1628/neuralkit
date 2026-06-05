import { useNavigate, useParams } from "react-router-dom";
import seriesData from "../posts/ml-foundations-series";
import landingPost from "../posts/ml-foundations-landing"; // ← STATIC IMPORT, not require()

export default function TutorialSeries({ theme }) {
  const navigate = useNavigate();
  const { seriesSlug } = useParams();
  const isDark = theme === "dark";
  const ac = isDark ? "#a78bfa" : "#7c3aed";
  const seriesColor = "#10b981";

  const series = seriesSlug === "ml-foundations" ? seriesData : null;

  if (!series) {
    return (
      <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "3rem" }}>📭</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a" }}>Series not found</div>
        <button onClick={() => navigate("/tutorials")} style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: "10px", padding: "10px 24px", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono',monospace" }}>← All Tutorials</button>
      </div>
    );
  }

  // renderContent is now INSIDE the component - no more scope issues
  function renderContent(block, i) {
    const text = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.8)";
    const muted = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
    const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

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
            <button onClick={() => navigate(block.href)} style={{ display: "inline-block", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, fontSize: "0.95rem", padding: "14px 32px", borderRadius: "12px", textDecoration: "none", fontFamily: "'Space Mono',monospace", border: "none", cursor: "pointer" }}>{block.text}</button>
            {block.note && <div style={{ marginTop: "10px", fontSize: "0.75rem", color: muted, fontFamily: "'Space Mono',monospace" }}>{block.note}</div>}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", width: "100%" }}>
      {/* Series Header */}
      <div style={{ background: isDark ? "rgba(16,185,129,0.04)" : "rgba(16,185,129,0.03)", borderBottom: `1px solid ${isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.15)"}` }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "72px 24px 40px" }}>
          <button onClick={() => navigate("/tutorials")} style={{ background: isDark ? "rgba(167,139,250,0.08)" : "rgba(124,58,237,0.07)", border: `1px solid ${isDark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.2)"}`, borderRadius: "8px", color: isDark ? "#a78bfa" : "#7c3aed", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "32px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontWeight: 600 }}>
            ← All Tutorials
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <span style={{ background: `${seriesColor}18`, border: `1px solid ${seriesColor}33`, borderRadius: "100px", padding: "4px 14px", fontSize: "0.68rem", fontFamily: "'Space Mono',monospace", color: seriesColor }}>{series.category}</span>
            <span style={{ fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>{series.totalParts} parts · {series.estimatedTime} · {series.difficulty}</span>
          </div>

          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,4vw,2.5rem)", fontWeight: 800, color: isDark ? "#fff" : "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "16px", textAlign: "left" }}>{series.title}</h1>
          <p style={{ fontSize: "1.05rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", lineHeight: 1.7, textAlign: "left", maxWidth: "680px" }}>{series.description}</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
            {series.tags.map(tag => <span key={tag} style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", fontFamily: "'Space Mono',monospace" }}>#{tag}</span>)}
          </div>
        </div>
      </div>

      {/* Parts Overview + Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px", textAlign: "left" }}>
        {/* Parts Navigation Cards */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: seriesColor, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "18px" }}>◆ Series Parts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {series.parts.map((part, i) => (
              <div key={i} onClick={() => navigate(`/tutorials/${series.slug}/${part.slug}`)}
                style={{ background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`, borderRadius: "12px", padding: "18px 20px", cursor: "pointer", transition: "all 0.2s", display: "flex", gap: "16px", alignItems: "flex-start" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${seriesColor}44`; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateX(0)"; }}>
                <div style={{ background: seriesColor, color: "#000", fontFamily: "'Space Mono',monospace", fontSize: "0.75rem", fontWeight: 700, width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{part.partNumber}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: isDark ? "#fff" : "#1a1a1a", marginBottom: "4px" }}>{part.title}</div>
                  <div style={{ fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)", lineHeight: 1.6, marginBottom: "8px" }}>{part.excerpt}</div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.65rem", color: seriesColor, fontFamily: "'Space Mono',monospace" }}>{part.readTime}</span>
                    <span style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", fontFamily: "'Space Mono',monospace" }}>{part.date}</span>
                  </div>
                </div>
                <span style={{ color: seriesColor, fontSize: "1rem", flexShrink: 0, alignSelf: "center", opacity: 0.7 }}>→</span>
              </div>
            ))}
          </div>
        </div>

        {/* Landing Page Content - NOW WORKS because landingPost is statically imported */}
        {landingPost.content.map((block, i) => renderContent(block, i))}

        {/* Start CTA */}
        <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => navigate(`/tutorials/${series.slug}/${series.parts[0].slug}`)} style={{ display: "inline-block", background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontWeight: 700, fontSize: "1rem", padding: "14px 36px", borderRadius: "12px", textDecoration: "none", fontFamily: "'Space Mono',monospace", border: "none", cursor: "pointer" }}>
              Start Part 1: {series.parts[0].title.split(":")[0]} →
            </button>
            <div style={{ marginTop: "10px", fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)", fontFamily: "'Space Mono',monospace" }}>{series.parts[0].readTime} · Quiz included</div>
          </div>
        </div>
      </div>
    </div>
  );
}
