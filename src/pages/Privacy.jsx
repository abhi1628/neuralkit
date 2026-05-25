import { useNavigate } from "react-router-dom";

export default function Privacy({ theme }) {
  const navigate = useNavigate();
  const isDark   = theme === "dark";
  const ac       = isDark ? "#a78bfa" : "#7c3aed";
  const gradient = isDark
    ? "linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)"
    : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)";

  const sections = [
    { title: "1. No Personal Data Collection", body: "ZeroAPI does not collect, store, or process any personal data. We do not require user accounts, logins, or registrations. You can use every tool on this site without providing any personal information." },
    { title: "2. AI Query Processing", body: "Your inputs to AI tools are sent to Groq API for processing. Groq processes data in real-time and does not store it permanently. ZeroAPI does not retain your queries, resume text, or any uploaded files on our servers." },
    { title: "3. Analytics", body: "We use Google Analytics for anonymous traffic insights only — page views, session duration, and geographic distribution. No personally identifiable information is collected." },
    { title: "4. Cookies", body: "We use minimal cookies for theme preference (dark/light mode) stored locally in your browser. No tracking cookies from third parties." },
    { title: "5. Data Retention", body: "ZeroAPI does not operate a backend database for user data. All tool outputs are generated in real-time and disappear when you close the browser tab. We do not retain copies." },
    { title: "6. Feedback & Comments", body: "If you submit feedback or blog comments, your message and display name are stored in our database (Supabase). Your name is partially masked for privacy. You may request deletion by emailing us." },
    { title: "7. Contact", body: null, contact: "abhi16.2007@gmail.com" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ background: isDark ? "rgba(167,139,250,0.06)" : "rgba(124,58,237,0.05)", borderBottom: `1px solid ${isDark ? "rgba(167,139,250,0.12)" : "rgba(124,58,237,0.1)"}`, padding: "24px 24px 0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <button onClick={() => navigate("/")} style={{ background: isDark ? "rgba(167,139,250,0.1)" : "rgba(124,58,237,0.08)", border: `1px solid ${isDark ? "rgba(167,139,250,0.22)" : "rgba(124,58,237,0.22)"}`, borderRadius: "8px", color: ac, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontWeight: 600, marginBottom: "28px" }}>
            ← Back to ZeroAPI
          </button>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.15em", marginBottom: "16px" }}>◆ LEGAL</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2.2rem,5vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "14px", background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>Privacy Policy</h1>
          <p style={{ fontSize: "0.82rem", color: isDark ? "rgba(241,245,249,0.45)" : "#6d6a8a", fontFamily: "'Space Mono',monospace", marginBottom: "32px", display: "block" }}>Last updated: May 20, 2026</p>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ background: isDark ? "rgba(167,139,250,0.07)" : "rgba(124,58,237,0.05)", border: `1px solid ${isDark ? "rgba(167,139,250,0.18)" : "rgba(124,58,237,0.15)"}`, borderRadius: "16px", padding: "24px 28px", marginBottom: "36px" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.12em", marginBottom: "14px" }}>◆ IN PLAIN ENGLISH</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {["No user accounts or logins required", "Your text inputs are not stored by ZeroAPI", "No tracking cookies — only theme preference locally", "Google Analytics for anonymous traffic stats only", "Feedback/comments stored with partially masked names"].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.88rem", color: isDark ? "rgba(241,245,249,0.8)" : "#3730a3" }}>
                <span style={{ color: ac, flexShrink: 0, fontWeight: 700 }}>✓</span>{item}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((s, i) => (
            <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.025)" : "#ffffff", border: `1px solid ${isDark ? "rgba(167,139,250,0.1)" : "rgba(124,58,237,0.09)"}`, borderRadius: "14px", padding: "22px 26px" }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: isDark ? "#f1f5f9" : "#1e1b4b", marginBottom: "10px" }}>{s.title}</h2>
              {s.body && <p style={{ fontSize: "0.92rem", color: isDark ? "rgba(241,245,249,0.7)" : "#4b4580", lineHeight: 1.85, margin: 0 }}>{s.body}</p>}
              {s.contact && (
                <p style={{ fontSize: "0.92rem", color: isDark ? "rgba(241,245,249,0.7)" : "#4b4580", lineHeight: 1.85, margin: 0 }}>
                  For privacy concerns, contact:{" "}
                  <a href={`mailto:${s.contact}`} style={{ color: ac, fontWeight: 600, textDecoration: "none", borderBottom: `1px solid ${ac}55` }}>{s.contact}</a>
                </p>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "36px", paddingTop: "24px", borderTop: `1px solid ${isDark ? "rgba(167,139,250,0.1)" : "rgba(124,58,237,0.08)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.68rem", color: isDark ? "rgba(241,245,249,0.3)" : "#6d6a8a" }}>© {new Date().getFullYear()} ZeroAPI · Built with ❤ in Jabalpur, India</span>
          <button onClick={() => navigate("/")} style={{ background: gradient, border: "none", borderRadius: "8px", padding: "8px 20px", color: "#fff", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>Go to ZeroAPI →</button>
        </div>
      </div>
    </div>
  );
}
