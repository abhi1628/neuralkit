// src/components/CsvVisualizer.jsx
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

const EXAMPLE_CSV = `Month,Sales,Expenses,Profit
Jan,52000,31000,21000
Feb,61000,28000,33000
Mar,58000,35000,23000
Apr,74000,32000,42000
May,69000,29000,40000
Jun,82000,38000,44000`;

const COLORS = ['#a78bfa','#818cf8','#a78bfa','#f59e0b','#f87171','#34d399','#fb923c','#60a5fa','#e879f9','#4ade80'];

const CHART_TYPES = [
  { id: 'bar',     label: 'Bar',     icon: '▬' },
  { id: 'hbar',    label: 'H-Bar',   icon: '≡' },
  { id: 'line',    label: 'Line',    icon: '╱' },
  { id: 'area',    label: 'Area',    icon: '◭' },
  { id: 'pie',     label: 'Pie',     icon: '◕' },
  { id: 'donut',   label: 'Donut',   icon: '◎' },
  { id: 'scatter', label: 'Scatter', icon: '⁘' },
  { id: 'stacked', label: 'Stacked', icon: '⊟' },
  { id: 'table',   label: 'Table',   icon: '⊞' },
];

export default function CsvVisualizer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  const [csv,       setCsv]       = useState('');
  const [headers,   setHeaders]   = useState([]);
  const [rows,      setRows]      = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [xCol,      setXCol]      = useState(0);
  const [yCols,     setYCols]     = useState([1]);
  const [error,     setError]     = useState('');
  const [parsed,    setParsed]    = useState(false);
  const [fileName,  setFileName]  = useState('');
  const canvasRef = useRef(null);
  const fileRef   = useRef(null);

  function handleCsvFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) { setError('Please upload a .csv or .txt file.'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => { setCsv(ev.target.result); setParsed(false); setError(''); parseCsvStr(ev.target.result); };
    reader.readAsText(file);
  }

  function parseCsvStr(input) {
    setError(''); setParsed(false);
    const lines = input.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) { setError('Need at least a header row and one data row.'); return; }
    const hdrs = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1).map(l => l.split(',').map(v => v.trim().replace(/^"|"$/g, '')));
    setHeaders(hdrs); setRows(data); setXCol(0); setYCols([1]); setParsed(true);
  }

  function toggleYCol(i) { setYCols(prev => prev.includes(i) ? (prev.length > 1 ? prev.filter(x => x !== i) : prev) : [...prev, i]); }

  function clearAll() { setCsv(''); setParsed(false); setHeaders([]); setRows([]); setError(''); setFileName(''); if (fileRef.current) fileRef.current.value = ''; }

  function downloadChart() {
    if (!canvasRef.current) return;
    const a = document.createElement('a'); a.href = canvasRef.current.toDataURL('image/png'); a.download = 'chart-zeroapi.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  const singleColOnly = ['pie','donut','hbar','scatter'].includes(chartType);

  useEffect(() => {
    if (!parsed || !rows.length || chartType === 'table' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const PAD = { top: 40, right: 30, bottom: 70, left: 75 };
    const chartW = W - PAD.left - PAD.right, chartH = H - PAD.top - PAD.bottom;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0d1117' : '#f8fafc'; ctx.fillRect(0, 0, W, H);

    const labels = rows.map(r => r[xCol] || '');
    const datasets = yCols.map((ci, di) => ({ label: headers[ci], color: COLORS[di % COLORS.length], data: rows.map(r => parseFloat(r[ci]) || 0) }));
    const allVals = datasets.flatMap(d => d.data);
    const maxV = Math.max(...allVals) * 1.15 || 1;
    const minV = chartType === 'scatter' ? Math.min(...allVals) * 0.9 : Math.min(0, ...allVals);

    // Grid lines
    if (!['pie','donut'].includes(chartType)) {
      for (let i = 0; i <= 5; i++) {
        const v = minV + (maxV - minV) * i / 5;
        const y = chartType === 'hbar' ? PAD.top + (i / 5) * chartH : PAD.top + chartH - (v - minV) / (maxV - minV) * chartH;
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(PAD.left, chartType === 'hbar' ? PAD.top + i * chartH / 5 : y);
        ctx.lineTo(PAD.left + chartW, chartType === 'hbar' ? PAD.top + i * chartH / 5 : y); ctx.stroke();
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)';
        ctx.font = '11px monospace'; ctx.textAlign = 'right';
        if (chartType !== 'hbar') ctx.fillText(v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0), PAD.left - 8, y + 4);
      }
    }

    if (chartType === 'bar') {
      const grpW = chartW / labels.length, barW = (grpW - 8) / datasets.length;
      datasets.forEach((ds, di) => ds.data.forEach((v, li) => {
        const x = PAD.left + li * grpW + di * barW + 4, barH = (v - minV) / (maxV - minV) * chartH, y = PAD.top + chartH - barH;
        ctx.fillStyle = ds.color; ctx.globalAlpha = 0.88;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, barW - 2, barH, [3,3,0,0]); else ctx.rect(x, y, barW - 2, barH);
        ctx.fill(); ctx.globalAlpha = 1;
      }));
    } else if (chartType === 'hbar') {
      const ds = datasets[0], barH = (chartH / labels.length) * 0.6, maxVal = Math.max(...ds.data) * 1.1 || 1;
      labels.forEach((l, i) => {
        const y = PAD.top + i * (chartH / labels.length) + barH / 2;
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'; ctx.font = '11px monospace'; ctx.textAlign = 'right';
        ctx.fillText(l.length > 10 ? l.slice(0,9)+'…' : l, PAD.left - 6, y + 4);
        const bw = (ds.data[i] / maxVal) * chartW;
        ctx.fillStyle = COLORS[i % COLORS.length]; ctx.globalAlpha = 0.88;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(PAD.left, y - barH / 2, bw, barH, [0,3,3,0]); else ctx.rect(PAD.left, y - barH / 2, bw, barH);
        ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = isDark ? '#fff' : '#111'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
        ctx.fillText(ds.data[i] >= 1000 ? `${(ds.data[i]/1000).toFixed(1)}k` : ds.data[i], PAD.left + bw + 4, y + 4);
      });
    } else if (chartType === 'line' || chartType === 'area') {
      datasets.forEach(ds => {
        const pts = ds.data.map((v, i) => ({ x: PAD.left + (i + 0.5) * (chartW / labels.length), y: PAD.top + chartH - (v - minV) / (maxV - minV) * chartH }));
        if (chartType === 'area') {
          ctx.beginPath(); ctx.moveTo(pts[0].x, PAD.top + chartH);
          pts.forEach(p => ctx.lineTo(p.x, p.y)); ctx.lineTo(pts[pts.length-1].x, PAD.top + chartH); ctx.closePath();
          ctx.fillStyle = ds.color; ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 1;
        }
        ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = ds.color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
        pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fillStyle = ds.color; ctx.fill(); ctx.strokeStyle = isDark ? '#0d1117' : '#f8fafc'; ctx.lineWidth = 2; ctx.stroke(); });
      });
    } else if (chartType === 'scatter') {
      datasets.forEach(ds => {
        const allX = rows.map(r => parseFloat(r[xCol]) || 0), maxX = Math.max(...allX) * 1.1 || 1, minX = Math.min(...allX) * 0.9;
        ds.data.forEach((v, i) => {
          const px = PAD.left + ((allX[i] - minX) / (maxX - minX)) * chartW, py = PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH;
          ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2); ctx.fillStyle = ds.color; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1;
        });
      });
    } else if (chartType === 'pie' || chartType === 'donut') {
      const ds = datasets[0], total = ds.data.reduce((a, b) => a + b, 0), cx = W/2, cy = H/2, r = Math.min(chartW, chartH) / 2 - 10;
      let angle = -Math.PI / 2;
      ds.data.forEach((v, i) => {
        const slice = (v / total) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + slice); ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length]; ctx.globalAlpha = 0.88; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = isDark ? '#0d1117' : '#f8fafc'; ctx.lineWidth = 2; ctx.stroke();
        const midA = angle + slice / 2, lx = cx + (r * 0.65) * Math.cos(midA), ly = cy + (r * 0.65) * Math.sin(midA);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${((v/total)*100).toFixed(0)}%`, lx, ly + 4);
        if (chartType === 'donut') { ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI*2); ctx.fillStyle = isDark ? '#0d1117' : '#f8fafc'; ctx.fill(); }
        angle += slice;
      });
      const legendY = H - PAD.bottom + 20;
      ds.data.forEach((v, i) => { ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fillRect(PAD.left + i * 120, legendY, 10, 10); ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'; ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.fillText((labels[i] || '').slice(0,12), PAD.left + i * 120 + 14, legendY + 9); });
    } else if (chartType === 'stacked') {
      const grpW = chartW / labels.length;
      labels.forEach((l, li) => {
        let bottom = PAD.top + chartH;
        datasets.forEach(ds => {
          const barH = (ds.data[li] / maxV) * chartH, barW = grpW * 0.65, x = PAD.left + li * grpW + (grpW - barW) / 2;
          ctx.fillStyle = ds.color; ctx.globalAlpha = 0.88;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, bottom - barH, barW, barH, [2,2,0,0]); else ctx.rect(x, bottom - barH, barW, barH);
          ctx.fill(); ctx.globalAlpha = 1; bottom -= barH;
        });
      });
    }

    // X labels
    if (!['pie','donut','hbar'].includes(chartType)) {
      labels.forEach((l, i) => {
        const x = PAD.left + (i + 0.5) * (chartW / labels.length);
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(l.length > 10 ? l.slice(0,8)+'…' : l, x, PAD.top + chartH + 20);
      });
      datasets.forEach((ds, i) => {
        const lx = PAD.left + i * 130, ly = PAD.top + chartH + 50;
        ctx.fillStyle = ds.color; ctx.fillRect(lx, ly - 9, 11, 11);
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
        ctx.fillText(ds.label.slice(0,14), lx + 14, ly);
      });
    }
  }, [parsed, rows, xCol, yCols, chartType, headers, isDark]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${fileName ? ac : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)')}`, borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: fileName ? (isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.04)') : 'transparent', transition: 'all 0.2s' }}>
        <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleCsvFile} />
        <span style={{ fontSize: '1.4rem' }}>{fileName ? '📊' : '⬆️'}</span>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: fileName ? ac : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)') }}>{fileName || 'Upload .csv file'}</div>
          <div style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', marginTop: '2px' }}>Supports .csv · .txt — or paste below</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }}>OR PASTE CSV</span>
        <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
      </div>
      <div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: ac, letterSpacing: '0.1em', marginBottom: '8px' }}>PASTE CSV DATA</div>
        <textarea value={csv} onChange={e => { setCsv(e.target.value); if (fileName) setFileName(''); }} rows={6} className="tool-textarea" style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.78rem' }} placeholder={EXAMPLE_CSV} />
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => parseCsvStr(csv)} className="run-btn" style={{ flex: '0 0 auto', padding: '10px 24px' }}>📊 Visualize</button>
        <button onClick={() => { setCsv(EXAMPLE_CSV); setFileName(''); if (fileRef.current) fileRef.current.value = ''; setParsed(false); setError(''); }} className="action-btn">Try Example</button>
        {(parsed || csv) && <button onClick={clearAll} className="action-btn" style={{ color: ac, borderColor: ac }}>↺ Clear</button>}
      </div>
      {error && <div className="error-box">⚠ {error}</div>}
      {parsed && (
        <>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', color: ac, marginBottom: '8px' }}>CHART TYPE</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {CHART_TYPES.map(ct => <button key={ct.id} onClick={() => setChartType(ct.id)} style={{ background: chartType === ct.id ? ac : 'transparent', border: `1px solid ${ac}`, borderRadius: '8px', padding: '6px 12px', color: chartType === ct.id ? '#000' : ac, fontFamily: "'Space Mono',monospace", fontSize: '0.68rem', cursor: 'pointer', fontWeight: chartType === ct.id ? 700 : 400, display: 'flex', alignItems: 'center', gap: '5px' }}><span>{ct.icon}</span>{ct.label}</button>)}
            </div>
          </div>
          {chartType !== 'table' && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', color: ac, marginBottom: '6px' }}>{chartType === 'scatter' ? 'X AXIS (numeric)' : 'X AXIS / LABELS'}</div>
                <select value={xCol} onChange={e => setXCol(+e.target.value)} style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${ac}33`, borderRadius: '6px', padding: '6px 10px', color: isDark ? '#fff' : '#1a1a1a', fontFamily: "'Space Mono',monospace", fontSize: '0.72rem' }}>
                  {headers.map((h,i) => <option key={i} value={i}>{h}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', color: ac, marginBottom: '6px' }}>Y AXIS {!singleColOnly && '(multi-select)'}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {headers.map((h,i) => i !== xCol && <button key={i} onClick={() => singleColOnly ? setYCols([i]) : toggleYCol(i)} style={{ background: yCols.includes(i) ? ac : 'transparent', border: `1px solid ${ac}`, borderRadius: '6px', padding: '5px 12px', color: yCols.includes(i) ? '#000' : ac, fontFamily: "'Space Mono',monospace", fontSize: '0.68rem', cursor: 'pointer', fontWeight: yCols.includes(i) ? 700 : 400 }}>{h}</button>)}
                </div>
              </div>
            </div>
          )}
          {chartType !== 'table' && (
            <div style={{ background: isDark ? '#0d1117' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '14px', overflow: 'hidden', padding: '8px' }}>
              <canvas ref={canvasRef} width={700} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}
          {chartType === 'table' && (
            <div style={{ background: isDark ? '#0d1117' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '14px', overflow: 'auto', maxHeight: '380px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Space Mono',monospace", fontSize: '0.72rem' }}>
                <thead><tr>{headers.map((h,i) => <th key={i} style={{ padding: '10px 14px', textAlign: 'left', background: isDark ? '#1f2937' : '#e0fdfa', color: ac, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>{rows.map((r,ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)') }}>{r.map((cell,ci) => <td key={ci} style={{ padding: '8px 14px', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {chartType !== 'table' && <button onClick={downloadChart} className="action-btn">⬇ Download PNG</button>}
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>{rows.length} rows · {headers.length} columns</div>
          </div>
        </>
      )}
    </div>
  );
}
