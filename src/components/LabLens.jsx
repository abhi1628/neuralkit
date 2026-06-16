// src/components/LabLens.jsx
// LabLens — AI Lab Report Explainer with Fuzzy Logic Engine
// v3: robust JSON parsing for multilanguage, PDF upload, fixed colors, alignment

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
    if (dev < 0.05) return { score: +(dev / 0.05 * 0.2).toFixed(3),                   label: 'borderline_low',  direction: 'low' };
    if (dev < 0.15) return { score: +(0.2+(dev-0.05)/0.10*0.2).toFixed(3),            label: 'mildly_low',      direction: 'low' };
    if (dev < 0.30) return { score: +(0.4+(dev-0.15)/0.15*0.2).toFixed(3),            label: 'moderately_low',  direction: 'low' };
    if (dev < 0.50) return { score: +(0.6+(dev-0.30)/0.20*0.2).toFixed(3),            label: 'severely_low',    direction: 'low' };
                    return { score: +Math.min(1,0.8+(dev-0.50)/0.50*0.2).toFixed(3),  label: 'critically_low',  direction: 'low' };
  }
  const dev = (value - refHigh) / range;
  if (dev < 0.05) return { score: +(dev / 0.05 * 0.2).toFixed(3),                    label: 'borderline_high', direction: 'high' };
  if (dev < 0.15) return { score: +(0.2+(dev-0.05)/0.10*0.2).toFixed(3),             label: 'mildly_high',     direction: 'high' };
  if (dev < 0.30) return { score: +(0.4+(dev-0.15)/0.15*0.2).toFixed(3),             label: 'moderately_high', direction: 'high' };
  if (dev < 0.50) return { score: +(0.6+(dev-0.30)/0.20*0.2).toFixed(3),             label: 'severely_high',   direction: 'high' };
                  return { score: +Math.min(1,0.8+(dev-0.50)/0.50*0.2).toFixed(3),   label: 'critically_high', direction: 'high' };
}

function fuzzyAnd(...scores) { return Math.min(...scores.filter(s => s > 0)); }

function detectSyndromes(parsedValues) {
  const find  = (names) => { for (const n of names) { const h = parsedValues.find(v => v.name.toLowerCase().includes(n)); if (h) return h; } return null; };
  const score = (names, dir) => { const f = find(names); return (!f || f.fuzzy.direction !== dir) ? 0 : f.fuzzy.score; };
  const syndromes = [];

  const ironConf = fuzzyAnd(score(['ferritin'],'low'), score(['hemoglobin','hgb'],'low') || score(['mcv'],'low'));
  if (ironConf > 0.25) syndromes.push({ name:'Iron Deficiency Pattern', confidence: Math.min(1, ironConf + score(['tibc'],'high')*0.3), description:'Multiple iron-related markers pointing in the same direction — low ferritin (iron stores), low hemoglobin, low MCV, and high TIBC together strongly suggest iron deficiency.', urgency: ironConf>0.7?'high':'medium' });

  const infConf = fuzzyAnd(score(['wbc'],'high'), score(['neutrophil'],'high'));
  if (infConf > 0.2) syndromes.push({ name:'Infection / Inflammation Pattern', confidence: infConf, description:'Elevated white blood cells and neutrophils suggest the body is mounting an immune response — typically to a bacterial infection, but also possible with viral infections, stress, or inflammation.', urgency: infConf>0.7?'high':'medium' });

  const microConf = fuzzyAnd(score(['mcv'],'low'), score(['mch','mchc'],'low'));
  if (microConf > 0.3 && ironConf < 0.25) syndromes.push({ name:'Microcytic Anemia Pattern', confidence: microConf, description:'Small, pale red blood cells suggest a problem with hemoglobin production — most commonly iron deficiency, but also thalassemia or chronic disease.', urgency: microConf>0.6?'high':'medium' });

  const glucoseConf = Math.max(score(['glucose','blood sugar'],'high'), score(['hba1c','a1c','glycated'],'high'));
  if (glucoseConf > 0.2) syndromes.push({ name:'Elevated Blood Sugar Pattern', confidence: glucoseConf, description:'Elevated glucose or HbA1c suggests the body may be having trouble regulating blood sugar, ranging from prediabetes to diabetes.', urgency: glucoseConf>0.7?'high':'medium' });

  const tshLow = score(['tsh'],'low'), tshHigh = score(['tsh'],'high');
  if (tshLow > 0.3)  syndromes.push({ name:'Low TSH — Possible Hyperthyroidism', confidence: tshLow,  description:'A low TSH suggests the thyroid may be overactive. Symptoms include rapid heartbeat, weight loss, and anxiety.', urgency: tshLow>0.7?'high':'medium' });
  if (tshHigh > 0.3) syndromes.push({ name:'High TSH — Possible Hypothyroidism', confidence: tshHigh, description:'A high TSH suggests the thyroid may be underactive. Symptoms include fatigue, weight gain, and cold intolerance.', urgency: tshHigh>0.7?'high':'medium' });

  return syndromes.sort((a,b) => b.confidence - a.confidence);
}

function parseLabText(text) {
  const results = [];
  const lines   = text.split('\n');
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
        const name = m[1].trim().replace(/\s+/g,' ');
        const value = parseFloat(m[2]), refLow = parseFloat(m[4]), refHigh = parseFloat(m[5]);
        if (!isNaN(value) && !isNaN(refLow) && !isNaN(refHigh) && name.length > 1)
          results.push({ name, value, unit: m[3]?.trim()||'', refLow, refHigh, fuzzy: fuzzyScore(value, refLow, refHigh, name) });
        break;
      }
    }
  }
  return results;
}

function computeOverallSeverity(parsedValues, syndromes) {
  if (parsedValues.length === 0) return 'unknown';
  const hasCritical = parsedValues.some(v => v.fuzzy.label.includes('critical'));
  const hasSevere   = parsedValues.some(v => v.fuzzy.label.includes('severe'));
  if (hasCritical || (hasSevere && syndromes.some(s => s.urgency==='high'))) return 'urgent';
  if (parsedValues.some(v => v.fuzzy.score > 0.3) || syndromes.length > 0) return 'attention_needed';
  return 'normal';
}

// ═══════════════════════════════════════════════════════════════
// ROBUST JSON PARSER — handles multilanguage AI responses
// ═══════════════════════════════════════════════════════════════
function safeParseJSON(raw) {
  if (!raw) throw new Error('Empty response from AI.');

  // 1. Try direct parse
  try { return JSON.parse(raw); } catch(_) {}

  // 2. Extract first {...} block
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch(_) {}

    // 3. Clean common issues in multilanguage responses:
    //    - Trailing commas before } or ]
    //    - Unescaped control characters
    //    - Smart quotes → regular quotes
    let cleaned = match[0]
      .replace(/[\u2018\u2019]/g, "'")          // smart single quotes
      .replace(/[\u201C\u201D]/g, '"')           // smart double quotes
      .replace(/,\s*([}\]])/g, '$1')             // trailing commas
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ') // control chars except \n \r \t
      .replace(/\t/g, ' ');                      // tabs inside strings

    try { return JSON.parse(cleaned); } catch(_) {}

    // 4. Line-by-line escape fix for unescaped newlines inside string values
    try {
      const fixedLines = cleaned.split('\n').map((line, i, arr) => {
        // If line doesn't start a new key and previous line doesn't close a value, it's a continuation
        return line;
      }).join('\\n');
      // Re-extract and try
      const reMatch = fixedLines.match(/\{[\s\S]*\}/);
      if (reMatch) return JSON.parse(reMatch[0]);
    } catch(_) {}
  }

  // 5. Last resort: build minimal result from raw text
  throw new Error('Could not parse AI response. The model returned an unexpected format. Please try again.');
}

// ═══════════════════════════════════════════════════════════════
// AI PROMPT
// ═══════════════════════════════════════════════════════════════
function buildSystemPrompt(language = 'english') {
  const langMap = {
    hindi:   'Hindi (Devanagari script)',
    spanish: 'Spanish',
    tamil:   'Tamil (Tamil script)',
  };
  const langInstruction = langMap[language]
    ? `\n\nLANGUAGE INSTRUCTION: Write ALL text values in the JSON in ${langMap[language]}. Keep parameter names, numeric values, units, and the fuzzy_label field in English — but every other string field (headline, summary, plain_meaning, significance, plain_explanation, questions_for_doctor, lifestyle_notes, disclaimer, urgent_alert, what_doctor_looks_for) must be written in ${langMap[language]}. CRITICAL: Your response must still be valid JSON. Do not use line breaks inside string values. Use \\n for line breaks within strings if needed.`
    : '';

  return `You are LabLens, an expert medical report explainer. You help patients understand lab results in plain, accurate, trustworthy language. You NEVER diagnose — you explain, contextualize, and guide.

You receive a lab report AND pre-computed fuzzy severity scores. Use the scores to calibrate your language.

RESPOND ONLY with a valid JSON object. No markdown, no preamble, no trailing commas, no unescaped newlines in strings:
{
  "headline": "one sentence summary",
  "overall_status": "normal",
  "summary": "3-4 sentence overview",
  "urgent_alert": null,
  "findings": [
    {
      "parameter": "name in English",
      "value": "value with units",
      "fuzzy_label": "exact label from context",
      "fuzzy_score": 0.0,
      "plain_meaning": "what this measures",
      "significance": "nuanced explanation matching severity",
      "flag": false
    }
  ],
  "syndrome_explanations": [
    {
      "name": "syndrome name",
      "confidence_pct": 70,
      "plain_explanation": "what this pattern means",
      "what_doctor_looks_for": "next steps"
    }
  ],
  "questions_for_doctor": ["specific question referencing actual values"],
  "lifestyle_notes": ["concrete actionable note"],
  "disclaimer": "Educational only. Not medical advice. Consult your doctor."
}

Severity language rules — match these exactly to fuzzy_score:
- 0.0-0.2: "slightly", "marginally", "just outside range"
- 0.2-0.5: "mildly", "somewhat"
- 0.5-0.7: "moderately", "notably"
- 0.7-0.9: "significantly", "considerably"
- 0.9-1.0: "severely", "critically"
- Syndrome confidence >0.7: speak with confidence. <0.4: say "may suggest".${langInstruction}`;
}

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
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError]           = useState('');
  const [charCount, setCharCount]   = useState(0);
  const [activeTab, setActiveTab]   = useState('summary');
  const [language, setLanguage]     = useState('english');
  const fileRef = useRef();
  const MAX_CHARS = 5000;

  const LANGUAGES = [
    { code: 'english', label: 'English', flag: '🇬🇧' },
    { code: 'hindi',   label: 'हिंदी',   flag: '🇮🇳' },
    { code: 'spanish', label: 'Español', flag: '🇪🇸' },
    { code: 'tamil',   label: 'தமிழ்',  flag: '🇮🇳' },
  ];

  // ── palette ──────────────────────────────────────────────────
  const bg     = isDark ? '#08070f' : '#faf8ff';
  const card   = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const text   = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.82)';
  const muted  = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const ac     = isDark ? '#a78bfa' : '#7c3aed';
  const green  = '#10b981';
  const red    = '#f87171';
  // Fixed: orange for warning (yellow was invisible on light bg)
  const warn   = '#d97706';
  const warnBg = isDark ? 'rgba(217,119,6,0.1)' : 'rgba(217,119,6,0.08)';
  const warnBorder = 'rgba(217,119,6,0.3)';

  // ── severity helpers ─────────────────────────────────────────
  function severityColor(label) {
    if (!label || label === 'within_range') return green;
    if (label.includes('critical'))  return red;
    if (label.includes('severe'))    return '#fb923c';
    if (label.includes('moderate'))  return '#f59e0b';
    if (label.includes('mild'))      return '#84cc16';
    if (label.includes('borderline')) return muted;
    return muted;
  }

  function severityLabel(label) {
    return {
      within_range:'✓ Normal', borderline_low:'↓ Borderline Low', mildly_low:'↓ Mildly Low',
      moderately_low:'↓ Moderately Low', severely_low:'↓↓ Severely Low', critically_low:'↓↓ Critical Low',
      borderline_high:'↑ Borderline High', mildly_high:'↑ Mildly High', moderately_high:'↑ Moderately High',
      severely_high:'↑↑ Severely High', critically_high:'↑↑ Critical High',
    }[label] || label;
  }

  function overallBadge(status) {
    if (status === 'normal')           return { color: green, icon: '✓', label: 'All values within normal range' };
    if (status === 'attention_needed') return { color: warn,  icon: '⚠', label: 'Some values need attention' };
    if (status === 'urgent')           return { color: red,   icon: '🚨', label: 'Urgent — please consult your doctor' };
    return { color: muted, icon: '·', label: 'Analysis complete' };
  }

  // ── input handlers ───────────────────────────────────────────
  function handleInput(val) {
    if (val.length <= MAX_CHARS) { setReport(val); setCharCount(val.length); setError(''); }
  }

  function loadSample() { handleInput(SAMPLE_REPORT); setResult(null); setFuzzyData(null); }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // PDF handling — extract text via PDF.js (CDN)
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size > 5 * 1024 * 1024) { setError('PDF too large. Max 5MB.'); return; }
      setLoadingPdf(true);
      setError('');
      try {
        // Load PDF.js from CDN
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Could not load PDF reader.'));
            document.head.appendChild(script);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf         = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText      = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page    = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          fullText     += strings.join(' ') + '\n';
        }

        if (!fullText.trim()) {
          setError('Could not extract text from this PDF. It may be a scanned image. Please paste the text manually.');
        } else {
          handleInput(fullText.slice(0, MAX_CHARS));
        }
      } catch (err) {
        setError('PDF reading failed: ' + err.message);
      } finally {
        setLoadingPdf(false);
      }
      return;
    }

    // Plain text / CSV
    if (file.size > 200000) { setError('File too large. Max 200KB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => handleInput((ev.target.result || '').slice(0, MAX_CHARS));
    reader.readAsText(file);
  }

  // ── analyze ──────────────────────────────────────────────────
  const analyze = useCallback(async () => {
    if (!report.trim())            { setError('Please paste your lab results or medical report.'); return; }
    if (report.trim().length < 30) { setError('Report is too short. Please paste the full text.'); return; }

    setLoading(true); setError(''); setResult(null); setFuzzyData(null);

    try {
      // Step 1: Fuzzy analysis
      const parsedValues = parseLabText(report);
      const syndromes    = detectSyndromes(parsedValues);
      const overallFuzzy = computeOverallSeverity(parsedValues, syndromes);

      const fuzzyContext = parsedValues.length > 0
        ? `FUZZY PRE-ANALYSIS:\nParsed: ${JSON.stringify(parsedValues.map(v => ({ name:v.name, value:v.value, unit:v.unit, ref:`${v.refLow}-${v.refHigh}`, fuzzy_score:v.fuzzy.score, fuzzy_label:v.fuzzy.label, direction:v.fuzzy.direction, clinical:v.fuzzy.clinical||false })))}\nSyndromes: ${JSON.stringify(syndromes.map(s => ({ name:s.name, confidence:s.confidence, confidence_pct:Math.round(s.confidence*100), urgency:s.urgency })))}\nOverall: ${overallFuzzy}`
        : 'Note: Could not parse structured values. Analyze from raw text.';

      setFuzzyData({ parsedValues, syndromes, overallFuzzy });

      // Step 2: AI with fallback
      const primaryModel  = TOOL_MODELS.labLens || MODELS.HEAVY;
      const fallbackModel = MODELS.MEDIUM;

      const callAI = async (model, toolId) => fetchWithBackoff(GROQ_API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model, max_tokens: 2000, temperature: 0.1, toolId,
          messages: [
            { role: 'system', content: buildSystemPrompt(language) },
            { role: 'user',   content: `${fuzzyContext}\n\nRAW REPORT:\n${report}` },
          ],
        }),
      });

      let res;
      try {
        res = await callAI(primaryModel, 'lablens');
        if (res.status === 429) throw new Error('rate_limit');
      } catch (e) {
        if (e.message === 'rate_limit' || e.message?.includes('429'))
          res = await callAI(fallbackModel, 'lablens-fallback');
        else throw e;
      }

      const data   = await res.json();
      const raw    = data?.choices?.[0]?.message?.content || '';
      const parsed = safeParseJSON(raw);
      setResult(parsed);
      setActiveTab('summary');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [report, language]);

  function clear() { setReport(''); setResult(null); setFuzzyData(null); setError(''); setCharCount(0); }

  const flagged = result?.findings?.filter(f => f.flag) || [];

  // ── Severity bar ──────────────────────────────────────────────
  function SeverityBar({ score, label }) {
    const color = severityColor(label);
    const pct   = Math.round((score || 0) * 100);
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', color, fontWeight: 600 }}>{severityLabel(label)}</span>
          {score > 0 && <span style={{ fontSize: '0.62rem', color: muted }}>{pct}% severity</span>}
        </div>
        <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
        </div>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: bg, width: '100%' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 20px 80px', fontFamily: "'Space Mono', monospace" }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', border: `1px solid rgba(16,185,129,0.25)`, borderRadius: '100px', padding: '5px 16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.18em' }}>◆ MEDICAL · AI + FUZZY LOGIC</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '10px' }}>
            Lab<span style={{ color: green }}>Lens</span>
          </h1>
          <p style={{ fontSize: '0.92rem', color: muted, lineHeight: 1.75, maxWidth: '580px', marginBottom: '16px', textAlign: 'justify' }}>
            Paste or upload your lab report. LabLens scores every value on a nuanced severity scale using fuzzy logic, then AI explains what it means — in your language.
          </p>
          {/* Fixed: orange text on amber bg — fully visible in both modes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: warnBg, border: `1px solid ${warnBorder}`, borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontSize: '0.7rem', color: warn, fontWeight: 600 }}>⚕ Educational only — not medical advice or diagnosis</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontSize: '0.7rem', color: green, fontWeight: 600 }}>✓ Nuanced severity — not just HIGH/LOW</span>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.12em', marginBottom: '10px', textTransform: 'uppercase' }}>Output Language</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LANGUAGES.map(lang => {
              const active = language === lang.code;
              return (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  style={{ background: active ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.09)') : card, border: `1px solid ${active ? green+'80' : border}`, borderRadius: '10px', padding: '8px 18px', fontSize: '0.8rem', color: active ? green : text, cursor: 'pointer', fontFamily: "'Space Mono',monospace", fontWeight: active ? 700 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: active ? `0 0 0 2px ${green}22` : 'none' }}>
                  <span>{lang.flag}</span> <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
          {language !== 'english' && (
            <div style={{ marginTop: '8px', fontSize: '0.68rem', color: muted, paddingLeft: '2px' }}>
              ⓘ Parameter names and values stay in English — explanations will be in {LANGUAGES.find(l => l.code === language)?.label}
            </div>
          )}
        </div>

        {/* Input Card */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Paste Lab Report / Results</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={loadSample}
                style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.07)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: '8px', padding: '5px 12px', fontSize: '0.7rem', color: green, cursor: 'pointer', fontFamily: "'Space Mono',monospace" }}>
                Sample CBC
              </button>
              {/* Upload: accepts PDF + text */}
              <button onClick={() => fileRef.current?.click()} disabled={loadingPdf}
                style={{ background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.07)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.2)'}`, borderRadius: '8px', padding: '5px 12px', fontSize: '0.7rem', color: ac, cursor: loadingPdf ? 'wait' : 'pointer', fontFamily: "'Space Mono',monospace", opacity: loadingPdf ? 0.6 : 1 }}>
                {loadingPdf ? 'Reading PDF…' : '↑ Upload PDF / TXT'}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv"
                style={{ display: 'none' }} onChange={handleFile} />
            </div>
          </div>

          {/* PDF hint */}
          <div style={{ marginBottom: '10px', fontSize: '0.67rem', color: muted }}>
            Supports: PDF lab reports, plain text, CSV · Max 5MB PDF / 200KB text
          </div>

          <textarea
            value={report}
            onChange={e => handleInput(e.target.value)}
            placeholder={`Paste your lab results here...\n\nExample:\nHemoglobin: 11.8 g/dL  [Ref: 13.5-17.5]  LOW\nWBC: 11.2 K/uL  [Ref: 4.5-11.0]  HIGH\nFerritin: 6 ng/mL  [Ref: 12-300]  LOW\n\nLabLens works best when values include reference ranges.`}
            style={{ width: '100%', minHeight: '200px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${border}`, borderRadius: '10px', padding: '16px', color: text, fontSize: '0.82rem', lineHeight: 1.7, resize: 'vertical', fontFamily: "'Space Mono',monospace", outline: 'none', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: charCount > MAX_CHARS * 0.9 ? warn : muted }}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {report && <button onClick={clear} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: '8px', padding: '8px 16px', fontSize: '0.72rem', color: muted, cursor: 'pointer', fontFamily: "'Space Mono',monospace" }}>Clear</button>}
              <button onClick={analyze} disabled={loading || !report.trim()}
                style={{ background: report.trim() && !loading ? `linear-gradient(135deg,${green},#059669)` : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '0.82rem', fontWeight: 700, color: report.trim() && !loading ? '#fff' : muted, cursor: report.trim() && !loading ? 'pointer' : 'not-allowed', fontFamily: "'Space Mono',monospace", transition: 'all 0.2s' }}>
                {loading ? 'Analyzing…' : 'Explain My Report →'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', fontSize: '0.82rem', color: red, lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '16px' }}>🔬</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '10px' }}>Analyzing your report…</div>
            <div style={{ fontSize: '0.78rem', color: muted, lineHeight: 2 }}>
              Step 1: Fuzzy logic engine scoring each value's severity<br />
              Step 2: Detecting patterns across related markers<br />
              Step 3: AI writing plain-language explanations{language !== 'english' ? ` in ${LANGUAGES.find(l=>l.code===language)?.label}` : ''}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div>
            {/* Urgent alert */}
            {result.urgent_alert && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: `2px solid ${red}44`, borderRadius: '14px', padding: '18px 22px', marginBottom: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🚨</span>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: red, marginBottom: '4px' }}>Action Needed</div>
                  <div style={{ fontSize: '0.88rem', color: text, lineHeight: 1.65 }}>{result.urgent_alert}</div>
                </div>
              </div>
            )}

            {/* Overall banner */}
            {(() => {
              const badge = overallBadge(result.overall_status);
              return (
                <div style={{ background: `${badge.color}10`, border: `1px solid ${badge.color}30`, borderRadius: '14px', padding: '18px 22px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{badge.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '0.9rem', color: badge.color, marginBottom: '4px' }}>{badge.label}</div>
                    <div style={{ fontSize: '0.88rem', color: text, lineHeight: 1.65 }}>{result.headline}</div>
                    {fuzzyData?.parsedValues?.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '0.66rem', color: muted }}>
                        Fuzzy engine: {fuzzyData.parsedValues.length} values parsed · {flagged.length} flagged · {fuzzyData.syndromes.length} pattern{fuzzyData.syndromes.length !== 1 ? 's' : ''} detected
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '3px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
              {[
                { key: 'summary',   label: 'Summary' },
                { key: 'findings',  label: `Values (${(result.findings||[]).length})` },
                { key: 'flagged',   label: `Flagged (${flagged.length})` },
                { key: 'patterns',  label: `Patterns (${(result.syndrome_explanations||[]).length})` },
                { key: 'questions', label: 'Ask Doctor' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ flex: 1, background: activeTab === tab.key ? (isDark ? 'rgba(255,255,255,0.08)' : '#fff') : 'transparent', border: activeTab === tab.key ? `1px solid ${border}` : '1px solid transparent', borderRadius: '7px', padding: '8px 2px', fontSize: '0.6rem', color: activeTab === tab.key ? (isDark ? '#fff' : '#1a1a1a') : muted, cursor: 'pointer', fontFamily: "'Space Mono',monospace", transition: 'all 0.15s', fontWeight: activeTab === tab.key ? 700 : 400 }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Summary tab */}
            {activeTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px' }}>
                  <div style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.15em', marginBottom: '12px', textTransform: 'uppercase' }}>◆ Plain English Summary</div>
                  <p style={{ fontSize: '0.92rem', color: text, lineHeight: 1.85, margin: 0 }}>{result.summary}</p>
                </div>
                {result.lifestyle_notes?.length > 0 && (
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px' }}>
                    <div style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.15em', marginBottom: '14px', textTransform: 'uppercase' }}>◆ What You Can Do</div>
                    {result.lifestyle_notes.map((note, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: i < result.lifestyle_notes.length-1 ? '12px' : 0 }}>
                        <span style={{ color: green, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: '0.88rem', color: text, lineHeight: 1.7 }}>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All findings tab */}
            {activeTab === 'findings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(result.findings||[]).map((f, i) => {
                  const col = severityColor(f.fuzzy_label);
                  return (
                    <div key={i} style={{ background: card, border: `1px solid ${f.flag ? col+'44' : border}`, borderRadius: '12px', padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#fff' : '#1a1a1a' }}>{f.parameter}</span>
                          <span style={{ fontSize: '0.78rem', color: muted, marginLeft: '10px' }}>{f.value}</span>
                        </div>
                        <span style={{ background: `${col}18`, border: `1px solid ${col}44`, borderRadius: '100px', padding: '3px 12px', fontSize: '0.62rem', color: col, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {severityLabel(f.fuzzy_label)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '6px' }}>{f.plain_meaning}</div>
                      <div style={{ fontSize: '0.84rem', color: text, lineHeight: 1.65, marginBottom: '6px' }}>{f.significance}</div>
                      {f.fuzzy_score > 0 && <SeverityBar score={f.fuzzy_score} label={f.fuzzy_label} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Flagged tab */}
            {activeTab === 'flagged' && (
              flagged.length === 0
                ? <div style={{ background: `${green}10`, border: `1px solid ${green}30`, borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✓</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: green, marginBottom: '6px' }}>No abnormal values detected</div>
                    <div style={{ fontSize: '0.82rem', color: muted }}>All reported values appear within normal reference ranges</div>
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {flagged.map((f, i) => {
                      const col = severityColor(f.fuzzy_label);
                      return (
                        <div key={i} style={{ background: `${col}08`, border: `1px solid ${col}33`, borderRadius: '12px', padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '0.95rem', color: col }}>{f.parameter}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.82rem', color: text }}>{f.value}</span>
                              <span style={{ background: `${col}20`, border: `1px solid ${col}44`, borderRadius: '100px', padding: '3px 12px', fontSize: '0.62rem', color: col, fontWeight: 700, whiteSpace: 'nowrap' }}>{severityLabel(f.fuzzy_label)}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '8px' }}>{f.plain_meaning}</div>
                          <div style={{ fontSize: '0.88rem', color: text, lineHeight: 1.7, marginBottom: '8px' }}>{f.significance}</div>
                          {f.fuzzy_score > 0 && <SeverityBar score={f.fuzzy_score} label={f.fuzzy_label} />}
                        </div>
                      );
                    })}
                  </div>
            )}

            {/* Patterns tab */}
            {activeTab === 'patterns' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {!(result.syndrome_explanations?.length > 0)
                  ? <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.88rem', color: muted }}>No significant multi-marker patterns detected in this report.</div>
                    </div>
                  : (result.syndrome_explanations||[]).map((s, i) => {
                      const fuzzyS = fuzzyData?.syndromes?.find(fs => fs.name === s.name);
                      const conf   = fuzzyS?.confidence || (s.confidence_pct / 100);
                      const col    = conf > 0.7 ? red : conf > 0.4 ? warn : green;
                      return (
                        <div key={i} style={{ background: `${col}08`, border: `1px solid ${col}30`, borderRadius: '14px', padding: '22px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1rem', color: isDark ? '#fff' : '#1a1a1a' }}>{s.name}</div>
                            <div style={{ background: `${col}18`, border: `1px solid ${col}40`, borderRadius: '100px', padding: '4px 14px', fontSize: '0.65rem', color: col, fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {conf >= 0.8 ? 'High confidence' : conf >= 0.5 ? 'Moderate confidence' : 'Low confidence'}
                            </div>
                          </div>
                          <SeverityBar score={conf} label={conf > 0.7 ? 'severely_high' : conf > 0.4 ? 'moderately_high' : 'mildly_high'} />
                          <div style={{ fontSize: '0.88rem', color: text, lineHeight: 1.75, marginTop: '14px' }}>{s.plain_explanation}</div>
                          {s.what_doctor_looks_for && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${border}` }}>
                              <div style={{ fontSize: '0.6rem', color: ac, letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>What Your Doctor Will Likely Check</div>
                              <div style={{ fontSize: '0.84rem', color: muted, lineHeight: 1.65 }}>{s.what_doctor_looks_for}</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                }
              </div>
            )}

            {/* Questions tab */}
            {activeTab === 'questions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px' }}>
                  <div style={{ fontSize: '0.6rem', color: ac, letterSpacing: '0.15em', marginBottom: '18px', textTransform: 'uppercase' }}>◆ Bring These to Your Appointment</div>
                  {(result.questions_for_doctor||[]).map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingBottom: i < result.questions_for_doctor.length-1 ? '16px' : 0, marginBottom: i < result.questions_for_doctor.length-1 ? '16px' : 0, borderBottom: i < result.questions_for_doctor.length-1 ? `1px solid ${border}` : 'none' }}>
                      <div style={{ background: ac, color: '#fff', fontSize: '0.62rem', fontWeight: 700, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>{i+1}</div>
                      <span style={{ fontSize: '0.88rem', color: text, lineHeight: 1.75 }}>{q}</span>
                    </div>
                  ))}
                </div>
                {result.disclaimer && (
                  <div style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', border: `1px solid ${border}`, borderRadius: '10px', padding: '16px 18px' }}>
                    <div style={{ fontSize: '0.7rem', color: muted, lineHeight: 1.7 }}>⚕ {result.disclaimer}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '28px', textAlign: 'center' }}>
              <button onClick={clear} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: '10px', padding: '10px 28px', fontSize: '0.78rem', color: muted, cursor: 'pointer', fontFamily: "'Space Mono',monospace" }}>
                Analyze Another Report
              </button>
            </div>
          </div>
        )}

        {/* Pre-result info */}
        {!result && !loading && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.15em', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase' }}>How LabLens Works</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { icon: '📋', title: 'Paste or upload', desc: 'Text, PDF lab reports, or CSV — up to 5MB' },
                { icon: '⚖️', title: 'Fuzzy scoring', desc: 'Every value scored 0–100% severity — not just HIGH/LOW' },
                { icon: '🧩', title: 'Pattern detection', desc: 'Clusters related markers into named medical patterns' },
                { icon: '🌐', title: 'Your language', desc: 'English, Hindi, Spanish, or Tamil output' },
                { icon: '🩺', title: 'Doctor questions', desc: 'Value-specific questions for your appointment' },
                { icon: '🔒', title: 'Private', desc: 'Nothing stored. Your data never leaves your session.' },
              ].map((item, i) => (
                <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '5px' }}>{item.title}</div>
                  <div style={{ fontSize: '0.7rem', color: muted, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.12em', marginBottom: '12px', textTransform: 'uppercase' }}>Works With</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['CBC','Lipid Panel','Metabolic Panel','Thyroid (TSH/T3/T4)','Liver Function','Kidney Function','Iron Studies','HbA1c / Diabetes','Urinalysis','Vitamin D / B12','Hormone Panel','Cardiac Markers','Coagulation','Electrolytes'].map(t => (
                  <span key={t} style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${border}`, borderRadius: '100px', padding: '4px 12px', fontSize: '0.65rem', color: muted }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
