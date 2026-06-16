// src/components/LabLens.jsx
// LabLens v4 — two-step: JSON always in English, then translate display text
// Fixes: Hindi JSON crash, multilanguage file upload, font rendering, alignment

import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, TOOL_MODELS, MODELS } from '../constants';
import { fetchWithBackoff } from '../utils';

// ═══════════════════════════════════════════════════════════════
// FUZZY LOGIC ENGINE
// ═══════════════════════════════════════════════════════════════
const CLINICAL_THRESHOLDS = {
  hemoglobin:  { criticalLow: 7.0,  severeLow: 9.0,   moderateLow: 11.0 },
  hgb:         { criticalLow: 7.0,  severeLow: 9.0,   moderateLow: 11.0 },
  ferritin:    { criticalLow: 5.0,  severeLow: 10.0,  moderateLow: 20.0 },
  glucose:     { criticalLow: 50,   criticalHigh: 400, severeHigh: 300   },
  potassium:   { criticalLow: 2.5,  criticalHigh: 6.5 },
  sodium:      { criticalLow: 120,  criticalHigh: 155 },
  platelets:   { criticalLow: 50,   severeLow: 100 },
  wbc:         { criticalLow: 1.0,  criticalHigh: 30.0 },
  creatinine:  { criticalHigh: 10.0, severeHigh: 5.0 },
  tsh:         { criticalLow: 0.01, criticalHigh: 10.0 },
};

function fuzzyScore(value, refLow, refHigh, paramName = '') {
  const name     = paramName.toLowerCase();
  const override = Object.keys(CLINICAL_THRESHOLDS).find(k => name.includes(k));
  if (override) {
    const t = CLINICAL_THRESHOLDS[override];
    if (value < refLow) {
      if (t.criticalLow !== undefined && value <= t.criticalLow)  return { score: 1.00, label: 'critically_low',  direction: 'low',  clinical: true };
      if (t.severeLow   !== undefined && value <= t.severeLow)    return { score: 0.80, label: 'severely_low',    direction: 'low',  clinical: true };
      if (t.moderateLow !== undefined && value <= t.moderateLow)  return { score: 0.55, label: 'moderately_low',  direction: 'low',  clinical: true };
    }
    if (value > refHigh) {
      if (t.criticalHigh !== undefined && value >= t.criticalHigh) return { score: 1.00, label: 'critically_high', direction: 'high', clinical: true };
      if (t.severeHigh   !== undefined && value >= t.severeHigh)   return { score: 0.80, label: 'severely_high',   direction: 'high', clinical: true };
    }
  }
  if (value >= refLow && value <= refHigh) return { score: 0, label: 'within_range', direction: 'normal' };
  const range = refHigh - refLow || 1;
  if (value < refLow) {
    const dev = (refLow - value) / range;
    if (dev < 0.05) return { score: +(dev/0.05*0.2).toFixed(3),                  label:'borderline_low',  direction:'low' };
    if (dev < 0.15) return { score: +(0.2+(dev-0.05)/0.10*0.2).toFixed(3),       label:'mildly_low',      direction:'low' };
    if (dev < 0.30) return { score: +(0.4+(dev-0.15)/0.15*0.2).toFixed(3),       label:'moderately_low',  direction:'low' };
    if (dev < 0.50) return { score: +(0.6+(dev-0.30)/0.20*0.2).toFixed(3),       label:'severely_low',    direction:'low' };
                    return { score: +Math.min(1,0.8+(dev-0.50)/0.50*0.2).toFixed(3), label:'critically_low',  direction:'low' };
  }
  const dev = (value - refHigh) / range;
  if (dev < 0.05) return { score: +(dev/0.05*0.2).toFixed(3),                    label:'borderline_high', direction:'high' };
  if (dev < 0.15) return { score: +(0.2+(dev-0.05)/0.10*0.2).toFixed(3),         label:'mildly_high',     direction:'high' };
  if (dev < 0.30) return { score: +(0.4+(dev-0.15)/0.15*0.2).toFixed(3),         label:'moderately_high', direction:'high' };
  if (dev < 0.50) return { score: +(0.6+(dev-0.30)/0.20*0.2).toFixed(3),         label:'severely_high',   direction:'high' };
                  return { score: +Math.min(1,0.8+(dev-0.50)/0.50*0.2).toFixed(3), label:'critically_high', direction:'high' };
}

function fuzzyAnd(...scores) { return Math.min(...scores.filter(s => s > 0)); }

function detectSyndromes(parsedValues) {
  const find  = (names) => { for (const n of names) { const h = parsedValues.find(v => v.name.toLowerCase().includes(n)); if (h) return h; } return null; };
  const score = (names, dir) => { const f = find(names); return (!f || f.fuzzy.direction !== dir) ? 0 : f.fuzzy.score; };
  const syndromes = [];
  const ironConf = fuzzyAnd(score(['ferritin'],'low'), score(['hemoglobin','hgb'],'low') || score(['mcv'],'low'));
  if (ironConf > 0.25) syndromes.push({ name:'Iron Deficiency Pattern', confidence: Math.min(1, ironConf+score(['tibc'],'high')*0.3), urgency: ironConf>0.7?'high':'medium' });
  const infConf = fuzzyAnd(score(['wbc'],'high'), score(['neutrophil'],'high'));
  if (infConf > 0.2) syndromes.push({ name:'Infection / Inflammation Pattern', confidence: infConf, urgency: infConf>0.7?'high':'medium' });
  const microConf = fuzzyAnd(score(['mcv'],'low'), score(['mch','mchc'],'low'));
  if (microConf > 0.3 && ironConf < 0.25) syndromes.push({ name:'Microcytic Anemia Pattern', confidence: microConf, urgency: microConf>0.6?'high':'medium' });
  const glucoseConf = Math.max(score(['glucose','blood sugar'],'high'), score(['hba1c','a1c','glycated'],'high'));
  if (glucoseConf > 0.2) syndromes.push({ name:'Elevated Blood Sugar Pattern', confidence: glucoseConf, urgency: glucoseConf>0.7?'high':'medium' });
  const tshLow=score(['tsh'],'low'), tshHigh=score(['tsh'],'high');
  if (tshLow > 0.3)  syndromes.push({ name:'Low TSH — Possible Hyperthyroidism', confidence: tshLow,  urgency: tshLow>0.7?'high':'medium' });
  if (tshHigh > 0.3) syndromes.push({ name:'High TSH — Possible Hypothyroidism', confidence: tshHigh, urgency: tshHigh>0.7?'high':'medium' });
  return syndromes.sort((a,b) => b.confidence - a.confidence);
}

function parseLabText(text) {
  const results = [], lines = text.split('\n');
  const patterns = [
    /([A-Za-z][A-Za-z0-9\s/(),%]+?)\s*[:\t]\s*([\d.]+)\s*([a-zA-Z%/µμ³⁶⁰³\s]*?)\s*[\[(](?:[Rr]ef[:\s]*)?(\d+\.?\d*)\s*[-–to]\s*(\d+\.?\d*)[\])]/,
    /([A-Za-z][A-Za-z0-9\s/(),%]{2,30}?)\s{2,}([\d.]+)\s+([a-zA-Z%/µμK³⁶⁰\s]*?)\s{2,}(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/,
    /([A-Za-z][A-Za-z0-9\s/(),%]+?)\s+([\d.]+)\s+([a-zA-Z%/µμK³⁶\s]*?)\s+[Rr]ef[:\s]+(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/,
  ];
  for (const line of lines) {
    if (line.trim().length < 5) continue;
    for (const pattern of patterns) {
      const m = line.match(pattern);
      if (m) {
        const name=m[1].trim().replace(/\s+/g,' '), value=parseFloat(m[2]), refLow=parseFloat(m[4]), refHigh=parseFloat(m[5]);
        if (!isNaN(value)&&!isNaN(refLow)&&!isNaN(refHigh)&&name.length>1)
          results.push({ name, value, unit:m[3]?.trim()||'', refLow, refHigh, fuzzy:fuzzyScore(value,refLow,refHigh,name) });
        break;
      }
    }
  }
  return results;
}

function computeOverallSeverity(parsedValues, syndromes) {
  if (parsedValues.length===0) return 'unknown';
  if (parsedValues.some(v=>v.fuzzy.label.includes('critical'))||(parsedValues.some(v=>v.fuzzy.label.includes('severe'))&&syndromes.some(s=>s.urgency==='high'))) return 'urgent';
  if (parsedValues.some(v=>v.fuzzy.score>0.3)||syndromes.length>0) return 'attention_needed';
  return 'normal';
}

// ═══════════════════════════════════════════════════════════════
// SAFE JSON PARSER
// ═══════════════════════════════════════════════════════════════
function safeParseJSON(raw) {
  if (!raw) throw new Error('Empty response from AI.');
  try { return JSON.parse(raw); } catch(_) {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch(_) {}
    const cleaned = match[0]
      .replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"')
      .replace(/,\s*([}\]])/g,'$1')
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g,' ').replace(/\t/g,' ');
    try { return JSON.parse(cleaned); } catch(_) {}
  }
  throw new Error('Could not parse response. Please try again.');
}

// ═══════════════════════════════════════════════════════════════
// AI PROMPTS
// Step 1: Always English JSON — 100% reliable
// Step 2: Translate specific text fields only (fast, small payload)
// ═══════════════════════════════════════════════════════════════
const ENGLISH_SYSTEM_PROMPT = `You are LabLens, a medical report explainer. Explain lab results in plain English. Never diagnose.

Respond ONLY with valid JSON — no markdown, no preamble, no trailing commas:
{
  "headline": "one sentence summary",
  "overall_status": "normal",
  "summary": "3-4 sentence overview",
  "urgent_alert": null,
  "findings": [
    { "parameter": "English name", "value": "value with units", "fuzzy_label": "from context", "fuzzy_score": 0.0, "plain_meaning": "what it measures", "significance": "severity-calibrated explanation", "flag": false }
  ],
  "syndrome_explanations": [
    { "name": "syndrome name", "confidence_pct": 70, "plain_explanation": "what pattern means", "what_doctor_looks_for": "next steps" }
  ],
  "questions_for_doctor": ["specific value-referenced question"],
  "lifestyle_notes": ["concrete actionable note"],
  "disclaimer": "Educational only. Not medical advice. Consult your doctor."
}

Severity language (match fuzzy_score):
0.0-0.2: "slightly/marginally" | 0.2-0.5: "mildly/somewhat" | 0.5-0.7: "moderately/notably" | 0.7-0.9: "significantly" | 0.9-1.0: "severely/critically"
Syndrome confidence >0.7: confident language. <0.4: "may suggest".`;

function buildTranslationPrompt(language, englishResult) {
  const langMap = { hindi:'Hindi (Devanagari)', spanish:'Spanish', tamil:'Tamil (Tamil script)' };
  const targetLang = langMap[language];
  // Only send the text fields that need translation — keep JSON tiny
  const toTranslate = {
    headline:    englishResult.headline,
    summary:     englishResult.summary,
    urgent_alert: englishResult.urgent_alert,
    findings_text: (englishResult.findings||[]).map(f=>({ plain_meaning:f.plain_meaning, significance:f.significance })),
    syndrome_texts: (englishResult.syndrome_explanations||[]).map(s=>({ plain_explanation:s.plain_explanation, what_doctor_looks_for:s.what_doctor_looks_for })),
    questions:   englishResult.questions_for_doctor,
    lifestyle:   englishResult.lifestyle_notes,
  };
  return {
    system: `You are a medical translator. Translate the given JSON text fields from English to ${targetLang}. Return ONLY valid JSON with the same structure. Keep all keys in English. No markdown, no preamble. Medical terms may stay in English if no good ${targetLang} equivalent exists.`,
    user: JSON.stringify(toTranslate),
  };
}

function mergeTranslation(englishResult, translated) {
  if (!translated) return englishResult;
  const merged = { ...englishResult };
  if (translated.headline)     merged.headline     = translated.headline;
  if (translated.summary)      merged.summary      = translated.summary;
  if (translated.urgent_alert) merged.urgent_alert = translated.urgent_alert;
  if (translated.findings_text) {
    merged.findings = (englishResult.findings||[]).map((f,i) => ({
      ...f,
      plain_meaning: translated.findings_text[i]?.plain_meaning || f.plain_meaning,
      significance:  translated.findings_text[i]?.significance  || f.significance,
    }));
  }
  if (translated.syndrome_texts) {
    merged.syndrome_explanations = (englishResult.syndrome_explanations||[]).map((s,i) => ({
      ...s,
      plain_explanation:    translated.syndrome_texts[i]?.plain_explanation    || s.plain_explanation,
      what_doctor_looks_for: translated.syndrome_texts[i]?.what_doctor_looks_for || s.what_doctor_looks_for,
    }));
  }
  if (translated.questions) merged.questions_for_doctor = translated.questions;
  if (translated.lifestyle) merged.lifestyle_notes      = translated.lifestyle;
  return merged;
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE CONFIG — UI text, caution text, upload hints
// ═══════════════════════════════════════════════════════════════
const LANG_CONFIG = {
  english: {
    flag:'🇬🇧', label:'English', nativeLabel:'English',
    uploadHint:'Upload your lab report — PDF, text, or CSV in any language',
    analyzeBtn:'Explain My Report →',
    analyzingStep3:'AI writing plain-language explanations',
    caution:'This is an AI-generated explanation for educational purposes only. It is not a medical diagnosis. Always consult a qualified doctor before making any health decisions.',
  },
  hindi: {
    flag:'🇮🇳', label:'Hindi', nativeLabel:'हिंदी',
    uploadHint:'अपनी लैब रिपोर्ट अपलोड करें — PDF, टेक्स्ट या CSV किसी भी भाषा में',
    analyzeBtn:'मेरी रिपोर्ट समझाएं →',
    analyzingStep3:'AI हिंदी में स्पष्टीकरण लिख रहा है',
    caution:'यह केवल शैक्षिक उद्देश्यों के लिए AI द्वारा तैयार की गई जानकारी है। यह कोई चिकित्सीय निदान नहीं है। कोई भी स्वास्थ्य निर्णय लेने से पहले योग्य डॉक्टर से अवश्य परामर्श करें।',
  },
  spanish: {
    flag:'🇪🇸', label:'Spanish', nativeLabel:'Español',
    uploadHint:'Suba su informe de laboratorio — PDF, texto o CSV en cualquier idioma',
    analyzeBtn:'Explicar mi informe →',
    analyzingStep3:'IA escribiendo explicaciones en español',
    caution:'Esta es una explicación generada por IA con fines educativos únicamente. No es un diagnóstico médico. Consulte siempre a un médico calificado antes de tomar decisiones de salud.',
  },
  tamil: {
    flag:'🇮🇳', label:'Tamil', nativeLabel:'தமிழ்',
    uploadHint:'உங்கள் ஆய்வக அறிக்கையை பதிவேற்றவும் — எந்த மொழியிலும் PDF, உரை அல்லது CSV',
    analyzeBtn:'என் அறிக்கையை விளக்கு →',
    analyzingStep3:'AI தமிழில் விளக்கங்கள் எழுதுகிறது',
    caution:'இது கல்வி நோக்கங்களுக்காக மட்டுமே AI உருவாக்கிய விளக்கமாகும். இது மருத்துவ நோயறிதல் அல்ல. எந்த உடல்நல முடிவையும் எடுப்பதற்கு முன் தகுதிவாய்ந்த மருத்துவரை அணுகவும்.',
  },
};

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════
const SAMPLE_REPORT = `COMPLETE BLOOD COUNT (CBC) WITH DIFFERENTIAL
Date: June 13, 2026  |  Patient: John Doe  |  Age: 45M

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

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function LabLens() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [report, setReport]         = useState('');
  const [result, setResult]         = useState(null);
  const [fuzzyData, setFuzzyData]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError]           = useState('');
  const [charCount, setCharCount]   = useState(0);
  const [activeTab, setActiveTab]   = useState('summary');
  const [language, setLanguage]     = useState('english');
  const fileRef = useRef();
  const MAX_CHARS = 5000;

  const lang = LANG_CONFIG[language] || LANG_CONFIG.english;

  // ── palette ──────────────────────────────────────────────────
  const bg     = isDark ? '#08070f' : '#faf8ff';
  const card   = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const text   = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.82)';
  const muted  = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const ac     = isDark ? '#a78bfa' : '#7c3aed';
  const green  = '#10b981';
  const red    = '#f87171';
  const warn   = '#d97706';
  const warnBg = isDark ? 'rgba(217,119,6,0.1)' : 'rgba(217,119,6,0.08)';
  const warnBorder = 'rgba(217,119,6,0.3)';

  // ── font for non-Latin scripts ────────────────────────────────
  // Devanagari (Hindi) and Tamil need a system font that supports them
  const scriptFont = language === 'hindi' || language === 'tamil'
    ? "'Noto Sans', 'Mangal', system-ui, sans-serif"
    : "'Space Mono', monospace";

  // ── severity helpers ─────────────────────────────────────────
  function severityColor(label) {
    if (!label||label==='within_range') return green;
    if (label.includes('critical'))    return red;
    if (label.includes('severe'))      return '#fb923c';
    if (label.includes('moderate'))    return '#f59e0b';
    if (label.includes('mild'))        return '#84cc16';
    if (label.includes('borderline'))  return muted;
    return muted;
  }
  function severityLabel(label) {
    return { within_range:'✓ Normal', borderline_low:'↓ Borderline Low', mildly_low:'↓ Mildly Low', moderately_low:'↓ Moderately Low', severely_low:'↓↓ Severely Low', critically_low:'↓↓ Critical Low', borderline_high:'↑ Borderline High', mildly_high:'↑ Mildly High', moderately_high:'↑ Moderately High', severely_high:'↑↑ Severely High', critically_high:'↑↑ Critical High' }[label] || label;
  }
  function overallBadge(status) {
    if (status==='normal')           return { color:green, icon:'✓', label:'All values within normal range' };
    if (status==='attention_needed') return { color:warn,  icon:'⚠', label:'Some values need attention' };
    if (status==='urgent')           return { color:red,   icon:'🚨', label:'Urgent — please consult your doctor' };
    return { color:muted, icon:'·', label:'Analysis complete' };
  }

  // ── input ────────────────────────────────────────────────────
  function handleInput(val) {
    if (val.length<=MAX_CHARS) { setReport(val); setCharCount(val.length); setError(''); }
  }
  function loadSample() { handleInput(SAMPLE_REPORT); setResult(null); setFuzzyData(null); }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value='';
    if (file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size>5*1024*1024) { setError('PDF too large. Max 5MB.'); return; }
      setLoadingPdf(true); setError('');
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve,reject)=>{
            const s=document.createElement('script');
            s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            s.onload=resolve; s.onerror=()=>reject(new Error('Could not load PDF reader.'));
            document.head.appendChild(s);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const arrayBuffer=await file.arrayBuffer();
        const pdf=await window.pdfjsLib.getDocument({ data:arrayBuffer }).promise;
        let fullText='';
        for (let i=1;i<=pdf.numPages;i++) {
          const page=await pdf.getPage(i);
          const content=await page.getTextContent();
          fullText+=content.items.map(item=>item.str).join(' ')+'\n';
        }
        if (!fullText.trim()) setError('Could not extract text from this PDF. It may be a scanned image. Please paste the text manually.');
        else handleInput(fullText.slice(0,MAX_CHARS));
      } catch(err) { setError('PDF reading failed: '+err.message); }
      finally { setLoadingPdf(false); }
      return;
    }
    if (file.size>200000) { setError('File too large. Max 200KB.'); return; }
    const reader=new FileReader();
    reader.onload=ev=>handleInput((ev.target.result||'').slice(0,MAX_CHARS));
    reader.readAsText(file);
  }

  // ── analyze — TWO STEP ───────────────────────────────────────
  const analyze = useCallback(async () => {
    if (!report.trim())            { setError('Please paste your lab results or medical report.'); return; }
    if (report.trim().length < 30) { setError('Report is too short. Please paste the full text.'); return; }

    setLoading(true); setError(''); setResult(null); setFuzzyData(null);

    try {
      // Step 1: Fuzzy analysis (client-side, instant)
      const parsedValues = parseLabText(report);
      const syndromes    = detectSyndromes(parsedValues);
      const overallFuzzy = computeOverallSeverity(parsedValues, syndromes);
      setFuzzyData({ parsedValues, syndromes, overallFuzzy });

      const fuzzyContext = parsedValues.length > 0
        ? `FUZZY PRE-ANALYSIS:\nValues: ${JSON.stringify(parsedValues.map(v=>({ name:v.name, value:v.value, unit:v.unit, ref:`${v.refLow}-${v.refHigh}`, fuzzy_score:v.fuzzy.score, fuzzy_label:v.fuzzy.label, direction:v.fuzzy.direction })))}\nSyndromes: ${JSON.stringify(syndromes.map(s=>({ name:s.name, confidence:s.confidence, urgency:s.urgency })))}\nOverall: ${overallFuzzy}`
        : 'Note: Could not parse structured values. Analyze from raw text.';

      const primaryModel  = TOOL_MODELS.labLens || MODELS.HEAVY;
      const fallbackModel = MODELS.MEDIUM;

      const callAI = async (model, toolId, messages) => fetchWithBackoff(GROQ_API_URL, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model, max_tokens:2000, temperature:0.1, toolId, messages }),
      });

      // STEP 2a: Get English JSON (always reliable)
      setLoadingStep('Analyzing values and detecting patterns…');
      let res;
      try {
        res = await callAI(primaryModel, 'lablens', [
          { role:'system', content:ENGLISH_SYSTEM_PROMPT },
          { role:'user',   content:`${fuzzyContext}\n\nRAW REPORT:\n${report}` },
        ]);
        if (res.status===429) throw new Error('rate_limit');
      } catch(e) {
        if (e.message==='rate_limit'||e.message?.includes('429'))
          res = await callAI(fallbackModel, 'lablens-fallback', [
            { role:'system', content:ENGLISH_SYSTEM_PROMPT },
            { role:'user',   content:`${fuzzyContext}\n\nRAW REPORT:\n${report}` },
          ]);
        else throw e;
      }

      const data     = await res.json();
      const raw      = data?.choices?.[0]?.message?.content || '';
      const englishResult = safeParseJSON(raw);

      // STEP 2b: Translate if non-English (fast, small payload)
      let finalResult = englishResult;
      if (language !== 'english') {
        setLoadingStep(`Translating to ${lang.nativeLabel}…`);
        try {
          const { system, user } = buildTranslationPrompt(language, englishResult);
          // Use primary model for translation — Tamil/Hindi need the stronger model
          const transRes = await callAI(primaryModel, 'lablens-translate', [
            { role:'system', content: system },
            { role:'user',   content: user   },
          ]);
          const transData = await transRes.json();
          const transRaw  = transData?.choices?.[0]?.message?.content || '';
          const translated = safeParseJSON(transRaw);
          finalResult = mergeTranslation(englishResult, translated);
        } catch(_) {
          // Translation failed — show English with a note
          finalResult = englishResult;
          setError(`Note: Translation to ${lang.nativeLabel} failed. Showing results in English.`);
        }
      }

      // Normalize overall_status — model sometimes returns unexpected values
      const validStatuses = ['normal', 'attention_needed', 'urgent'];
      if (!validStatuses.includes(finalResult.overall_status)) {
        const s = (finalResult.overall_status || '').toLowerCase();
        if (s.includes('urgent') || s.includes('critical'))             finalResult.overall_status = 'urgent';
        else if (s.includes('attention') || s.includes('abnormal'))     finalResult.overall_status = 'attention_needed';
        else if (overallFuzzy && overallFuzzy !== 'unknown')            finalResult.overall_status = overallFuzzy;
        else                                                            finalResult.overall_status = 'attention_needed';
      }
      setResult(finalResult);
      setActiveTab('summary');
    } catch(err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }, [report, language]);

  function clear() { setReport(''); setResult(null); setFuzzyData(null); setError(''); setCharCount(0); }

  const flagged = result?.findings?.filter(f=>f.flag) || [];

  function SeverityBar({ score, label }) {
    const color = severityColor(label);
    const pct   = Math.round((score||0)*100);
    return (
      <div style={{ marginTop:'8px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
          <span style={{ fontSize:'0.65rem', color, fontWeight:600 }}>{severityLabel(label)}</span>
          {score>0 && <span style={{ fontSize:'0.62rem', color:muted }}>{pct}% severity</span>}
        </div>
        <div style={{ height:'4px', background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.07)', borderRadius:'4px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:'4px', transition:'width 0.6s ease' }} />
        </div>
      </div>
    );
  }

  // ── CAUTION BLOCK — shown at bottom of every results tab ─────
  const CautionBlock = () => (
    <div style={{ background:warnBg, border:`1px solid ${warnBorder}`, borderRadius:'12px', padding:'18px 20px', marginTop:'16px' }}>
      <div style={{ fontSize:'0.72rem', color:warn, fontWeight:700, marginBottom:'12px', letterSpacing:'0.06em' }}>⚕ IMPORTANT CAUTION</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {Object.entries(LANG_CONFIG).map(([code, cfg]) => (
          <div key={code} style={{ fontSize:'0.71rem', color:warn, lineHeight:1.75, fontFamily: code==='hindi'||code==='tamil' ? "'Noto Sans','Mangal',system-ui,sans-serif" : 'inherit' }}>
            {cfg.flag} {cfg.caution}
          </div>
        ))}
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:bg, width:'100%' }}>
      <div style={{ maxWidth:'840px', margin:'0 auto', padding:'60px 20px 80px', fontFamily:"'Space Mono', monospace" }}>

        {/* Header */}
        <div style={{ marginBottom:'32px', textAlign:'left' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:isDark?'rgba(16,185,129,0.1)':'rgba(16,185,129,0.08)', border:`1px solid rgba(16,185,129,0.25)`, borderRadius:'100px', padding:'5px 16px', marginBottom:'16px' }}>
            <span style={{ fontSize:'0.6rem', color:green, letterSpacing:'0.18em' }}>◆ MEDICAL · AI + FUZZY LOGIC</span>
          </div>
          <h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800, color:isDark?'#fff':'#1a1a1a', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'10px' }}>
            Lab<span style={{ color:green }}>Lens</span>
          </h1>
          <p style={{ fontSize:'0.92rem', color:muted, lineHeight:1.75, maxWidth:'580px', marginBottom:'16px', textAlign:'left' }}>
            Paste or upload your lab report in any language. LabLens scores every value on a nuanced severity scale using fuzzy logic, then AI explains what it means — in English, Hindi, Spanish, or Tamil.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:warnBg, border:`1px solid ${warnBorder}`, borderRadius:'8px', padding:'6px 14px' }}>
              <span style={{ fontSize:'0.7rem', color:warn, fontWeight:600 }}>⚕ Educational only — not medical advice or diagnosis</span>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:isDark?'rgba(16,185,129,0.06)':'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'8px', padding:'6px 14px' }}>
              <span style={{ fontSize:'0.7rem', color:green, fontWeight:600 }}>✓ Upload in any language · Explanation in 4 languages</span>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'0.6rem', color:muted, letterSpacing:'0.12em', marginBottom:'10px', textTransform:'uppercase' }}>Output Language</div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {Object.entries(LANG_CONFIG).map(([code, cfg]) => {
              const active = language === code;
              return (
                <button key={code} onClick={()=>setLanguage(code)}
                  style={{ background:active?(isDark?'rgba(16,185,129,0.12)':'rgba(16,185,129,0.09)'):card, border:`1px solid ${active?green+'80':border}`, borderRadius:'10px', padding:'8px 18px', fontSize:'0.8rem', color:active?green:text, cursor:'pointer', fontFamily:code==='hindi'||code==='tamil'?"'Noto Sans','Mangal',system-ui,sans-serif":"'Space Mono',monospace", fontWeight:active?700:400, transition:'all 0.15s', display:'flex', alignItems:'center', gap:'7px', boxShadow:active?`0 0 0 2px ${green}22`:'none' }}>
                  <span>{cfg.flag}</span>
                  <span>{cfg.nativeLabel}</span>
                </button>
              );
            })}
          </div>
          {language !== 'english' && (
            <div style={{ marginTop:'8px', fontSize:'0.68rem', color:muted, paddingLeft:'2px', fontFamily:language==='hindi'||language==='tamil'?"'Noto Sans','Mangal',system-ui,sans-serif":"inherit" }}>
              ⓘ {language==='hindi'?'पैरामीटर नाम और मान अंग्रेज़ी में रहेंगे — स्पष्टीकरण हिंदी में होगा':language==='tamil'?'அளவுருக்கள் ஆங்கிலத்தில் — விளக்கங்கள் தமிழில்':'Los parámetros permanecen en inglés — las explicaciones serán en Español'}
            </div>
          )}
        </div>

        {/* Input Card */}
        <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'16px', padding:'24px', marginBottom:'16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
            <span style={{ fontSize:'0.6rem', color:muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>Paste Lab Report / Results</span>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              <button onClick={loadSample} style={{ background:isDark?'rgba(16,185,129,0.08)':'rgba(16,185,129,0.07)', border:`1px solid rgba(16,185,129,0.2)`, borderRadius:'8px', padding:'5px 12px', fontSize:'0.7rem', color:green, cursor:'pointer', fontFamily:"'Space Mono',monospace" }}>
                Sample CBC
              </button>
              <button onClick={()=>fileRef.current?.click()} disabled={loadingPdf}
                style={{ background:isDark?'rgba(167,139,250,0.08)':'rgba(124,58,237,0.07)', border:`1px solid ${isDark?'rgba(167,139,250,0.2)':'rgba(124,58,237,0.2)'}`, borderRadius:'8px', padding:'5px 12px', fontSize:'0.7rem', color:ac, cursor:loadingPdf?'wait':'pointer', fontFamily:"'Space Mono',monospace", opacity:loadingPdf?0.6:1 }}>
                {loadingPdf?'Reading PDF…':'↑ Upload PDF / TXT'}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv" style={{ display:'none' }} onChange={handleFile} />
            </div>
          </div>

          {/* Upload USP hint — in selected language */}
          <div style={{ marginBottom:'10px', padding:'8px 12px', background:isDark?'rgba(16,185,129,0.05)':'rgba(16,185,129,0.04)', border:`1px solid rgba(16,185,129,0.15)`, borderRadius:'8px', fontSize:'0.68rem', color:green, fontFamily:scriptFont }}>
            📂 {lang.uploadHint}
          </div>

          <textarea
            value={report}
            onChange={e=>handleInput(e.target.value)}
            placeholder={`Paste your lab results here...\n\nExample:\nHemoglobin: 11.8 g/dL  [Ref: 13.5-17.5]  LOW\nWBC: 11.2 K/uL  [Ref: 4.5-11.0]  HIGH\nFerritin: 6 ng/mL  [Ref: 12-300]  LOW\n\nSupports reports in any language — English, Hindi, Spanish, Tamil, etc.`}
            style={{ width:'100%', minHeight:'200px', background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', border:`1px solid ${border}`, borderRadius:'10px', padding:'16px', color:text, fontSize:'0.82rem', lineHeight:1.7, resize:'vertical', fontFamily:"'Space Mono',monospace", outline:'none', boxSizing:'border-box' }}
          />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px', flexWrap:'wrap', gap:'8px' }}>
            <span style={{ fontSize:'0.65rem', color:charCount>MAX_CHARS*0.9?warn:muted }}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
            </span>
            <div style={{ display:'flex', gap:'8px' }}>
              {report && <button onClick={clear} style={{ background:'transparent', border:`1px solid ${border}`, borderRadius:'8px', padding:'8px 16px', fontSize:'0.72rem', color:muted, cursor:'pointer', fontFamily:"'Space Mono',monospace" }}>Clear</button>}
              <button onClick={analyze} disabled={loading||!report.trim()}
                style={{ background:report.trim()&&!loading?`linear-gradient(135deg,${green},#059669)`:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)', border:'none', borderRadius:'10px', padding:'10px 28px', fontSize:'0.82rem', fontWeight:700, color:report.trim()&&!loading?'#fff':muted, cursor:report.trim()&&!loading?'pointer':'not-allowed', fontFamily:scriptFont, transition:'all 0.2s' }}>
                {loading?'…':lang.analyzeBtn}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:'10px', padding:'14px 18px', marginBottom:'16px', fontSize:'0.82rem', color:red, lineHeight:1.6 }}>{error}</div>}

        {/* Loading */}
        {loading && (
          <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'16px', padding:'48px', textAlign:'center' }}>
            <div style={{ fontSize:'2.2rem', marginBottom:'16px' }}>🔬</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.1rem', color:isDark?'#fff':'#1a1a1a', marginBottom:'10px' }}>Analyzing your report…</div>
            <div style={{ fontSize:'0.78rem', color:muted, lineHeight:2 }}>
              Step 1: Fuzzy logic scoring each value's severity<br />
              Step 2: Detecting patterns across related markers<br />
              Step 3: {loadingStep || lang.analyzingStep3}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            {result.urgent_alert && (
              <div style={{ background:'rgba(248,113,113,0.1)', border:`2px solid ${red}44`, borderRadius:'14px', padding:'18px 22px', marginBottom:'16px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'1.4rem', flexShrink:0 }}>🚨</span>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:red, marginBottom:'4px' }}>Action Needed</div>
                  <div style={{ fontSize:'0.88rem', color:text, lineHeight:1.65, fontFamily:scriptFont }}>{result.urgent_alert}</div>
                </div>
              </div>
            )}

            {(() => {
              const badge=overallBadge(result.overall_status);
              return (
                <div style={{ background:`${badge.color}10`, border:`1px solid ${badge.color}30`, borderRadius:'14px', padding:'18px 22px', marginBottom:'20px', display:'flex', alignItems:'flex-start', gap:'14px' }}>
                  <span style={{ fontSize:'1.3rem', flexShrink:0 }}>{badge.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.9rem', color:badge.color, marginBottom:'4px' }}>{badge.label}</div>
                    <div style={{ fontSize:'0.88rem', color:text, lineHeight:1.65, fontFamily:scriptFont }}>{result.headline}</div>
                    {fuzzyData?.parsedValues?.length>0 && (
                      <div style={{ marginTop:'8px', fontSize:'0.66rem', color:muted }}>
                        Fuzzy engine: {fuzzyData.parsedValues.length} values · {flagged.length} flagged · {fuzzyData.syndromes.length} pattern{fuzzyData.syndromes.length!==1?'s':''} detected
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Tabs */}
            <div style={{ display:'flex', gap:'3px', background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.04)', borderRadius:'10px', padding:'4px', marginBottom:'20px' }}>
              {[
                { key:'summary',   label:'Summary' },
                { key:'findings',  label:`Values (${(result.findings||[]).length})` },
                { key:'flagged',   label:`Flagged (${flagged.length})` },
                { key:'patterns',  label:`Patterns (${(result.syndrome_explanations||[]).length})` },
                { key:'questions', label:'Ask Doctor' },
              ].map(tab=>(
                <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
                  style={{ flex:1, background:activeTab===tab.key?(isDark?'rgba(255,255,255,0.08)':'#fff'):'transparent', border:activeTab===tab.key?`1px solid ${border}`:'1px solid transparent', borderRadius:'7px', padding:'8px 2px', fontSize:'0.6rem', color:activeTab===tab.key?(isDark?'#fff':'#1a1a1a'):muted, cursor:'pointer', fontFamily:"'Space Mono',monospace", transition:'all 0.15s', fontWeight:activeTab===tab.key?700:400 }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Summary */}
            {activeTab==='summary' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'22px' }}>
                  <div style={{ fontSize:'0.6rem', color:green, letterSpacing:'0.15em', marginBottom:'12px', textTransform:'uppercase' }}>◆ Summary</div>
                  <p style={{ fontSize:'0.92rem', color:text, lineHeight:1.85, margin:0, fontFamily:scriptFont }}>{result.summary}</p>
                </div>
                {result.lifestyle_notes?.length>0 && (
                  <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'22px' }}>
                    <div style={{ fontSize:'0.6rem', color:green, letterSpacing:'0.15em', marginBottom:'14px', textTransform:'uppercase' }}>◆ What You Can Do</div>
                    {result.lifestyle_notes.map((note,i)=>(
                      <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:i<result.lifestyle_notes.length-1?'12px':0 }}>
                        <span style={{ color:green, flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:'0.88rem', color:text, lineHeight:1.7, fontFamily:scriptFont }}>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
                <CautionBlock />
              </div>
            )}

            {/* All findings */}
            {activeTab==='findings' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {(result.findings||[]).map((f,i)=>{
                  const col=severityColor(f.fuzzy_label);
                  return (
                    <div key={i} style={{ background:card, border:`1px solid ${f.flag?col+'44':border}`, borderRadius:'12px', padding:'18px 20px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px', marginBottom:'6px' }}>
                        <div>
                          <span style={{ fontWeight:700, fontSize:'0.88rem', color:isDark?'#fff':'#1a1a1a' }}>{f.parameter}</span>
                          <span style={{ fontSize:'0.78rem', color:muted, marginLeft:'10px' }}>{f.value}</span>
                        </div>
                        <span style={{ background:`${col}18`, border:`1px solid ${col}44`, borderRadius:'100px', padding:'3px 12px', fontSize:'0.62rem', color:col, fontWeight:700, whiteSpace:'nowrap' }}>{severityLabel(f.fuzzy_label)}</span>
                      </div>
                      <div style={{ fontSize:'0.75rem', color:muted, marginBottom:'6px', fontFamily:scriptFont }}>{f.plain_meaning}</div>
                      <div style={{ fontSize:'0.84rem', color:text, lineHeight:1.65, marginBottom:'6px', fontFamily:scriptFont }}>{f.significance}</div>
                      {f.fuzzy_score>0 && <SeverityBar score={f.fuzzy_score} label={f.fuzzy_label} />}
                    </div>
                  );
                })}
                <CautionBlock />
              </div>
            )}

            {/* Flagged */}
            {activeTab==='flagged' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {flagged.length===0
                  ? <div style={{ background:`${green}10`, border:`1px solid ${green}30`, borderRadius:'14px', padding:'40px', textAlign:'center' }}>
                      <div style={{ fontSize:'2rem', marginBottom:'10px' }}>✓</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:green, marginBottom:'6px' }}>No abnormal values detected</div>
                      <div style={{ fontSize:'0.82rem', color:muted }}>All reported values appear within normal reference ranges</div>
                    </div>
                  : flagged.map((f,i)=>{
                      const col=severityColor(f.fuzzy_label);
                      return (
                        <div key={i} style={{ background:`${col}08`, border:`1px solid ${col}33`, borderRadius:'12px', padding:'20px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px', marginBottom:'10px' }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.95rem', color:col }}>{f.parameter}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                              <span style={{ fontSize:'0.82rem', color:text }}>{f.value}</span>
                              <span style={{ background:`${col}20`, border:`1px solid ${col}44`, borderRadius:'100px', padding:'3px 12px', fontSize:'0.62rem', color:col, fontWeight:700, whiteSpace:'nowrap' }}>{severityLabel(f.fuzzy_label)}</span>
                            </div>
                          </div>
                          <div style={{ fontSize:'0.75rem', color:muted, marginBottom:'8px', fontFamily:scriptFont }}>{f.plain_meaning}</div>
                          <div style={{ fontSize:'0.88rem', color:text, lineHeight:1.7, marginBottom:'8px', fontFamily:scriptFont }}>{f.significance}</div>
                          {f.fuzzy_score>0 && <SeverityBar score={f.fuzzy_score} label={f.fuzzy_label} />}
                        </div>
                      );
                    })
                }
                <CautionBlock />
              </div>
            )}

            {/* Patterns */}
            {activeTab==='patterns' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {!(result.syndrome_explanations?.length>0)
                  ? <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'32px', textAlign:'center' }}>
                      <div style={{ fontSize:'0.88rem', color:muted }}>No significant multi-marker patterns detected.</div>
                    </div>
                  : (result.syndrome_explanations||[]).map((s,i)=>{
                      const fuzzyS=fuzzyData?.syndromes?.find(fs=>fs.name===s.name);
                      const conf=fuzzyS?.confidence||(s.confidence_pct/100);
                      const col=conf>0.7?red:conf>0.4?warn:green;
                      return (
                        <div key={i} style={{ background:`${col}08`, border:`1px solid ${col}30`, borderRadius:'14px', padding:'22px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'8px', marginBottom:'12px' }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1rem', color:isDark?'#fff':'#1a1a1a' }}>{s.name}</div>
                            <div style={{ background:`${col}18`, border:`1px solid ${col}40`, borderRadius:'100px', padding:'4px 14px', fontSize:'0.65rem', color:col, fontWeight:700, whiteSpace:'nowrap' }}>
                              {conf>=0.8?'High confidence':conf>=0.5?'Moderate confidence':'Low confidence'}
                            </div>
                          </div>
                          <SeverityBar score={conf} label={conf>0.7?'severely_high':conf>0.4?'moderately_high':'mildly_high'} />
                          <div style={{ fontSize:'0.88rem', color:text, lineHeight:1.75, marginTop:'14px', fontFamily:scriptFont }}>{s.plain_explanation}</div>
                          {s.what_doctor_looks_for && (
                            <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:`1px solid ${border}` }}>
                              <div style={{ fontSize:'0.6rem', color:ac, letterSpacing:'0.1em', marginBottom:'6px', textTransform:'uppercase' }}>What Your Doctor Will Likely Check</div>
                              <div style={{ fontSize:'0.84rem', color:muted, lineHeight:1.65, fontFamily:scriptFont }}>{s.what_doctor_looks_for}</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                }
                <CautionBlock />
              </div>
            )}

            {/* Questions */}
            {activeTab==='questions' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'22px' }}>
                  <div style={{ fontSize:'0.6rem', color:ac, letterSpacing:'0.15em', marginBottom:'18px', textTransform:'uppercase' }}>◆ Bring These to Your Appointment</div>
                  {(result.questions_for_doctor||[]).map((q,i)=>(
                    <div key={i} style={{ display:'flex', gap:'14px', alignItems:'flex-start', paddingBottom:i<result.questions_for_doctor.length-1?'16px':0, marginBottom:i<result.questions_for_doctor.length-1?'16px':0, borderBottom:i<result.questions_for_doctor.length-1?`1px solid ${border}`:'none' }}>
                      <div style={{ background:ac, color:'#fff', fontSize:'0.62rem', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px' }}>{i+1}</div>
                      <span style={{ fontSize:'0.88rem', color:text, lineHeight:1.75, fontFamily:scriptFont }}>{q}</span>
                    </div>
                  ))}
                </div>
                <CautionBlock />
              </div>
            )}

            <div style={{ marginTop:'28px', textAlign:'center' }}>
              <button onClick={clear} style={{ background:'transparent', border:`1px solid ${border}`, borderRadius:'10px', padding:'10px 28px', fontSize:'0.78rem', color:muted, cursor:'pointer', fontFamily:"'Space Mono',monospace" }}>
                Analyze Another Report
              </button>
            </div>
          </div>
        )}

        {/* Pre-result info */}
        {!result && !loading && (
          <div style={{ marginTop:'40px' }}>
            <div style={{ fontSize:'0.6rem', color:muted, letterSpacing:'0.15em', marginBottom:'16px', textAlign:'center', textTransform:'uppercase' }}>How LabLens Works</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'12px', marginBottom:'20px' }}>
              {[
                { icon:'📂', title:'Upload anything', desc:'PDF, text, or CSV lab reports in any language — English, Hindi, Tamil, Spanish, and more' },
                { icon:'⚖️', title:'Fuzzy scoring', desc:'Every value scored 0–100% severity — borderline vs critical is different' },
                { icon:'🧩', title:'Pattern detection', desc:'Clusters related markers into named medical patterns with confidence scores' },
                { icon:'🌐', title:'4 languages', desc:'Explanations in English, हिंदी, Español, or தமிழ்' },
                { icon:'🩺', title:'Doctor questions', desc:'Value-specific questions to bring to your next appointment' },
                { icon:'🔒', title:'Private', desc:'Nothing stored. Your data never leaves your session.' },
              ].map((item,i)=>(
                <div key={i} style={{ background:card, border:`1px solid ${border}`, borderRadius:'12px', padding:'18px', textAlign:'center' }}>
                  <div style={{ fontSize:'1.4rem', marginBottom:'8px' }}>{item.icon}</div>
                  <div style={{ fontWeight:700, fontSize:'0.75rem', color:isDark?'#fff':'#1a1a1a', marginBottom:'5px' }}>{item.title}</div>
                  <div style={{ fontSize:'0.7rem', color:muted, lineHeight:1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'12px', padding:'18px 22px' }}>
              <div style={{ fontSize:'0.6rem', color:muted, letterSpacing:'0.12em', marginBottom:'12px', textTransform:'uppercase' }}>Works With</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {['CBC','Lipid Panel','Metabolic Panel','Thyroid (TSH/T3/T4)','Liver Function','Kidney Function','Iron Studies','HbA1c / Diabetes','Urinalysis','Vitamin D / B12','Hormone Panel','Cardiac Markers','Coagulation','Electrolytes'].map(t=>(
                  <span key={t} style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)', border:`1px solid ${border}`, borderRadius:'100px', padding:'4px 12px', fontSize:'0.65rem', color:muted }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
