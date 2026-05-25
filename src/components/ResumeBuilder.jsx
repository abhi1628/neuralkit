// src/components/ResumeBuilder.jsx
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL } from '../constants';
import { loadScript, fetchWithBackoff } from '../utils';

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

  async function generateResume() {
    setStep('generating'); setBuildError('');
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', max_tokens: 1500,
          messages: [
            { role: 'system', content: `You are an expert resume writer and ATS optimization specialist. Given original resume text and analysis feedback, generate an improved resume.\n\nCRITICAL: Respond ONLY with a valid JSON object. No preamble, no markdown backticks.\n\nFormat:\n{"name":"Full Name","contact":{"email":"","phone":"","location":"","linkedin":""},"summary":"2-3 sentence professional summary","experience":[{"title":"","company":"","dates":"","bullets":["action verb + achievement"]}],"education":[{"degree":"","institution":"","dates":"","gpa":""}],"skills":{"technical":[],"soft":[],"tools":[]},"certifications":[],"projects":[{"name":"","description":"","tech":""}]}\n\nRules:\n- Extract ONLY information from the original resume. Never invent or add fake data.\n- Improve bullet points to start with strong action verbs.\n- Add metrics where they exist in the original.\n- Omit sections with no data.\n- Return ONLY valid JSON.` },
            { role: 'user', content: `Original Resume:\n${originalText}\n\nAnalysis Feedback:\n${analysisText}` },
          ],
        }),
      });
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setResumeData(parsed);
      setStep('done');
      if (onDataParsed) onDataParsed(parsed);
    } catch (e) { setBuildError(e.message || 'Failed to generate resume. Please try again.'); setStep('error'); }
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

      if (resumeData.summary) { section('Professional Summary'); body(resumeData.summary); y += 3; }
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
        {[resumeData?.experience?.length && `${resumeData.experience.length} role${resumeData.experience.length > 1 ? 's' : ''}`, resumeData?.skills?.technical?.length && `${resumeData.skills.technical.length} skills`, resumeData?.education?.length && `${resumeData.education.length} education`].filter(Boolean).join(' · ')}
      </div>
      <div style={{ marginBottom: '12px', display: 'flex', gap: '6px' }}>
        {['modern','classic','minimal'].map(t => (
          <button key={t} onClick={() => setTemplate(t)} style={{ background: template === t ? ac : 'transparent', border: `1px solid ${template === t ? ac : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '6px', padding: '4px 12px', color: template === t ? '#000' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.68rem', cursor: 'pointer', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>{t}</button>
        ))}
      </div>
      <div style={{ background: isDark ? 'rgba(255,180,0,0.15)' : '#fff8e1', border: `1px solid ${isDark ? 'rgba(255,180,0,0.3)' : '#b45309'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '0.78rem', color: isDark ? '#febc2e' : '#b45309', lineHeight: 1.6 }}>
        ⚠ Review all content before sending. AI may not capture every nuance of your experience.
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
