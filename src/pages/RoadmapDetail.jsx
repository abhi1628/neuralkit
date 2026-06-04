// src/pages/RoadmapDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { getRoadmapBySlug } from '../data/roadmaps';
import { trackEvent, copyToClipboard } from '../utils';
import { useState, useEffect } from 'react';

export default function RoadmapDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const roadmap = getRoadmapBySlug(slug);
  
  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  if (!roadmap) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", color: isDark ? '#fff' : '#1a1a1a' }}>Roadmap Not Found</h2>
        <button onClick={() => navigate('/roadmaps')} style={{ marginTop: '20px', background: ac, border: 'none', borderRadius: '10px', padding: '10px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          ← All Roadmaps
        </button>
      </div>
    );
  }

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = roadmap.image;
    link.download = `${roadmap.slug}-roadmap.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    trackEvent('roadmap_download', { roadmap: slug, format: 'image' });
  };

  const handleCopyMarkdown = () => {
    const text = generateRoadmapText(roadmap);
    copyToClipboard(text, setCopied);
    trackEvent('roadmap_copy', { roadmap: slug, format: 'markdown' });
  };

  const openLightbox = () => {
    setLightboxOpen(true);
    trackEvent('roadmap_lightbox_open', { roadmap: slug });
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* Hero / Header */}
      <div style={{ padding: '100px 32px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/roadmaps')}
          style={{ 
            background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.07)', 
            border: isDark ? '1px solid rgba(167,139,250,0.2)' : '1px solid rgba(124,58,237,0.2)', 
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
          ← All Roadmaps
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>{roadmap.icon}</span>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {roadmap.category} Roadmap
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#fff' : '#1a1a1a', margin: '0' }}>
            {roadmap.title}
          </h1>
        </div>
        
        <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.65)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '700px',textAlign: 'center', margin: '0 auto'  }}>
          {roadmap.description}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '6px' }}>
            ⏱ {roadmap.estimatedHours}+ hours
          </span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '6px' }}>
            📊 {roadmap.difficulty}
          </span>
        </div>
      </div>

      {/* Roadmap Image with Lightbox */}
      <div style={{ padding: '0 32px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '16px',
          padding: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease'
        }}
        onClick={openLightbox}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = ac;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)';
        }}
        >
          <img 
            src={roadmap.image} 
            alt={roadmap.imageAlt}
            loading="lazy"
            style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block', pointerEvents: 'none' }}
          />
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', fontFamily: "'Space Mono',monospace" }}>
            ◆ Click to enlarge — Save or share
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div 
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>

          {/* Image container */}
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              animation: 'scaleIn 0.25s ease'
            }}
          >
            <img 
              src={roadmap.image} 
              alt={roadmap.imageAlt}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
                display: 'block'
              }}
            />
            {/* Caption */}
            <div style={{
              position: 'absolute',
              bottom: '-36px',
              left: '0',
              right: '0',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.75rem',
              fontFamily: "'Space Mono',monospace"
            }}>
              Click outside or press Escape to close
            </div>
          </div>
        </div>
      )}

      {/* Theory / Phases */}
      <div style={{ padding: '0 32px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '28px' }}>
          ◆ Detailed Learning Path
        </div>
        
        {roadmap.phases.map((phase, index) => (
          <div key={index} style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1.4rem' }}>{phase.icon}</span>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.15rem', color: isDark ? '#fff' : '#1a1a1a', margin: 0 }}>
                {phase.title}
              </h2>
            </div>
            
            <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.2)'}`, marginLeft: '18px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
                {phase.topics.map((topic, i) => (
                  <li key={i} style={{ 
                    padding: '8px 0', 
                    color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <span style={{ color: ac, flexShrink: 0, marginTop: '2px' }}>▸</span>
                    {topic}
                  </li>
                ))}
              </ul>
              
              {phase.resources.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', fontFamily: "'Space Mono',monospace", marginBottom: '8px' }}>
                    RESOURCES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {phase.resources.map((res, i) => (
                      <a 
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('roadmap_resource_click', { roadmap: slug, resource: res.name })}
                        style={{
                          fontSize: '0.78rem',
                          color: ac,
                          textDecoration: 'none',
                          background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.06)',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          border: `1px solid ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.12)'}`
                        }}
                      >
                        {res.name} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Soft Skills */}
        {roadmap.softSkills && roadmap.softSkills.length > 0 && (
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
              ◆ Continuous Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {roadmap.softSkills.map((skill, i) => (
                <span key={i} style={{
                  fontSize: '0.82rem',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Tools */}
        {roadmap.relatedTools && roadmap.relatedTools.length > 0 && (
          <div style={{ marginTop: '40px', padding: '24px', background: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.04)', borderRadius: '14px', border: `1px solid ${isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.1)'}` }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>
              ◆ Practice With ZeroAPI Tools
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {roadmap.relatedTools.map(toolId => (
                <button
                  key={toolId}
                  onClick={() => {
                    trackEvent('roadmap_tool_click', { roadmap: slug, tool: toolId });
                    navigate(`/#tools`);
                    setTimeout(() => {
                      document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${ac}`,
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: ac,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontFamily: "'Space Mono',monospace"
                  }}
                >
                  Try {toolId.replace(/-/g, ' ')} →
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Download Section */}
      <div style={{ padding: '0 32px 80px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '16px',
          padding: '28px',
          textAlign: 'center'
        }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
            ◆ Save For Later
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadImage}
              style={{
                background: `linear-gradient(135deg, ${ac}, ${isDark ? '#818cf8' : '#4f46e5'})`,
                border: 'none',
                borderRadius: '10px',
                padding: '12px 28px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: "'Space Mono',monospace"
              }}
            >
              ⬇ Download Image
            </button>
            <button
              onClick={handleCopyMarkdown}
              style={{
                background: 'transparent',
                border: `1px solid ${ac}`,
                borderRadius: '10px',
                padding: '12px 28px',
                color: ac,
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: "'Space Mono',monospace"
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Text'}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Helper to generate plain text for PDF/clipboard
function generateRoadmapText(roadmap) {
  let text = `${roadmap.title}\n`;
  text += `${'='.repeat(roadmap.title.length)}\n\n`;
  text += `${roadmap.description}\n\n`;
  text += `Estimated Time: ${roadmap.estimatedHours}+ hours\n`;
  text += `Difficulty: ${roadmap.difficulty}\n\n`;
  
  text += `LEARNING PATH\n`;
  text += `${'-'.repeat(40)}\n\n`;
  
  roadmap.phases.forEach((phase, i) => {
    text += `${phase.icon} ${phase.title}\n`;
    text += `${'-'.repeat(phase.title.length + 4)}\n`;
    phase.topics.forEach(topic => {
      text += `  • ${topic}\n`;
    });
    if (phase.resources.length > 0) {
      text += `\n  Resources:\n`;
      phase.resources.forEach(res => {
        text += `    → ${res.name}: ${res.url}\n`;
      });
    }
    text += `\n`;
  });
  
  if (roadmap.softSkills?.length > 0) {
    text += `CONTINUOUS SKILLS\n`;
    text += `${'-'.repeat(40)}\n`;
    roadmap.softSkills.forEach(skill => text += `  • ${skill}\n`);
    text += `\n`;
  }
  
  text += `\nGenerated by ZeroAPI.in — Free AI Tools & Roadmaps\n`;
  return text;
}
