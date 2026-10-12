// src/components/ResumeBuilderTool.jsx
// Step-by-step resume wizard.
//  • Freshers can skip Experience (the old wizard blocked them)
//  • "Import" fills every step from an existing resume / LinkedIn text (PDF, DOCX or paste)
//  • Draft is saved in this browser, so a mobile refresh never loses work
//  • Optional job description → truthful tailoring; live "draft strength" before you build
//  • Result: verified "what changed", grounding check, inline editor, PDF/Word, cover letter

import { useState, useEffect, useMemo, useRef } from 'react';
import { TOOL_MODELS } from '../constants';
import { trackEvent } from '../utils';
import {
  extractDocument, importToForm, formToSourceText, buildFromFormMessages, generateResume, normalizeResume, resumeToText,
  computeDeterministic, analyzeSignals, cleanResumeText, saveDraft, loadDraft, clearDraft,
} from '../resumeCore';
import {
  useTk, Card, Btn, Label, Field, Notice, Spinner, Chip, ScoreRing, Notes, PrivacyLine, ResumeWorkspace, WhatChanged,
} from './ResumeShared';
import CoverLetterGenerator from './CoverLetterGenerator';

const DRAFT_KEY = 'zeroapi:resume-wizard:v2';

const uid = () => Date.now() + Math.floor(Math.random() * 1000);
const blankExp = () => ({ id: uid(), title: '', company: '', startDate: '', endDate: '', current: false, bullets: '' });
const blankEdu = (degree = '') => ({ id: uid(), degree, field: '', institution: '', year: '', gpa: '' });
const blankProj = () => ({ id: uid(), name: '', tech: '', description: '' });

const BLANK = {
  name: '', email: '', phone: '', location: '', linkedin: '', github: '', target: '', summary: '',
  experience: [], education: [blankEdu('B.Tech')], techSkills: '', tools: '', softSkills: '',
  projects: [blankProj()], certs: '', languages: '', achievements: '', publications: '',
};

const STEPS = [
  { id: 'start', title: 'Start' },
  { id: 'basics', title: 'About you' },
  { id: 'target', title: 'Target job' },
  { id: 'education', title: 'Education' },
  { id: 'experience', title: 'Experience' },
  { id: 'skills', title: 'Skills & projects' },
  { id: 'extras', title: 'Extras' },
  { id: 'review', title: 'Review' },
];

const PROFILES = [
  ['fresher', '🎓 Student / fresher', 'Education and projects lead; fits one page.'],
  ['experienced', '💼 Working professional', 'Experience leads; up to two pages.'],
  ['academic', '📚 Academic / researcher', 'Education and publications lead.'],
];

const hasContent = (d) => !!(d.name || d.email || d.techSkills || d.experience.some((e) => e.title || e.company) || d.projects.some((p) => p.name));

export default function ResumeBuilderTool() {
  const tk = useTk();
  const topRef = useRef(null);
  const fileRef = useRef(null);

  const [data, setData] = useState(BLANK);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState('fresher');
  const [jd, setJd] = useState('');
  const [polish, setPolish] = useState('strong');
  const [phase, setPhase] = useState('form'); // form | working | done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { resume, changes, droppedChanges, truncated, sourceText }
  const [resume, setResume] = useState(null);
  const [cl, setCl] = useState(null);
  const [showPubs, setShowPubs] = useState(false);

  const [draftFound, setDraftFound] = useState(null);
  const [importMode, setImportMode] = useState('file');
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const loadedRef = useRef(false);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const patchList = (key, id, patch) => setData((d) => ({ ...d, [key]: d[key].map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const removeFrom = (key, id) => setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) }));

  /* ── draft: load once, save (debounced) ── */
  useEffect(() => {
    const d = loadDraft(DRAFT_KEY);
    if (d?.data && hasContent(d.data)) setDraftFound(d);
    loadedRef.current = true;
  }, []);
  useEffect(() => {
    if (!loadedRef.current || draftFound || phase !== 'form') return undefined;
    const t = setTimeout(() => { if (hasContent(data)) saveDraft(DRAFT_KEY, { data, step, profile, jd, polish }); }, 600);
    return () => clearTimeout(t);
  }, [data, step, profile, jd, polish, phase, draftFound]);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [step, phase]);

  const continueDraft = () => {
    const d = draftFound;
    setData({ ...BLANK, ...d.data }); setStep(d.step || 1); setProfile(d.profile || 'fresher'); setJd(d.jd || ''); setPolish(d.polish || 'strong');
    setDraftFound(null);
  };
  const discardDraft = () => { clearDraft(DRAFT_KEY); setDraftFound(null); };

  /* ── import ── */
  const runImport = async (fileOrNull) => {
    setImporting(true); setImportMsg(''); setError('');
    try {
      let text = '';
      if (fileOrNull) text = (await extractDocument(fileOrNull)).text;
      else text = cleanResumeText(importText);
      if (text.replace(/\s/g, '').length < 150) throw new Error('That looks too short to import. Paste more of your resume or LinkedIn profile.');
      const form = await importToForm({ text, model: TOOL_MODELS.coverLetter });
      setData((d) => ({
        ...d, ...Object.fromEntries(Object.entries(form).filter(([k, v]) => (Array.isArray(v) ? v.length : String(v || '').trim()) && k !== 'summary')),
        summary: form.summary || d.summary,
        education: form.education.length ? form.education : d.education,
        experience: form.experience.length ? form.experience : d.experience,
        projects: form.projects.length ? form.projects : d.projects,
      }));
      setProfile(analyzeSignals(text).profile);
      setImportMsg('Imported. Check each step — nothing is added that wasn’t in your text.');
      trackEvent('resume_wizard_import', {});
    } catch (e) { setError(e.message || 'Import failed.'); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  /* ── validation / nav ── */
  const stepError = () => {
    if (STEPS[step].id === 'basics') {
      if (!data.name.trim()) return 'Add your full name.';
      if (!data.email.trim() && !data.phone.trim()) return 'Add an email or phone number so recruiters can reach you.';
    }
    return '';
  };
  const next = () => { const e = stepError(); if (e) { setError(e); return; } setError(''); setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const back = () => { setError(''); setStep((s) => Math.max(0, s - 1)); };

  /* ── draft strength (deterministic, offline) ── */
  const sourceText = useMemo(() => formToSourceText({ ...data }), [data]);
  const strength = useMemo(() => (sourceText.length > 80 ? computeDeterministic(sourceText, { jd }) : null), [sourceText, jd]);
  const canBuild = !!(data.name.trim() && (data.education.some((e) => (e.degree + e.institution).trim()) || data.experience.some((e) => (e.title + e.company).trim()) || data.projects.some((p) => (p.name + p.description).trim())));

  /* ── build ── */
  const build = async () => {
    setPhase('working'); setError('');
    try {
      const src = formToSourceText({ ...data });
      const messages = buildFromFormMessages({ sourceText: src, opts: { polish, placeholders: true, profile, role: data.target, jd } });
      const out = await generateResume({ messages, sourceText: src, model: TOOL_MODELS.resumeBuilderTool, toolId: 'resume-wizard' });
      // The form is the source of truth for contact details
      const r = normalizeResume(out.resume);
      r.name = r.name || data.name.trim();
      r.contact = {
        email: data.email.trim() || r.contact.email, phone: data.phone.trim() || r.contact.phone, location: data.location.trim() || r.contact.location,
        linkedin: data.linkedin.trim() || r.contact.linkedin, github: data.github.trim() || r.contact.github, website: r.contact.website,
      };
      setResult({ ...out, sourceText: src }); setResume(r); setPhase('done');
      trackEvent('resume_wizard_built', { profile, has_jd: !!jd.trim() });
    } catch (e) { setError(e.message || 'Could not build the resume. Please try again.'); setPhase('form'); }
  };

  const afterScore = useMemo(() => (resume ? computeDeterministic(resumeToText(normalizeResume(resume)), { jd }).det : null), [resume, jd]);

  const startOver = () => {
    if (!window.confirm('Start over? This clears your answers and the saved draft.')) return;
    clearDraft(DRAFT_KEY); setData(BLANK); setStep(0); setResult(null); setResume(null); setCl(null); setPhase('form'); setError(''); setJd(''); setImportMsg('');
  };

  /* ═════════════ DONE ═════════════ */
  if (phase === 'done' && resume) {
    return (
      <div ref={topRef} style={{ display: 'grid', gap: 14, scrollMarginTop: 80 }}>
        <Card tk={tk} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {afterScore && <ScoreRing tk={tk} score={afterScore.overall} size={104} label="resume strength" />}
          <div style={{ flex: 1, minWidth: 200 }}>
            <Label tk={tk}>Your resume is ready</Label>
            <div style={{ fontFamily: tk.sans, fontSize: '0.88rem', color: tk.sub, lineHeight: 1.6 }}>Preview it, edit any line, then download as PDF or Word.{data.target ? ` Tailored for ${data.target}.` : ''}</div>
            {afterScore && afterScore.categories.flatMap((c) => c.notes).some((n) => n.type === 'warn' || n.type === 'bad') && (
              <div style={{ fontFamily: tk.sans, fontSize: '0.78rem', color: tk.mute, marginTop: 6 }}>Tip: the Resume Analyzer can give a full line-by-line review.</div>
            )}
          </div>
        </Card>
        {result?.truncated && <Notice tk={tk} kind="warn">The AI hit its length limit, so the end may be missing. Check every section or rebuild with “Light polish”.</Notice>}
        <WhatChanged changes={result?.changes} droppedChanges={result?.droppedChanges} />
        <ResumeWorkspace resume={resume} onChange={(r) => { setResume(r); setCl(normalizeResume(r)); }} model={TOOL_MODELS.coverLetter} role={data.target} jd={jd} sourceText={result?.sourceText} profile={profile} />
        <CoverLetterGenerator resumeData={cl || normalizeResume(resume)} jobDescription={jd} targetRole={data.target} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn tk={tk} kind="plain" small onClick={() => setPhase('form')}>← Edit my answers</Btn>
          <Btn tk={tk} kind="plain" small onClick={startOver}>↺ Start a new resume</Btn>
        </div>
      </div>
    );
  }

  /* ═════════════ FORM ═════════════ */
  const cur = STEPS[step].id;
  const g2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 };
  const box = { border: `1px solid ${tk.line}`, borderRadius: 12, padding: 12, display: 'grid', gap: 10 };

  return (
    <div ref={topRef} style={{ display: 'grid', gap: 14, scrollMarginTop: 80 }}>
      {/* progress */}
      <div role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Resume builder progress">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: tk.mono, fontSize: '0.68rem', color: tk.mute, marginBottom: 6 }}>
          <span>Step {step + 1} of {STEPS.length}</span><span style={{ color: tk.ac }}>{STEPS[step].title}</span>
        </div>
        <div style={{ height: 6, background: tk.line, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: tk.grad, transition: 'width .3s' }} />
        </div>
      </div>

      {draftFound && (
        <Notice tk={tk} kind="info" title="Continue where you left off?">
          We found a saved draft{draftFound.data?.name ? ` for ${draftFound.data.name}` : ''} in this browser.
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <Btn tk={tk} small onClick={continueDraft}>Continue draft</Btn>
            <Btn tk={tk} kind="plain" small onClick={discardDraft}>Start fresh</Btn>
          </div>
        </Notice>
      )}

      <Card tk={tk} style={{ display: 'grid', gap: 14 }}>
        {cur === 'start' && (
          <>
            <div>
              <Label tk={tk}>Which describes you?</Label>
              <div style={{ display: 'grid', gap: 8 }}>
                {PROFILES.map(([k, l, d]) => (
                  <button key={k} type="button" onClick={() => setProfile(k)} aria-pressed={profile === k} style={{
                    textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: profile === k ? tk.acSoft : tk.soft,
                    border: `1px solid ${profile === k ? tk.ac : tk.line}`, color: tk.text,
                  }}>
                    <div style={{ fontFamily: tk.sans, fontWeight: 700, fontSize: '0.92rem' }}>{l}</div>
                    <div style={{ fontFamily: tk.sans, fontSize: '0.78rem', color: tk.mute, marginTop: 2 }}>{d}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${tk.line}`, paddingTop: 14 }}>
              <Label tk={tk}>Already have a resume? Import it</Label>
              <div style={{ fontFamily: tk.sans, fontSize: '0.84rem', color: tk.sub, lineHeight: 1.55, marginBottom: 10 }}>
                Upload a PDF/Word file or paste your resume or LinkedIn “About / Experience” text. We’ll fill every step for you to review.
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }} role="tablist">
                {[['file', 'Upload file'], ['paste', 'Paste text']].map(([k, l]) => (
                  <button key={k} role="tab" aria-selected={importMode === k} type="button" onClick={() => setImportMode(k)} style={{
                    flex: 1, padding: '9px', cursor: 'pointer', fontFamily: tk.mono, fontSize: '0.72rem', borderRadius: 10,
                    background: importMode === k ? tk.acSoft : 'transparent', color: importMode === k ? tk.ac : tk.sub, border: `1px solid ${importMode === k ? tk.ac : tk.line}`,
                  }}>{l}</button>
                ))}
              </div>
              {importMode === 'file' ? (
                <>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && runImport(e.target.files[0])} />
                  <Btn tk={tk} kind="ghost" full disabled={importing} onClick={() => fileRef.current?.click()}>{importing ? <><Spinner /> Reading…</> : '📄 Choose PDF or Word file'}</Btn>
                </>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  <Field tk={tk} multiline rows={6} value={importText} onChange={setImportText} placeholder="Paste your resume or LinkedIn text…" />
                  <Btn tk={tk} kind="ghost" full disabled={importing || importText.trim().length < 100} onClick={() => runImport(null)}>{importing ? <><Spinner /> Importing…</> : 'Import from text'}</Btn>
                </div>
              )}
              {importMsg && <Notice tk={tk} kind="good" style={{ marginTop: 10 }}>{importMsg}</Notice>}
            </div>
          </>
        )}

        {cur === 'basics' && (
          <>
            <Label tk={tk}>About you</Label>
            <Field tk={tk} label="Full name *" value={data.name} onChange={(v) => set('name', v)} placeholder="As you want it on the resume" />
            <div style={g2}>
              <Field tk={tk} label="Email *" type="email" value={data.email} onChange={(v) => set('email', v)} />
              <Field tk={tk} label="Phone" value={data.phone} onChange={(v) => set('phone', v)} placeholder="+91 98765 43210" />
              <Field tk={tk} label="City, State" value={data.location} onChange={(v) => set('location', v)} placeholder="Jabalpur, MP" />
              <Field tk={tk} label="LinkedIn" value={data.linkedin} onChange={(v) => set('linkedin', v)} placeholder="linkedin.com/in/you" />
              <Field tk={tk} label="GitHub / portfolio" value={data.github} onChange={(v) => set('github', v)} placeholder="github.com/you" />
            </div>
          </>
        )}

        {cur === 'target' && (
          <>
            <Label tk={tk}>What job are you aiming for?</Label>
            <Field tk={tk} label="Target role" value={data.target} onChange={(v) => set('target', v)} placeholder="e.g. Software Engineer, Data Analyst" maxLength={120} />
            <Field tk={tk} multiline rows={6} label="Job description (optional)" value={jd} onChange={setJd} placeholder="Paste a job posting to tailor your resume to it. Only skills you list yourself will appear." />
            <div>
              <Label tk={tk} style={{ color: tk.mute }}>How much should AI change your wording?</Label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['strong', 'Strong rewrite', 'Sharper, results-focused'], ['light', 'Light polish', 'Keep my own words']].map(([k, l, d]) => (
                  <button key={k} type="button" onClick={() => setPolish(k)} aria-pressed={polish === k} style={{
                    flex: '1 1 160px', textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: polish === k ? tk.acSoft : tk.soft,
                    border: `1px solid ${polish === k ? tk.ac : tk.line}`, color: tk.text,
                  }}><div style={{ fontFamily: tk.sans, fontWeight: 700, fontSize: '0.84rem' }}>{l}</div><div style={{ fontFamily: tk.sans, fontSize: '0.72rem', color: tk.mute }}>{d}</div></button>
                ))}
              </div>
            </div>
          </>
        )}

        {cur === 'education' && (
          <>
            <Label tk={tk}>Education</Label>
            {data.education.map((e) => (
              <div key={e.id} style={box}>
                <div style={g2}>
                  <Field tk={tk} label="Degree / class" value={e.degree} onChange={(v) => patchList('education', e.id, { degree: v })} placeholder="B.Tech / Class XII (CBSE)" />
                  <Field tk={tk} label="Field / stream" value={e.field} onChange={(v) => patchList('education', e.id, { field: v })} placeholder="Computer Science" />
                  <Field tk={tk} label="College / school" value={e.institution} onChange={(v) => patchList('education', e.id, { institution: v })} />
                  <Field tk={tk} label="Years" value={e.year} onChange={(v) => patchList('education', e.id, { year: v })} placeholder="2021 – 2025" />
                  <Field tk={tk} label="CGPA / percentage" value={e.gpa} onChange={(v) => patchList('education', e.id, { gpa: v })} placeholder="8.2 or 88%" />
                </div>
                <div><Btn tk={tk} kind="danger" small onClick={() => removeFrom('education', e.id)}>Remove</Btn></div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn tk={tk} kind="plain" small onClick={() => setData((d) => ({ ...d, education: [...d.education, blankEdu()] }))}>+ Degree</Btn>
              <Btn tk={tk} kind="plain" small onClick={() => setData((d) => ({ ...d, education: [...d.education, blankEdu('Class XII')] }))}>+ Class XII</Btn>
              <Btn tk={tk} kind="plain" small onClick={() => setData((d) => ({ ...d, education: [...d.education, blankEdu('Class X')] }))}>+ Class X</Btn>
            </div>
          </>
        )}

        {cur === 'experience' && (
          <>
            <Label tk={tk}>{profile === 'fresher' ? 'Internships & training (optional)' : 'Work experience'}</Label>
            {profile === 'fresher' && data.experience.length === 0 && (
              <Notice tk={tk} kind="info">No experience yet? That’s fine — skip this step. Your projects and skills will lead the resume.</Notice>
            )}
            {data.experience.map((e) => (
              <div key={e.id} style={box}>
                <div style={g2}>
                  <Field tk={tk} label="Job title" value={e.title} onChange={(v) => patchList('experience', e.id, { title: v })} />
                  <Field tk={tk} label="Company" value={e.company} onChange={(v) => patchList('experience', e.id, { company: v })} />
                  <Field tk={tk} label="Start" value={e.startDate} onChange={(v) => patchList('experience', e.id, { startDate: v })} placeholder="Jun 2024" />
                  {!e.current && <Field tk={tk} label="End" value={e.endDate} onChange={(v) => patchList('experience', e.id, { endDate: v })} placeholder="Aug 2024" />}
                </div>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: tk.sans, fontSize: '0.82rem', color: tk.sub, cursor: 'pointer' }}>
                  <input type="checkbox" checked={e.current} onChange={(ev) => patchList('experience', e.id, { current: ev.target.checked })} /> I currently work here
                </label>
                <Field tk={tk} multiline rows={5} label="What you did — one line each" value={e.bullets} onChange={(v) => patchList('experience', e.id, { bullets: v })}
                  placeholder={'Built a dashboard in React for the sales team\nWrote unit tests with Jest\nReduced report time by 40%'} hint="Include real numbers when you have them. Never invent any — we won’t either." />
                <div><Btn tk={tk} kind="danger" small onClick={() => removeFrom('experience', e.id)}>Remove</Btn></div>
              </div>
            ))}
            <div><Btn tk={tk} kind="plain" small onClick={() => setData((d) => ({ ...d, experience: [...d.experience, blankExp()] }))}>+ Add {profile === 'fresher' ? 'internship / training' : 'job'}</Btn></div>
          </>
        )}

        {cur === 'skills' && (
          <>
            <Label tk={tk}>Skills</Label>
            <Field tk={tk} label="Technical skills *" value={data.techSkills} onChange={(v) => set('techSkills', v)} placeholder="Python, Java, React, SQL, Machine Learning" hint="Use exact tool names — ATS matches them literally." />
            <Field tk={tk} label="Tools & platforms" value={data.tools} onChange={(v) => set('tools', v)} placeholder="Git, Docker, VS Code, AWS, Figma" />
            <Field tk={tk} label="Soft skills (optional)" value={data.softSkills} onChange={(v) => set('softSkills', v)} placeholder="Communication, Leadership" />
            <div style={{ borderTop: `1px solid ${tk.line}`, paddingTop: 14, display: 'grid', gap: 12 }}>
              <Label tk={tk}>Projects</Label>
              {data.projects.map((p) => (
                <div key={p.id} style={box}>
                  <div style={g2}>
                    <Field tk={tk} label="Project name" value={p.name} onChange={(v) => patchList('projects', p.id, { name: v })} />
                    <Field tk={tk} label="Tech used" value={p.tech} onChange={(v) => patchList('projects', p.id, { tech: v })} placeholder="Python, Flask, MySQL" />
                  </div>
                  <Field tk={tk} multiline rows={3} label="What it does & the result" value={p.description} onChange={(v) => patchList('projects', p.id, { description: v })} placeholder="Face-recognition attendance system serving 500 requests/day" />
                  <div><Btn tk={tk} kind="danger" small onClick={() => removeFrom('projects', p.id)}>Remove</Btn></div>
                </div>
              ))}
              <div><Btn tk={tk} kind="plain" small onClick={() => setData((d) => ({ ...d, projects: [...d.projects, blankProj()] }))}>+ Add project</Btn></div>
            </div>
          </>
        )}

        {cur === 'extras' && (
          <>
            <Label tk={tk}>Extras (all optional)</Label>
            <Field tk={tk} multiline rows={3} label="Summary / objective" value={data.summary} onChange={(v) => set('summary', v)} hint="Leave blank and we’ll write one from your details." />
            <Field tk={tk} multiline rows={3} label="Certifications (one per line)" value={data.certs} onChange={(v) => set('certs', v)} />
            <Field tk={tk} multiline rows={3} label="Achievements & awards (one per line)" value={data.achievements} onChange={(v) => set('achievements', v)} />
            {(profile === 'academic' || showPubs || data.publications.trim()) && <Field tk={tk} multiline rows={4} label="Publications / books / patents (one per line)" value={data.publications} onChange={(v) => set('publications', v)} />}
            {profile !== 'academic' && !showPubs && !data.publications.trim() && <div><Btn tk={tk} kind="plain" small onClick={() => setShowPubs(true)}>+ Add publications</Btn></div>}
            <Field tk={tk} label="Languages" value={data.languages} onChange={(v) => set('languages', v)} placeholder="English, Hindi" />
          </>
        )}

        {cur === 'review' && (
          <>
            <Label tk={tk}>Review & build</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Chip tk={tk}>{profile === 'fresher' ? 'Fresher layout' : profile === 'academic' ? 'Academic layout' : 'Experienced layout'}</Chip>
              {data.target && <Chip tk={tk} color={tk.info}>{data.target}</Chip>}
              {jd.trim().length > 40 && <Chip tk={tk} color={tk.good}>Tailored to job description</Chip>}
              <Chip tk={tk} color={tk.mute}>{polish === 'strong' ? 'Strong rewrite' : 'Light polish'}</Chip>
            </div>
            {strength && (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <ScoreRing tk={tk} score={strength.det.overall} size={96} label="draft strength" />
                <div style={{ flex: 1, minWidth: 200, fontFamily: tk.sans, fontSize: '0.84rem', color: tk.sub, lineHeight: 1.55 }}>
                  Here’s how your answers score before AI touches them. The biggest wins:
                  <Notes tk={tk} notes={strength.det.categories.flatMap((c) => c.notes).filter((n) => n.type === 'bad' || n.type === 'warn').slice(0, 4)} />
                </div>
              </div>
            )}
            {!canBuild && <Notice tk={tk} kind="warn">Add at least your name plus one education, experience or project entry.</Notice>}
            <PrivacyLine tk={tk}>Your answers are saved only in this browser so you can come back, and are sent to our AI provider to write the resume. ZeroAPI does not store them.</PrivacyLine>
          </>
        )}

        {error && <Notice tk={tk} kind="bad">{error}</Notice>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Btn tk={tk} kind="plain" onClick={back} disabled={step === 0 || phase === 'working'}>← Back</Btn>
          {cur === 'review'
            ? <Btn tk={tk} onClick={build} disabled={!canBuild || phase === 'working'} style={{ flex: 1 }}>{phase === 'working' ? <><Spinner /> Writing your resume…</> : '✨ Build my resume'}</Btn>
            : <Btn tk={tk} onClick={next} style={{ flex: 1 }}>{cur === 'experience' && profile === 'fresher' && data.experience.length === 0 ? 'Skip →' : 'Next →'}</Btn>}
        </div>
      </Card>

      {hasContent(data) && (
        <div style={{ textAlign: 'center' }}>
          <button type="button" onClick={startOver} style={{ background: 'none', border: 'none', color: tk.mute, fontFamily: tk.sans, fontSize: '0.76rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear everything and start over</button>
        </div>
      )}
    </div>
  );
}
