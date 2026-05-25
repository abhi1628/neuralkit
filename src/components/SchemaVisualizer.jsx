// src/components/SchemaVisualizer.jsx
import { useState, useRef, useMemo } from 'react';
import { useTheme } from '../ThemeContext';

const EXAMPLE_SQL = `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  instructor_id INT NOT NULL,
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);`;

const COL_H = 28, HEADER_H = 40, PAD = 14, MIN_W = 200;
const tableH = (t) => HEADER_H + t.cols.length * COL_H + PAD;
const tableW = () => MIN_W + 60;

export default function SchemaVisualizer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#00ffe0' : '#00897b';

  const [sql,      setSql]      = useState('');
  const [tables,   setTables]   = useState([]);
  const [error,    setError]    = useState('');
  const [fileName, setFileName] = useState('');
  const svgRef  = useRef(null);
  const fileRef = useRef(null);

  function handleSqlFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.sql') && !file.name.endsWith('.txt')) { setError('Please upload a .sql or .txt file.'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => { setSql(ev.target.result); setTables([]); setError(''); };
    reader.readAsText(file);
  }

  function parseSql(input) {
    setError('');
    const parsed = [], fkLinks = [];
    const tableRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\(([^;]+)\)/gi;
    let tm;
    while ((tm = tableRe.exec(input)) !== null) {
      const tName = tm[1], body = tm[2], cols = [];
      body.split(/,(?![^()]*\))/).forEach(line => {
        line = line.trim();
        const fkM = /FOREIGN\s+KEY\s*\(\s*[`"]?(\w+)[`"]?\s*\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\(\s*[`"]?(\w+)[`"]?\s*\)/i.exec(line);
        if (fkM) { fkLinks.push({ from: tName, fromCol: fkM[1], to: fkM[2], toCol: fkM[3] }); return; }
        if (/^\s*(PRIMARY\s+KEY|UNIQUE|INDEX|KEY|CHECK|CONSTRAINT)\s*\(/i.test(line)) return;
        const cm = /[`"]?(\w+)[`"]?\s+(\w+(?:\s*\([^)]*\))?)\s*(.*)/i.exec(line);
        if (cm) { const rest = cm[3].toUpperCase(); cols.push({ name: cm[1], type: cm[2].toUpperCase(), pk: rest.includes('PRIMARY KEY') || rest.includes('PRIMARY'), fk: false, notNull: rest.includes('NOT NULL'), unique: rest.includes('UNIQUE') }); }
      });
      parsed.push({ name: tName, cols });
    }
    if (!parsed.length) { setError('No valid CREATE TABLE statements found.'); return; }
    fkLinks.forEach(fk => {
      const t = parsed.find(t => t.name === fk.from);
      if (t) { const c = t.cols.find(c => c.name === fk.fromCol); if (c) c.fk = { to: fk.to, toCol: fk.toCol }; }
    });
    setTables(parsed.map((t, i) => ({ ...t, x: 30 + (i % 3) * 280, y: 30 + Math.floor(i / 3) * 240 })));
  }

  const links = useMemo(() => {
    const ls = [];
    tables.forEach(t => t.cols.forEach(c => {
      if (c.fk) {
        const target = tables.find(x => x.name === c.fk.to);
        if (target) {
          const x1 = t.x + tableW(), y1 = t.y + HEADER_H + t.cols.indexOf(c) * COL_H + COL_H / 2;
          const x2 = target.x, y2 = target.y + HEADER_H / 2;
          ls.push({ x1, y1, x2, y2, label: `${t.name}.${c.name} → ${target.name}.${c.fk.toCol}` });
        }
      }
    }));
    return ls;
  }, [tables]);

  const svgW = tables.length ? Math.max(...tables.map(t => t.x + tableW() + 60)) : 600;
  const svgH = tables.length ? Math.max(...tables.map(t => t.y + tableH(t) + 60)) : 300;

  function downloadSvg() {
    const svg = svgRef.current; if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'schema-diagram.svg';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function downloadPng() {
    const svg = svgRef.current; if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = svgW * 2; canvas.height = svgH * 2;
      const ctx = canvas.getContext('2d'); ctx.scale(2, 2); ctx.drawImage(img, 0, 0);
      const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'schema-diagram.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  }

  function clearAll() { setSql(''); setTables([]); setError(''); setFileName(''); if (fileRef.current) fileRef.current.value = ''; }

  const bg = isDark ? '#0d1117' : '#f8fafc', tableBg = isDark ? '#161b22' : '#ffffff';
  const headerBg = isDark ? '#1f2937' : '#f0fdfa', border = isDark ? '#30363d' : '#d1fae5';
  const text = isDark ? '#e6edf3' : '#1a1a2e', muted = isDark ? '#8b949e' : '#6b7280';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${fileName ? ac : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)')}`, borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: fileName ? (isDark ? 'rgba(0,255,224,0.04)' : 'rgba(0,137,123,0.04)') : 'transparent', transition: 'all 0.2s' }}>
        <input ref={fileRef} type="file" accept=".sql,.txt" style={{ display: 'none' }} onChange={handleSqlFile} />
        <span style={{ fontSize: '1.4rem' }}>{fileName ? '📄' : '⬆️'}</span>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: fileName ? ac : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)') }}>{fileName || 'Upload .sql file'}</div>
          <div style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', marginTop: '2px' }}>Supports .sql · .txt — or paste below</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }}>OR PASTE SQL</span>
        <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
      </div>
      <div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: ac, letterSpacing: '0.1em', marginBottom: '8px' }}>PASTE SQL (MySQL · PostgreSQL · SQLite)</div>
        <textarea value={sql} onChange={e => { setSql(e.target.value); if (fileName) setFileName(''); }} rows={8} placeholder={EXAMPLE_SQL} className="tool-textarea" style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.78rem' }} />
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => parseSql(sql)} className="run-btn" style={{ flex: '0 0 auto', padding: '10px 24px' }}>⚡ Generate Diagram</button>
        <button onClick={() => { setSql(EXAMPLE_SQL); setTables([]); setError(''); setFileName(''); if (fileRef.current) fileRef.current.value = ''; }} className="action-btn">Try Example</button>
        {(tables.length > 0 || sql) && <button onClick={clearAll} className="action-btn" style={{ color: ac, borderColor: ac }}>↺ Clear</button>}
        {tables.length > 0 && <><button onClick={downloadSvg} className="action-btn">⬇ SVG</button><button onClick={downloadPng} className="action-btn">⬇ PNG</button></>}
      </div>
      {error && <div className="error-box">⚠ {error}</div>}
      {tables.length > 0 && (
        <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '14px', overflow: 'auto', padding: '8px' }}>
          <svg ref={svgRef} width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', minWidth: svgW }}>
            <rect width={svgW} height={svgH} fill={bg} />
            <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={ac} /></marker></defs>
            {links.map((l, i) => { const mx = (l.x1 + l.x2) / 2; return <g key={i}><path d={`M${l.x1},${l.y1} C${mx},${l.y1} ${mx},${l.y2} ${l.x2},${l.y2}`} fill="none" stroke={ac} strokeWidth="1.5" strokeDasharray="6,3" markerEnd="url(#arrow)" opacity="0.7" /><text x={mx} y={(l.y1 + l.y2) / 2 - 5} fill={muted} fontSize="9" fontFamily="monospace" textAnchor="middle">{l.label}</text></g>; })}
            {tables.map(t => {
              const tw = tableW(), th = tableH(t);
              return (
                <g key={t.name} transform={`translate(${t.x},${t.y})`}>
                  <rect width={tw} height={th} rx="8" fill={tableBg} stroke={ac} strokeWidth="1.5" />
                  <rect width={tw} height={HEADER_H} rx="8" fill={headerBg} stroke={ac} strokeWidth="1.5" />
                  <rect y={HEADER_H - 8} width={tw} height={8} fill={headerBg} />
                  <text x={tw / 2} y={HEADER_H / 2 + 5} textAnchor="middle" fill={ac} fontSize="13" fontFamily="monospace" fontWeight="bold">{t.name}</text>
                  {t.cols.map((c, ci) => {
                    const cy = HEADER_H + ci * COL_H, badge = c.pk ? 'PK' : c.fk ? 'FK' : null, badgeColor = c.pk ? '#f59e0b' : '#a78bfa';
                    return (
                      <g key={c.name}>
                        <rect x={0} y={cy} width={tw} height={COL_H} fill={ci % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')} />
                        <line x1={0} y1={cy} x2={tw} y2={cy} stroke={border} strokeWidth="0.5" />
                        {badge && <><rect x={8} y={cy + 7} width={22} height={13} rx="3" fill={badgeColor} opacity="0.2" /><text x={19} y={cy + 18} textAnchor="middle" fill={badgeColor} fontSize="8" fontFamily="monospace" fontWeight="bold">{badge}</text></>}
                        <text x={badge ? 36 : 12} y={cy + 18} fill={text} fontSize="11" fontFamily="monospace">{c.name}</text>
                        <text x={tw - 8} y={cy + 18} textAnchor="end" fill={muted} fontSize="10" fontFamily="monospace">{c.type}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      )}
      {tables.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tables.map(t => <span key={t.name} style={{ background: isDark ? 'rgba(0,255,224,0.08)' : 'rgba(0,137,123,0.08)', border: `1px solid ${ac}33`, borderRadius: '100px', padding: '3px 12px', fontFamily: "'Space Mono',monospace", fontSize: '0.68rem', color: ac }}>{t.name} ({t.cols.length} cols)</span>)}
        </div>
      )}
    </div>
  );
}
