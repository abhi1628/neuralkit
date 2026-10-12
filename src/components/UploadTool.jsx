// src/components/UploadTool.jsx
// • "Analyze Resume"  → the new ResumeAnalyzer (structured, evidence-based)
// • everything else   → Document Summarizer (this file), with fixes:
//     – uses TOOL_MODELS (the old hard-coded Llama IDs are decommissioned and were silently remapped)
//     – shared aiCall(): device-aware rate limiting, fail-fast 429s, reasoning-safe token budgets
//     – line-preserving PDF extraction that also handles two-column papers
//     – safe sentence splitting (no regex look-behind), escaped Q&A keywords, case-insensitive extensions

import { useState, useRef, useMemo, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { WORD_LIMIT_UPLOAD, TOOL_MODELS } from '../constants';
import { trackEvent, formatOutput } from '../utils';
import { aiCall, extractDocument } from '../resumeCore';
import OutputActions from './OutputActions';
import ResumeAnalyzer from './ResumeAnalyzer';

const DEFAULT_SUMMARY_PROMPT = `You are an expert research analyst. Produce a thorough, structured summary of the document.
Use these sections, in order, with short bullet points under each:
1. Overview (what the document is and its purpose)
2. Key points and findings (keep every important number, name and date)
3. Methodology or approach (if any)
4. Conclusions and implications
5. Limitations or open questions
Be accurate and concise. Never invent facts that are not in the document.`;

const SUMMARY_CHUNK_SIZE = 5000;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [text];
}

function chunkText(text, source, maxLen = 1800, overlapWords = 0) {
  const out = [];
  let current = '';
  for (const raw of splitSentences(text)) {
    const s = raw.trim();
    if (!s) continue;
    if ((current + ' ' + s).length > maxLen && current) {
      out.push({ text: current.trim(), source });
      const tail = overlapWords ? current.split(/\s+/).slice(-overlapWords).join(' ') : '';
      current = tail ? `${tail} ${s}` : s;
    } else {
      current += (current ? ' ' : '') + s;
    }
  }
  if (current.trim()) out.push({ text: current.trim(), source });
  return out;
}

function DocumentTool({ prompt, filename, icon, label }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = 'var(--accent)';

  const [fileName, setFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [chunks, setChunks] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [chunkProgress, setChunkProgress] = useState(null);
  const fileRef = useRef(null);
  const topRef = useRef(null);

  // the registry prompt can be truncated ("…"); fall back to a complete one
  const effectivePrompt = useMemo(() => {
    const p = String(prompt || '').trim();
    return p.length < 160 || p.endsWith('...') || p.endsWith('…') ? `${p.replace(/(\.\.\.|…)$/, '').trim()}\n\n${DEFAULT_SUMMARY_PROMPT}` : p;
  }, [prompt]);

  const run = (toolId, model, system, user, maxTokens) => aiCall({
    toolId, model, maxTokens, temperature: 0.3, reasoning: 'low',
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  }).then((r) => r.text);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name); setOutput(''); setError(''); setExtractedText(''); setChunks([]); setExtracting(true);
    try {
      const doc = await extractDocument(file);
      // newlines → spaces for prose documents (keeps sentences intact)
      const prose = (t) => t.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
      if (doc.kind === 'pdf') {
        const all = [];
        doc.pages.forEach((pg) => all.push(...chunkText(prose(pg.text), `[Source: ${file.name}, page ${pg.pageNum}]`, 1800, 40)));
        setChunks(all);
      } else {
        setChunks(chunkText(prose(doc.text), `[Source: ${file.name}]`));
      }
      const full = doc.pages.map((pg) => prose(pg.text)).join('\n\n');
      const trimmed = full.slice(0, WORD_LIMIT_UPLOAD);
      setExtractedText(trimmed); setCharCount(trimmed.length);
    } catch (err) {
      setError(err?.message || 'Error reading file. Please try again.');
    }
    setExtracting(false);
  }

  async function analyze() {
    if (!extractedText) return;
    setLoading(true); setOutput(''); setError(''); setChunkProgress(null);
    trackEvent('tool_run', { tool_name: label });
    fetch('/api/track-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'run', targetId: 'document-summarizer' }) }).catch(() => {});

    try {
      if (extractedText.length <= SUMMARY_CHUNK_SIZE) {
        setOutput(await run('document-summarizer', TOOL_MODELS.documentSummarizer, effectivePrompt, extractedText, 3000));
        setLoading(false);
        return;
      }

      const parts = [];
      for (let i = 0; i < extractedText.length; i += SUMMARY_CHUNK_SIZE) parts.push(extractedText.slice(i, i + SUMMARY_CHUNK_SIZE));
      setChunkProgress({ completed: 0, total: parts.length, finalizing: false });

      const summaries = [];
      for (let i = 0; i < parts.length; i++) {
        const text = await run(
          'document-summarizer-chunk', TOOL_MODELS.researchSummarizer,
          'You are a precise document analyst. Summarize the key points from this document section in 4-6 bullet points. Preserve numbers, names, findings, and methodology details. Be concise.',
          `Section ${i + 1} of ${parts.length}:\n\n${parts[i]}`, 1500,
        );
        summaries.push(`[Section ${i + 1}/${parts.length}]\n${text}`);
        setChunkProgress({ completed: i + 1, total: parts.length, finalizing: false });
        if (i < parts.length - 1) await delay(1200);
      }

      setChunkProgress({ completed: parts.length, total: parts.length, finalizing: true });
      const finalText = await run(
        'document-summarizer-final', TOOL_MODELS.documentSummarizer,
        `${effectivePrompt}\n\nYou will receive section-by-section summaries of a larger document. Synthesize them into one comprehensive final summary following the format above.`,
        `Document section summaries:\n\n${summaries.join('\n\n')}\n\nProvide the final comprehensive summary.`, 3000,
      );
      setOutput(finalText);
    } catch (e) {
      setError(e?.message || 'Connection error. Please try again.');
    }
    setChunkProgress(null);
    setLoading(false);
  }

  async function askFollowUp() {
    if (!followUpQuestion.trim() || chunks.length === 0) return;
    setQaLoading(true); setQaAnswer('');
    const pageMatch = followUpQuestion.match(/page\s+(\d+)/i);
    const targetPage = pageMatch ? parseInt(pageMatch[1], 10) : null;
    const keywords = followUpQuestion.toLowerCase().replace(/page\s+\d+/i, '').split(/\s+/).filter((w) => w.length > 3).map(escRe);
    const pool = targetPage ? chunks.filter((c) => c.source.includes(`page ${targetPage}`)) : chunks;
    if (targetPage && pool.length === 0) { setQaAnswer(`No content found on page ${targetPage}.`); setQaLoading(false); return; }
    const scored = pool
      .map((c) => ({ ...c, score: keywords.reduce((s, kw) => s + (c.text.toLowerCase().match(new RegExp(kw, 'g')) || []).length, 0) }))
      .sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 4);
    if (!top.length || top[0].score === 0) { setQaAnswer("I couldn't find relevant information in the document to answer that question."); setQaLoading(false); return; }
    const context = top.map((c) => `--- ${c.source} ---\n${c.text}`).join('\n\n');
    try {
      const text = await run(
        'document-qa', TOOL_MODELS.documentQA,
        `You are a precise research assistant. Answer using ONLY the provided chunks.\nCRITICAL RULES:\n1. Every factual sentence MUST end with a citation like [Source: filename, page X]\n2. If you quote directly, use [Source: filename, page X, exact quote]\n3. If the answer isn't in the chunks, say "I couldn't find that in the document."\n4. Never make up citations.`,
        `Document excerpts:\n\n${context}\n\nQuestion: ${followUpQuestion}`, 1500,
      );
      setQaAnswer(text || "Sorry, I couldn't generate an answer. Please try again.");
    } catch (e) { setQaAnswer(e?.message || 'Connection error. Please try again.'); }
    setQaLoading(false);
  }

  function handleClear() {
    setOutput(''); setFileName(''); setExtractedText(''); setCharCount(0); setError('');
    setChunks([]); setQaAnswer(''); setFollowUpQuestion('');
    if (fileRef.current) fileRef.current.value = '';
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  const formattedOutput = useMemo(() => (output ? formatOutput(output, theme) : null), [output, theme]);

  return (
    <div ref={topRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
        className="upload-zone" style={{ borderColor: fileName ? `${ac}66` : undefined }} role="button" tabIndex={0} aria-label="Upload PDF or Word file"
      >
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={handleFile} />
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{fileName ? icon : '⬆️'}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', color: fileName ? ac : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)'), marginBottom: '6px', wordBreak: 'break-word' }}>
          {extracting ? 'Extracting text...' : fileName || 'Click to upload PDF or Word file'}
        </div>
        {!fileName && <div style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>Supports .pdf · .docx · .txt · Max ~40 pages for best results</div>}
        {charCount > 0 && (
          <>
            <div style={{ fontSize: '0.72rem', color: ac, marginTop: '6px', fontFamily: "'Space Mono', monospace" }}>
              {charCount.toLocaleString()} characters extracted
              {charCount >= WORD_LIMIT_UPLOAD ? ` · Large file: first ${(WORD_LIMIT_UPLOAD / 1000).toFixed(0)}K chars used` : ''}
            </div>
            {charCount >= 30000 && (
              <div style={{ fontSize: '0.68rem', color: isDark ? '#febc2e' : '#b45309', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>
                ⚠️ Large file: First {Math.round(WORD_LIMIT_UPLOAD / 1000)}K characters used. For best results, consider summarizing shorter sections.
              </div>
            )}
          </>
        )}
      </div>

      {extractedText && (
        <>
          <button onClick={analyze} disabled={loading} className={`run-btn ${loading ? 'run-btn-disabled' : ''}`} aria-label={label}>
            {loading ? (
              <>
                <span className="spinner" />
                {chunkProgress
                  ? chunkProgress.finalizing ? 'Synthesizing final summary…' : `Processing sections… (${chunkProgress.completed}/${chunkProgress.total} done)`
                  : 'Analyzing…'}
              </>
            ) : `→ ${label}`}
          </button>
          {chunkProgress && !chunkProgress.finalizing && (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', textAlign: 'center', marginTop: '-10px' }}>
              ⚡ Summarizing {chunkProgress.total} sections one by one, then combining them
            </div>
          )}
        </>
      )}

      {error && (
        <div>
          <div className="error-box" role="alert">⚠️ {error}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button onClick={handleClear} className="action-btn" style={{ color: ac, borderColor: ac }} aria-label="Clear and try again">↺ Clear</button>
          </div>
        </div>
      )}

      {output && (
        <div>
          <div className="output-panel">
            <div className="output-header">◆ {label} Result</div>
            {formattedOutput}
          </div>

          {chunks.length > 0 && (
            <div style={{ marginTop: '28px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em', marginBottom: '12px', textTransform: 'uppercase' }}>◆ Ask a follow-up question (with citations)</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text" value={followUpQuestion} onChange={(e) => setFollowUpQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && askFollowUp()}
                  placeholder="e.g., What methodology did they use? On which page?" aria-label="Follow-up question"
                  style={{ flex: 1, minWidth: '200px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '12px 16px', color: isDark ? '#fff' : '#1a1a1a', fontFamily: "'DM Sans', sans-serif", fontSize: '16px', outline: 'none' }}
                />
                <button
                  onClick={askFollowUp} disabled={qaLoading || !followUpQuestion.trim()}
                  style={{ background: qaLoading || !followUpQuestion.trim() ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #a78bfa, #818cf8)', border: 'none', borderRadius: '10px', padding: '12px 24px', color: qaLoading || !followUpQuestion.trim() ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : '#000', fontWeight: 700, fontSize: '0.85rem', cursor: qaLoading || !followUpQuestion.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {qaLoading ? <><span className="spinner" style={{ width: '12px', height: '12px' }} />Searching...</> : 'Ask →'}
                </button>
              </div>
              {qaAnswer && (
                <div style={{ marginTop: '16px', background: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.04)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.15)'}`, borderRadius: '12px', padding: '20px', fontSize: '0.85rem', lineHeight: 1.75, color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.8)' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: ac, marginBottom: '12px', letterSpacing: '0.1em' }}>◆ ANSWER WITH CITATIONS</div>
                  {qaAnswer.split('\n').map((line, i) => <div key={i} style={{ marginBottom: line.trim() === '' ? '12px' : '6px' }}>{line}</div>)}
                </div>
              )}
            </div>
          )}

          <OutputActions text={output} filename={`zeroapi-${filename}`} onClear={handleClear} />
        </div>
      )}
    </div>
  );
}

export default function UploadTool(props) {
  // page-view telemetry (same payload as before)
  useEffect(() => {
    fetch('/api/track-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'view', targetId: props.filename }) }).catch(() => {});
  }, [props.filename]);

  if (props.label === 'Analyze Resume') return <ResumeAnalyzer />;
  return <DocumentTool {...props} />;
}
