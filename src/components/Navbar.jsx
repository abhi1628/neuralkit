// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

export default function Navbar({ setActiveSection }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const isDark = theme === 'dark';
  const ac     = isDark ? '#a78bfa' : '#7c3aed';
  const gradient = isDark
    ? 'linear-gradient(135deg, #a78bfa, #818cf8)'
    : 'linear-gradient(135deg, #7c3aed, #4f46e5)';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (menuOpen && window.scrollY > 60) setMenuOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const navLinks = [
    { label: 'AI Tools',    action: () => { setActiveSection?.('ai');  scrollTo('tools');    } },
    { label: 'Dev Tools',   action: () => { setActiveSection?.('dev'); scrollTo('devtools'); } },
    { label: 'Learn',       action: () => navigate('/learn')                                   },
    { label: 'Playground',  action: () => scrollTo('playground')                               },
    { label: 'About',       action: () => scrollTo('about')                                    },
  ];

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '14px 40px', display: 'flex', alignItems: 'center', gap: '24px', background: scrolled ? (isDark ? 'rgba(8,7,15,0.92)' : 'rgba(250,248,255,0.92)') : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? `1px solid ${isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.1)'}` : 'none', transition: 'all 0.3s ease' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <svg width="40" height="40" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
            style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(167,139,250,0.6))' : 'drop-shadow(0 0 6px rgba(124,58,237,0.4))' }}>
            <defs>
              <linearGradient id="ng1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDark ? '#a78bfa' : '#7c3aed'} />
                <stop offset="100%" stopColor={isDark ? '#818cf8' : '#4f46e5'} />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="48" fill="none" stroke="url(#ng1)" strokeWidth="3.5" strokeDasharray="220 80" strokeLinecap="round" />
            <circle cx="60" cy="60" r="34" fill="none" stroke={isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.3)'} strokeWidth="1.5" strokeDasharray="160 60" strokeLinecap="round" />
            <circle cx="60" cy="12"  r="4" fill={isDark ? '#a78bfa' : '#7c3aed'} />
            <circle cx="108" cy="60" r="4" fill={isDark ? '#818cf8' : '#4f46e5'} />
            <circle cx="60" cy="108" r="4" fill={isDark ? '#a78bfa' : '#7c3aed'} />
            <circle cx="12" cy="60"  r="4" fill={isDark ? '#818cf8' : '#4f46e5'} />
            <line x1="60" y1="12"  x2="60" y2="22"  stroke={isDark ? '#a78bfa' : '#7c3aed'} strokeWidth="2" />
            <line x1="108" y1="60" x2="98" y2="60"  stroke={isDark ? '#818cf8' : '#4f46e5'} strokeWidth="2" />
            <line x1="60" y1="108" x2="60" y2="98"  stroke={isDark ? '#a78bfa' : '#7c3aed'} strokeWidth="2" />
            <line x1="12" y1="60"  x2="22" y2="60"  stroke={isDark ? '#818cf8' : '#4f46e5'} strokeWidth="2" />
            <text x="60" y="56" textAnchor="middle" fontFamily="'Arial Black',sans-serif" fontSize="24" fontWeight="900" fill="url(#ng1)">0</text>
            <text x="60" y="76" textAnchor="middle" fontFamily="monospace" fontSize="11" fill={isDark ? 'rgba(241,245,249,0.65)' : 'rgba(30,27,75,0.65)'} letterSpacing="4" fontWeight="700">API</text>
          </svg>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: isDark ? '#f1f5f9' : '#1e1b4b' }}>ZeroAPI</span>
        </div>

        {/* Desktop nav links */}
        <div className="nav-links" style={{ display: 'flex', gap: '28px', alignItems: 'center', marginLeft: 'auto' }}>
          {navLinks.map(({ label, action }) => (
            <span key={label} onClick={action}
              style={{ fontSize: '0.85rem', color: isDark ? 'rgba(241,245,249,0.55)' : '#4b4580', cursor: 'pointer', transition: 'color 0.2s', fontWeight: 500 }}
              onMouseEnter={e => e.target.style.color = ac}
              onMouseLeave={e => e.target.style.color = isDark ? 'rgba(241,245,249,0.55)' : '#4b4580'}>
              {label}
            </span>
          ))}
          <span onClick={() => window.open('https://www.youtube.com/@pyofpython9668', '_blank', 'noopener,noreferrer')}
            title="YouTube: pyofpython"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.65, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.65'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#ff0000" opacity="0.9"/><polygon points="9.5,7.5 9.5,16.5 17,12" fill="white"/></svg>
          </span>
          <button onClick={() => scrollTo('tools')} className="nav-try-btn"
            style={{ background: gradient, border: 'none', borderRadius: '8px', padding: '8px 20px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Space Mono', monospace", letterSpacing: '0.03em', boxShadow: isDark ? '0 0 20px rgba(167,139,250,0.35)' : '0 0 16px rgba(124,58,237,0.3)', transition: 'all 0.25s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Try Free →
          </button>
        </div>

        {/* Hamburger */}
        <button className="hamburger-btn" onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
          style={{ display: 'none', background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.07)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.18)'}`, borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: ac, transition: 'all 0.2s', marginLeft: 'auto' }}>
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="theme-toggle-btn"
          aria-label="Toggle theme"
          style={{ background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.07)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.18)'}`, borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'all 0.2s' }}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu"
          onClick={e => { if (e.target === e.currentTarget) setMenuOpen(false); }}
          style={{ position: 'fixed', top: 0, paddingTop: '70px', left: 0, right: 0, bottom: 0, background: isDark ? 'rgba(8,7,15,0.98)' : 'rgba(250,248,255,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '24px 32px', gap: '6px', animation: 'fadeUp 0.25s ease' }}>
          {navLinks.map(({ label, action }) => (
            <button key={label} onClick={() => { setMenuOpen(false); action(); }}
              style={{ background: 'transparent', border: 'none', padding: '14px 0', color: isDark ? '#f1f5f9' : '#1e1b4b', fontSize: '1.1rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textAlign: 'left', cursor: 'pointer', borderBottom: `1px solid ${isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.1)'}`, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = ac}
              onMouseLeave={e => e.currentTarget.style.color = isDark ? '#f1f5f9' : '#1e1b4b'}>
              {label}
            </button>
          ))}
          <div style={{ marginTop: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span onClick={() => window.open('https://www.youtube.com/@pyofpython9668', '_blank', 'noopener,noreferrer')} style={{ cursor: 'pointer' }}>
              <svg width="28" height="28" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#ff0000" opacity="0.9"/><polygon points="9.5,7.5 9.5,16.5 17,12" fill="white"/></svg>
            </span>
            <span style={{ color: isDark ? 'rgba(241,245,249,0.45)' : '#6d6a8a', fontSize: '0.85rem' }}>pyofpython</span>
          </div>
          <button onClick={() => { setMenuOpen(false); scrollTo('tools'); }}
            style={{ marginTop: '20px', background: gradient, border: 'none', borderRadius: '12px', padding: '14px 28px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'Space Mono', monospace", boxShadow: isDark ? '0 0 24px rgba(167,139,250,0.4)' : '0 0 20px rgba(124,58,237,0.3)' }}>
            Try Free →
          </button>
        </div>
      )}
    </>
  );
}
