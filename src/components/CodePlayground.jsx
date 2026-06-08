// src/components/CodePlayground.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, LANGUAGES, LANG_MAP, EXAMPLES, TOOL_MODELS } from '../constants';
import { trackEvent, fetchWithBackoff } from '../utils';
import LineNumbers from './LineNumbers';
import OutputActions from './OutputActions';

// ── Language to file extension mapping ───────────────────────
const FILE_EXTENSIONS = {
  python: 'py', c: 'c', cpp: 'cpp', java: 'java',
  javascript: 'js', typescript: 'ts'
};

// ── Language to Replit template mapping ──────────────────────
const REPLIT_TEMPLATES = {
  python: 'python',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  javascript: 'nodejs',
  typescript: 'nodejs'
};

export default function CodePlayground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = 'var(--accent)';
  const navigate = useNavigate();

  // Read URL params FIRST (before any state that depends on them)
  const [searchParams, setSearchParams] = useSearchParams();
  const prefilledCode = searchParams.get('code');
  const prefilledLang = searchParams.get('lang');

  // Initialize state based on URL params or defaults
  const [lang, setLang] = useState(() => {
    if (prefilledLang) {
      const found = LANGUAGES.find(l => l.value === prefilledLang);
      return found || LANGUAGES[0];
    }
    return LANGUAGES[0];
  });

  const [code, setCode] = useState(() => {
    if (prefilledCode) return decodeURIComponent(prefilledCode);
    return lang.starter;
  });

  const [output,      setOutput]      = useState('');
  const [running,     setRunning]     = useState(false);
  const [explaining,  setExplaining]  = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error,       setError]       = useState('');
  const [runError,    setRunError]    = useState(false);
  const [scrollTop,   setScrollTop]   = useState(0);
  const [copiedUrl,   setCopiedUrl]   = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [userInput,   setUserInput]   = useState(''); // ← NEW: User input state
  const codeAreaRef = useRef(null);

  // ── NEW: Load recent runs from localStorage ────────────────
  const [recentRuns, setRecentRuns] = useState(() => {
    try {
      const saved = localStorage.getItem('zeroapi:playground:history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // ── NEW: Save to history after successful run ──────────────
  function saveToHistory(codeText, langValue, outputText, hasError) {
    try {
      const entry = {
        id: Date.now().toString(36),
        code: codeText.slice(0, 5000),
        language: langValue,
        output: outputText.slice(0, 1000),
        hasError,
        timestamp: Date.now()
      };
      const saved = JSON.parse(localStorage.getItem('zeroapi:playground:history') || '[]');
      const updated = [entry, ...saved].slice(0, 20);
      localStorage.setItem('zeroapi:playground:history', JSON.stringify(updated));
      setRecentRuns(updated);
    } catch (err) {
      console.warn('[ZeroAPI] History save failed:', err.message);
    }
  }

  function switchLang(l) { setLang(l); setCode(l.starter); setOutput(''); setExplanation(''); setError(''); setUserInput(''); }

  function loadExample() {
    const ex = EXAMPLES[lang.value] || EXAMPLES.python;
    setCode(ex); setOutput(''); setExplanation(''); setError(''); setUserInput('');
    trackEvent('playground_example', { language: lang.label });
  }

  // ── NEW: Download code as file ─────────────────────────────
  function downloadCode() {
    const ext = FILE_EXTENSIONS[lang.value] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeroapi-${lang.value}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackEvent('playground_download', { language: lang.label });
  }

  // ── NEW: Save & Share via URL ──────────────────────────────
  function shareCode() {
    const encoded = encodeURIComponent(code);
    const url = `${window.location.origin}/playground?lang=${lang.value}&code=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      trackEvent('playground_share', { language: lang.label });
    });
  }

  // ── NEW: Load from history ─────────────────────────────────
  function loadFromHistory(entry) {
    const foundLang = LANGUAGES.find(l => l.value === entry.language);
    if (foundLang) setLang(foundLang);
    setCode(entry.code);
    setOutput(entry.output);
    setRunError(entry.hasError);
    setUserInput('');
    setExplanation('');
    setError('');
    setHistoryOpen(false);
    trackEvent('playground_history_load', { language: entry.language });
  }

  // ── NEW: Clear history ───────────────────────────────────────
  function clearHistory() {
    localStorage.removeItem('zeroapi:playground:history');
    setRecentRuns([]);
    setHistoryOpen(false);
  }

  // ── NEW: Open in Replit ────────────────────────────────────
  function openInReplit() {
    const template = REPLIT_TEMPLATES[lang.value] || 'python';
    const replitUrl = `https://replit.com/new/${template}?name=ZeroAPI-Export`;
    window.open(replitUrl, '_blank', 'noopener,noreferrer');
    trackEvent('playground_replit', { language: lang.label });
  }

  async function runCode() {
    if (!code.trim()) return;
    setRunning(true); setOutput(''); setError(''); setExplanation(''); setRunError(false);
    trackEvent('playground_run', { language: lang.label });
    try {
      const compiler = LANG_MAP[lang.value] || lang.value;
      const res = await fetch('/api/run-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          compiler, 
          code, 
          input: userInput // ← FIXED: Now sends actual user input
        }),
      });
      const data = await res.json();
      const out = data?.output || '';
      const err = data?.error || data?.message || '';
      if (out.trim())                  { setOutput(out.trim()); setRunError(false); }
      else if (err.trim())             { setOutput(err.trim()); setRunError(true);  }
      else if (data?.status === 'success') { setOutput('(No output)'); setRunError(false); }
      else                             { setOutput(`Error: ${data?.status || 'Unknown error'}`); setRunError(true); }

      saveToHistory(code, lang.value, out || err, !!err.trim() || data?.status !== 'success');
    } catch (e) { 
      setError(e.message || 'Connection error.'); 
      saveToHistory(code, lang.value, e.message, true);
    }
    setRunning(false);
  }

  async function explainCode() {
    if (!code.trim()) return;
    setExplaining(true); setExplanation('');
    trackEvent('playground_explain', { language: lang.label });
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: TOOL_MODELS.codePlayground, max_tokens: 500,
          messages: [
            { role: 'system', content: `You are an expert ${lang.label} educator. Explain the given code clearly:
1. **What it does** — one sentence
2. **Line by line** — explain each important line
3. **Key concepts** — what programming concepts are used
4. **Output** — what will it print/return
Keep it beginner-friendly and concise.` },
            { role: 'user',   content: `Explain this ${lang.label} code:

${code}` },
          ],
        }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) setExplanation(data.choices[0].message.content);
      else setError("Couldn't get explanation. Try again.");
    } catch { setError('Connection error.'); }
    setExplaining(false);
  }

  function formatExplanation(text) {
    return text.split('\n').map((line, i) => {
      const isBold = line.startsWith('**') || line.match(/^[1-9]\./);
      return <div key={i} style={{ marginBottom: line === '' ? '12px' : '5px', fontWeight: isBold ? 700 : 400, color: isBold ? 'var(--accent)' : (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)'), fontSize: '0.88rem', lineHeight: 1.8, paddingLeft: isBold ? 0 : '4px', textAlign: 'left' }}>{line.replace(/\*\*/g, '')}</div>;
    });
  }

  const handleCodeKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.target.selectionStart;
      const newCode = code.substring(0, s) + '  ' + code.substring(e.target.selectionEnd);
      setCode(newCode);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
  }, [code]);

  // ── Detect if code needs user input ─────────────────────────
  function codeNeedsInput(code) {
    const inputPatterns = [
      /\binput\s*\(/,           // Python input()
      /\braw_input\s*\(/,      // Python 2 raw_input()
      /\bscanf\s*\(/,           // C scanf()
      /\bfgets\s*\(/,           // C fgets()
      /\bgetchar\s*\(/,         // C getchar()
      /\bgetch\s*\(/,           // C getch()
      /\bcin\s*>>/,             // C++ cin
      /\bgetline\s*\(/,         // C++ getline
      /\bScanner\s*\(/,         // Java Scanner
      /\bSystem\.in\b/,          // Java System.in
      /\breadLine\s*\(/,        // Java readLine
      /\bprompt\s*\(/,          // JS prompt()
      /\bwindow\.prompt\b/,      // JS window.prompt
      /\breadline\s*\(/,        // Node readline
      /\bprocess\.stdin\b/,      // Node process.stdin
    ];
    return inputPatterns.some(p => p.test(code));
  }
  return (
    <section id="playground" style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 32px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: ac, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>◆ Code Playground</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '12px' }}>Write. Run. Learn.</h2>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.6)', fontSize: '1rem', fontWeight: 300 }}>Browser-based code editor · 6 languages · AI explanation built-in</p>
      </div>

      {/* Language selector */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {LANGUAGES.map(l => (
          <button key={l.value} onClick={() => switchLang(l)}
            style={{ background: lang.value === l.value ? 'linear-gradient(135deg, #a78bfa, #818cf8)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), border: lang.value === l.value ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '100px', padding: '8px 18px', color: lang.value === l.value ? '#000' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)'), fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: lang.value === l.value ? '0 0 16px rgba(167,139,250,0.3)' : 'none' }}
            aria-label={`Switch to ${l.label}`}>
            {l.icon} {l.label}
          </button>
        ))}
        <button onClick={loadExample} className="try-example-btn" style={{ marginLeft: 'auto' }}>✨ Try Example</button>
      </div>

      {/* Editor */}
      <div style={{ background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '20px', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />)}
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.5)', marginLeft: '8px' }}>{lang.icon} {lang.label} Editor</span>
          </div>

          {/* Action buttons row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={downloadCode} title="Download as file"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '8px', padding: '6px 14px', color: 'var(--text-secondary)', fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💾 Download
            </button>

            <button onClick={shareCode} title="Copy shareable link"
              style={{ background: copiedUrl ? 'rgba(52,211,153,0.12)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'), border: `1px solid ${copiedUrl ? 'rgba(52,211,153,0.3)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)')}`, borderRadius: '8px', padding: '6px 14px', color: copiedUrl ? '#34d399' : 'var(--text-secondary)', fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              {copiedUrl ? '✓ Copied!' : '🔗 Share'}
            </button>

            <button onClick={openInReplit} title="Open this code in Replit"
              style={{ background: 'rgba(167,139,250,0.08)', border: `1px solid ${ac}33`, borderRadius: '8px', padding: '6px 14px', color: ac, fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🚀 Replit
            </button>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setHistoryOpen(!historyOpen)} title="Recent runs"
                style={{ background: recentRuns.length > 0 ? 'rgba(167,139,250,0.08)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'), border: `1px solid ${recentRuns.length > 0 ? ac + '33' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)')}`, borderRadius: '8px', padding: '6px 14px', color: recentRuns.length > 0 ? ac : 'var(--text-muted)', fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', cursor: recentRuns.length > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🕐 History {recentRuns.length > 0 && `(${recentRuns.length})`}
              </button>

              {historyOpen && recentRuns.length > 0 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px', maxHeight: '400px', overflowY: 'auto', background: isDark ? '#1a1a2e' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px', padding: '12px', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: ac, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recent Runs</span>
                    <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: '0.65rem', cursor: 'pointer', fontFamily: "'Space Mono', monospace" }}>Clear</button>
                  </div>
                  {recentRuns.map((entry, idx) => (
                    <button key={entry.id} onClick={() => loadFromHistory(entry)}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: idx < recentRuns.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}` : 'none', padding: '10px 8px', cursor: 'pointer', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.8)' : '#1a1a1a', fontWeight: 600 }}>
                          {LANGUAGES.find(l => l.value === entry.language)?.icon || '💻'} {LANGUAGES.find(l => l.value === entry.language)?.label || entry.language}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', fontFamily: "'Space Mono', monospace" }}>
                          {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {entry.code.split('\n')[0].slice(0, 40)}
                      </div>
                      {entry.hasError && <span style={{ fontSize: '0.6rem', color: '#ff6b6b' }}>⚠ Error</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={runCode} disabled={running}
              style={{ background: running ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #a78bfa, #818cf8)', border: 'none', borderRadius: '8px', padding: '6px 20px', color: running ? 'var(--text-muted)' : '#000', fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              aria-label="Run code">
              {running ? <><span className="spinner" style={{ width: '10px', height: '10px' }} />Running...</> : '▶ Run'}
            </button>
          </div>
        </div>

        {/* Code area */}
        <div style={{ position: 'relative', display: 'flex' }}>
          <LineNumbers code={code} />
          <textarea ref={codeAreaRef} value={code} onChange={e => setCode(e.target.value)} onKeyDown={handleCodeKeyDown} onScroll={e => setScrollTop(e.target.scrollTop)} spellCheck={false} className="code-editor"
            style={{ flex: 1, minHeight: '280px', border: 'none', padding: '20px 20px', fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', lineHeight: 1.8, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            aria-label="Code editor" />
        </div>

        {/* ── NEW: User Input Area ─────────────────────────────── */}
        {codeNeedsInput(code) && (
          <div style={{ 
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, 
            background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.03)' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '8px 20px', 
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}` 
            }}>
              <span style={{ 
                fontFamily: "'Space Mono', monospace", 
                fontSize: '0.68rem', 
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase' 
              }}>
                ◆ Input (stdin)
              </span>
              <span style={{ 
                fontSize: '0.6rem', 
                color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)', 
                fontFamily: "'Space Mono', monospace" 
              }}>
                Use for input(), scanf(), Scanner, etc.
              </span>
            </div>
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder={isDark ? 'Enter input values here (one per line)...' : 'Enter input values here (one per line)...'}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: '60px',
                border: 'none',
                padding: '12px 20px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.82rem',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                background: 'transparent',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* Output */}
        {(output || error) && (
          <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
            <div style={{ padding: '10px 20px', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: runError ? '#ff6b6b' : ac, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{runError ? '⚠ Error' : '◆ Output'}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setOutput(''); setExplanation(''); setError(''); setRunError(false); setUserInput(''); }} style={{ background: 'rgba(167,139,250,0.06)', border: `1px solid ${ac}33`, borderRadius: '8px', padding: '5px 14px', color: ac, fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', cursor: 'pointer' }}>↺ Clear Console</button>
                <button onClick={explainCode} disabled={explaining}
                  style={{ background: explaining ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'rgba(167,139,250,0.08)', border: `1px solid ${ac}33`, borderRadius: '8px', padding: '5px 14px', color: explaining ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : ac, fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', cursor: explaining ? 'not-allowed' : 'pointer' }}>
                  {explaining ? 'Explaining...' : '🧠 Ask AI to Explain'}
                </button>
              </div>
            </div>
            <pre style={{ margin: 0, padding: '16px 20px', fontFamily: "'Space Mono', monospace", fontSize: '0.82rem', color: runError ? '#ff6b6b' : (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)'), lineHeight: 1.7, background: isDark ? '#0d1117' : '#f5f5f5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {output}
            </pre>
          </div>
        )}
      </div>

      {/* AI Explanation */}
      {explanation && (
        <div style={{ marginTop: '20px', background: 'rgba(167,139,250,0.03)', border: `1px solid ${ac}1F`, borderRadius: '16px', padding: '24px 28px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid ${ac}1A` }}>🧠 AI Explanation</div>
          {formatExplanation(explanation)}
          <OutputActions text={explanation} filename="zeroapi-code-explanation" onClear={() => { setExplanation(''); setOutput(''); setRunError(false); setUserInput(''); }} />
        </div>
      )}

      {/* Hints */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.14)'}`, borderRadius: '100px', padding: '6px 16px', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: isDark ? 'rgba(255,255,255,0.45)' : '#334155', letterSpacing: '0.04em' }}>
          💡 Tab to indent · Ctrl+Enter to run · Run code first, then "Ask AI to Explain"
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: isDark ? 'rgba(255,255,255,0.35)' : '#475569', letterSpacing: '0.03em' }}>
          <span>⚡ Powered by OnlineCompiler.io</span>
          <span style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.25)' }}>·</span>
          <span>Standard library only</span>
          <span style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.25)' }}>·</span>
          <span onClick={() => window.open('https://colab.research.google.com', '_blank', 'noopener,noreferrer')} style={{ color: isDark ? '#a78bfa' : '#7c3aed', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 600 }}>Use Colab for ML/DL</span>
        </div>
      </div>
    </section>
  );
}
