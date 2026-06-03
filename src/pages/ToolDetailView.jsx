// src/pages/ToolDetailView.jsx
import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { TOOLS } from '../constants';
import { trackEvent } from '../utils';
import ToolPanel from '../components/ToolPanel';
import MCQPanel from '../components/MCQPanel';
import UploadTool from '../components/UploadTool';
import ResumeBuilderTool from '../components/ResumeBuilderTool';

const UPLOAD_TOOLS_MAP = {
  'summarizer-upload': {
    icon: '📄', label: 'Summarize Document', filename: 'doc-summary',
    prompt: `You are an expert research analyst. Produce a thorough structured summary...`
  },
  'resume-upload': {
    icon: '📋', label: 'Analyze Resume', filename: 'resume-analysis',
    prompt: `You are an expert HR consultant and career coach. Analyze this resume and provide...`
  }
};

export default function ToolDetailView() {
  const { toolSlug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  // Find tool specification match across static registry arrays
  const staticTool = TOOLS.find(t => t.id === toolSlug);
  const uploadToolSpec = UPLOAD_TOOLS_MAP[toolSlug];
  
  const isBuilder = toolSlug === 'resume-builder';
  const isValid = staticTool || uploadToolSpec || isBuilder;

  useEffect(() => {
    if (!isValid) return;

    // Resolve structural parameters dynamically for header injection
    const name = staticTool?.name || uploadToolSpec?.label || "ATS Resume Builder";
    const tagline = staticTool?.tagline || (isBuilder ? "Build a professional ATS-optimized resume from scratch" : "Upload documents for instant insights");

    // ── Dynamic SEO Injection ──
    document.title = `${name} - Free AI Online Tool | ZeroAPI`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', `${tagline}. Powered by high-speed serverless AI arrays. No signup required.`);

    // Dispatch analytics tracking events to server logs
    fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view', targetId: toolSlug })
    }).catch(() => {});

    window.scrollTo(0, 0);
  }, [toolSlug, isValid, staticTool, uploadToolSpec, isBuilder]);

  const renderSelectedPanel = useCallback(() => {
    if (staticTool) {
      if (toolSlug === 'mcq-generator' || staticTool.id === 'mcqGenerator') return <MCQPanel tool={staticTool} />;
      return <ToolPanel tool={staticTool} />;
    }
    if (uploadToolSpec) return <UploadTool {...uploadToolSpec} />;
    if (isBuilder) return <ResumeBuilderTool />;
    return null;
  }, [staticTool, uploadToolSpec, isBuilder, toolSlug]);

  if (!isValid) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 32px', color: 'var(--text-primary)' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif" }}>Tool Not Found</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', background: ac, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
      </div>
    );
  }

  const activeName = staticTool?.name || uploadToolSpec?.label || "ATS Resume Builder";
  const activeTagline = staticTool?.tagline || (isBuilder ? "Build a professional ATS-optimized resume from scratch — step by step" : "Instant structured data extracts via client streaming lines");
  const activeIcon = staticTool?.icon || uploadToolSpec?.icon || "🏗️";

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '120px 32px 80px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, paddingBottom: '24px' }}>
          <span style={{ fontSize: '2.5rem' }}>{activeIcon}</span>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '2rem', margin: 0 }}>{activeName}</h1>
            <p style={{ fontSize: '0.95rem', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.6)', marginTop: '4px', fontWeight: 300 }}>{activeTagline}</p>
          </div>
        </div>

        <div style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '20px', padding: '36px' }}>
          {renderSelectedPanel()}
        </div>

        {/* Long-form Content Area for Google Crawler Keyword Optimization */}
        <article style={{ marginTop: '60px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, paddingTop: '40px', lineHeight: 1.8, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.75)' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", color: isDark ? '#fff' : '#1a1a1a', marginBottom: '16px' }}>About Free AI {activeName}</h2>
          <p>ZeroAPI provides unlimited processing operations across deep contextual analysis models without requiring account registrations, authorization vectors, or API usage logs. This module routes requested inputs securely using serverless abstraction architectures to return responses compiled safely against injection variants.</p>
        </article>
      </div>
    </div>
  );
}
