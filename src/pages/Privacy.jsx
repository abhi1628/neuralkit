import { useNavigate } from "react-router-dom";

export default function Privacy({ theme }) {
  const navigate = useNavigate();
  const isDark = theme === "dark";

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#060a0f" : "#f5f5f5", color: isDark ? "#fff" : "#1a1a1a", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "100px 24px 80px" }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "48px", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}>
          ← Back to ZeroAPI
        </button>

        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#0891b2", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>◆ Legal</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "32px", lineHeight: 1.1 }}>Privacy Policy</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontSize: "0.95rem", lineHeight: 1.85, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)" }}>
          <p><strong>Last updated:</strong> May 20, 2026</p>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginTop: "16px", color: isDark ? "#fff" : "#1a1a1a" }}>1. No Personal Data Collection</h2>
          <p>ZeroAPI does not collect, store, or process any personal data. We do not require user accounts, logins, or registrations. You can use every tool on this site without providing any personal information.</p>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginTop: "16px", color: isDark ? "#fff" : "#1a1a1a" }}>2. AI Query Processing</h2>
          <p>Your inputs to AI tools are sent to <strong>Groq API</strong> for processing. Groq processes data in real-time and does not store it permanently. ZeroAPI does not retain your queries, resume text, or any uploaded files on our servers.</p>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginTop: "16px", color: isDark ? "#fff" : "#1a1a1a" }}>3. Analytics</h2>
          <p>We use <strong>Google Analytics</strong> for anonymous traffic insights only. This includes page views, session duration, and geographic distribution. No personally identifiable information is collected.</p>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginTop: "16px", color: isDark ? "#fff" : "#1a1a1a" }}>4. Cookies</h2>
          <p>We use minimal cookies for theme preference (dark/light mode) stored locally in your browser. No tracking cookies from third parties.</p>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700", marginTop: "16px", color: isDark ? "#fff" : "#1a1a1a" }}>5. Data Retention</h2>
          <p>ZeroAPI does not operate a backend database for user data. All tool outputs are generated in real-time and disappear when you close the browser tab. We do not retain copies.</p>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginTop: "16px", color: isDark ? "#fff" : "#1a1a1a" }}>6. Contact</h2>
          <p>For privacy concerns, contact: <a href="mailto:abhi16.2007@gmail.com" style={{ color: "#0891b2" }}>abhi16.2007@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}
