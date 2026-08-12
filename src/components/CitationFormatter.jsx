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

// ── Extract DOI from various formats ───────────────────────────
function extractDoi(input) {
  const m = input.match(/\b(10\.\d{4,}(?:\.\d+)*\/[^\s,;]+)\b/);
  return m ? m[1] : null;
}

// ── Extract arXiv ID ────────────────────────────────────────
function extractArxiv(input) {
  const m = input.match(/(?:arxiv\.org\/abs\/)?(\d{4}\.\d{4,5}|[a-z-]+\/\d{7})/i);
  return m ? m[1] : null;
}

// ── Resolve DOI via CrossRef (free, no key) ──────────────────
async function resolveDoi(doi) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (!res.ok) return null;
    const { message: m } = await res.json();
    return {
      sourceType: 'DOI',
      doi: m.DOI || doi,
      title: m.title?.[0] || '',
      authors: (m.author || []).map(a => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean),
      journal: m['container-title']?.[0] || m.publisher || '',
      year: String(m.published?.['date-parts']?.[0]?.[0] || m.created?.['date-parts']?.[0]?.[0] || ''),
      volume: m.volume || '',
      issue: m.issue || '',
      pages: m.page || '',
      url: m.URL || `https://doi.org/${doi}`,
    };
  } catch {
    return null;
  }
}

// ── Resolve arXiv via API ─────────────────────────────────────
async function resolveArxiv(id) {
  try {
    const res = await fetch(`https://export.arxiv.org/api/query?search_query=id:${encodeURIComponent(id)}&max_results=1`);
    if (!res.ok) return null;
    const xml = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const entry = doc.querySelector('entry');
    if (!entry) return null;
    const title = entry.querySelector('title')?.textContent?.trim() || '';
    const authors = Array.from(entry.querySelectorAll('author name')).map(n => n.textContent.trim());
    const published = entry.querySelector('published')?.textContent?.trim() || '';
    const year = published ? published.slice(0, 4) : '';
    return {
      sourceType: 'arXiv',
      arxivId: id,
      title,
      authors,
      journal: 'arXiv preprint',
      year,
      volume: '',
      issue: '',
      pages: '',
      url: `https://arxiv.org/abs/${id}`,
    };
  } catch {
    return null;
  }
}

// ── Robust JSON repair ────────────────────────────────────────
function repairJson(raw) {
  if (!raw) throw new Error('Empty response.');
  let s = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json\s*|\s*```/g, '')
    .replace(/^\s*json\s*/i, '')
    .trim();
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first === -1 || last === -1 || last < first) throw new Error('No JSON object found.');
  s = s.slice(first, last + 1).replace(/,\s*([}\]])/g, '$1');
  try {
    return JSON.parse(s);
  } catch (err) {
    try {
      const fixed = s.replace(/[\u201C\u201D]/g, '\\"').replace(/[\u2018\u2019]/g, "'");
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
  const [metaStatus, setMetaStatus] = useState(''); // 'fetching' | 'found' | 'not-found'

  async function generateCitations() {
    if (!input.trim()) return;
    setLoading(true); setError(''); setResults(null); setMetaStatus('');

    let metadata = null;
    const doi = extractDoi(input);
    const arxiv = extractArxiv(input);

    // ── Try metadata resolution ──
    if (doi) {
      setMetaStatus('fetching');
      metadata = await resolveDoi(doi);
    } else if (arxiv) {
      setMetaStatus('fetching');
      metadata = await resolveArxiv(arxiv);
    }

    if (metadata) setMetaStatus('found');

    // ── Build AI prompt ──
    let userContent;
    if (metadata) {
      userContent = `Format the following verified metadata into citations. Use ONLY the provided fields. Do NOT invent or guess anything.\n\n${JSON.stringify(metadata, null, 2)}`;
    } else {
      userContent = `Generate citations from this raw reference text. Extract what you can and note any missing information.\n\n${input.trim().slice(0, 8000)}`;
    }

    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: TOOL_MODELS.citationFormatter || TOOL_MODELS.codeExplainer,
          max_tokens: 2500,
          temperature: 0.05,
          messages: [
            {
              role: 'system',
              content: `You are a citation formatting machine. Output ONLY valid JSON.

RULES:
1. Output ONLY a single JSON object. No markdown, no explanation.
2. Escape double quotes inside string values with backslash.
3. No trailing commas. No smart quotes.
4. If metadata is provided, use it exactly. Do NOT invent authors, titles, or dates.

Schema:
{
  "source": "Detected source description",
  "apa": "APA 7th citation",
  "mla": "MLA 9th citation",
  "ieee": "IEEE citation",
  "chicago": "Chicago 17th citation",
  "bibtex": "BibTeX entry",
  "notes": ["Any missing fields or assumptions"]
}`
            },
            { role: 'user', content: userContent },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `API error ${res.status}`);

      const raw = data?.choices?.[0]?.message?.content;
      if (!raw?.trim()) throw new Error('AI returned empty response.');

      const parsed = repairJson(raw);
      if (!parsed.apa && !parsed.mla) throw new Error('Invalid citation data.');

      setResults(parsed);
    } catch (e) {
      console.error('[CitationFormatter]', e);
      setError(e.message || 'Failed to generate citations. Try again.');
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
          placeholder={`Examples:\n• 10.1016/j.egyr.2023.03.109\n• https://arxiv.org/abs/1706.03762\n• Vaswani et al., Attention Is All You Need, NeurIPS 2017`}
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
            {metaStatus === 'fetching' ? '🔍 Looking up metadata...' : metaStatus === 'found' ? '✓ Metadata found' : 'Auto-detects DOI / arXiv'}
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
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: style.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', fontFamily: "'Space Mono', monospace" }}>
                        {style.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
                        {style.desc}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => copy(results[style.key] || '', style.key)} style={{ ...btnSecondary, padding: '4px 10px', fontSize: '0.72rem' }}>
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
                <button onClick={() => copy(results.bibtex, 'bibtex')} style={{ position: 'absolute', top: '10px', right: '10px', ...btnSecondary, background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)' }}>
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

          <button onClick={() => { setResults(null); setInput(''); setError(''); setMetaStatus(''); }} style={{ ...btnSecondary, marginTop: '20px' }}>
            ↺ New Citation
          </button>
        </div>
      )}
    </div>
  );
}
