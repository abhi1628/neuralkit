// src/pages/BreakIt.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Shared Complete Challenge Data (5 Per Category) ────────────────────────────────────────────
const CHALLENGE_CATEGORIES = [
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "#3b82f6",
    challenges: [
      { slug: "silent-data-killer", title: "The Silent Data Killer", level: "beginner", time: "3 min", solves: 1247, description: "dropna() silently drops rows. Your revenue calculation is wrong but looks right." },
      { slug: "type-conversion-trap", title: "The Type Conversion Trap", level: "beginner", time: "4 min", solves: 892, description: "String '123' vs int 123. When == works but === fails in data processing." },
      { slug: "merge-mayhem", title: "Merge Mayhem", level: "intermediate", time: "6 min", solves: 634, description: "Pandas merge with how='left' creates duplicates you don't notice until production." },
      { slug: "mutable-default-disaster", title: "The Mutable Default Disaster", level: "intermediate", time: "5 min", solves: 941, description: "Using a mutable object as a default argument leads to state leakage across calls." },
      { slug: "floating-point-finance", title: "Floating-Point FinTech Flaw", level: "advanced", time: "7 min", solves: 512, description: "Binary floats cannot represent currency fractions accurately. Rounding errors pile up." }
    ]
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    icon: "🤖",
    color: "#a855f7",
    challenges: [
      { slug: "accuracy-trap", title: "The Accuracy Trap", level: "intermediate", time: "5 min", solves: 1567, description: "You reported training accuracy. Your model is useless in production." },
      { slug: "leaky-validation", title: "Leaky Validation", level: "advanced", time: "8 min", solves: 423, description: "Preprocessing before split. Your CV scores are lies." },
      { slug: "imbalanced-metrics-mirage", title: "The Imbalanced Class Mirage", level: "intermediate", time: "5 min", solves: 1104, description: "Evaluating highly skewed data distributions with metric parameters unsuited for rare detections." },
      { slug: "data-leakage-temporal", title: "The Chrono-Leakage Paradox", level: "advanced", time: "6 min", solves: 489, description: "Using standard cross-validation methods on time-series datasets leaks future values into history sets." },
      { slug: "vanishing-gradient-activation", title: "The Deep Freeze", level: "advanced", time: "9 min", solves: 312, description: "Staking long Sigmoid stacks inside deeply nested neural network systems triggers gradient attenuation blocks." }
    ]
  },
  {
    id: "sql",
    name: "SQL",
    icon: "🗄️",
    color: "#f59e0b",
    challenges: [
      { slug: "optimized-query", title: "The 'Optimized' Query", level: "advanced", time: "7 min", solves: 789, description: "SELECT * with IN subquery. O(n²) disaster on million-row tables." },
      { slug: "null-in-subquery-trap", title: "The Empty Set Trap", level: "intermediate", time: "5 min", solves: 843, description: "Using NOT IN with a subquery containing any NULL records causes the entire query engine to return zero rows." },
      { slug: "count-falsy-陷阱", title: "The Aggregation Mirage", level: "beginner", time: "3 min", solves: 1421, description: "COUNT(column) skips NULL parameters, but COUNT(*) counts every single record shape." },
      { slug: "havings-vs-where-mixup", title: "The Pre-Filter Failure", level: "intermediate", time: "4 min", solves: 1120, description: "Filtering huge datasets using HAVING instead of WHERE forces full tables to evaluate inside costly aggregations." },
      { slug: "un-parameterized-injection", title: "The open Doorway", level: "advanced", time: "6 min", solves: 932, description: "Direct string string interpolation within execution scripts opens injection vulnerabilities." }
    ]
  },
  {
    id: "apis",
    name: "APIs & Backend",
    icon: "🔌",
    color: "#10b981",
    challenges: [
      { slug: "api-that-works", title: "The API That Works Until It Doesn't", level: "intermediate", time: "5 min", solves: 1123, description: "No status check. No retry. No logging. Script crashes at user 847." },
      { slug: "async-race-condition", title: "The Phantom Inventory Race", level: "advanced", time: "6 min", solves: 612, description: "Concurrent non-atomic API updates cause state data overwrites under load." },
      { slug: "cors-wildcard-exposure", title: "The Open Vault CORS Glitch", level: "intermediate", time: "4 min", solves: 994, description: "Setting CORS access control parameters to wildcards leaks sensitive cookie tracking contexts." },
      { slug: "unhandled-promise-leak", title: "The Unhandled Memory Siphon", level: "advanced", time: "7 min", solves: 520, description: "Orphaned background loop calls leak continuous socket references across requests." },
      { slug: "payload-limit-flood", title: "The JSON Payload Flood", level: "beginner", time: "3 min", solves: 1391, description: "Accepting inbound body arguments without string volume controls leaves servers vulnerable to memory exhaustion attacks." }
    ]
  },
  {
    id: "devops",
    name: "DevOps & MLOps",
    icon: "⚙️",
    color: "#ef4444",
    challenges: [
      { slug: "secure-api-key", title: "The 'Secure' API Key", level: "advanced", time: "6 min", solves: 567, description: "os.getenv returns None silently. Key leaks to Git. $500 bill." },
      { slug: "root-container-vulnerability", title: "The Root Privilege Breach", level: "intermediate", time: "4 min", solves: 843, description: "Running container runtimes without setting up non-root users exposes host architectures to privilege escalation attacks." },
      { slug: "zombie-process-leak", title: "The Zombie Apocalypse", level: "advanced", time: "7 min", solves: 412, description: "Using standard CMD calls instead of init engines inside containers creates uncollected zombie processes." },
      { slug: "cors-wildcard-ml-exposure", title: "The Vulnerable Model weights", level: "intermediate", time: "5 min", solves: 712, description: "Exposing public cloud object storage pathways allows unauthorized third parties to download proprietary model weights." },
      { slug: "latest-tag-instability", title: "The 'Latest' Tag Chaos", level: "beginner", time: "3 min", solves: 1543, description: "Relying on floating image target definitions breaks configuration reproducibility across servers." }
    ]
  },
  {
    id: "system-design",
    name: "System Design",
    icon: "🏗️",
    color: "#ec4899",
    challenges: [
      { slug: "cache-invalidation", title: "Cache Invalidation Nightmare", level: "advanced", time: "10 min", solves: 345, description: "Redis cache never expires. Users see 3-day-old data. 'It works on my machine.'" },
      { slug: "thundering-herd-crash", title: "The Thundering Herd Avalanche", level: "advanced", time: "8 min", solves: 432, description: "Simultaneous expiration of a highly popular cache key allows traffic to flood and crash backend databases." },
      { slug: "retry-storm-cascade", title: "The Cascading Retry Storm", level: "advanced", time: "9 min", solves: 319, description: "Immediate, un-attenuated loop retry scripts amplify minor network hiccups into full-scale system outages." },
      { slug: "read-your-own-writes-gap", title: "The Mirror Dimension Gap", level: "intermediate", time: "6 min", solves: 712, description: "Querying asynchronous read-replicas immediately after writing to a master database serves stale data to users." },
      { slug: "rate-limit-stateless-bypass", title: "The Stateless Gateway Bypass", level: "intermediate", time: "5 min", solves: 894, description: "Tracking rate limit counters in-memory inside load-balanced clusters allows users to bypass restriction ceilings." }
    ]
  },
  {
      id: "cisco-ideathon",
      name: "Cisco Ideathon Sprint",
      icon: "🌐",
      color: "#00bce4",
      challenges: [
        { slug: "cisco-async-leak", title: "The Dangling Websocket Listener", level: "advanced", time: "6 min", solves: 2405, description: "[Cisco Ideathon 2025] Telemetry sockets leak memory across connection refreshes during router monitoring simulations." },
        { slug: "cisco-packet-race", title: "The Out-of-Order Packet Buffer", level: "advanced", time: "8 min", solves: 1102, description: "[Cisco Ideathon 2025] High-throughput async routers process packet fragments out of sequence under micro-burst traffic loads." },
        { slug: "cisco-subnet-overflow", title: "The Classless Subnet Overflow", level: "intermediate", time: "5 min", solves: 1890, description: "[Cisco Ideathon 2024] A custom bitwise IP configuration parser crashes completely on specific edge-case subnet masks." },
        { slug: "cisco-unhandled-rejection", title: "The Express Network Hang", level: "intermediate", time: "4 min", solves: 3120, description: "[Interview Technical Round] Backend microservice server crashes when a physical networking device drops connections abruptly." },
        { slug: "cisco-deadlock-queue", title: "The Thread Lock Deadlock", level: "advanced", time: "7 min", solves: 894, description: "[Cisco Ideathon 2023] Parallel package analytical components lock up indefinitely trying to access sharing telemetry streams." },
        { slug: "cisco-slowloris-timeout", title: "The Corrupt HTTP Gateway", level: "intermediate", time: "5 min", solves: 1450, description: "[Cisco Ideathon 2024] Network load balancer keeps connections open forever when attackers send partial HTTP headers." },
        { slug: "cisco-checksum-failure", title: "The Malformed Checksum Matcher", level: "beginner", time: "3 min", solves: 4120, description: "[Cisco Ideathon Track] Base-16 hexadecimal frame verification returns false due to un-trimmed string allocations." },
        { slug: "cisco-token-bucket", title: "The Exploded Rate Limiter", level: "advanced", time: "6 min", solves: 978, description: "[Cisco Ideathon 2025] High-speed gateway bypass lets traffic slip past strict packet-per-second constraints." },
        { slug: "cisco-dangling-pool", title: "The Orphaned Thread Pool", level: "advanced", time: "9 min", solves: 531, description: "[Interview System Round] Background packet analyzer worker threads remain allocated without releasing kernel loops." },
        { slug: "cisco-dns-cache-poison", title: "The Stateless DNS Lookup Bypass", level: "intermediate", time: "6 min", solves: 1340, description: "[Cisco Ideathon 2024] Dynamic nameserver lookups bypass local cache configurations, flooding external DNS nodes." }
      ]
    },
    // ── PASTE THE NEW TCS TRACK HERE ──
    {
      id: "tcs-digital-ninja",
      name: "TCS Digital / Ninja",
      icon: "💻",
      color: "#6366f1",
      challenges: [
        { slug: "tcs-time-complexity", title: "Optimizing the Subarray Sum", level: "advanced", time: "6 min", solves: 4210, description: "[TCS Digital 2025] A brute-force nested loop times out on large input profiles ($N > 10^5$) inside the compiler." },
        { slug: "tcs-integer-overflow", title: "The Product Array Overflow", level: "intermediate", time: "5 min", solves: 2980, description: "[TCS Digital 2025] Accumulator scripts break and output negative numbers when running extreme test configurations." },
        { slug: "tcs-string-leak", title: "The Silent String Churn", level: "beginner", time: "4 min", solves: 5120, description: "[TCS Ninja 2024] Repeated character string concatenation runs out of memory on standard compiler environments." },
        { slug: "tcs-matrix-boundary", title: "The Empty Matrix Search Collapse", level: "beginner", time: "3 min", solves: 6410, description: "[TCS Ninja 2025] Grid tracking calculations trigger unexpected index errors when processing dynamic empty array inputs." },
        { slug: "tcs-float-precision", title: "The Broken Currency Rounder", level: "intermediate", time: "4 min", solves: 3205, description: "[TCS Digital 2024] Base-2 float accumulator logic drifts and miscalculates salary metrics during high-volume loops." },
        { slug: "tcs-hash-collision", title: "The Plunging Hash Retrieval", level: "advanced", time: "7 min", solves: 1150, description: "[Interview Advanced Track] Custom lookup logic drops from $O(1)$ to a linear $O(N)$ lookup speed because of collision leaks." },
        { slug: "tcs-binary-search-edge", title: "The Missing End Index", level: "intermediate", time: "4 min", solves: 2890, description: "[TCS Ninja 2025] Custom optimized binary search logic fails to check the final array boundary element correctly." },
        { slug: "tcs-recursion-stack", title: "The Un-Memoized Fibonacci Stack", level: "intermediate", time: "5 min", solves: 3760, description: "[Interview Logic Round] Recursive dynamic programming functions hit maximum stack size limits without memoization buffers." },
        { slug: "tcs-graph-cycle", title: "The Infinite Dependency Loop", level: "advanced", time: "8 min", solves: 945, description: "[TCS Digital 2024] Route analytical loops hang indefinitely when mapping components containing cyclic nodes." },
        { slug: "tcs-type-evaluation", title: "The Loose Type Validation Slip", level: "beginner", time: "3 min", solves: 4890, description: "[TCS Ninja 2024] Dynamic input comparisons evaluate invalid user data models safely instead of throwing errors." }
      ]
    }
];

const LEVEL_COLORS = {
  beginner: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399" },
  intermediate: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#b45309" },
  advanced: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#f87171" }
};

export default function BreakIt({ theme }) {
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const ac = isDark ? "#a78bfa" : "#7c3aed";
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [streak] = useState(() => {
    try { return parseInt(localStorage.getItem("breakit_streak") || "0"); } catch { return 0; }
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const totalChallenges = CHALLENGE_CATEGORIES.reduce((acc, cat) => acc + cat.challenges.length, 0);
  const totalSolves = CHALLENGE_CATEGORIES.reduce((acc, cat) => acc + cat.challenges.reduce((a, c) => a + c.solves, 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#08070f" : "#faf8ff", width: "100%" }}>
      {/* ── Hero ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "100px 24px 48px" }}>
        <button onClick={() => navigate("/")} style={{ background: isDark ? "rgba(167,139,250,0.08)" : "rgba(124,58,237,0.07)", border: `1px solid ${isDark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.2)"}`, borderRadius: "8px", color: isDark ? "#a78bfa" : "#7c3aed", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono',monospace", marginBottom: "36px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontWeight: 600 }}>
          ← Back to ZeroAPI
        </button>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: isDark ? "rgba(248,113,113,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${isDark ? "rgba(248,113,113,0.2)" : "rgba(239,68,68,0.18)"}`, borderRadius: "100px", padding: "5px 16px", marginBottom: "20px", fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: isDark ? "#f87171" : "#ef4444", letterSpacing: "0.15em" }}>
          🔥 BREAKIT
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 800, color: isDark ? "#f1f5f9" : "#1e1b4b", letterSpacing: "-0.03em", marginBottom: "14px", lineHeight: 1.1, textAlign: "left" }}>
          Break It. Fix It. <span style={{ color: ac }}>Master It.</span>
        </h1>
        <p style={{ color: isDark ? "rgba(241,245,249,0.55)" : "#4b4580", fontSize: "1.05rem", fontWeight: 300, textAlign: "left", maxWidth: "600px", lineHeight: 1.7 }}>
          Real bugs from real production code. No signup. No IDE setup. Just you, broken code, and the fix.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: "32px", marginTop: "32px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "1.6rem", fontWeight: 700, color: ac }}>{totalChallenges}</div>
            <div style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace", marginTop: "4px" }}>CHALLENGES</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "1.6rem", fontWeight: 700, color: ac }}>{totalSolves.toLocaleString()}</div>
            <div style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace", marginTop: "4px" }}>FIXES SUBMITTED</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "1.6rem", fontWeight: 700, color: ac }}>{streak}</div>
            <div style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace", marginTop: "4px" }}>DAY STREAK</div>
          </div>
        </div>
      </div>

      {/* ── Category Grid ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {CHALLENGE_CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              style={{
                background: isDark ? "rgba(255,255,255,0.025)" : "#fff",
                border: `1px solid ${selectedCategory === cat.id ? `${ac}66` : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"}`,
                borderRadius: "16px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${ac}44`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = selectedCategory === cat.id ? `${ac}66` : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>{cat.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", color: isDark ? "#fff" : "#1a1a1a" }}>{cat.name}</div>
                  <div style={{ fontSize: "0.72rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>{cat.challenges.length} challenges</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {cat.challenges.map(c => {
                  const lc = LEVEL_COLORS[c.level];
                  return (
                    <span key={c.slug} style={{ background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: "100px", padding: "2px 10px", fontSize: "0.62rem", fontFamily: "'Space Mono',monospace", color: lc.text, textTransform: "uppercase" }}>
                      {c.level}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Expanded Category Challenges ── */}
        {selectedCategory && (
          <div style={{ marginTop: "32px" }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: ac, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              ◆ {CHALLENGE_CATEGORIES.find(c => c.id === selectedCategory)?.name} Challenges
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {CHALLENGE_CATEGORIES.find(c => c.id === selectedCategory)?.challenges.map(challenge => {
                const lc = LEVEL_COLORS[challenge.level];
                return (
                  <div
                    key={challenge.slug}
                    onClick={() => navigate(`/breakit/${challenge.slug}`)}
                    style={{
                      background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
                      borderRadius: "12px",
                      padding: "20px 24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${ac}33`; e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"; e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", color: isDark ? "#fff" : "#1a1a1a" }}>{challenge.title}</span>
                        <span style={{ background: lc.bg, border: `1px solid ${lc.border}`, borderRadius: "100px", padding: "2px 10px", fontSize: "0.62rem", fontFamily: "'Space Mono',monospace", color: lc.text, textTransform: "uppercase" }}>{challenge.level}</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)", lineHeight: 1.5, textAlign: "left" }}>{challenge.description}</div>
                      <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)", fontFamily: "'Space Mono',monospace" }}>
                        <span>⏱ {challenge.time}</span>
                        <span>🔧 {challenge.solves.toLocaleString()} fixes</span>
                      </div>
                    </div>
                    <span style={{ color: ac, fontSize: "1.2rem", flexShrink: 0, opacity: 0.7 }}>→</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Submit Your Bug CTA ── */}
        <div style={{ marginTop: "48px", background: isDark ? "rgba(167,139,250,0.03)" : "rgba(124,58,237,0.04)", border: `1px dashed ${isDark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.2)"}`, borderRadius: "16px", padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>🐛</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: isDark ? "#fff" : "#1a1a1a", marginBottom: "8px" }}>Found a nasty bug in production?</div>
          <div style={{ fontSize: "0.85rem", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)", marginBottom: "16px", lineHeight: 1.6 }}>
            Submit it and help thousands of developers learn from your pain.
          </div>
          <button 
            onClick={() => navigate("/contact")}
            style={{ background: "transparent", border: `1px solid ${ac}44`, borderRadius: "10px", padding: "10px 24px", color: ac, fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = `${ac}11`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            Submit a Bug →
          </button>
        </div>
      </div>
    </div>
  );
}
