// src/components/ResumeShared.jsx
// Shared UI for the resume suite. Matches the existing ZeroAPI look (Space Mono labels, accent var, glass cards).

import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { loadScript } from '../utils';
import {
  normalizeResume, inferProfile, sectionOrder, groundingCheck, numberSet, ungroundedNumbers,
  countPlaceholders, improveText, copyTo, downloadBlob, slugify, resumeToPlainText, scoreLabel,
} from '../resumeCore';
import {
  TEMPLATES, TEMPLATE_KEYS, buildBlocks, blocksToHtml, paperCss, renderResumePdf, renderResumeDocx,
  printResume, hasUnsupportedChars,
} from '../resumeExport';

/* ═══════════════════ tokens ═══════════════════ */
export function useTk() {
  const { theme } = useTheme();
  const d = theme === 'dark';
  return useMemo(() => ({
    d,
    text: d ? '#ffffff' : '#1a1a1a',
    sub: d ? 'rgba(255,255,255,0.68)' : 'rgba(0,0,0,0.68)',
    mute: d ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.48)',
    line: d ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.12)',
    soft: d ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.03)',
    card: d ? 'rgba(255,255,255,0.045)' : '#ffffff',
    input: d ? 'rgba(255,255,255,0.06)' : '#ffffff',
    inputLine: d ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)',
    ac: d ? '#a78bfa' : '#7c3aed',
    acSoft: d ? 'rgba(167,139,250,0.14)' : 'rgba(124,58,237,0.08)',
    acLine: d ? 'rgba(167,139,250,0.4)' : 'rgba(124,58,237,0.35)',
    grad: 'linear-gradient(135deg,#a78bfa,#818cf8)',
    good: d ? '#34d399' : '#059669',
    warn: d ? '#fbbf24' : '#b45309',
    bad: d ? '#f87171' : '#dc2626',
    info: d ? '#60a5fa' : '#2563eb',
    mono: "'Space Mono', monospace",
    sans: "'DM Sans', sans-serif",
  }), [d]);
}

export const scoreColor = (tk, s) => (s >= 85 ? tk.good : s >= 70 ? '#84cc16' : s >= 55 ? tk.warn : tk.bad);
export const sevColor = (tk, s) => (s === 'high' ? tk.bad : s === 'medium' ? tk.warn : tk.info);

/* ═══════════════════ primitives ═══════════════════ */
export function Spinner({ size = 16 }) {
  return <span className="spinner" style={{ width: size, height: size, flex: 'none', display: 'inline-block' }} />;
}

export function Label({ children, tk, style }) {
  return <div style={{ fontFamily: tk.mono, fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tk.ac, marginBottom: 6, ...style }}>{children}</div>;
}

export function Card({ tk, children, style, pad = 16 }) {
  return <div style={{ background: tk.card, border: `1px solid ${tk.line}`, borderRadius: 14, padding: pad, ...style }}>{children}</div>;
}

export function Btn({ tk, children, onClick, disabled, kind = 'primary', small, style, title, full }) {
  const base = {
    fontFamily: tk.mono, fontSize: small ? '0.7rem' : '0.78rem', letterSpacing: '0.04em', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 10, padding: small ? '7px 12px' : '12px 18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    opacity: disabled ? 0.55 : 1, minHeight: small ? 34 : 44, width: full ? '100%' : undefined, transition: 'opacity .15s',
  };
  const kinds = {
    primary: { background: tk.grad, color: '#fff', border: 'none', fontWeight: 700 },
    ghost: { background: 'transparent', color: tk.ac, border: `1px solid ${tk.acLine}` },
    plain: { background: tk.soft, color: tk.sub, border: `1px solid ${tk.line}` },
    danger: { background: 'transparent', color: tk.bad, border: `1px solid ${tk.bad}55` },
  };
  return <button type="button" title={title} disabled={disabled} onClick={onClick} style={{ ...base, ...kinds[kind], ...style }}>{children}</button>;
}

export function Chip({ tk, children, color, style, onClick, title }) {
  const c = color || tk.ac;
  return (
    <span onClick={onClick} title={title} style={{
      fontFamily: tk.mono, fontSize: '0.68rem', padding: '3px 9px', borderRadius: 999, border: `1px solid ${c}55`, background: `${c}18`, color: c,
      display: 'inline-block', cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</span>
  );
}

export function Notice({ tk, kind = 'info', title, children, style }) {
  const c = { info: tk.info, good: tk.good, warn: tk.warn, bad: tk.bad }[kind];
  return (
    <div role={kind === 'bad' ? 'alert' : 'status'} style={{ border: `1px solid ${c}55`, background: `${c}12`, borderRadius: 12, padding: '10px 14px', color: tk.text, fontFamily: tk.sans, fontSize: '0.84rem', lineHeight: 1.55, ...style }}>
      {title && <div style={{ fontWeight: 700, color: c, marginBottom: 2 }}>{title}</div>}
      {children}
    </div>
  );
}

const fieldStyle = (tk) => ({
  width: '100%', background: tk.input, border: `1px solid ${tk.inputLine}`, borderRadius: 10, padding: '11px 12px', color: tk.text,
  fontFamily: tk.sans, fontSize: '16px', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
});

export function Field({ tk, label, value, onChange, placeholder, type = 'text', multiline, rows = 3, style, hint, maxLength }) {
  return (
    <label style={{ display: 'block', ...style }}>
      {label && <div style={{ fontFamily: tk.mono, fontSize: '0.64rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tk.mute, marginBottom: 5 }}>{label}</div>}
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} maxLength={maxLength} style={{ ...fieldStyle(tk), resize: 'vertical' }} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} style={fieldStyle(tk)} />}
      {hint && <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

export function PrivacyLine({ tk, children }) {
  return (
    <div style={{ fontFamily: tk.sans, fontSize: '0.76rem', color: tk.mute, lineHeight: 1.5 }}>
      🔒 {children || 'Your resume is sent to our AI provider to generate results. ZeroAPI does not store it.'}
    </div>
  );
}

/* ═══════════════════ score visuals ═══════════════════ */
export function ScoreRing({ tk, score, size = 132, label }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const col = scoreColor(tk, score);
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }} role="img" aria-label={`Score ${score} out of 100`}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tk.line} strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: 'stroke-dashoffset .8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: tk.mono, fontWeight: 700, fontSize: size * 0.3, color: col, lineHeight: 1 }}>{score}</div>
        <div style={{ fontFamily: tk.sans, fontSize: '0.72rem', color: tk.sub, marginTop: 3 }}>{label || scoreLabel(score)}</div>
      </div>
    </div>
  );
}

export function Bar({ tk, label, score, weight, children }) {
  const col = scoreColor(tk, score);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
        <span style={{ fontFamily: tk.sans, fontWeight: 600, fontSize: '0.88rem', color: tk.text }}>{label}</span>
        <span style={{ fontFamily: tk.mono, fontSize: '0.78rem', color: col }}>{score}<span style={{ color: tk.mute }}>/100</span></span>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: tk.line, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: col, borderRadius: 99, transition: 'width .7s ease' }} />
      </div>
      {weight != null && <div style={{ fontFamily: tk.sans, fontSize: '0.68rem', color: tk.mute, marginTop: 3 }}>counts for {weight}% of the overall score</div>}
      {children}
    </div>
  );
}

export function Notes({ tk, notes }) {
  const icon = { good: '✓', warn: '!', bad: '✕', info: 'i' };
  const color = { good: tk.good, warn: tk.warn, bad: tk.bad, info: tk.info };
  return (
    <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'grid', gap: 5 }}>
      {notes.map((n, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, fontFamily: tk.sans, fontSize: '0.82rem', color: tk.sub, lineHeight: 1.5 }}>
          <span aria-hidden style={{ color: color[n.type], fontWeight: 700, width: 14, flex: 'none', textAlign: 'center' }}>{icon[n.type]}</span>
          <span>{n.text}</span>
        </li>
      ))}
    </ul>
  );
}

/* ═══════════════════ live preview (same blocks as the PDF) ═══════════════════ */
export function ResumePreview({ resume, template, order, highlight }) {
  const tk = useTk();
  const wrapRef = useRef(null);
  const paperRef = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [h, setH] = useState(800);

  const html = useMemo(() => blocksToHtml(buildBlocks(resume, order), { highlight }), [resume, order, highlight]);
  const css = useMemo(() => paperCss(template), [template]);

  const measure = useCallback(() => {
    if (!wrapRef.current) return;
    const paperW = 210 * 3.7795;
    const s = Math.min(1, wrapRef.current.clientWidth / paperW);
    setScale(s);
    if (paperRef.current) setH(paperRef.current.offsetHeight * s);
  }, []);

  useLayoutEffect(() => { measure(); }, [measure, html, css]);
  useEffect(() => {
    const onR = () => measure();
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, [measure]);

  return (
    <div ref={wrapRef} style={{ width: '100%', overflow: 'hidden', borderRadius: 10, border: `1px solid ${tk.line}`, background: tk.d ? '#2a2a33' : '#e9e9ef', padding: 0 }}>
      <style>{css}</style>
      <div style={{ height: h, position: 'relative' }}>
        <div ref={paperRef} className="rz-paper" style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

/* ═══════════════════ inline editor ═══════════════════ */
function ListEditor({ tk, label, items, onChange, placeholder, onImprove, improvingKey, keyPrefix }) {
  const set = (i, v) => onChange(items.map((x, k) => (k === i ? v : x)));
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {label && <div style={{ fontFamily: tk.mono, fontSize: '0.64rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tk.mute }}>{label}</div>}
      {items.map((it, i) => (
        <div key={i} style={{ display: 'grid', gap: 6 }}>
          <textarea
            value={it} onChange={(e) => set(i, e.target.value)} rows={Math.max(2, Math.ceil(it.length / 46))} placeholder={placeholder}
            style={{ ...fieldStyle(tk), resize: 'vertical', borderColor: /\[add [^\]]+\]/i.test(it) ? tk.warn : tk.inputLine }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {onImprove && (
              <Btn tk={tk} kind="ghost" small onClick={() => onImprove(i, it)} disabled={!!improvingKey || it.trim().length < 8}>
                {improvingKey === `${keyPrefix}:${i}` ? <><Spinner size={12} /> Improving</> : '✨ Improve'}
              </Btn>
            )}
            <Btn tk={tk} kind="danger" small onClick={() => onChange(items.filter((_, k) => k !== i))}>Remove</Btn>
          </div>
        </div>
      ))}
      <div><Btn tk={tk} kind="plain" small onClick={() => onChange([...items, ''])}>+ Add line</Btn></div>
    </div>
  );
}

const splitLines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
const splitCsv = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

/** Keeps the raw text while typing (so spaces, commas and blank lines survive); syncs when the value changes externally. */
function ParsedField({ value, onChange, parse, format, ...rest }) {
  const [text, setText] = useState(() => format(value));
  useEffect(() => {
    if (JSON.stringify(parse(text)) !== JSON.stringify(value)) setText(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <Field {...rest} value={text} onChange={(v) => { setText(v); onChange(parse(v)); }} />;
}
const CsvField = (props) => <ParsedField {...props} parse={splitCsv} format={(a) => a.join(', ')} />;
const LinesField = (props) => <ParsedField {...props} multiline parse={splitLines} format={(a) => a.join('\n')} />;

/** Fills missing structure WITHOUT trimming or dropping empty lines (the editor must hold raw text). */
function shapeResume(raw) {
  const x = JSON.parse(JSON.stringify(raw || {}));
  x.name = x.name || '';
  x.contact = { email: '', phone: '', location: '', linkedin: '', github: '', website: '', ...(x.contact || {}) };
  x.summary = x.summary || '';
  x.experience = (x.experience || []).map((e) => ({ title: '', company: '', location: '', dates: '', ...e, bullets: e.bullets || [] }));
  x.education = (x.education || []).map((e) => ({ degree: '', institution: '', location: '', dates: '', gpa: '', ...e, details: e.details || [] }));
  x.skills = { technical: [], tools: [], soft: [], ...(x.skills || {}) };
  x.projects = (x.projects || []).map((p) => ({ name: '', tech: '', link: '', description: '', ...p, bullets: p.bullets || [] }));
  ['certifications', 'awards', 'achievements', 'mentorship', 'languages'].forEach((k) => { x[k] = x[k] || []; });
  x.publications = { books: [], papers: [], datasets: [], ...(x.publications || {}) };
  return x;
}

function EditorSection({ tk, title, count, isOpen, onToggle, children }) {
  return (
    <Card tk={tk} pad={0} style={{ overflow: 'hidden' }}>
      <button type="button" onClick={onToggle} aria-expanded={isOpen} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', background: 'transparent', border: 'none', color: tk.text, cursor: 'pointer', fontFamily: tk.sans, fontWeight: 700, fontSize: '0.92rem' }}>
        <span>{title}{count != null && <span style={{ color: tk.mute, fontWeight: 400 }}>  ({count})</span>}</span>
        <span style={{ color: tk.ac, fontFamily: tk.mono }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div style={{ padding: '2px 16px 16px', display: 'grid', gap: 12 }}>{children}</div>}
    </Card>
  );
}

export function ResumeEditor({ resume, onChange, model, role, jd }) {
  const tk = useTk();
  const [open, setOpen] = useState({ basics: true, summary: true, experience: true });
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const r = useMemo(() => shapeResume(resume), [resume]);

  const up = (fn) => { const next = shapeResume(r); fn(next); onChange(next); };
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const sec = (id, title, children, count) => (
    <EditorSection tk={tk} title={title} count={count} isOpen={!!open[id]} onToggle={() => toggle(id)}>{children}</EditorSection>
  );

  const improve = async (kind, text, context, apply, key) => {
    setErr(''); setBusy(key);
    try { apply(await improveText({ kind, text, context, role, jd, model })); }
    catch (e) { setErr(e.message || 'Could not improve that line.'); }
    finally { setBusy(''); }
  };

  const g2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 };
  const box = { border: `1px solid ${tk.line}`, borderRadius: 12, padding: 12, display: 'grid', gap: 10 };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {err && <Notice tk={tk} kind="bad">{err}</Notice>}

      {sec('basics', 'Name & contact', <>
        <Field tk={tk} label="Full name" value={r.name} onChange={(v) => up((x) => { x.name = v; })} />
        <div style={g2}>
          <Field tk={tk} label="Email" value={r.contact.email} onChange={(v) => up((x) => { x.contact.email = v; })} type="email" />
          <Field tk={tk} label="Phone" value={r.contact.phone} onChange={(v) => up((x) => { x.contact.phone = v; })} />
          <Field tk={tk} label="Location" value={r.contact.location} onChange={(v) => up((x) => { x.contact.location = v; })} />
          <Field tk={tk} label="LinkedIn" value={r.contact.linkedin} onChange={(v) => up((x) => { x.contact.linkedin = v; })} />
          <Field tk={tk} label="GitHub" value={r.contact.github} onChange={(v) => up((x) => { x.contact.github = v; })} />
          <Field tk={tk} label="Website / portfolio" value={r.contact.website} onChange={(v) => up((x) => { x.contact.website = v; })} />
        </div>
      </>)}

      {sec('summary', 'Summary', <>
        <Field tk={tk} multiline rows={4} value={r.summary} onChange={(v) => up((x) => { x.summary = v; })} placeholder="2–3 sentences: who you are, what you do best, what you want next." />
        <div><Btn tk={tk} kind="ghost" small disabled={!!busy || r.summary.trim().length < 20} onClick={() => improve('summary', r.summary, '', (t) => up((x) => { x.summary = t; }), 'summary')}>{busy === 'summary' ? <><Spinner size={12} /> Improving</> : '✨ Improve summary'}</Btn></div>
      </>)}

      {sec('experience', 'Experience', <>
        {r.experience.map((e, ei) => (
          <div key={ei} style={box}>
            <div style={g2}>
              <Field tk={tk} label="Title" value={e.title} onChange={(v) => up((x) => { x.experience[ei].title = v; })} />
              <Field tk={tk} label="Company" value={e.company} onChange={(v) => up((x) => { x.experience[ei].company = v; })} />
              <Field tk={tk} label="Dates" value={e.dates} onChange={(v) => up((x) => { x.experience[ei].dates = v; })} placeholder="Jun 2024 – Aug 2024" />
              <Field tk={tk} label="Location" value={e.location} onChange={(v) => up((x) => { x.experience[ei].location = v; })} />
            </div>
            <ListEditor
              tk={tk} label="Bullets" items={e.bullets} keyPrefix={`exp${ei}`} improvingKey={busy}
              onChange={(list) => up((x) => { x.experience[ei].bullets = list; })}
              placeholder="Built … using … which …"
              onImprove={(i, t) => improve('bullet', t, `${e.title} at ${e.company}`, (nt) => up((x) => { x.experience[ei].bullets[i] = nt; }), `exp${ei}:${i}`)}
            />
            <div><Btn tk={tk} kind="danger" small onClick={() => up((x) => { x.experience.splice(ei, 1); })}>Delete this role</Btn></div>
          </div>
        ))}
        <div><Btn tk={tk} kind="plain" small onClick={() => up((x) => { x.experience.push({ title: '', company: '', location: '', dates: '', bullets: [''] }); })}>+ Add role / internship</Btn></div>
      </>, r.experience.length)}

      {sec('education', 'Education', <>
        {r.education.map((e, i) => (
          <div key={i} style={box}>
            <div style={g2}>
              <Field tk={tk} label="Degree / class" value={e.degree} onChange={(v) => up((x) => { x.education[i].degree = v; })} />
              <Field tk={tk} label="Institution" value={e.institution} onChange={(v) => up((x) => { x.education[i].institution = v; })} />
              <Field tk={tk} label="Dates" value={e.dates} onChange={(v) => up((x) => { x.education[i].dates = v; })} />
              <Field tk={tk} label="CGPA / percentage" value={e.gpa} onChange={(v) => up((x) => { x.education[i].gpa = v; })} />
            </div>
            <div><Btn tk={tk} kind="danger" small onClick={() => up((x) => { x.education.splice(i, 1); })}>Delete</Btn></div>
          </div>
        ))}
        <div><Btn tk={tk} kind="plain" small onClick={() => up((x) => { x.education.push({ degree: '', institution: '', location: '', dates: '', gpa: '', details: [] }); })}>+ Add education</Btn></div>
      </>, r.education.length)}

      {sec('skills', 'Skills', <>
        <CsvField tk={tk} label="Technical (comma-separated)" value={r.skills.technical} onChange={(v) => up((x) => { x.skills.technical = v; })} />
        <CsvField tk={tk} label="Tools & platforms" value={r.skills.tools} onChange={(v) => up((x) => { x.skills.tools = v; })} />
        <CsvField tk={tk} label="Soft skills" value={r.skills.soft} onChange={(v) => up((x) => { x.skills.soft = v; })} />
      </>)}

      {sec('projects', 'Projects', <>
        {r.projects.map((p, pi) => (
          <div key={pi} style={box}>
            <div style={g2}>
              <Field tk={tk} label="Project name" value={p.name} onChange={(v) => up((x) => { x.projects[pi].name = v; })} />
              <Field tk={tk} label="Tech stack" value={p.tech} onChange={(v) => up((x) => { x.projects[pi].tech = v; })} />
              <Field tk={tk} label="Link" value={p.link} onChange={(v) => up((x) => { x.projects[pi].link = v; })} />
            </div>
            <ListEditor
              tk={tk} label="What you built (bullets)" keyPrefix={`pr${pi}`} improvingKey={busy}
              items={[...(p.description ? [p.description] : []), ...p.bullets]}
              onChange={(list) => up((x) => { x.projects[pi].description = ''; x.projects[pi].bullets = list; })}
              onImprove={(i, t) => improve('bullet', t, `Project: ${p.name} (${p.tech})`, (nt) => up((x) => {
                const all = [...(x.projects[pi].description ? [x.projects[pi].description] : []), ...x.projects[pi].bullets];
                all[i] = nt; x.projects[pi].description = ''; x.projects[pi].bullets = all;
              }), `pr${pi}:${i}`)}
            />
            <div><Btn tk={tk} kind="danger" small onClick={() => up((x) => { x.projects.splice(pi, 1); })}>Delete project</Btn></div>
          </div>
        ))}
        <div><Btn tk={tk} kind="plain" small onClick={() => up((x) => { x.projects.push({ name: '', tech: '', link: '', description: '', bullets: [''] }); })}>+ Add project</Btn></div>
      </>, r.projects.length)}

      {sec('more', 'Certifications, awards & more', <>
        <LinesField tk={tk} rows={3} label="Certifications (one per line)" value={r.certifications} onChange={(v) => up((x) => { x.certifications = v; })} />
        <LinesField tk={tk} rows={3} label="Achievements (one per line)" value={r.achievements} onChange={(v) => up((x) => { x.achievements = v; })} />
        <LinesField tk={tk} rows={3} label="Awards (one per line)" value={r.awards} onChange={(v) => up((x) => { x.awards = v; })} />
        <LinesField tk={tk} rows={3} label="Books (one per line)" value={r.publications.books} onChange={(v) => up((x) => { x.publications.books = v; })} />
        <LinesField tk={tk} rows={3} label="Papers (one per line)" value={r.publications.papers} onChange={(v) => up((x) => { x.publications.papers = v; })} />
        <LinesField tk={tk} rows={2} label="Datasets (one per line)" value={r.publications.datasets} onChange={(v) => up((x) => { x.publications.datasets = v; })} />
        <LinesField tk={tk} rows={2} label="Volunteer & mentorship (one per line)" value={r.mentorship} onChange={(v) => up((x) => { x.mentorship = v; })} />
        <CsvField tk={tk} label="Languages (comma-separated)" value={r.languages} onChange={(v) => up((x) => { x.languages = v; })} />
      </>)}
    </div>
  );
}

/* ═══════════════════ export bar ═══════════════════ */
let _libsPromise = null;
function loadExportLibs() {
  if (!_libsPromise) {
    _libsPromise = Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
    ]).catch((e) => { _libsPromise = null; throw e; });
  }
  return _libsPromise;
}

export function ExportBar({ resume, template, onTemplate, order, onePage, onOnePage, branding, onBranding, onDownloaded }) {
  const tk = useTk();
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const r = useMemo(() => normalizeResume(resume), [resume]);
  const placeholders = countPlaceholders(JSON.stringify(r));
  const unicode = useMemo(() => hasUnsupportedChars(r), [r]);
  const fname = slugify(r.name, 'resume');

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };
  const guard = () => {
    if (placeholders > 0 && !window.confirm(`${placeholders} placeholder${placeholders > 1 ? 's' : ''} like [add number] are still in your resume. Download anyway?`)) return false;
    return true;
  };

  const pdf = async () => {
    if (!guard()) return;
    setBusy('pdf');
    try {
      await loadExportLibs();
      const { doc, pages } = renderResumePdf(window.jspdf.jsPDF, r, { template, order, onePage, branding });
      downloadBlob(doc.output('blob'), `${fname}-resume.pdf`);
      flash(`PDF saved (${pages} page${pages > 1 ? 's' : ''}).`);
      onDownloaded?.('pdf');
    } catch { flash('Could not create the PDF. Try Print / Save as PDF.'); }
    finally { setBusy(''); }
  };
  const docx = async () => {
    if (!guard()) return;
    setBusy('docx');
    try {
      await loadExportLibs();
      downloadBlob(await renderResumeDocx(window.JSZip, r, { template, order }), `${fname}-resume.docx`);
      flash('Word file saved.');
      onDownloaded?.('docx');
    } catch { flash('Could not create the Word file.'); }
    finally { setBusy(''); }
  };
  const copy = async () => { flash((await copyTo(resumeToPlainText(r))) ? 'Plain text copied.' : 'Copy failed.'); };

  return (
    <Card tk={tk} style={{ display: 'grid', gap: 12 }}>
      <div>
        <Label tk={tk}>Template</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8 }}>
          {TEMPLATE_KEYS.map((k) => (
            <button key={k} type="button" onClick={() => onTemplate(k)} aria-pressed={template === k} style={{
              textAlign: 'left', padding: '9px 11px', borderRadius: 10, cursor: 'pointer', background: template === k ? tk.acSoft : tk.soft,
              border: `1px solid ${template === k ? tk.ac : tk.line}`, color: tk.text,
            }}>
              <div style={{ fontFamily: tk.sans, fontWeight: 700, fontSize: '0.84rem' }}>{TEMPLATES[k].label}</div>
              <div style={{ fontFamily: tk.sans, fontSize: '0.7rem', color: tk.mute, marginTop: 2 }}>{TEMPLATES[k].hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: tk.sans, fontSize: '0.8rem', color: tk.sub }}>
        <label style={{ display: 'flex', gap: 7, alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!onePage} onChange={(e) => onOnePage(e.target.checked)} /> Shrink to fit one page
        </label>
        <label style={{ display: 'flex', gap: 7, alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!branding} onChange={(e) => onBranding(e.target.checked)} /> Add small “Made with ZeroAPI” footer
        </label>
      </div>

      {placeholders > 0 && <Notice tk={tk} kind="warn" title={`${placeholders} placeholder${placeholders > 1 ? 's' : ''} to fill`}>Yellow items like <b>[add number]</b> mark where a real result belongs. Replace them with your true numbers before sending.</Notice>}
      {unicode && <Notice tk={tk} kind="info">Your resume has characters (for example Hindi text) that standard PDF fonts can’t show. Use <b>Print / Save as PDF</b> to keep them.</Notice>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
        <Btn tk={tk} onClick={pdf} disabled={!!busy}>{busy === 'pdf' ? <><Spinner /> Building</> : '⬇ Download PDF'}</Btn>
        <Btn tk={tk} kind="ghost" onClick={docx} disabled={!!busy}>{busy === 'docx' ? <><Spinner /> Building</> : '⬇ Word (.docx)'}</Btn>
        <Btn tk={tk} kind="plain" onClick={copy}>⧉ Copy as text</Btn>
        <Btn tk={tk} kind="plain" onClick={() => printResume(r, { template, order })}>🖨 Print / Save as PDF</Btn>
      </div>
      <div aria-live="polite" style={{ minHeight: 18, fontFamily: tk.sans, fontSize: '0.78rem', color: tk.good }}>{msg}</div>
    </Card>
  );
}

/* ═══════════════════ Preview + Edit + Export workspace ═══════════════════ */
export function ResumeWorkspace({ resume, onChange, model, role, jd, sourceText, profile: profileProp, onDownloaded }) {
  const tk = useTk();
  const r = useMemo(() => normalizeResume(resume), [resume]);
  const profile = profileProp || inferProfile(r);
  const [template, setTemplate] = useState(() => (profile === 'fresher' ? 'campus' : profile === 'academic' ? 'classic' : 'modern'));
  const [onePage, setOnePage] = useState(() => profile === 'fresher');
  const [branding, setBranding] = useState(false);
  const [tab, setTab] = useState('preview');
  const order = useMemo(() => sectionOrder(r, profile), [r, profile]);

  const grounding = useMemo(() => (sourceText ? groundingCheck(r, sourceText) : null), [r, sourceText]);
  const highlight = useMemo(() => {
    const nums = new Set((grounding?.numbers || []).map((n) => n.value.replace(/[,%]/g, '')));
    return { numbers: nums, placeholders: true };
  }, [grounding]);

  const changeTemplate = (k) => { setTemplate(k); setOnePage(!!TEMPLATES[k].onePage); };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {grounding && !grounding.clean && <GroundingNotice tk={tk} grounding={grounding} />}
      <div role="tablist" style={{ display: 'flex', gap: 8 }}>
        {[['preview', '👁 Preview'], ['edit', '✎ Edit']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)} style={{
            flex: 1, padding: '10px', cursor: 'pointer', fontFamily: tk.mono, fontSize: '0.76rem', borderRadius: 10,
            background: tab === k ? tk.acSoft : 'transparent', color: tab === k ? tk.ac : tk.sub, border: `1px solid ${tab === k ? tk.ac : tk.line}`,
          }}>{l}</button>
        ))}
      </div>
      {tab === 'preview'
        ? <ResumePreview resume={r} template={template} order={order} highlight={highlight} />
        : <ResumeEditor resume={resume} onChange={onChange} model={model} role={role} jd={jd} />}
      <ExportBar resume={r} template={template} onTemplate={changeTemplate} order={order} onePage={onePage} onOnePage={setOnePage} branding={branding} onBranding={setBranding} onDownloaded={onDownloaded} />
    </div>
  );
}

/* ═══════════════════ trust panels ═══════════════════ */
export function GroundingNotice({ tk, grounding }) {
  const nums = grounding.numbers;
  return (
    <Notice tk={tk} kind="warn" title="Please verify these — they weren’t in what you provided">
      {nums.length > 0 && <div style={{ marginTop: 4 }}>Numbers: {nums.slice(0, 8).map((n, i) => <Chip key={i} tk={tk} color={tk.bad} style={{ margin: '2px 4px 2px 0' }}>{n.value} · {n.where}</Chip>)}</div>}
      {grounding.skills.length > 0 && <div style={{ marginTop: 4 }}>Skills: {grounding.skills.slice(0, 10).map((s, i) => <Chip key={i} tk={tk} color={tk.warn} style={{ margin: '2px 4px 2px 0' }}>{s}</Chip>)}</div>}
      {grounding.entities.length > 0 && <div style={{ marginTop: 4 }}>Names: {grounding.entities.map((s, i) => <Chip key={i} tk={tk} color={tk.warn} style={{ margin: '2px 4px 2px 0' }}>{s}</Chip>)}</div>}
      <div style={{ marginTop: 6, color: tk.sub }}>Numbers are underlined red in the preview. Edit or remove anything that isn’t true — AI can slip.</div>
    </Notice>
  );
}

export function WhatChanged({ changes, droppedChanges }) {
  const tk = useTk();
  const [open, setOpen] = useState(false);
  if (!changes?.length) return null;
  return (
    <Card tk={tk} pad={0} style={{ overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '13px 16px', background: 'transparent', border: 'none', color: tk.text, cursor: 'pointer', fontFamily: tk.sans, fontWeight: 700, fontSize: '0.9rem' }}>
        <span>What changed <span style={{ color: tk.mute, fontWeight: 400 }}>({changes.length} rewrites)</span></span>
        <span style={{ color: tk.ac, fontFamily: tk.mono }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px', display: 'grid', gap: 12 }}>
          {changes.map((c, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${tk.acLine}`, paddingLeft: 12 }}>
              <div style={{ fontFamily: tk.sans, fontSize: '0.82rem', color: tk.mute, textDecoration: 'line-through', lineHeight: 1.5 }}>{c.before}</div>
              <div style={{ fontFamily: tk.sans, fontSize: '0.86rem', color: tk.text, marginTop: 4, lineHeight: 1.5 }}>{c.after}</div>
              {c.reason && <div style={{ fontFamily: tk.mono, fontSize: '0.66rem', color: tk.ac, marginTop: 4 }}>{c.reason}</div>}
            </div>
          ))}
          <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute }}>
            Every “before” line is checked against your original text{droppedChanges ? ` (${droppedChanges} unverifiable item${droppedChanges > 1 ? 's' : ''} hidden)` : ''}.
          </div>
        </div>
      )}
    </Card>
  );
}

export { numberSet, ungroundedNumbers };
