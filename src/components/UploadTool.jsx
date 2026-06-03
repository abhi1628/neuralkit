// src/components/UploadTool.jsx
import { useState, useRef, useMemo } from 'react';
import { useTheme } from '../ThemeContext';
// FIXED: Changed GROQ_API_URL to CENTRAL_AI_URL
import { CENTRAL_AI_URL, WORD_LIMIT_UPLOAD, TOOL_MODELS } from '../constants';
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

  // Helper to split text into manageable slices for analysis
  function sliceTextIntoChunks(text, maxChars = 12000) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunkArray = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChars) {
        if (currentChunk) chunkArray.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += " " + sentence;
      }
    }
    if (currentChunk.trim()) chunkArray.push(currentChunk.trim());
    return chunkArray;
  }

  // Parses raw file formats into plain text fields via client routing
  async function handleFileParsing(file) {
    setError(''); setOutput(''); setExtractedText(''); setParsedResumeData(null); setChunks([]); setChunkProgress(null);
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError('File size exceeds the 4MB maximum limitation barrier.');
      return;
    }

    setFileName(file.name);
    setExtracting(true);
    trackEvent('file_upload_started', { name: file.name, type: file.type });

    try {
      let textResult = "";
      if (file.type === "application/pdf") {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

        const fileReader = new FileReader();
        textResult = await new Promise((resolve, reject) => {
          fileReader.onload = async (e) => {
            try {
              const typedarray = new Uint8Array(e.target.result);
              const pdf = await pdfjsLib.getDocument(typedarray).promise;
              let compiledText = "";
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                compiledText += content.items.map(item => item.str).join(" ") + "\n";
              }
              resolve(compiledText);
            } catch (err) { reject(err); }
          };
          fileReader.onerror = () => reject(new Error("File conversion process read crash."));
          fileReader.readAsArrayBuffer(file);
        });
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
        const fileReader = new FileReader();
        textResult = await new Promise((resolve, reject) => {
          fileReader.onload = async (e) => {
            try {
              const result = await window.mammoth.extractRawText({ arrayBuffer: e.target.result });
              resolve(result.value);
            } catch (err) { reject(err); }
          };
          fileReader.onerror = () => reject(new Error("Docx binary parser failed."));
          fileReader.readAsArrayBuffer(file);
        });
      } else {
        textResult = await file.text();
      }

      if (!textResult.trim()) throw new Error("Parsed result payload contains zero characters.");

      setExtractedText(textResult);
      setCharCount(textResult.length);
      setExtracting(false);
      
      // Instantly run the compilation process
      await runFileAnalysis(textResult);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to extract text components from the specified file asset.');
      setExtracting(false);
    }
  }

  // Submits the extracted text layers to our server router engine safely
  async function runFileAnalysis(text) {
    setLoading(true); setError(''); setOutput('');
    const textChunks = sliceTextIntoChunks(text);
    setChunks(textChunks);

    try {
      let combinedSummaries = "";
      
      // Process individual fragments sequentially to balance pipeline buffers
      for (let i = 0; i < textChunks.length; i++) {
        setChunkProgress({ current: i + 1, total: textChunks.length });
        const chunk = textChunks[i];

        // FIXED UPDATED FETCH 1: Swapped to CENTRAL_AI_URL and requested 'fast-model'
        const res = await fetchWithBackoff(CENTRAL_AI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            capability: 'fast-model', 
            max_tokens: 1000,
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: `Analyze this chunk (${i + 1}/${textChunks.length}):\n\n${chunk}` },
            ],
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Downstream chunk transmission breakdown.');
        combinedSummaries += (data.choices?.[0]?.message?.content || "") + "\n\n";
      }

      setChunkProgress(null);

      // Enforce clean output definitions
      let finalReviewResult = combinedSummaries.trim();
      setOutput(finalReviewResult);
      trackEvent('file_analysis_success', { filename, chunks: textChunks.length });

      // Run structured profile conversion extractions if analyzing a resume
      if (filename === 'resume-analysis') {
        try {
          // FIXED UPDATED FETCH 2: Swapped to CENTRAL_AI_URL and requested 'large-model'
          const jsonRes = await fetchWithBackoff(CENTRAL_AI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              capability: 'large-model',
              max_tokens: 1200,
              temperature: 0.1,
              messages: [
                { role: 'system', content: 'You are a precise data extractor. Extract the resume text parameters into a valid raw JSON format matching this schema exactly without markdown wrapping: { "name": "", "email": "", "phone": "", "skills": [], "experience": [{ "role": "", "company": "", "duration": "", "details": "" }], "education": [] }' },
                { role: 'user', content: `Convert this resume text to the target schema:\n\n${text.slice(0, 6000)}` }
              ]
            })
          });

          const jsonData = await jsonRes.json();
          if (jsonRes.ok && jsonData.choices?.[0]?.message?.content) {
            const parsedCleanString = jsonData.choices[0].message.content.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
            setParsedResumeData(JSON.parse(parsedCleanString));
          }
        } catch (jsonErr) {
          console.warn("Structured resume configuration conversion failed safely: ", jsonErr.message);
        }
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'The gateway encountered an processing timeout during data orchestration.');
    } finally {
      setLoading(false);
      setChunkProgress(null);
    }
  }

  // Handles contextual follow-up conversational queries
  async function submitFollowUp() {
    if (!followUpQuestion.trim() || qaLoading) return;
    setQaLoading(true); setQaAnswer('');

    try {
      const sanitizedQuestion = followUpQuestion.trim();
      trackEvent('file_qa_submitted', { filename });

      // FIXED UPDATED FETCH 3: Swapped to CENTRAL_AI_URL and requested 'fast-model'
      const res = await fetchWithBackoff(CENTRAL_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability: 'fast-model',
          max_tokens: 800,
          messages: [
            { role: 'system', content: `You are an assistant answering queries regarding analyzed user text files. Formulate answers using ONLY this context:\n\n${extractedText.slice(0, 12000)}` },
            { role: 'user', content: sanitizedQuestion }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract answers.');
      setQaAnswer(data.choices?.[0]?.message?.content || 'No processing response found.');
    } catch (err) {
      console.error(err);
      setQaAnswer(`Error parsing response: ${err.message}`);
    } finally {
      setQaLoading(false);
    }
  }

  const renderedOutputElements = useMemo(() => output ? formatOutput(output, theme) : null, [output, theme]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Target Upload Area */}
      <div 
        onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${error ? '#f87171' : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '14px', padding: '40px 20px', textAlign: 'center', cursor: (extracting || loading) ? 'not-allowed' : 'pointer', background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)', transition: 'all 0.2s' }}
      >
        <input 
          ref={fileRef}
          type="file" 
          accept=".pdf,.docx,.txt"
          disabled={extracting || loading}
          onChange={e => handleFileParsing(e.target.files?.[0])}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{icon}</div>
        <div style={{ fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', marginBottom: '4px' }}>
          {fileName ? `Active: ${fileName}` : `Upload ${label}`}
        </div>
        <div style={{ fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }}>
          Supports professional PDF, DOCX, or text files up to 4MB sizes
        </div>
      </div>

      {/* Loading Progress Bars */}
      {extracting && (
        <div style={{ textAlign: 'center', color: ac, fontFamily: "'Space Mono', monospace", fontSize: '0.8rem' }}>
          <span className="spinner" style={{ marginRight: '8px' }} /> Unpacking file text vectors safely...
        </div>
      )}

      {chunkProgress && (
        <div style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '100px', height: '6px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${(chunkProgress.current / chunkProgress.total) * 100}%`, background: 'linear-gradient(90deg,#a78bfa,#0af)', height: '100%', transition: 'all 0.3s' }} />
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', textAlign: 'center', marginTop: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }}>
            Orchestrating Chunk Processing Matrix: {chunkProgress.current} of {chunkProgress.total} segments
          </div>
        </div>
      )}

      {error && <div className="error-box">⚠️ {error}</div>}

      {/* Main Analysis Output Panel */}
      {output && (
        <div style={{ marginTop: '12px' }}>
          <div className="output-panel" style={{ marginBottom: '32px' }}>
            <div className="output-header">◆ Comprehensive AI Analysis Report</div>
            {renderedOutputElements}
          </div>

          {/* Contextual Interactive Document Q&A Block */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.015)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '6px' }}>
              💬 Chat with Document Data
            </div>
            <div style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)', marginBottom: '16px' }}>
              Ask custom deep questions tracking text assertions, figures, or compliance gaps internally.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                value={followUpQuestion}
                onChange={e => setFollowUpQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitFollowUp()}
                placeholder="e.g., What are the clear performance figures or structural limitations mentioned?"
                style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}`, borderRadius: '10px', padding: '12px 16px', color: isDark ? '#fff' : '#000', fontSize: '0.88rem', outline: 'none' }}
              />
              <button 
                onClick={submitFollowUp}
                disabled={qaLoading || !followUpQuestion.trim()}
                style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', border: 'none', borderRadius: '10px', padding: '0 24px', color: '#000', fontWeight: 700, fontSize: '0.85rem', cursor: (qaLoading || !followUpQuestion.trim()) ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {qaLoading ? <><span className=\"spinner\" style={{ width: '12px', height: '12px' }} />Searching...</> : 'Ask →'}
              </button>
            </div>
            {qaAnswer && (
              <div style={{ marginTop: '16px', background: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(124,58,237,0.04)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.15)'}`, borderRadius: '12px', padding: '20px', fontSize: '0.85rem', lineHeight: 1.75, color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.8)' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: ac, marginBottom: '12px', letterSpacing: '0.1em' }}>◆ ANSWER FROM FILE CONTEXT</div>
                {qaAnswer.split('\n').map((line, i) => <div key={i} style={{ marginBottom: line.trim() === '' ? '12px' : '6px' }}>{line}</div>)}
              </div>
            )}
          </div>

          <OutputActions text={output} filename={filename} />
        </div>
      )}

      {/* Downstream Integrated Tool Interfaces */}
      {parsedResumeData && filename === 'resume-analysis' && (
        <div style={{ marginTop: '24px', borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingTop: '32px' }}>
          <ResumeBuilder prefilledData={parsedResumeData} />
          <CoverLetterGenerator resumeText={extractedText} />
        </div>
      )}
    </div>
  );
}
