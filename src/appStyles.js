// src/appStyles.js
// All global CSS for ZeroAPI injected via <style> in App.jsx

const appStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

  :root {
    --bg-primary: #f8fafc; --bg-secondary: #ffffff; --bg-tertiary: #f1f5f9;
    --bg-elevated: #ffffff; --bg-code: #1e1e2e;
    --text-primary: #0f172a; --text-secondary: #334155; --text-muted: #64748b; --text-inverse: #ffffff;
    --accent: #00897b; --accent-light: #e0f2f1; --accent-glow: rgba(0, 137, 123, 0.15);
    --border-subtle: rgba(0,0,0,0.07); --border-medium: rgba(0,0,0,0.13); --border-strong: rgba(0,0,0,0.22);
    --error: #dc2626; --error-bg: rgba(220,38,38,0.07); --warning: #b45309; --success: #15803d;
  }
  [data-theme="dark"] {
    --bg-primary: #060a0f; --bg-secondary: rgba(255,255,255,0.04); --bg-tertiary: rgba(255,255,255,0.03);
    --bg-elevated: rgba(255,255,255,0.06); --bg-code: #0d1117;
    --text-primary: #ffffff; --text-secondary: rgba(255,255,255,0.7); --text-muted: rgba(255,255,255,0.5); --text-inverse: #1a1a2e;
    --accent: #00ffe0; --accent-light: rgba(0,255,224,0.08); --accent-glow: rgba(0,255,224,0.15);
    --border-subtle: rgba(255,255,255,0.08); --border-medium: rgba(255,255,255,0.12); --border-strong: rgba(255,255,255,0.2);
    --error: #ff6b6b; --error-bg: rgba(255,80,80,0.1); --warning: #febc2e; --success: #00ffe0;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; min-height: 100vh; background: var(--bg-primary); color: var(--text-primary); overflow-x: hidden; }
  #root { width: 100%; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes float   { 0% { transform: translateY(0px) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 0.4; } 100% { transform: translateY(-120vh) scale(0.5); opacity: 0; } }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse   { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

  .hero-title  { animation: fadeUp 0.9s ease forwards; }
  .hero-sub    { animation: fadeUp 0.9s ease 0.2s both; }
  .hero-cta    { animation: fadeUp 0.9s ease 0.4s both; }
  .tools-section { animation: fadeUp 0.9s ease 0.15s both; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg-primary); }
  ::-webkit-scrollbar-thumb { background: var(--accent); opacity: 0.3; border-radius: 3px; }

  .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-top: 2px solid #00ffe0; border-radius: 50%; animation: spin 0.8s linear infinite; vertical-align: middle; }
  .try-example-btn { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,255,224,0.06); border: 1px solid rgba(0,255,224,0.15); border-radius: 8px; padding: 6px 14px; color: var(--accent); font-family: 'Space Mono', monospace; font-size: 0.72rem; cursor: pointer; margin-bottom: 12px; transition: all 0.2s; }
  .try-example-btn:hover { background: rgba(0,255,224,0.12); }
  .scroll-to-top { position: fixed; bottom: 60px; right: 24px; z-index: 99; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #00ffe0, #0af); border: none; color: #000; font-size: 1.2rem; cursor: pointer; box-shadow: 0 0 24px rgba(0,255,224,0.4); display: flex; align-items: center; justify-content: center; transition: all 0.3s; animation: fadeUp 0.3s ease; }
  .scroll-to-top:hover { transform: scale(1.1); }
  .input-label { display: block; font-family: 'Space Mono', monospace; font-size: 0.72rem; color: var(--accent); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
  .tool-textarea { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 12px; padding: 16px; color: var(--text-primary); font-family: 'Space Mono', monospace; font-size: 0.82rem; line-height: 1.7; resize: vertical; outline: none; box-sizing: border-box; transition: border 0.2s; }
  .tool-textarea:focus { border-color: var(--accent); }
  .tool-textarea-error { border-color: rgba(255,80,80,0.4) !important; }
  .run-btn { background: linear-gradient(135deg, #00ffe0 0%, #0af 100%); border: none; border-radius: 10px; padding: 14px 28px; color: #000; font-family: 'Space Mono', monospace; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px; justify-content: center; box-shadow: 0 0 24px rgba(0,255,224,0.3); }
  .run-btn-disabled { background: var(--bg-tertiary) !important; color: var(--text-muted) !important; cursor: not-allowed !important; box-shadow: none !important; }
  .error-box { background: var(--error-bg); border: 1px solid rgba(220,38,38,0.3); border-radius: 10px; padding: 14px; color: var(--error); font-size: 0.82rem; font-family: 'Space Mono', monospace; }
  .output-panel { background: var(--accent-light); border: 1px solid var(--border-medium); border-radius: 12px; padding: 24px 28px; }
  .output-header { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border-subtle); }
  .output-header-mcq { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }
  .action-btn { display: flex; align-items: center; gap: 6px; background: var(--bg-elevated); border: 1px solid var(--border-medium); border-radius: 8px; padding: 8px 16px; color: var(--text-secondary); font-family: 'Space Mono', monospace; font-size: 0.72rem; cursor: pointer; transition: all 0.2s; }
  .action-btn-success { background: var(--accent-light); border-color: var(--accent); color: var(--accent); }
  .action-btn:hover { border-color: var(--accent); }
  .mcq-block { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
  .mcq-label { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 10px; }
  .mcq-question { font-weight: 700; color: var(--text-primary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 14px; text-align: left; }
  .mcq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .mcq-option { background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 12px; font-size: 0.83rem; color: var(--text-secondary); text-align: left; }
  .mcq-answer { background: rgba(0,255,224,0.08); border: 1px solid var(--accent); border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: var(--accent); margin-bottom: 8px; }
  .mcq-explanation { font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; }
  .upload-zone { border: 2px dashed var(--border-medium); border-radius: 14px; padding: 36px 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
  .upload-zone:hover { border-color: var(--accent); }
  .upload-hint { margin-top: -10px; font-size: 0.7rem; color: #febc2e; font-family: 'Space Mono', monospace; text-align: center; }
  .share-score-btn { font-family: 'Space Mono', monospace; font-size: 0.68rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 3px 12px; color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; }
  .share-score-btn:hover { color: var(--accent); }
  .new-question-btn { background: rgba(0,255,224,0.08); border: 1px solid var(--accent); border-radius: 10px; padding: 10px 24px; color: var(--accent); font-family: 'Space Mono', monospace; font-size: 0.78rem; cursor: pointer; letter-spacing: 0.05em; transition: all 0.2s; }
  .new-question-btn:hover { background: rgba(0,255,224,0.15); }
  .text-link { background: none; border: none; color: var(--accent); cursor: pointer; text-decoration: underline; }
  .code-editor { background: #0d1117; color: #e6edf3; }

  [data-theme="light"] .spinner { border-color: rgba(0,0,0,0.12); border-top-color: #00897b; }
  [data-theme="light"] .upload-hint { color: #b45309; }
  [data-theme="light"] .share-score-btn { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.12); color: #64748b; }
  [data-theme="light"] .share-score-btn:hover { color: #00897b; }
  [data-theme="light"] .mcq-answer { background: rgba(0,137,123,0.08); }
  [data-theme="light"] .mcq-explanation { color: #475569; }
  [data-theme="light"] .new-question-btn { background: rgba(0,137,123,0.06); }
  [data-theme="light"] .new-question-btn:hover { background: rgba(0,137,123,0.12); }
  [data-theme="light"] .try-example-btn { background: rgba(0,137,123,0.06); border-color: rgba(0,137,123,0.2); }
  [data-theme="light"] .try-example-btn:hover { background: rgba(0,137,123,0.12); }
  [data-theme="light"] .tool-card-inactive { background: var(--bg-secondary) !important; border-color: var(--border-medium) !important; }
  [data-theme="light"] .tool-card-inactive:hover { border-color: var(--accent) !important; background: var(--bg-elevated) !important; }
  [data-theme="light"] .output-panel { background: var(--bg-secondary) !important; border-color: var(--border-medium) !important; }
  [data-theme="light"] .code-editor { background: #1e1e2e !important; color: #e6edf3 !important; }

  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .hamburger-btn { display: flex !important; }
    .theme-toggle-btn { margin-left: 0 !important; }
    .hero-section { padding: 100px 20px 60px !important; min-height: auto !important; }
    .hero-title { font-size: clamp(1.8rem, 8vw, 2.8rem) !important; }
    .tools-section { padding: 60px 20px 80px !important; }
    .tool-row { flex-direction: column !important; }
    .tool-panel { padding: 24px !important; }
    .mcq-grid { grid-template-columns: 1fr !important; }
    .trivia-grid { grid-template-columns: 1fr !important; }
    .trivia-section { padding: 40px 20px !important; }
    #playground { padding: 60px 20px !important; }
    .about-section { padding: 60px 20px !important; }
    .about-buttons { flex-direction: column !important; align-items: center !important; }
    .footer-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 16px !important; }
    nav { padding: 14px 20px !important; }
    .nav-try-btn { display: none !important; }
    .mobile-menu { pointer-events: auto !important; }
    footer { padding: 28px 20px !important; }
  }
  .mobile-menu { isolation: isolate; }
  @supports (backdrop-filter: blur(20px)) {
    .mobile-menu { backdrop-filter: blur(20px) saturate(180%); }
  }
`;

export default appStyles;
