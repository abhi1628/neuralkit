// src/components/ToolCard.jsx
import { useTheme } from '../ThemeContext';

export default function ToolCard({ icon, name, tagline, active, onClick, fullWidth = true }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#00ffe0' : '#00897b';

  return (
    <button
      onClick={onClick}
      className={active ? '' : 'tool-card-inactive'}
      style={{
        flex: fullWidth ? '1 1 0' : '1 1 160px',
        background: active
          ? (isDark ? 'rgba(0,255,224,0.06)' : 'rgba(0,137,123,0.06)')
          : (isDark ? 'rgba(255,255,255,0.025)' : '#fff'),
        border: `1px solid ${active ? ac : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)')}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-pressed={active}
    >
      {active && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${ac}, #0af)` }} />
      )}
      <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: active ? ac : (isDark ? '#fff' : '#0f172a'), marginBottom: '4px' }}>
        {name}
      </div>
      <div style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b', lineHeight: 1.5 }}>
        {tagline}
      </div>
    </button>
  );
}
