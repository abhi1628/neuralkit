// src/components/ToolCard.jsx
import { useTheme } from '../ThemeContext';

export default function ToolCard({ icon, name, tagline, active, onClick, fullWidth = true }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  return (
    <button
      onClick={onClick}
      className={active ? '' : 'tool-card-inactive'}
      style={{
        // On mobile wraps into 2-col grid, desktop stays in row
        flex: fullWidth ? '1 1 140px' : '1 1 140px',
        minWidth: '140px',
        background: active
          ? (isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.07)')
          : (isDark ? 'rgba(255,255,255,0.025)' : '#ffffff'),
        border: `1px solid ${active ? ac : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)')}`,
        borderRadius: '14px',
        padding: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: active ? `0 0 0 1px ${ac}` : 'none',
      }}
      aria-pressed={active}
    >
      {/* Active top bar */}
      {active && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${ac}, #818cf8)` }} />
      )}

      {/* Icon */}
      <div style={{ fontSize: '1.3rem', marginBottom: '8px', lineHeight: 1 }}>{icon}</div>

      {/* Name */}
      <div style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: '0.88rem',
        color: active ? ac : (isDark ? '#f1f5f9' : '#1e1b4b'),
        marginBottom: '4px',
        lineHeight: 1.3,
        wordBreak: 'break-word',
      }}>
        {name}
      </div>

      {/* Tagline — hidden on very small cards to keep layout clean */}
      <div style={{
        fontSize: '0.7rem',
        color: isDark ? 'rgba(241,245,249,0.45)' : '#6d6a8a',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {tagline}
      </div>
    </button>
  );
}
