import { useNavigate } from "react-router-dom";

export default function Contact({ theme }) {
  const navigate = useNavigate();
  const isDark = theme === "dark";

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5", color: isDark ? "#fff" : "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "100px 24px 80px" }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "48px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
          ← Back to ZeroAPI
        </button>

        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#0891b2", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>◆ Contact</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "32px", lineHeight: 1.1 }}>Get in Touch</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, borderRadius: "16px", padding: "28px" }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px", color: isDark ? "#fff" : "#1a1a1a" }}>Prof. Abhishek Singh</h2>
            <p style={{ fontSize: "0.9rem", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", marginBottom: "16px", lineHeight: 1.7 }}>Assistant Professor, CSE Department<br/>Baderia Global Institute of Engineering and Management<br/>Jabalpur, Madhya Pradesh, India</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.2rem" }}>📧</span>
                <a href="mailto:abhi16.2007@gmail.com" style={{ color: "#0891b2", fontSize: "0.9rem", textDecoration: "none" }}>abhi16.2007@gmail.com</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.2rem" }}>📍</span>
                <span style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", fontSize: "0.9rem" }}>Jabalpur, MP, India</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.2rem" }}>🎓</span>
                <span style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", fontSize: "0.9rem" }}>M.Tech — Data Science & VLSI Design</span>
              </div>
            </div>
          </div>

          <div style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, borderRadius: "16px", padding: "28px" }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px", color: isDark ? "#fff" : "#1a1a1a" }}>Connect</h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href="https://www.youtube.com/@pyofpython9668" target="_blank" rel="noopener noreferrer" style={{ background: "#ff0000", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontFamily: "'Space Mono',monospace", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="white" opacity="0.2"/><polygon points="9.5,7.5 9.5,16.5 17,12" fill="white"/></svg>
                YouTube
              </a>
              <a href="https://www.amazon.com/Agentic-Systems-Engineering-intelligent-collaborate/dp/B0GX5FBCSM" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg,#00ffe0,#0af)", color: "#000", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontFamily: "'Space Mono',monospace", fontSize: "0.8rem", fontWeight: 700 }}>
                📘 Amazon Book
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
