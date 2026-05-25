// src/components/CodePlayground.jsx
import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, LANGUAGES, LANG_MAP, EXAMPLES } from '../constants';
import { trackEvent, fetchWithBackoff } from '../utils';
import LineNumbers from './LineNumbers';
import OutputActions from './OutputActions';

export default function CodePlayground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = 'var(--accent)';

  const [lang,        setLang]        = useState(LANGUAGES[0]);
  const [code,        setCode]        = useState(LANGUAGES[0].starter);
  const [output,      setOutput]      = useState('');
  const [running,     setRunning]     = useState(false);
  const [explaining,  setExplaining]  = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error,       setError]       = useState('');
  const [runError,    setRunError]    = useState(false);
  const [scrollTop,   setScrollTop]   = useState(0);
  const codeAreaRef = useRef(null);

  function switchLang(l) { setLang(l); setCode(l.starter); setOutput(''); setExplanation(''); setError(''); }

  function loadExample() {
    const ex = EXAMPLES[lang.value] || EXAMPLES.python;
    setCode(ex); setOutput(''); setExplanation(''); setError('');
    trackEvent('playground_example', { language: lang.label });
  }

  async function runCode() {
    if (!code.trim()) return;
    setRunning(true); setOutput(''); setError(''); setExplanation(''); setRunError(false);
    trackEvent('playground_run', { language: lang.label });
    try {
      const compiler = LANG_MAP[lang.value] || lang.value;
      const res = await fetch('/api/run-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compiler, code, input: '' }),
      });
      const data = await res.json();
      const out = data?.output || '';
      const err = data?.error || data?.message || '';
      if (out.trim())                  { setOutput(out.trim()); setRunError(false); }
      else if (err.trim())             { setOutput(err.trim()); setRunError(true);  }
      else if (data?.status === 'success') { setOutput('(No output)'); setRunError(false); }
      else                             { setOutput(`Error: ${data?.status || 'Unknown error'}`); setRunError(true); }
    } catch (e) { setError(e.message || 'Connection error.'); }
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
          model: 'llama-3.3-70b-versatile', max_tokens: 500,
          messages: [
            { role: 'system', content: `You are an expert ${lang.label} educator. Explain the given code clearly:\n1. **What it does** — one sentence\n2. **Line by line** — explain each important line\n3. **Key concepts** — what programming concepts are used\n4. **Output** — what will it print/return\nKeep it beginner-friendly and concise.` },
            { role: 'user',   content: `Explain this ${lang.label} code:\n\n${code}` },
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
            style={{ background: lang.value === l.value ? 'linear-gradient(135deg, #00ffe0, #0af)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), border: lang.value === l.value ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '100px', padding: '8px 18px', color: lang.value === l.value ? '#000' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)'), fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: lang.value === l.value ? '0 0 16px rgba(0,255,224,0.3)' : 'none' }}
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
          <div style={{ display: 'flex', gap: '10px' }}>
            {[{label:'Clear', action: () => { setCode(''); setOutput(''); setExplanation(''); }}, {label:'Reset', action: () => { setCode(lang.starter); setOutput(''); setExplanation(''); }}].map(b => (
              <button key={b.label} onClick={b.action} style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '8px', padding: '6px 14px', color: 'var(--text-secondary)', fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', cursor: 'pointer' }}>{b.label}</button>
            ))}
            <button onClick={runCode} disabled={running}
              style={{ background: running ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #00ffe0, #0af)', border: 'none', borderRadius: '8px', padding: '6px 20px', color: running ? 'var(--text-muted)' : '#000', fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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

        {/* Output */}
        {(output || error) && (
          <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
            <div style={{ padding: '10px 20px', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: runError ? '#ff6b6b' : ac, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{runError ? '⚠ Error' : '◆ Output'}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setOutput(''); setExplanation(''); setError(''); setRunError(false); }} style={{ background: 'rgba(0,255,224,0.06)', border: `1px solid ${ac}33`, borderRadius: '8px', padding: '5px 14px', color: ac, fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', cursor: 'pointer' }}>↺ Clear Console</button>
                <button onClick={explainCode} disabled={explaining}
                  style={{ background: explaining ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'rgba(0,255,224,0.08)', border: `1px solid ${ac}33`, borderRadius: '8px', padding: '5px 14px', color: explaining ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : ac, fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', cursor: explaining ? 'not-allowed' : 'pointer' }}>
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
        <div style={{ marginTop: '20px', background: 'rgba(0,255,224,0.03)', border: `1px solid ${ac}1F`, borderRadius: '16px', padding: '24px 28px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid ${ac}1A` }}>🧠 AI Explanation</div>
          {formatExplanation(explanation)}
          <OutputActions text={explanation} filename="zeroapi-code-explanation" onClear={() => { setExplanation(''); setOutput(''); setRunError(false); }} />
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
          <span onClick={() => window.open('https://colab.research.google.com', '_blank', 'noopener,noreferrer')} style={{ color: isDark ? '#00ffe0' : '#00897b', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 600 }}>Use Colab for ML/DL</span>
        </div>
      </div>
    </section>
  );
}
