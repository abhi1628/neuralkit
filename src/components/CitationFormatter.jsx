// src/components/CitationFormatter.jsx
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, TOOL_MODELS } from '../constants';
import { fetchWithBackoff } from '../utils';

const STYLES = [
  { key: 'apa', label: 'APA 7th', desc: 'Psychology, Education, Social Sciences', color: '#3b82f6' },
  { key: 'mla', label: 'MLA 9th', desc: 'Humanities, Literature, Arts', color: '#ef4444' },
  { key: 'ieee', label: 'IEEE', desc: 'Engineering, Computer Science', color: '#f59e0b' },
  { key: 'chicago', label: 'Chicago 17th', desc: 'History, Business, Fine Arts', color: '#10b981' },
];

// ── Aggressive JSON repair ───────────────────────────────────
function repairJson(raw) {
  if (!raw) throw new Error('Empty response.');

  // 1. Strip thinking tags, markdown fences, and preamble
  let s = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json\s*|\s*```/g, '')
    .replace(/^\s*json\s*/i, '')
    .trim();

  // 2. Find the JSON object boundaries
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first === -1 || last === -1 || last < first) {
    throw new Error('No JSON object found in response.');
  }
  s = s.slice(first, last + 1);

  // 3. Fix trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, '$1');

  // 4. Fix smart quotes
  s = s.replace(/[\u201C\u201D]/g, '\\"')
       .replace(/[\u2018\u2019]/g, "'");

  // 5. Try parsing
  try {
    return JSON.parse(s);
  } catch (err) {
    // 6. If still failing, try to fix unescaped quotes inside strings
    // This regex finds quotes that are inside string values but not escaped
    // It's a best-effort fix for citation titles containing quotes
    try {
      const fixed = s.replace(/(?<=: ")([^"]*?)"([^"]*?)(?=",?)/g, '$1\\"$2');
      return JSON.parse(fixed);
    } catch {
      throw new Error(`JSON parse failed: ${err.message}`);
    }
  }
}

export default function CitationFormatter() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(null);

  async function generateCitations() {
    if (!input.trim()) return;
    setLoading(true); setError(''); setResults(null);
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: TOOL_MODELS.citationFormatter || TOOL_MODELS.codeExplainer,
          max_tokens: 4000,
          temperature: 0.05, // ↓ even lower for strict formatting
          messages: [
            {
              role: 'system',
              content: `You are a citation formatting machine. Your ONLY job is to output valid JSON.

RULES — follow exactly:
1. Output ONLY a single JSON object. No markdown, no explanation, no thinking.
2. Escape ALL double quotes inside string values with backslash. Example: "Title with \\"quotes\\" inside"
3. Do NOT use smart quotes, curly quotes, or any special Unicode characters.
4. Do NOT include trailing commas.
5. If a field is unknown, use "Unknown" — never leave it empty or omit it.

Required JSON schema:
{
  "source": "Brief description of the detected source",
  "apa": "APA 7th citation string",
  "mla": "MLA 9th citation string",
  "ieee": "IEEE citation string",
  "chicago": "Chicago 17th citation string",
  "bibtex": "BibTeX entry string",
  "notes": ["Any missing info or assumptions"]
}`
            },
            {
              role: 'user',
              content: `Format citations for: ${input.trim().slice(0, 8000)}`
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || `API error ${res.status}`);
      }

      const raw = data?.choices?.[0]?.message?.content;
      if (!raw || raw.trim().length === 0) {
        throw new Error('AI returned empty response.');
      }

      const parsed = repairJson(raw);

      // Validate required fields
      if (!parsed.apa && !parsed.mla && !parsed.ieee && !parsed.chicago) {
        throw new Error('AI returned citation data in unexpected format.');
      }

      setResults(parsed);
    } catch (e) {
      console.error('[CitationFormatter] Error:', e);
      setError(e.message || 'Failed to generate citations. Please try again.');
    }
    setLoading(false);
  }

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAll() {
    if (!results) return;
    const all = STYLES.map(s => `【${s.label}】\n${results[s.key] || 'N/A'}`).join('\n\n');
    copy(all, 'all');
  }

  const inputStyle = {
    width: '100%',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
    borderRadius: '10px',
    padding: '12px 14px',
    color: isDark ? '#fff' : '#1a1a1a',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical',
    transition: 'border-color 0.2s',
  };

  const btnPrimary = {
    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 22px',
    color: '#000',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };

  const btnSecondary = {
    background: 'transparent',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
    borderRadius: '8px',
    padding: '6px 14px',
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
          Paste DOI, arXiv link, or raw reference
        </label>
        <textarea
          rows={5}
          placeholder={`Examples:\n• 10.1038/s41586-021-03819-2\n• https://arxiv.org/abs/1706.03762\n• Vaswani et al., Attention Is All You Need, NeurIPS 2017`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ ...inputStyle, minHeight: '120px' }}
          maxLength={8000}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', fontFamily: "'Space Mono', monospace" }}>
            {input.length}/8000
          </span>
          <span style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', fontFamily: "'Space Mono', monospace" }}>
            AI extracts metadata automatically
          </span>
        </div>
      </div>

      <button
        onClick={generateCitations}
        disabled={loading || !input.trim()}
        style={{ ...btnPrimary, opacity: loading || !input.trim() ? 0.6 : 1, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer' }}
      >
        {loading ? <><span className="spinner" style={{ width: '14px', height: '14px', display: 'inline-block' }} />Formatting...</> : '📚 Generate Citations'}
      </button>

      {error && (
        <div className="error-box" style={{ marginTop: '16px' }}>
          ⚠ {error}
        </div>
      )}

      {results && (
        <div style={{ marginTop: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em' }}>
              ◆ {results.source || 'FORMATTED CITATIONS'}
            </div>
            <button onClick={copyAll} style={btnSecondary}>
              {copied === 'all' ? '✓ Copied All' : '📋 Copy All'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {STYLES.map((style) => (
              <div
                key={style.key}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '12px',
                  padding: '16px 18px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: style.color,
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', fontFamily: "'Space Mono', monospace" }}>
                        {style.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
                        {style.desc}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copy(results[style.key] || '', style.key)}
                    style={{ ...btnSecondary, padding: '4px 10px', fontSize: '0.72rem' }}
                  >
                    {copied === style.key ? '✓ Copied' : '📋'}
                  </button>
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                  lineHeight: 1.7,
                  fontFamily: "'DM Sans', sans-serif",
                  wordBreak: 'break-word',
                  padding: '10px 12px',
                  background: isDark ? 'rgba(0,0,0,0.25)' : '#f8f9fa',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
                }}>
                  {results[style.key] || 'N/A'}
                </div>
              </div>
            ))}
          </div>

          {results.bibtex && (
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Space Mono', monospace" }}>
                BibTeX
              </div>
              <div style={{ position: 'relative' }}>
                <pre style={{
                  background: isDark ? 'rgba(0,0,0,0.3)' : '#f3f4f6',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '0.78rem',
                  fontFamily: "'Space Mono', monospace",
                  color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)',
                  overflowX: 'auto',
                  lineHeight: 1.6,
                }}>
                  {results.bibtex}
                </pre>
                <button
                  onClick={() => copy(results.bibtex, 'bibtex')}
                  style={{ position: 'absolute', top: '10px', right: '10px', ...btnSecondary, background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)' }}
                >
                  {copied === 'bibtex' ? '✓' : '📋'}
                </button>
              </div>
            </div>
          )}

          {results.notes?.length > 0 && (
            <div style={{ marginTop: '16px', background: isDark ? 'rgba(255,180,0,0.12)' : '#fff8e1', border: `1px solid ${isDark ? 'rgba(255,180,0,0.25)' : '#b45309'}`, borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#febc2e' : '#b45309', marginBottom: '6px' }}>⚠ Notes</div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
                {results.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}

          <button onClick={() => { setResults(null); setInput(''); setError(''); }} style={{ ...btnSecondary, marginTop: '20px' }}>
            ↺ New Citation
          </button>
        </div>
      )}
    </div>
  );
}
