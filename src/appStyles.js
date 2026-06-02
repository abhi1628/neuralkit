// src/appStyles.js
const appStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

  :root {
    --bg-primary: #faf8ff; --bg-secondary: #ffffff; --bg-tertiary: #f3f0ff;
    --bg-elevated: #ffffff; --bg-code: #1e1b2e;
    --text-primary: #1e1b4b; --text-secondary: #3730a3; --text-muted: #6d6a8a; --text-inverse: #ffffff;
    --accent: #7c3aed; --accent-light: #ede9fe; --accent-glow: rgba(124,58,237,0.15);
    --border-subtle: rgba(124,58,237,0.07); --border-medium: rgba(124,58,237,0.14); --border-strong: rgba(124,58,237,0.25);
    --error: #dc2626; --error-bg: rgba(220,38,38,0.07); --warning: #b45309; --success: #059669;
    --gradient: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
    --gradient-text: linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #6366f1 100%);
    --glow: 0 0 32px rgba(124,58,237,0.35);
  }
  [data-theme="dark"] {
    --bg-primary: #08070f; --bg-secondary: rgba(167,139,250,0.04); --bg-tertiary: rgba(167,139,250,0.03);
    --bg-elevated: rgba(255,255,255,0.06); --bg-code: #0d0b1a;
    --text-primary: #f1f5f9; --text-secondary: rgba(241,245,249,0.72); --text-muted: rgba(241,245,249,0.45); --text-inverse: #1e1b4b;
    --accent: #a78bfa; --accent-light: rgba(167,139,250,0.1); --accent-glow: rgba(167,139,250,0.2);
    --border-subtle: rgba(167,139,250,0.1); --border-medium: rgba(167,139,250,0.16); --border-strong: rgba(167,139,250,0.28);
    --error: #f87171; --error-bg: rgba(248,113,113,0.1); --warning: #fbbf24; --success: #34d399;
    --gradient: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
    --gradient-text: linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #818cf8 100%);
    --glow: 0 0 40px rgba(167,139,250,0.4);
  }

  *, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
    transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  html, body { 
    width: 100%; 
    min-height: 100vh; 
    background: var(--bg-primary); 
    color: var(--text-primary); 
    overflow-x: hidden; 
    transition: background-color 0.3s ease;
  }
  #root { width: 100%; }

  /* Lock in your hero titles to use CSS transitions directly */
  .hero-title { 
    color: var(--text-primary) !important; 
    transition: color 0.3s ease;
    animation: fadeUp 0.9s ease forwards; 
  }
  .hero-title span.gradient-span {
    background: var(--gradient-text) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    display: inline-block;
  }

  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes spinSlow  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes spinRevSlow { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
  @keyframes float     { 0% { transform: translateY(0px) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 0.4; } 100% { transform: translateY(-120vh) scale(0.5); opacity: 0; } }
  @keyframes fadeUp    { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse     { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
  @keyframes glowPulse { 0%, 100% { filter: drop-shadow(0 0 12px rgba(167,139,250,0.5)); } 50% { filter: drop-shadow(0 0 28px rgba(167,139,250,0.9)); } }

  .hero-sub       { animation: fadeUp 0.9s ease 0.2s both; }
  .hero-cta       { animation: fadeUp 0.9s ease 0.4s both; }
  .tools-section  { animation: fadeUp 0.9s ease 0.15s both; }
  .hero-logo-ring { animation: spinSlow 18s linear infinite; }
  .hero-logo-ring2{ animation: spinRevSlow 12s linear infinite; }
  .hero-logo-mark { animation: glowPulse 3s ease infinite; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg-primary); }
  ::-webkit-scrollbar-thumb { background: var(--accent); opacity: 0.4; border-radius: 3px; }

  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(167,139,250,0.2); border-top: 2px solid var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; vertical-align: middle; }

  .try-example-btn { display: inline-flex; align-items: center; gap: 6px; background: var(--accent-light); border: 1px solid var(--border-medium); border-radius: 8px; padding: 6px 14px; color: var(--accent); font-family: 'Space Mono', monospace; font-size: 0.72rem; cursor: pointer; margin-bottom: 12px; transition: all 0.2s; }
  .try-example-btn:hover { background: rgba(124,58,237,0.15); }
  [data-theme="dark"] .try-example-btn { background: rgba(167,139,250,0.08); border-color: rgba(167,139,250,0.2); }
  [data-theme="dark"] .try-example-btn:hover { background: rgba(167,139,250,0.15); }

  .scroll-to-top { position: fixed; bottom: 60px; right: 24px; z-index: 99; width: 48px; height: 48px; border-radius: 50%; background: var(--gradient); border: none; color: #fff; font-size: 1.2rem; cursor: pointer; box-shadow: var(--glow); display: flex; align-items: center; justify-content: center; transition: all 0.3s; animation: fadeUp 0.3s ease; }
  .scroll-to-top:hover { transform: scale(1.1); }

  .input-label { display: block; font-family: 'Space Mono', monospace; font-size: 0.72rem; color: var(--accent); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }

  .tool-textarea { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 12px; padding: 16px; color: var(--text-primary); font-family: 'Space Mono', monospace; font-size: 0.82rem; line-height: 1.7; resize: vertical; outline: none; box-sizing: border-box; transition: border 0.2s; }
  .tool-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
  .tool-textarea-error { border-color: rgba(220,38,38,0.4) !important; }

  .run-btn { background: var(--gradient); border: none; border-radius: 10px; padding: 14px 28px; color: #fff; font-family: 'Space Mono', monospace; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; gap: 10px; justify-content: center; box-shadow: var(--glow); }
  .run-btn:hover { transform: translateY(-1px); box-shadow: 0 0 48px rgba(124,58,237,0.5); }
  .run-btn-disabled { background: var(--bg-tertiary) !important; color: var(--text-muted) !important; cursor: not-allowed !important; box-shadow: none !important; transform: none !important; }

  .error-box { background: var(--error-bg); border: 1px solid rgba(220,38,38,0.3); border-radius: 10px; padding: 14px; color: var(--error); font-size: 0.82rem; font-family: 'Space Mono', monospace; }

  .output-panel { background: var(--accent-light); border: 1px solid var(--border-medium); border-radius: 12px; padding: 24px 28px; }
  [data-theme="dark"] .output-panel { background: rgba(167,139,250,0.05) !important; border-color: rgba(167,139,250,0.15) !important; }
  [data-theme="light"] .output-panel { background: var(--bg-secondary) !important; }

  .output-header { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle); }
  .output-header-mcq { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }

  .action-btn { display: flex; align-items: center; gap: 6px; background: var(--bg-elevated); border: 1px solid var(--border-medium); border-radius: 8px; padding: 8px 16px; color: var(--text-secondary); font-family: 'Space Mono', monospace; font-size: 0.72rem; cursor: pointer; transition: all 0.2s; }
  .action-btn-success { background: var(--accent-light); border-color: var(--accent); color: var(--accent); }
  .action-btn:hover { border-color: var(--accent); color: var(--accent); }

  .mcq-block { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
  .mcq-label { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 10px; }
  .mcq-question { font-weight: 700; color: var(--text-primary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 14px; text-align: left; }
  .mcq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .mcq-option { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 12px; font-size: 0.83rem; color: var(--text-secondary); text-align: left; }
  .mcq-answer { background: var(--accent-light); border: 1px solid var(--accent); border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: var(--accent); margin-bottom: 8px; }
  .mcq-explanation { font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; }

  .upload-zone { border: 2px dashed var(--border-medium); border-radius: 14px; padding: 36px 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
  .upload-zone:hover { border-color: var(--accent); background: var(--accent-light); }

  .upload-hint { margin-top: -10px; font-size: 0.7rem; color: var(--warning); font-family: 'Space Mono', monospace; text-align: center; }

  .share-score-btn { font-family: 'Space Mono', monospace; font-size: 0.68rem; background: var(--accent-light); border: 1px solid var(--border-medium); border-radius: 100px; padding: 3px 12px; color: var(--accent); cursor: pointer; transition: all 0.2s; }
  .share-score-btn:hover { border-color: var(--accent); }

  .new-question-btn { background: var(--accent-light); border: 1px solid var(--accent); border-radius: 10px; padding: 10px 24px; color: var(--accent); font-family: 'Space Mono', monospace; font-size: 0.78rem; cursor: pointer; letter-spacing: 0.05em; transition: all 0.2s; }
  .new-question-btn:hover { background: rgba(124,58,237,0.2); }
  [data-theme="dark"] .new-question-btn:hover { background: rgba(167,139,250,0.2); }

  .text-link { background: none; border: none; color: var(--accent); cursor: pointer; text-decoration: underline; }
  .code-editor { background: #0d0b1a; color: #e2e0ff; }

  .tool-card-inactive { background: var(--bg-secondary) !important; border-color: var(--border-medium) !important; }
  .tool-card-inactive:hover { border-color: var(--accent) !important; background: var(--accent-light) !important; }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .hamburger-btn { display: flex !important; }
    .theme-toggle-btn { margin-left: 0 !important; }
    .hero-section { padding: 100px 16px 60px !important; min-height: auto !important; }
    .hero-title { font-size: clamp(1.8rem, 8vw, 2.8rem) !important; }
    .tools-section { padding: 60px 16px 80px !important; }
    .tool-row { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .tool-panel { padding: 20px !important; }
    .mcq-grid { grid-template-columns: 1fr !important; }
    .mcq-question { font-size: 0.88rem !important; }
    .trivia-grid { grid-template-columns: 1fr !important; }
    .trivia-section { padding: 40px 16px !important; }
    #playground { padding: 60px 16px !important; }
    .about-section { padding: 60px 16px !important; }
    .about-buttons { flex-direction: column !important; align-items: center !important; }
    .footer-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 16px !important; }
    nav { padding: 14px 16px !important; }
    .nav-try-btn { display: none !important; }
    .mobile-menu { pointer-events: auto !important; }
    footer { padding: 28px 16px !important; }
    .hero-logo-large { width: 100px !important; height: 100px !important; }
  }
  .mobile-menu { isolation: isolate; }
  @supports (backdrop-filter: blur(20px)) {
    .mobile-menu { backdrop-filter: blur(20px) saturate(180%); }
  }
`;

export default appStyles;
