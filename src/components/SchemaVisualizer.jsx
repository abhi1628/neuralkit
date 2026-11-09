// src/components/SchemaVisualizer.jsx — SQL DDL → entity-relationship diagram
//
//  • Paste or upload a schema (PostgreSQL / MySQL / SQL Server / SQLite / generic). Dumps from pg_dump, mysqldump and SSMS work:
//    schema-qualified names, [brackets], ALTER TABLE foreign keys, composite keys, comments — all handled in lib/schemaCore
//  • Auto-layout (parents left, children right), drag tables, pan, zoom (buttons, Ctrl+wheel, pinch), fit-to-screen
//  • Crow's-foot notation (1:N, 1:1, optional), self-references, junction tables highlighted
//  • Hover or select a table to highlight its relationships; search to find a table
//  • Design checks (missing primary key, type mismatches, unindexed foreign keys, missing tables)
//  • Sample JOIN queries, Mermaid / DBML export, SVG / PNG download — all generated locally; your SQL never leaves the browser

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { trackEvent } from '../utils';
import { downloadBlob, copyTo } from '../resumeCore';
import {
  parseSchema, analyzeSchema, layoutTables, LAYOUT, toMermaid, toDbml, sampleQueries, SAMPLE_SQL,
} from '../lib/schemaCore';

const ACCENT = '#8b5cf6';
const MAX_FILE_MB = 4;

function tokens(d) {
  return {
    d, text: d ? '#ffffff' : '#1a1a1a', sub: d ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.72)', mute: d ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.5)',
    line: d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)', soft: d ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.035)', card: d ? 'rgba(255,255,255,0.03)' : '#ffffff',
    input: d ? 'rgba(255,255,255,0.06)' : '#ffffff', inputLine: d ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.18)',
    ac: 'var(--accent)', acSoft: d ? 'rgba(167,139,250,0.13)' : 'rgba(124,58,237,0.08)', acLine: d ? 'rgba(167,139,250,0.42)' : 'rgba(124,58,237,0.36)',
    good: d ? '#34d399' : '#059669', bad: d ? '#f87171' : '#dc2626', warn: d ? '#fbbf24' : '#b45309', info: d ? '#60a5fa' : '#2563eb',
    mono: "'Space Mono', monospace", sans: "'DM Sans', sans-serif",
    // literal colours for the SVG (so SVG / PNG export has no CSS variables)
    canvas: d ? '#14141c' : '#f7f6fb', tbl: d ? '#1f1f2b' : '#ffffff', tblHead: d ? '#2c2a45' : '#ede9fe', tblHeadJ: d ? '#3a2f3f' : '#fce7f3', tblLine: d ? '#3a3a4d' : '#d8d4e6',
    svgText: d ? '#e8e9f2' : '#1f2937', svgMute: d ? '#9aa0b4' : '#6b7280', edge: d ? '#8b8fa8' : '#7c7f95',
  };
}

function Btn({ tk, children, onClick, disabled, kind = 'soft', style, title, pressed }) {
  const k = {
    soft: { background: tk.soft, border: `1px solid ${tk.line}`, color: tk.sub },
    accent: { background: tk.acSoft, border: `1px solid ${tk.acLine}`, color: tk.ac },
    primary: { background: 'linear-gradient(135deg,#a78bfa,#818cf8)', border: 'none', color: '#fff', fontWeight: 700 },
  }[kind];
  return <button type="button" title={title} aria-pressed={pressed} onClick={onClick} disabled={disabled} style={{ fontFamily: tk.mono, fontSize: '0.72rem', borderRadius: 9, padding: '8px 13px', minHeight: 36, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', ...k, ...style }}>{children}</button>;
}
function Label({ tk, children, style }) { return <div style={{ fontFamily: tk.mono, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tk.ac, marginBottom: 6, ...style }}>{children}</div>; }
function Chip({ tk, color, children }) { return <span style={{ fontFamily: tk.mono, fontSize: '0.66rem', padding: '3px 9px', borderRadius: 999, border: `1px solid ${color}55`, background: `${color}18`, color, display: 'inline-block', whiteSpace: 'nowrap' }}>{children}</span>; }
function Notice({ tk, kind = 'info', children }) {
  const c = { info: tk.info, warn: tk.warn, bad: tk.bad, good: tk.good }[kind];
  return <div role={kind === 'bad' ? 'alert' : 'status'} style={{ border: `1px solid ${c}55`, background: `${c}12`, borderRadius: 10, padding: '9px 13px', fontFamily: tk.sans, fontSize: '0.84rem', lineHeight: 1.55, color: tk.text }}>{children}</div>;
}

const trunc = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s));

/* crow's-foot end markers. (x,y) is the point on the table edge; side = +1 when the line leaves to the right, -1 to the left */
function Marker({ x, y, side, many, optional, color }) {
  const s = side;
  const els = [];
  if (many) {
    els.push(<path key="f" d={`M${x + s * 13},${y} L${x},${y - 6} M${x + s * 13},${y} L${x},${y} M${x + s * 13},${y} L${x},${y + 6}`} stroke={color} strokeWidth="1.4" fill="none" />);
    els.push(<circle key="o" cx={x + s * 19} cy={y} r="4" fill="none" stroke={color} strokeWidth="1.4" />);
  } else {
    els.push(<path key="b1" d={`M${x + s * 7},${y - 6} L${x + s * 7},${y + 6}`} stroke={color} strokeWidth="1.6" />);
    if (optional) els.push(<circle key="o" cx={x + s * 15} cy={y} r="4" fill="none" stroke={color} strokeWidth="1.4" />);
    else els.push(<path key="b2" d={`M${x + s * 12},${y - 6} L${x + s * 12},${y + 6}`} stroke={color} strokeWidth="1.6" />);
  }
  return <g>{els}</g>;
}

function useSize(ref) {
  const [s, setS] = useState({ w: 800, h: 520 });
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const set = () => { const r = el.getBoundingClientRect(); if (r.width > 0) setS({ w: Math.max(280, Math.floor(r.width)), h: window.innerWidth < 640 ? 440 : 580 }); };
    set();
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(set); ro.observe(el); return () => ro.disconnect(); }
    window.addEventListener('resize', set); return () => window.removeEventListener('resize', set);
  }, [ref]);
  return s;
}

/* ═════════════════════ main ═════════════════════ */
export default function SchemaVisualizer() {
  const { theme } = useTheme();
  const tk = useMemo(() => tokens(theme === 'dark'), [theme]);
  const boxRef = useRef(null);
  const svgRef = useRef(null);
  const fileRef = useRef(null);
  const { w: W, h: H } = useSize(boxRef);

  const [sql, setSql] = useState('');
  const [deb, setDeb] = useState('');
  const [tab, setTab] = useState('diagram');
  const [overrides, setOverrides] = useState({});
  const [expanded, setExpanded] = useState(() => new Set());
  const [selected, setSelected] = useState('');
  const [hover, setHover] = useState('');
  const [view, setView] = useState({ x: 20, y: 20, k: 1 });
  const [showTypes, setShowTypes] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const drag = useRef(null);
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const userMoved = useRef(false);

  useEffect(() => { const t = setTimeout(() => setDeb(sql), 300); return () => clearTimeout(t); }, [sql]);

  const schema = useMemo(() => (deb.trim() ? parseSchema(deb) : null), [deb]);
  const issues = useMemo(() => (schema ? analyzeSchema(schema) : []), [schema]);
  const queries = useMemo(() => (schema ? sampleQueries(schema) : []), [schema]);
  const base = useMemo(() => (schema ? layoutTables(schema, expanded) : {}), [schema, expanded]);
  const pos = useMemo(() => {
    const out = {};
    Object.entries(base).forEach(([id, b]) => { out[id] = { ...b, ...(overrides[id] ? { x: overrides[id].x, y: overrides[id].y } : {}) }; });
    return out;
  }, [base, overrides]);
  const byId = useMemo(() => new Map((schema?.tables || []).map((t) => [t.id, t])), [schema]);

  const flashMsg = (m) => { setFlash(m); setTimeout(() => setFlash(''), 2200); };

  /* ── view helpers ── */
  const bounds = useCallback(() => {
    const b = Object.values(pos);
    if (!b.length) return null;
    const minX = Math.min(...b.map((p) => p.x)), minY = Math.min(...b.map((p) => p.y));
    const maxX = Math.max(...b.map((p) => p.x + p.w)), maxY = Math.max(...b.map((p) => p.y + p.h));
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
  }, [pos]);

  const fit = useCallback(() => {
    const b = bounds(); if (!b) return;
    const k = Math.max(0.12, Math.min((W - 40) / (b.w + 40), (H - 40) / (b.h + 40), 1.1));
    setView({ k, x: (W - b.w * k) / 2 - b.minX * k, y: Math.max(16, (H - b.h * k) / 2) - b.minY * k });
  }, [bounds, W, H]);

  // new schema → reset layout and fit
  useEffect(() => { setOverrides({}); setExpanded(new Set()); setSelected(''); userMoved.current = false; }, [schema]);
  useEffect(() => { if (!userMoved.current) fit(); }, [schema, base, W, H]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomAt = (factor, cx = W / 2, cy = H / 2) => setView((v) => {
    const k = Math.max(0.1, Math.min(2.5, v.k * factor));
    return { k, x: cx - ((cx - v.x) / v.k) * k, y: cy - ((cy - v.y) / v.k) * k };
  });

  /* ── pointer handling: pan background, drag tables, pinch ── */
  const toLocal = (e) => { const r = svgRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onBgDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, toLocal(e));
    if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y) }; drag.current = null; return; }
    drag.current = { type: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
    setSelected('');
  };
  const onTableDown = (e, id) => {
    e.stopPropagation();
    svgRef.current.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, toLocal(e));
    const p = pos[id];
    drag.current = { type: 'table', id, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false };
    setSelected(id);
  };
  const onMove = (e) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, toLocal(e));
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.d > 0) zoomAt(d / pinch.current.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.current.d = d; userMoved.current = true; return;
    }
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (d.type === 'pan') { userMoved.current = true; setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy })); }
    else { if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true; if (d.moved) { userMoved.current = true; setOverrides((o) => ({ ...o, [d.id]: { x: d.ox + dx / view.k, y: d.oy + dy / view.k } })); } }
  };
  const onUp = (e) => { pointers.current.delete(e.pointerId); if (pointers.current.size < 2) pinch.current = null; if (pointers.current.size === 0) drag.current = null; };
  useEffect(() => { // React's onWheel is passive; attach natively so Ctrl+wheel can preventDefault
    const el = svgRef.current; if (!el) return undefined;
    const h = (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); const p = toLocal(e); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y); userMoved.current = true; } };
    el.addEventListener('wheel', h, { passive: false });
    return () => el.removeEventListener('wheel', h);
  });

  /* ── relations geometry ── */
  const colRow = (t, p, colName) => {
    const idx = t.columns.findIndex((c) => c.name.toLowerCase() === String(colName || '').toLowerCase());
    const shown = expanded.has(t.id) ? t.columns.length : Math.min(t.columns.length, LAYOUT.maxCols);
    return idx >= 0 && idx < shown ? p.y + LAYOUT.header + idx * LAYOUT.row + LAYOUT.row / 2 : p.y + LAYOUT.header / 2;
  };
  const edges = useMemo(() => (schema ? schema.relations.filter((r) => r.to.table).map((r) => {
    const ct = byId.get(r.from.table), pt = byId.get(r.to.table);
    const cp = pos[r.from.table], pp = pos[r.to.table];
    if (!ct || !pt || !cp || !pp) return null;
    const cy = colRow(ct, cp, r.from.columns[0]), py = colRow(pt, pp, r.to.columns[0] || pt.primaryKey[0]);
    let cx, px, cs, ps, path;
    if (r.selfRef) { cx = cp.x + cp.w; px = cx; cs = 1; ps = 1; path = `M${cx},${cy} C${cx + 70},${cy} ${px + 70},${py} ${px},${py}`; }
    else if (pp.x + pp.w + 24 <= cp.x) { px = pp.x + pp.w; cx = cp.x; ps = 1; cs = -1; const dx = Math.max(40, (cx - px) / 2); path = `M${px},${py} C${px + dx},${py} ${cx - dx},${cy} ${cx},${cy}`; }
    else if (cp.x + cp.w + 24 <= pp.x) { cx = cp.x + cp.w; px = pp.x; cs = 1; ps = -1; const dx = Math.max(40, (px - cx) / 2); path = `M${cx},${cy} C${cx + dx},${cy} ${px - dx},${py} ${px},${py}`; }
    else { cx = cp.x; px = pp.x; cs = -1; ps = -1; const off = 60 + Math.abs(cy - py) / 6; path = `M${cx},${cy} C${cx - off},${cy} ${px - off},${py} ${px},${py}`; }
    return { r, path, cx, cy, px, py, cs, ps, parentOptional: r.optional, mid: { x: (cx + px) / 2, y: (cy + py) / 2 } };
  }).filter(Boolean) : []), [schema, pos, byId, expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  const focusId = hover || selected;
  const related = useMemo(() => {
    const set = new Set();
    if (!focusId || !schema) return set;
    set.add(focusId);
    schema.relations.forEach((r) => { if (r.from.table === focusId && r.to.table) set.add(r.to.table); if (r.to.table === focusId) set.add(r.from.table); });
    return set;
  }, [focusId, schema]);
  const q = query.trim().toLowerCase();
  const matches = (t) => !q || t.name.toLowerCase().includes(q) || t.columns.some((c) => c.name.toLowerCase().includes(q));

  /* ── input ── */
  const load = (text) => { setSql(text); setDeb(text); setError(''); };
  async function handleFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) { setError(`That file is over ${MAX_FILE_MB} MB. Export only the schema (no data) — for example pg_dump --schema-only or mysqldump --no-data.`); return; }
    try { load(await f.text()); trackEvent('schema_loaded', {}); } catch { setError('Could not read that file.'); }
    if (fileRef.current) fileRef.current.value = '';
  }

  /* ── export (the diagram stays mounted — hidden — on other tabs, so these work from the Export tab) ── */
  const exportSvgString = () => {
    const b = bounds(); const g = svgRef.current?.querySelector('g[data-viewport]'); if (!b || !g) return null;
    const pad = 30;
    const clone = g.cloneNode(true); clone.removeAttribute('transform');
    const w = b.w + pad * 2, h = b.h + pad * 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${b.minX - pad} ${b.minY - pad} ${w} ${h}" font-family="DM Sans, Arial, sans-serif"><rect x="${b.minX - pad}" y="${b.minY - pad}" width="${w}" height="${h}" fill="${tk.canvas}"/>${new XMLSerializer().serializeToString(clone)}</svg>`;
  };
  const exportSvg = () => { const s = exportSvgString(); if (s) { downloadBlob(new Blob([s], { type: 'image/svg+xml' }), 'zeroapi-schema.svg'); trackEvent('schema_export', { kind: 'svg' }); } else flashMsg('Nothing to export yet.'); };
  const exportPng = () => {
    const s = exportSvgString(); const b = bounds(); if (!s || !b) { flashMsg('Nothing to export yet.'); return; }
    const img = new Image(); const url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      const w = b.w + 60, h = b.h + 60, scale = Math.min(2, 4000 / Math.max(w, h));
      const c = document.createElement('canvas'); c.width = Math.round(w * scale); c.height = Math.round(h * scale);
      const ctx = c.getContext('2d'); ctx.scale(scale, scale); ctx.drawImage(img, 0, 0, w, h);
      c.toBlob((bl) => { if (bl) downloadBlob(bl, 'zeroapi-schema.png'); URL.revokeObjectURL(url); }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); flashMsg('Could not create the image — try SVG.'); };
    img.src = url; trackEvent('schema_export', { kind: 'png' });
  };
  const mermaid = useMemo(() => (schema ? toMermaid(schema) : ''), [schema]);
  const dbml = useMemo(() => (schema ? toDbml(schema) : ''), [schema]);

  const sel = selected ? byId.get(selected) : null;
  const rels = (id) => (schema ? schema.relations.filter((r) => r.from.table === id || r.to.table === id) : []);
  const levelColor = { error: tk.bad, warn: tk.warn, info: tk.info };
  const counts = issues.reduce((a, i) => ({ ...a, [i.level]: (a[i.level] || 0) + 1 }), {});
  const hasTables = !!schema && schema.tables.length > 0;

  return (
    <div style={{ display: 'grid', gap: 16, fontFamily: tk.sans }}>
      {/* input */}
      <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 16, display: 'grid', gap: 12 }}>
        <Label tk={tk} style={{ margin: 0 }}>Your schema</Label>
        <div style={{ fontSize: '0.84rem', color: tk.sub, lineHeight: 1.6 }}>Paste <code style={{ fontFamily: tk.mono }}>CREATE TABLE</code> statements — or a whole dump from <b>pg_dump</b>, <b>mysqldump</b> or SQL Server. Foreign keys can be inline or in <code style={{ fontFamily: tk.mono }}>ALTER TABLE</code>. Everything runs in your browser.</div>
        <textarea value={sql} onChange={(e) => setSql(e.target.value)} rows={8} aria-label="SQL schema" placeholder={'CREATE TABLE users (\n  id INT PRIMARY KEY,\n  name VARCHAR(100)\n);\nCREATE TABLE orders (\n  id INT PRIMARY KEY,\n  user_id INT REFERENCES users(id)\n);'} style={{ width: '100%', boxSizing: 'border-box', background: tk.input, border: `1px solid ${tk.inputLine}`, borderRadius: 10, padding: 12, color: tk.text, fontFamily: tk.mono, fontSize: 16, lineHeight: 1.5, resize: 'vertical', outline: 'none' }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input ref={fileRef} type="file" accept=".sql,.txt,.ddl,text/plain" style={{ display: 'none' }} onChange={handleFile} />
          <Btn tk={tk} kind="accent" onClick={() => fileRef.current?.click()}>📂 Upload .sql</Btn>
          <Btn tk={tk} onClick={() => load(SAMPLE_SQL)}>Try a sample</Btn>
          {sql && <Btn tk={tk} onClick={() => load('')}>Clear</Btn>}
        </div>
        {error && <Notice tk={tk} kind="bad">{error}</Notice>}
        {schema && !hasTables && sql.trim() && <Notice tk={tk} kind="warn">No <code style={{ fontFamily: tk.mono }}>CREATE TABLE</code> statements were found. Check that the text contains table definitions (views, functions and data are ignored).</Notice>}
      </div>

      {hasTables && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip tk={tk} color={tk.info}>{schema.dialect}</Chip>
            <span style={{ fontFamily: tk.mono, fontSize: '0.7rem', color: tk.mute }}>{schema.tables.length} tables · {schema.relations.length} relationships</span>
            {(counts.error || 0) > 0 && <Chip tk={tk} color={tk.bad}>{counts.error} error{counts.error > 1 ? 's' : ''}</Chip>}
            {(counts.warn || 0) > 0 && <Chip tk={tk} color={tk.warn}>{counts.warn} warning{counts.warn > 1 ? 's' : ''}</Chip>}
            <span aria-live="polite" style={{ marginLeft: 'auto', fontFamily: tk.mono, fontSize: '0.72rem', color: tk.good }}>{flash}</span>
          </div>
          {schema.warnings.map((w, i) => <Notice key={i} tk={tk} kind="warn">{w}</Notice>)}

          <div role="tablist" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['diagram', 'Diagram'], ['issues', `Design checks${issues.length ? ` (${issues.length})` : ''}`], ['queries', `Sample queries${queries.length ? ` (${queries.length})` : ''}`], ['export', 'Export']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)} style={{ cursor: 'pointer', padding: '9px 14px', borderRadius: 999, fontFamily: tk.mono, fontSize: '0.72rem', background: tab === k ? tk.acSoft : 'transparent', color: tab === k ? tk.ac : tk.sub, border: `1px solid ${tab === k ? tk.ac : tk.line}` }}>{l}</button>
            ))}
          </div>

          {/* ───── diagram (kept mounted so PNG / SVG export works from the Export tab) ───── */}
          <div style={{ display: tab === 'diagram' ? 'grid' : 'none', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a table or column…" aria-label="Find a table or column" style={{ flex: '1 1 180px', minWidth: 150, background: tk.input, border: `1px solid ${tk.inputLine}`, borderRadius: 9, padding: '9px 12px', color: tk.text, fontFamily: tk.sans, fontSize: 16, outline: 'none' }} />
              <Btn tk={tk} onClick={() => zoomAt(1.2)} title="Zoom in">＋</Btn>
              <Btn tk={tk} onClick={() => zoomAt(1 / 1.2)} title="Zoom out">－</Btn>
              <Btn tk={tk} onClick={() => { userMoved.current = false; fit(); }} title="Fit to screen">⤢ Fit</Btn>
              <Btn tk={tk} onClick={() => { setOverrides({}); userMoved.current = false; }} title="Reset table positions">↺ Layout</Btn>
              <Btn tk={tk} pressed={showTypes} onClick={() => setShowTypes(!showTypes)}>Types</Btn>
              <Btn tk={tk} onClick={() => setExpanded((cur) => (cur.size ? new Set() : new Set(schema.tables.filter((t) => t.columns.length > LAYOUT.maxCols).map((t) => t.id))))} title="Show all columns of long tables">⇕ Long tables</Btn>
            </div>

            <div ref={boxRef} style={{ width: '100%', borderRadius: 14, overflow: 'hidden', border: `1px solid ${tk.line}`, background: tk.canvas, position: 'relative' }}>
              <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Entity relationship diagram with ${schema.tables.length} tables`} style={{ display: 'block', touchAction: 'none', cursor: 'grab', userSelect: 'none' }} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                <rect width={W} height={H} fill={tk.canvas} onPointerDown={onBgDown} />
                <g data-viewport transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
                  {/* relationships */}
                  {edges.map((ed) => {
                    const on = !focusId || ed.r.from.table === focusId || ed.r.to.table === focusId;
                    const col = on && focusId ? ACCENT : tk.edge;
                    return (
                      <g key={ed.r.id} opacity={on ? 1 : 0.16}>
                        <path d={ed.path} fill="none" stroke={col} strokeWidth={on && focusId ? 2 : 1.4} strokeDasharray={ed.r.missingTarget ? '4 3' : undefined} />
                        <Marker x={ed.cx} y={ed.cy} side={ed.cs} many={!ed.r.childOne} optional={false} color={col} />
                        <Marker x={ed.px} y={ed.py} side={ed.ps} many={false} optional={ed.parentOptional} color={col} />
                        {on && focusId && <text x={ed.mid.x} y={ed.mid.y - 6} textAnchor="middle" fontSize="10.5" fill={tk.svgMute} stroke={tk.canvas} strokeWidth="3" paintOrder="stroke">{trunc(ed.r.from.columns.join(', '), 26)}</text>}
                      </g>
                    );
                  })}
                  {/* tables */}
                  {schema.tables.map((t) => {
                    const p = pos[t.id]; if (!p) return null;
                    const dim = (focusId && !related.has(t.id)) || !matches(t);
                    const shown = expanded.has(t.id) ? t.columns : t.columns.slice(0, LAYOUT.maxCols);
                    const isSel = selected === t.id;
                    return (
                      <g key={t.id} transform={`translate(${p.x},${p.y})`} opacity={dim ? 0.25 : 1} onPointerEnter={() => setHover(t.id)} onPointerLeave={() => setHover('')} style={{ cursor: 'pointer' }}>
                        <rect width={p.w} height={p.h} rx="8" fill={tk.tbl} stroke={isSel ? ACCENT : tk.tblLine} strokeWidth={isSel ? 2.2 : 1.2} />
                        <path d={`M0,${LAYOUT.header} V8 a8,8 0 0 1 8,-8 H${p.w - 8} a8,8 0 0 1 8,8 V${LAYOUT.header} Z`} fill={t.junction ? tk.tblHeadJ : tk.tblHead} onPointerDown={(e) => onTableDown(e, t.id)} />
                        <text x="12" y="21" fontSize="13.5" fontWeight="700" fill={tk.svgText} pointerEvents="none">{trunc(t.name, 24)}</text>
                        {t.junction && <text x={p.w - 10} y="21" fontSize="9.5" textAnchor="end" fill={tk.svgMute} pointerEvents="none">M:N link</text>}
                        {shown.map((c, i) => {
                          const y = LAYOUT.header + i * LAYOUT.row;
                          return (
                            <g key={c.name} onPointerDown={(e) => onTableDown(e, t.id)}>
                              <rect x="1" y={y} width={p.w - 2} height={LAYOUT.row} fill="transparent" />
                              <text x="12" y={y + 15} fontSize="12" fontWeight={c.pk ? 700 : 400} fill={c.pk ? ACCENT : tk.svgText} pointerEvents="none">{trunc(c.name, showTypes ? 17 : 30)}</text>
                              {showTypes && <text x={p.w - (c.pk || c.fk ? 40 : 12)} y={y + 15} fontSize="10.5" textAnchor="end" fill={tk.svgMute} pointerEvents="none">{trunc(c.type, 16)}</text>}
                              {(c.pk || c.fk) && <text x={p.w - 10} y={y + 15} fontSize="9.5" fontWeight="700" textAnchor="end" fill={c.pk ? ACCENT : '#f59e0b'} pointerEvents="none">{c.pk && c.fk ? 'PK·FK' : c.pk ? 'PK' : 'FK'}</text>}
                            </g>
                          );
                        })}
                        {t.columns.length > shown.length && <text x="12" y={LAYOUT.header + shown.length * LAYOUT.row + 15} fontSize="11" fill={tk.svgMute} style={{ cursor: 'pointer' }} onPointerDown={(e) => { e.stopPropagation(); setExpanded((cur) => new Set(cur).add(t.id)); }}>+ {t.columns.length - shown.length} more columns</text>}
                      </g>
                    );
                  })}
                </g>
              </svg>
              <div style={{ position: 'absolute', right: 8, bottom: 8, fontFamily: tk.mono, fontSize: '0.62rem', color: tk.mute, background: tk.canvas, padding: '3px 8px', borderRadius: 6, pointerEvents: 'none' }}>{Math.round(view.k * 100)}% · drag to pan · Ctrl+scroll or pinch to zoom</div>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.72rem', color: tk.mute, alignItems: 'center' }}>
              <span>Legend:</span><span>┤├ exactly one</span><span>┤○ zero or one</span><span>○&lt; zero or many</span><span style={{ color: ACCENT }}>PK</span><span style={{ color: '#f59e0b' }}>FK</span><span>pink header = junction table</span>
            </div>

            {sel && (
              <div style={{ background: tk.card, border: `1px solid ${tk.acLine}`, borderRadius: 12, padding: 14, display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <b style={{ color: tk.text }}>{sel.schema ? `${sel.schema}.` : ''}{sel.name}</b>
                  <span style={{ fontFamily: tk.mono, fontSize: '0.68rem', color: tk.mute }}>{sel.columns.length} columns · PK: {sel.primaryKey.join(', ') || 'none'}</span>
                </div>
                {rels(sel.id).map((r) => {
                  const child = byId.get(r.from.table), parent = r.to.table ? byId.get(r.to.table) : null;
                  return <div key={r.id} style={{ fontSize: '0.8rem', color: tk.sub, lineHeight: 1.55 }}>
                    {r.from.table === sel.id ? <>→ each <b>{sel.name}</b> {r.optional ? 'may have' : 'has'} one <b>{r.to.tableName}</b> <span style={{ color: tk.mute }}>via {r.from.columns.join(', ')}</span></> : <>← {r.childOne ? 'one' : 'many'} <b>{child.name}</b> {r.childOne ? 'row points' : 'rows point'} here <span style={{ color: tk.mute }}>via {child.name}.{r.from.columns.join(', ')}</span></>}
                    {r.onDelete ? <span style={{ color: tk.mute }}> · ON DELETE {r.onDelete}</span> : null}{parent === null ? <span style={{ color: tk.bad }}> · table not found</span> : null}
                  </div>;
                })}
                {!rels(sel.id).length && <div style={{ fontSize: '0.8rem', color: tk.mute }}>No relationships.</div>}
              </div>
            )}
          </div>

          {/* ───── design checks ───── */}
          {tab === 'issues' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {!issues.length && <Notice tk={tk} kind="good">No problems found: every table has a key, and all foreign keys point to existing, matching columns.</Notice>}
              {issues.map((i, n) => (
                <button key={n} type="button" onClick={() => { const t = schema.tables.find((x) => x.name === i.table); if (t) { setSelected(t.id); setTab('diagram'); } }} style={{ textAlign: 'left', cursor: 'pointer', background: tk.card, border: `1px solid ${tk.line}`, borderLeft: `3px solid ${levelColor[i.level]}`, borderRadius: 10, padding: '11px 14px', color: tk.text, display: 'grid', gap: 4 }}>
                  <span style={{ fontFamily: tk.mono, fontSize: '0.64rem', color: levelColor[i.level], textTransform: 'uppercase', letterSpacing: '0.08em' }}>{i.level} · {i.table}{i.column ? `.${i.column}` : ''}</span>
                  <span style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>{i.message}</span>
                  {i.hint && <span style={{ fontSize: '0.78rem', color: tk.mute, lineHeight: 1.5 }}>{i.hint}</span>}
                </button>
              ))}
            </div>
          )}

          {/* ───── sample queries ───── */}
          {tab === 'queries' && (
            <div style={{ display: 'grid', gap: 12 }}>
              {!queries.length && <Notice tk={tk} kind="info">Add foreign keys between tables to get sample JOIN queries.</Notice>}
              {queries.map((qq, n) => (
                <div key={n} style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 12, padding: 14, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <b style={{ color: tk.text, fontSize: '0.9rem' }}>{qq.title}</b>
                    <Btn tk={tk} onClick={async () => flashMsg((await copyTo(qq.sql)) ? 'Query copied' : 'Copy failed')}>⧉ Copy</Btn>
                  </div>
                  <pre style={{ margin: 0, padding: 12, background: tk.canvas, border: `1px solid ${tk.line}`, borderRadius: 8, fontFamily: tk.mono, fontSize: '0.76rem', color: tk.text, overflowX: 'auto', lineHeight: 1.6 }}>{qq.sql}</pre>
                  <div style={{ fontSize: '0.78rem', color: tk.mute }}>{qq.explain}</div>
                </div>
              ))}
            </div>
          )}

          {/* ───── export ───── */}
          {tab === 'export' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn tk={tk} kind="primary" onClick={exportPng}>⬇ PNG</Btn>
                <Btn tk={tk} onClick={exportSvg}>⬇ SVG</Btn>
              </div>
              {[['Mermaid ER diagram', mermaid, 'schema.mmd', 'Paste into mermaid.live, GitHub Markdown, Notion or Obsidian.'], ['DBML (dbdiagram.io)', dbml, 'schema.dbml', 'Paste into dbdiagram.io to keep editing visually.']].map(([name, body, file, hint]) => (
                <div key={name} style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 12, padding: 14, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Label tk={tk} style={{ margin: 0 }}>{name}</Label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn tk={tk} onClick={async () => flashMsg((await copyTo(body)) ? `${name.split(' ')[0]} copied` : 'Copy failed')}>⧉ Copy</Btn>
                      <Btn tk={tk} onClick={() => downloadBlob(new Blob([body], { type: 'text/plain' }), file)}>⬇</Btn>
                    </div>
                  </div>
                  <pre style={{ margin: 0, fontFamily: tk.mono, fontSize: '0.72rem', color: tk.sub, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 260, overflow: 'auto' }}>{body}</pre>
                  <div style={{ fontSize: '0.74rem', color: tk.mute }}>{hint}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
