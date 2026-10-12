// src/components/CoverLetterGenerator.jsx
// Grounded cover letters: only facts from the resume, no invented numbers, editable paragraph-by-paragraph,
// composed in code (header, greeting, sign-off) so names and dates are never hallucinated.

import { useState, useMemo, useEffect } from 'react';
import { TOOL_MODELS } from '../constants';
import { trackEvent, loadScript } from '../utils';
import {
  aiCall, parseJsonLoose, normalizeResume, resumeToText, numberSet, ungroundedNumbers, matchJobDescription,
  copyTo, downloadBlob, slugify,
} from '../resumeCore';
import { renderLetterPdf, renderLetterDocx } from '../resumeExport';
import { useTk, Card, Btn, Label, Field, Notice, Spinner, Chip } from './ResumeShared';

const TONES = [
  ['professional', 'Professional', 'Confident and polished'],
  ['warm', 'Warm', 'Personable but still formal'],
  ['direct', 'Direct', 'Short sentences, no fluff'],
];
const LENGTHS = [
  ['short', 'Short', '≈150 words'],
  ['standard', 'Standard', '≈250 words'],
  ['detailed', 'Detailed', '≈330 words'],
];

const SYSTEM = `You write cover letters for job applicants. Reply with ONE JSON object only: {"paragraphs":["…","…","…"]}.
RULES
1. TRUTH: use only facts that appear in the RESUME. Never invent employers, projects, tools, achievements or numbers. If the resume has no number for something, do not add one.
2. STRUCTURE: 3 or 4 paragraphs of body text only — NO greeting, NO sign-off, NO name, NO date, NO address block (these are added separately).
   • Paragraph 1: a specific hook tying the applicant's strongest relevant evidence to the role (not "I am writing to apply…" and not "I am excited to…").
   • Middle: 1–2 paragraphs proving fit with concrete projects or results from the resume, using the job description's own terminology only where the resume supports it.
   • Last: a brief, confident close that invites a conversation.
3. VOICE: first person, active verbs, no clichés ("team player", "passionate", "hard-working", "fast learner", "I believe I would be a great fit"), no filler.
4. If the company name is not given, do not guess it — refer to "your team" or "the role".
5. Match the requested tone and length.`;

function lettersOf(text) {
  const p = parseJsonLoose(text);
  const arr = Array.isArray(p.paragraphs) ? p.paragraphs : (typeof p.letter === 'string' ? p.letter.split(/\n{2,}/) : []);
  const out = arr.map((x) => String(x || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (!out.length) throw new Error('The AI did not return a letter. Please try again.');
  return out;
}

export default function CoverLetterGenerator({ resumeData, jobDescription = '', targetRole = '' }) {
  const tk = useTk();
  const resume = useMemo(() => normalizeResume(resumeData || {}), [resumeData]);
  const resumeText = useMemo(() => resumeToText(resume), [resume]);
  const hasResume = resumeText.replace(/\s/g, '').length > 60;

  const [company, setCompany] = useState('');
  const [role, setRole] = useState(targetRole);
  const [manager, setManager] = useState('');
  const [jd, setJd] = useState(jobDescription);
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('standard');
  const [angle, setAngle] = useState('');
  const [paras, setParas] = useState([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => { if (jobDescription && !jd) setJd(jobDescription); }, [jobDescription]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (targetRole && !role) setRole(targetRole); }, [targetRole]); // eslint-disable-line react-hooks/exhaustive-deps

  const ctx = () => [
    company && `Company: ${company}`,
    role && `Role: ${role}`,
    `Tone: ${tone}`,
    `Length: ${LENGTHS.find((l) => l[0] === length)[2]}`,
    angle && `The applicant wants to emphasise: ${angle.slice(0, 300)}`,
    jd.trim().length > 40 && `JOB DESCRIPTION:\n${jd.slice(0, 4500)}`,
    `RESUME:\n${resumeText.slice(0, 9000)}`,
  ].filter(Boolean).join('\n\n');

  const generate = async () => {
    setBusy('gen'); setError('');
    try {
      const { text } = await aiCall({
        toolId: 'cover-letter', model: TOOL_MODELS.coverLetter, json: true, reasoning: 'low', maxTokens: 3000, temperature: 0.5,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: ctx() }],
      });
      setParas(lettersOf(text));
      trackEvent('cover_letter_generated', { tone, length });
    } catch (e) { setError(e.message || 'Could not write the letter. Please try again.'); }
    finally { setBusy(''); }
  };

  const refine = async (instruction, key) => {
    setBusy(key); setError('');
    try {
      const { text } = await aiCall({
        toolId: 'cover-letter', model: TOOL_MODELS.coverLetter, json: true, reasoning: 'low', maxTokens: 3000, temperature: 0.4,
        messages: [
          { role: 'system', content: `${SYSTEM}\nYou are now REVISING an existing letter. Keep every fact; apply only the instruction. Return the full revised {"paragraphs":[…]}.` },
          { role: 'user', content: `${ctx()}\n\nCURRENT LETTER:\n${paras.join('\n\n')}\n\nINSTRUCTION: ${instruction}` },
        ],
      });
      setParas(lettersOf(text));
    } catch (e) { setError(e.message || 'Could not revise the letter.'); }
    finally { setBusy(''); }
  };

  const letter = useMemo(() => {
    const c = resume.contact;
    return {
      name: resume.name,
      contactLine: [c.email, c.phone, c.location, c.linkedin].filter(Boolean).join(' | '),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      recipientLines: [manager.trim() || 'Hiring Manager', company.trim()].filter(Boolean),
      subject: role.trim() ? `Application for ${role.trim()}${company.trim() ? ` — ${company.trim()}` : ''}` : '',
      greeting: manager.trim() ? `Dear ${manager.trim()},` : 'Dear Hiring Manager,',
      paragraphs: paras.filter((p) => p.trim()),
      closing: 'Sincerely,',
      signoff: resume.name,
    };
  }, [resume, manager, company, role, paras]);

  const fullText = useMemo(() => [letter.greeting, '', ...letter.paragraphs.flatMap((p) => [p, '']), letter.closing, letter.signoff].join('\n'), [letter]);

  const bad = useMemo(() => {
    if (!paras.length) return [];
    return [...new Set(ungroundedNumbers(paras.join(' '), numberSet(resumeText)))];
  }, [paras, resumeText]);

  const jdTerms = useMemo(() => (jd.trim().length > 40 && paras.length ? matchJobDescription(paras.join(' '), jd) : null), [paras, jd]);
  const words = useMemo(() => paras.join(' ').split(/\s+/).filter(Boolean).length, [paras]);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };
  const file = slugify(resume.name, 'cover-letter');
  const pdf = async () => {
    setBusy('pdf');
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const { doc } = renderLetterPdf(window.jspdf.jsPDF, letter);
      downloadBlob(doc.output('blob'), `${file}-cover-letter.pdf`); flash('PDF saved.');
    } catch { flash('Could not create the PDF.'); } finally { setBusy(''); }
  };
  const docx = async () => {
    setBusy('docx');
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      downloadBlob(await renderLetterDocx(window.JSZip, letter), `${file}-cover-letter.docx`); flash('Word file saved.');
    } catch { flash('Could not create the Word file.'); } finally { setBusy(''); }
  };

  const pick = (items, value, set) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map(([k, l, d]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => set(k)} style={{
          flex: '1 1 110px', textAlign: 'left', padding: '9px 11px', borderRadius: 10, cursor: 'pointer', background: value === k ? tk.acSoft : tk.soft,
          border: `1px solid ${value === k ? tk.ac : tk.line}`, color: tk.text,
        }}>
          <div style={{ fontFamily: tk.sans, fontWeight: 700, fontSize: '0.82rem' }}>{l}</div>
          <div style={{ fontFamily: tk.sans, fontSize: '0.7rem', color: tk.mute }}>{d}</div>
        </button>
      ))}
    </div>
  );

  return (
    <Card tk={tk} style={{ display: 'grid', gap: 14 }}>
      <div>
        <Label tk={tk}>Cover letter</Label>
        <div style={{ fontFamily: tk.sans, fontSize: '0.9rem', color: tk.sub, lineHeight: 1.6 }}>
          A short letter built from your resume’s real evidence. We add your name, date and address block ourselves, so nothing gets invented.
        </div>
      </div>

      {!hasResume && <Notice tk={tk} kind="warn">Build or paste a resume first — the letter is written from it.</Notice>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
        <Field tk={tk} label="Company" value={company} onChange={setCompany} placeholder="e.g. Infosys" maxLength={80} />
        <Field tk={tk} label="Role" value={role} onChange={setRole} placeholder="e.g. Software Engineer" maxLength={100} />
        <Field tk={tk} label="Hiring manager (optional)" value={manager} onChange={setManager} placeholder="e.g. Ms. Sharma" maxLength={60} />
      </div>

      <div>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} style={{ background: 'none', border: 'none', color: tk.ac, fontFamily: tk.mono, fontSize: '0.74rem', cursor: 'pointer', padding: 0 }}>
          {open ? '− Fewer options' : '+ Job description, tone & length'}
        </button>
        {open && (
          <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
            <Field tk={tk} multiline rows={5} label="Job description (recommended)" value={jd} onChange={setJd} placeholder="Paste the job posting so the letter speaks to it." />
            <Field tk={tk} label="Anything you want to emphasise? (optional)" value={angle} onChange={setAngle} placeholder="e.g. my attendance-system project" maxLength={300} />
            <div><Label tk={tk} style={{ color: tk.mute }}>Tone</Label>{pick(TONES, tone, setTone)}</div>
            <div><Label tk={tk} style={{ color: tk.mute }}>Length</Label>{pick(LENGTHS, length, setLength)}</div>
          </div>
        )}
      </div>

      {error && <Notice tk={tk} kind="bad">{error}</Notice>}
      <Btn tk={tk} onClick={generate} disabled={!!busy || !hasResume} full>
        {busy === 'gen' ? <><Spinner /> Writing your letter…</> : paras.length ? '↻ Write it again' : '✉ Write my cover letter'}
      </Btn>

      {paras.length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {bad.length > 0 && (
            <Notice tk={tk} kind="warn" title="Check these numbers">
              {bad.slice(0, 6).map((n) => <Chip key={n} tk={tk} color={tk.bad} style={{ margin: '2px 4px 2px 0' }}>{n}</Chip>)}
              <div style={{ marginTop: 4 }}>They aren’t in your resume. Edit or delete them if they aren’t true.</div>
            </Notice>
          )}

          <div style={{ background: '#fff', color: '#222', borderRadius: 12, border: `1px solid ${tk.line}`, padding: '18px 16px', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", lineHeight: 1.6, fontSize: '0.92rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#141414' }}>{letter.name}</div>
            <div style={{ color: '#666', fontSize: '0.8rem', borderBottom: '1px solid #ddd', paddingBottom: 8, marginBottom: 12, wordBreak: 'break-word' }}>{letter.contactLine}</div>
            <div>{letter.date}</div>
            <div style={{ margin: '10px 0' }}>{letter.recipientLines.map((l, i) => <div key={i}>{l}</div>)}</div>
            {letter.subject && <div style={{ fontWeight: 700, marginBottom: 10 }}>{letter.subject}</div>}
            <div style={{ marginBottom: 8 }}>{letter.greeting}</div>
            {paras.map((p, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 10 }}>
                <textarea
                  value={p} onChange={(e) => setParas(paras.map((x, k) => (k === i ? e.target.value : x)))}
                  rows={Math.max(3, Math.ceil(p.length / 52))} aria-label={`Paragraph ${i + 1}`}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '8px 10px', fontFamily: 'inherit', fontSize: '16px', lineHeight: 1.6, color: '#222', background: '#fafafa', resize: 'vertical' }}
                />
                <button type="button" onClick={() => setParas(paras.filter((_, k) => k !== i))} aria-label={`Delete paragraph ${i + 1}`} style={{ position: 'absolute', top: 4, right: 6, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>×</button>
              </div>
            ))}
            <div style={{ marginTop: 6 }}>{letter.closing}</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>{letter.signoff}</div>
          </div>

          <div style={{ fontFamily: tk.sans, fontSize: '0.76rem', color: tk.mute }}>
            {words} words{jdTerms ? ` · echoes ${jdTerms.matched.length} of ${jdTerms.total} key job terms` : ''} · tap a paragraph to edit it
          </div>

          <div>
            <Label tk={tk} style={{ color: tk.mute }}>Quick revisions</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                ['shorter', 'Make it shorter', 'Cut about 25% of the words. Keep the strongest evidence.'],
                ['confident', 'More confident', 'Make the tone more confident and assertive without sounding arrogant.'],
                ['specific', 'More specific', 'Replace general statements with specific evidence already in the resume.'],
              ].map(([k, l, ins]) => (
                <Btn key={k} tk={tk} kind="plain" small disabled={!!busy} onClick={() => refine(ins, k)}>{busy === k ? <><Spinner size={12} /> Revising</> : l}</Btn>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
            <Btn tk={tk} onClick={pdf} disabled={!!busy}>{busy === 'pdf' ? <><Spinner /> Building</> : '⬇ PDF'}</Btn>
            <Btn tk={tk} kind="ghost" onClick={docx} disabled={!!busy}>{busy === 'docx' ? <><Spinner /> Building</> : '⬇ Word (.docx)'}</Btn>
            <Btn tk={tk} kind="plain" onClick={async () => flash((await copyTo(fullText)) ? 'Letter copied.' : 'Copy failed.')}>⧉ Copy text</Btn>
          </div>
          <div aria-live="polite" style={{ minHeight: 16, fontFamily: tk.sans, fontSize: '0.78rem', color: tk.good }}>{msg}</div>
        </div>
      )}
    </Card>
  );
}
