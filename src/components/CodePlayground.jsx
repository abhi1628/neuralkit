// src/components/CodePlayground.jsx — Code Playground v2
//
//  • Real editor: syntax colours, auto-indent, bracket/quote pairing, Tab / Shift+Tab, Ctrl+/ comment, undo-safe
//  • Program input (stdin) + test cases with pass/fail
//  • AI that USES your run: explain (beginner / line-by-line / exam / review) and fix-the-error with a diff + Apply/Undo
//  • Instant rule-based error hints (work even when AI is unavailable)
//  • Short share links (code compressed into the URL #fragment — old ?code= links still work and no longer crash)
//  • Autosave per language, 6 verified examples per language, history, download, Replit hand-off
//
// Backend contract is unchanged: POST /api/run-code { compiler, code, input } → { output, error, status }

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { LANGUAGES, LANG_MAP, TOOL_MODELS } from '../constants';
import { trackEvent } from '../utils';
import { copyTo, downloadBlob } from '../resumeCore';
import {
  highlight, editEnter, editTab, editComment, editType, editBackspace, needsInput, parseRun, compareOutput, quickHint,
  diffLines, compactDiff, parseMarkdown, inlineParts, encodeShare, decodeShare, EXAMPLE_LIB, EXPLAIN_MODES, explainCode, fixCode,
  downloadName, REPLIT_TEMPLATE,
} from '../playgroundCore';
import OutputActions from './OutputActions';

const LS = { history: 'zeroapi:playground:history', last: 'zeroapi:playground:v2:last', fs: 'zeroapi:playground:v2:fs', code: (l) => `zeroapi:playground:v2:${l}` };
const MAX_OUT = 20000;
const MAX_CASES = 8;
const RUN_TIMEOUT_MS = 30000;

const lsGet = (k, d = null) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full / blocked */ } };

function useMedia(q) {
  const [m, setM] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false));
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    f();
    mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', f) : mq.removeListener(f));
  }, [q]);
  return m;
}

function tokens(d) {
  return {
    d,
    text: d ? '#ffffff' : '#1a1a1a',
    sub: d ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    mute: d ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
    line: d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
    soft: d ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.04)',
    panel: d ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)',
    editor: d ? '#14141c' : '#fbfbfd',
    ac: 'var(--accent)',
    acSoft: d ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)',
    acLine: d ? 'rgba(167,139,250,0.4)' : 'rgba(124,58,237,0.35)',
    good: d ? '#34d399' : '#059669',
    bad: d ? '#ff6b6b' : '#dc2626',
    warn: d ? '#fbbf24' : '#b45309',
    info: d ? '#60a5fa' : '#2563eb',
    grad: 'linear-gradient(135deg, #a78bfa, #818cf8)',
    mono: "'Space Mono', ui-monospace, Menlo, Consolas, monospace",
  };
}

const SYNTAX_CSS = (d) => `
.pgt-kw{color:${d ? '#c4a7ff' : '#7c3aed'};font-weight:600}.pgt-ty{color:${d ? '#67e8f9' : '#0e7490'}}.pgt-bi{color:${d ? '#7dd3fc' : '#0369a1'}}
.pgt-fn{color:${d ? '#93c5fd' : '#1d4ed8'}}.pgt-str{color:${d ? '#86efac' : '#15803d'}}.pgt-num{color:${d ? '#fdba74' : '#c2410c'}}
.pgt-com{color:${d ? '#7b8294' : '#6b7280'};font-style:italic}.pgt-pp{color:${d ? '#f0abfc' : '#a21caf'}}
.pg-ta::selection{background:${d ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.25)'};color:transparent}
.pg-ta{-webkit-text-fill-color:transparent}
`;

/* ─────────────── editor ─────────────── */
function applyEdit(ta, ed) {
  let done = false;
  try {
    ta.focus();
    ta.setSelectionRange(ed.from, ed.to);
    if (typeof document.execCommand === 'function') done = ed.text === '' ? document.execCommand('delete') : document.execCommand('insertText', false, ed.text);
  } catch { done = false; }
  if (!done) {
    ta.setRangeText(ed.text, ed.from, ed.to, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  ta.setSelectionRange(ed.selStart, ed.selEnd);
}

function CodeEditor({ value, onChange, lang, fontSize, tk, onRun, taRef }) {
  const html = useMemo(() => (value.length > 40000 ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;') : highlight(value, lang)), [value, lang]);
  const lines = useMemo(() => value.split('\n').length, [value]);
  const gutterW = String(lines).length * 0.62 + 1.9;
  const shared = {
    fontFamily: tk.mono, fontSize, lineHeight: 1.75, letterSpacing: 0, tabSize: 4, MozTabSize: 4,
    padding: '16px 18px 16px 12px', margin: 0, whiteSpace: 'pre', wordBreak: 'normal', overflowWrap: 'normal', border: 0, boxSizing: 'border-box',
  };

  // typed characters → bracket / quote pairing (native beforeinput so it also works with mobile keyboards)
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return undefined;
    const h = (ev) => {
      if (ev.isComposing || ev.inputType !== 'insertText' || !ev.data || ev.data.length !== 1) return;
      const ed = editType(ta.value, ta.selectionStart, ta.selectionEnd, ev.data, lang);
      if (!ed) return;
      ev.preventDefault();
      if (ed.skip) { ta.setSelectionRange(ed.selStart, ed.selEnd); return; }
      applyEdit(ta, ed);
    };
    ta.addEventListener('beforeinput', h);
    return () => ta.removeEventListener('beforeinput', h);
  }, [lang, taRef]);

  const onKeyDown = (e) => {
    const ta = e.currentTarget;
    const mod = e.ctrlKey || e.metaKey;
    if (e.nativeEvent?.isComposing) return;
    if (mod && e.key === 'Enter') { e.preventDefault(); onRun(); return; }
    if (mod && e.key === '/') { e.preventDefault(); applyEdit(ta, editComment(ta.value, ta.selectionStart, ta.selectionEnd, lang)); return; }
    if (e.key === 'Tab' && !mod && !e.altKey) { e.preventDefault(); applyEdit(ta, editTab(ta.value, ta.selectionStart, ta.selectionEnd, lang, e.shiftKey)); return; }
    if (e.key === 'Enter' && !mod && !e.shiftKey && !e.altKey) { e.preventDefault(); applyEdit(ta, editEnter(ta.value, ta.selectionStart, ta.selectionEnd, lang)); return; }
    if (e.key === 'Backspace' && !mod && !e.altKey) {
      const ed = editBackspace(ta.value, ta.selectionStart, ta.selectionEnd);
      if (ed) { e.preventDefault(); applyEdit(ta, ed); }
    }
  };

  return (
    <div style={{ display: 'flex', overflowX: 'auto', background: tk.editor, minHeight: 280 }}>
      <style>{SYNTAX_CSS(tk.d)}</style>
      <div aria-hidden style={{ ...shared, flex: 'none', width: `${gutterW}em`, textAlign: 'right', color: tk.mute, userSelect: 'none', borderRight: `1px solid ${tk.line}`, padding: '16px 10px 16px 6px', background: tk.d ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.025)' }}>
        {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
      </div>
      <div style={{ position: 'relative', flex: '1 0 auto', minWidth: 0 }}>
        <pre aria-hidden style={{ ...shared, position: 'relative', color: tk.text, pointerEvents: 'none', minHeight: 280 }} dangerouslySetInnerHTML={{ __html: `${html}\n` }} />
        <textarea
          ref={taRef} className="pg-ta code-editor" value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown}
          spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" wrap="off" aria-label="Code editor"
          style={{ ...shared, position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent', color: 'transparent', caretColor: tk.d ? '#fff' : '#111', resize: 'none', outline: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
}

/* ─────────────── small UI bits ─────────────── */
function Btn({ tk, children, onClick, disabled, kind = 'soft', title, style, 'aria-label': aria }) {
  const kinds = {
    soft: { background: tk.soft, border: `1px solid ${tk.line}`, color: tk.sub },
    accent: { background: tk.acSoft, border: `1px solid ${tk.acLine}`, color: tk.ac },
    primary: { background: tk.grad, border: 'none', color: '#000', fontWeight: 700 },
    danger: { background: 'transparent', border: `1px solid ${tk.bad}66`, color: tk.bad },
    good: { background: `${tk.good}1f`, border: `1px solid ${tk.good}66`, color: tk.good },
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} aria-label={aria} style={{
      fontFamily: tk.mono, fontSize: '0.7rem', borderRadius: 8, padding: '7px 12px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', minHeight: 34, ...kinds[kind], ...style,
    }}>{children}</button>
  );
}

function Markdown({ text, tk }) {
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  const inl = (s) => inlineParts(s).map((p, i) => (p.t === 'bold' ? <strong key={i} style={{ color: tk.text }}>{p.v}</strong> : p.t === 'code' ? <code key={i} style={{ fontFamily: tk.mono, fontSize: '0.86em', background: tk.soft, padding: '1px 5px', borderRadius: 4 }}>{p.v}</code> : <span key={i}>{p.v}</span>));
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', lineHeight: 1.7, color: tk.sub, display: 'grid', gap: 10 }}>
      {blocks.map((b, i) => {
        if (b.type === 'heading') return <div key={i} style={{ fontFamily: tk.mono, fontSize: '0.74rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tk.ac, marginTop: 6 }}>{b.text}</div>;
        if (b.type === 'para') return <div key={i}>{inl(b.text)}</div>;
        if (b.type === 'list') return <ul key={i} style={{ margin: 0, paddingLeft: 20 }}>{b.items.map((it, k) => <li key={k} style={{ marginBottom: 3 }}>{inl(it)}</li>)}</ul>;
        if (b.type === 'code') return <pre key={i} style={{ margin: 0, padding: '10px 12px', background: tk.soft, border: `1px solid ${tk.line}`, borderRadius: 8, fontFamily: tk.mono, fontSize: '0.78rem', overflowX: 'auto', color: tk.text }}>{b.text}</pre>;
        if (b.type === 'table') return (
          <div key={i} style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontFamily: tk.mono, fontSize: '0.74rem', minWidth: '100%' }}>
              <thead><tr>{b.head.map((c, k) => <th key={k} style={{ textAlign: 'left', padding: '6px 10px', borderBottom: `1px solid ${tk.acLine}`, color: tk.ac, whiteSpace: 'nowrap' }}>{c}</th>)}</tr></thead>
              <tbody>{b.rows.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j} style={{ padding: '5px 10px', borderBottom: `1px solid ${tk.line}`, color: tk.text, whiteSpace: 'nowrap' }}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
        return null;
      })}
    </div>
  );
}

function DiffView({ before, after, tk }) {
  const rows = useMemo(() => compactDiff(diffLines(before, after)), [before, after]);
  return (
    <pre style={{ margin: 0, padding: '8px 0', background: tk.soft, border: `1px solid ${tk.line}`, borderRadius: 8, fontFamily: tk.mono, fontSize: '0.74rem', overflowX: 'auto', lineHeight: 1.6 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ padding: '0 10px', whiteSpace: 'pre', background: r.t === 'add' ? `${tk.good}22` : r.t === 'del' ? `${tk.bad}22` : 'transparent', color: r.t === 'skip' ? tk.mute : r.t === 'add' ? tk.good : r.t === 'del' ? tk.bad : tk.sub }}>
          {r.t === 'add' ? '+ ' : r.t === 'del' ? '- ' : r.t === 'skip' ? '  ' : '  '}{r.text}
        </div>
      ))}
    </pre>
  );
}

const TABS = [['input', '⌨ Input'], ['output', '▤ Output'], ['tests', '✓ Tests'], ['ai', '🧠 AI']];
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ═════════════════════ main component ═════════════════════ */
export default function CodePlayground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tk = useMemo(() => tokens(isDark), [isDark]);
  const wide = useMedia('(min-width: 1000px)');
  const coarse = useMedia('(pointer: coarse)');
  const [searchParams] = useSearchParams();
  const taRef = useRef(null);
  const panelRef = useRef(null);

  // legacy ?code= links: searchParams already decodes — do NOT decode again (that crashed on "%d")
  const legacyCode = searchParams.get('code');
  const legacyLang = searchParams.get('lang');

  const [lang, setLang] = useState(() => LANGUAGES.find((l) => l.value === (legacyLang || lsGet(LS.last))) || LANGUAGES[0]);
  const initial = useMemo(() => lsGet(LS.code(lang.value)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [code, setCode] = useState(() => legacyCode ?? initial?.code ?? lang.starter);
  const [stdin, setStdin] = useState(() => (legacyCode ? '' : initial?.stdin ?? ''));
  const [cases, setCases] = useState(() => (legacyCode ? [] : initial?.cases ?? []));

  const [tab, setTab] = useState('output');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runErr, setRunErr] = useState('');
  const [testsRunning, setTestsRunning] = useState(false);

  const [aiMode, setAiMode] = useState('beginner');
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [fixing, setFixing] = useState(false);
  const [fix, setFix] = useState(null);
  const [aiErr, setAiErr] = useState('');
  const [undoCode, setUndoCode] = useState(null);

  const [fontSize, setFontSize] = useState(() => lsGet(LS.fs, 14));
  const [menu, setMenu] = useState(''); // '' | examples | history
  const [flash, setFlash] = useState('');
  const [sharedNote, setSharedNote] = useState('');
  const [recent, setRecent] = useState(() => lsGet(LS.history, []));

  const effFont = coarse ? Math.max(16, fontSize) : fontSize;
  const flashMsg = (m) => { setFlash(m); setTimeout(() => setFlash(''), 2200); };
  const wantsInput = useMemo(() => needsInput(code, lang.value), [code, lang.value]);

  /* ── open a shared #s= link ── */
  useEffect(() => {
    const m = /^#s=(.+)$/.exec(window.location.hash || '');
    if (!m) return;
    decodeShare(m[1]).then((s) => {
      const l = LANGUAGES.find((x) => x.value === s.lang);
      if (l) setLang(l);
      setCode(s.code); setStdin(s.stdin || ''); setCases([]); setResult(null);
      setSharedNote('Loaded shared code. Review it before running.');
      try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch { /* ignore */ }
    }).catch(() => setSharedNote('That share link is damaged or too old.'));
  }, []);

  /* ── autosave (per language) ── */
  useEffect(() => {
    const t = setTimeout(() => { lsSet(LS.code(lang.value), { code, stdin, cases }); lsSet(LS.last, lang.value); }, 400);
    return () => clearTimeout(t);
  }, [code, stdin, cases, lang.value]);

  const switchLang = (l) => {
    if (l.value === lang.value) return;
    lsSet(LS.code(lang.value), { code, stdin, cases });
    const saved = lsGet(LS.code(l.value));
    setLang(l); setCode(saved?.code ?? l.starter); setStdin(saved?.stdin ?? ''); setCases(saved?.cases ?? []);
    setResult(null); setRunErr(''); setExplanation(''); setFix(null); setAiErr(''); setUndoCode(null); setMenu('');
  };

  const resetCode = () => {
    if (code !== lang.starter && !window.confirm('Reset to the starter program? Your current code will be replaced.')) return;
    setUndoCode(code); setCode(lang.starter); setStdin(''); setCases([]); setResult(null); setFix(null); setExplanation('');
  };

  const loadExample = (ex) => {
    if (code !== lang.starter && code.trim() && !window.confirm('Replace your current code with this example?')) return;
    setUndoCode(code); setCode(ex.code); setStdin(ex.stdin || ''); setCases([]); setResult(null); setFix(null); setExplanation(''); setMenu('');
    trackEvent('playground_example', { language: lang.label, title: ex.title });
  };

  /* ── run ── */
  const execute = useCallback(async (codeText, input) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), RUN_TIMEOUT_MS);
    const t0 = performance.now();
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ compiler: LANG_MAP[lang.value] || lang.value, code: codeText, input }),
      });
      let data = null;
      try { data = await res.json(); } catch { /* not JSON */ }
      if (!data) throw new Error(`The run server returned an unexpected response (${res.status}).`);
      return parseRun(data, Math.round(performance.now() - t0));
    } catch (e) {
      if (e?.name === 'AbortError') return { ok: false, kind: 'timeout', stdout: '', stderr: '', text: `Stopped after ${RUN_TIMEOUT_MS / 1000} seconds. Check for an infinite loop, or a program that is waiting for input you didn't provide.`, ms: RUN_TIMEOUT_MS, hasStdout: false, hasStderr: true };
      throw e;
    } finally { clearTimeout(timer); }
  }, [lang.value]);

  const saveHistory = (r) => {
    const entry = { id: newId(), code: code.slice(0, 5000), stdin: stdin.slice(0, 500), language: lang.value, output: r.text.slice(0, 1000), hasError: !r.ok, timestamp: Date.now() };
    const updated = [entry, ...lsGet(LS.history, [])].slice(0, 20);
    lsSet(LS.history, updated); setRecent(updated);
  };

  const runCode = useCallback(async () => {
    if (!code.trim() || running) return;
    setRunning(true); setRunErr(''); setFix(null); setAiErr(''); setTab('output');
    trackEvent('playground_run', { language: lang.label });
    try {
      const r = await execute(code, stdin);
      setResult(r); saveHistory(r);
    } catch (e) { setResult(null); setRunErr(e?.message || 'Connection error. Check your internet and try again.'); }
    setRunning(false);
    if (!wide) setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, [code, stdin, running, execute, lang.label, wide]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── tests ── */
  const addCase = (input = '', expected = '') => { if (cases.length >= MAX_CASES) return; setCases([...cases, { id: newId(), input, expected, status: 'idle' }]); setTab('tests'); };
  const patchCase = (id, p) => setCases((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)));
  const runTests = async () => {
    if (!code.trim() || !cases.length || testsRunning) return;
    setTestsRunning(true); trackEvent('playground_tests', { language: lang.label, n: cases.length });
    setCases((cs) => cs.map((c) => ({ ...c, status: 'idle', actual: '', msg: '' })));
    for (const c of cases) {
      patchCase(c.id, { status: 'running' });
      try {
        const r = await execute(code, c.input);
        if (!r.ok) { patchCase(c.id, { status: 'error', actual: r.text, msg: r.kind === 'compile_error' ? 'Compile error' : 'Runtime error' }); continue; }
        if (!c.expected.trim()) { patchCase(c.id, { status: 'ran', actual: r.stdout.trim(), msg: 'No expected output set' }); continue; }
        const cmp = compareOutput(r.stdout, c.expected);
        patchCase(c.id, cmp.pass ? { status: 'pass', actual: r.stdout.trim(), msg: '' } : { status: 'fail', actual: r.stdout.trim(), msg: `Line ${cmp.line}: got “${cmp.got}”, expected “${cmp.want}”` });
      } catch (e) { patchCase(c.id, { status: 'error', actual: '', msg: e?.message || 'Connection error' }); }
      await new Promise((res) => setTimeout(res, 250));
    }
    setTestsRunning(false);
  };
  const passed = cases.filter((c) => c.status === 'pass').length;

  /* ── AI ── */
  const runExplain = async () => {
    if (!code.trim() || explaining) return;
    setExplaining(true); setAiErr(''); setTab('ai'); trackEvent('playground_explain', { language: lang.label, mode: aiMode });
    try { setExplanation(await explainCode({ mode: aiMode, lang: lang.value, label: lang.label, code, stdin, run: result, model: TOOL_MODELS.codePlayground })); }
    catch (e) { setAiErr(e?.message || 'Could not get an explanation. Please try again.'); }
    setExplaining(false);
  };
  const runFix = async () => {
    if (!result || result.ok || fixing) return;
    setFixing(true); setAiErr(''); setFix(null); setTab('ai'); trackEvent('playground_fix', { language: lang.label });
    try {
      const f = await fixCode({ lang: lang.value, label: lang.label, code, stdin, run: result, model: TOOL_MODELS.codePlayground });
      setFix({ ...f, original: code });
    } catch (e) { setAiErr(e?.message || 'Could not suggest a fix. Please try again.'); }
    setFixing(false);
  };
  const applyFix = () => { if (!fix?.fixed) return; setUndoCode(code); setCode(fix.fixed); setFix({ ...fix, applied: true }); flashMsg('Fix applied — press Run to try it.'); trackEvent('playground_fix_applied', { language: lang.label }); };
  const undo = () => { if (undoCode == null) return; setCode(undoCode); setUndoCode(null); setFix((f) => (f ? { ...f, applied: false } : f)); };

  /* ── toolbar actions ── */
  const download = () => { downloadBlob(new Blob([code], { type: 'text/plain' }), downloadName(lang.value)); trackEvent('playground_download', { language: lang.label }); };
  const share = async () => {
    try {
      const token = await encodeShare({ lang: lang.value, code, stdin });
      const ok = await copyTo(`${window.location.origin}/playground#s=${token}`);
      flashMsg(ok ? 'Share link copied' : 'Could not copy the link');
      trackEvent('playground_share', { language: lang.label });
    } catch { flashMsg('Could not create a link'); }
  };
  const openReplit = async () => {
    await copyTo(code);
    window.open(`https://replit.com/new/${REPLIT_TEMPLATE[lang.value] || 'python'}?name=ZeroAPI-Export`, '_blank', 'noopener,noreferrer');
    flashMsg('Code copied — paste it into Replit');
    trackEvent('playground_replit', { language: lang.label });
  };
  const loadFromHistory = (e) => {
    const l = LANGUAGES.find((x) => x.value === e.language);
    if (l) setLang(l);
    setCode(e.code); setStdin(e.stdin || ''); setResult({ ok: !e.hasError, kind: e.hasError ? 'runtime_error' : 'success', text: e.output, stdout: e.output, stderr: '', ms: null });
    setFix(null); setExplanation(''); setMenu(''); setTab('output');
    trackEvent('playground_history_load', { language: e.language });
  };
  const clearHistory = () => { try { localStorage.removeItem(LS.history); } catch { /* ignore */ } setRecent([]); setMenu(''); };

  /* ── derived output view ── */
  const outText = result ? (result.text.length > MAX_OUT ? `${result.text.slice(0, MAX_OUT)}\n… output truncated` : result.text) : '';
  const hint = result && !result.ok ? quickHint(lang.value, result.text) : '';
  const statusLabel = !result ? '' : result.ok ? '✓ Success' : result.kind === 'compile_error' ? '✗ Compile error' : result.kind === 'timeout' ? '✗ Timed out' : '✗ Runtime error';
  const examples = EXAMPLE_LIB[lang.value] || [];

  /* ═════════════ render ═════════════ */
  const editorCard = (
    <div style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, overflow: 'hidden', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${tk.line}`, background: tk.d ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.04)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
          <span style={{ fontFamily: tk.mono, fontSize: '0.7rem', color: tk.mute, marginLeft: 8 }}>{lang.icon} {lang.label}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Btn tk={tk} kind="accent" onClick={() => setMenu(menu === 'examples' ? '' : 'examples')} aria-label="Examples">✨ Examples</Btn>
            {menu === 'examples' && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30, minWidth: 230, maxWidth: '85vw', background: tk.d ? '#1a1a24' : '#fff', border: `1px solid ${tk.line}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.35)', padding: 6 }}>
                {examples.map((ex) => (
                  <button key={ex.title} type="button" onClick={() => loadExample(ex)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: tk.text, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem' }}>
                    {ex.title}{ex.stdin ? <span style={{ color: tk.mute, fontSize: '0.7rem' }}>  · uses input</span> : null}
                  </button>
                ))}
                <button type="button" onClick={() => { setMenu(''); resetCode(); }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderTop: `1px solid ${tk.line}`, marginTop: 4, color: tk.mute, padding: '9px 10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem' }}>↺ Reset to starter</button>
              </div>
            )}
          </div>
          <Btn tk={tk} onClick={() => { const n = Math.max(11, fontSize - 1); setFontSize(n); lsSet(LS.fs, n); }} aria-label="Smaller text" title="Smaller text">A−</Btn>
          <Btn tk={tk} onClick={() => { const n = Math.min(22, fontSize + 1); setFontSize(n); lsSet(LS.fs, n); }} aria-label="Larger text" title="Larger text">A+</Btn>
          <Btn tk={tk} onClick={download} title="Download as a file">💾</Btn>
          <Btn tk={tk} onClick={share} title="Copy a short share link">🔗 Share</Btn>
          <Btn tk={tk} kind="accent" onClick={openReplit} title="Copy code and open Replit">🚀</Btn>
          <div style={{ position: 'relative' }}>
            <Btn tk={tk} kind={recent.length ? 'accent' : 'soft'} onClick={() => setMenu(menu === 'history' ? '' : 'history')} title="Recent runs">🕐{recent.length ? ` ${recent.length}` : ''}</Btn>
            {menu === 'history' && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 30, width: 300, maxWidth: '85vw', maxHeight: 360, overflowY: 'auto', background: tk.d ? '#1a1a24' : '#fff', border: `1px solid ${tk.line}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.35)', padding: 6 }}>
                {recent.length === 0 && <div style={{ padding: 12, color: tk.mute, fontSize: '0.8rem' }}>No runs yet.</div>}
                {recent.length > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px 8px', borderBottom: `1px solid ${tk.line}` }}><span style={{ fontFamily: tk.mono, fontSize: '0.62rem', color: tk.ac, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent runs</span><button type="button" onClick={clearHistory} style={{ background: 'none', border: 'none', color: tk.bad, fontSize: '0.65rem', cursor: 'pointer', fontFamily: tk.mono }}>Clear</button></div>}
                {recent.map((e) => (
                  <button key={e.id} type="button" onClick={() => loadFromHistory(e)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${tk.line}`, padding: '8px 8px', cursor: 'pointer', color: tk.text }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: tk.mono, fontSize: '0.7rem' }}>
                      <span>{LANGUAGES.find((l) => l.value === e.language)?.icon} {LANGUAGES.find((l) => l.value === e.language)?.label || e.language}</span>
                      <span style={{ color: tk.mute }}>{new Date(e.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: tk.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.code.split('\n').find((l) => l.trim())?.slice(0, 48)}</div>
                    {e.hasError && <span style={{ fontSize: '0.62rem', color: tk.bad }}>⚠ Error</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Btn tk={tk} kind="primary" onClick={runCode} disabled={running} aria-label="Run code" style={{ padding: '8px 18px' }}>
            {running ? <><span className="spinner" style={{ width: 10, height: 10 }} /> Running…</> : '▶ Run'}
          </Btn>
        </div>
      </div>
      <CodeEditor value={code} onChange={setCode} lang={lang.value} fontSize={effFont} tk={tk} onRun={runCode} taRef={taRef} />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '7px 14px', borderTop: `1px solid ${tk.line}`, fontFamily: tk.mono, fontSize: '0.62rem', color: tk.mute, flexWrap: 'wrap' }}>
        <span>{code.split('\n').length} lines · autosaved</span>
        <span>Tab indent · Shift+Tab outdent · Ctrl+/ comment · Ctrl+Enter run</span>
      </div>
    </div>
  );

  const panel = (
    <div ref={panelRef} style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, overflow: 'hidden', minWidth: 0, scrollMarginTop: 80 }}>
      <div role="tablist" style={{ display: 'flex', borderBottom: `1px solid ${tk.line}`, background: tk.d ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.04)', overflowX: 'auto' }}>
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)} style={{
            flex: '1 0 auto', padding: '11px 14px', cursor: 'pointer', background: tab === k ? tk.acSoft : 'transparent', border: 'none', borderBottom: `2px solid ${tab === k ? 'var(--accent)' : 'transparent'}`,
            color: tab === k ? tk.ac : tk.sub, fontFamily: tk.mono, fontSize: '0.72rem', whiteSpace: 'nowrap',
          }}>
            {l}{k === 'input' && wantsInput && !stdin.trim() ? ' •' : ''}{k === 'tests' && cases.length ? ` ${passed}/${cases.length}` : ''}{k === 'output' && result ? (result.ok ? ' ✓' : ' ✗') : ''}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, display: 'grid', gap: 12, minHeight: 200 }}>
        {sharedNote && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: tk.info, background: `${tk.info}14`, border: `1px solid ${tk.info}44`, borderRadius: 10, padding: '8px 12px' }}>{sharedNote}</div>}

        {tab === 'input' && (
          <>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem', color: tk.sub, lineHeight: 1.6 }}>Type what the program should read — one value per line, exactly as a user would type it.</div>
            {wantsInput && !stdin.trim() && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: tk.warn, background: `${tk.warn}14`, border: `1px solid ${tk.warn}44`, borderRadius: 10, padding: '8px 12px' }}>This program reads input. Add the values below before running, or it will stop with an end-of-input error.</div>}
            <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={7} placeholder={'10\nhello'} aria-label="Program input"
              onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); } }}
              style={{ width: '100%', boxSizing: 'border-box', background: tk.editor, border: `1px solid ${tk.line}`, borderRadius: 10, padding: 12, color: tk.text, fontFamily: tk.mono, fontSize: Math.max(16, 13), lineHeight: 1.6, resize: 'vertical', outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn tk={tk} kind="primary" onClick={runCode} disabled={running}>{running ? 'Running…' : '▶ Run with this input'}</Btn>
              <Btn tk={tk} onClick={() => addCase(stdin, result?.ok ? result.stdout.trim() : '')} disabled={cases.length >= MAX_CASES}>+ Save as test case</Btn>
            </div>
          </>
        )}

        {tab === 'output' && (
          <>
            {runErr && <div role="alert" style={{ color: tk.bad, fontFamily: tk.mono, fontSize: '0.8rem' }}>⚠ {runErr}</div>}
            {!result && !runErr && !running && <div style={{ color: tk.mute, fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', lineHeight: 1.7 }}>Press <b>▶ Run</b> (or Ctrl+Enter) to see your program’s output here.{wantsInput && !stdin.trim() ? ' This program reads input — add it in the Input tab first.' : ''}</div>}
            {running && <div style={{ color: tk.sub, display: 'flex', gap: 8, alignItems: 'center', fontFamily: tk.mono, fontSize: '0.8rem' }}><span className="spinner" style={{ width: 12, height: 12 }} /> Running…</div>}
            {result && !running && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: tk.mono, fontSize: '0.74rem', color: result.ok ? tk.good : tk.bad, fontWeight: 700 }}>{statusLabel}{result.ms != null ? <span style={{ color: tk.mute, fontWeight: 400 }}>  · {result.ms} ms</span> : null}</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Btn tk={tk} onClick={async () => flashMsg((await copyTo(result.text)) ? 'Output copied' : 'Copy failed')}>⧉ Copy</Btn>
                    <Btn tk={tk} onClick={() => { setResult(null); setRunErr(''); }}>Clear</Btn>
                  </div>
                </div>
                <pre style={{ margin: 0, padding: 14, background: tk.editor, border: `1px solid ${tk.line}`, borderRadius: 10, fontFamily: tk.mono, fontSize: 13, lineHeight: 1.65, color: result.ok ? tk.text : tk.bad, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 420, overflow: 'auto' }}>{outText}</pre>
                {result.ok && wantsInput && !stdin.trim() && <div style={{ color: tk.warn, fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem' }}>Tip: this program reads input but the Input tab is empty.</div>}
                {hint && <div style={{ background: `${tk.warn}14`, border: `1px solid ${tk.warn}44`, borderRadius: 10, padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem', color: tk.text, lineHeight: 1.6 }}><b style={{ color: tk.warn }}>Quick hint · </b>{hint}</div>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!result.ok && <Btn tk={tk} kind="primary" onClick={runFix} disabled={fixing}>{fixing ? 'Finding the fix…' : '🛠 Explain error & fix it'}</Btn>}
                  <Btn tk={tk} kind="accent" onClick={runExplain} disabled={explaining}>{explaining ? 'Explaining…' : '🧠 Explain my code'}</Btn>
                  {result.ok && <Btn tk={tk} onClick={() => addCase(stdin, result.stdout.trim())} disabled={cases.length >= MAX_CASES}>+ Save as test case</Btn>}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'tests' && (
          <>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem', color: tk.sub, lineHeight: 1.6 }}>Add inputs with the output you expect. Run them all to check your program before submitting an assignment. Extra spaces at line ends and a final blank line are ignored.</div>
            {cases.length === 0 && <div style={{ color: tk.mute, fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem' }}>No test cases yet. Run your program, then press “Save as test case”, or add one below.</div>}
            {cases.map((c, i) => {
              const col = c.status === 'pass' ? tk.good : c.status === 'fail' || c.status === 'error' ? tk.bad : tk.mute;
              return (
                <div key={c.id} style={{ border: `1px solid ${tk.line}`, borderLeft: `3px solid ${col}`, borderRadius: 10, padding: 10, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: tk.mono, fontSize: '0.7rem', color: col }}>Test {i + 1} {c.status === 'pass' ? '✓ passed' : c.status === 'fail' ? '✗ failed' : c.status === 'error' ? '✗ error' : c.status === 'running' ? '… running' : c.status === 'ran' ? '· ran' : ''}</span>
                    <button type="button" onClick={() => setCases(cases.filter((x) => x.id !== c.id))} aria-label={`Delete test ${i + 1}`} style={{ background: 'none', border: 'none', color: tk.mute, cursor: 'pointer', fontSize: '1rem' }}>×</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
                    <label><div style={{ fontFamily: tk.mono, fontSize: '0.6rem', color: tk.mute, textTransform: 'uppercase', marginBottom: 3 }}>Input</div>
                      <textarea value={c.input} onChange={(e) => patchCase(c.id, { input: e.target.value, status: 'idle' })} rows={2} style={{ width: '100%', boxSizing: 'border-box', background: tk.editor, border: `1px solid ${tk.line}`, borderRadius: 8, padding: 8, color: tk.text, fontFamily: tk.mono, fontSize: 16, resize: 'vertical' }} /></label>
                    <label><div style={{ fontFamily: tk.mono, fontSize: '0.6rem', color: tk.mute, textTransform: 'uppercase', marginBottom: 3 }}>Expected output</div>
                      <textarea value={c.expected} onChange={(e) => patchCase(c.id, { expected: e.target.value, status: 'idle' })} rows={2} style={{ width: '100%', boxSizing: 'border-box', background: tk.editor, border: `1px solid ${tk.line}`, borderRadius: 8, padding: 8, color: tk.text, fontFamily: tk.mono, fontSize: 16, resize: 'vertical' }} /></label>
                  </div>
                  {(c.status === 'fail' || c.status === 'error') && <div style={{ fontFamily: tk.mono, fontSize: '0.72rem', color: tk.bad, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.msg}{c.status === 'error' && c.actual ? `\n${c.actual.slice(0, 300)}` : ''}</div>}
                  {c.status === 'ran' && <div style={{ fontFamily: tk.mono, fontSize: '0.72rem', color: tk.mute, whiteSpace: 'pre-wrap' }}>Output: {c.actual.slice(0, 300)}</div>}
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn tk={tk} kind="primary" onClick={runTests} disabled={testsRunning || !cases.length}>{testsRunning ? 'Running tests…' : `▶ Run all tests${cases.length ? ` (${cases.length})` : ''}`}</Btn>
              <Btn tk={tk} onClick={() => addCase()} disabled={cases.length >= MAX_CASES}>+ Add test case</Btn>
            </div>
            {cases.some((c) => c.status === 'pass' || c.status === 'fail') && !testsRunning && (
              <div style={{ fontFamily: tk.mono, fontSize: '0.8rem', color: passed === cases.length ? tk.good : tk.warn }}>{passed === cases.length ? '🎉 All tests passed' : `${passed} of ${cases.length} passed`}</div>
            )}
          </>
        )}

        {tab === 'ai' && (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(EXPLAIN_MODES).map(([k, m]) => (
                <button key={k} type="button" onClick={() => setAiMode(k)} aria-pressed={aiMode === k} title={m.hint} style={{ cursor: 'pointer', padding: '7px 11px', borderRadius: 999, fontFamily: tk.mono, fontSize: '0.68rem', background: aiMode === k ? tk.acSoft : 'transparent', color: aiMode === k ? tk.ac : tk.sub, border: `1px solid ${aiMode === k ? tk.ac : tk.line}` }}>{m.label}</button>
              ))}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: tk.mute }}>{EXPLAIN_MODES[aiMode].hint}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn tk={tk} kind="primary" onClick={runExplain} disabled={explaining}>{explaining ? <><span className="spinner" style={{ width: 10, height: 10 }} /> Explaining…</> : '🧠 Explain my code'}</Btn>
              <Btn tk={tk} kind="accent" onClick={runFix} disabled={fixing || !result || result.ok} title={!result ? 'Run your code first' : result.ok ? 'Your last run had no error' : ''}>{fixing ? 'Finding the fix…' : '🛠 Explain error & fix it'}</Btn>
            </div>
            {aiErr && <div role="alert" style={{ color: tk.bad, fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem' }}>⚠ {aiErr}</div>}

            {fix && (
              <div style={{ border: `1px solid ${tk.acLine}`, borderRadius: 12, padding: 14, display: 'grid', gap: 10, background: tk.acSoft }}>
                <div style={{ fontFamily: tk.mono, fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tk.ac }}>What went wrong</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: tk.text, lineHeight: 1.65 }}>{fix.cause}</div>
                {fix.fixed && fix.fixed.trim() !== fix.original.trim() ? (
                  <>
                    {fix.summary && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem', color: tk.sub }}><b style={{ color: tk.text }}>Fix: </b>{fix.summary}</div>}
                    <DiffView before={fix.original} after={fix.fixed} tk={tk} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {!fix.applied ? <Btn tk={tk} kind="primary" onClick={applyFix}>✓ Apply fix</Btn> : <Btn tk={tk} kind="good" onClick={runCode}>▶ Run fixed code</Btn>}
                      {undoCode != null && <Btn tk={tk} onClick={undo}>↶ Undo</Btn>}
                    </div>
                  </>
                ) : <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem', color: tk.sub }}>No change to your code is needed for this.</div>}
                {fix.tips.length > 0 && <ul style={{ margin: 0, paddingLeft: 18, fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem', color: tk.sub, lineHeight: 1.6 }}>{fix.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: tk.mute }}>AI suggestions can be wrong — read the change and run it before trusting it.</div>
              </div>
            )}
            {!fix && undoCode != null && <div><Btn tk={tk} onClick={undo}>↶ Undo last code change</Btn></div>}

            {explanation && (
              <div style={{ border: `1px solid ${tk.line}`, borderRadius: 12, padding: 14 }}>
                <Markdown text={explanation} tk={tk} />
                <OutputActions text={explanation} filename="zeroapi-code-explanation" onClear={() => setExplanation('')} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <section id="playground" style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(40px, 8vw, 80px) clamp(14px, 4vw, 32px)' }} onClick={() => menu && setMenu('')}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontFamily: tk.mono, fontSize: '0.7rem', color: tk.ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>◆ Code Playground</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: tk.text, margin: '0 0 10px' }}>Write. Run. Learn.</h2>
        <p style={{ color: tk.mute, fontSize: '1rem', fontWeight: 300, margin: 0 }}>Browser-based editor · 6 languages · program input · test cases · AI that fixes your errors</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {LANGUAGES.map((l) => (
          <button key={l.value} type="button" onClick={() => switchLang(l)} aria-label={`Switch to ${l.label}`} aria-pressed={lang.value === l.value} style={{
            background: lang.value === l.value ? tk.grad : tk.soft, border: lang.value === l.value ? 'none' : `1px solid ${tk.line}`, borderRadius: 10, padding: '9px 16px', cursor: 'pointer',
            color: lang.value === l.value ? '#000' : tk.sub, fontFamily: tk.mono, fontSize: '0.78rem', fontWeight: lang.value === l.value ? 700 : 400, minHeight: 40,
          }}>{l.icon} {l.label}</button>
        ))}
        <span aria-live="polite" style={{ marginLeft: 'auto', fontFamily: tk.mono, fontSize: '0.72rem', color: tk.good, minHeight: 16 }}>{flash}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1.25fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        {editorCard}
        {panel}
      </div>

      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: tk.mono, fontSize: '0.62rem', color: tk.mute, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>⚡ Powered by OnlineCompiler.io</span><span>·</span><span>Standard library only</span><span>·</span>
          <span onClick={() => window.open('https://colab.research.google.com', '_blank', 'noopener,noreferrer')} style={{ color: tk.ac, cursor: 'pointer' }}>Need pip packages? Try Google Colab →</span>
        </div>
      </div>
    </section>
  );
}
