// src/components/ResumeAnalyzer.jsx
// Evidence-based resume review:
//   instant, deterministic ATS measurements  +  AI review whose every claim is quote-verified.
// Flows into ResumeBuilder (fix & rebuild) and CoverLetterGenerator.

import { useState, useRef, useEffect, useMemo } from 'react';
import { TOOL_MODELS } from '../constants';
import { trackEvent } from '../utils';
import {
  extractDocument, analyzeResume, computeDeterministic, blendScore, scoreLabel, analysisToText, copyTo, cleanResumeText, dispatchRun,
} from '../resumeCore';
import {
  useTk, Card, Btn, Chip, Label, Field, Notice, Spinner, ScoreRing, Bar, Notes, PrivacyLine, sevColor,
} from './ResumeShared';
import ResumeBuilder from './ResumeBuilder';
import CoverLetterGenerator from './CoverLetterGenerator';

const SESSION_KEY = 'zeroapi:resume-analysis:v2';
const MAX_FILE_MB = 8;

function saveSession(v) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)); } catch { /* ignore */ } }
function loadSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
function clearSession() { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } }

export default function ResumeAnalyzer() {
  const tk = useTk();
  const fileRef = useRef(null);
  const resultsRef = useRef(null);

  const [mode, setMode] = useState('upload'); // upload | paste
  const [file, setFile] = useState(null);
  const [pasted, setPasted] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [showJd, setShowJd] = useState(false);
  const [drag, setDrag] = useState(false);

  const [stage, setStage] = useState('idle'); // idle | reading | analyzing | done
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [base, setBase] = useState(null);     // deterministic part (instant)
  const [result, setResult] = useState(null); // full (with AI)
  const [aiFailed, setAiFailed] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Restore a previous analysis after a refresh (same tab only)
  useEffect(() => {
    const s = loadSession();
    if (!s?.text) return;
    try {
      const det = computeDeterministic(s.text, { jd: s.jd || '', multiColumn: !!s.multiColumn });
      setText(s.text); setJd(s.jd || ''); setRole(s.role || ''); setShowJd(!!s.jd);
      setFileInfo(s.fileInfo || null); setBase(det);
      if (s.llm) {
        const overall = blendScore(det.det.overall, s.llm.quality);
        setResult({ ...det, llm: s.llm, overall, label: scoreLabel(overall) });
      }
      setStage('done');
    } catch { /* ignore corrupt session */ }
  }, []);

  const busy = stage === 'reading' || stage === 'analyzing';

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) { setError(`That file is over ${MAX_FILE_MB} MB. Please upload a smaller resume.`); return; }
    setError(''); setFile(f);
  };

  const reset = () => {
    setStage('idle'); setError(''); setText(''); setFile(null); setPasted(''); setFileInfo(null); setBase(null); setResult(null);
    setAiFailed(''); setBuilderOpen(false); setResumeData(null); clearSession();
    if (fileRef.current) fileRef.current.value = '';
  };

  const run = async () => {
    setError(''); setAiFailed(''); setResult(null); setBase(null); setBuilderOpen(false); setResumeData(null);
    let src = ''; let info = null;
    try {
      setStage('reading');
      if (mode === 'upload') {
        if (!file) { setError('Choose your resume file first — or switch to “Paste text”.'); setStage('idle'); return; }
        const doc = await extractDocument(file);
        src = doc.text;
        info = { name: file.name, kind: doc.kind, pages: doc.pages.length, warnings: doc.warnings, multiColumn: doc.multiColumn };
      } else {
        src = cleanResumeText(pasted);
        info = { name: 'Pasted text', kind: 'txt', pages: 1, warnings: [], multiColumn: false };
      }
      if (src.replace(/\s/g, '').length < 200) { setError('That is too short to review. A resume usually has at least a few lines per section.'); setStage('idle'); return; }

      setText(src); setFileInfo(info);
      setStage('analyzing');
      trackEvent('tool_run', { tool_name: 'Analyze Resume' });
      dispatchRun('resume-analyzer');

      let latestBase = null;
      const full = await analyzeResume({
        text: src, jd, role, model: TOOL_MODELS.resumeAnalyzer, multiColumn: info.multiColumn,
        onDeterministic: (b) => {
          latestBase = b;
          setBase(b);
          setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
        },
      }).catch((e) => { e.partial = latestBase; throw e; });

      setResult(full);
      setStage('done');
      saveSession({ text: src, jd, role, llm: full.llm, multiColumn: info.multiColumn, fileInfo: info });
      trackEvent('resume_analyze_done', { score: full.overall });
    } catch (e) {
      if (e.partial) {
        // Keep the instant results; only the AI review failed
        setAiFailed(e.message || 'The AI review failed.');
        setStage('done');
        saveSession({ text: src, jd, role, llm: null, multiColumn: info?.multiColumn, fileInfo: info });
      } else {
        setError(e.message || 'Something went wrong reading that file.');
        setStage('idle');
      }
    }
  };

  const retryAi = async () => {
    setAiFailed(''); setStage('analyzing');
    try {
      const full = await analyzeResume({ text, jd, role, model: TOOL_MODELS.resumeAnalyzer, multiColumn: !!fileInfo?.multiColumn });
      setResult(full); setStage('done');
      saveSession({ text, jd, role, llm: full.llm, multiColumn: fileInfo?.multiColumn, fileInfo });
    } catch (e) { setAiFailed(e.message || 'The AI review failed.'); setStage('done'); }
  };

  const shown = result || base;       // what we can show right now
  const det = shown?.det;
  const overall = result ? result.overall : det?.overall;
  const llm = result?.llm;
  const jdMatch = shown?.jdMatch;
  const hasJd = jd.trim().length >= 40;

  const copyReport = async () => {
    if (!result) return;
    setCopied(await copyTo(analysisToText(result, role)));
    setTimeout(() => setCopied(false), 2000);
  };

  const topFixes = useMemo(() => (llm?.issues || []).filter((i) => i.severity === 'high').length, [llm]);

  /* ─────────── input card ─────────── */
  const inputCard = (
    <Card tk={tk} style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }} role="tablist">
        {[['upload', '📄 Upload file'], ['paste', '✎ Paste text']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={mode === k} type="button" disabled={busy} onClick={() => setMode(k)} style={{
            flex: 1, padding: '10px', cursor: 'pointer', fontFamily: tk.mono, fontSize: '0.74rem', borderRadius: 10,
            background: mode === k ? tk.acSoft : 'transparent', color: mode === k ? tk.ac : tk.sub, border: `1px solid ${mode === k ? tk.ac : tk.line}`,
          }}>{l}</button>
        ))}
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files?.[0]); }}
          onClick={() => !busy && fileRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
          style={{
            border: `2px dashed ${drag ? tk.ac : tk.inputLine}`, background: drag ? tk.acSoft : tk.soft, borderRadius: 14, padding: '26px 16px',
            textAlign: 'center', cursor: busy ? 'default' : 'pointer', transition: 'all .15s',
          }}
        >
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,application/pdf" style={{ display: 'none' }} onChange={(e) => pickFile(e.target.files?.[0])} />
          <div style={{ fontSize: '1.7rem' }}>{file ? '✅' : '📄'}</div>
          <div style={{ fontFamily: tk.sans, fontWeight: 700, color: tk.text, marginTop: 6, wordBreak: 'break-word' }}>{file ? file.name : 'Tap to choose your resume'}</div>
          <div style={{ fontFamily: tk.sans, fontSize: '0.78rem', color: tk.mute, marginTop: 4 }}>{file ? `${(file.size / 1024).toFixed(0)} KB · tap to change` : 'PDF or Word (.docx) · up to 8 MB'}</div>
        </div>
      ) : (
        <Field tk={tk} multiline rows={9} value={pasted} onChange={setPasted} placeholder="Paste your resume text here…" />
      )}

      <Field tk={tk} label="Target role (optional)" value={role} onChange={setRole} placeholder="e.g. Software Engineer, Data Analyst" maxLength={120} />

      <div>
        <button type="button" onClick={() => setShowJd(!showJd)} aria-expanded={showJd} style={{ background: 'none', border: 'none', color: tk.ac, fontFamily: tk.mono, fontSize: '0.74rem', cursor: 'pointer', padding: 0 }}>
          {showJd ? '− Hide job description' : '+ Add a job description to get a match score'}
        </button>
        {showJd && <div style={{ marginTop: 8 }}><Field tk={tk} multiline rows={6} value={jd} onChange={setJd} placeholder="Paste the job posting. We’ll show which keywords you cover and which are missing." hint="Only add keywords you can honestly back up." /></div>}
      </div>

      {error && <Notice tk={tk} kind="bad">{error}</Notice>}

      <Btn tk={tk} onClick={run} disabled={busy} full>{busy ? <><Spinner /> {stage === 'reading' ? 'Reading your resume…' : 'Reviewing…'}</> : 'Analyze my resume'}</Btn>
      <PrivacyLine tk={tk} />
    </Card>
  );

  /* ─────────── results ─────────── */
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {stage === 'idle' && inputCard}

      {(stage !== 'idle') && shown && (
        <div ref={resultsRef} style={{ display: 'grid', gap: 16, scrollMarginTop: 80 }}>
          {/* headline */}
          <Card tk={tk} style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <ScoreRing tk={tk} score={overall} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <Label tk={tk}>{fileInfo?.name || 'Resume'} {fileInfo?.pages > 1 ? `· ${fileInfo.pages} pages` : ''}</Label>
              {llm?.verdict
                ? <div style={{ fontFamily: tk.sans, fontSize: '0.95rem', color: tk.text, lineHeight: 1.6 }}>{llm.verdict}</div>
                : <div style={{ fontFamily: tk.sans, fontSize: '0.9rem', color: tk.sub, lineHeight: 1.6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {stage === 'analyzing' ? <><Spinner size={14} /> Instant ATS checks done. The AI review is on its way…</> : 'ATS checks complete.'}
                </div>}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                <Chip tk={tk}>{(llm?.level || shown.sig.level)} level</Chip>
                {(llm?.roles || []).map((r, i) => <Chip key={i} tk={tk} color={tk.info}>{r}</Chip>)}
                {topFixes > 0 && <Chip tk={tk} color={tk.bad}>{topFixes} high-impact fix{topFixes > 1 ? 'es' : ''}</Chip>}
              </div>
            </div>
          </Card>

          {fileInfo?.warnings?.length > 0 && fileInfo.warnings.map((w, i) => <Notice key={i} tk={tk} kind="warn">{w}</Notice>)}
          {aiFailed && (
            <Notice tk={tk} kind="warn" title="The detailed AI review didn’t finish">
              {aiFailed} Your instant checks below are still valid.
              <div style={{ marginTop: 8 }}><Btn tk={tk} kind="ghost" small onClick={retryAi}>Try the AI review again</Btn></div>
            </Notice>
          )}

          {/* categories */}
          <Card tk={tk}>
            <Label tk={tk}>Score breakdown</Label>
            {det.categories.map((c) => (
              <Bar key={c.key} tk={tk} label={c.label} score={c.score} weight={c.weight}>
                <Notes tk={tk} notes={c.notes} />
              </Bar>
            ))}
            <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute, lineHeight: 1.5 }}>
              These scores are measured from your text with fixed rules, so the same resume always scores the same.{llm?.quality != null ? ' The AI’s content-quality rating counts for 20% of the total.' : ''}
            </div>
          </Card>

          {/* JD match */}
          {jdMatch && (
            <Card tk={tk}>
              <Label tk={tk}>Job description match · {jdMatch.score}%</Label>
              {jdMatch.matched.length > 0 && <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: tk.sans, fontSize: '0.8rem', color: tk.sub, marginBottom: 6 }}>You already cover</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{jdMatch.matched.slice(0, 16).map((m) => <Chip key={m.term} tk={tk} color={tk.good}>{m.term}</Chip>)}</div>
              </div>}
              {jdMatch.missing.length > 0 && <div>
                <div style={{ fontFamily: tk.sans, fontSize: '0.8rem', color: tk.sub, marginBottom: 6 }}>Not found in your resume — add only what you truly have</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{jdMatch.missing.map((m) => <Chip key={m.term} tk={tk} color={tk.warn}>{m.term}</Chip>)}</div>
              </div>}
              {llm?.jdFit && (llm.jdFit.summary || llm.jdFit.tips.length > 0) && (
                <div style={{ marginTop: 12, fontFamily: tk.sans, fontSize: '0.86rem', color: tk.sub, lineHeight: 1.6 }}>
                  {llm.jdFit.summary && <div>{llm.jdFit.summary}</div>}
                  {llm.jdFit.tips.length > 0 && <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>{llm.jdFit.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
                </div>
              )}
            </Card>
          )}

          {/* strengths */}
          {llm?.strengths?.length > 0 && (
            <Card tk={tk}>
              <Label tk={tk}>What’s working</Label>
              <div style={{ display: 'grid', gap: 12 }}>
                {llm.strengths.map((s, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${tk.good}`, paddingLeft: 12 }}>
                    <div style={{ fontFamily: tk.sans, fontSize: '0.9rem', color: tk.text }}>{s.point}</div>
                    {s.quote && <div style={{ fontFamily: tk.sans, fontSize: '0.78rem', color: tk.mute, marginTop: 3, fontStyle: 'italic' }}>“{s.quote}”</div>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* issues */}
          {llm?.issues?.length > 0 && (
            <Card tk={tk}>
              <Label tk={tk}>Fixes, highest impact first</Label>
              <div style={{ display: 'grid', gap: 12 }}>
                {llm.issues.map((it, i) => <IssueCard key={i} tk={tk} issue={it} />)}
              </div>
              {llm.dropped > 0 && (
                <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute, marginTop: 12, lineHeight: 1.5 }}>
                  🛡 We hid {llm.dropped} AI comment{llm.dropped > 1 ? 's' : ''} because they quoted text that isn’t in your resume. Every fix above points to your actual words.
                </div>
              )}
            </Card>
          )}

          {(llm?.missingSections?.length > 0 || llm?.keywordSuggestions?.length > 0) && (
            <Card tk={tk}>
              {llm.missingSections.length > 0 && <div style={{ marginBottom: 12 }}>
                <Label tk={tk}>Sections to add</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{llm.missingSections.map((s) => <Chip key={s} tk={tk} color={tk.warn}>{s}</Chip>)}</div>
              </div>}
              {llm.keywordSuggestions.length > 0 && <div>
                <Label tk={tk}>Skills often expected for your target roles</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{llm.keywordSuggestions.map((s) => <Chip key={s} tk={tk} color={tk.info}>{s}</Chip>)}</div>
                <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute, marginTop: 6 }}>Suggestions only — list a skill only if you can discuss it in an interview.</div>
              </div>}
            </Card>
          )}

          {/* actions */}
          {stage === 'done' && (
            <Card tk={tk} style={{ display: 'grid', gap: 10 }}>
              <Label tk={tk}>Next step</Label>
              <div style={{ fontFamily: tk.sans, fontSize: '0.9rem', color: tk.sub, lineHeight: 1.6 }}>
                Build a cleaner version that applies these fixes without inventing anything, then edit it line by line and download it as PDF or Word.
              </div>
              {!builderOpen && <Btn tk={tk} onClick={() => setBuilderOpen(true)} disabled={!result} full>✨ Build my improved resume</Btn>}
              {!result && <div style={{ fontFamily: tk.sans, fontSize: '0.78rem', color: tk.mute }}>Available once the AI review finishes.</div>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn tk={tk} kind="plain" small onClick={copyReport} disabled={!result}>{copied ? '✓ Copied' : '⧉ Copy report'}</Btn>
                <Btn tk={tk} kind="plain" small onClick={reset}>↺ Analyze another resume</Btn>
              </div>
            </Card>
          )}
        </div>
      )}

      {builderOpen && result && (
        <ResumeBuilder
          sourceText={text}
          analysis={result}
          jd={hasJd ? jd : ''}
          role={role}
          beforeScore={result.det.overall}
          onResume={setResumeData}
        />
      )}

      {builderOpen && resumeData && (
        <CoverLetterGenerator resumeData={resumeData} jobDescription={hasJd ? jd : ''} targetRole={role} />
      )}
    </div>
  );
}

function IssueCard({ tk, issue }) {
  const [copied, setCopied] = useState(false);
  const c = sevColor(tk, issue.severity);
  return (
    <div style={{ border: `1px solid ${tk.line}`, borderLeft: `3px solid ${c}`, borderRadius: 12, padding: '12px 14px', display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip tk={tk} color={c}>{issue.severity}</Chip>
        <span style={{ fontFamily: tk.mono, fontSize: '0.68rem', color: tk.mute, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{issue.section}</span>
      </div>
      {issue.quote && <div style={{ fontFamily: tk.sans, fontSize: '0.8rem', color: tk.mute, fontStyle: 'italic', lineHeight: 1.5 }}>“{issue.quote}”</div>}
      <div style={{ fontFamily: tk.sans, fontSize: '0.9rem', color: tk.text, lineHeight: 1.55, fontWeight: 600 }}>{issue.problem}</div>
      {issue.fix && <div style={{ fontFamily: tk.sans, fontSize: '0.86rem', color: tk.sub, lineHeight: 1.55 }}>{issue.fix}</div>}
      {issue.rewrite && (
        <div style={{ background: tk.acSoft, border: `1px solid ${tk.acLine}`, borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontFamily: tk.mono, fontSize: '0.62rem', color: tk.ac, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Suggested rewrite</div>
          <div style={{ fontFamily: tk.sans, fontSize: '0.88rem', color: tk.text, lineHeight: 1.55 }}>{issue.rewrite}</div>
          <div style={{ marginTop: 8 }}>
            <Btn tk={tk} kind="ghost" small onClick={async () => { setCopied(await copyTo(issue.rewrite)); setTimeout(() => setCopied(false), 1800); }}>{copied ? '✓ Copied' : '⧉ Copy'}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
