// src/components/HeroSection.jsx
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import Particle from './Particle';

// ── Large animated logo mark for hero ────────────────────────
function HeroLogo({ isDark }) {
  const ac1 = isDark ? '#a78bfa' : '#7c3aed';
  const ac2 = isDark ? '#818cf8' : '#4f46e5';
  const ac3 = isDark ? '#c084fc' : '#6d28d9';

  return (
    <div className="hero-logo-mark" style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 36px' }}>
      {/* Outer glow */}
      <div style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: `radial-gradient(circle, ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.1)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <svg width="130" height="130" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
        <defs>
          <linearGradient id="hg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ac1} />
            <stop offset="100%" stopColor={ac2} />
          </linearGradient>
          <linearGradient id="hg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ac2} />
            <stop offset="100%" stopColor={ac3} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ring — slow spin */}
        <g className="hero-logo-ring">
          <circle cx="65" cy="65" r="58" fill="none" stroke="url(#hg1)" strokeWidth="2.5"
            strokeDasharray="240 90" strokeLinecap="round" />
          {/* Dots on outer ring */}
          <circle cx="65" cy="7"   r="4.5" fill={ac1} filter="url(#glow)" />
          <circle cx="123" cy="65" r="4.5" fill={ac2} filter="url(#glow)" />
          <circle cx="65" cy="123" r="4.5" fill={ac1} filter="url(#glow)" />
          <circle cx="7"  cy="65"  r="4.5" fill={ac2} filter="url(#glow)" />
        </g>

        {/* Middle ring — reverse spin */}
        <g className="hero-logo-ring2">
          <circle cx="65" cy="65" r="42" fill="none" stroke="url(#hg2)" strokeWidth="1.5"
            strokeDasharray="160 60" strokeLinecap="round" opacity="0.7" />
          <circle cx="65" cy="23"  r="3" fill={ac3} opacity="0.8" />
          <circle cx="107" cy="65" r="3" fill={ac1} opacity="0.8" />
          <circle cx="65" cy="107" r="3" fill={ac3} opacity="0.8" />
          <circle cx="23" cy="65"  r="3" fill={ac1} opacity="0.8" />
        </g>

        {/* Inner circle bg */}
        <circle cx="65" cy="65" r="28" fill={isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)'}
          stroke="url(#hg1)" strokeWidth="1" />

        {/* Big "0" */}
        <text x="65" y="59" textAnchor="middle" fontFamily="'Arial Black', sans-serif"
          fontSize="28" fontWeight="900" fill="url(#hg1)">0</text>

        {/* "API" label */}
        <text x="65" y="78" textAnchor="middle" fontFamily="monospace"
          fontSize="11" fill={isDark ? 'rgba(241,245,249,0.7)' : 'rgba(30,27,75,0.7)'}
          letterSpacing="4" fontWeight="700">API</text>
      </svg>
    </div>
  );
}

// ── HeroSection ───────────────────────────────────────────────
export default function HeroSection({ visitorCount, particles }) {
  const { theme } = useTheme();
  const navigate   = useNavigate();
  const isDark     = theme === 'dark';
  const ac         = isDark ? '#a78bfa' : '#7c3aed';
  const gradient   = isDark
    ? isDark ? 'linear-gradient(135deg, #a78bfa, #818cf8)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)'
    : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
  const gradientText = isDark
    ? 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #818cf8 100%)'
    : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #6366f1 100%)';
  const glow = isDark
    ? '0 0 40px rgba(167,139,250,0.45)'
    : '0 0 32px rgba(124,58,237,0.35)';

  return (
    <section className="hero-section" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '90px 40px 80px', overflow: 'hidden' }}>

      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.03)'} 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Radial glow blob */}
      <div style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', background: `radial-gradient(circle, ${isDark ? 'rgba(139,92,246,0.12)' : 'rgba(124,58,237,0.06)'} 0%, transparent 70%)`, top: '5%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

      {/* Floating particles */}
      {particles.map((p, i) => <Particle key={i} style={{ ...p, background: isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)' }} />)}

      {/* ── Large Hero Logo ── */}
      <div className="hero-cta">
        <HeroLogo isDark={isDark} />
      </div>

      {/* Badge */}
      <div className="hero-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.25)' : 'rgba(124,58,237,0.22)'}`, borderRadius: '100px', padding: '6px 18px', marginBottom: '28px', fontSize: '0.72rem', fontFamily: "'Space Mono', monospace", color: ac, letterSpacing: '0.07em', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ac, animation: 'pulse 1.5s ease infinite', display: 'inline-block', flexShrink: 0 }} />
        FREE AI TOOLS · ZERO API KEY · ZERO SIGNUP
      </div>

      {/* Headline */}
      <h1 className="hero-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 6vw, 6rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px', maxWidth: '900px', color: isDark ? '#f1f5f9' : '#1e1b4b', wordBreak: 'keep-all' }}>
        <span>Your AI </span>
        <span style={{ background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', whiteSpace: 'nowrap' }}>Superpower</span>
        <br /><span>Starts Here</span>
      </h1>

      {/* Subheadline */}
      <p className="hero-sub" style={{ fontSize: '1.1rem', color: isDark ? 'rgba(241,245,249,0.65)' : '#4b4580', maxWidth: '560px', lineHeight: 1.75, marginBottom: '44px', fontWeight: 300 }}>
        Free guides, tutorials, and AI tools for developers, researchers, and engineers. Written by Prof. Abhishek Singh. Zero signup. Zero cost.
      </p>

      {/* CTA Buttons */}
      <div className="hero-cta" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate('/learn')} style={{ background: gradient, border: 'none', borderRadius: '12px', padding: '16px 36px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'Space Mono', monospace", boxShadow: glow, letterSpacing: '0.03em', transition: 'all 0.25s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          Read Free Guides →
        </button>
        <button onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: `1px solid ${isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.25)'}`, borderRadius: '12px', padding: '16px 36px', color: ac, fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.25s' }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          Try AI Tools →
        </button>
      </div>

      {/* Stats */}
      <div style={{ marginTop: '56px', display: 'flex', gap: '60px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[{ n: visitorCount ? visitorCount.toLocaleString() : '...', label: 'Visitors' }, { n: '0', label: 'Signup Required' }, { n: '∞', label: 'Possibilities' }].map(({ n, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{n}</div>
            <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(241,245,249,0.38)' : '#6d6a8a', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Feature grid */}
      <div style={{ marginTop: '48px', background: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.04)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.1)'}`, borderRadius: '20px', padding: '28px 32px', maxWidth: '800px', width: '100%' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>◆ Why ZeroAPI Wins</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: '✅', label: 'No Signup',           desc: 'Start instantly' },
            { icon: '✅', label: 'Fully Free',          desc: 'No hidden tiers' },
            { icon: '✅', label: 'Resume Builder',      desc: 'Step-by-step AI wizard' },
            { icon: '✅', label: 'Document Summarizer', desc: 'PDF & Word supported' },
            { icon: '✅', label: 'Q&A with Citations',  desc: 'Ask follow-up questions' },
            { icon: '✅', label: 'Code Playground',     desc: '6 languages, AI explain' },
            { icon: '✅', label: 'MCQ Generator',       desc: 'Auto-generates questions' },
            { icon: '✅', label: 'Research Summarizer', desc: 'Papers → key insights' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isDark ? '#f1f5f9' : '#1e1b4b' }}>{f.label}</div>
                <div style={{ fontSize: '0.73rem', color: isDark ? 'rgba(241,245,249,0.4)' : '#6d6a8a', marginTop: '2px' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
