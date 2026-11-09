// src/components/CsvVisualizer.jsx — CSV / Excel → charts
//
//  • Paste from Excel / Google Sheets (tab-separated) or upload .csv .tsv .txt .xlsx .xls — delimiter auto-detected
//  • Reads ₹1,20,000  $1,234.50  12%  (500)  −7 correctly; anything it cannot read is REPORTED, never silently 0
//  • Crisp SVG charts (bar, horizontal bar, stacked, line, area, pie, donut, scatter) with tooltips, axis titles, legends
//  • Smart defaults: suggests a chart for your data; combines duplicate labels; top-N + "Other"; averages long series
//  • Column profile, data table, PNG / SVG export, optional AI "what does this show?" (sends stats only, not your rows)

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { TOOL_MODELS } from '../constants';
import { trackEvent, loadScript } from '../utils';
import { aiCall, downloadBlob, copyTo } from '../resumeCore';
import {
  parseTable, inferColumns, suggestChart, buildSeries, niceTicks, formatNumber, formatFull, profileText, CHART_TYPES, PALETTE,
} from '../lib/csvCore';

const SAMPLE = `Month,Revenue,Expenses,Profit
Jan,"₹1,20,000","₹80,000","₹40,000"
Feb,"₹95,000","₹70,000","₹25,000"
Mar,"₹1,10,000","₹75,000","₹35,000"
Apr,"₹1,30,000","₹82,000","₹48,000"
May,"₹1,05,000","₹78,000","₹27,000"
Jun,"₹1,25,000","₹85,000","₹40,000"
Jul,"₹1,40,000","₹90,000","₹50,000"
Aug,"₹1,35,000","₹88,000","₹47,000"
Sep,"₹1,15,000","₹79,000","₹36,000"
Oct,"₹1,50,000","₹95,000","₹55,000"
Nov,"₹1,60,000","₹98,000","₹62,000"
Dec,"₹1,75,000","₹1,05,000","₹70,000"`;

const FILE_OK = /\.(csv|tsv|txt|xlsx|xls)$/i;
const MAX_FILE_MB = 12;
const TABLE_ROWS = 100;

function tokens(d) {
  return {
    d, text: d ? '#ffffff' : '#1a1a1a', sub: d ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.72)', mute: d ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.5)',
    line: d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)', soft: d ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.035)', card: d ? 'rgba(255,255,255,0.03)' : '#ffffff',
    input: d ? 'rgba(255,255,255,0.06)' : '#ffffff', inputLine: d ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.18)',
    ac: 'var(--accent)', acSoft: d ? 'rgba(167,139,250,0.13)' : 'rgba(124,58,237,0.08)', acLine: d ? 'rgba(167,139,250,0.42)' : 'rgba(124,58,237,0.36)',
    good: d ? '#34d399' : '#059669', bad: d ? '#f87171' : '#dc2626', warn: d ? '#fbbf24' : '#b45309', info: d ? '#60a5fa' : '#2563eb',
    grad: 'linear-gradient(135deg,#a78bfa,#818cf8)', mono: "'Space Mono', monospace", sans: "'DM Sans', sans-serif",
    // SVG colours must be literal (the PNG/SVG export has no CSS variables)
    axis: d ? '#9ca3b8' : '#6b7280', grid: d ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)', bg: d ? '#14141c' : '#ffffff', svgText: d ? '#e5e7f0' : '#1f2937',
  };
}

/* ─────────────── small UI pieces ─────────────── */
function Btn({ tk, children, onClick, disabled, kind = 'soft', style, title, pressed }) {
  const k = {
    soft: { background: tk.soft, border: `1px solid ${tk.line}`, color: tk.sub },
    accent: { background: tk.acSoft, border: `1px solid ${tk.acLine}`, color: tk.ac },
    primary: { background: tk.grad, border: 'none', color: '#fff', fontWeight: 700 },
  }[kind];
  return <button type="button" title={title} aria-pressed={pressed} onClick={onClick} disabled={disabled} style={{ fontFamily: tk.mono, fontSize: '0.72rem', borderRadius: 9, padding: '9px 14px', minHeight: 38, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', ...k, ...style }}>{children}</button>;
}
function Label({ tk, children, style }) {
  return <div style={{ fontFamily: tk.mono, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tk.ac, marginBottom: 6, ...style }}>{children}</div>;
}
function Notice({ tk, kind = 'info', children }) {
  const c = { info: tk.info, warn: tk.warn, bad: tk.bad, good: tk.good }[kind];
  return <div role={kind === 'bad' ? 'alert' : 'status'} style={{ border: `1px solid ${c}55`, background: `${c}12`, borderRadius: 10, padding: '9px 13px', fontFamily: tk.sans, fontSize: '0.84rem', lineHeight: 1.55, color: tk.text }}>{children}</div>;
}
const selectStyle = (tk) => ({ width: '100%', boxSizing: 'border-box', background: tk.input, border: `1px solid ${tk.inputLine}`, borderRadius: 9, padding: '10px 12px', color: tk.text, fontFamily: tk.sans, fontSize: '16px', outline: 'none' });

function useWidth(ref) {
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const set = () => setW(Math.max(280, Math.floor(el.getBoundingClientRect().width)));
    set();
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(set); ro.observe(el); return () => ro.disconnect(); }
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, [ref]);
  return w;
}

/* ═════════════════════ chart ═════════════════════ */
const trunc = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s));

function polar(cx, cy, r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function arcPath(cx, cy, r, r0, a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  if (r0 <= 0) return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`;
  const [x2, y2] = polar(cx, cy, r0, a1), [x3, y3] = polar(cx, cy, r0, a0);
  return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
}

function Chart({ svgRef, tk, spec, width }) {
  const { type, labels, series, xs, xType, xName, yName, indian, showValues } = spec;
  const [hover, setHover] = useState(null);
  const fmt = (v) => formatNumber(v, { indian });
  const full = (v) => formatFull(v, { indian });
  const height = type === 'pie' || type === 'donut' ? Math.min(width, 380) : width < 520 ? 330 : 400;
  const font = { fontFamily: "'DM Sans', sans-serif" };

  /* ── pie / donut ── */
  if (type === 'pie' || type === 'donut') {
    const s = series[0];
    const vals = s.data.map((v) => Math.max(0, v || 0));
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 14, r0 = type === 'donut' ? r * 0.58 : 0;
    let a = -Math.PI / 2;
    const slices = vals.map((v, i) => { const a0 = a; a += (v / total) * Math.PI * 2; return { i, a0, a1: a, v, pct: (v / total) * 100 }; });
    const h = hover != null ? slices[hover.i] : null;
    return (
      <div style={{ position: 'relative' }}>
        <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${type} chart of ${s.name}`} style={{ display: 'block', ...font }}>
          {slices.map((sl) => {
            const mid = (sl.a0 + sl.a1) / 2, grow = hover?.i === sl.i ? 6 : 0;
            const [lx, ly] = polar(cx, cy, r0 ? (r + r0) / 2 : r * 0.68, mid);
            return (
              <g key={sl.i} onPointerEnter={() => setHover({ i: sl.i })} onPointerMove={() => setHover({ i: sl.i })} onPointerLeave={() => setHover(null)}>
                <path d={arcPath(cx, cy, r + grow, r0, sl.a0, sl.a1 - (slices.length === 1 ? 0.0001 : 0))} fill={PALETTE[sl.i % PALETTE.length]} stroke={tk.bg} strokeWidth="2" />
                {sl.pct >= 5 && <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill="#fff" pointerEvents="none">{Math.round(sl.pct)}%</text>}
              </g>
            );
          })}
          {type === 'donut' && <g pointerEvents="none"><text x={cx} y={cy - 4} textAnchor="middle" fontSize="12" fill={tk.axis}>{h ? trunc(labels[h.i] ?? '', 16) : 'Total'}</text><text x={cx} y={cy + 18} textAnchor="middle" fontSize="20" fontWeight="700" fill={tk.svgText}>{fmt(h ? h.v : total)}</text></g>}
        </svg>
        {h && <div style={tipStyle(tk, Math.min(Math.max(cx + (r * 0.5) * Math.cos((h.a0 + h.a1) / 2), 90), width - 90), cy + r * 0.5 * Math.sin((h.a0 + h.a1) / 2))}><b>{labels[h.i]}</b><br />{full(h.v)} · {h.pct.toFixed(1)}%</div>}
      </div>
    );
  }

  /* ── cartesian setup ── */
  const horizontal = type === 'hbar';
  const stacked = type === 'stacked';
  const isScatter = type === 'scatter';
  const n = isScatter ? (xs || []).length : labels.length;
  const allVals = series.flatMap((s) => s.data).filter((v) => v !== null && v !== undefined);
  if (!n || !allVals.length) return <div style={{ padding: 40, textAlign: 'center', color: tk.mute, fontFamily: tk.sans }}>Nothing to draw yet — pick a numeric column for Y.</div>;

  let lo = Math.min(...allVals), hi = Math.max(...allVals);
  if (stacked) {
    const pos = labels.map((_, i) => series.reduce((a, s) => a + Math.max(0, s.data[i] || 0), 0));
    const neg = labels.map((_, i) => series.reduce((a, s) => a + Math.min(0, s.data[i] || 0), 0));
    hi = Math.max(...pos, 0); lo = Math.min(...neg, 0);
  }
  if (type === 'bar' || type === 'hbar' || type === 'area' || stacked) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  const yScale = niceTicks(lo, hi, horizontal ? 5 : 5);
  const tickLabels = yScale.ticks.map(fmt);
  const maxTick = Math.max(...tickLabels.map((t) => t.length));
  const catLen = Math.max(...(isScatter ? [0] : labels.map((l) => String(l).length)));

  const M = { top: 16, right: 16, bottom: 34, left: Math.min(90, Math.max(44, maxTick * 7 + 18)) };
  if (horizontal) M.left = Math.min(150, Math.max(70, catLen * 6.4 + 14));
  const slot0 = (width - M.left - M.right) / Math.max(1, n);
  const rotate = !horizontal && !isScatter && slot0 < Math.min(catLen, 14) * 6.3 + 6;
  if (rotate) M.bottom = Math.min(86, Math.min(catLen, 14) * 4.2 + 30);
  if (xName && !horizontal) M.bottom += 18;
  if (yName && !horizontal) M.left += 14;
  const W = width, H = height;
  const pw = W - M.left - M.right, ph = H - M.top - M.bottom;

  const vy = (v) => M.top + ph - ((v - yScale.min) / (yScale.max - yScale.min || 1)) * ph;       // value → y
  const vx = (v) => M.left + ((v - yScale.min) / (yScale.max - yScale.min || 1)) * pw;           // value → x (horizontal bars)
  const slot = horizontal ? ph / n : pw / n;
  const skip = Math.ceil((rotate ? 14 : 8) * 0 + (n > 60 ? n / 30 : n > 24 && !rotate ? 2 : 1));

  // scatter x scale
  let sx = null;
  if (isScatter) {
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const xt = niceTicks(xmin, xmax, 6);
    sx = { ...xt, f: (v) => M.left + ((v - xt.min) / (xt.max - xt.min || 1)) * pw };
  }
  const xTickFmt = (v) => (xType === 'date' ? new Date(v).toISOString().slice(0, 10) : fmt(v));

  const grid = yScale.ticks.map((t, i) => (horizontal
    ? <g key={i}><line x1={vx(t)} x2={vx(t)} y1={M.top} y2={M.top + ph} stroke={tk.grid} /><text x={vx(t)} y={H - M.bottom + 16} textAnchor="middle" fontSize="11" fill={tk.axis}>{tickLabels[i]}</text></g>
    : <g key={i}><line x1={M.left} x2={M.left + pw} y1={vy(t)} y2={vy(t)} stroke={t === 0 ? tk.axis : tk.grid} strokeWidth={t === 0 ? 1.2 : 1} /><text x={M.left - 8} y={vy(t) + 4} textAnchor="end" fontSize="11" fill={tk.axis}>{tickLabels[i]}</text></g>));

  const els = [];
  const barW = (k) => Math.max(1, (slot * 0.74) / (stacked ? 1 : k));
  const vis = series.length;

  if (type === 'bar' || type === 'hbar' || stacked) {
    labels.forEach((lab, i) => {
      let posAcc = 0, negAcc = 0;
      series.forEach((s, si) => {
        const v = s.data[i]; if (v === null || v === undefined) return;
        const bw = barW(vis);
        let rect;
        if (horizontal) {
          const y = M.top + slot * i + slot * 0.13 + si * bw, x0 = vx(Math.min(0, v)), x1 = vx(Math.max(0, v));
          rect = { x: x0, y, w: Math.max(1, x1 - x0), h: bw };
        } else if (stacked) {
          const base = v >= 0 ? posAcc : negAcc; const end = base + v; if (v >= 0) posAcc = end; else negAcc = end;
          const y0 = vy(Math.max(base, end)), y1 = vy(Math.min(base, end));
          rect = { x: M.left + slot * i + slot * 0.13, y: y0, w: slot * 0.74, h: Math.max(1, y1 - y0) };
        } else {
          const x = M.left + slot * i + slot * 0.13 + si * bw, y0 = vy(Math.max(0, v)), y1 = vy(Math.min(0, v));
          rect = { x, y: y0, w: bw, h: Math.max(1, y1 - y0) };
        }
        els.push(<rect key={`${i}-${si}`} x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx="2" fill={s.color} opacity={hover && hover.i !== i ? 0.45 : 1} />);
        if (showValues && n <= 14 && vis <= 3 && !stacked) {
          els.push(horizontal
            ? <text key={`t${i}-${si}`} x={rect.x + rect.w + 4} y={rect.y + rect.h / 2 + 4} fontSize="11" fill={tk.svgText}>{fmt(v)}</text>
            : <text key={`t${i}-${si}`} x={rect.x + rect.w / 2} y={v >= 0 ? rect.y - 4 : rect.y + rect.h + 12} textAnchor="middle" fontSize="11" fill={tk.svgText}>{fmt(v)}</text>);
        }
      });
    });
  }

  if (type === 'line' || type === 'area') {
    series.forEach((s, si) => {
      const pts = s.data.map((v, i) => (v === null || v === undefined ? null : [M.left + slot * i + slot / 2, vy(v)]));
      let d = '', pen = false;
      pts.forEach((p) => { if (!p) { pen = false; return; } d += `${pen ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)} `; pen = true; });
      if (type === 'area') {
        const runs = []; let cur = [];
        pts.forEach((p) => { if (p) cur.push(p); else if (cur.length) { runs.push(cur); cur = []; } }); if (cur.length) runs.push(cur);
        runs.forEach((run, k) => els.push(<path key={`a${si}-${k}`} d={`M${run[0][0]},${vy(0)} ${run.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} L${run[run.length - 1][0]},${vy(0)} Z`} fill={s.color} opacity="0.18" />));
      }
      els.push(<path key={`l${si}`} d={d} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />);
      if (n <= 60) pts.forEach((p, i) => p && els.push(<circle key={`p${si}-${i}`} cx={p[0]} cy={p[1]} r={hover?.i === i ? 5 : 3} fill={s.color} stroke={tk.bg} strokeWidth="1.5" />));
    });
    if (hover) els.push(<line key="guide" x1={M.left + slot * hover.i + slot / 2} x2={M.left + slot * hover.i + slot / 2} y1={M.top} y2={M.top + ph} stroke={tk.axis} strokeDasharray="3 3" />);
  }

  if (isScatter) {
    series.forEach((s, si) => xs.forEach((x, i) => { const v = s.data[i]; if (v === null || v === undefined) return; els.push(<circle key={`s${si}-${i}`} cx={sx.f(x)} cy={vy(v)} r={hover && hover.i === i ? 6 : 4} fill={s.color} opacity="0.8" stroke={tk.bg} strokeWidth="1" />); }));
  }

  // category labels
  const catLabels = [];
  if (!isScatter) {
    labels.forEach((lab, i) => {
      if (i % skip) return;
      const t = trunc(lab, horizontal ? 22 : rotate ? 14 : Math.max(5, Math.floor(slot / 6.2)));
      if (horizontal) catLabels.push(<text key={i} x={M.left - 8} y={M.top + slot * i + slot / 2 + 4} textAnchor="end" fontSize="11" fill={tk.axis}>{t}</text>);
      else {
        const x = M.left + slot * i + slot / 2, y = H - M.bottom + (xName ? 0 : 0) + 16 - (xName ? 0 : 0);
        const yy = M.top + ph + 16;
        catLabels.push(rotate
          ? <text key={i} transform={`translate(${x},${yy}) rotate(-38)`} textAnchor="end" fontSize="11" fill={tk.axis}>{t}</text>
          : <text key={i} x={x} y={yy} textAnchor="middle" fontSize="11" fill={tk.axis}>{t}</text>);
      }
    });
  } else {
    sx.ticks.forEach((t, i) => catLabels.push(<g key={i}><line x1={sx.f(t)} x2={sx.f(t)} y1={M.top} y2={M.top + ph} stroke={tk.grid} /><text x={sx.f(t)} y={M.top + ph + 16} textAnchor="middle" fontSize="11" fill={tk.axis}>{xTickFmt(t)}</text></g>));
  }

  /* pointer → index */
  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left, py = e.clientY - box.top;
    if (isScatter) {
      let best = null, bd = 28;
      xs.forEach((x, i) => series.forEach((s) => { const v = s.data[i]; if (v === null || v === undefined) return; const d = Math.hypot(sx.f(x) - px, vy(v) - py); if (d < bd) { bd = d; best = i; } }));
      setHover(best === null ? null : { i: best }); return;
    }
    const idx = Math.floor(((horizontal ? py - M.top : px - M.left)) / slot);
    setHover(idx >= 0 && idx < n ? { i: idx } : null);
  };

  const tip = hover ? (() => {
    const i = hover.i;
    const title = isScatter ? `${xName || 'X'}: ${xType === 'date' ? xTickFmt(xs[i]) : full(xs[i])}` : labels[i];
    const rows = series.map((s) => ({ name: s.name, color: s.color, v: s.data[i] }));
    const cx = isScatter ? sx.f(xs[i]) : horizontal ? M.left + pw / 2 : M.left + slot * i + slot / 2;
    const cy = isScatter ? vy(rows[0].v ?? 0) : horizontal ? M.top + slot * i : M.top + 10;
    return { title, rows, left: Math.min(Math.max(cx, 80), W - 80), top: cy };
  })() : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${type} chart: ${series.map((s) => s.name).join(', ')} by ${xName}`} style={{ display: 'block', touchAction: 'pan-y', ...font }}>
        {grid}
        {els}
        {catLabels}
        {xName && !horizontal && <text x={M.left + pw / 2} y={H - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill={tk.axis}>{trunc(xName, 40)}</text>}
        {yName && !horizontal && <text transform={`translate(14,${M.top + ph / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fontWeight="600" fill={tk.axis}>{trunc(yName, 40)}</text>}
        <rect x={M.left} y={M.top} width={pw} height={ph} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} />
      </svg>
      {tip && (
        <div style={tipStyle(tk, tip.left, tip.top)}>
          <b>{trunc(String(tip.title), 28)}</b>
          {tip.rows.map((r) => <div key={r.name} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flex: 'none' }} />{trunc(r.name, 18)}: <b>{full(r.v)}</b></div>)}
        </div>
      )}
    </div>
  );
}

function tipStyle(tk, left, top) {
  return { position: 'absolute', left, top, transform: 'translate(-50%, -100%)', marginTop: -8, pointerEvents: 'none', zIndex: 5, background: tk.d ? '#23232f' : '#ffffff', color: tk.text, border: `1px solid ${tk.line}`, borderRadius: 8, padding: '7px 10px', fontFamily: tk.sans, fontSize: '0.76rem', lineHeight: 1.5, boxShadow: '0 6px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' };
}

/* ═════════════════════ main ═════════════════════ */
export default function CsvVisualizer() {
  const { theme } = useTheme();
  const tk = useMemo(() => tokens(theme === 'dark'), [theme]);
  const fileRef = useRef(null);
  const chartBox = useRef(null);
  const svgRef = useRef(null);
  const width = useWidth(chartBox);

  const [input, setInput] = useState('');
  const [debounced, setDebounced] = useState('');
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState(null); // { names, wb }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [chartType, setChartType] = useState('bar');
  const [x, setX] = useState(0);
  const [ys, setYs] = useState([]);
  const [agg, setAgg] = useState('sum');
  const [sort, setSort] = useState('none');
  const [indian, setIndian] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [hidden, setHidden] = useState([]);
  const [touched, setTouched] = useState(false);
  const [view, setView] = useState('chart'); // chart | table | columns
  const [insight, setInsight] = useState('');
  const [insightBusy, setInsightBusy] = useState(false);
  const [flash, setFlash] = useState('');

  useEffect(() => { const t = setTimeout(() => setDebounced(input), 300); return () => clearTimeout(t); }, [input]);

  const table = useMemo(() => (debounced.trim() ? parseTable(debounced) : null), [debounced]);
  const columns = useMemo(() => (table && !table.error ? inferColumns(table.headers, table.rows) : []), [table]);
  const suggestion = useMemo(() => (columns.length ? suggestChart(columns, table.rows.length) : null), [columns, table]);
  const delimiterName = table ? ({ ',': 'comma', ';': 'semicolon', '\t': 'tab', '|': 'pipe' })[table.delimiter] : '';

  // new data → apply the suggestion (unless the user already chose something for this dataset)
  useEffect(() => {
    if (!suggestion) return;
    setTouched(false); setHidden([]); setInsight('');
    setChartType(suggestion.chartType); setX(suggestion.x); setYs(suggestion.ys); setSort('none'); setAgg('sum'); setView(suggestion.chartType === 'table' ? 'table' : 'chart');
  }, [suggestion]);

  const numericCols = columns.filter((c) => c.type === 'number' || c.nums?.length);
  const built = useMemo(() => {
    if (!columns.length || chartType === 'table') return null;
    const validYs = ys.filter((i) => columns[i]);
    return buildSeries(columns, table.rows, { x: columns[x] ? x : 0, ys: validYs, chartType, agg, sort });
  }, [columns, table, x, ys, chartType, agg, sort]);

  const shownSeries = built ? built.series.filter((s) => !hidden.includes(s.index)) : [];
  const yKind = ys.length ? columns[ys[0]]?.kind : 'number';
  const spec = built && {
    type: chartType, labels: built.labels, series: chartType === 'pie' || chartType === 'donut' ? built.series.slice(0, 1) : shownSeries, xs: built.xs, xType: built.xType,
    xName: columns[x]?.name, yName: shownSeries.length === 1 ? shownSeries[0].name : '', indian, showValues,
  };

  const touch = (fn) => (...a) => { setTouched(true); fn(...a); };
  const flashMsg = (m) => { setFlash(m); setTimeout(() => setFlash(''), 2200); };
  void touched; void yKind;

  /* ── input handling ── */
  const loadText = (text, name = '') => { setInput(text); setDebounced(text); setFileName(name); setError(''); };

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!FILE_OK.test(file.name)) { setError('Please choose a .csv, .tsv, .txt, .xlsx or .xls file.'); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`That file is over ${MAX_FILE_MB} MB. Please use a smaller file or paste a sample.`); return; }
    setBusy(true); setError(''); setSheets(null);
    try {
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        const wb = window.XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
        const names = wb.SheetNames.filter((n) => wb.Sheets[n] && wb.Sheets[n]['!ref']);
        if (!names.length) throw new Error('That workbook has no data.');
        setSheets({ names, wb, current: names[0] });
        loadText(window.XLSX.utils.sheet_to_csv(wb.Sheets[names[0]], { FS: '\t', dateNF: 'yyyy-mm-dd' }), file.name);
      } else {
        loadText(await file.text(), file.name);
      }
      trackEvent('csv_loaded', { kind: file.name.split('.').pop().toLowerCase() });
    } catch (err) { setError(err?.message || 'Could not read that file.'); }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  }
  const switchSheet = (name) => { setSheets((s) => ({ ...s, current: name })); loadText(window.XLSX.utils.sheet_to_csv(sheets.wb.Sheets[name], { FS: '\t', dateNF: 'yyyy-mm-dd' }), `${fileName.split(' · ')[0]} · ${name}`); };

  /* ── export ── */
  const svgString = () => {
    const svg = svgRef.current; if (!svg) return null;
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%'); bg.setAttribute('height', '100%'); bg.setAttribute('fill', tk.bg);
    clone.insertBefore(bg, clone.firstChild);
    return new XMLSerializer().serializeToString(clone);
  };
  const exportSvg = () => { const s = svgString(); if (s) { downloadBlob(new Blob([s], { type: 'image/svg+xml' }), 'zeroapi-chart.svg'); trackEvent('csv_export', { kind: 'svg' }); } };
  const exportPng = () => {
    const s = svgString(); if (!s) return;
    const img = new Image();
    const url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      const scale = 2, c = document.createElement('canvas');
      c.width = svgRef.current.clientWidth * scale || width * scale; c.height = svgRef.current.clientHeight * scale || 400 * scale;
      const ctx = c.getContext('2d'); ctx.scale(scale, scale); ctx.drawImage(img, 0, 0, c.width / scale, c.height / scale);
      c.toBlob((b) => { if (b) downloadBlob(b, 'zeroapi-chart.png'); URL.revokeObjectURL(url); }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); flashMsg('Could not create the image. Try SVG.'); };
    img.src = url; trackEvent('csv_export', { kind: 'png' });
  };

  /* ── AI insight (sends column statistics + the plotted values, never the raw rows) ── */
  const explain = async () => {
    if (!columns.length || insightBusy) return;
    setInsightBusy(true); setInsight('');
    const plotted = built ? built.labels.slice(0, 30).map((l, i) => `${l}: ${built.series.map((s) => `${s.name}=${s.data[i] ?? 'n/a'}`).join(', ')}`).join('\n') : '';
    try {
      const { text } = await aiCall({
        toolId: 'csv-insight', model: TOOL_MODELS.researchSummarizer, reasoning: 'low', maxTokens: 1800, temperature: 0.3,
        messages: [
          { role: 'system', content: 'You help a student read a chart. Use ONLY the numbers provided; never invent values. Write 4-5 short bullet points: the main pattern, the highest and lowest points, any notable change or outlier, and one caution about what the data cannot tell. Plain language, no preamble.' },
          { role: 'user', content: `DATA PROFILE\n${profileText(columns, table.rows.length)}\n\nCHART (${chartType}) — values plotted:\n${plotted}` },
        ],
      });
      setInsight(text);
      trackEvent('csv_insight', {});
    } catch (e) { setInsight(`⚠ ${e?.message || 'Could not get an explanation. Please try again.'}`); }
    setInsightBusy(false);
  };

  /* ═════════ render ═════════ */
  const hasData = columns.length > 0;
  const isPie = chartType === 'pie' || chartType === 'donut';
  const toggleY = (i) => { touch(() => setYs((cur) => (cur.includes(i) ? cur.filter((v) => v !== i) : [...cur, i])))(); };
  const warnings = [...(table?.warnings || []), ...(built?.warnings || [])];

  return (
    <div style={{ display: 'grid', gap: 16, fontFamily: tk.sans }}>
      {/* input */}
      <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 16, display: 'grid', gap: 12 }}>
        <Label tk={tk} style={{ margin: 0 }}>Your data</Label>
        <div style={{ fontSize: '0.84rem', color: tk.sub, lineHeight: 1.6 }}>Paste straight from Excel or Google Sheets, or upload a file (.csv, .tsv, .xlsx). The separator is detected automatically.</div>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); setFileName(''); setSheets(null); }} rows={6} aria-label="CSV data" placeholder={'Month\tSales\nJan\t1200\nFeb\t1500'} style={{ ...selectStyle(tk), fontFamily: tk.mono, fontSize: 16, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,text/csv" style={{ display: 'none' }} onChange={handleFile} />
          <Btn tk={tk} kind="accent" onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? 'Reading…' : '📂 Upload file'}</Btn>
          <Btn tk={tk} onClick={() => loadText(SAMPLE, 'sample.csv')}>Try a sample</Btn>
          {input && <Btn tk={tk} onClick={() => { loadText(''); setSheets(null); }}>Clear</Btn>}
          {fileName && <span style={{ fontSize: '0.76rem', color: tk.mute, wordBreak: 'break-word' }}>📎 {fileName}</span>}
        </div>
        {sheets && sheets.names.length > 1 && (
          <label style={{ display: 'block', maxWidth: 260 }}>
            <div style={{ fontFamily: tk.mono, fontSize: '0.6rem', textTransform: 'uppercase', color: tk.mute, marginBottom: 4 }}>Sheet</div>
            <select value={sheets.current} onChange={(e) => switchSheet(e.target.value)} style={selectStyle(tk)}>{sheets.names.map((n) => <option key={n}>{n}</option>)}</select>
          </label>
        )}
        {error && <Notice tk={tk} kind="bad">{error}</Notice>}
        {table?.error && input.trim() && <Notice tk={tk} kind="warn">{table.error}</Notice>}
      </div>

      {hasData && (
        <>
          {/* summary + warnings */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontFamily: tk.mono, fontSize: '0.7rem', color: tk.mute }}>
            <span>{table.rows.length.toLocaleString()} rows</span><span>·</span><span>{columns.length} columns</span><span>·</span><span>{delimiterName}-separated</span>
          </div>
          {warnings.map((w, i) => <Notice key={i} tk={tk} kind="warn">{w}</Notice>)}

          {/* controls */}
          <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 16, display: 'grid', gap: 14 }}>
            <div role="tablist" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['chart', 'Chart'], ['table', 'Data'], ['columns', 'Columns']].map(([k, l]) => (
                <button key={k} role="tab" aria-selected={view === k} type="button" onClick={() => setView(k)} style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: 999, fontFamily: tk.mono, fontSize: '0.72rem', background: view === k ? tk.acSoft : 'transparent', color: view === k ? tk.ac : tk.sub, border: `1px solid ${view === k ? tk.ac : tk.line}` }}>{l}</button>
              ))}
            </div>

            {view === 'chart' && (
              <>
                {suggestion && suggestion.chartType !== 'table' && <div style={{ fontSize: '0.8rem', color: tk.mute }}>💡 {suggestion.reason}</div>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="group" aria-label="Chart type">
                  {CHART_TYPES.filter((t) => t.id !== 'table').map((t) => (
                    <button key={t.id} type="button" aria-pressed={chartType === t.id} onClick={touch(() => setChartType(t.id))} style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 9, fontFamily: tk.mono, fontSize: '0.72rem', background: chartType === t.id ? tk.acSoft : 'transparent', color: chartType === t.id ? tk.ac : tk.sub, border: `1px solid ${chartType === t.id ? tk.ac : tk.line}` }}>{t.icon} {t.label}</button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10 }}>
                  <label style={{ display: 'block' }}>
                    <div style={{ fontFamily: tk.mono, fontSize: '0.6rem', textTransform: 'uppercase', color: tk.mute, marginBottom: 4 }}>{chartType === 'scatter' ? 'X (number)' : 'X axis / labels'}</div>
                    <select value={x} onChange={touch((e) => setX(+e.target.value))} style={selectStyle(tk)}>{columns.map((c) => <option key={c.index} value={c.index}>{c.name}</option>)}</select>
                  </label>
                  {!isPie && chartType !== 'scatter' && (
                    <label style={{ display: 'block' }}>
                      <div style={{ fontFamily: tk.mono, fontSize: '0.6rem', textTransform: 'uppercase', color: tk.mute, marginBottom: 4 }}>If labels repeat</div>
                      <select value={agg} onChange={touch((e) => setAgg(e.target.value))} style={selectStyle(tk)}>{[['sum', 'Add up'], ['avg', 'Average'], ['count', 'Count'], ['max', 'Maximum'], ['min', 'Minimum']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                    </label>
                  )}
                  <label style={{ display: 'block' }}>
                    <div style={{ fontFamily: tk.mono, fontSize: '0.6rem', textTransform: 'uppercase', color: tk.mute, marginBottom: 4 }}>Order</div>
                    <select value={sort} onChange={touch((e) => setSort(e.target.value))} style={selectStyle(tk)}><option value="none">As in the data</option><option value="desc">Highest first</option><option value="asc">Lowest first</option></select>
                  </label>
                </div>
                <div>
                  <div style={{ fontFamily: tk.mono, fontSize: '0.6rem', textTransform: 'uppercase', color: tk.mute, marginBottom: 6 }}>Values to plot {isPie ? '(first selected is used)' : ''}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {numericCols.filter((c) => c.index !== x).map((c) => (
                      <button key={c.index} type="button" aria-pressed={ys.includes(c.index)} onClick={() => toggleY(c.index)} style={{ cursor: 'pointer', padding: '7px 11px', borderRadius: 999, fontFamily: tk.mono, fontSize: '0.7rem', background: ys.includes(c.index) ? tk.acSoft : 'transparent', color: ys.includes(c.index) ? tk.ac : tk.sub, border: `1px solid ${ys.includes(c.index) ? tk.ac : tk.line}` }}>{ys.includes(c.index) ? '✓ ' : ''}{c.name}</button>
                    ))}
                    {!numericCols.length && <span style={{ fontSize: '0.8rem', color: tk.warn }}>No numeric columns found.</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: tk.sub }}>
                  <label style={{ display: 'flex', gap: 7, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={indian} onChange={(e) => setIndian(e.target.checked)} /> Lakh / crore numbers</label>
                  <label style={{ display: 'flex', gap: 7, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} /> Show values on bars</label>
                </div>
              </>
            )}
          </div>

          {/* chart */}
          {view === 'chart' && (
            <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 14, display: 'grid', gap: 10 }}>
              {built && built.series.length > 1 && !isPie && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} aria-label="Legend">
                  {built.series.map((s) => (
                    <button key={s.index} type="button" aria-pressed={!hidden.includes(s.index)} onClick={() => setHidden((h) => (h.includes(s.index) ? h.filter((v) => v !== s.index) : [...h, s.index]))} style={{ cursor: 'pointer', display: 'inline-flex', gap: 6, alignItems: 'center', padding: '5px 10px', borderRadius: 999, fontFamily: tk.sans, fontSize: '0.76rem', color: hidden.includes(s.index) ? tk.mute : tk.text, background: 'transparent', border: `1px solid ${tk.line}`, textDecoration: hidden.includes(s.index) ? 'line-through' : 'none' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />{s.name}
                    </button>
                  ))}
                </div>
              )}
              <div ref={chartBox} style={{ width: '100%', overflow: 'hidden' }}>
                {spec && spec.series.length > 0 ? <Chart svgRef={svgRef} tk={tk} spec={spec} width={width} /> : <div style={{ padding: 40, textAlign: 'center', color: tk.mute }}>{ys.length ? 'Nothing to show for this selection.' : 'Pick at least one numeric column under “Values to plot”.'}</div>}
              </div>
              {isPie && spec && spec.series[0] && (
                <div style={{ display: 'flex', gap: '6px 14px', flexWrap: 'wrap' }}>
                  {spec.labels.map((l, i) => { const tot = spec.series[0].data.reduce((a, b) => a + (b || 0), 0) || 1; return <span key={i} style={{ fontSize: '0.78rem', color: tk.sub, display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE[i % PALETTE.length] }} />{trunc(l, 22)} · {formatFull(spec.series[0].data[i], { indian })} ({(((spec.series[0].data[i] || 0) / tot) * 100).toFixed(1)}%)</span>; })}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn tk={tk} kind="primary" onClick={exportPng} disabled={!spec}>⬇ PNG</Btn>
                <Btn tk={tk} onClick={exportSvg} disabled={!spec}>⬇ SVG</Btn>
                <Btn tk={tk} kind="accent" onClick={explain} disabled={!spec || insightBusy}>{insightBusy ? 'Reading the chart…' : '✨ Explain this chart'}</Btn>
                <span aria-live="polite" style={{ fontFamily: tk.mono, fontSize: '0.72rem', color: tk.good, alignSelf: 'center' }}>{flash}</span>
              </div>
              {insight && (
                <div style={{ border: `1px solid ${tk.acLine}`, background: tk.acSoft, borderRadius: 12, padding: 14, display: 'grid', gap: 8 }}>
                  <Label tk={tk} style={{ margin: 0 }}>What this shows</Label>
                  <div style={{ fontSize: '0.88rem', color: tk.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{insight}</div>
                  <div style={{ fontSize: '0.72rem', color: tk.mute }}>Written by AI from your column statistics and the plotted values only — your raw rows are not sent. Double-check anything important.</div>
                  <div><Btn tk={tk} onClick={async () => flashMsg((await copyTo(insight)) ? 'Copied' : 'Copy failed')}>⧉ Copy</Btn></div>
                </div>
              )}
            </div>
          )}

          {/* data table */}
          {view === 'table' && (
            <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 14, display: 'grid', gap: 8 }}>
              <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontFamily: tk.mono, fontSize: '0.74rem', minWidth: '100%' }}>
                  <thead><tr>{columns.map((c) => <th key={c.index} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${tk.acLine}`, color: tk.ac, whiteSpace: 'nowrap', position: 'sticky', top: 0, background: tk.d ? '#1b1b25' : '#f7f6fb' }}>{c.name}<div style={{ fontSize: '0.58rem', color: tk.mute, fontWeight: 400 }}>{c.type}</div></th>)}</tr></thead>
                  <tbody>{table.rows.slice(0, TABLE_ROWS).map((r, ri) => <tr key={ri}>{r.map((v, ci) => <td key={ci} style={{ padding: '6px 12px', borderBottom: `1px solid ${tk.line}`, color: tk.sub, whiteSpace: 'nowrap', textAlign: columns[ci]?.type === 'number' ? 'right' : 'left' }}>{v}</td>)}</tr>)}</tbody>
                </table>
              </div>
              {table.rows.length > TABLE_ROWS && <div style={{ fontSize: '0.74rem', color: tk.mute }}>Showing the first {TABLE_ROWS} of {table.rows.length.toLocaleString()} rows. Charts use all rows.</div>}
            </div>
          )}

          {/* column profile */}
          {view === 'columns' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {columns.map((c) => (
                <div key={c.index} style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 12, padding: 14, display: 'grid', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <b style={{ color: tk.text, fontSize: '0.92rem' }}>{c.name}</b>
                    <span style={{ fontFamily: tk.mono, fontSize: '0.66rem', color: tk.ac }}>{c.type}{c.kind && c.kind !== 'number' && c.type === 'number' ? ` · ${c.kind}` : ''}{c.isYear ? ' · year' : ''}{c.isId ? ' · looks like an ID' : ''}</span>
                  </div>
                  {c.type === 'number' && <div style={{ fontFamily: tk.mono, fontSize: '0.72rem', color: tk.sub }}>min {formatFull(c.stats.min, { indian })} · max {formatFull(c.stats.max, { indian })} · mean {formatFull(c.stats.mean, { indian })} · median {formatFull(c.stats.median, { indian })} · sum {formatFull(c.stats.sum, { indian })}</div>}
                  {c.type === 'date' && <div style={{ fontFamily: tk.mono, fontSize: '0.72rem', color: tk.sub }}>{new Date(c.stats.min).toISOString().slice(0, 10)} → {new Date(c.stats.max).toISOString().slice(0, 10)}</div>}
                  {c.top && <div style={{ fontSize: '0.78rem', color: tk.sub }}>Most common: {c.top.map((t) => `${t.value} (${t.count})`).join(', ')} · {c.unique} unique</div>}
                  {c.unreadable.count > 0 && <div style={{ fontSize: '0.78rem', color: tk.warn }}>{c.unreadable.count} value{c.unreadable.count > 1 ? 's' : ''} aren’t numbers: {c.unreadable.samples.map((s) => `“${s}”`).join(', ')}</div>}
                  <div style={{ fontSize: '0.72rem', color: tk.mute }}>{c.nonEmpty.toLocaleString()} filled · {(table.rows.length - c.nonEmpty).toLocaleString()} empty</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
