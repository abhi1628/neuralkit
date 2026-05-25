// src/components/ToolPanel.jsx
import { useState, useRef, useMemo } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, WORD_LIMIT, EXAMPLES } from '../constants';
import { sanitizeInput, sanitizeOutput, trackEvent, countWords, formatOutput } from '../utils';
import WordCounter from './WordCounter';
import TryExample from './TryExample';
import OutputActions from './OutputActions';

export default function ToolPanel({ tool }) {
  const { theme } = useTheme();
  const [input,  setInput]  = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,  setError]  = useState('');
  const outputRef = useRef(null);
  const topRef    = useRef(null);
  const isOverLimit = useMemo(() => countWords(input) > WORD_LIMIT, [input]);

  // Reset when tool changes
  useMemo(() => { setInput(''); setOutput(''); setError(''); }, [tool.id]);

  async function runTool() {
    if (!input.trim() || isOverLimit) return;
    const sanitized = sanitizeInput(input);
    setLoading(true); setOutput(''); setError('');
    trackEvent('tool_run', { tool_name: tool.name, input_length: sanitized.length });
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1000, messages: [{ role: 'system', content: tool.systemPrompt }, { role: 'user', content: sanitized }] }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        setOutput(sanitizeOutput(data.choices[0].message.content));
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      } else if (data?.error) {
        setError(`API Error: ${data.error.message}`);
      } else {
        setError('Unexpected response. Please try again.');
      }
    } catch { setError('Connection error. Please try again.'); }
    setLoading(false);
  }

  function handleClear() {
    setInput(''); setOutput(''); setError('');
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  const formattedOutput = useMemo(() => output ? formatOutput(output, theme) : null, [output, theme]);

  return (
    <div ref={topRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label className="input-label">{tool.inputLabel}</label>
        <TryExample onFill={setInput} exampleMap={EXAMPLES} toolId={tool.id === 'codeExplainer' ? 'codeExplainer' : tool.id} />
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={tool.placeholder}
          rows={8}
          className={`tool-textarea ${isOverLimit ? 'tool-textarea-error' : ''}`}
          aria-label={tool.inputLabel}
        />
        <WordCounter text={input} limit={WORD_LIMIT} />
      </div>
      <button
        onClick={runTool}
        disabled={loading || !input.trim() || isOverLimit}
        className={`run-btn ${loading || !input.trim() || isOverLimit ? 'run-btn-disabled' : ''}`}
        aria-label={tool.cta}
      >
        {loading ? <><span className="spinner" />Analyzing...</> : isOverLimit ? 'Over word limit — trim input' : `→ ${tool.cta}`}
      </button>
      {error  && <div className="error-box">⚠ {error}</div>}
      {output && (
        <div ref={outputRef}>
          <div className="output-panel">
            <div className="output-header">◆ Output</div>
            {formattedOutput}
          </div>
          <OutputActions text={output} filename={`zeroapi-${tool.id}`} onClear={handleClear} />
        </div>
      )}
    </div>
  );
}
