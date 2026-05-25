// src/components/TriviaSection.jsx
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL } from '../constants';
import { fireConfetti, fetchWithBackoff } from '../utils';

export default function TriviaSection() {
  const { theme } = useTheme();
  const [trivia,     setTrivia]     = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [shared,     setShared]     = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('zeroapi_trivia_score');
    return saved ? JSON.parse(saved) : { score: 0, total: 0 };
  });
  const MAX_RETRIES = 3;

  const topics = useMemo(() => [
    'history of artificial intelligence and its pioneers',
    'large language models and transformer architecture',
    'computer vision and image recognition breakthroughs',
    'reinforcement learning and famous RL milestones',
    'famous AI researchers and their contributions',
    'natural language processing techniques',
    'AI ethics and bias in machine learning',
    'robotics and autonomous systems',
    'neural network architectures like CNN, RNN, LSTM',
    'AI applications in healthcare and medicine',
    'generative AI and diffusion models',
    'AI in gaming — AlphaGo, AlphaStar, OpenAI Five',
    'Python libraries for machine learning',
    'data science and statistics fundamentals',
    'AI safety and alignment research',
    'famous AI failures and lessons learned',
    'quantum computing and AI',
    'edge AI and on-device machine learning',
    'multimodal AI models',
    'AI regulation and global policies',
  ], []);

  useEffect(() => {
    localStorage.setItem('zeroapi_trivia_score', JSON.stringify(score));
  }, [score]);

  async function loadTrivia() {
    setLoading(true); setSelected(null); setTrivia(null);
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const seed  = Math.floor(Math.random() * 10000);
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', max_tokens: 300, temperature: 1.2,
          messages: [
            { role: 'system', content: `Generate a single AI/tech trivia question. Respond ONLY in this exact JSON format with no extra text:\n{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","fact":"one interesting sentence about the answer"}` },
            { role: 'user',   content: `Generate a UNIQUE trivia question (seed:${seed}) specifically about: ${topic}. Make it different from common questions.` },
          ],
        }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      let parsed;
      try {
        const clean = text.replace(/```json\s*|\s*```/g, '').trim();
        parsed = JSON.parse(clean);
        if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length !== 4) throw new Error('Invalid');
      } catch {
        if (retryCount < MAX_RETRIES) { setRetryCount(c => c + 1); setLoading(false); loadTrivia(); return; }
        parsed = { error: true };
      }
      setTrivia(parsed); setRetryCount(0);
    } catch (e) {
      // fetchWithBackoff already retried on 429 — show error directly
      setTrivia({ error: true }); setRetryCount(0);
    }
    setLoading(false);
  }

  useEffect(() => { loadTrivia(); }, []);

  function handleAnswer(opt) {
    if (selected || !trivia || trivia.error) return;
    setSelected(opt);
    if (opt.startsWith(trivia.answer)) {
      setScore(s => ({ ...s, score: s.score + 1, total: s.total + 1 }));
      fireConfetti();
    } else {
      setScore(s => ({ ...s, total: s.total + 1 }));
    }
  }

  function shareScore() {
    const text = `I scored ${score.score}/${score.total} on ZeroAPI AI Trivia!\nTest your AI knowledge for free → zeroapi.in`;
    navigator.clipboard.writeText(text).then(() => { setShared(true); setTimeout(() => setShared(false), 2500); });
  }

  const isDark    = theme === 'dark';
  const ac        = 'var(--accent)';
  const isCorrect = selected && trivia && !trivia.error && selected.startsWith(trivia.answer);

  return (
    <section className="trivia-section" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}`, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}`, padding: '60px 32px', background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.02)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase' }}>◆ Daily AI Trivia</div>
          {score.total > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', background: 'rgba(0,255,224,0.1)', border: `1px solid ${ac}33`, borderRadius: '100px', padding: '3px 12px', color: ac }}>Score: {score.score}/{score.total}</div>
              <button onClick={shareScore} className="share-score-btn" aria-label="Copy score">{shared ? 'Copied!' : 'Share Score'}</button>
            </div>
          )}
        </div>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.5)', fontSize: '0.8rem', marginBottom: '28px', fontFamily: "'Space Mono', monospace" }}>Test your AI knowledge — new question every time</p>
        {loading && <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)', fontFamily: "'Space Mono', monospace", fontSize: '0.85rem' }}><span className="spinner" style={{ marginRight: '10px' }} />Generating question...</div>}
        {trivia && !trivia.error && !loading && (
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', marginBottom: '24px', lineHeight: 1.5 }}>{trivia.question}</div>
            <div className="trivia-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {trivia.options.map((opt) => {
                const isThis = selected === opt, correct = opt.startsWith(trivia.answer);
                let bg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
                let border = `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`;
                let color = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
                if (selected) {
                  if (correct)      { bg = 'rgba(0,255,224,0.12)'; border = `1px solid ${ac}`; color = ac; }
                  else if (isThis)  { bg = 'rgba(255,80,80,0.1)';  border = '1px solid #ff6b6b'; color = '#ff6b6b'; }
                }
                return <button key={opt} onClick={() => handleAnswer(opt)} style={{ background: bg, border, borderRadius: '10px', padding: '14px 16px', color, fontSize: '0.85rem', cursor: selected ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left', transition: 'all 0.2s' }}>{opt}</button>;
              })}
            </div>
            {selected && (
              <div style={{ background: isCorrect ? 'rgba(0,255,224,0.06)' : 'rgba(255,180,0,0.06)', border: `1px solid ${isCorrect ? `${ac}33` : 'rgba(255,180,0,0.2)'}`, borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)', lineHeight: 1.7 }}>
                {isCorrect ? 'Correct! ' : `Not quite. Answer: ${trivia.answer}. `}{trivia.fact}
              </div>
            )}
            <button onClick={loadTrivia} className="new-question-btn">↻ New Question</button>
          </div>
        )}
        {trivia?.error && !loading && (
          <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)', fontSize: '0.85rem' }}>
            Couldn&apos;t load trivia. <button onClick={loadTrivia} className="text-link">Try again</button>
          </div>
        )}
      </div>
    </section>
  );
}
