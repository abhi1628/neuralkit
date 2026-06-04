// src/pages/RoadmapList.jsx
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { ROADMAPS } from '../data/roadmaps';
import { trackEvent } from '../utils';

export default function RoadmapList() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark ? '#0a0a0f' : '#ffffff', 
      color: isDark ? '#ffffff' : '#1a1a1a', 
      fontFamily: "'DM Sans', sans-serif", 
      padding: '100px 32px 80px' 
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Back to ZeroAPI */}
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            background: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.07)', 
            border: isDark ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(124,58,237,0.2)', 
            borderRadius: '8px', 
            color: ac, 
            fontSize: '0.82rem', 
            cursor: 'pointer', 
            fontFamily: "'Space Mono',monospace", 
            marginBottom: '36px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '8px 16px', 
            fontWeight: 600 
          }}
        >
          ← Back to ZeroAPI
        </button> 

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ 
            fontFamily: "'Space Mono',monospace", 
            fontSize: '0.7rem', 
            color: ac, 
            letterSpacing: '0.2em', 
            textTransform: 'uppercase', 
            marginBottom: '16px' 
          }}>
            ◆ Career Paths
          </div>
          <h1 style={{ 
            fontFamily: "'Syne',sans-serif", 
            fontSize: 'clamp(2rem,5vw,3.2rem)', 
            fontWeight: 800, 
            letterSpacing: '-0.03em', 
            color: isDark ? '#ffffff' : '#1a1a1a', 
            marginBottom: '14px' 
          }}>
            Learning Roadmaps
          </h1>
          <p style={{ 
            color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.6)', 
            fontSize: '1rem', 
            fontWeight: 300, 
            maxWidth: '560px', 
            margin: '0 auto', 
            lineHeight: 1.7 
          }}>
            Step-by-step guides to master in-demand tech skills. Curated by Prof. Abhishek Singh.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '20px' 
        }}>
          {ROADMAPS.map(roadmap => (
            <div
              key={roadmap.slug}
              onClick={() => {
                trackEvent('roadmap_click', { roadmap: roadmap.slug });
                navigate(`/roadmaps/${roadmap.slug}`);
              }}
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '20px',
                padding: '28px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = ac;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 8px 32px rgba(167,139,250,0.15)' 
                  : '0 8px 32px rgba(124,58,237,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '14px', 
                marginBottom: '16px' 
              }}>
                <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>{roadmap.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontFamily: "'Syne',sans-serif", 
                    fontWeight: 700, 
                    fontSize: '1.05rem', 
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    marginBottom: '4px',
                    lineHeight: 1.3
                  }}>
                    {roadmap.title}
                  </div>
                  <div style={{ 
                    fontSize: '0.72rem', 
                    color: ac, 
                    fontFamily: "'Space Mono',monospace" 
                  }}>
                    {roadmap.category} · {roadmap.estimatedHours}+ hours
                  </div>
                </div>
              </div>
              
              <p style={{ 
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', 
                fontSize: '0.88rem', 
                lineHeight: 1.7, 
                marginBottom: '18px',
                minHeight: '48px'
              }}>
                {roadmap.description}
              </p>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px', 
                marginBottom: '16px' 
              }}>
                {roadmap.phases.slice(0, 4).map((phase, i) => (
                  <span key={i} style={{
                    fontSize: '0.68rem',
                    fontFamily: "'Space Mono',monospace",
                    color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    padding: '3px 10px',
                    borderRadius: '6px'
                  }}>
                    {phase.icon} {phase.title.split(':')[0]}
                  </span>
                ))}
                {roadmap.phases.length > 4 && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontFamily: "'Space Mono',monospace",
                    color: ac,
                    padding: '3px 10px'
                  }}>
                    +{roadmap.phases.length - 4} more
                  </span>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                paddingTop: '14px',
                marginTop: '4px'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)',
                  fontFamily: "'Space Mono',monospace"
                }}>
                  Difficulty: {roadmap.difficulty}
                </span>
                <span style={{
                  color: ac,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  fontFamily: "'Space Mono',monospace"
                }}>
                  View Roadmap →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
