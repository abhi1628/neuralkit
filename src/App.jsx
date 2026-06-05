// src/App.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './ThemeContext';
import { TOOLS, DEV_TOOLS, GA_ID } from './constants';
import { loadGA, fetchVisitorCount, trackEvent } from './utils';
import appStyles from './appStyles';

// ── Page imports (ALL AT TOP) ───────────────────────────────
import { BlogList, BlogPost } from './Blog';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import About from './pages/About';
import BreakIt from './pages/BreakIt';
import BreakItChallenge from './pages/BreakItChallenge';
import RoadmapList from './pages/RoadmapList';
import RoadmapDetail from './pages/RoadmapDetail';
import TutorialList from './pages/TutorialList';
import TutorialSeries from './pages/TutorialSeries';
import TutorialPost from './pages/TutorialPost';

// ── Components ────────────────────────────────────────────────
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import Modal from './components/Modal';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TriviaSection from './components/TriviaSection';
import ToolCard from './components/ToolCard';
import ToolPanel from './components/ToolPanel';
import MCQPanel from './components/MCQPanel';
import UploadTool from './components/UploadTool';
import ResumeBuilderTool from './components/ResumeBuilderTool';
import DevToolsPanel, { AnalyticsDashboardSnippet } from './components/DevToolsPanel'; // FIXED: Imported analytics block
import CodePlayground from './components/CodePlayground';
import AskAuthor from './components/AskAuthor';
import UserFeedback from './components/UserFeedback';
import ToolDetailView from './pages/ToolDetailView';

// ── AI Tools section ──────────────────────────────────────────
const UPLOAD_TOOLS = [
  {
    icon: '📄', label: 'Summarize Document', filename: 'doc-summary',
    prompt: `You are an expert research analyst. Produce a thorough structured summary:
🎯 Document Type & Purpose (1-2 sentences)
🔍 Key Points (5-7 bullet points with specifics)
📊 Methodology (approach, techniques, algorithms, datasets used — be specific)
💡 Main Conclusions (2-3 points)
📌 Important Details (dates, names, figures)
⚠️ Limitations or Gaps
Keep under 400 words.`,
  },
  {
    icon: '📋', label: 'Analyze Resume', filename: 'resume-analysis',
    prompt: `You are an expert HR consultant and career coach. Analyze this resume and provide:
✅ Strengths (3-5 points)
❌ Weaknesses (3-5 points)
🚀 Improvements (5-7 specific actionable suggestions)
📈 ATS Score Estimate (out of 10) with reason
💡 Best-fit Job Roles based on the resume
Be honest, specific, and constructive.`,
  },
];

function AIToolsSection({ activeTool, setActiveTool }) {
  const navigate = useNavigate(); // FIXED: Added to allow direct routing on card actions
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  const ALL_TOOL_CARDS = [
    ...TOOLS.map(t => ({ id: t.id, icon: t.icon, name: t.name, tagline: t.tagline })),
    { id: 'summarizer-upload', icon: '📄', name: 'Document Summarizer',      tagline: 'Upload PDF or Word — instant AI structured summary' },
    { id: 'resume-upload',     icon: '📋', name: 'Resume Analyzer & Enhancer', tagline: 'Upload your resume — expert feedback, ATS score & AI-improved download' },
    { id: 'resume-builder',    icon: '🏗️', name: 'Resume Builder',            tagline: 'Build a professional ATS-optimized resume from scratch — step by step' },
  ];

  const activeInfo = ALL_TOOL_CARDS[activeTool] || ALL_TOOL_CARDS[0];

  const renderPanel = useCallback(() => {
    if (activeTool === 0) return <ToolPanel tool={TOOLS[0]} />;
    if (activeTool === 1) return <ToolPanel tool={TOOLS[1]} />;
    if (activeTool === 2) return <MCQPanel  tool={TOOLS[2]} />;
    if (activeTool === 3) return <UploadTool {...UPLOAD_TOOLS[0]} />;
    if (activeTool === 4) return <UploadTool {...UPLOAD_TOOLS[1]} />;
    return <ResumeBuilderTool />;
  }, [activeTool]);

  return (
    <section id="tools" style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 32px 120px' }} className="tools-section">
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>◆ AI Tools</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#fff' : '#1a1a1a' }}>
          Powerful. Free. No Login.
        </h2>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.6)', marginTop: '14px', fontSize: '1rem', fontWeight: 300 }}>
          Research tools, resume builder, code explainer — all powered by Groq AI.
        </p>
      </div>

      {/* Tool selector grid */}
      <div className="tool-row" style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {ALL_TOOL_CARDS.map((t, i) => (
          <ToolCard 
            key={t.id} 
            icon={t.icon} 
            name={t.name} 
            tagline={t.tagline} 
            active={activeTool === i}
            onClick={() => { 
              setActiveTool(i); 
              trackEvent('tool_selected', { tool_name: t.name });
              
              // OPTIONAL: Enforce explicit route jumps to dedicated SEO pages instantly on tap
              // navigate(`/tools/${t.id}`); 
            }} 
          />
        ))}
      </div>

      {/* Active panel */}
      <div className="tool-panel" style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '20px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingBottom: '20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
          <span style={{ fontSize: '1.5rem' }}>{activeInfo.icon}</span>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: isDark ? '#fff' : '#1a1a1a' }}>{activeInfo.name}</div>
            <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.6)', marginTop: '2px' }}>{activeInfo.tagline}</div>
          </div>
        </div>
        {renderPanel()}
      </div>
    </section>
  );
}

// ── Ask the Author section ────────────────────────────────────
function AskAuthorSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  return (
    <section style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 32px' }}>
      <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '20px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `linear-gradient(135deg, ${isDark ? '#a78bfa' : '#7c3aed'}, #818cf8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>👨‍🏫</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: isDark ? '#fff' : '#1a1a1a' }}>Ask Prof. Abhishek Singh</div>
            <div style={{ fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)', marginTop: '2px' }}>M.Tech (Data Science) · Author of Agentic AI Systems · CSE Prof.</div>
          </div>
        </div>
        <AskAuthor />
      </div>
    </section>
  );
}

// ── About section ─────────────────────────────────────────────
function AboutSection({ currentYear }) {
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  return (
    <section id="about" className="about-section" style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>◆ About ZeroAPI</div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '20px' }}>Built for Learners, by a Researcher</h2>
      <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.65)', lineHeight: 1.8, marginBottom: '32px', fontSize: '0.95rem' }}>
        ZeroAPI is a free platform for developers, students, and researchers. No keys, no accounts, no paywalls — just powerful AI tools and clear tutorials. Built by Prof. Abhishek Singh (M.Tech Data Science, M.Tech VLSI Design), CSE faculty at Baderia Global Institute of Engineering & Management, Jabalpur.
      </p>
      <div className="about-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
        <button onClick={() => window.open('https://www.youtube.com/@pyofpython9668', '_blank', 'noopener,noreferrer')}
          style={{ background: 'linear-gradient(135deg, #ff0000, #cc0000)', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ▶ YouTube: pyofpython
        </button>
        <button onClick={() => window.open('https://www.linkedin.com/in/abhishek-singh-170726123', '_blank', 'noopener,noreferrer')}
          style={{ background: '#0077b5', border: 'none', borderRadius: '10px', padding: '12px 24px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          LinkedIn
        </button>
        <button onClick={() => navigate('/privacy')} style={{ background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '12px 24px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.85rem', cursor: 'pointer' }}>
          Terms & Privacy
        </button>
      </div>
      <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, paddingTop: '24px', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)', fontSize: '0.75rem', fontFamily: "'Space Mono',monospace" }}>
        © {currentYear} ZeroAPI · Free AI Tools · Built with ❤ in Jabalpur, India
      </div>
    </section>
  );
}

// ── Home page (AppInner) ──────────────────────────────────────
function AppInner() {
  const { theme } = useTheme();
  const [activeTool,     setActiveTool]     = useState(0);
  const [activeSection,  setActiveSection]  = useState('ai');
  const [visitorCount,   setVisitorCount]   = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => { loadGA(GA_ID); }, []);
  useEffect(() => { fetchVisitorCount().then(setVisitorCount); }, []);

  const particles = useMemo(() => [
    { width: 6,  height: 6,  left: '10%', top: '20%', animationDuration: '8s',  animationDelay: '0s',   opacity: 0.6 },
    { width: 4,  height: 4,  left: '80%', top: '30%', animationDuration: '11s', animationDelay: '2s',   opacity: 0.4 },
    { width: 8,  height: 8,  left: '55%', top: '15%', animationDuration: '9s',  animationDelay: '1s',   opacity: 0.3 },
    { width: 3,  height: 3,  left: '30%', top: '70%', animationDuration: '14s', animationDelay: '3s',   opacity: 0.5 },
    { width: 5,  height: 5,  left: '70%', top: '80%', animationDuration: '10s', animationDelay: '0.5s', opacity: 0.4 },
  ], []);


  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: appStyles }} />

      <Navbar setActiveSection={setActiveSection} />
      <HeroSection visitorCount={visitorCount} particles={particles} />
      <TriviaSection />

      {activeSection === 'ai'  && <AIToolsSection  activeTool={activeTool} setActiveTool={setActiveTool} />}
      {activeSection === 'dev' && <DevToolsPanel />}
      {activeSection === 'ai'  && <CodePlayground />}

      {/* FIXED/ADDED: Visible local handler layout fallback link for new visible sections */}
      {activeSection === 'analytics' && (
        <section id="analytics-section" style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 32px' }}>
          <div style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '20px', padding: '36px' }}>
            <AnalyticsDashboardSnippet />
          </div>
        </section>
      )}

      <AskAuthorSection />
      <UserFeedback />
      <AboutSection currentYear={currentYear} />

      <ScrollToTop />
    </div>
  );
}

// ── Page wrappers (pass theme prop cleanly) ───────────────────
function BlogListPage()  { const { theme } = useTheme(); return <BlogList  theme={theme} />; }
function BlogPostPage()  { const { theme } = useTheme(); return <BlogPost  theme={theme} />; }
function PrivacyPage()   { const { theme } = useTheme(); return <Privacy   theme={theme} />; }
function ContactPage()   { const { theme } = useTheme(); return <Contact   theme={theme} />; }
function AboutPage()     { const { theme } = useTheme(); return <About     theme={theme} />; }
function BreakItPage()   { const { theme } = useTheme(); return <BreakIt theme={theme} />; }
function BreakItChallengePage() { const { theme } = useTheme(); return <BreakItChallenge theme={theme} />; }
function RoadmapListPage() { const { theme } = useTheme(); return <RoadmapList theme={theme} />; }
function RoadmapDetailPage() { const { theme } = useTheme(); return <RoadmapDetail theme={theme} />; }
function TutorialListPage() { const { theme } = useTheme(); return <TutorialList theme={theme} />; }
function TutorialSeriesPage() { const { theme } = useTheme(); return <TutorialSeries theme={theme} />; }
function TutorialPostPage() { const { theme } = useTheme(); return <TutorialPost theme={theme} />; }

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  const { theme } = useTheme(); // FIXED: Pulled out state cleanly for wrapper padding definitions
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/"            element={<AppInner />} />
        
        {/* ✅ REGISTERED: CRAWLER FRIENDLY ISOLATED SEO VIEW PATHS */}
        <Route path="/tools/:toolSlug" element={<ToolDetailView />} />
        
        {/* ✅ REGISTERED: DEDICATED ADMIN STATS LOOKUP ROUTE LINK */}
        <Route path="/dashboard" element={
          <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '120px 32px' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto', background: theme === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '20px', padding: '36px' }}>
              <AnalyticsDashboardSnippet />
            </div>
          </div>
        } />

        <Route path="/learn"       element={<BlogListPage />} />
        <Route path="/learn/:slug" element={<BlogPostPage />} />
        <Route path="/privacy"     element={<PrivacyPage />} />
        <Route path="/contact"     element={<ContactPage />} />
        <Route path="/about"       element={<AboutPage />} />
        <Route path="*"            element={<AppInner />} />
        <Route path="/breakit" element={<BreakItPage />} />
        <Route path="/breakit/:slug" element={<BreakItChallengePage />} />
        <Route path="/roadmaps" element={<RoadmapListPage />} />
        <Route path="/roadmaps/:slug" element={<RoadmapDetailPage />} />
        <Route path="/tutorials" element={<TutorialListPage />} />
        <Route path="/tutorials/:seriesSlug" element={<TutorialSeriesPage />} />
        <Route path="/tutorials/:seriesSlug/:partSlug" element={<TutorialPostPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
