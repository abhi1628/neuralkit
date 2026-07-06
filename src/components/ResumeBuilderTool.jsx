// src/components/ResumeBuilderTool.jsx
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, TOOL_MODELS } from '../constants';
import { loadScript, fetchWithBackoff } from '../utils';

// Robust JSON parser — same as ResumeBuilder
function safeParseResume(raw) {
  if (!raw) throw new Error('Empty response.');
  let s = raw.replace(/```json|```/g, '').trim();
  const first = s.indexOf('{');
  if (first === -1) throw new Error('No JSON found.');
  s = s.slice(first);
  const last = s.lastIndexOf('}');
  if (last === -1) throw new Error('Incomplete JSON — try again.');
  s = s.slice(0, last + 1)
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
  return JSON.parse(s);
}

const STEPS = ['Personal Info', 'Summary & Target', 'Experience', 'Education', 'Skills', 'Projects & Extras', 'Review & Generate'];

const BLANK_DATA = () => ({
  name: '', email: '', phone: '', location: '', linkedin: '', github: '',
  target: '', summary: '',
  experience: [{ id: Date.now(),   title: '', company: '', startDate: '', endDate: '', current: false, bullets: '' }],
  education:  [{ id: Date.now()+1, degree: '', field: '', institution: '', year: '', gpa: '' }],
  techSkills: '', tools: '', softSkills: '',
  projects: [{ id: Date.now()+2, name: '', tech: '', description: '' }],
  certs: '', languages: '', achievements: '',
});

export default function ResumeBuilderTool() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = 'var(--accent)';

  const [step,              setStep]              = useState(0);
  const [data,              setData]              = useState(BLANK_DATA);
  const [agreed,            setAgreed]            = useState(false);
  const [generating,        setGenerating]        = useState(false);
  const [resumeData,        setResumeData]        = useState(null);
  const [buildError,        setBuildError]        = useState('');
  const [loadingLinkedIn,   setLoadingLinkedIn]   = useState(false);
  const [showLinkedInPaste, setShowLinkedInPaste] = useState(false);
  const [downloadingPdf,    setDownloadingPdf]    = useState(false);
  const topRef = useRef(null);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [step]);

  // ── Helpers ───────────────────────────────────────────────────
  const upd    = (key, val)   => setData(d => ({ ...d, [key]: val }));
  const updExp = (id, k, v)   => setData(d => ({ ...d, experience: d.experience.map(e => e.id === id ? { ...e, [k]: v } : e) }));
  const updEdu = (id, k, v)   => setData(d => ({ ...d, education:  d.education.map(e  => e.id === id ? { ...e, [k]: v } : e) }));
  const updProj= (id, k, v)   => setData(d => ({ ...d, projects:   d.projects.map(p   => p.id === id ? { ...p, [k]: v } : p) }));

  const addExp  = () => setData(d => ({ ...d, experience: [...d.experience, { id: Date.now(), title: '', company: '', startDate: '', endDate: '', current: false, bullets: '' }] }));
  const removeExp = (id) => setData(d => ({ ...d, experience: d.experience.filter(e => e.id !== id) }));
  const addEdu  = () => setData(d => ({ ...d, education: [...d.education, { id: Date.now(), degree: '', field: '', institution: '', year: '', gpa: '' }] }));
  const removeEdu = (id) => setData(d => ({ ...d, education: d.education.filter(e => e.id !== id) }));
  const addProj = () => setData(d => ({ ...d, projects: [...d.projects, { id: Date.now(), name: '', tech: '', description: '' }] }));
  const removeProj = (id) => setData(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));

  const inp = (extra = {}) => ({
    style: { width: '100%', boxSizing: 'border-box', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '10px 14px', color: isDark ? '#fff' : '#1a1a1a', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', outline: 'none', ...extra },
  });
  const lbl    = (text) => <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: ac, letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>{text}</div>;
  const secLbl = (text) => <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: ac, letterSpacing: '0.1em', marginBottom: '10px' }}>{text}</div>;
  const grid2  = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
  const cardStyle = { background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px', padding: '16px' };
  const removeBtn = (onClick) => <button onClick={onClick} style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '6px', padding: '3px 10px', color: '#ff6b6b', fontSize: '0.72rem', cursor: 'pointer' }}>Remove</button>;
  const addBtn = (onClick, text) => <button onClick={onClick} style={{ background: 'rgba(167,139,250,0.06)', border: `1px dashed ${ac}`, borderRadius: '10px', padding: '10px', color: ac, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', cursor: 'pointer', width: '100%' }}>{text}</button>;

  const navBtns = (canNext = true) => (
    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
      {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '10px 20px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.85rem', cursor: 'pointer' }}>← Back</button>}
      <button onClick={() => setStep(s => s + 1)} disabled={!canNext} style={{ background: canNext ? 'linear-gradient(135deg, #a78bfa, #818cf8)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), border: 'none', borderRadius: '10px', padding: '10px 24px', color: canNext ? '#000' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'), fontWeight: 700, fontSize: '0.85rem', cursor: canNext ? 'pointer' : 'not-allowed', fontFamily: "'Space Mono', monospace" }}>Next →</button>
    </div>
  );

  // ── Generate resume JSON ──────────────────────────────────────
  async function generate() {
    setGenerating(true); setBuildError('');
    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: TOOL_MODELS.resumeBuilderTool,
          max_tokens: 4000,
          temperature: 0.1,
          messages: [
            { role: 'system', content: `You are an expert resume writer and ATS specialist. Produce a polished, ATS-optimized resume as JSON only.\nCRITICAL: Return ONLY valid JSON — no markdown, no preamble, no backticks.\nRules:\n1. KEYWORD PRESERVATION: Copy ALL skills, tools, technologies, and frameworks VERBATIM into the skills section. ATS does literal string matching — never rephrase exact tool names.\n2. Skills must be exhaustive — include every tech term, language, platform, methodology from the input.\n3. Rewrite bullets with strong action verbs. Quantify only where the user already provided numbers.\n4. Polish the summary into 2-3 compelling sentences for the target role.\n5. Never fabricate any detail. Keep ALL information exactly.\n6. Single-column only — two-column layouts break ATS parsers.\n7. Keep all sections that have data.\nOutput: {"name":"","contact":{"email":"","phone":"","location":"","linkedin":"","github":"","website":""},"summary":"","experience":[{"title":"","company":"","dates":"","bullets":[]}],"education":[{"degree":"","institution":"","dates":"","gpa":""}],"skills":{"technical":[],"tools":[],"soft":[]},"publications":{"books":[],"papers":[],"datasets":[]},"projects":[{"name":"","description":"","tech":""}],"certifications":[],"awards":[],"mentorship":[],"languages":[],"achievements":[]}` },
            { role: 'user', content: `Target Role: ${data.target}\nName: ${data.name} | Email: ${data.email} | Phone: ${data.phone} | Location: ${data.location}\nLinkedIn: ${data.linkedin} | GitHub: ${data.github}\n\nSummary: ${data.summary}\n\nExperience:\n${data.experience.map(e => `${e.title} at ${e.company} (${e.startDate}–${e.current ? 'Present' : e.endDate})\n${e.bullets}`).join('\n\n')}\n\nEducation:\n${data.education.map(e => `${e.degree} in ${e.field}, ${e.institution}, ${e.year}, GPA: ${e.gpa}`).join('\n')}\n\nTechnical Skills: ${data.techSkills}\nTools: ${data.tools}\nSoft Skills: ${data.softSkills}\n\nProjects:\n${data.projects.map(p => `${p.name} (${p.tech}): ${p.description}`).join('\n')}\n\nCertifications:\n${data.certs}\nLanguages: ${data.languages}\nAchievements:\n${data.achievements}` },
          ],
        }),
      });
      const json = await res.json();
      const raw = json?.choices?.[0]?.message?.content || '';
      if (!raw) throw new Error(json?.error?.message || 'Empty response. Please try again.');
      const parsed = safeParseResume(raw);
      setResumeData(parsed); setStep(7);
    } catch (e) { setBuildError(e.message || 'Generation failed. Please check your inputs and try again.'); }
    setGenerating(false);
  }

  // ── Download PDF ──────────────────────────────────────────────
  async function downloadPdf() {
    if (!resumeData) return;
    setDownloadingPdf(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const c = resumeData.contact || {};
      let y = 22;
      const tc = [31, 111, 235];

      doc.setFont('helvetica','bold'); doc.setFontSize(22); doc.setTextColor(26,26,26);
      doc.text(resumeData.name || '', 105, y, { align: 'center' }); y += 9;
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(100,100,100);
      doc.text([c.email, c.phone, c.location, c.linkedin, c.github].filter(Boolean).join('  |  '), 105, y, { align: 'center' }); y += 7;
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
        [{ label: 'Technical', items: resumeData.skills.technical }, { label: 'Tools', items: resumeData.skills.tools }, { label: 'Soft Skills', items: resumeData.skills.soft }].filter(s => s.items?.length).forEach(s => {
          if (y > 278) { doc.addPage(); y = 18; }
          doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(40,40,40);
          const lw = doc.getTextWidth(`${s.label}: `);
          doc.text(`${s.label}: `, 10, y); doc.setFont('helvetica','normal');
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
      if (resumeData.certifications?.length) { section('Certifications'); resumeData.certifications.forEach(cert => body(`• ${cert}`, 14)); y += 2; }
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
      if (resumeData.achievements?.length) { section('Achievements'); resumeData.achievements.forEach(a => body(`• ${a}`, 14)); y += 2; }
      if (resumeData.languages?.length) { section('Languages'); body(resumeData.languages.join('  ·  '), 10); }
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(180,180,180); doc.text(`Generated by ZeroAPI.in | Page ${i} of ${pages}`, 105, 291, { align: 'center' }); }
      doc.save(`${(resumeData.name || 'resume').replace(/\s+/g, '-').toLowerCase()}-zeroapi.pdf`);
    } catch { setBuildError('PDF download failed.'); }
    setDownloadingPdf(false);
  }

  // ── Progress bar ──────────────────────────────────────────────
  const progressBar = step < 7 && (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: i === step ? ac : i < step ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'), fontWeight: i === step ? 700 : 400 }}>
            {i < step ? '✓' : `${i+1}`}
          </div>
        ))}
      </div>
      <div style={{ height: '3px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${((step) / (STEPS.length - 1)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa, #818cf8)', transition: 'width 0.4s' }} />
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, marginTop: '8px' }}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</div>
    </div>
  );

  // ── Done Screen ───────────────────────────────────────────────
  if (step === 7 && resumeData) return (
    <div ref={topRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '14px', padding: '24px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em', marginBottom: '12px' }}>✅ RESUME READY</div>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: isDark ? '#fff' : '#0f172a', marginBottom: '4px' }}>{resumeData.name}</div>
        <div style={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b', fontFamily: "'Space Mono', monospace", marginBottom: '18px' }}>
          {[
            resumeData.experience?.length && `${resumeData.experience.length} role${resumeData.experience.length > 1 ? 's' : ''}`,
            resumeData.skills?.technical?.length && `${resumeData.skills.technical.length} skills`,
            resumeData.education?.length && `${resumeData.education.length} education`,
            resumeData.publications?.books?.length && `${resumeData.publications.books.length} book${resumeData.publications.books.length > 1 ? 's' : ''}`,
            resumeData.publications?.papers?.length && `${resumeData.publications.papers.length} paper${resumeData.publications.papers.length > 1 ? 's' : ''}`,
          ].filter(Boolean).join(' · ')}
        </div>

        {/* ── Preview Panel ── */}
        <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)'}`, borderRadius: '10px', padding: '20px', marginBottom: '18px', maxHeight: '420px', overflowY: 'auto' }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', color: ac, letterSpacing: '0.12em', marginBottom: '14px' }}>◆ PREVIEW — REVIEW BEFORE DOWNLOADING</div>
          {resumeData.summary && <div style={{ marginBottom: '14px' }}><div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '4px', textTransform:'uppercase' }}>Summary</div><div style={{ fontSize: '0.82rem', color: isDark?'rgba(255,255,255,0.82)':'rgba(0,0,0,0.75)', lineHeight: 1.7 }}>{resumeData.summary}</div></div>}
          {resumeData.experience?.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '8px', textTransform:'uppercase' }}>Experience</div>
              {resumeData.experience.map((e,i) => (
                <div key={i} style={{ marginBottom: '10px', paddingLeft: '0' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: isDark?'#fff':'#1a1a1a', marginBottom: '2px' }}>{e.title}{e.company ? ` — ${e.company}` : ''} <span style={{ fontWeight: 400, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', fontSize: '0.75rem' }}>{e.dates}</span></div>
                  {(e.bullets||[]).map((b,j) => <div key={j} style={{ fontSize: '0.79rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.55, paddingLeft: '14px', marginTop: '3px' }}>• {b}</div>)}
                </div>
              ))}
            </div>
          )}
          {resumeData.publications && (resumeData.publications.books?.length > 0 || resumeData.publications.papers?.length > 0 || resumeData.publications.datasets?.length > 0) && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '6px', textTransform:'uppercase' }}>Publications</div>
              {resumeData.publications.books?.map((b,i) => <div key={i} style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.5, marginTop: '3px' }}>📘 {b}</div>)}
              {resumeData.publications.papers?.map((p,i) => <div key={i} style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.5, marginTop: '3px' }}>📄 {p}</div>)}
              {resumeData.publications.datasets?.map((d,i) => <div key={i} style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.5, marginTop: '3px' }}>🗂 {d}</div>)}
            </div>
          )}
          {resumeData.awards?.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '6px', textTransform:'uppercase' }}>Awards</div>
              {resumeData.awards.map((a,i) => <div key={i} style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.5, marginTop: '3px' }}>🏆 {a}</div>)}
            </div>
          )}
          {resumeData.skills && (
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.4)', marginBottom: '4px', textTransform:'uppercase' }}>Skills</div>
              <div style={{ fontSize: '0.78rem', color: isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.65)', lineHeight: 1.6 }}>{[...(resumeData.skills.technical||[]), ...(resumeData.skills.tools||[])].join(' · ')}</div>
            </div>
          )}
        </div>

        <div style={{ background: isDark ? 'rgba(255,180,0,0.15)' : '#fff8e1', border: `1px solid ${isDark ? 'rgba(255,180,0,0.3)' : '#f59e0b'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '0.78rem', color: isDark ? '#febc2e' : '#b45309', lineHeight: 1.6 }}>
          ⚠ Review all content above before downloading — verify publications, dates, and metrics match your original.
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={downloadPdf} disabled={downloadingPdf} style={{ background: downloadingPdf ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #a78bfa, #818cf8)', border: 'none', borderRadius: '10px', padding: '10px 22px', color: downloadingPdf ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : '#000', fontWeight: 700, fontSize: '0.82rem', cursor: downloadingPdf ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' }}>
            {downloadingPdf ? <><span className="spinner" style={{ width: '12px', height: '12px' }} />Building...</> : '⬇ Download PDF'}
          </button>
          <button onClick={() => { setStep(0); setResumeData(null); setBuildError(''); setAgreed(false); setData(BLANK_DATA()); }} style={{ background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '10px 16px', color: isDark ? 'rgba(255,255,255,0.5)' : '#334155', fontSize: '0.82rem', cursor: 'pointer' }}>↺ Build New Resume</button>
        </div>
      </div>
    </div>
  );

  // ── Step Renderer ─────────────────────────────────────────────
  function renderStep() {
    if (step === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: ac, marginBottom: '10px' }}>⚡ LINKEDIN IMPORT (OPTIONAL)</div>
          <button onClick={() => setShowLinkedInPaste(s => !s)} disabled={loadingLinkedIn}
            style={{ background: loadingLinkedIn ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : ac, border: 'none', borderRadius: '8px', padding: '10px 18px', color: loadingLinkedIn ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : '#000', fontWeight: 700, fontSize: '0.78rem', cursor: loadingLinkedIn ? 'not-allowed' : 'pointer', fontFamily: "'Space Mono', monospace", whiteSpace: 'nowrap' }}>
            {showLinkedInPaste ? '▲ Hide' : '📋 Paste LinkedIn Text'}
          </button>
          {showLinkedInPaste && (
            <div style={{ marginTop: '12px' }}>
              <textarea onChange={e => {
                const text = e.target.value;
                const lines = text.split('\n').filter(l => l.trim());
                const nameLine = lines[0];
                const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                if (nameLine && !data.name) upd('name', nameLine);
                if (emailMatch && !data.email) upd('email', emailMatch[0]);
                if (phoneMatch && !data.phone) upd('phone', phoneMatch[0]);
              }} rows={8} placeholder="Paste your LinkedIn profile text here (About, Experience, Education)..."
                style={{ width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '8px', padding: '10px', color: isDark ? '#fff' : '#1a1a1a', fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', resize: 'vertical' }} />
              <div style={{ fontSize: '0.68rem', color: isDark ? '#febc2e' : '#b45309', marginTop: '6px', fontFamily: "'Space Mono', monospace" }}>
                💡 Tip: Go to LinkedIn → Click "More" → "Save to PDF" → Copy text from the PDF
              </div>
            </div>
          )}
          {buildError && <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '8px' }}>{buildError}</div>}
        </div>
        <div style={grid2}>
          <div>{lbl('Full Name *')}<input {...inp()} placeholder="e.g. Priya Sharma" value={data.name} onChange={e => upd('name', e.target.value)} /></div>
          <div>{lbl('Email *')}<input {...inp()} type="email" placeholder="priya@email.com" value={data.email} onChange={e => upd('email', e.target.value)} /></div>
          <div>{lbl('Phone')}<input {...inp()} placeholder="+91 98765 43210" value={data.phone} onChange={e => upd('phone', e.target.value)} /></div>
          <div>{lbl('Location')}<input {...inp()} placeholder="Mumbai, Maharashtra" value={data.location} onChange={e => upd('location', e.target.value)} /></div>
          <div>{lbl('LinkedIn URL')}<input {...inp()} placeholder="linkedin.com/in/priya" value={data.linkedin} onChange={e => upd('linkedin', e.target.value)} /></div>
          <div>{lbl('GitHub / Portfolio')}<input {...inp()} placeholder="github.com/priya" value={data.github} onChange={e => upd('github', e.target.value)} /></div>
        </div>
        {navBtns(!!data.name.trim() && !!data.email.trim())}
      </div>
    );

    if (step === 1) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>{lbl('Target Job Role / Industry *')}<input {...inp()} placeholder="e.g. Full Stack Developer, Data Scientist" value={data.target} onChange={e => upd('target', e.target.value)} /></div>
        <div>
          {lbl('Professional Summary (AI will enhance this)')}
          <textarea {...inp({ minHeight: '100px', resize: 'vertical' })} placeholder="Brief overview of your experience, strengths, and career goals..." value={data.summary} onChange={e => upd('summary', e.target.value)} />
          <div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>Tip: Even a rough draft works — AI will polish it for your target role</div>
        </div>
        {navBtns(!!data.target.trim())}
      </div>
    );

    if (step === 2) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.experience.map((exp, idx) => (
          <div key={exp.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>{secLbl(`ROLE ${idx + 1}`)}{data.experience.length > 1 && removeBtn(() => removeExp(exp.id))}</div>
            <div style={grid2}>
              <div>{lbl('Job Title *')}<input {...inp()} placeholder="Software Engineer" value={exp.title} onChange={e => updExp(exp.id, 'title', e.target.value)} /></div>
              <div>{lbl('Company')}<input {...inp()} placeholder="Infosys Ltd." value={exp.company} onChange={e => updExp(exp.id, 'company', e.target.value)} /></div>
              <div>{lbl('Start Date')}<input {...inp()} placeholder="Jun 2022" value={exp.startDate} onChange={e => updExp(exp.id, 'startDate', e.target.value)} /></div>
              <div>{lbl(exp.current ? 'End Date (Present)' : 'End Date')}<input {...inp()} placeholder={exp.current ? 'Present' : 'Mar 2024'} value={exp.current ? 'Present' : exp.endDate} disabled={exp.current} onChange={e => updExp(exp.id, 'endDate', e.target.value)} /></div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0 12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={exp.current} onChange={e => updExp(exp.id, 'current', e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
              <span style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>Currently working here</span>
            </label>
            <div>{lbl('Key Responsibilities & Achievements')}
              <textarea {...inp({ minHeight: '90px', resize: 'vertical' })} placeholder={'• Led development of payment module\n• Reduced API latency by 40%'} value={exp.bullets} onChange={e => updExp(exp.id, 'bullets', e.target.value)} />
            </div>
          </div>
        ))}
        {addBtn(addExp, '+ Add Another Role')}
        {navBtns(data.experience.some(e => e.title.trim()))}
      </div>
    );

    if (step === 3) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.education.map((edu, idx) => (
          <div key={edu.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>{secLbl(`DEGREE ${idx + 1}`)}{data.education.length > 1 && removeBtn(() => removeEdu(edu.id))}</div>
            <div style={grid2}>
              <div>{lbl('Degree')}<input {...inp()} placeholder="B.Tech / M.Tech / BCA" value={edu.degree} onChange={e => updEdu(edu.id, 'degree', e.target.value)} /></div>
              <div>{lbl('Field of Study')}<input {...inp()} placeholder="Computer Science & Engineering" value={edu.field} onChange={e => updEdu(edu.id, 'field', e.target.value)} /></div>
              <div>{lbl('Institution')}<input {...inp()} placeholder="IIT Delhi / BITS Pilani" value={edu.institution} onChange={e => updEdu(edu.id, 'institution', e.target.value)} /></div>
              <div>{lbl('Graduation Year')}<input {...inp()} placeholder="2024" value={edu.year} onChange={e => updEdu(edu.id, 'year', e.target.value)} /></div>
              <div style={{ gridColumn: 'span 2' }}>{lbl('CGPA / Percentage (optional)')}<input {...inp()} placeholder="8.5 CGPA / 85%" value={edu.gpa} onChange={e => updEdu(edu.id, 'gpa', e.target.value)} /></div>
            </div>
          </div>
        ))}
        {addBtn(addEdu, '+ Add Another Degree')}
        {navBtns(data.education.some(e => e.degree.trim() || e.institution.trim()))}
      </div>
    );

    if (step === 4) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>{lbl('Technical Skills *')}<textarea {...inp({ minHeight: '80px', resize: 'vertical' })} placeholder="Python, Java, React, Node.js, SQL, Docker..." value={data.techSkills} onChange={e => upd('techSkills', e.target.value)} /><div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>Comma-separated — be specific, these drive ATS keyword matching</div></div>
        <div>{lbl('Tools & Technologies')}<textarea {...inp({ minHeight: '70px', resize: 'vertical' })} placeholder="VS Code, Git, Jira, AWS, Figma..." value={data.tools} onChange={e => upd('tools', e.target.value)} /></div>
        <div>{lbl('Soft Skills (optional)')}<input {...inp()} placeholder="Leadership, Communication, Problem Solving" value={data.softSkills} onChange={e => upd('softSkills', e.target.value)} /></div>
        {navBtns(!!data.techSkills.trim())}
      </div>
    );

    if (step === 5) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {secLbl('PROJECTS — OPTIONAL BUT RECOMMENDED')}
        {data.projects.map((proj, idx) => (
          <div key={proj.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>{secLbl(`PROJECT ${idx + 1}`)}{data.projects.length > 1 && removeBtn(() => removeProj(proj.id))}</div>
            <div style={grid2}>
              <div>{lbl('Project Name')}<input {...inp()} placeholder="E-Commerce Platform" value={proj.name} onChange={e => updProj(proj.id, 'name', e.target.value)} /></div>
              <div>{lbl('Tech Stack')}<input {...inp()} placeholder="React, Node.js, MongoDB" value={proj.tech} onChange={e => updProj(proj.id, 'tech', e.target.value)} /></div>
            </div>
            <div style={{ marginTop: '10px' }}>{lbl('Brief Description')}<textarea {...inp({ minHeight: '70px', resize: 'vertical' })} placeholder="Built a full-stack e-commerce app..." value={proj.description} onChange={e => updProj(proj.id, 'description', e.target.value)} /></div>
          </div>
        ))}
        {addBtn(addProj, '+ Add Another Project')}
        <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {secLbl('EXTRAS — ALL OPTIONAL')}
          <div>{lbl('Certifications')}<textarea {...inp({ minHeight: '70px', resize: 'vertical' })} placeholder={'AWS Certified Developer — Amazon, 2024\nGoogle Data Analytics Certificate, 2023'} value={data.certs} onChange={e => upd('certs', e.target.value)} /></div>
          <div>{lbl('Languages Known')}<input {...inp()} placeholder="English (Fluent), Hindi (Native)" value={data.languages} onChange={e => upd('languages', e.target.value)} /></div>
          <div>{lbl('Achievements / Awards')}<textarea {...inp({ minHeight: '70px', resize: 'vertical' })} placeholder={'National Coding Olympiad Winner 2022'} value={data.achievements} onChange={e => upd('achievements', e.target.value)} /></div>
        </div>
        {navBtns(true)}
      </div>
    );

    if (step === 6) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={cardStyle}>
          {secLbl('◆ REVIEW YOUR INPUTS')}
          {[['Name', data.name || '—'], ['Email', data.email || '—'], ['Target Role', data.target || '—'], ['Experience', `${data.experience.filter(e => e.title.trim()).length} role(s)`], ['Education', `${data.education.filter(e => (e.degree + e.institution).trim()).length} degree(s)`], ['Technical Skills', data.techSkills ? '✓ Added' : '— Not added'], ['Projects', data.projects.filter(p => p.name.trim()).length > 0 ? `${data.projects.filter(p => p.name.trim()).length} project(s)` : '— None']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', fontFamily: "'Space Mono', monospace", fontSize: '0.68rem' }}>{k}</span>
              <span style={{ color: isDark ? '#fff' : '#1a1a1a', fontWeight: 500, fontSize: '0.85rem' }}>{v}</span>
            </div>
          ))}
          <button onClick={() => setStep(0)} style={{ marginTop: '12px', background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, borderRadius: '8px', padding: '6px 14px', color: ac, fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', cursor: 'pointer' }}>← Edit Inputs</button>
        </div>
        <div style={{ background: 'rgba(255,180,0,0.06)', border: '1px solid rgba(255,180,0,0.2)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: isDark ? '#febc2e' : '#b45309', marginBottom: '10px' }}>⚠ BEFORE YOU GENERATE</div>
          {['Your data will be sent to Groq AI to build your resume.','Groq processes data in real-time — not stored permanently.','ZeroAPI does not store, save, or retain any of your personal data.','Resume stays in your browser only — clears when you close the tab.','Always review the generated resume carefully before submitting.'].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ color: ac, fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
              <span style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
          <span style={{ fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', fontWeight: 500 }}>I understand and agree to proceed</span>
        </label>
        {buildError && <div className="error-box">⚠ {buildError}</div>}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setStep(5)} style={{ background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`, borderRadius: '10px', padding: '10px 20px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.85rem', cursor: 'pointer' }}>← Back</button>
          <button onClick={generate} disabled={!agreed || generating} style={{ background: agreed && !generating ? 'linear-gradient(135deg, #a78bfa, #818cf8)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), border: 'none', borderRadius: '10px', padding: '10px 28px', color: agreed && !generating ? '#000' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'), fontWeight: 700, fontSize: '0.85rem', cursor: agreed && !generating ? 'pointer' : 'not-allowed', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', gap: '8px' }}>
            {generating ? <><span className="spinner" style={{ width: '14px', height: '14px' }} />Generating Resume...</> : '✨ Generate My Resume →'}
          </button>
        </div>
      </div>
    );
    return null;
  }

  return (
    <div ref={topRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {progressBar}
      {renderStep()}
    </div>
  );
}
