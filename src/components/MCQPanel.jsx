// src/components/MCQPanel.jsx
import { useState, useRef, useMemo } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, WORD_LIMIT, EXAMPLES } from '../constants';
import { sanitizeInput, sanitizeOutput, trackEvent, countWords, fetchWithBackoff } from '../utils';
import WordCounter from './WordCounter';
import TryExample from './TryExample';
import OutputActions from './OutputActions';

export default function MCQPanel({ tool }) {
  const { theme } = useTheme();
  const [input,     setInput]     = useState('');
  const [rawOutput, setRawOutput] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [history,   setHistory]   = useState([]);
  const outputRef   = useRef(null);
  const isOverLimit = useMemo(() => countWords(input) > WORD_LIMIT, [input]);

  async function generate() {
    if (!input.trim() || isOverLimit) return;
    const sanitized = sanitizeInput(input);
    setLoading(true); setRawOutput(''); setError('');
    trackEvent('tool_run', { tool_name: 'MCQ Generator' });
    const historyContext = history.length > 0
      ? `\n\nPreviously generated questions (DO NOT repeat):\n${history.slice(-3).join('\n\n---\n\n')}`
      : '';
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', max_tokens: 900, temperature: 0.9,
          messages: [
            { role: 'system', content: tool.systemPrompt + '\n\nCRITICAL: Generate completely different questions from any previously shown. Focus on different sub-topics, angles, and difficulty levels.' },
            { role: 'user',   content: sanitized + historyContext },
          ],
        }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        const out = sanitizeOutput(data.choices[0].message.content);
        setRawOutput(out);
        setHistory(prev => [...prev, out].slice(-5));
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      } else if (data?.error) {
        setError(`API Error: ${data.error.message}`);
      } else {
        setError('Unexpected response. Please try again.');
      }
    } catch (e) { setError(e.message || 'Connection error. Please try again.'); }
    setLoading(false);
  }

  const formattedMCQ = useMemo(() => {
    if (!rawOutput) return null;
    const blocks = rawOutput.split(/\n(?=Q\d+\.\s)/).filter(b => b.trim());
    return blocks.map((block, i) => {
      const lines   = block.trim().split('\n').filter(l => l.trim());
      const qLine   = lines[0] || '';
      const opts    = lines.filter(l => l.match(/^[A-D]\)/));
      const ansLine = lines.find(l => l.includes('✅')) || '';
      const expLine = (lines.find(l => l.includes('💡')) || '').replace(/undefineddefined/g, '').replace(/undefined/g, '');
      return (
        <div key={i} className="mcq-block">
          <div className="mcq-label">QUESTION {i + 1}</div>
          <div className="mcq-question">{qLine.replace(/^Q\d+\.\s*/, '')}</div>
          <div className="mcq-grid">{opts.map((opt, j) => <div key={j} className="mcq-option">{opt}</div>)}</div>
          {ansLine && <div className="mcq-answer">{ansLine}</div>}
          {expLine && <div className="mcq-explanation">{expLine}</div>}
        </div>
      );
    });
  }, [rawOutput]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label className="input-label">{tool.inputLabel}</label>
        <TryExample onFill={setInput} exampleMap={EXAMPLES} toolId="mcq" />
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={tool.placeholder}
          rows={6}
          className={`tool-textarea ${isOverLimit ? 'tool-textarea-error' : ''}`}
          aria-label={tool.inputLabel}
        />
        <WordCounter text={input} limit={WORD_LIMIT} />
      </div>
      <button
        onClick={generate}
        disabled={loading || !input.trim() || isOverLimit}
        className={`run-btn ${loading || !input.trim() || isOverLimit ? 'run-btn-disabled' : ''}`}
        aria-label="Generate 5 MCQs"
      >
        {loading ? <><span className="spinner" />Generating MCQs...</> : isOverLimit ? 'Over word limit — trim input' : '→ Generate 5 MCQs'}
      </button>
      {error && <div className="error-box">⚠ {error}</div>}
      {rawOutput && (
        <div ref={outputRef}>
          <div className="output-header-mcq">◆ Generated Questions</div>
          {formattedMCQ}
          <OutputActions text={rawOutput} filename="zeroapi-mcqs" onClear={() => { setInput(''); setRawOutput(''); setError(''); }} />
        </div>
      )}
    </div>
  );
}
