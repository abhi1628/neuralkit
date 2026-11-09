// src/lib/csvCore.js — everything the CSV visualizer needs that is NOT drawing
//
// Fixes over v1:
//  • real CSV parsing (quotes, "" escapes, line breaks inside quotes, BOM, CRLF) instead of split(',')
//  • delimiter auto-detection: comma, semicolon, TAB (what Excel / Google Sheets paste), pipe
//  • numbers like ₹1,20,000  $1,234.50  12%  (500)  −7  1.234,56 are READ, never silently turned into 0
//  • every column is profiled (number / date / category / text) and unreadable values are reported
//  • sensible chart suggestion, duplicate-label aggregation, top-N + "Other", safe down-sampling

export const MAX_ROWS = 200000;
export const MAX_COLS = 200;

/* ═══════════════════════════════════════════════════════════════
   Parsing
═══════════════════════════════════════════════════════════════ */
const CANDIDATES = [',', ';', '\t', '|'];

/** Splits text into rows of cells using RFC-4180 rules. */
export function parseDelimited(text, delimiter = ',') {
  const src = String(text ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], cell = '', inQ = false, i = 0;
  const n = src.length;
  const pushCell = () => { row.push(cell); cell = ''; };
  const pushRow = () => { pushCell(); if (row.some((c) => c.trim() !== '')) rows.push(row); row = []; };
  while (i < n) {
    const ch = src[i];
    if (inQ) {
      if (ch === '"') { if (src[i + 1] === '"') { cell += '"'; i += 2; continue; } inQ = false; i++; continue; }
      cell += ch; i++; continue;
    }
    if (ch === '"' && cell.trim() === '') { inQ = true; cell = ''; i++; continue; }
    if (ch === delimiter) { pushCell(); i++; continue; }
    if (ch === '\r') { if (src[i + 1] === '\n') i++; pushRow(); i++; if (rows.length > MAX_ROWS + 1) break; continue; }
    if (ch === '\n') { pushRow(); i++; if (rows.length > MAX_ROWS + 1) break; continue; }
    cell += ch; i++;
  }
  if (cell !== '' || row.length) pushRow();
  return rows;
}

/** Picks the delimiter that gives the most consistent column count across the first lines. */
export function detectDelimiter(text) {
  const sample = String(text ?? '').replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).filter((l) => l.trim()).slice(0, 25);
  if (!sample.length) return ',';
  let best = ',', bestScore = -1;
  for (const d of CANDIDATES) {
    const counts = parseDelimited(sample.join('\n'), d).map((r) => r.length);
    if (!counts.length) continue;
    const mode = counts.sort((a, b) => a - b)[Math.floor(counts.length / 2)];
    if (mode < 2) continue;
    const consistent = counts.filter((c) => c === mode).length / counts.length;
    const score = consistent * 100 + Math.min(mode, 20); // consistency first, then more columns
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

/* ═══════════════════════════════════════════════════════════════
   Value parsing
═══════════════════════════════════════════════════════════════ */
const NULLISH = /^(|-|—|–|n\/?a|na|nan|null|none|nil|\?|#n\/a|#value!|#div\/0!|undefined)$/i;
export const isNullish = (s) => NULLISH.test(String(s ?? '').trim());

/** @returns {{value:number, kind:'number'|'currency'|'percent'}|null} */
export function parseNumber(raw) {
  let s = String(raw ?? '').trim();
  if (!s || isNullish(s)) return null;
  s = s.replace(/[\u2212\u2012\u2013]/g, '-').replace(/\u00A0/g, ' ');
  let neg = false, kind = 'number';
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1).trim(); }
  if (/%$/.test(s)) { kind = 'percent'; s = s.slice(0, -1).trim(); }
  const cur = /^[-+]?\s*(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|¥|JPY)\s*|\s*(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|¥|JPY)$/i;
  if (cur.test(s)) { kind = kind === 'percent' ? 'percent' : 'currency'; s = s.replace(/(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|¥|JPY)/gi, '').trim(); }
  if (/^-/.test(s)) { neg = !neg; s = s.slice(1).trim(); } else if (/^\+/.test(s)) s = s.slice(1).trim();
  if (/-$/.test(s)) { neg = !neg; s = s.slice(0, -1).trim(); }
  s = s.replace(/\s+/g, '');
  if (!/^[\d.,'’]+$/.test(s) || !/\d/.test(s)) return null;
  s = s.replace(/['’]/g, '');
  const lastDot = s.lastIndexOf('.'), lastComma = s.lastIndexOf(',');
  let t;
  if (lastDot >= 0 && lastComma >= 0) t = lastDot > lastComma ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.'); // 1,234.56  vs  1.234,56
  else if (lastComma >= 0) {
    const parts = s.split(',');
    const western = /^\d{1,3}(,\d{3})+$/.test(s);
    const indian = /^\d{1,2}(,\d{2})*,\d{3}$/.test(s);
    if (western || indian) t = s.replace(/,/g, '');
    else if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d{1,2}$/.test(parts[1])) t = `${parts[0]}.${parts[1]}`; // 12,5
    else return null;
  } else if ((s.match(/\./g) || []).length > 1) {
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) t = s.replace(/\./g, ''); else return null; // 1.234.567
  } else t = s;
  const v = Number(t);
  if (!Number.isFinite(v)) return null;
  return { value: neg ? -v : v, kind };
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const mIdx = (s) => MONTHS.indexOf(String(s).slice(0, 3).toLowerCase());
const validYmd = (y, m, d) => { const dt = new Date(Date.UTC(y, m - 1, d)); return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d; };

/** @returns {number|null} UTC timestamp. dayFirst resolves 03/04/2024 (default: day first, as in India/UK). */
export function parseDate(raw, { dayFirst = true } = {}) {
  const s = String(raw ?? '').trim();
  if (!s || isNullish(s) || s.length > 40) return null;
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s]\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.exec(s);
  if (m && validYmd(+m[1], +m[2], +m[3])) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/.exec(s);
  if (m) {
    let a = +m[1], b = +m[2]; let y = +m[3]; if (y < 100) y += y < 70 ? 2000 : 1900;
    let d = dayFirst ? a : b, mo = dayFirst ? b : a;
    if (mo > 12 && d <= 12) [d, mo] = [mo, d];
    return validYmd(y, mo, d) ? Date.UTC(y, mo - 1, d) : null;
  }
  m = /^(\d{4})[-/](\d{1,2})$/.exec(s);
  if (m && +m[2] >= 1 && +m[2] <= 12) return Date.UTC(+m[1], +m[2] - 1, 1);
  m = /^(\d{1,2})[\s\-.]([A-Za-z]{3,9})\.?,?[\s\-.]+(\d{2}|\d{4})$/.exec(s);
  if (m && mIdx(m[2]) >= 0) { let y = +m[3]; if (y < 100) y += y < 70 ? 2000 : 1900; return validYmd(y, mIdx(m[2]) + 1, +m[1]) ? Date.UTC(y, mIdx(m[2]), +m[1]) : null; }
  m = /^([A-Za-z]{3,9})\.?[\s\-.]+(\d{1,2}),?[\s\-.]+(\d{4})$/.exec(s);
  if (m && mIdx(m[1]) >= 0) return validYmd(+m[3], mIdx(m[1]) + 1, +m[2]) ? Date.UTC(+m[3], mIdx(m[1]), +m[2]) : null;
  m = /^([A-Za-z]{3,9})\.?[\s\-.,]+(\d{2}|\d{4})$/.exec(s);
  if (m && mIdx(m[1]) >= 0) { let y = +m[2]; if (y < 100) y += y < 70 ? 2000 : 1900; return Date.UTC(y, mIdx(m[1]), 1); }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   Table
═══════════════════════════════════════════════════════════════ */
const looksNumeric = (c) => parseNumber(c) !== null;

/** @returns {{headers:string[], rows:string[][], delimiter:string, warnings:string[], truncated:boolean}} */
export function parseTable(text, { delimiter = 'auto' } = {}) {
  const warnings = [];
  const raw = String(text ?? '');
  const d = delimiter === 'auto' ? detectDelimiter(raw) : delimiter;
  let all = parseDelimited(raw, d);
  if (all.length < 2) return { headers: [], rows: [], delimiter: d, warnings, truncated: false, error: 'Need a header row and at least one data row.' };
  let truncated = false;
  if (all.length > MAX_ROWS + 1) { all = all.slice(0, MAX_ROWS + 1); truncated = true; warnings.push(`Only the first ${MAX_ROWS.toLocaleString()} rows are used.`); }

  let hdrRow = all[0];
  const firstAllNumeric = hdrRow.filter((c) => c.trim()).length > 0 && hdrRow.filter((c) => c.trim()).every(looksNumeric);
  let dataRows = all.slice(1);
  if (firstAllNumeric && all.length > 2 && all[1].some(looksNumeric)) { // no header row
    hdrRow = hdrRow.map((_, i) => `Column ${i + 1}`); dataRows = all; warnings.push('No header row detected — columns were named Column 1, Column 2, …');
  }
  const width = Math.min(Math.max(hdrRow.length, ...dataRows.slice(0, 200).map((r) => r.length)), MAX_COLS);
  const seen = new Map();
  const headers = Array.from({ length: width }, (_, i) => {
    let h = String(hdrRow[i] ?? '').trim() || `Column ${i + 1}`;
    const k = h.toLowerCase();
    const c = (seen.get(k) || 0) + 1; seen.set(k, c);
    return c > 1 ? `${h} (${c})` : h;
  });
  let ragged = 0;
  const rows = dataRows.map((r) => {
    if (r.length !== width) ragged++;
    const out = r.slice(0, width).map((c) => c.trim());
    while (out.length < width) out.push('');
    return out;
  });
  if (ragged) warnings.push(`${ragged} row${ragged > 1 ? 's' : ''} had a different number of columns than the header and ${ragged > 1 ? 'were' : 'was'} padded or trimmed.`);
  return { headers, rows, delimiter: d, warnings, truncated };
}

/* ═══════════════════════════════════════════════════════════════
   Column profiling
═══════════════════════════════════════════════════════════════ */
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const h = Math.floor(s.length / 2); return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };

/**
 * @returns columns: [{ index, name, type:'number'|'date'|'category'|'text'|'empty', nonEmpty, nums:(number|null)[], times:(number|null)[],
 *   kind, unreadable:{count, samples}, unique, isYear, isId, stats?, top? }]
 */
export function inferColumns(headers, rows) {
  const dayFirst = (() => { // if any value has a first part > 12 it is day-first; second part > 12 → month-first
    let df = 0, mf = 0;
    for (const r of rows.slice(0, 500)) for (const c of r) { const m = /^(\d{1,2})[-/.](\d{1,2})[-/.]\d{2,4}$/.exec(c); if (m) { if (+m[1] > 12) df++; if (+m[2] > 12) mf++; } }
    return mf <= df;
  })();

  return headers.map((name, index) => {
    const vals = rows.map((r) => r[index] ?? '');
    const nonEmpty = vals.filter((v) => !isNullish(v));
    const nums = vals.map((v) => (isNullish(v) ? null : parseNumber(v)));
    const numCount = nums.filter(Boolean).length;
    const times = vals.map((v) => (isNullish(v) ? null : parseDate(v, { dayFirst })));
    const dateCount = times.filter((t) => t !== null).length;
    const uniq = new Set(nonEmpty.map((v) => v.toLowerCase()));
    const col = { index, name, nonEmpty: nonEmpty.length, unique: uniq.size, kind: 'number', nums: [], times: [], unreadable: { count: 0, samples: [] }, isYear: false, isId: false };
    if (!nonEmpty.length) return { ...col, type: 'empty' };

    const numShare = numCount / nonEmpty.length, dateShare = dateCount / nonEmpty.length;
    const pureInts = nums.filter(Boolean).every((n) => Number.isInteger(n.value));
    const yearLike = numShare >= 0.9 && pureInts && nums.filter(Boolean).every((n) => n.value >= 1900 && n.value <= 2100) && /year|yr|fy|session|batch/i.test(name) || (numShare >= 0.9 && pureInts && /^(year|yr|fy)$/i.test(name.trim()));
    let type;
    if (yearLike) type = 'category';
    else if (numShare >= 0.8 && !(dateShare >= 0.8 && numShare < 0.8)) type = 'number';
    else if (dateShare >= 0.8) type = 'date';
    else if (uniq.size <= Math.max(20, nonEmpty.length * 0.5)) type = 'category';
    else type = 'text';

    const out = { ...col, type, isYear: yearLike };
    if (type === 'number') {
      const kinds = nums.filter(Boolean).map((n) => n.kind);
      out.kind = kinds.includes('percent') && kinds.filter((k) => k === 'percent').length >= kinds.length * 0.5 ? 'percent' : kinds.includes('currency') ? 'currency' : 'number';
      out.nums = nums.map((n) => (n ? n.value : null));
      const bad = vals.map((v, i) => (!isNullish(v) && !nums[i] ? v : null)).filter((v) => v !== null);
      out.unreadable = { count: bad.length, samples: [...new Set(bad)].slice(0, 4) };
      const good = out.nums.filter((v) => v !== null);
      const sum = good.reduce((a, b) => a + b, 0);
      out.stats = { count: good.length, min: Math.min(...good), max: Math.max(...good), sum, mean: sum / good.length, median: median(good) };
      out.isId = pureInts && good.length > 5 && uniq.size === nonEmpty.length && /(^|[^a-z])(id|no|roll|sr|sno|serial|index)([^a-z]|$)/i.test(name);
    } else if (type === 'date') {
      out.times = times;
      const g = times.filter((t) => t !== null);
      out.stats = { count: g.length, min: Math.min(...g), max: Math.max(...g) };
    } else if (type === 'category' || type === 'text') {
      if (numShare >= 0.5 && numShare < 0.8) { // mostly numbers but some junk → tell the user
        const bad = vals.filter((v, i) => !isNullish(v) && !nums[i]);
        out.unreadable = { count: bad.length, samples: [...new Set(bad)].slice(0, 4) };
        out.nums = nums.map((n) => (n ? n.value : null)); out.maybeNumeric = true;
      }
      const freq = new Map();
      nonEmpty.forEach((v) => freq.set(v, (freq.get(v) || 0) + 1));
      out.top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([value, count]) => ({ value, count }));
      if (numShare >= 0.9) out.nums = nums.map((n) => (n ? n.value : null)); // e.g. Year column
    }
    return out;
  });
}

/* ═══════════════════════════════════════════════════════════════
   Chart suggestion + series
═══════════════════════════════════════════════════════════════ */
export const CHART_TYPES = [
  { id: 'bar', label: 'Bar', icon: '▬' }, { id: 'hbar', label: 'H-Bar', icon: '≡' }, { id: 'line', label: 'Line', icon: '╱' }, { id: 'area', label: 'Area', icon: '◭' },
  { id: 'pie', label: 'Pie', icon: '◕' }, { id: 'donut', label: 'Donut', icon: '◎' }, { id: 'scatter', label: 'Scatter', icon: '⁘' }, { id: 'stacked', label: 'Stacked', icon: '⊟' }, { id: 'table', label: 'Table', icon: '⊞' },
];

export function suggestChart(columns, rowCount) {
  const nums = columns.filter((c) => c.type === 'number' && !c.isId);
  const dates = columns.filter((c) => c.type === 'date');
  const cats = columns.filter((c) => (c.type === 'category' || c.isYear) && c.unique >= 2);
  if (!nums.length) return { chartType: 'table', x: 0, ys: [], reason: 'No numeric column was found, so a table is shown.' };
  if (dates.length) return { chartType: rowCount > 60 ? 'area' : 'line', x: dates[0].index, ys: nums.slice(0, 3).map((c) => c.index), reason: `“${dates[0].name}” is a date, so a line chart shows the trend.` };
  const x = cats.find((c) => c.unique <= 30) || cats[0];
  if (x) {
    const ys = nums.filter((c) => c.index !== x.index).slice(0, 3).map((c) => c.index);
    if (ys.length) {
      const pieOk = ys.length === 1 && x.unique <= 6 && columns[ys[0]].stats.min >= 0 && !x.isYear && /share|percent|%|total|count|sales|revenue|amount/i.test(columns[ys[0]].name);
      return { chartType: pieOk ? 'pie' : x.unique > 12 ? 'hbar' : 'bar', x: x.index, ys, reason: `“${x.name}” groups the data, “${columns[ys[0]].name}” is the value.` };
    }
  }
  if (nums.length >= 2) return { chartType: 'scatter', x: nums[0].index, ys: [nums[1].index], reason: 'Two numeric columns — a scatter plot shows how they relate.' };
  return { chartType: 'bar', x: columns.find((c) => c.index !== nums[0].index)?.index ?? 0, ys: [nums[0].index], reason: 'Showing the numeric column.' };
}

export const PALETTE = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#3b82f6', '#84cc16', '#f97316', '#14b8a6', '#a855f7', '#eab308'];

const AGG = {
  sum: (a) => a.reduce((s, v) => s + v, 0),
  avg: (a) => a.reduce((s, v) => s + v, 0) / a.length,
  count: (a) => a.length,
  max: (a) => Math.max(...a),
  min: (a) => Math.min(...a),
};

function fmtDateLabel(ts, spanDays, monthly) {
  const d = new Date(ts);
  const mon = MONTHS[d.getUTCMonth()].replace(/^./, (c) => c.toUpperCase());
  if (monthly) return spanDays > 400 ? `${mon} ${d.getUTCFullYear()}` : mon;
  return spanDays > 400 ? `${d.getUTCDate()} ${mon} ${String(d.getUTCFullYear()).slice(2)}` : `${d.getUTCDate()} ${mon}`;
}

/**
 * @param {object[]} columns from inferColumns
 * @param {string[][]} rows
 * @param {{x:number, ys:number[], chartType:string, agg?:string, sort?:'none'|'asc'|'desc', maxCategories?:number}} o
 * @returns {{labels:string[], series:{name, data:(number|null)[], color, index}[], xs?:number[], warnings:string[], dropped:number, xType:string}}
 */
export function buildSeries(columns, rows, o) {
  const { x, ys, chartType, agg = 'sum', sort = 'none', maxCategories = chartType === 'pie' || chartType === 'donut' ? 10 : 40 } = o;
  const warnings = [];
  const xc = columns[x];
  const yc = ys.map((i) => columns[i]).filter(Boolean);
  if (!xc || !yc.length) return { labels: [], series: [], warnings: ['Pick a column for the X axis and at least one numeric column for Y.'], dropped: 0, xType: 'category' };

  yc.forEach((c) => {
    if (!c.nums.length) warnings.push(`“${c.name}” isn’t numeric, so it can’t be charted as a value.`);
    else if (c.unreadable.count) warnings.push(`${c.unreadable.count} value${c.unreadable.count > 1 ? 's' : ''} in “${c.name}” couldn’t be read as numbers (${c.unreadable.samples.map((s) => `“${s}”`).join(', ')}) and ${c.unreadable.count > 1 ? 'are' : 'is'} left out.`);
  });
  const usable = yc.filter((c) => c.nums.length);

  // scatter: X must be numeric
  if (chartType === 'scatter') {
    const xs = [];
    const xn = xc.type === 'date' ? xc.times : xc.nums.length ? xc.nums : null; // numeric, or mostly numeric (bad cells are skipped)
    if (!xn) return { labels: [], series: [], warnings: ['Scatter plots need a numeric (or date) X column.'], dropped: 0, xType: 'category' };
    const pts = usable.map((c, si) => ({ name: c.name, index: c.index, color: PALETTE[si % PALETTE.length], data: [] }));
    let dropped = 0;
    rows.forEach((_, r) => { if (xn[r] === null) { dropped++; return; } xs.push(xn[r]); pts.forEach((p, si) => p.data.push(usable[si].nums[r])); });
    if (dropped) warnings.push(`${dropped} row${dropped > 1 ? 's' : ''} without a valid X value ${dropped > 1 ? 'were' : 'was'} skipped.`);
    return { labels: [], xs, series: pts, warnings, dropped, xType: xc.type === 'date' ? 'date' : 'number' };
  }

  const isDate = xc.type === 'date';
  let keys = [], keyTime = new Map();
  const groups = new Map(); // key → arrays per series
  let dropped = 0;
  rows.forEach((r, ri) => {
    let key;
    if (isDate) { if (xc.times[ri] === null) { dropped++; return; } key = String(xc.times[ri]); keyTime.set(key, xc.times[ri]); } else { key = (r[x] || '').trim(); if (isNullish(key)) { dropped++; return; } }
    if (!groups.has(key)) { groups.set(key, usable.map(() => [])); keys.push(key); }
    const g = groups.get(key);
    usable.forEach((c, si) => { const v = c.nums[ri]; if (v !== null && v !== undefined) g[si].push(v); });
  });
  if (isDate) keys.sort((a, b) => keyTime.get(a) - keyTime.get(b));
  const aggFn = AGG[agg] || AGG.sum;
  let table = keys.map((k) => ({ key: k, vals: groups.get(k).map((arr) => (arr.length ? aggFn(arr) : null)) }));
  const dup = rows.length - dropped > keys.length;
  if (dup && agg !== 'count') warnings.push(`Rows with the same “${xc.name}” were combined (${agg === 'avg' ? 'average' : agg}).`);

  if (sort === 'asc' || sort === 'desc') table.sort((a, b) => ((a.vals[0] ?? 0) - (b.vals[0] ?? 0)) * (sort === 'asc' ? 1 : -1));
  if (chartType === 'pie' || chartType === 'donut') {
    const before = table.length;
    table = table.filter((t) => (t.vals[0] ?? 0) > 0);
    if (table.length < before) warnings.push('Pie charts can’t show zero or negative values; those rows were left out.');
  }

  // too many categories → keep the biggest, group the rest (bars/pie); bucket-average for long time series
  const cap = isDate && (chartType === 'line' || chartType === 'area') ? 400 : maxCategories;
  if (table.length > cap) {
    if (isDate || sort === 'none' && xc.isYear) {
      const size = Math.ceil(table.length / cap);
      const bucketed = [];
      for (let i = 0; i < table.length; i += size) {
        const chunk = table.slice(i, i + size);
        bucketed.push({ key: chunk[Math.floor(chunk.length / 2)].key, vals: usable.map((_, si) => { const v = chunk.map((t) => t.vals[si]).filter((q) => q !== null); return v.length ? AGG.avg(v) : null; }) });
      }
      warnings.push(`${table.length.toLocaleString()} points were averaged down to ${bucketed.length} so the chart stays readable.`);
      table = bucketed;
    } else {
      const ranked = [...table].sort((a, b) => (b.vals[0] ?? 0) - (a.vals[0] ?? 0));
      const keep = new Set(ranked.slice(0, cap - 1).map((t) => t.key));
      const rest = table.filter((t) => !keep.has(t.key));
      const kept = table.filter((t) => keep.has(t.key));
      const other = { key: 'Other', vals: usable.map((_, si) => AGG.sum(rest.map((t) => t.vals[si] ?? 0))) };
      warnings.push(`Showing the top ${cap - 1} of ${table.length.toLocaleString()} categories; the other ${rest.length.toLocaleString()} are grouped as “Other”.`);
      table = [...(sort === 'none' ? kept : ranked.slice(0, cap - 1)), other];
    }
  }

  let labels;
  if (isDate) {
    const ts = table.map((t) => keyTime.get(t.key) ?? Number(t.key));
    const span = (Math.max(...ts) - Math.min(...ts)) / 86400000;
    const monthly = ts.every((t) => new Date(t).getUTCDate() === 1);
    labels = ts.map((t) => fmtDateLabel(t, span, monthly));
  } else labels = table.map((t) => t.key);
  if (dropped) warnings.push(`${dropped} row${dropped > 1 ? 's' : ''} with an empty “${xc.name}” ${dropped > 1 ? 'were' : 'was'} skipped.`);
  const series = usable.map((c, si) => ({ name: c.name, index: c.index, color: PALETTE[si % PALETTE.length], data: table.map((t) => t.vals[si]) }));
  return { labels, series, warnings, dropped, xType: isDate ? 'date' : 'category' };
}

/* ═══════════════════════════════════════════════════════════════
   Axis / number formatting
═══════════════════════════════════════════════════════════════ */
export function niceTicks(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ticks: [0, 1], min: 0, max: 1 };
  if (min === max) { if (min === 0) { max = 1; } else { const p = Math.abs(min) * 0.1 || 1; min -= p; max += p; } }
  const span = max - min;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : Number(v.toPrecision(12)));
  return { ticks, min: lo, max: hi };
}

/** compact: 1.2k / 3.4M  — or Indian grouping (L / Cr) when indian is true. */
export function formatNumber(v, { indian = false, compact = true, percent = false, currency = '' } = {}) {
  if (v === null || v === undefined || !Number.isFinite(v)) return '–';
  const abs = Math.abs(v), sign = v < 0 ? '-' : '';
  const trim = (n, d = 1) => String(Number(n.toFixed(d)));
  let body;
  if (!compact || abs < 1000) body = abs >= 100 ? trim(abs, 0) : trim(abs, abs >= 10 ? 1 : 2);
  else if (indian) body = abs >= 1e7 ? `${trim(abs / 1e7)} Cr` : abs >= 1e5 ? `${trim(abs / 1e5)} L` : `${trim(abs / 1e3)}k`;
  else body = abs >= 1e9 ? `${trim(abs / 1e9)}B` : abs >= 1e6 ? `${trim(abs / 1e6)}M` : `${trim(abs / 1e3)}k`;
  return `${sign}${currency}${body}${percent ? '%' : ''}`;
}

export const formatFull = (v, { indian = false } = {}) => (v === null || v === undefined || !Number.isFinite(v) ? '–' : v.toLocaleString(indian ? 'en-IN' : 'en-US', { maximumFractionDigits: 2 }));

/** Compact description of the data for the optional AI insight (no raw rows are sent). */
export function profileText(columns, rowCount) {
  const lines = [`${rowCount} rows, ${columns.length} columns`];
  columns.forEach((c) => {
    if (c.type === 'number') lines.push(`- ${c.name} (number${c.kind !== 'number' ? `, ${c.kind}` : ''}): min ${c.stats.min}, max ${c.stats.max}, mean ${Math.round(c.stats.mean * 100) / 100}, median ${c.stats.median}, sum ${Math.round(c.stats.sum * 100) / 100}`);
    else if (c.type === 'date') lines.push(`- ${c.name} (date): ${new Date(c.stats.min).toISOString().slice(0, 10)} to ${new Date(c.stats.max).toISOString().slice(0, 10)}`);
    else if (c.type === 'category') lines.push(`- ${c.name} (category, ${c.unique} unique): top ${c.top.map((t) => `${t.value} (${t.count})`).join(', ')}`);
    else if (c.type === 'text') lines.push(`- ${c.name} (text, ${c.unique} unique)`);
  });
  return lines.join('\n');
}
