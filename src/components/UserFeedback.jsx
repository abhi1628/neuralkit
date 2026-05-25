// src/components/UserFeedback.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { escapeHtml } from '../utils';

export default function UserFeedback() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac     = isDark ? '#00ffe0' : '#00897b';

  const [name,             setName]             = useState('');
  const [comment,          setComment]          = useState('');
  const [rating,           setRating]           = useState(0);
  const [hoverRating,      setHoverRating]      = useState(0);
  const [submitted,        setSubmitted]        = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [feedbacks,        setFeedbacks]        = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [error,            setError]            = useState('');

  async function fetchFeedbacks() {
    try {
      const r = await fetch('/api/feedback');
      const data = await r.json();
      if (Array.isArray(data)) setFeedbacks(data);
    } catch { /* silent */ }
    setLoadingFeedbacks(false);
  }

  useEffect(() => {
    fetchFeedbacks();
    const interval = setInterval(fetchFeedbacks, 30000);
    return () => clearInterval(interval);
  }, []);

  async function submitFeedback() {
    if (rating === 0) return;
    setSubmitting(true); setError('');
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'Anonymous', rating, message: comment.trim() }),
      });
      const data = await r.json();
      if (r.ok) {
        setSubmitted(true); setName(''); setComment(''); setRating(0);
        setTimeout(() => setSubmitted(false), 3000);
        fetchFeedbacks();
      } else setError(data.error || 'Failed to submit. Please try again.');
    } catch { setError('Connection error. Please try again.'); }
    setSubmitting(false);
  }

  const inputStyle = {
    width: '100%', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '10px', padding: '12px 16px', color: isDark ? '#fff' : '#1a1a1a',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '20px', padding: '36px' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>◆ Share Your Experience</div>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', fontSize: '0.8rem', marginBottom: '24px' }}>How was your experience with ZeroAPI? Your feedback helps us improve.</p>

        {!submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginRight: '8px' }}>Rate us:</span>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '0 2px', transition: 'transform 0.2s', transform: (hoverRating || rating) >= s ? 'scale(1.2)' : 'scale(1)' }}
                  aria-label={`Rate ${s} stars`}>
                  <span style={{ color: (hoverRating || rating) >= s ? '#febc2e' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') }}>★</span>
                </button>
              ))}
              <span style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', marginLeft: '8px' }}>{rating > 0 ? `${rating}/5` : ''}</span>
            </div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = `${ac}66`}
              onBlur={e => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}
              aria-label="Your name" />
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts, suggestions, or what you liked..." rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = `${ac}66`}
              onBlur={e => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}
              aria-label="Your feedback" />
            {error && <div style={{ color: '#ff6b6b', fontSize: '0.78rem', fontFamily: "'Space Mono',monospace" }}>⚠ {error}</div>}
            <button onClick={submitFeedback} disabled={rating === 0 || submitting}
              style={{ alignSelf: 'flex-start', background: rating === 0 || submitting ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg,#00ffe0,#0af)', border: 'none', borderRadius: '10px', padding: '10px 24px', color: rating === 0 || submitting ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : '#000', fontWeight: 700, fontSize: '0.85rem', cursor: rating === 0 || submitting ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono',monospace", display: 'flex', alignItems: 'center', gap: '8px' }}
              aria-label="Submit feedback">
              {submitting ? <><span className="spinner" style={{ width: '12px', height: '12px' }} />Submitting...</> : 'Submit Feedback →'}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🙏</div>
            <div style={{ color: ac, fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Thank you for your feedback!</div>
            <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', fontSize: '0.8rem' }}>Your experience is now visible to everyone.</div>
          </div>
        )}

        <div style={{ marginTop: '32px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, paddingTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>◆ Recent Feedback</div>
            {feedbacks.length > 0 && <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', color: `${ac}88` }}>{feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''} · live</div>}
          </div>
          {loadingFeedbacks && <div style={{ textAlign: 'center', padding: '20px', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', fontFamily: "'Space Mono',monospace", fontSize: '0.78rem' }}><span className="spinner" style={{ marginRight: '8px' }} />Loading feedback...</div>}
          {!loadingFeedbacks && feedbacks.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)', fontSize: '0.82rem' }}>No feedback yet. Be the first to share! 🌟</div>}
          {feedbacks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
              {feedbacks.map(fb => (
                <div key={fb.id} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '12px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a' }}>{fb.name}</span>
                      <span style={{ color: '#febc2e', fontSize: '0.8rem' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', fontFamily: "'Space Mono',monospace" }}>
                      {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {fb.message && <div style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>{escapeHtml(fb.message)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
