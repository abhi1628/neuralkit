// src/components/UploadTool.jsx
import { useState, useRef, useMemo, useEffect } from 'react'; // FIXED: Added useEffect for view tracking
import { useTheme } from '../ThemeContext';
import { WORD_LIMIT_UPLOAD, TOOL_MODELS } from '../constants'; // Cleaned up GROQ_API_URL reference
import { loadScript, trackEvent, formatOutput, fetchWithBackoff } from '../utils';
import OutputActions from './OutputActions';
import ResumeBuilder from './ResumeBuilder';
import CoverLetterGenerator from './CoverLetterGenerator';

export default function UploadTool({ prompt, filename, icon, label }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = 'var(--accent)';

  const [fileName,          setFileName]          = useState('');
  const [extractedText,     setExtractedText]     = useState('');
  const [output,            setOutput]            = useState('');
  const [loading,           setLoading]           = useState(false);
  const [extracting,        setExtracting]        = useState(false);
  const [error,             setError]             = useState('');
  const [charCount,         setCharCount]         = useState(0);
  const [chunks,            setChunks]            = useState([]);
  const [followUpQuestion,  setFollowUpQuestion]  = useState('');
  const [qaAnswer,          setQaAnswer]          = useState('');
  const [parsedResumeData,  setParsedResumeData]  = useState(null);
  const [qaLoading,         setQaLoading]         = useState(false);
  const [chunkProgress,     setChunkProgress]     = useState(null);
  const fileRef = useRef(null);
  const topRef  = useRef(null);

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const SUMMARY_CHUNK_SIZE = 5000;

  const ACADEMIC_KEYWORDS = useMemo(() => ['abstract','introduction','methodology','related work','literature review','experimental results','discussion','conclusion','references','bibliography','figure','table','equation','theorem','proof','hypothesis','dataset','et al','doi:','thesis','dissertation'], []);

  // ── NEW FIXED: Telemetry Page View Trigger ──
  useEffect(() => {
    // Registers dynamic paths on dashboard using the passed down unique filename mapping
    fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view', targetId: filename })
    }).catch(() => {});
  }, [filename]);

  function isResearchPaper(text) {
    const lower = text.toLowerCase();
    return ACADEMIC_KEYWORDS.filter(kw => lower.includes(kw)).length >= 4;
  }

  // Handles standard fallback mappings accurately
  function isResumeLike(text) {
    const lower = text.toLowerCase();
    const coreSections = ['experience','work experience','employment','professional experience','education','qualification','qualifications','academic background','skills','technical skills','core competencies','expertise','languages','contact','personal details','address','phone','email','projects','key projects','portfolio'];
    const antiResume   = ['abstract','introduction','methodology','literature review','related work','experimental results','discussion','conclusion','bibliography','figure','table','equation','theorem','proof','hypothesis','dataset','et al','doi:','supervised by','submitted in partial fulfillment','thesis','dissertation'];
    const coreScore = coreSections.filter(kw => lower.includes(kw)).length;
    const antiScore = antiResume.filter(kw => lower.includes(kw)).length;
    return coreScore >= 1 && antiScore < 5;
  }

  function buildChunks(text, sourceName) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const result = [];
    let current = '';
    for (const s of sentences) {
      if ((current + s).length > 1800 && current) {
        result.push({ text: current.trim(), source: `[Source: ${sourceName}]` });
        current = s;
      } else {
        current += (current ? ' ' : '') + s;
      }
    }
    if (current) result.push({ text: current.trim(), source: `[Source: ${sourceName}]` });
    return result;
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name); setOutput(''); setError(''); setExtractedText(''); setExtracting(true);
    try {
      let text = '';
      if (file.name.endsWith('.pdf')) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const pageTexts = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(s => s.str).join(' ');
          pageTexts.push({ pageNum: i, text: pageText });
          text += pageText + '\n\n';
        }
        const allChunks = [];
        for (const page of pageTexts) {
          const sentences = page.text.split(/(?<=[.!?])\s+/);
          let current = '', overlapBuffer = '';
          for (const s of sentences) {
            if ((current + s).length > 1800 && current) {
              allChunks.push({ text: current.trim(), source: `[Source: ${file.name}, page ${page.pageNum}]` });
              const words = current.split(/\s+/);
              overlapBuffer = words.slice(-Math.min(40, words.length)).join(' ');
              current = overlapBuffer + ' ' + s;
            } else {
              current += (current ? ' ' : '') + s;
            }
          }
          if (current) allChunks.push({ text: current.trim(), source: `[Source: ${file.name}, page ${page.pageNum}]` });
        }
        setChunks(allChunks);
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
        const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
        setChunks(buildChunks(text, file.name));
      } else {
        setError('Please upload a PDF or Word (.docx) file.'); setExtracting(false); return;
      }
      if (!text.trim()) { setError('Could not extract text from this file.'); setExtracting(false); return; }
      const trimmed = text.slice(0, WORD_LIMIT_UPLOAD);
      setExtractedText(trimmed); setCharCount(trimmed.length);
    } catch { setError('Error reading file. Please try again.'); }
    setExtracting(false);
  }

  async function analyze() {
    if (!extractedText) return;

    const dispatchTelemetry = (toolId) => {
      fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'run', targetId: toolId })
      }).catch(() => {});
    };

    if (label === 'Analyze Resume') {
      if (isResearchPaper(extractedText)) { setError('❌ This appears to be an academic document. Please upload a CV or resume file.'); return; }
      if (!isResumeLike(extractedText))   { setError('❌ The uploaded file doesn\'t appear to be a resume. Please upload a proper CV or resume.'); return; }
      setLoading(true); setOutput(''); setError('');
      trackEvent('tool_run', { tool_name: label });
      dispatchTelemetry('resume-analyzer');
      const contextForLLM = chunks.length > 0 ? chunks.slice(0, 20).map(c => `--- ${c.source} ---\n${c.text}`).join('\n\n') : extractedText;
      try {
        const res = await fetchWithBackoff('/api/ai', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolId: 'resume-analyzer',
            model: TOOL_MODELS.resumeAnalyzer, max_tokens: 900, temperature: 0.3,
            messages: [
              { role: 'system', content: prompt + '\n\nIMPORTANT FORMATTING RULES:\n- Do NOT include page citations like [Source: page X] for resume analysis\n- Do NOT include confidence indicators like [HIGH], [MEDIUM], [LOW]\n- Be honest and specific about strengths and weaknesses\n- Use bullet points for readability\n- Include specific metrics and numbers when analyzing achievements' },
              { role: 'user',   content: contextForLLM },
            ],
          }),
        });
        const data = await res.json();
        if (data?.choices?.[0]?.message?.content) {
          setOutput(data.choices[0].message.content);
        } else if (data?.error) {
          setError(`API Error: ${data.error.message}`);
        } else {
          setError('Unexpected response. Please try again.');
        }
      } catch (e) { setError(e.message || 'Connection error. Please try again.'); }
      setLoading(false);
      return;
    }

    setLoading(true); setOutput(''); setError(''); setChunkProgress(null);
    trackEvent('tool_run', { tool_name: label });
    dispatchTelemetry('document-summarizer');

    try {
      if (extractedText.length <= SUMMARY_CHUNK_SIZE) {
        const res = await fetchWithBackoff('/api/ai', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolId: 'document-summarizer',
            model: TOOL_MODELS.documentSummarizer, max_tokens: 900, temperature: 0.3,
            messages: [
              { role: 'system', content: prompt },
              { role: 'user',   content: extractedText },
            ],
          }),
        });
        const data = await res.json();
        if (data?.choices?.[0]?.message?.content) {
          setOutput(data.choices[0].message.content);
        } else if (data?.error) {
          setError(`API Error: ${data.error.message}`);
        } else {
          setError('Unexpected response. Please try again.');
        }
        setLoading(false);
        return;
      }

      const MODEL_POOL = [
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'llama-3.1-8b-instant',
      ];

      const textChunks = [];
      for (let i = 0; i < extractedText.length; i += SUMMARY_CHUNK_SIZE) {
        textChunks.push(extractedText.slice(i, i + SUMMARY_CHUNK_SIZE));
      }

      setChunkProgress({ completed: 0, total: textChunks.length, finalizing: false });

      let completedCount = 0;
      const results = [];

      const summarizeChunk = async (chunk, i) => {
        const model = MODEL_POOL[i % MODEL_POOL.length];
        // ✅ FIXED: Swapped GROQ_API_URL out for secure internal wrapper path
        const res = await fetchWithBackoff('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolId: 'document-summarizer-chunk',
            model: model,
            max_tokens: 500,
            temperature: 0.3,
            messages: [
              {
                role: 'system',
                content: 'You are a precise document analyst. Summarize the key points from this document section in 4-6 bullet points. Preserve numbers, names, findings, and methodology details. Be concise.'
              },
              {
                role: 'user',
                content: `Section ${i + 1} of ${textChunks.length}:\n\n${chunk}`
              },
            ],
          }),
        }, 5);

        const data = await res.json();
        if (data?.error) throw new Error(`Section ${i + 1}: ${data.error.message}`);
        return { index: i, text: data?.choices?.[0]?.message?.content || '' };
      };

      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        try {
          const result = await summarizeChunk(chunk, i);
          results.push(result);
          completedCount++;
          setChunkProgress({ completed: completedCount, total: textChunks.length, finalizing: false });
        } catch (err) {
          throw err;
        }

        if (i < textChunks.length - 1) {
          await delay(3000);
        }
      }

      const partialSummaries = results
        .sort((a, b) => a.index - b.index)
        .map(r => `[Section ${r.index + 1}/${textChunks.length}]\n${r.text}`);

      setChunkProgress({ completed: textChunks.length, total: textChunks.length, finalizing: true });
      await delay(3000);

      const combinedSummaries = partialSummaries.join('\n\n');
      const finalRes = await fetchWithBackoff('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'document-summarizer-final',
          model: 'llama-3.3-70b-versatile', max_tokens: 900, temperature: 0.3,
          messages: [
            { role: 'system', content: prompt + '\n\nYou will receive section-by-section summaries of a larger document. Synthesize them into one comprehensive final summary following the format above.' },
            { role: 'user',   content: `Document section summaries:\n\n${combinedSummaries}\n\nProvide the final comprehensive summary.` },
          ],
        }),
      });
      const finalData = await finalRes.json();
      if (finalData?.choices?.[0]?.message?.content) {
        setOutput(finalData.choices[0].message.content);
      } else if (finalData?.error) {
        setError(`API Error: ${finalData.error.message}`);
      } else {
        setError('Unexpected response. Please try again.');
      }
    } catch (e) {
      setError(e.message || 'Connection error. Please try again.');
    }

    setChunkProgress(null);
    setLoading(false);
  }

  async function askFollowUp() {
    if (!followUpQuestion.trim() || chunks.length === 0) return;
    setQaLoading(true); setQaAnswer('');
    const pageMatch = followUpQuestion.match(/page\s+(\d+)/i);
    const targetPage = pageMatch ? parseInt(pageMatch[1]) : null;
    const keywords = followUpQuestion.toLowerCase().replace(/page\s+\d+/i, '').split(/\s+/).filter(w => w.length > 3);
    let filteredChunks = targetPage ? chunks.filter(c => c.source.includes(`page ${targetPage}`)) : chunks;
    if (targetPage && filteredChunks.length === 0) { setQaAnswer(`No content found on page ${targetPage}.`); setQaLoading(false); return; }
    const scored = filteredChunks.map(c => ({ ...c, score: keywords.reduce((s, kw) => s + (c.text.toLowerCase().match(new RegExp(kw, 'gi')) || []).length, 0) })).sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 4);
    if (!top.length || top[0].score === 0) { setQaAnswer("I couldn't find relevant information in the document to answer that question."); setQaLoading(false); return; }
    const context = top.map(c => `--- ${c.source} ---\n${c.text}`).join('\n\n');
    try {
      // ✅ FIXED: Rerouted Document Context Q&A endpoint from direct vendor URL to safe local proxy
      const res = await fetchWithBackoff('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'document-qa',
          model: TOOL_MODELS.documentQA, max_tokens: 600, temperature: 0.3,
          messages: [
            { role: 'system', content: `You are a precise research assistant. Answer using ONLY the provided chunks.\nCRITICAL RULES:\n1. Every factual sentence MUST end with a citation like [Source: filename, page X]\n2. If you quote directly, use [Source: filename, page X, exact quote]\n3. If the answer isn't in the chunks, say "I couldn't find that in the document."\n4. Never make up citations.` },
            { role: 'user',   content: `Document excerpts:\n\n${context}\n\nQuestion: ${followUpQuestion}` },
          ],
        }),
      });
      const data = await res.json();
      setQaAnswer(data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate an answer. Please try again.");
    } catch (e) { setQaAnswer(e.message || 'Connection error. Please try again.'); }
    setQaLoading(false);
  }

  function handleClear() {
    setOutput(''); setFileName(''); setExtractedText(''); setCharCount(0); setError('');
    setChunks([]); setQaAnswer(''); setFollowUpQuestion('');
    if (fileRef.current) fileRef.current.value = '';
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  const formattedOutput = useMemo(() => output ? formatOutput(output, theme) : null, [output, theme]);

  return (
    <div ref={topRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div onClick={() => fileRef.current?.click()} className="upload-zone" style={{ borderColor: fileName ? `${ac}66` : undefined }} role="button" tabIndex={0} aria-label="Upload PDF or Word file">
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFile} />
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{fileName ? icon : '⬆️'}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', color: fileName ? ac : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.6)'), marginBottom: '6px' }}>
          {extracting ? 'Extracting text...' : fileName ? fileName : 'Click to upload PDF or Word file'}
        </div>
        {!fileName && <div style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>Supports .pdf · .doc · .docx · Max ~40 pages for best results</div>}
        {charCount > 0 && (
          <>
            <div style={{ fontSize: '0.72rem', color: ac, marginTop: '6px', fontFamily: "'Space Mono', monospace" }}>
              {charCount.toLocaleString()} characters extracted
              {charCount >= WORD_LIMIT_UPLOAD ? ` · Large file: first ${(WORD_LIMIT_UPLOAD/1000).toFixed(0)}K chars used` : ''}
            </div>
            {charCount >= 30000 && (
              <div style={{ fontSize: '0.68rem', color: isDark ? '#febc2e' : '#b45309', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>
                ⚠️ Large file: First {Math.round(WORD_LIMIT_UPLOAD/1000)}K characters used. For best results, consider summarizing shorter sections.
              </div>
            )}
          </>
        )}
        {label === 'Analyze Resume' && !fileName && (
          <div style={{ marginTop: '10px', fontSize: '0.72rem', color: isDark ? '#febc2e' : '#b45309', fontFamily: "'Space Mono', monospace" }}>
            📋 Please upload a resume/CV (not research papers, articles, or other documents)
          </div>
        )}
      </div>

      {extractedText && (
        <>
          <button onClick={analyze} disabled={loading} className={`run-btn ${loading ? 'run-btn-disabled' : ''}`} aria-label={label}>
            {loading ? (
              <>
                <span className="spinner" />
                {chunkProgress
                  ? chunkProgress.finalizing
                    ? 'Synthesizing final summary…'
                    : `Processing sections… (${chunkProgress.completed}/${chunkProgress.total} done)`
                  : 'Analyzing…'}
              </>
            ) : `→ ${label}`}
          </button>
          {chunkProgress && !chunkProgress.finalizing && (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', textAlign: 'center', marginTop: '-10px' }}>
              ⚡ Running {chunkProgress.total} sections sequentially across 2 AI models
            </div>
          )}
        </>
      )}

      {error && (
        <div>
          <div className="error-box">⚠️ {error}</div>
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

          {chunks.length > 0 && label !== 'Analyze Resume' && (
            <div style={{ marginTop: '28px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em', marginBottom: '12px', textTransform: 'uppercase' }}>◆ Ask a follow-up question (with citations)</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={followUpQuestion}
                  onChange={e => setFollowUpQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askFollowUp()}
                  placeholder="e.g., What methodology did they use? On which page?"
                  style={{ flex: 1, minWidth: '200px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '12px 16px', color: isDark ? '#fff' : '#1a1a1a', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', outline: 'none' }}
                />
                <button onClick={askFollowUp} disabled={qaLoading || !followUpQuestion.trim()}
                  style={{ background: qaLoading || !followUpQuestion.trim() ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #a78bfa, #818cf8)', border: 'none', borderRadius: '10px', padding: '12px 24px', color: qaLoading || !followUpQuestion.trim() ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : '#000', fontWeight: 700, fontSize: '0.85rem', cursor: qaLoading || !followUpQuestion.trim() ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' }}>
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

          {label === 'Analyze Resume' && (
            <>
              <ResumeBuilder originalText={extractedText} analysisText={output} onDataParsed={setParsedResumeData} />
              {parsedResumeData && <CoverLetterGenerator resumeData={parsedResumeData} jobDescription="" />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
