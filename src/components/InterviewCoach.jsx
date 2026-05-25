// src/components/InterviewCoach.jsx
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, INTERVIEW_ROLES, INTERVIEW_LEVELS } from '../constants';
import { fetchWithBackoff } from '../utils';

export default function InterviewCoach() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  const [step,      setStep]      = useState('setup');
  const [role,      setRole]      = useState(INTERVIEW_ROLES[0]);
  const [level,     setLevel]     = useState(INTERVIEW_LEVELS[0]);
  const [qNum,      setQNum]      = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answer,    setAnswer]    = useState('');
  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [timeLeft,  setTimeLeft]  = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const topRef   = useRef(null);
  const TOTAL_Q  = 7;

  useEffect(() => {
    if (timerActive && timeLeft > 0) { timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000); }
    else if (timeLeft === 0)         { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [step]);

  async function startInterview() {
    setLoading(true); setError('');
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', max_tokens: 600,
          messages: [
            { role: 'system', content: `You are a technical interviewer. Generate exactly ${TOTAL_Q} interview questions for a ${level} ${role} position. Return ONLY a JSON array of strings — no numbering, no preamble, no markdown. Example: ["Question one?","Question two?"]` },
            { role: 'user',   content: `Generate ${TOTAL_Q} varied interview questions covering technical knowledge, problem solving, and situational scenarios for ${level} ${role}.` },
          ],
        }),
      });
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content || '[]';
      const qs = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setQuestions(qs); setQNum(0); setResults([]); setAnswer('');
      setTimeLeft(120); setTimerActive(true); setStep('interview');
    } catch (e) { setError(e.message || 'Failed to load questions. Please try again.'); }
    setLoading(false);
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setTimerActive(false); clearInterval(timerRef.current);
    setLoading(true);
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', max_tokens: 400,
          messages: [
            { role: 'system', content: `You are a senior technical interviewer evaluating a ${level} ${role} candidate. Respond ONLY with valid JSON: {"score":7,"feedback":"...","strength":"...","improvement":"..."}. Score is 1-10. Keep feedback under 60 words.` },
            { role: 'user',   content: `Question: ${questions[qNum]}\n\nCandidate answer: ${answer}\n\nTime taken: ${120 - timeLeft} seconds of 120.` },
          ],
        }),
      });
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content || '{}';
      const eval_ = JSON.parse(raw.replace(/```json|```/g, '').trim());
      const newResult = { q: questions[qNum], a: answer, score: eval_.score || 5, feedback: eval_.feedback || '', strength: eval_.strength || '', improvement: eval_.improvement || '', time: 120 - timeLeft };
      setResults(prev => [...prev, newResult]);
      if (qNum + 1 >= questions.length) { setStep('report'); }
      else { setQNum(q => q + 1); setAnswer(''); setTimeLeft(120); setTimerActive(true); }
    } catch (e) { setError(e.message || 'Evaluation failed. Skipping.'); setQNum(q => q + 1); setAnswer(''); setTimeLeft(120); setTimerActive(true); }
    setLoading(false);
  }

  function skipQuestion() {
    setTimerActive(false); clearInterval(timerRef.current);
    const skipped = { q: questions[qNum], a: '(Skipped)', score: 0, feedback: 'Question was skipped.', strength: '—', improvement: 'Attempt all questions.', time: 120 - timeLeft };
    setResults(prev => [...prev, skipped]);
    if (qNum + 1 >= questions.length) setStep('report');
    else { setQNum(q => q + 1); setAnswer(''); setTimeLeft(120); setTimerActive(true); }
  }

  const timerColor = timeLeft <= 30 ? '#ff6b6b' : timeLeft <= 60 ? (isDark ? '#febc2e' : '#d97706') : ac;
  const mins = Math.floor(timeLeft / 60), secs = timeLeft % 60;

  if (step === 'report') {
    const avg = (results.reduce((a, r) => a + r.score, 0) / results.length).toFixed(1);
    const grade = avg >= 8 ? { label: 'Excellent', color: '#a78bfa' } : avg >= 6 ? { label: 'Good', color: '#34d399' } : avg >= 4 ? { label: 'Average', color: '#febc2e' } : { label: 'Needs Work', color: '#ff6b6b' };
    return (
      <div ref={topRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: ac, marginBottom: '8px' }}>◆ INTERVIEW COMPLETE</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: "'Syne',sans-serif", color: grade.color }}>{avg}<span style={{ fontSize: '1.2rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>/10</span></div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.85rem', color: grade.color, marginBottom: '4px' }}>{grade.label}</div>
          <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}>{role} · {level}</div>
        </div>
        {results.map((r, i) => {
          const sc = r.score >= 7 ? '#a78bfa' : r.score >= 5 ? '#febc2e' : '#ff6b6b';
          return (
            <div key={i} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '10px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isDark ? '#fff' : '#1a1a1a', lineHeight: 1.5 }}>Q{i+1}. {r.q}</div>
                <div style={{ background: `${sc}20`, border: `1px solid ${sc}`, borderRadius: '8px', padding: '3px 12px', fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: sc, flexShrink: 0, fontWeight: 700 }}>{r.score}/10</div>
              </div>
              <div style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.6)', marginBottom: '8px', fontStyle: 'italic' }}>"{r.a}"</div>
              <div style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', marginBottom: '6px' }}>📝 {r.feedback}</div>
              {r.strength !== '—' && <div style={{ fontSize: '0.78rem', color: '#34d399' }}>✓ {r.strength}</div>}
              <div style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '4px' }}>↑ {r.improvement}</div>
              <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)', marginTop: '8px', fontFamily: "'Space Mono',monospace" }}>⏱ {r.time}s</div>
            </div>
          );
        })}
        {error && <div className="error-box">⚠ {error}</div>}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { setStep('setup'); setResults([]); setQuestions([]); setQNum(0); setAnswer(''); setError(''); }} className="action-btn" style={{ color: ac, borderColor: ac }}>↺ New Interview</button>
        </div>
      </div>
    );
  }

  if (step === 'interview') return (
    <div ref={topRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: ac }}>QUESTION {qNum + 1} OF {questions.length} · {role}</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.9rem', color: timerColor, fontWeight: 700 }}>⏱ {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>
      </div>
      <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: '2px' }}>
        <div style={{ width: `${((qNum + 1) / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa, #818cf8)', borderRadius: '2px', transition: 'width 0.4s' }} />
      </div>
      <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: ac, marginBottom: '10px' }}>◆ INTERVIEWER ASKS</div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a', lineHeight: 1.6 }}>{questions[qNum]}</div>
      </div>
      <div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', marginBottom: '8px' }}>YOUR ANSWER</div>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer here..." rows={5} className="tool-textarea" />
      </div>
      {error && <div className="error-box">⚠ {error}</div>}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={submitAnswer} disabled={loading || !answer.trim()} className={`run-btn ${loading || !answer.trim() ? 'run-btn-disabled' : ''}`} style={{ flex: '1' }}>
          {loading ? <><span className="spinner" />Evaluating...</> : 'Submit Answer →'}
        </button>
        <button onClick={skipQuestion} disabled={loading} className="action-btn">Skip</button>
      </div>
    </div>
  );

  // Setup screen
  return (
    <div ref={topRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: ac, marginBottom: '10px' }}>SELECT ROLE</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {INTERVIEW_ROLES.map(r => (
            <button key={r} onClick={() => setRole(r)} style={{ background: role === r ? ac : 'transparent', border: `1px solid ${role === r ? ac : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '8px', padding: '6px 14px', color: role === r ? '#000' : isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: role === r ? 700 : 400, transition: 'all 0.2s' }}>{r}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: ac, marginBottom: '10px' }}>EXPERIENCE LEVEL</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {INTERVIEW_LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)} style={{ background: level === l ? ac : 'transparent', border: `1px solid ${level === l ? ac : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '8px', padding: '6px 14px', color: level === l ? '#000' : isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: level === l ? 700 : 400 }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ background: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.04)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.15)'}`, borderRadius: '12px', padding: '16px' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: ac, marginBottom: '8px' }}>◆ WHAT TO EXPECT</div>
        {[`${TOTAL_Q} questions tailored to ${role}`, '2 minutes per question with countdown timer', 'AI scores each answer and gives detailed feedback', 'Final report card with improvement tips'].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span style={{ color: ac, fontSize: '0.72rem', flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }}>{item}</span>
          </div>
        ))}
      </div>
      {error && <div className="error-box">⚠ {error}</div>}
      <button onClick={startInterview} disabled={loading} className={`run-btn ${loading ? 'run-btn-disabled' : ''}`}>
        {loading ? <><span className="spinner" />Preparing questions...</> : `🎤 Start ${role} Interview →`}
      </button>
    </div>
  );
}
