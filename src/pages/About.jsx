import { useNavigate } from "react-router-dom";

export default function About({ theme }) {
  const navigate = useNavigate();
  const isDark = theme === "dark";

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5", color: isDark ? "#fff" : "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "100px 24px 80px" }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "48px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
          ← Back to ZeroAPI
        </button>

        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#0891b2", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>◆ About</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "32px", lineHeight: 1.1 }}>Built by an AI Researcher for Everyone</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "1rem", lineHeight: 1.85, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)" }}>
          <p><strong style={{ color: isDark ? "#fff" : "#1a1a1a" }}>ZeroAPI</strong> is built by <strong style={{ color: isDark ? "#fff" : "#1a1a1a" }}>Prof. Abhishek Singh</strong>, Assistant Professor of Computer Science & Engineering at Baderia Global Institute of Engineering and Management, Jabalpur, Madhya Pradesh, India.</p>

          <p>With an M.Tech in Data Science and VLSI Design, and as author of <em style={{ color: "#0891b2" }}>"Agentic AI Systems: Design & Engineering"</em>, Prof. Singh created ZeroAPI as the practical companion to his book — real AI tools, real code, zero gatekeeping.</p>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", fontWeight: 700, marginTop: "16px", marginBottom: "8px", color: isDark ? "#fff" : "#1a1a1a" }}>Mission</h2>
          <p>Powerful AI tools shouldn't be locked behind paywalls or API keys. Everything here runs free, instantly, with zero signup. ZeroAPI exists because students, developers, and researchers in India deserve access to the same tools as Silicon Valley engineers.</p>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", fontWeight: 700, marginTop: "16px", marginBottom: "8px", color: isDark ? "#fff" : "#1a1a1a" }}>Credentials</h2>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>Assistant Professor, CSE Department, Baderia Global Institute</li>
            <li>M.Tech — Data Science & VLSI Design</li>
            <li>Author: <em>Agentic AI Systems: Design & Engineering</em></li>
            <li>YouTube: <a href="https://www.youtube.com/@pyofpython9668" target="_blank" rel="noopener noreferrer" style={{ color: "#0891b2" }}>@pyofpython</a> — 1.4K+ subscribers</li>
          </ul>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", fontWeight: 700, marginTop: "16px", marginBottom: "8px", color: isDark ? "#fff" : "#1a1a1a" }}>Contact</h2>
          <p>Email: <a href="mailto:abhi16.2007@gmail.com" style={{ color: "#0891b2" }}>abhi16.2007@gmail.com</a></p>
          <p>Location: Jabalpur, Madhya Pradesh, India</p>

          <div style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="https://www.amazon.com/Agentic-Systems-Engineering-intelligent-collaborate/dp/B0GX5FBCSM" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg,#00ffe0,#0af)", color: "#000", fontWeight: 700, padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Space Mono',monospace", fontSize: "0.85rem" }}>📘 Explore the Book →</a>
            <a href="https://www.youtube.com/@pyofpython9668" target="_blank" rel="noopener noreferrer" style={{ background: "transparent", border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontFamily: "'Space Mono',monospace", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#ff0000"/><polygon points="9.5,7.5 9.5,16.5 17,12" fill="white"/></svg>
              pyofpython
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
