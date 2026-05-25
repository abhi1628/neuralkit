// src/components/HeroSection.jsx
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import Particle from './Particle';

export default function HeroSection({ visitorCount, particles }) {
  const { theme } = useTheme();
  const navigate   = useNavigate();
  const isDark     = theme === 'dark';
  const ac         = isDark ? '#00ffe0' : '#008080';

  return (
    <section className="hero-section" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '90px 40px 80px', overflow: 'hidden' }}>
      {/* Grid bg */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${isDark ? 'rgba(0,255,224,0.03)' : 'rgba(0,200,180,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(0,255,224,0.03)' : 'rgba(0,200,180,0.03)'} 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: `radial-gradient(circle, ${isDark ? 'rgba(0,170,255,0.07)' : 'rgba(0,170,255,0.03)'} 0%, transparent 70%)`, top: '10%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Badge */}
      <div className="hero-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(0,255,224,0.08)' : 'rgba(0,100,90,0.1)', border: `1px solid ${isDark ? 'rgba(0,255,224,0.2)' : 'rgba(0,128,128,0.3)'}`, borderRadius: '100px', padding: '6px 16px', marginBottom: '32px', fontSize: '0.72rem', fontFamily: "'Space Mono', monospace", color: ac, letterSpacing: '0.06em', textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ac, animation: 'pulse 1.5s ease infinite', display: 'inline-block' }} />
        FREE AI TOOLS · ZERO API KEY · ZERO SIGNUP
      </div>

      <h1 className="hero-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 6vw, 6rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px', maxWidth: '900px', color: isDark ? '#fff' : '#1a1a1a', wordBreak: 'keep-all' }}>
        <span>Your AI </span>
        <span style={{ background: 'linear-gradient(135deg, #00ffe0 0%, #0af 60%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', whiteSpace: 'nowrap' }}>Superpower</span>
        <br /><span>Starts Here</span>
      </h1>

      <p className="hero-sub" style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '48px', fontWeight: 300 }}>
        Free guides, tutorials, and AI tools for developers, researchers, and engineers. Written by Prof. Abhishek Singh. Zero signup. Zero cost.
      </p>

      <div className="hero-cta" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate('/learn')} style={{ background: 'linear-gradient(135deg, #00ffe0 0%, #0af 100%)', border: 'none', borderRadius: '12px', padding: '16px 36px', color: '#000', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'Space Mono', monospace", boxShadow: '0 0 40px rgba(0,255,224,0.3)', letterSpacing: '0.03em' }}>Read Free Guides →</button>
        <button onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '12px', padding: '16px 36px', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer' }}>Try AI Tools →</button>
      </div>

      {/* Stats */}
      <div className="hero-stats" style={{ marginTop: '56px', display: 'flex', gap: '60px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[{ n: visitorCount ? visitorCount.toLocaleString() : '...', label: 'Visitors' }, { n: '0', label: 'Signup Required' }, { n: '∞', label: 'Possibilities' }].map(({ n, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #00ffe0, #0af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{n}</div>
            <div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Feature comparison */}
      <div style={{ marginTop: '48px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '16px', padding: '24px 32px', maxWidth: '800px', width: '100%' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>◆ Why ZeroAPI Wins</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: '✅', label: 'No Signup',             desc: 'Start instantly' },
            { icon: '✅', label: 'Fully Free',            desc: 'No hidden tiers' },
            { icon: '✅', label: 'Resume Builder',        desc: 'Step-by-step AI wizard' },
            { icon: '✅', label: 'Document Summarizer',   desc: 'PDF & Word supported' },
            { icon: '✅', label: 'Q&A with Citations',    desc: 'Ask follow-up questions' },
            { icon: '✅', label: 'Code Playground',       desc: '6 languages, AI explain' },
            { icon: '✅', label: 'MCQ Generator',         desc: 'Auto-generates questions' },
            { icon: '✅', label: 'Research Summarizer',   desc: 'Papers → key insights' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isDark ? '#fff' : '#1a1a1a' }}>{f.label}</div>
                <div style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
