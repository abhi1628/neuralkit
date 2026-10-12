// src/components/ResumeBuilder.jsx
// Rebuilds a resume from the user's own text + the structured analysis.
// Truthful by construction: grounding check, verified "what changed", placeholders instead of invented numbers.

import { useState, useMemo, useEffect, useRef } from 'react';
import { TOOL_MODELS } from '../constants';
import { trackEvent } from '../utils';
import {
  buildFromTextMessages, generateResume, normalizeResume, resumeToText, computeDeterministic, inferProfile,
} from '../resumeCore';
import { useTk, Card, Btn, Label, Notice, Spinner, Chip, ScoreRing, ResumeWorkspace, WhatChanged } from './ResumeShared';

export default function ResumeBuilder({ sourceText, analysis, jd = '', role = '', beforeScore, onResume, originalText }) {
  const tk = useTk();
  const source = sourceText || originalText || '';
  const issues = analysis?.llm?.issues || [];
  const profile = analysis?.sig?.profile || 'experienced';

  const [phase, setPhase] = useState('setup'); // setup | working | done | error
  const [polish, setPolish] = useState('strong');
  const [placeholders, setPlaceholders] = useState(true);
  const [error, setError] = useState('');
  const [resume, setResume] = useState(null);
  const [changes, setChanges] = useState([]);
  const [droppedChanges, setDroppedChanges] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const topRef = useRef(null);

  // keep the parent (cover letter) in sync with edits
  useEffect(() => { if (resume && onResume) onResume(normalizeResume(resume)); }, [resume]); // eslint-disable-line react-hooks/exhaustive-deps

  const afterScore = useMemo(() => {
    if (!resume) return null;
    return computeDeterministic(resumeToText(normalizeResume(resume)), { jd }).det;
  }, [resume, jd]);

  const build = async () => {
    setPhase('working'); setError('');
    try {
      const messages = buildFromTextMessages({
        text: source,
        issues,
        opts: { polish, placeholders, profile, role, jd },
      });
      const out = await generateResume({ messages, sourceText: source, model: TOOL_MODELS.resumeBuilder, toolId: 'resume-builder' });
      setResume(out.resume); setChanges(out.changes); setDroppedChanges(out.droppedChanges); setTruncated(out.truncated);
      setPhase('done');
      trackEvent('resume_built', { polish, has_jd: !!jd });
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch (e) {
      setError(e.message || 'Could not build the resume. Please try again.');
      setPhase('error');
    }
  };

  // plain render helper (not a component) so it never remounts
  const choice = ({ active, onClick, title, desc }) => (
    <button key={title} type="button" onClick={onClick} aria-pressed={active} style={{
      textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: active ? tk.acSoft : tk.soft,
      border: `1px solid ${active ? tk.ac : tk.line}`, color: tk.text, flex: '1 1 220px',
    }}>
      <div style={{ fontFamily: tk.sans, fontWeight: 700, fontSize: '0.88rem' }}>{title}</div>
      <div style={{ fontFamily: tk.sans, fontSize: '0.76rem', color: tk.mute, marginTop: 3, lineHeight: 1.45 }}>{desc}</div>
    </button>
  );

  return (
    <div ref={topRef} style={{ display: 'grid', gap: 14, scrollMarginTop: 80 }}>
      <Card tk={tk} style={{ display: 'grid', gap: 12 }}>
        <Label tk={tk}>Improved resume</Label>

        {(phase === 'setup' || phase === 'error') && (
          <>
            <div style={{ fontFamily: tk.sans, fontSize: '0.9rem', color: tk.sub, lineHeight: 1.6 }}>
              We’ll rebuild your resume using {issues.length ? `the ${issues.length} fixes from your review` : 'your resume'}{jd ? ' and tailor it to the job description' : ''}.
              Your employers, dates, degrees and numbers stay exactly as written.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {choice({ active: polish === 'strong', onClick: () => setPolish('strong'), title: 'Strong rewrite', desc: 'Sharper verbs, tighter bullets, a better summary.' })}
              {choice({ active: polish === 'light', onClick: () => setPolish('light'), title: 'Light polish', desc: 'Keep my wording; fix grammar, tense and structure.' })}
            </div>
            {polish === 'strong' && (
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontFamily: tk.sans, fontSize: '0.82rem', color: tk.sub, cursor: 'pointer', lineHeight: 1.5 }}>
                <input type="checkbox" checked={placeholders} onChange={(e) => setPlaceholders(e.target.checked)} style={{ marginTop: 3 }} />
                <span>Mark where a number would help with a placeholder like <b>[add %]</b>, so you can fill in the real figure. (We never make numbers up.)</span>
              </label>
            )}
            {error && <Notice tk={tk} kind="bad">{error}</Notice>}
            <Btn tk={tk} onClick={build} full>{phase === 'error' ? 'Try again' : '✨ Build my improved resume'}</Btn>
          </>
        )}

        {phase === 'working' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: tk.sans, color: tk.sub, fontSize: '0.9rem' }}>
            <Spinner /> Rewriting your resume… this takes 15–30 seconds.
          </div>
        )}

        {phase === 'done' && afterScore && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {beforeScore != null && <><ScoreRing tk={tk} score={beforeScore} size={84} label="before" /><span style={{ fontFamily: tk.mono, color: tk.mute }}>→</span></>}
              <ScoreRing tk={tk} score={afterScore.overall} size={104} label="now" />
            </div>
            <div style={{ flex: 1, minWidth: 200, fontFamily: tk.sans, fontSize: '0.86rem', color: tk.sub, lineHeight: 1.6 }}>
              {beforeScore != null && afterScore.overall > beforeScore
                ? <>Up <b style={{ color: tk.good }}>{afterScore.overall - beforeScore} points</b> on the same fixed scoring rules.</>
                : 'Re-scored with the same fixed rules as your review.'}
              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Chip tk={tk} color={tk.good}>{profile === 'fresher' ? 'Fresher layout' : profile === 'academic' ? 'Academic layout' : 'Experienced layout'}</Chip>
              </div>
            </div>
          </div>
        )}
      </Card>

      {phase === 'done' && resume && (
        <>
          {truncated && <Notice tk={tk} kind="warn">The AI hit its length limit, so the end of your resume may be missing. Check every section, or rebuild with “Light polish”.</Notice>}
          <WhatChanged changes={changes} droppedChanges={droppedChanges} />
          <ResumeWorkspace
            resume={resume} onChange={setResume} model={TOOL_MODELS.coverLetter}
            role={role} jd={jd} sourceText={source} profile={profile || inferProfile(resume)}
          />
          <div><Btn tk={tk} kind="plain" small onClick={() => { setPhase('setup'); setResume(null); }}>↺ Rebuild with different options</Btn></div>
        </>
      )}
    </div>
  );
}
