// src/components/DevToolsPanel.jsx
import { useState } from 'react';
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
