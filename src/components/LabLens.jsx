// src/components/LabLens.jsx — LabLens v6
// Rules measure → AI explains → code verifies. Works without AI. Any report length. 5 languages.
// Educational explainer — not a medical device, not a diagnosis.

import { useState, useRef, useEffect, useMemo } from 'react';
import { TOOL_MODELS, MODELS } from '../constants';
import { trackEvent } from '../utils';
import { extractDocument, copyTo } from '../resumeCore';
import {
  analyzeLocal, enrichWithAi, translateStrings, collectStrings, applyStrings, detectMeta, ruleQuestions, ruleLifestyle,
  summaryText, fmtVal, fmtRef, SEVERITY_TEXT, guardOf,
} from '../labCore';
import { useTk, Card, Btn, Chip, Label, Field, Notice, Spinner, Notes } from './ResumeShared';

/* ═══════════════════ language config (unchanged content) ═══════════════════ */
const LANG_CONFIG = {
  english: { flag: '🇬🇧', nativeLabel: 'English', targetLang: null,
    uploadHint: 'Upload your lab report — PDF, text, or CSV in any language', analyzeBtn: 'Explain My Report →', step3: 'AI writing plain-language explanations',
    opinionNote: 'These results and suggestions are AI opinions based on standard reference ranges. They are not a substitute for professional medical judgment. Please consult your doctor before making any health decisions.' },
  hindi: { flag: '🇮🇳', nativeLabel: 'हिंदी', targetLang: 'Hindi (Devanagari script)',
    uploadHint: 'अपनी लैब रिपोर्ट अपलोड करें — किसी भी भाषा में PDF, टेक्स्ट या CSV', analyzeBtn: 'मेरी रिपोर्ट समझाएं →', step3: 'AI हिंदी में स्पष्टीकरण तैयार कर रहा है',
    opinionNote: 'ये परिणाम और सुझाव मानक संदर्भ सीमाओं पर आधारित AI की राय हैं। ये पेशेवर चिकित्सीय निर्णय का विकल्प नहीं हैं। कोई भी स्वास्थ्य निर्णय लेने से पहले अपने डॉक्टर से परामर्श करें।' },
  spanish: { flag: '🇪🇸', nativeLabel: 'Español', targetLang: 'Spanish',
    uploadHint: 'Suba su informe — PDF, texto o CSV en cualquier idioma', analyzeBtn: 'Explicar mi informe →', step3: 'IA escribiendo explicaciones en Español',
    opinionNote: 'Estos resultados y sugerencias son opiniones de IA basadas en rangos de referencia estándar. No sustituyen el criterio médico profesional. Consulte a su médico antes de tomar decisiones de salud.' },
  tamil: { flag: '🇮🇳', nativeLabel: 'தமிழ்', targetLang: 'Tamil (Tamil script)',
    uploadHint: 'உங்கள் அறிக்கையை பதிவேற்றவும் — எந்த மொழியிலும் PDF, உரை அல்லது CSV', analyzeBtn: 'என் அறிக்கையை விளக்கு →', step3: 'AI தமிழில் விளக்கங்கள் தயாரிக்கிறது',
    opinionNote: 'இந்த முடிவுகளும் பரிந்துரைகளும் நிலையான குறிப்பு மதிப்புகளின் அடிப்படையிலான AI கருத்துகள். இவை மருத்துவ நிபுணரின் தீர்ப்பிற்கு மாற்றாகாது. எந்த உடல்நல முடிவும் எடுப்பதற்கு முன் உங்கள் மருத்துவரை அணுகவும்.' },
  chinese: { flag: '🇨🇳', nativeLabel: '中文', targetLang: 'Simplified Chinese (Mandarin)',
    uploadHint: '上传您的检验报告 — 支持任何语言的PDF、文本或CSV', analyzeBtn: '解释我的报告 →', step3: 'AI正在用中文撰写说明',
    opinionNote: '这些结果和建议是基于标准参考范围的AI意见，不能替代专业医疗判断。在做出任何健康决定之前，请咨询您的医生。' },
};

const SAMPLE_REPORT = `COMPLETE BLOOD COUNT (CBC) WITH DIFFERENTIAL
Date: June 13, 2026  |  Patient: John Doe  |  Age: 45  |  Sex: Male

TEST                    RESULT        REFERENCE       FLAG
WBC                     11.2 K/uL     [Ref: 4.5-11.0]     HIGH
RBC                     4.1 M/uL      [Ref: 4.50-5.50]    LOW
Hemoglobin              11.8 g/dL     [Ref: 13.5-17.5]    LOW
Hematocrit              35.2 %        [Ref: 41.0-53.0]    LOW
MCV                     72 fL         [Ref: 80-100]        LOW
MCH                     22 pg         [Ref: 27.0-33.0]    LOW
MCHC                    30 g/dL       [Ref: 32.0-36.0]    LOW
RDW                     16.8 %        [Ref: 11.5-14.5]    HIGH
Platelets               420 K/uL      [Ref: 150-400]      HIGH
Neutrophils             78 %          [Ref: 50-70]         HIGH
Lymphocytes             16 %          [Ref: 20-40]         LOW

IRON STUDIES
Serum Iron              38 ug/dL      [Ref: 60-170]        LOW
TIBC                    480 ug/dL     [Ref: 240-450]      HIGH
Ferritin                6 ng/mL       [Ref: 12-300]        LOW
Transferrin Saturation  8 %           [Ref: 20-50]         LOW`;

const MAX_CHARS = 80000;
const URGENT_TEXT = 'One or more values are in a range that usually needs same-day medical attention. Please contact your doctor or visit a hospital today. If you feel unwell — chest pain, severe breathlessness, confusion or fainting — seek emergency care now.';
const GUARD_NOTE = 'Reference ranges and what counts as “normal” are different for children and during pregnancy. We are showing only the ranges printed on your report and no pattern guesses. Please review these results with your pediatrician or obstetrician.';

const escHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function sevColor(tk, v) {
  const s = v.fuzzy.score;
  if (v.fuzzy.urgent) return tk.bad;
  if (s >= 0.6) return '#fb923c';
  if (s >= 0.4) return tk.warn;
  if (s >= 0.2) return '#84cc16';
  if (s >= 0.1) return tk.info;
  return tk.good;
}

function RangeBar({ tk, v }) {
  const { refLo: lo, refHi: hi, cValue: x } = v;
  if (lo == null && hi == null) return null;
  const span = lo != null && hi != null ? hi - lo : Math.abs(lo ?? hi) * 0.5 || 1;
  const min = (lo != null ? lo : hi - span) - span * 0.7;
  const max = (hi != null ? hi : lo + span) + span * 0.7;
  const pos = (n) => Math.max(0, Math.min(100, ((n - min) / (max - min)) * 100));
  const bandL = lo != null ? pos(lo) : 0;
  const bandR = hi != null ? pos(hi) : 100;
  return (
    <div aria-hidden style={{ position: 'relative', height: 8, borderRadius: 99, background: tk.line, margin: '10px 0 4px' }}>
      <div style={{ position: 'absolute', left: `${bandL}%`, width: `${Math.max(2, bandR - bandL)}%`, top: 0, bottom: 0, background: `${tk.good}55`, borderRadius: 99 }} />
      <div style={{ position: 'absolute', left: `calc(${pos(x)}% - 6px)`, top: -3, width: 12, height: 14, borderRadius: 4, background: sevColor(tk, v), border: `2px solid ${tk.d ? '#111' : '#fff'}` }} />
    </div>
  );
}

function ValueCard({ tk, v, open, onToggle, font }) {
  const col = sevColor(tk, v);
  const reported = v.unit && (v.cUnit !== v.unit || String(v.cValue) !== String(v.value)) ? `${v.qual || ''}${v.value} ${v.unit}` : '';
  const abnormal = v.fuzzy.score >= 0.1;
  return (
    <div style={{ border: `1px solid ${tk.line}`, borderLeft: `3px solid ${col}`, borderRadius: 12, padding: '12px 14px', background: tk.card }}>
      <button type="button" onClick={onToggle} aria-expanded={open} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: tk.sans, fontWeight: 700, color: tk.text, fontSize: '0.95rem' }}>{v.label}</span>
          <span style={{ fontFamily: tk.mono, color: col, fontSize: '0.95rem', fontWeight: 700 }}>{fmtVal(v)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          <Chip tk={tk} color={col}>{v.fuzzy.direction === 'normal' ? '✓ ' : v.fuzzy.direction === 'low' ? '↓ ' : v.fuzzy.direction === 'high' ? '↑ ' : ''}{SEVERITY_TEXT[v.fuzzy.label] || 'Noted'}</Chip>
          <span style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute }}>{fmtRef(v) ? `reference ${fmtRef(v)}` : 'no reference range'}</span>
        </div>
        <RangeBar tk={tk} v={v} />
      </button>
      {open && (
        <div style={{ display: 'grid', gap: 8, marginTop: 8, fontFamily: font, fontSize: '0.86rem', lineHeight: 1.65, color: tk.sub }}>
          {v.meaning && <div><b style={{ color: tk.text }}>What it is. </b>{v.meaning}</div>}
          {(abnormal || v.significance) && <div><b style={{ color: tk.text }}>{abnormal ? 'What it may mean. ' : 'Result. '}</b>{v.significance}</div>}
          {v.care_note && <div style={{ background: tk.acSoft, border: `1px solid ${tk.acLine}`, borderRadius: 10, padding: '8px 10px', color: tk.text }}>{v.care_note}</div>}
          <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute }}>
            {reported && <div>As printed on your report: {reported}</div>}
            {v.note && <div>{v.note}</div>}
            {v.assumption && <div>{v.assumption}</div>}
            {v.refNote && <div>{v.refNote}</div>}
            {v.refSource === 'built-in' && <div>No range was printed on your report, so a standard adult range was used. Labs differ slightly; trust your report’s own range.</div>}
            {v.textSource === 'ai' ? <div>Explanation written by AI and checked against your numbers.</div> : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LabLens() {
  const tk = useTk();
  const fileRef = useRef(null);
  const topRef = useRef(null);

  const [language, setLanguage] = useState('english');
  const [report, setReport] = useState('');
  const [fileName, setFileName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [pregnant, setPregnant] = useState(false);
  const [autoNote, setAutoNote] = useState('');
  const [extracting, setExtracting] = useState(false);

  const [stage, setStage] = useState('idle'); // idle | working | done
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState('');
  const [local, setLocal] = useState(null);
  const [en, setEn] = useState(null);       // English result
  const [tr, setTr] = useState(null);       // translated result
  const [trNote, setTrNote] = useState('');
  const [showEnglish, setShowEnglish] = useState(false);
  const [tab, setTab] = useState('summary');
  const [openIds, setOpenIds] = useState({});
  const [copied, setCopied] = useState('');
  const [patientUsed, setPatientUsed] = useState({});
  const [showUnread, setShowUnread] = useState(false);

  const lang = LANG_CONFIG[language] || LANG_CONFIG.english;
  const font = ['hindi', 'tamil', 'chinese'].includes(language) ? "'Noto Sans','Noto Sans SC','Mangal',system-ui,sans-serif" : tk.sans;

  const step = (id, label, status = 'active') => setSteps((p) => (p.some((s) => s.id === id) ? p.map((s) => (s.id === id ? { ...s, label, status } : s)) : [...p, { id, label, status }]));

  // pick up age / sex from the report text when the user hasn't typed them
  useEffect(() => {
    if (!report) return;
    const m = detectMeta(report);
    const bits = [];
    if (!age && m.age != null && m.age > 0) { setAge(String(m.age)); bits.push(`age ${m.age}`); }
    if (!sex && m.sex) { setSex(m.sex); bits.push(m.sex); }
    if (bits.length) setAutoNote(`Picked up from your report: ${bits.join(', ')}. Please correct if wrong.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  const handleInput = (val) => {
    if (val.length > MAX_CHARS) { setError(`That is longer than ${MAX_CHARS.toLocaleString()} characters. Please paste the report in parts.`); return; }
    setReport(val); setError('');
  };
  const loadSample = () => { setReport(SAMPLE_REPORT); setAge('45'); setSex('male'); setFileName('sample'); setError(''); reset(false); };

  const reset = (clearInputs = true) => {
    setStage('idle'); setSteps([]); setLocal(null); setEn(null); setTr(null); setTrNote(''); setShowEnglish(false); setTab('summary'); setOpenIds({});
    if (clearInputs) { setReport(''); setFileName(''); setAge(''); setSex(''); setPregnant(false); setAutoNote(''); }
    if (fileRef.current) fileRef.current.value = '';
  };

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(''); setExtracting(true); setFileName(file.name);
    try {
      const n = file.name.toLowerCase();
      if (/\.(png|jpe?g|webp|heic|gif|bmp)$/.test(n) || file.type.startsWith('image/')) {
        throw new Error('Photos of paper reports can’t be read yet. Please upload the PDF from your lab (most labs email or SMS one), or paste the values as text.');
      }
      let text;
      if (n.endsWith('.csv')) {
        text = (await file.text()).split(/\r?\n/).map((l) => l.split(',').map((c) => c.replace(/^"|"$/g, '').trim()).join('   ')).join('\n');
      } else {
        text = (await extractDocument(file)).text;
      }
      if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS);
      setReport(text); reset(false);
    } catch (err) {
      setError(err?.message || 'Could not read that file. Try pasting the text instead.');
      setFileName('');
    } finally { setExtracting(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function analyze() {
    const text = report.trim();
    if (text.length < 30) { setError('Please add your lab report first — upload a file or paste the text.'); return; }
    setError(''); setStage('working'); setSteps([]); setLocal(null); setEn(null); setTr(null); setTrNote(''); setShowEnglish(false); setTab('summary'); setOpenIds({});
    trackEvent('tool_run', { tool_name: 'LabLens' });
    const patient = { age: age !== '' && Number.isFinite(Number(age)) ? Math.max(0, Math.min(120, Number(age))) : null, sex: sex || null, pregnant: sex === 'female' && pregnant };
    setPatientUsed(patient);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);

    let shown = false;
    try {
      step('read', 'Reading and measuring your values');
      const loc = await analyzeLocal({ text, patient, model: TOOL_MODELS.labLens, onNote: (m) => step('read', m) });
      if (!loc.values.length) {
        setStage('idle'); setSteps([]);
        setError('We couldn’t find any test results in that text. Make sure the report includes test names with their values (for example “Hemoglobin 11.8 g/dL”). Reports that are photos or scans can’t be read yet.');
        return;
      }
      step('read', `Read ${loc.values.length} values${loc.usedAiExtraction ? ' (AI-assisted)' : ''} · ${loc.values.filter((v) => v.fuzzy.score >= 0.2).length} outside range`, 'done');
      setLocal(loc);

      // show rule-based results immediately
      const notices = [];
      const baseResult = {
        values: loc.values, patterns: loc.patterns, status: loc.status,
        headline: loc.status === 'urgent' ? 'Some values need prompt medical attention' : loc.patterns[0] ? `${loc.patterns[0].name} — worth discussing with your doctor` : `${loc.values.filter((v) => v.fuzzy.score >= 0.2).length} value(s) outside the normal range`,
        summary: `${loc.values.length} values were read from your report. Plain-language explanations are being written…`,
        questions: ruleQuestions(loc.values, loc.patterns), lifestyle: ruleLifestyle(loc.patterns), aiStatus: 'pending', aiNote: '',
        urgentAlert: loc.status === 'urgent' ? URGENT_TEXT : '', notices,
      };
      if (loc.guard) notices.push(GUARD_NOTE);
      setEn(baseResult); setStage('done'); shown = true;

      step('ai', 'Writing plain-language explanations');
      const enriched = await enrichWithAi({
        local: loc, patient, sourceText: text, model: TOOL_MODELS.labLens,
        onProgress: (i, n) => step('ai', `Writing explanations (${i}/${n})`),
      });
      const final = { ...baseResult, ...enriched, status: loc.status, urgentAlert: baseResult.urgentAlert, notices: [...notices] };
      setEn(final);
      step('ai', enriched.aiStatus === 'full' ? 'Explanations ready and checked' : enriched.aiStatus === 'partial' ? 'Some explanations are rule-based' : 'AI unavailable — rule-based explanations shown', enriched.aiStatus === 'none' ? 'fail' : 'done');

      if (lang.targetLang) {
        step('trans', `Translating to ${lang.nativeLabel}`);
        try {
          const items = collectStrings(final);
          const out = await translateStrings({
            strings: items.map((i) => i.text), targetLang: lang.targetLang, model: MODELS.MEDIUM,
            onProgress: (i, n) => step('trans', `Translating to ${lang.nativeLabel}… (${i}/${n})`),
          });
          setTr(applyStrings(final, items, out.strings));
          setTrNote(out.failed ? `${out.failed} of ${out.total} sentences stayed in English because the translation didn’t keep the numbers exactly.` : '');
          step('trans', `Translated to ${lang.nativeLabel}`, 'done');
        } catch (e) {
          step('trans', 'Translation unavailable — showing English', 'fail');
          setTrNote(e?.message || 'Translation failed, so the English version is shown.');
        }
      }
    } catch (e) {
      setSteps((p) => p.map((s) => (s.status === 'active' ? { ...s, status: 'fail' } : s)));
      if (!shown) { setStage('idle'); setError(e?.message || 'Something went wrong. Please try again.'); }
    }
  }

  const view = (!showEnglish && tr) ? tr : en;
  const values = view?.values || [];
  const flagged = useMemo(() => values.filter((v) => v.fuzzy.score >= 0.1).sort((a, b) => b.fuzzy.score - a.fuzzy.score), [values]);
  const status = en?.status || 'normal';
  const badge = status === 'urgent' ? { c: tk.bad, i: '🚨', l: 'Urgent — please contact a doctor today' } : status === 'attention_needed' ? { c: tk.warn, i: '⚠', l: 'Some values need attention' } : { c: tk.good, i: '✓', l: 'All values look within the expected range' };
  const toggle = (idx) => setOpenIds((o) => ({ ...o, [idx]: !o[idx] }));
  const flash = (k) => { setCopied(k); setTimeout(() => setCopied(''), 1800); };

  const printSheet = () => {
    if (!view) return;
    const rows = flagged.map((v) => `<tr><td>${escHtml(v.label)}</td><td><b>${escHtml(fmtVal(v))}</b></td><td>${escHtml(fmtRef(v) || '—')}</td><td>${escHtml(SEVERITY_TEXT[v.fuzzy.label] || '')}</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Lab report summary</title><style>
@page{size:A4;margin:16mm}body{font-family:'Noto Sans','Helvetica Neue',Arial,sans-serif;color:#111;font-size:11pt;line-height:1.5}
h1{font-size:17pt;margin:0 0 2mm}h2{font-size:12pt;margin:6mm 0 2mm;border-bottom:1px solid #999;padding-bottom:1mm}
table{width:100%;border-collapse:collapse;font-size:10pt}td,th{border-bottom:1px solid #ddd;padding:2mm 1.5mm;text-align:left}th{background:#f3f3f3}
.n{font-size:9pt;color:#555;margin-top:6mm}li{margin-bottom:1mm}</style></head><body>
<h1>Lab report summary</h1><div style="color:#555;font-size:10pt">Prepared ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · ${patientUsed.age != null ? `${patientUsed.age} years` : ''} ${escHtml(patientUsed.sex || '')}</div>
<h2>Overview</h2><p><b>${escHtml(view.headline)}</b></p><p>${escHtml(view.summary)}</p>
${rows ? `<h2>Values outside the reference range</h2><table><tr><th>Test</th><th>Result</th><th>Reference</th><th>Status</th></tr>${rows}</table>` : ''}
${view.patterns.length ? `<h2>Patterns to discuss</h2><ul>${view.patterns.map((p) => `<li>${escHtml(p.name)}</li>`).join('')}</ul>` : ''}
${view.questions.length ? `<h2>Questions for the doctor</h2><ul>${view.questions.map((q) => `<li>${escHtml(q)}</li>`).join('')}</ul>` : ''}
<p class="n">${escHtml(lang.opinionNote)} Explained by ZeroAPI LabLens (zeroapi.in) — not a diagnosis.</p></body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
    document.body.appendChild(iframe);
    const d = iframe.contentWindow.document; d.open(); d.write(html); d.close();
    setTimeout(() => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch { /* cancelled */ } setTimeout(() => iframe.remove(), 60000); }, 350);
  };
  const copySummary = async () => { if (await copyTo(summaryText(en, patientUsed))) flash('copy'); };
  const whatsapp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(summaryText(en, patientUsed).slice(0, 1800))}`, '_blank', 'noopener'); };

  const working = stage === 'working';
  const isMinor = age !== '' && Number(age) < 18;

  /* ═════════════ render ═════════════ */
  return (
    <div ref={topRef} style={{ display: 'grid', gap: 16, fontFamily: font, scrollMarginTop: 80 }}>
      {/* language */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Language">
        {Object.entries(LANG_CONFIG).map(([k, c]) => (
          <button key={k} type="button" onClick={() => setLanguage(k)} aria-pressed={language === k} disabled={working} style={{
            padding: '8px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: tk.sans, fontSize: '0.84rem', color: language === k ? tk.ac : tk.sub,
            background: language === k ? tk.acSoft : 'transparent', border: `1px solid ${language === k ? tk.ac : tk.line}`,
          }}>{c.flag} {c.nativeLabel}</button>
        ))}
      </div>

      {/* input */}
      {stage === 'idle' && (
        <Card tk={tk} style={{ display: 'grid', gap: 14 }}>
          <div style={{ fontFamily: font, fontSize: '0.9rem', color: tk.sub, lineHeight: 1.6 }}>{lang.uploadHint}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv" style={{ display: 'none' }} onChange={handleFile} />
            <Btn tk={tk} kind="ghost" onClick={() => fileRef.current?.click()} disabled={extracting}>{extracting ? <><Spinner /> Reading…</> : '📄 Upload report'}</Btn>
            <Btn tk={tk} kind="plain" onClick={loadSample}>Try a sample</Btn>
            {report && <Btn tk={tk} kind="plain" onClick={() => reset(true)}>Clear</Btn>}
          </div>
          {fileName && <div style={{ fontFamily: tk.sans, fontSize: '0.78rem', color: tk.mute, wordBreak: 'break-word' }}>📎 {fileName}</div>}

          <Field tk={tk} multiline rows={9} value={report} onChange={handleInput} placeholder={'…or paste your report here, e.g.\nHemoglobin   11.8   g/dL   13.0 - 17.0\nTSH   6.2   µIU/mL   0.4 - 4.5'} />
          <div style={{ fontFamily: tk.mono, fontSize: '0.66rem', color: tk.mute, marginTop: -8 }}>{report.length.toLocaleString()} characters · no length limit that matters: long checkup reports are handled in full</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
            <Field tk={tk} label="Age" type="number" value={age} onChange={(v) => { setAge(v); setAutoNote(''); }} placeholder="e.g. 45" />
            <label style={{ display: 'block' }}>
              <div style={{ fontFamily: tk.mono, fontSize: '0.64rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tk.mute, marginBottom: 5 }}>Sex</div>
              <select value={sex} onChange={(e) => { setSex(e.target.value); setAutoNote(''); }} style={{ width: '100%', background: tk.input, border: `1px solid ${tk.inputLine}`, borderRadius: 10, padding: '11px 12px', color: tk.text, fontSize: '16px', fontFamily: tk.sans }}>
                <option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option>
              </select>
            </label>
          </div>
          {sex === 'female' && <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: tk.sans, fontSize: '0.84rem', color: tk.sub, cursor: 'pointer' }}><input type="checkbox" checked={pregnant} onChange={(e) => setPregnant(e.target.checked)} /> I am currently pregnant</label>}
          {autoNote && <div style={{ fontFamily: tk.sans, fontSize: '0.76rem', color: tk.info }}>{autoNote}</div>}
          {(isMinor || pregnant) && <Notice tk={tk} kind="info">{GUARD_NOTE}</Notice>}

          {error && <Notice tk={tk} kind="bad">{error}</Notice>}
          <Btn tk={tk} onClick={analyze} disabled={extracting || report.trim().length < 30} full>{lang.analyzeBtn}</Btn>
          <div style={{ fontFamily: tk.sans, fontSize: '0.76rem', color: tk.mute, lineHeight: 1.55 }}>
            🔒 Values are measured in your browser. Only test names, numbers and your age/sex go to our AI provider to write explanations — your name, phone and ID never do. ZeroAPI doesn’t store your report or results.
          </div>
        </Card>
      )}

      {/* progress */}
      {steps.length > 0 && stage !== 'idle' && (
        <Card tk={tk} pad={12} style={{ display: 'grid', gap: 6 }}>
          {steps.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: tk.sans, fontSize: '0.82rem', color: s.status === 'fail' ? tk.warn : s.status === 'done' ? tk.good : tk.sub }}>
              {s.status === 'active' ? <Spinner size={13} /> : <span style={{ width: 13, textAlign: 'center' }}>{s.status === 'done' ? '✓' : '!'}</span>}
              <span>{s.label}</span>
            </div>
          ))}
        </Card>
      )}

      {/* results */}
      {stage === 'done' && en && view && (
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: `1px solid ${badge.c}66`, background: `${badge.c}14` }}>
            <span style={{ fontSize: '1.3rem' }} aria-hidden>{badge.i}</span>
            <span style={{ fontFamily: tk.sans, fontWeight: 700, color: badge.c }}>{badge.l}</span>
          </div>

          {en.urgentAlert && <Notice tk={tk} kind="bad" title="Please act on this today">{view.urgentAlert || en.urgentAlert}</Notice>}
          {(view.notices || []).map((n, i) => <Notice key={i} tk={tk} kind="info">{n}</Notice>)}
          {values.some((v) => v.unitUnknown) && <Notice tk={tk} kind="warn">{values.filter((v) => v.unitUnknown).length} value(s) have units we don’t recognise, so built-in thresholds were skipped for them. Their severity comes only from your report’s own range.</Notice>}
          {en.aiStatus === 'pending' && <Notice tk={tk} kind="info"><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Spinner size={13} /> Your measured results are ready below. Plain-language explanations are still being written…</span></Notice>}
          {(en.aiStatus === 'none' || en.aiStatus === 'partial') && en.aiNote && <Notice tk={tk} kind="warn">{en.aiNote} Rule-based explanations are shown instead — the numbers and severity are unaffected.</Notice>}
          {tr && trNote && <Notice tk={tk} kind="info">{trNote}</Notice>}
          {tr && <div><Btn tk={tk} kind="plain" small onClick={() => setShowEnglish(!showEnglish)}>{showEnglish ? `Show in ${lang.nativeLabel}` : 'Show in English'}</Btn></div>}

          {/* tabs */}
          <div role="tablist" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {[['summary', 'Summary'], ['values', `Values (${values.length})`], ['flagged', `Flagged (${flagged.length})`], ['patterns', `Patterns (${view.patterns.length})`], ['questions', 'Questions']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)} style={{
                flex: '1 0 auto', padding: '10px 12px', cursor: 'pointer', fontFamily: tk.mono, fontSize: '0.72rem', borderRadius: 10, whiteSpace: 'nowrap',
                background: tab === k ? tk.acSoft : 'transparent', color: tab === k ? tk.ac : tk.sub, border: `1px solid ${tab === k ? tk.ac : tk.line}`,
              }}>{l}</button>
            ))}
          </div>

          {tab === 'summary' && (
            <Card tk={tk} style={{ display: 'grid', gap: 14 }}>
              <div style={{ fontFamily: font, fontWeight: 700, fontSize: '1.05rem', color: tk.text, lineHeight: 1.45 }}>{view.headline}</div>
              <div style={{ fontFamily: font, fontSize: '0.92rem', color: tk.sub, lineHeight: 1.75 }}>{view.summary}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Chip tk={tk} color={tk.info}>{values.length} values read</Chip>
                <Chip tk={tk} color={tk.good}>{values.length - flagged.length} in range</Chip>
                {flagged.length > 0 && <Chip tk={tk} color={tk.warn}>{flagged.length} flagged</Chip>}
                {view.patterns.length > 0 && <Chip tk={tk} color={tk.ac}>{view.patterns.length} pattern{view.patterns.length > 1 ? 's' : ''}</Chip>}
              </div>
              {flagged.slice(0, 4).length > 0 && (
                <div style={{ display: 'grid', gap: 8 }}>
                  <Label tk={tk}>Biggest differences</Label>
                  {flagged.slice(0, 4).map((v) => <ValueCard key={v.idx} tk={tk} v={v} open={!!openIds[v.idx]} onToggle={() => toggle(v.idx)} font={font} />)}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
                <Btn tk={tk} onClick={printSheet}>🖨 Doctor-ready summary</Btn>
                <Btn tk={tk} kind="ghost" onClick={whatsapp}>💬 Share on WhatsApp</Btn>
                <Btn tk={tk} kind="plain" onClick={copySummary}>{copied === 'copy' ? '✓ Copied' : '⧉ Copy summary'}</Btn>
              </div>
              <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute }}>The doctor-ready summary opens your browser’s print dialog — choose “Save as PDF”. It supports every language. WhatsApp shares an English text summary only when you tap it.</div>
            </Card>
          )}

          {tab === 'values' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {values.map((v) => <ValueCard key={v.idx} tk={tk} v={v} open={!!openIds[v.idx]} onToggle={() => toggle(v.idx)} font={font} />)}
              {local && (
                <Card tk={tk} pad={12} style={{ display: 'grid', gap: 8 }}>
                  <div style={{ fontFamily: tk.sans, fontSize: '0.8rem', color: tk.sub, lineHeight: 1.55 }}>
                    We read <b>{values.length}</b> values from your report.{local.unread.length ? ` ${local.unread.length} line(s) with numbers couldn’t be read as test results.` : ' Every numeric line was read.'}
                  </div>
                  {local.qualitative.length > 0 && (
                    <div style={{ fontFamily: tk.sans, fontSize: '0.8rem', color: tk.sub }}>
                      <b style={{ color: tk.text }}>Text results (not scored): </b>{local.qualitative.map((q) => `${q.name}: ${q.text}`).join(' · ')}
                    </div>
                  )}
                  {local.unread.length > 0 && (
                    <>
                      <button type="button" onClick={() => setShowUnread(!showUnread)} style={{ all: 'unset', cursor: 'pointer', color: tk.ac, fontFamily: tk.mono, fontSize: '0.72rem' }}>{showUnread ? '− Hide' : '+ Show'} lines we couldn’t read</button>
                      {showUnread && <ul style={{ margin: 0, paddingLeft: 18, fontFamily: tk.mono, fontSize: '0.68rem', color: tk.mute, lineHeight: 1.6, wordBreak: 'break-word' }}>{local.unread.map((u, i) => <li key={i}>{u}</li>)}</ul>}
                    </>
                  )}
                </Card>
              )}
            </div>
          )}

          {tab === 'flagged' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {flagged.length === 0 && <Notice tk={tk} kind="good">Nothing outside the reference range was found in the values we could read.</Notice>}
              {flagged.map((v) => <ValueCard key={v.idx} tk={tk} v={v} open={openIds[v.idx] !== false} onToggle={() => setOpenIds((o) => ({ ...o, [v.idx]: o[v.idx] === false }))} font={font} />)}
            </div>
          )}

          {tab === 'patterns' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {view.patterns.length === 0 && <Notice tk={tk} kind="info">{guardOf(patientUsed) ? 'Pattern matching is switched off for children and during pregnancy.' : 'No multi-test patterns stood out. That does not rule anything out — individual flagged values may still matter.'}</Notice>}
              {view.patterns.map((p, i) => (
                <Card key={i} tk={tk} style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontFamily: tk.sans, fontWeight: 700, color: tk.text }}>{p.name}</span>
                    <Chip tk={tk} color={p.urgency === 'soon' ? tk.warn : tk.info}>{p.urgency === 'soon' ? 'see a doctor soon' : 'routine follow-up'}</Chip>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: tk.line, overflow: 'hidden' }} aria-label={`Match strength ${Math.round(p.confidence * 100)}%`}><div style={{ height: '100%', width: `${Math.round(p.confidence * 100)}%`, background: tk.grad }} /></div>
                  <div style={{ fontFamily: font, fontSize: '0.88rem', color: tk.sub, lineHeight: 1.7 }}>{p.plain || p.clinical_note}</div>
                  <div style={{ fontFamily: font, fontSize: '0.84rem', color: tk.sub, lineHeight: 1.65 }}><b style={{ color: tk.text }}>Next step. </b>{p.follow || 'Your doctor may suggest confirming tests and will weigh them with your symptoms and history.'}</div>
                  {p.based_on?.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.based_on.map((b) => <Chip key={b} tk={tk}>{b}</Chip>)}</div>}
                </Card>
              ))}
              <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute }}>Patterns are hints from combining results. They are not diagnoses.</div>
            </div>
          )}

          {tab === 'questions' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <Card tk={tk} style={{ display: 'grid', gap: 10 }}>
                <Label tk={tk}>Questions to ask your doctor</Label>
                {view.questions.map((q, i) => <div key={i} style={{ fontFamily: font, fontSize: '0.9rem', color: tk.sub, lineHeight: 1.65, borderLeft: `3px solid ${tk.acLine}`, paddingLeft: 12 }}>{q}</div>)}
              </Card>
              {view.lifestyle.length > 0 && (
                <Card tk={tk} style={{ display: 'grid', gap: 10 }}>
                  <Label tk={tk}>General habits that may help</Label>
                  {view.lifestyle.map((q, i) => <div key={i} style={{ fontFamily: font, fontSize: '0.9rem', color: tk.sub, lineHeight: 1.65 }}>• {q}</div>)}
                  <div style={{ fontFamily: tk.sans, fontSize: '0.74rem', color: tk.mute }}>General wellness ideas only — not treatment. Don’t start or stop any medicine or supplement without your doctor.</div>
                </Card>
              )}
            </div>
          )}

          <Notice tk={tk} kind="warn" style={{ fontFamily: font }}>{lang.opinionNote}</Notice>
          <div><Btn tk={tk} kind="plain" small onClick={() => reset(true)}>↺ Analyze another report</Btn></div>
        </div>
      )}

      {/* what makes it different */}
      {stage === 'idle' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
          {[
            ['📊', 'Reads real lab PDFs', 'Handles lakhs/cumm, mmol/L, one-sided ranges and report flags — converted before anything is judged.'],
            ['⚖️', 'Calibrated severity', 'A 7-level scale. “Urgent” is reserved for values that genuinely need same-day care, like very high potassium.'],
            ['🧩', 'Pattern hints', 'Combines related results (iron, sugar, thyroid, liver, kidney, lipids, vitamins) into hedged, non-diagnostic patterns.'],
            ['🛡', 'AI that is checked', 'Explanations containing numbers that aren’t in your report are thrown out and replaced with rule-based text.'],
            ['👶', 'Careful with children & pregnancy', 'Only your report’s own ranges are used, with no pattern guesses.'],
            ['🌐', '5 languages', 'English, हिंदी, Español, தமிழ், 中文 — with numbers kept exactly.'],
          ].map(([i, t, d]) => (
            <Card key={t} tk={tk} pad={14}>
              <div style={{ fontSize: '1.3rem' }} aria-hidden>{i}</div>
              <div style={{ fontFamily: tk.sans, fontWeight: 700, color: tk.text, marginTop: 4, fontSize: '0.9rem' }}>{t}</div>
              <div style={{ fontFamily: tk.sans, fontSize: '0.78rem', color: tk.mute, marginTop: 3, lineHeight: 1.5 }}>{d}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
