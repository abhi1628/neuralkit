import { useNavigate } from "react-router-dom";
import seriesData from "../posts/ml-foundations-series";
import pythonSeriesData from "../posts/python-unlocked-series";
import oopCppSeriesData from "../posts/oop-cpp-mastery-series";

// In the future, this will be an array of all series
const ALL_SERIES = [seriesData, pythonSeriesData, oopCppSeriesData];

export default function TutorialList({ theme }) {
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const ac = isDark ? "#a78bfa" : "#7c3aed";

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", width: "100%" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px 100px" }}>
        <button onClick={() => navigate("/")} style={{ background: isDark ? "rgba(167,139,250,0.08)" : "rgba(124,58,237,0.07)", border: `1px solid ${isDark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.2)"}`, borderRadius: "8px", color: isDark ? "#a78bfa" : "#7c3aed", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "36px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontWeight: 600 }}>
          ← Back to ZeroAPI
        </button>

        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)", border: `1px solid ${isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.18)"}`, borderRadius: "100px", padding: "5px 16px", marginBottom: "20px", fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#10b981", letterSpacing: "0.15em" }}>
            ◆ TUTORIALS
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, color: isDark ? "#f1f5f9" : "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "12px", lineHeight: 1.1, textAlign: "left" }}>Structured Learning Paths</h1>
          <p style={{ color: isDark ? "rgba(241,245,249,0.55)" : "#4b4580", fontSize: "1rem", fontWeight: 300, textAlign: "left" }}>Multi-part series with code, quizzes, and real projects. Master topics from zero to production.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ALL_SERIES.map(series => (
            <article key={series.slug} onClick={() => navigate(`/tutorials/${series.slug}`)}
              style={{ background: isDark ? "rgba(255,255,255,0.025)" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`, borderRadius: "16px", padding: "28px", cursor: "pointer", transition: "all 0.2s", display: "flex", gap: "20px", alignItems: "flex-start" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${ac}44`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: "2.2rem", flexShrink: 0, lineHeight: 1 }}>{series.coverEmoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ background: `${series.categoryColor}18`, border: `1px solid ${series.categoryColor}33`, borderRadius: "100px", padding: "3px 12px", fontSize: "0.65rem", fontFamily: "'Space Mono',monospace", color: series.categoryColor, whiteSpace: "nowrap" }}>{series.category}</span>
                  <span style={{ fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace", whiteSpace: "nowrap" }}>{series.totalParts} parts · {series.estimatedTime}</span>
                </div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1rem,2vw,1.25rem)", fontWeight: 700, color: isDark ? "#fff" : "#1a1a1a", marginBottom: "8px", letterSpacing: "-0.02em", lineHeight: 1.3, textAlign: "left" }}>{series.title}</h2>
                <p style={{ fontSize: "0.85rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", lineHeight: 1.65, margin: 0, textAlign: "left" }}>{series.description}</p>
                <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {series.tags.map(tag => <span key={tag} style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", fontFamily: "'Space Mono',monospace" }}>#{tag}</span>)}
                </div>
                <div style={{ marginTop: "14px", display: "flex", gap: "8px", alignItems: "center" }}>
                  {series.parts.map((part, i) => (
                    <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === 0 ? series.categoryColor : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
                  ))}
                  <span style={{ fontSize: "0.65rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>Progress indicator</span>
                </div>
              </div>
              <span style={{ color: ac, fontSize: "1.1rem", flexShrink: 0, alignSelf: "center", opacity: 0.7 }}>→</span>
            </article>
          ))}

          <div style={{ background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.03)", border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)"}`, borderRadius: "16px", padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>✍️</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", letterSpacing: "0.1em" }}>MORE SERIES COMING SOON</div>
            <div style={{ fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.45)", marginTop: "8px" }}>Deep Learning · MLOps · System Design · CUDA Advanced</div>
          </div>
        </div>
      </div>
    </div>
  );
}
