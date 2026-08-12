// src/components/CitationFormatter.jsx
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, TOOL_MODELS } from '../constants';
import { fetchWithBackoff } from '../utils';
import { buildCitations } from '../lib/citationEngine';
import { detectSource, resolveByKind } from '../lib/citationResolvers';

const STYLES = [
  { key: 'apa', label: 'APA 7th', desc: 'Psychology, Education, Social Sciences', color: '#3b82f6' },
  { key: 'mla', label: 'MLA 9th', desc: 'Humanities, Literature, Arts', color: '#ef4444' },
  { key: 'ieee', label: 'IEEE', desc: 'Engineering, Computer Science', color: '#f59e0b' },
  { key: 'chicago', label: 'Chicago 17th', desc: 'History, Business, Fine Arts', color: '#10b981' },
];

const SOURCE_LABELS = {
  doi: 'Journal Article (via CrossRef)',
  arxiv: 'Preprint (via arXiv)',
  isbn: 'Book (via Open Library)',
  url: 'Webpage',
  ai: 'Extracted from Raw Text',
};

// ── Robust JSON repair for the AI extraction fallback ──────────
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

// AI is used ONLY to extract structured fields from messy raw reference
// text — never to write the final citation strings. Those are always built
// by the deterministic engine, so formatting rules (comma placement, et al.
// thresholds, italics) are consistent no matter what the model returns.
async function extractMetadataWithAI(rawText, hintUrl) {
  const res = await fetchWithBackoff(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: TOOL_MODELS.citationFormatter || TOOL_MODELS.codeExplainer,
      max_tokens: 1200,
      temperature: 0.05,
      messages: [
        {
          role: 'system',
          content: `You extract bibliographic metadata from raw, possibly messy reference text. Output ONLY valid JSON, nothing else.

Schema:
{
  "type": "article-journal" | "paper-conference" | "book" | "chapter" | "webpage" | "preprint" | "report" | "thesis",
  "title": "string",
  "containerTitle": "journal name, conference name, book title (for a chapter), or website/publisher name",
  "authors": [{"given": "string", "family": "string"}],
  "year": "string or empty",
  "month": "string or empty (numeric, e.g. '3')",
  "day": "string or empty",
  "volume": "string or empty",
  "issue": "string or empty",
  "pages": "string or empty, e.g. '123-145'",
  "publisher": "string or empty",
  "city": "string or empty",
  "doi": "string or empty",
  "url": "string or empty",
  "notes": ["short strings describing anything missing or assumed"]
}

RULES:
1. Output ONLY the JSON object. No markdown, no backticks, no preamble, no thinking tags.
2. Never invent authors, titles, dates, or page numbers you cannot see in the text. Leave the field empty and add a note instead.
3. Split author full names into given/family correctly (family = last surname).
4. Infer "type" from context (journal names, "Proceedings of...", "Press" in publisher, a URL, etc.).
5. Escape backslashes and quotes properly for valid JSON.`,
        },
        {
          role: 'user',
          content: `Extract structured metadata from this reference${hintUrl ? ` (associated URL: ${hintUrl})` : ''}:\n\n${rawText.slice(0, 8000)}`,
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `API error ${res.status}`);
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw?.trim()) throw new Error('AI returned empty response.');
  const parsed = repairJson(raw);
  if (!parsed.title) throw new Error('Could not identify a title in the provided text.');
  return { ...parsed, aiNotes: parsed.notes || [] };
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
  const [metaStatus, setMetaStatus] = useState(''); // 'fetching' | 'found' | 'fallback'

  async function generateCitations() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    setMetaStatus('');

    try {
      const { kind, value } = detectSource(input);
      let metadata = null;
      let sourceKind = kind;

      if (kind !== 'none') {
        setMetaStatus('fetching');
        metadata = await resolveByKind(kind, value);
      }

      // Fall back to AI extraction if no identifier was found, or the
      // identifier was found but the API lookup failed/returned nothing.
      let aiNotes = [];
      if (!metadata) {
        setMetaStatus('fallback');
        sourceKind = 'ai';
        const extracted = await extractMetadataWithAI(input.trim(), kind === 'url' ? value : null);
        aiNotes = extracted.aiNotes;
        metadata = extracted;
      } else {
        setMetaStatus('found');
      }

      const built = buildCitations(metadata, SOURCE_LABELS[sourceKind]);
      built.notes = [...built.notes, ...aiNotes];
      setResults(built);
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
    const all = STYLES.map((s) => `【${s.label}】\n${results.formats[s.key]?.text || 'N/A'}`).join('\n\n');
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

  const metaStatusLabel =
    metaStatus === 'fetching'
      ? '🔍 Looking up metadata...'
      : metaStatus === 'found'
      ? '✓ Verified metadata found'
      : metaStatus === 'fallback'
      ? '🤖 No identifier matched — extracting from text...'
      : 'Auto-detects DOI / arXiv / ISBN / URL';

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
          Paste a DOI, arXiv link, ISBN, webpage URL, or raw reference
        </label>
        <textarea
          rows={5}
          placeholder={`Examples:\n• 10.1016/j.egyr.2023.03.109\n• https://arxiv.org/abs/1706.03762\n• 978-0-13-468599-1\n• https://www.nature.com/articles/...\n• Vaswani et al., Attention Is All You Need, NeurIPS 2017`}
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
            {metaStatusLabel}
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
              ◆ {results.source}
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
                  <button onClick={() => copy(results.formats[style.key]?.text || '', style.key)} style={{ ...btnSecondary, padding: '4px 10px', fontSize: '0.72rem' }}>
                    {copied === style.key ? '✓ Copied' : '📋'}
                  </button>
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                    lineHeight: 1.7,
                    fontFamily: "'DM Sans', sans-serif",
                    wordBreak: 'break-word',
                    padding: '10px 12px',
                    background: isDark ? 'rgba(0,0,0,0.25)' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                  // Safe: html is built entirely from our own template strings
                  // in citationEngine.js (only <i> tags for italics), never
                  // from raw user or AI text without going through those templates.
                  dangerouslySetInnerHTML={{ __html: results.formats[style.key]?.html || 'N/A' }}
                />
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
