// src/components/CoverLetterGenerator.jsx
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL } from '../constants';
import { copyToClipboard, downloadAsPDF } from '../utils';

export default function CoverLetterGenerator({ resumeData, jobDescription }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = 'var(--accent)';

  const [step,    setStep]    = useState('input');
  const [jobDesc, setJobDesc] = useState(jobDescription || '');
  const [tone,    setTone]    = useState('professional');
  const [length,  setLength]  = useState('medium');
  const [letter,  setLetter]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [copied,  setCopied]  = useState(false);

  async function generate() {
    if (!jobDesc.trim()) return;
    setLoading(true); setError(''); setLetter('');
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', max_tokens: 1200, temperature: 0.7,
          messages: [
            { role: 'system', content: `You are an expert career coach and cover letter writer.\n\nRULES:\n- Match the applicant's skills from their resume to the job description naturally\n- Use specific achievements and metrics from the resume data\n- Tone: ${tone === 'enthusiastic' ? 'warm, energetic, passionate' : tone === 'formal' ? 'traditional, conservative, corporate' : 'balanced, confident, professional'}\n- Length: ${length === 'short' ? '200-250 words (3 paragraphs)' : length === 'long' ? '400-500 words (5-6 paragraphs)' : '300-350 words (4 paragraphs)'}\n- Start with a hook that references the company/role specifically\n- End with a strong call to action\n- NEVER use generic phrases like "I am writing to apply" or "your job posting on"\n- Use active voice, specific examples, avoid buzzwords` },
            { role: 'user', content: `Resume Data:\n${JSON.stringify(resumeData, null, 2)}\n\nJob Description:\n${jobDesc}\n\nGenerate the cover letter now.` },
          ],
        }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        setLetter(data.choices[0].message.content.replace(/```/g, '').trim());
        setStep('done');
      } else setError('Failed to generate cover letter.');
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  }

  const tones   = [{ id: 'professional', label: 'Professional', desc: 'Balanced & confident' }, { id: 'enthusiastic', label: 'Enthusiastic', desc: 'Warm & passionate' }, { id: 'formal', label: 'Formal', desc: 'Traditional corporate' }];
  const lengths = [{ id: 'short', label: 'Short', desc: '3 paragraphs' }, { id: 'medium', label: 'Medium', desc: '4 paragraphs' }, { id: 'long', label: 'Long', desc: '5-6 paragraphs' }];

  const btnRow = (items, val, setVal) => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {items.map(t => (
        <button key={t.id} onClick={() => setVal(t.id)}
          style={{ background: val === t.id ? ac : 'transparent', border: `1px solid ${val === t.id ? ac : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '8px', padding: '6px 14px', color: val === t.id ? '#000' : isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: val === t.id ? 700 : 400 }}>
          {t.label} <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>({t.desc})</span>
        </button>
      ))}
    </div>
  );

  if (step === 'done' && letter) return (
    <div style={{ marginTop: '20px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`, borderRadius: '14px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em' }}>◆ COVER LETTER READY</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => copyToClipboard(letter, setCopied)} className="action-btn">{copied ? '✓ Copied!' : 'Copy'}</button>
          <button onClick={() => downloadAsPDF(letter, 'cover-letter')} className="action-btn">⬇ PDF</button>
        </div>
      </div>
      <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '10px', padding: '24px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', lineHeight: 1.8, color: isDark ? 'rgba(255,255,255,0.9)' : '#2c3e50', whiteSpace: 'pre-wrap' }}>
        {letter}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
        <button onClick={() => { setStep('input'); setLetter(''); setJobDesc(''); }} className="action-btn" style={{ color: ac, borderColor: ac }}>↺ New Letter</button>
        <button onClick={generate} disabled={loading} className="run-btn" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>
          {loading ? 'Regenerating...' : '↻ Regenerate'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '20px', background: 'rgba(0,255,224,0.04)', border: '1px solid rgba(0,255,224,0.15)', borderRadius: '14px', padding: '20px 24px' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em', marginBottom: '10px' }}>◆ COVER LETTER GENERATOR</div>
      <p style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>Generate a tailored cover letter using your resume and a job description.</p>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: ac, marginBottom: '8px' }}>TONE</div>
        {btnRow(tones, tone, setTone)}
      </div>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: ac, marginBottom: '8px' }}>LENGTH</div>
        {btnRow(lengths, length, setLength)}
      </div>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: ac, marginBottom: '8px' }}>JOB DESCRIPTION *</div>
        <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Paste the job description here..." rows={6} className="tool-textarea" />
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)', marginTop: '4px' }}>{jobDesc.length} / 5,000 words</div>
      </div>
      {error && <div className="error-box" style={{ marginBottom: '12px' }}>⚠ {error}</div>}
      <button onClick={generate} disabled={loading || !jobDesc.trim()}
        style={{ background: loading || !jobDesc.trim() ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #00ffe0, #0af)', border: 'none', borderRadius: '10px', padding: '10px 24px', color: loading || !jobDesc.trim() ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : '#000', fontWeight: 700, fontSize: '0.85rem', cursor: loading || !jobDesc.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' }}>
        {loading ? <><span className="spinner" />Generating...</> : '✨ Generate Cover Letter →'}
      </button>
    </div>
  );
}
