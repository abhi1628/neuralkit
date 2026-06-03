// src/components/DevToolsPanel.jsx
// 1. ADDED: useEffect hook imported here cleanly
import { useState, useEffect } from 'react'; 
import { useTheme } from '../ThemeContext';
import { DEV_TOOLS } from '../constants';
import ToolCard from './ToolCard';
import SchemaVisualizer from './SchemaVisualizer';
import CsvVisualizer from './CsvVisualizer';
import InterviewCoach from './InterviewCoach';

export default function DevToolsPanel() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';
  const [active, setActive] = useState(0);
  const info = DEV_TOOLS[active];

  return (
    <section id="devtools" style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 32px 120px' }}>
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>◆ Dev Tools</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#fff' : '#1a1a1a' }}>Visual. Interactive. Zero Signup.</h2>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.6)', marginTop: '14px', fontSize: '1rem', fontWeight: 300 }}>
          Tools that go beyond text — diagrams, charts, and simulations that ChatGPT can&apos;t render.
        </p>
      </div>
      <div className="tool-row" style={{ display: 'flex', gap: '10px', marginBottom: '36px', flexWrap: 'wrap' }}>
        {DEV_TOOLS.map((t, i) => (
          <ToolCard key={t.id} icon={t.icon} name={t.name} tagline={t.tagline} active={active === i} onClick={() => setActive(i)} fullWidth={false} />
        ))}
      </div>
      <div className="tool-panel" style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '20px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingBottom: '20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
          <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: isDark ? '#fff' : '#1a1a1a' }}>{info.name}</div>
            <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.6)', marginTop: '2px' }}>{info.tagline}</div>
          </div>
        </div>
        {active === 0 && <SchemaVisualizer />}
        {active === 1 && <CsvVisualizer />}
        {active === 2 && <InterviewCoach />}
      </div>
    </section>
  );
}

// ── 2. PLACED HERE: Named export block cleanly attached at the bottom ──
// src/components/DevToolsPanel.jsx - Bottom Section Fix

export function AnalyticsDashboardSnippet() {
  const [metrics, setMetrics] = useState({ views: {}, runs: {} });
  const [loading, setLoading] = useState(true);
  
  // ✅ FIXED: Initializing theme references to eliminate the reference error crash
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  useEffect(() => {
    fetch('/api/analytics-stats')
      .then(res => res.json())
      .then(data => { 
        setMetrics(data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", color: ac, padding: "20px 0" }}>
        Collecting platform usage logs...
      </div>
    );
  }

  return (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', color: isDark ? '#fff' : '#1a1a1a' }}>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: 0 }}>📊 Platform Performance Dashboard</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
        {/* View Frequency Logs */}
        <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: ac, marginBottom: '10px' }}>◆ SEO PAGE VIEWS</div>
          {Object.entries(metrics.views || {}).length === 0 ? <span style={{ fontSize: '0.8rem', color: 'gray' }}>No active page views logged yet.</span> : 
            Object.entries(metrics.views).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '4px 0' }}>
                <span style={{ fontFamily: "'Space Mono', monospace" }}>/{key}</span>
                <span style={{ fontWeight: 700 }}>{val} views</span>
              </div>
            ))}
        </div>

        {/* Runtime Model Generation Counts */}
        <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: '#34d399', marginBottom: '10px' }}>◆ MODEL RUN INVOCATIONS</div>
          {Object.entries(metrics.runs || {}).length === 0 ? <span style={{ fontSize: '0.8rem', color: 'gray' }}>No execution logs transmitted.</span> : 
            Object.entries(metrics.runs).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '4px 0' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem' }}>{key}</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>{val} calls</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
