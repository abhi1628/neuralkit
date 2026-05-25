// src/components/LineNumbers.jsx
export default function LineNumbers({ code }) {
  const count = (code || '').split('\n').length;
  return (
    <div style={{ userSelect: 'none', paddingRight: '12px', textAlign: 'right', color: 'rgba(255,255,255,0.2)', fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', lineHeight: '1.6', minWidth: '32px' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}
