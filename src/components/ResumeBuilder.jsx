// src/components/ResumeBuilder.jsx
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, TOOL_MODELS } from '../constants';
import { loadScript, fetchWithBackoff } from '../utils';

// Robust JSON parser — handles preamble, truncation, markdown fences
function safeParseResume(raw) {
  if (!raw) throw new Error('Empty response.');
  let s = raw.replace(/```json|```/g, '').trim();
  const first = s.indexOf('{');
  if (first === -1) throw new Error('No JSON found.');
  s = s.slice(first);
  const last = s.lastIndexOf('}');
  if (last === -1) throw new Error('Incomplete JSON.');
  s = s.slice(0, last + 1)
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
  return JSON.parse(s);
}

const RESUME_SCHEMA = `{
  "name":"",
  "contact":{"email":"","phone":"","location":"","linkedin":"","github":"","website":""},
  "summary":"2-3 sentence professional summary tailored to target role",
  "experience":[{"title":"","company":"","dates":"","bullets":["strong action verb + quantified achievement"]}],
  "education":[{"degree":"","institution":"","dates":"","gpa":""}],
  "skills":{"technical":[],"tools":[],"soft":[]},
  "publications":{"books":[],"papers":[],"datasets":[]},
  "projects":[{"name":"","description":"","tech":""}],
  "certifications":[],
  "awards":[],
  "mentorship":[],
  "languages":[]
}`;

export default function ResumeBuilder({ originalText, analysisText, onDataParsed }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = 'var(--accent)';

  const [step,           setStep]           = useState('prompt');
  const [agreed,         setAgreed]         = useState(false);
  const [resumeData,     setResumeData]     = useState(null);
  const [buildError,     setBuildError]     = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [template,       setTemplate]       = useState('modern');

  // Trim input — 12000 chars is safe with our 4000 token output budget
  // 6000 was too low: a resume with multiple roles + publications exceeds it silently
  const trimmedOriginal  = (originalText  || '').slice(0, 12000);
  const trimmedAnalysis  = (analysisText  || '').slice(0, 2000);

  async function generateResume() {
    setStep('generating'); setBuildError('');
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: TOOL_MODELS.resumeBuilder,
          max_tokens: 4000,
          temperature: 0.1,
          messages: [
            { role: 'system', content: `You are an expert resume writer and ATS specialist. Produce an improved resume as valid JSON only.\n\nCRITICAL RULES — follow exactly:\n1. Output ONLY valid JSON — no preamble, no markdown, no backticks.\n2. Extract ONLY information from the original resume. Never invent any detail.\n3. KEYWORD PRESERVATION (critical for ATS): Copy ALL skills, tools, technologies, frameworks, and domain terms VERBATIM into the skills section. Do NOT rephrase exact tool names — ATS systems do literal string matching. 'TensorFlow' stays 'TensorFlow', not 'deep learning framework'.\n4. Skills section MUST be exhaustive — include every technical term, language, platform, and methodology mentioned anywhere in the original.\n5. Preserve ALL publications, books, papers, datasets exactly as written — do not summarize or shorten.\n6. Single-column layout only — two-column breaks ATS parsers.\n7. Strengthen bullet points with action verbs. Quantify ONLY where the original already has numbers — never invent metrics.\n8. Keep ALL sections that had content — do not drop any section.\n\nSchema:\n${RESUME_SCHEMA}\n\nReturn ONLY valid JSON.` },
            { role: 'user', content: `Original Resume:\n${trimmedOriginal}\n\nAnalysis Feedback (apply selectively — ignore any two-column layout suggestions):\n${trimmedAnalysis}` },
          ],
        }),
      });
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      if (!raw) throw new Error(data?.error?.message || 'Empty response from AI. Please try again.');
      const parsed = safeParseResume(raw);
      setResumeData(parsed);
      setStep('done');
      if (onDataParsed) onDataParsed(parsed);
    } catch (e) {
      setBuildError(e.message || 'Failed to generate resume. Please try again.');
      setStep('error');
    }
  }

  async function downloadResumePdf() {
    if (!resumeData) return;
    setDownloadingPdf(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const c = resumeData.contact || {};
      let y = 22;
      const tc = { modern: [31,111,235], classic: [44,82,130], minimal: [26,26,26] }[template] || [31,111,235];

      doc.setFont('helvetica','bold'); doc.setFontSize(22); doc.setTextColor(26,26,26);
      doc.text(resumeData.name || 'Your Name', 105, y, { align: 'center' }); y += 9;
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(100,100,100);
      doc.text([c.email, c.phone, c.location, c.linkedin].filter(Boolean).join('  |  '), 105, y, { align: 'center' }); y += 7;
      doc.setDrawColor(...tc); doc.setLineWidth(0.6); doc.line(10, y, 200, y); y += 7;

      const section = (title) => {
        if (y > 270) { doc.addPage(); y = 18; }
        doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.setTextColor(...tc);
        doc.text(title.toUpperCase(), 10, y); y += 4;
        doc.setDrawColor(200,200,200); doc.setLineWidth(0.2); doc.line(10, y, 200, y); y += 5;
      };
      const body = (text, indent = 10) => {
        doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(40,40,40);
        doc.splitTextToSize(text, 190 - (indent - 10)).forEach(line => { if (y > 278) { doc.addPage(); y = 18; } doc.text(line, indent, y); y += 5; });
      };

      if (resumeData.summary) { section('Summary'); body(resumeData.summary); y += 3; }
      if (resumeData.experience?.length) {
        section('Experience');
        resumeData.experience.forEach(exp => {
          if (y > 270) { doc.addPage(); y = 18; }
          doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(30,30,30);
          doc.text(`${exp.title || ''}${exp.company ? `  —  ${exp.company}` : ''}`, 10, y);
          doc.setFont('helvetica','italic'); doc.setFontSize(8.5); doc.setTextColor(120,120,120);
          doc.text(exp.dates || '', 200, y, { align: 'right' }); y += 5;
          (exp.bullets || []).forEach(b => body(`• ${b}`, 14)); y += 2;
        });
      }
      if (resumeData.education?.length) {
        section('Education');
        resumeData.education.forEach(edu => {
          if (y > 270) { doc.addPage(); y = 18; }
          doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(30,30,30);
          doc.text(`${edu.degree || ''}${edu.institution ? `  —  ${edu.institution}` : ''}`, 10, y);
          doc.setFont('helvetica','italic'); doc.setFontSize(8.5); doc.setTextColor(120,120,120);
          doc.text(edu.dates || '', 200, y, { align: 'right' }); y += 5;
          if (edu.gpa) body(`GPA: ${edu.gpa}`, 14); y += 2;
        });
      }
      if (resumeData.skills) {
        section('Skills');
        [{ label: 'Technical', items: resumeData.skills.technical }, { label: 'Tools', items: resumeData.skills.tools }, { label: 'Soft Skills', items: resumeData.skills.soft }]
          .filter(s => s.items?.length)
          .forEach(s => {
            if (y > 278) { doc.addPage(); y = 18; }
            doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(40,40,40);
            const lw = doc.getTextWidth(`${s.label}: `);
            doc.text(`${s.label}: `, 10, y);
            doc.setFont('helvetica','normal');
            const rest = doc.splitTextToSize(s.items.join(', '), 188 - lw);
            doc.text(rest[0], 10 + lw, y); y += 5;
            if (rest.length > 1) rest.slice(1).forEach(l => body(l, 10));
          }); y += 2;
      }
      if (resumeData.projects?.length) {
        section('Projects');
        resumeData.projects.forEach(p => {
          if (y > 270) { doc.addPage(); y = 18; }
          doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(30,30,30);
          doc.text(`${p.name || ''}${p.tech ? `  (${p.tech})` : ''}`, 10, y); y += 5;
          if (p.description) body(`• ${p.description}`, 14); y += 2;
        });
      }
      if (resumeData.publications) {
        const pubSections = [
          { label: 'Books', items: resumeData.publications.books },
          { label: 'Papers & Journals', items: resumeData.publications.papers },
          { label: 'Datasets', items: resumeData.publications.datasets },
        ].filter(s => s.items?.length);
        if (pubSections.length) {
          section('Publications');
          pubSections.forEach(ps => {
            if (y > 278) { doc.addPage(); y = 18; }
            doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(80,80,80);
            doc.text(ps.label.toUpperCase(), 10, y); y += 4;
            ps.items.forEach(item => body(`• ${item}`, 14));
          });
          y += 2;
        }
      }
      if (resumeData.awards?.length) { section('Awards'); resumeData.awards.forEach(a => body(`• ${a}`, 14)); y += 2; }
      if (resumeData.mentorship?.length) { section('Volunteer & Mentorship'); resumeData.mentorship.forEach(m => body(`• ${m}`, 14)); y += 2; }
      if (resumeData.certifications?.length) { section('Certifications'); resumeData.certifications.forEach(cert => body(`• ${cert}`, 14)); }

      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i); doc.setFontSize(7); doc.setTextColor(180,180,180);
        doc.text(`Generated by ZeroAPI.in  |  Review carefully before sending  |  Page ${i} of ${pages}`, 105, 291, { align: 'center' });
      }
      doc.save(`${(resumeData.name || 'resume').replace(/\s+/g, '-').toLowerCase()}-improved.pdf`);
    } catch (e) { console.error(e); setBuildError('PDF generation failed. Please try again.'); }
    setDownloadingPdf(false);
  }

  if (step === 'prompt') return (
    <div style={{ marginTop: '20px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '14px', padding: '20px 24px' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em', marginBottom: '10px' }}>◆ NEXT STEP</div>
      <p style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>Want to build an <strong>improved, ATS-optimized resume</strong> based on this analysis?</p>
      <button onClick={() => setStep('disclaimer')} style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', border: 'none', borderRadius: '10px', padding: '10px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Mono', monospace" }}>✨ Build Improved Resume →</button>
    </div>
  );

  if (step === 'disclaimer') return (
    <div style={{ marginTop: '20px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`, borderRadius: '14px', padding: '24px' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: isDark ? '#febc2e' : '#b45309', letterSpacing: '0.12em', marginBottom: '14px' }}>⚠ BEFORE YOU PROCEED</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {['Your resume text will be sent to Groq AI to generate an improved version.','Groq processes your data in real-time and does not store it permanently.','ZeroAPI does not store, save, or retain your resume or any personal data.','The generated resume stays in your browser only — gone when you close the tab.','Always review AI-generated content carefully before sending to employers.'].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: ac, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', marginTop: '2px', flexShrink: 0 }}>✓</span>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.7)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item}</span>
          </div>
        ))}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
        <span style={{ fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', fontWeight: 500 }}>I understand and agree to proceed</span>
      </label>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={generateResume} disabled={!agreed} style={{ background: agreed ? 'linear-gradient(135deg, #a78bfa, #818cf8)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), border: 'none', borderRadius: '10px', padding: '10px 24px', color: agreed ? '#000' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'), fontWeight: 700, fontSize: '0.85rem', cursor: agreed ? 'pointer' : 'not-allowed', fontFamily: "'Space Mono', monospace" }}>Generate Resume →</button>
        <button onClick={() => { setStep('prompt'); setAgreed(false); }} style={{ background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '10px 20px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );

  if (step === 'generating') return (
    <div style={{ marginTop: '20px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '14px', padding: '32px 24px', textAlign: 'center' }}>
      <span className="spinner" style={{ width: '20px', height: '20px', display: 'block', margin: '0 auto 14px' }} />
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', color: ac }}>Generating your improved resume...</div>
      <div style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginTop: '8px' }}>This may take 10–20 seconds</div>
    </div>
  );

  if (step === 'error') return (
    <div style={{ marginTop: '20px' }}>
      <div className="error-box">⚠ {buildError}</div>
      <button onClick={() => setStep('prompt')} style={{ marginTop: '10px', background: 'transparent', border: '1px solid var(--accent)', borderRadius: '8px', padding: '8px 18px', color: 'var(--accent)', fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', cursor: 'pointer' }}>↺ Try Again</button>
    </div>
  );

  return (
    <div style={{ marginTop: '20px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`, borderRadius: '14px', padding: '24px' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em', marginBottom: '6px' }}>✅ RESUME READY</div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', marginBottom: '4px' }}>{resumeData?.name}</div>
      <div style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)', marginBottom: '18px', fontFamily: "'Space Mono', monospace" }}>
        {[resumeData?.experience?.length && `${resumeData.experience.length} role${resumeData.experience.length > 1 ? 's' : ''}`, resumeData?.skills?.technical?.length && `${resumeData.skills.technical.length} skills`, resumeData?.publications?.books?.length && `${resumeData.publications.books.length} books`, resumeData?.education?.length && `${resumeData.education.length} education`].filter(Boolean).join(' · ')}
      </div>

      {/* ── PREVIEW PANEL ── */}
      <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)'}`, borderRadius: '10px', padding: '20px', marginBottom: '18px', maxHeight: '420px', overflowY: 'auto' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', color: ac, letterSpacing: '0.12em', marginBottom: '12px' }}>◆ PREVIEW — REVIEW BEFORE DOWNLOADING</div>
        {resumeData?.summary && <div style={{ marginBottom: '12px' }}><div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '4px', textTransform:'uppercase' }}>Summary</div><div style={{ fontSize: '0.82rem', color: isDark?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.75)', lineHeight: 1.65 }}>{resumeData.summary}</div></div>}
        {resumeData?.experience?.length > 0 && <div style={{ marginBottom: '12px' }}><div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '6px', textTransform:'uppercase' }}>Experience</div>{resumeData.experience.map((e,i) => <div key={i} style={{ marginBottom: '8px' }}><div style={{ fontSize: '0.82rem', fontWeight: 600, color: isDark?'#fff':'#1a1a1a' }}>{e.title} — {e.company} <span style={{ fontWeight: 400, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', fontSize: '0.76rem' }}>{e.dates}</span></div>{(e.bullets||[]).map((b,j) => <div key={j} style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.5, paddingLeft: '12px', marginTop: '2px' }}>• {b}</div>)}</div>)}</div>}
        {resumeData?.publications && (resumeData.publications.books?.length > 0 || resumeData.publications.papers?.length > 0) && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '6px', textTransform:'uppercase' }}>Publications</div>
            {resumeData.publications.books?.map((b,i) => <div key={i} style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.5, marginTop: '2px' }}>📘 {b}</div>)}
            {resumeData.publications.papers?.map((p,i) => <div key={i} style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.5, marginTop: '2px' }}>📄 {p}</div>)}
          </div>
        )}
        {resumeData?.skills && <div style={{ marginBottom: '4px' }}><div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '4px', textTransform:'uppercase' }}>Skills</div><div style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.6 }}>{[...(resumeData.skills.technical||[]), ...(resumeData.skills.tools||[])].join(' · ')}</div></div>}
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', gap: '6px' }}>
        {['modern','classic','minimal'].map(t => (
          <button key={t} onClick={() => setTemplate(t)} style={{ background: template === t ? ac : 'transparent', border: `1px solid ${template === t ? ac : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '6px', padding: '4px 12px', color: template === t ? '#000' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.68rem', cursor: 'pointer', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>{t}</button>
        ))}
      </div>
      <div style={{ background: isDark ? 'rgba(255,180,0,0.15)' : '#fff8e1', border: `1px solid ${isDark ? 'rgba(255,180,0,0.3)' : '#b45309'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '0.78rem', color: isDark ? '#febc2e' : '#b45309', lineHeight: 1.6 }}>
        ⚠ Review all content in the preview above before downloading. Verify publications, dates, and metrics match your original.
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={downloadResumePdf} disabled={downloadingPdf} style={{ background: downloadingPdf ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #a78bfa, #818cf8)', border: 'none', borderRadius: '10px', padding: '10px 22px', color: downloadingPdf ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : '#000', fontWeight: 700, fontSize: '0.82rem', cursor: downloadingPdf ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' }}>
          {downloadingPdf ? <><span className="spinner" style={{ width: '12px', height: '12px' }} />Building...</> : '⬇ Download PDF'}
        </button>
        <button onClick={() => { setStep('prompt'); setResumeData(null); setBuildError(''); setAgreed(false); }} style={{ background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '10px 16px', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.82rem', cursor: 'pointer' }}>↺ Regenerate</button>
      </div>
    </div>
  );
}
