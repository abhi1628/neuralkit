// src/components/DevToolsPanel.jsx
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

export function AnalyticsDashboardSnippet() {
  const [metrics, setMetrics] = useState({ views: {}, runs: {}, dailyTrends: [], liveUsers: 0, toolBreakdown: {} });
  const [loading, setLoading] = useState(true);
  
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  useEffect(() => {
    fetch('/api/analytics-stats', {
      headers: { 'X-Admin-Secret': 'zeroapi#2026_anika_avnika_x7' }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => { 
        setMetrics(data); 
        setLoading(false); 
      })
      .catch(() => {
        setMetrics({ views: {}, runs: {}, dailyTrends: [], liveUsers: 0, toolBreakdown: {}, error: 'Access denied or server error' });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.8rem", color: ac, padding: "20px 0" }}>
        Collecting platform usage logs...
      </div>
    );
  }

  const maxTrend = Math.max(...(metrics.dailyTrends?.map(d => d.total) || [1]), 1);

  return (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px', color: isDark ? '#fff' : '#1a1a1a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: 0, fontSize: '1.2rem' }}>📊 Platform Performance Dashboard</h3>
        
        {/* Live Users Badge */}
        {metrics.liveUsers > 0 && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px',
            background: isDark ? 'rgba(52,211,153,0.15)' : 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }}></span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>{metrics.liveUsers} active now</span>
          </div>
        )}
      </div>

      {/* Daily Trends Bar Chart */}
      {metrics.dailyTrends?.length > 0 && (
        <div style={{ 
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', 
          padding: '16px', borderRadius: '12px', 
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: ac, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>◆ LAST 7 DAYS TREND</span>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>Views + Runs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', paddingBottom: '24px' }}>
            {metrics.dailyTrends.map((day, i) => (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  {/* Views portion */}
                  <div style={{ 
                    width: '100%', 
                    height: `${(day.views / maxTrend) * 60}px`,
                    background: ac,
                    borderRadius: '3px 3px 0 0',
                    minHeight: day.views > 0 ? '2px' : '0'
                  }}></div>
                  {/* Runs portion */}
                  <div style={{ 
                    width: '100%', 
                    height: `${(day.runs / maxTrend) * 60}px`,
                    background: '#34d399',
                    borderRadius: '0 0 3px 3px',
                    minHeight: day.runs > 0 ? '2px' : '0'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.6rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontFamily: "'Space Mono', monospace" }}>
                  {day.date.slice(5)} {/* MM-DD */}
                </span>
                {day.total > 0 && (
                  <span style={{ fontSize: '0.55rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', position: 'absolute', marginTop: '-90px' }}>
                    {day.total}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', marginTop: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', background: ac, borderRadius: '2px' }}></span> Views
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', background: '#34d399', borderRadius: '2px' }}></span> Runs
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
        {/* SEO Page Views */}
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

        {/* Model Run Invocations */}
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

      {/* Tool Breakdown (NEW) */}
      {Object.keys(metrics.toolBreakdown || {}).length > 0 && (
        <div style={{ 
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', 
          padding: '16px', borderRadius: '12px', 
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: '#fbbf24', marginBottom: '12px' }}>◆ TOOL BREAKDOWN</div>
          {Object.entries(metrics.toolBreakdown).map(([toolName, data]) => (
            <div key={toolName} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toolName}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>{data.count} total</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(data.models).map(([model, count]) => (
                  <span key={model} style={{ 
                    fontSize: '0.7rem', 
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    padding: '2px 8px', borderRadius: '4px',
                    fontFamily: "'Space Mono', monospace"
                  }}>
                    {model}: {count}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals Footer */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
        fontFamily: "'Space Mono', monospace", paddingTop: '8px',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`
      }}>
        <span>Grand Total: {metrics.grandTotal || 0} events</span>
        <span>{metrics.totalViews || 0} views · {metrics.totalRuns || 0} runs</span>
      </div>
    </div>
  );
}
