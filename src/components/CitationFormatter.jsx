// src/components/CitationFormatter.jsx — Citation Studio
//
//  Cite & convert : DOI / arXiv / ISBN / URL / pasted reference(s) → 6 styles, BibTeX, RIS, in-text citations
//                   one reference → every style side by side; many → a sorted/numbered bibliography you can export
//  Verify         : paste a bibliography → each reference is checked against CrossRef / Open Library / arXiv
//  Honest by design: if a lookup fails we say so (no AI guessing); AI only reads text YOU pasted, and every
//                    field it returns is checked against that text. Copy keeps italics (rich-text clipboard).

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { TOOL_MODELS } from '../constants';
import { trackEvent, loadScript } from '../utils';
import { copyTo, downloadBlob } from '../resumeCore';
import {
  STYLE_KEYS, STYLE_LABELS, NUMBERED_STYLES, buildCitations, buildBibliography, formatReference, bibtexAll, risAll, cleanMeta, splitName,
} from '../lib/citationEngine';
import { resolveReference, resolveMany, splitReferences, verifyMany } from '../lib/citationResolvers';
import { copyRich, bibliographyHtml, onlyItalicTags, downloadText, renderBibliographyDocx } from '../lib/citationExport';

const MAX_ENTRIES = 40;
const LS_STYLE = 'zeroapi:citation:style';
const EXAMPLE = '10.1038/nature14539\narXiv:1706.03762\nISBN 978-0-13-235088-4';
const TYPE_LABELS = { 'article-journal': 'Journal article', 'paper-conference': 'Conference paper', book: 'Book', chapter: 'Book chapter', webpage: 'Web page', preprint: 'Preprint', report: 'Report', thesis: 'Thesis' };

const newId = () => Math.random().toString(36).slice(2, 9);

function toEntries(text) {
  const t = String(text || '').trim();
  if (!t) return [];
  if (!/\n/.test(t)) return [t];
  const list = splitReferences(t);
  return (list.length ? list : t.split('\n').map((l) => l.trim()).filter(Boolean)).slice(0, MAX_ENTRIES);
}

function tokens(d) {
  return {
    d, text: d ? '#ffffff' : '#1a1a1a', sub: d ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.72)', mute: d ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.5)',
    line: d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)', soft: d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.035)', card: d ? 'rgba(255,255,255,0.03)' : '#fff',
    input: d ? 'rgba(255,255,255,0.06)' : '#fff', inputLine: d ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.18)',
    ac: 'var(--accent)', acSoft: d ? 'rgba(167,139,250,0.13)' : 'rgba(124,58,237,0.08)', acLine: d ? 'rgba(167,139,250,0.42)' : 'rgba(124,58,237,0.36)',
    good: d ? '#34d399' : '#059669', bad: d ? '#f87171' : '#dc2626', warn: d ? '#fbbf24' : '#b45309', info: d ? '#60a5fa' : '#2563eb',
    grad: 'linear-gradient(135deg,#a78bfa,#818cf8)', mono: "'Space Mono', monospace", sans: "'DM Sans', sans-serif",
  };
}

/* ─────────────── small UI pieces ─────────────── */
function Btn({ tk, children, onClick, disabled, kind = 'soft', style, title }) {
  const k = {
    soft: { background: tk.soft, border: `1px solid ${tk.line}`, color: tk.sub },
    accent: { background: tk.acSoft, border: `1px solid ${tk.acLine}`, color: tk.ac },
    primary: { background: tk.grad, border: 'none', color: '#fff', fontWeight: 700 },
    danger: { background: 'transparent', border: `1px solid ${tk.bad}66`, color: tk.bad },
  }[kind];
  return <button type="button" title={title} onClick={onClick} disabled={disabled} style={{ fontFamily: tk.mono, fontSize: '0.72rem', borderRadius: 9, padding: '9px 14px', minHeight: 38, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', ...k, ...style }}>{children}</button>;
}
const Spin = () => <span className="spinner" style={{ width: 12, height: 12, display: 'inline-block' }} />;

function Label({ tk, children, style }) {
  return <div style={{ fontFamily: tk.mono, fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tk.ac, marginBottom: 6, ...style }}>{children}</div>;
}

function Chip({ tk, color, children }) {
  return <span style={{ fontFamily: tk.mono, fontSize: '0.66rem', padding: '3px 9px', borderRadius: 999, border: `1px solid ${color}55`, background: `${color}18`, color, display: 'inline-block', whiteSpace: 'nowrap' }}>{children}</span>;
}

function Notice({ tk, kind = 'info', children }) {
  const c = { info: tk.info, warn: tk.warn, bad: tk.bad, good: tk.good }[kind];
  return <div role={kind === 'bad' ? 'alert' : 'status'} style={{ border: `1px solid ${c}55`, background: `${c}12`, borderRadius: 10, padding: '9px 13px', fontFamily: tk.sans, fontSize: '0.84rem', lineHeight: 1.55, color: tk.text }}>{children}</div>;
}

const fieldStyle = (tk) => ({ width: '100%', boxSizing: 'border-box', background: tk.input, border: `1px solid ${tk.inputLine}`, borderRadius: 9, padding: '10px 12px', color: tk.text, fontFamily: tk.sans, fontSize: '16px', outline: 'none', lineHeight: 1.5 });

function Field({ tk, label, value, onChange, multiline, rows = 3, placeholder }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontFamily: tk.mono, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tk.mute, marginBottom: 4 }}>{label}</div>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ ...fieldStyle(tk), resize: 'vertical' }} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={fieldStyle(tk)} />}
    </label>
  );
}

/** Citation text. The engine returns escaped HTML containing only <i> tags; we re-filter anyway. */
function CitationText({ html, tk, hanging }) {
  return <span style={{ fontFamily: "'Source Serif 4', Georgia, 'Times New Roman', serif", fontSize: '0.98rem', lineHeight: 1.7, color: tk.text, display: 'block', paddingLeft: hanging ? '1.4em' : 0, textIndent: hanging ? '-1.4em' : 0, wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: onlyItalicTags(html) }} />;
}

/* ─────────────── metadata editor ─────────────── */
const personLine = (p) => (p.given ? `${p.family}, ${p.given}` : p.family);
const metaToForm = (m) => ({ ...m, authors: (m.authors || []).map(personLine).join('\n'), editors: (m.editors || []).map(personLine).join('\n') });
const formToMeta = (f) => ({
  ...f,
  authors: String(f.authors || '').split('\n').map((l) => l.trim()).filter(Boolean).map(splitName),
  editors: String(f.editors || '').split('\n').map((l) => l.trim()).filter(Boolean).map(splitName),
});

function MetaEditor({ tk, meta, onChange, onClose }) {
  const [f, setF] = useState(() => metaToForm(cleanMeta(meta)));
  const set = (k, v) => { const next = { ...f, [k]: v }; setF(next); onChange(formToMeta(next)); };
  const g = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 };
  return (
    <div style={{ border: `1px solid ${tk.acLine}`, borderRadius: 12, padding: 14, display: 'grid', gap: 10, background: tk.acSoft }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label tk={tk} style={{ margin: 0 }}>Edit details — citations update as you type</Label>
        <Btn tk={tk} onClick={onClose}>Done</Btn>
      </div>
      <label style={{ display: 'block' }}>
        <div style={{ fontFamily: tk.mono, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tk.mute, marginBottom: 4 }}>Type</div>
        <select value={f.type} onChange={(e) => set('type', e.target.value)} style={fieldStyle(tk)}>{Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </label>
      <Field tk={tk} label="Title" value={f.title} onChange={(v) => set('title', v)} />
      <Field tk={tk} label="Authors (one per line: Family, Given)" value={f.authors} onChange={(v) => set('authors', v)} multiline rows={3} />
      {f.type === 'chapter' && <Field tk={tk} label="Editors (one per line)" value={f.editors} onChange={(v) => set('editors', v)} multiline rows={2} />}
      <Field tk={tk} label={f.type === 'webpage' ? 'Website name' : f.type === 'chapter' ? 'Book title' : f.type === 'paper-conference' ? 'Proceedings / conference' : 'Journal / container'} value={f.containerTitle} onChange={(v) => set('containerTitle', v)} />
      <div style={g}>
        <Field tk={tk} label="Year" value={f.year} onChange={(v) => set('year', v)} />
        <Field tk={tk} label="Month (1-12)" value={f.month} onChange={(v) => set('month', v)} />
        <Field tk={tk} label="Day" value={f.day} onChange={(v) => set('day', v)} />
        <Field tk={tk} label="Volume" value={f.volume} onChange={(v) => set('volume', v)} />
        <Field tk={tk} label="Issue" value={f.issue} onChange={(v) => set('issue', v)} />
        <Field tk={tk} label="Pages" value={f.pages} onChange={(v) => set('pages', v)} />
        <Field tk={tk} label="Publisher" value={f.publisher} onChange={(v) => set('publisher', v)} />
        <Field tk={tk} label="City" value={f.city} onChange={(v) => set('city', v)} />
        <Field tk={tk} label="Edition" value={f.edition} onChange={(v) => set('edition', v)} />
      </div>
      <div style={g}>
        <Field tk={tk} label="DOI" value={f.doi} onChange={(v) => set('doi', v)} />
        <Field tk={tk} label="URL" value={f.url} onChange={(v) => set('url', v)} />
        <Field tk={tk} label="ISBN" value={f.isbn} onChange={(v) => set('isbn', v)} />
      </div>
    </div>
  );
}

/* ═════════════════════ main ═════════════════════ */
export default function CitationFormatter() {
  const { theme } = useTheme();
  const tk = useMemo(() => tokens(theme === 'dark'), [theme]);

  const [mode, setMode] = useState('cite');
  const [style, setStyle] = useState(() => { try { const s = localStorage.getItem(LS_STYLE); return STYLE_KEYS.includes(s) ? s : 'apa'; } catch { return 'apa'; } });
  const [adjustCase, setAdjustCase] = useState(true);
  const [flash, setFlash] = useState('');
  const flashMsg = (m) => { setFlash(m); setTimeout(() => setFlash(''), 2200); };

  // cite
  const [input, setInput] = useState('');
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState('');
  // verify
  const [vInput, setVInput] = useState('');
  const [vRows, setVRows] = useState([]);
  const [vRunning, setVRunning] = useState(false);
  const [vProgress, setVProgress] = useState(null);
  const [vError, setVError] = useState('');
  const resultsRef = useRef(null);

  useEffect(() => { try { localStorage.setItem(LS_STYLE, style); } catch { /* ignore */ } }, [style]);

  const model = TOOL_MODELS.citationFormatter;

  /* ── cite ── */
  const run = async () => {
    const entries = toEntries(input);
    if (!entries.length) { setError('Paste a DOI, arXiv ID, ISBN, web address or a full reference first.'); return; }
    setError(''); setRunning(true); setRows([]); setEditing(''); setProgress({ done: 0, total: entries.length });
    trackEvent('tool_run', { tool_name: 'Citation Formatter' });
    try {
      let results;
      if (entries.length === 1) { results = [await resolveReference(entries[0], { model })]; setProgress({ done: 1, total: 1 }); } else {
        results = await resolveMany(entries, { model, onProgress: (done, total) => setProgress({ done, total }) });
      }
      setRows(results.map((r, i) => ({ id: newId(), input: entries[i], ...r })));
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (e) { setError(e?.message || 'Something went wrong. Please try again.'); }
    setRunning(false); setProgress(null);
  };

  const retry = async (row) => {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: 'working' } : r)));
    const r = await resolveReference(row.input, { model });
    setRows((rs) => rs.map((x) => (x.id === row.id ? { ...x, ...r } : x)));
  };

  const good = rows.filter((r) => r.meta && (r.status === 'resolved' || r.status === 'extracted'));
  const failed = rows.filter((r) => r.status === 'failed');
  const single = rows.length === 1 && good.length === 1 ? good[0] : null;
  const singleOut = useMemo(() => (single ? buildCitations(single.meta, single.label, { adjustCase }) : null), [single, adjustCase]);
  const bib = useMemo(() => (good.length > 1 || (rows.length > 1 && good.length) ? buildBibliography(good.map((r) => r.meta), style, { adjustCase }) : null), [good, rows.length, style, adjustCase]);
  const setMeta = (id, meta) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, meta, status: r.status === 'failed' ? 'extracted' : r.status, via: 'Edited by you' } : r)));

  const copyOne = async (html, text, label) => flashMsg((await copyRich(html, text)) ? `${label} copied (italics kept)` : 'Copy failed');

  const wordExport = async () => {
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      downloadBlob(await renderBibliographyDocx(window.JSZip, bib.entries, style, { numbered: bib.numbered }), `bibliography-${style}.docx`);
      flashMsg('Word file saved');
    } catch { flashMsg('Could not create the Word file'); }
  };

  /* ── verify ── */
  const verify = async () => {
    const entries = toEntries(vInput);
    if (!entries.length) { setVError('Paste the references you want to check — one per line, or separated by blank lines.'); return; }
    setVError(''); setVRunning(true); setVRows([]); setVProgress({ done: 0, total: entries.length });
    trackEvent('citation_verify', { n: entries.length });
    try {
      const results = await verifyMany(entries, { onProgress: (done, total) => setVProgress({ done, total }) });
      setVRows(entries.map((text, i) => ({ id: newId(), text, ...results[i] })));
    } catch (e) { setVError(e?.message || 'Verification failed. Please try again.'); }
    setVRunning(false); setVProgress(null);
  };
  const vCounts = useMemo(() => vRows.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {}), [vRows]);
  const vReport = () => [
    `Reference check — ${vRows.length} references`, `Verified: ${vCounts.verified || 0} · Needs review: ${vCounts.check || 0} · Not found: ${vCounts.not_found || 0}`, '',
    ...vRows.map((r, i) => `${i + 1}. [${({ verified: 'VERIFIED', check: 'CHECK', not_found: 'NOT FOUND', unverifiable: 'NOT CHECKABLE', error: 'ERROR' })[r.status]}] ${r.text}${r.reasons?.length ? `\n   ${r.reasons.join('\n   ')}` : ''}${r.error ? `\n   ${r.error}` : ''}`),
  ].join('\n');

  const statusMeta = (s) => ({
    verified: { c: tk.good, i: '✓', l: 'Verified' }, check: { c: tk.warn, i: '⚠', l: 'Check details' }, not_found: { c: tk.bad, i: '✗', l: 'Not found' },
    unverifiable: { c: tk.info, i: 'ℹ', l: 'Can’t be checked' }, error: { c: tk.warn, i: '!', l: 'Couldn’t check' },
  })[s] || { c: tk.mute, i: '·', l: s };

  /* ═════════ render ═════════ */
  const styleChips = (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="group" aria-label="Citation style">
      {STYLE_KEYS.map((k) => (
        <button key={k} type="button" aria-pressed={style === k} onClick={() => setStyle(k)} style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 999, fontFamily: tk.mono, fontSize: '0.7rem', background: style === k ? tk.acSoft : 'transparent', color: style === k ? tk.ac : tk.sub, border: `1px solid ${style === k ? tk.ac : tk.line}` }}>{STYLE_LABELS[k]}</button>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 16, fontFamily: tk.sans }}>
      <div role="tablist" style={{ display: 'flex', gap: 8 }}>
        {[['cite', '📚 Cite & convert'], ['verify', '🔍 Verify references']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={mode === k} type="button" onClick={() => setMode(k)} style={{ flex: 1, padding: '11px 10px', cursor: 'pointer', fontFamily: tk.mono, fontSize: '0.74rem', borderRadius: 10, background: mode === k ? tk.acSoft : 'transparent', color: mode === k ? tk.ac : tk.sub, border: `1px solid ${mode === k ? tk.ac : tk.line}` }}>{l}</button>
        ))}
      </div>
      <div aria-live="polite" style={{ minHeight: 16, fontFamily: tk.mono, fontSize: '0.72rem', color: tk.good }}>{flash}</div>

      {/* ───────── CITE ───────── */}
      {mode === 'cite' && (
        <>
          <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 16, display: 'grid', gap: 12 }}>
            <Label tk={tk} style={{ margin: 0 }}>Paste what you have</Label>
            <div style={{ fontSize: '0.84rem', color: tk.sub, lineHeight: 1.6 }}>A DOI, arXiv ID, ISBN, web address, or a full reference — or <b>many, one per line</b> to build a whole bibliography.</div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} aria-label="References to format" placeholder={'10.1038/nature14539\narXiv:1706.03762\nISBN 978-0-13-235088-4\nhttps://example.com/article'} style={{ ...fieldStyle(tk), fontFamily: tk.mono, fontSize: 16, resize: 'vertical' }} />
            {styleChips}
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', color: tk.sub, cursor: 'pointer' }}>
              <input type="checkbox" checked={adjustCase} onChange={(e) => setAdjustCase(e.target.checked)} /> Adjust title capitalisation to each style (recommended)
            </label>
            {error && <Notice tk={tk} kind="bad">{error}</Notice>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn tk={tk} kind="primary" onClick={run} disabled={running}>{running ? <><Spin /> {progress && progress.total > 1 ? `Working… ${progress.done}/${progress.total}` : 'Looking it up…'}</> : '→ Create citations'}</Btn>
              <Btn tk={tk} onClick={() => setInput(EXAMPLE)}>Try an example</Btn>
              {(input || rows.length > 0) && <Btn tk={tk} onClick={() => { setInput(''); setRows([]); setEditing(''); setError(''); }}>Clear</Btn>}
            </div>
            <div style={{ fontSize: '0.74rem', color: tk.mute, lineHeight: 1.55 }}>Details come from CrossRef, DataCite, arXiv, Open Library, Google Books and the page itself. If a lookup fails we tell you instead of guessing. Pasted text is read by AI, and anything it returns that isn’t in your text is discarded.</div>
          </div>

          {rows.length > 0 && (
            <div ref={resultsRef} style={{ display: 'grid', gap: 14, scrollMarginTop: 80 }}>
              {failed.map((r) => (
                <div key={r.id} style={{ border: `1px solid ${tk.bad}55`, background: `${tk.bad}0f`, borderRadius: 12, padding: 14, display: 'grid', gap: 8 }}>
                  <div style={{ fontFamily: tk.mono, fontSize: '0.7rem', color: tk.bad }}>✗ Couldn’t create this citation</div>
                  <div style={{ fontSize: '0.8rem', color: tk.mute, wordBreak: 'break-word' }}>{r.input.slice(0, 200)}</div>
                  <div style={{ fontSize: '0.86rem', color: tk.text, lineHeight: 1.55 }}>{r.error}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.retryable && <Btn tk={tk} onClick={() => retry(r)}>↻ Try again</Btn>}
                    <Btn tk={tk} kind="accent" onClick={() => { setMeta(r.id, { type: 'article-journal', title: '', authors: [], year: '' }); setEditing(r.id); }}>✎ Enter details myself</Btn>
                  </div>
                </div>
              ))}

              {/* one reference → every style */}
              {single && singleOut && (
                <>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip tk={tk} color={tk.info}>{TYPE_LABELS[singleOut.metadata.type] || 'Reference'}</Chip>
                    <Chip tk={tk} color={tk.good}>{single.via}</Chip>
                    <Btn tk={tk} kind="accent" onClick={() => setEditing(editing === single.id ? '' : single.id)}>✎ Edit details</Btn>
                  </div>
                  {editing === single.id && <MetaEditor tk={tk} meta={single.meta} onChange={(m) => setMeta(single.id, m)} onClose={() => setEditing('')} />}
                  {single.dropped?.length > 0 && <Notice tk={tk} kind="info">Some details the AI suggested were left out because they weren’t in your text: {single.dropped.slice(0, 5).join(', ')}.</Notice>}
                  {STYLE_KEYS.map((k) => {
                    const f = singleOut.formats[k];
                    return (
                      <div key={k} style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 12, padding: 14, display: 'grid', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Label tk={tk} style={{ margin: 0 }}>{STYLE_LABELS[k]}</Label>
                          <Btn tk={tk} onClick={() => copyOne(f.html, f.text, STYLE_LABELS[k])}>⧉ Copy</Btn>
                        </div>
                        <CitationText html={f.html} tk={tk} hanging={!NUMBERED_STYLES.has(k)} />
                        <div style={{ fontSize: '0.78rem', color: tk.mute, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          In-text: <span style={{ fontFamily: tk.mono, color: tk.sub }} dangerouslySetInnerHTML={{ __html: onlyItalicTags(f.inText.html) }} />
                          <button type="button" onClick={async () => flashMsg((await copyRich(f.inText.html, f.inText.text)) ? 'In-text citation copied' : 'Copy failed')} style={{ background: 'none', border: 'none', color: tk.ac, cursor: 'pointer', fontFamily: tk.mono, fontSize: '0.68rem' }}>copy</button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
                    {[['BibTeX', singleOut.bibtex, 'reference.bib', 'application/x-bibtex'], ['RIS (EndNote / Zotero / Mendeley)', singleOut.ris, 'reference.ris', 'application/x-research-info-systems']].map(([name, body, file, mime]) => (
                      <div key={name} style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 12, padding: 14, display: 'grid', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Label tk={tk} style={{ margin: 0 }}>{name}</Label>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn tk={tk} onClick={async () => flashMsg((await copyTo(body)) ? `${name.split(' ')[0]} copied` : 'Copy failed')}>⧉</Btn>
                            <Btn tk={tk} onClick={() => downloadText(file, body, mime)}>⬇</Btn>
                          </div>
                        </div>
                        <pre style={{ margin: 0, fontFamily: tk.mono, fontSize: '0.72rem', color: tk.sub, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 220, overflow: 'auto' }}>{body}</pre>
                      </div>
                    ))}
                  </div>
                  {singleOut.notes.length > 0 && <Notice tk={tk} kind="warn"><b>Worth a look: </b>{singleOut.notes.join(' ')}</Notice>}
                </>
              )}

              {/* many → bibliography */}
              {bib && (
                <>
                  <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 16, display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Label tk={tk} style={{ margin: 0 }}>{STYLE_LABELS[style]} bibliography · {bib.entries.length} {bib.entries.length === 1 ? 'entry' : 'entries'}</Label>
                      <span style={{ fontSize: '0.72rem', color: tk.mute }}>{bib.numbered ? 'in the order you pasted' : 'sorted A–Z'}</span>
                    </div>
                    {styleChips}
                    <div style={{ display: 'grid', gap: 12 }}>
                      {bib.entries.map((e) => {
                        const row = good[e.source] || null;
                        return (
                          <div key={`${e.n}-${e.meta.title}`} style={{ display: 'grid', gap: 6 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {e.label && <span style={{ fontFamily: tk.mono, fontSize: '0.8rem', color: tk.ac, flex: 'none' }}>{e.label}</span>}
                              <div style={{ flex: 1, minWidth: 0 }}><CitationText html={e.html} tk={tk} hanging={!bib.numbered} /></div>
                            </div>
                            {row && (
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Chip tk={tk} color={row.status === 'resolved' ? tk.good : tk.info}>{row.via}</Chip>
                                <button type="button" onClick={() => setEditing(editing === row.id ? '' : row.id)} style={{ background: 'none', border: 'none', color: tk.ac, cursor: 'pointer', fontFamily: tk.mono, fontSize: '0.68rem' }}>✎ edit</button>
                              </div>
                            )}
                            {row && editing === row.id && <MetaEditor tk={tk} meta={row.meta} onChange={(m) => setMeta(row.id, m)} onClose={() => setEditing('')} />}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Btn tk={tk} kind="primary" onClick={async () => flashMsg((await copyRich(bibliographyHtml(bib.entries, { numbered: bib.numbered }), bib.text)) ? 'Bibliography copied (italics kept)' : 'Copy failed')}>⧉ Copy all</Btn>
                      <Btn tk={tk} kind="accent" onClick={wordExport}>⬇ Word (.docx)</Btn>
                      <Btn tk={tk} onClick={() => downloadText('references.bib', bibtexAll(good.map((r) => r.meta)), 'application/x-bibtex')}>⬇ BibTeX</Btn>
                      <Btn tk={tk} onClick={() => downloadText('references.ris', risAll(good.map((r) => r.meta)), 'application/x-research-info-systems')}>⬇ RIS</Btn>
                      <Btn tk={tk} onClick={() => downloadText('bibliography.txt', bib.text)}>⬇ Text</Btn>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ───────── VERIFY ───────── */}
      {mode === 'verify' && (
        <>
          <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: 16, display: 'grid', gap: 12 }}>
            <Label tk={tk} style={{ margin: 0 }}>Check a reference list</Label>
            <div style={{ fontSize: '0.84rem', color: tk.sub, lineHeight: 1.6 }}>Paste references from a report, thesis or an AI answer. Each one is looked up in CrossRef, Open Library and arXiv, and compared with what you wrote — title, authors and year.</div>
            <textarea value={vInput} onChange={(e) => setVInput(e.target.value)} rows={9} aria-label="References to verify" placeholder={'[1] LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. Nature, 521, 436–444.\n[2] Smith, J. (2022). Quantum neural gravity transformers. Journal of Imaginary Science, 4(1), 1–20.'} style={{ ...fieldStyle(tk), fontFamily: tk.mono, fontSize: 16, resize: 'vertical' }} />
            {vError && <Notice tk={tk} kind="bad">{vError}</Notice>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn tk={tk} kind="primary" onClick={verify} disabled={vRunning}>{vRunning ? <><Spin /> Checking {vProgress ? `${vProgress.done}/${vProgress.total}` : ''}…</> : '🔍 Check references'}</Btn>
              {vRows.length > 0 && <Btn tk={tk} onClick={async () => flashMsg((await copyTo(vReport())) ? 'Report copied' : 'Copy failed')}>⧉ Copy report</Btn>}
              {(vInput || vRows.length > 0) && <Btn tk={tk} onClick={() => { setVInput(''); setVRows([]); setVError(''); }}>Clear</Btn>}
            </div>
          </div>

          {vRows.length > 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Chip tk={tk} color={tk.good}>{vCounts.verified || 0} verified</Chip>
                <Chip tk={tk} color={tk.warn}>{vCounts.check || 0} need review</Chip>
                <Chip tk={tk} color={tk.bad}>{vCounts.not_found || 0} not found</Chip>
                {(vCounts.unverifiable || 0) + (vCounts.error || 0) > 0 && <Chip tk={tk} color={tk.info}>{(vCounts.unverifiable || 0) + (vCounts.error || 0)} not checked</Chip>}
              </div>
              {vRows.map((r, i) => {
                const sm = statusMeta(r.status);
                const fixed = r.found && (r.status === 'check' || r.status === 'verified') ? formatReference(r.found, style, { adjustCase }) : null;
                return (
                  <div key={r.id} style={{ border: `1px solid ${tk.line}`, borderLeft: `3px solid ${sm.c}`, borderRadius: 12, padding: 14, display: 'grid', gap: 8, background: tk.card }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: tk.mono, fontSize: '0.72rem', color: sm.c, fontWeight: 700 }}>{sm.i} {sm.l}{r.via ? <span style={{ color: tk.mute, fontWeight: 400 }}> · {r.via}</span> : null}</span>
                      <span style={{ fontFamily: tk.mono, fontSize: '0.66rem', color: tk.mute }}>#{i + 1}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: tk.text, lineHeight: 1.6, wordBreak: 'break-word' }}>{r.text}</div>
                    {(r.reasons || []).map((x, k) => <div key={k} style={{ fontSize: '0.82rem', color: tk.sub, lineHeight: 1.55 }}>• {x}</div>)}
                    {r.error && <div style={{ fontSize: '0.82rem', color: tk.warn }}>{r.error}</div>}
                    {fixed && r.status === 'check' && (
                      <div style={{ background: tk.acSoft, border: `1px solid ${tk.acLine}`, borderRadius: 10, padding: '10px 12px', display: 'grid', gap: 6 }}>
                        <div style={{ fontFamily: tk.mono, fontSize: '0.62rem', color: tk.ac, textTransform: 'uppercase', letterSpacing: '0.08em' }}>The record we found ({STYLE_LABELS[style]})</div>
                        <CitationText html={fixed.html} tk={tk} />
                        <div><Btn tk={tk} onClick={() => copyOne(fixed.html, fixed.text, 'Citation')}>⧉ Copy this citation</Btn></div>
                      </div>
                    )}
                    {r.status === 'not_found' && !r.reasons?.length && null}
                  </div>
                );
              })}
              <Notice tk={tk} kind="info">“Not found” means no match in CrossRef, Open Library or arXiv — not proof of invention. Many books, theses, reports, local journals and conference papers aren’t indexed there, so check those by hand. A reference marked ✓ exists and matches what you wrote.</Notice>
            </div>
          )}
        </>
      )}
    </div>
  );
}
