// src/components/WordCounter.jsx
import { useTheme } from '../ThemeContext';
import { countWords } from '../utils';

export default function WordCounter({ text, limit }) {
  const { theme } = useTheme();
  const words = countWords(text);
  const pct   = (words / limit) * 100;

  const barColor = () => {
    if (pct >= 100) return '#ff6b6b';
    if (pct >= 80)  return theme === 'dark' ? '#febc2e' : '#d97706';
    if (words > 0)  return theme === 'dark' ? '#a78bfa' : '#5b21b6';
    return theme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : '#64748b' }}>
      <span style={{ color: pct >= 100 ? '#ff6b6b' : barColor() }}>{words.toLocaleString()}</span>
      <span>/</span>
      <span>{limit.toLocaleString()}</span>
      <span>words</span>
      {pct >= 80 && pct < 100 && (
        <span style={{ color: theme === 'dark' ? '#febc2e' : '#d97706' }}>— Approaching limit</span>
      )}
      <div style={{ marginLeft: 'auto', width: '80px', height: '4px', background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor(), borderRadius: '2px', transition: 'all 0.3s' }} />
      </div>
    </div>
  );
}
