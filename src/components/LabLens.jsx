// src/components/LabLens.jsx
// LabLens — AI-powered Lab Report Explainer with Fuzzy Logic Engine
// Uses: Groq AI (llama-3.3-70b) + client-side fuzzy severity scoring

import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, TOOL_MODELS, MODELS } from '../constants';
import { fetchWithBackoff } from '../utils';

// ═══════════════════════════════════════════════════════════════
// FUZZY LOGIC ENGINE
// Computes nuanced severity scores (0–1) for each lab value.
// Goes beyond binary HIGH/LOW to: borderline → mild → moderate
// → severe → critical, using calibrated medical thresholds.
// ═══════════════════════════════════════════════════════════════

// Clinical absolute thresholds — override % deviation for tests
// where the reference range is wide but clinical danger is narrow
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
  const name = paramName.toLowerCase();
  const override = Object.keys(CLINICAL_THRESHOLDS).find(k => name.includes(k));

  // Clinical override check (absolute thresholds)
  if (override) {
    const t = CLINICAL_THRESHOLDS[override];
    if (value < refLow) {
      if (t.criticalLow  !== undefined && value <= t.criticalLow)  return { score: 1.00, label: 'critically_low',  direction: 'low',  clinical: true };
      if (t.severeLow    !== undefined && value <= t.severeLow)    return { score: 0.80, label: 'severely_low',    direction: 'low',  clinical: true };
      if (t.moderateLow  !== undefined && value <= t.moderateLow)  return { score: 0.55, label: 'moderately_low',  direction: 'low',  clinical: true };
    }
    if (value > refHigh) {
      if (t.criticalHigh !== undefined && value >= t.criticalHigh) return { score: 1.00, label: 'critically_high', direction: 'high', clinical: true };
      if (t.severeHigh   !== undefined && value >= t.severeHigh)   return { score: 0.80, label: 'severely_high',   direction: 'high', clinical: true };
    }
  }

  // Within range
  if (value >= refLow && value <= refHigh) {
    return { score: 0, label: 'within_range', direction: 'normal' };
  }

  // % deviation from reference range
  const range = refHigh - refLow || 1;

  if (value < refLow) {
    const dev = (refLow - value) / range;
    if (dev < 0.05)  return { score: +(dev / 0.05 * 0.2).toFixed(3),                    label: 'borderline_low',  direction: 'low' };
    if (dev < 0.15)  return { score: +(0.2 + (dev-0.05)/0.10*0.2).toFixed(3),           label: 'mildly_low',      direction: 'low' };
    if (dev < 0.30)  return { score: +(0.4 + (dev-0.15)/0.15*0.2).toFixed(3),           label: 'moderately_low',  direction: 'low' };
    if (dev < 0.50)  return { score: +(0.6 + (dev-0.30)/0.20*0.2).toFixed(3),           label: 'severely_low',    direction: 'low' };
                     return { score: +Math.min(1, 0.8+(dev-0.50)/0.50*0.2).toFixed(3),  label: 'critically_low',  direction: 'low' };
  }

  const dev = (value - refHigh) / range;
  if (dev < 0.05)  return { score: +(dev / 0.05 * 0.2).toFixed(3),                   label: 'borderline_high',  direction: 'high' };
  if (dev < 0.15)  return { score: +(0.2 + (dev-0.05)/0.10*0.2).toFixed(3),          label: 'mildly_high',      direction: 'high' };
  if (dev < 0.30)  return { score: +(0.4 + (dev-0.15)/0.15*0.2).toFixed(3),          label: 'moderately_high',  direction: 'high' };
  if (dev < 0.50)  return { score: +(0.6 + (dev-0.30)/0.20*0.2).toFixed(3),          label: 'severely_high',    direction: 'high' };
                   return { score: +Math.min(1, 0.8+(dev-0.50)/0.50*0.2).toFixed(3), label: 'critically_high',  direction: 'high' };
}

// Fuzzy AND (minimum rule) — confidence of a syndrome
// requires ALL contributing markers to show the pattern
function fuzzyAnd(...scores) {
  return Math.min(...scores.filter(s => s > 0));
}

// Syndrome detector: clusters related findings into named patterns
function detectSyndromes(parsedValues) {
  const find = (names) => {
    for (const n of names) {
      const hit = parsedValues.find(v => v.name.toLowerCase().includes(n));
      if (hit) return hit;
    }
    return null;
  };
  const score = (names, dir) => {
    const f = find(names);
    if (!f || f.fuzzy.direction !== dir) return 0;
    return f.fuzzy.score;
  };

  const syndromes = [];

  // Iron deficiency anemia
  const ironConf = fuzzyAnd(
    score(['ferritin'], 'low'),
    score(['hemoglobin', 'hgb'], 'low') || score(['mcv'], 'low'),
  );
  const tibcBoost = score(['tibc'], 'high') * 0.3;
  if (ironConf > 0.25) syndromes.push({
    name: 'Iron Deficiency Pattern',
    confidence: Math.min(1, ironConf + tibcBoost),
    description: 'Multiple iron-related markers pointing in the same direction — low ferritin (iron stores), low hemoglobin (oxygen-carrying capacity), low MCV (small red blood cells), and high TIBC (iron-hungry blood) together strongly suggest iron deficiency.',
    urgency: ironConf > 0.7 ? 'high' : 'medium',
  });

  // Infection / inflammation
  const infConf = fuzzyAnd(
    score(['wbc'], 'high'),
    score(['neutrophil'], 'high'),
  );
  if (infConf > 0.2) syndromes.push({
    name: 'Infection / Inflammation Pattern',
    confidence: infConf,
    description: 'Elevated white blood cells and neutrophils together suggest the body is mounting an immune response — typically to a bacterial infection, but also possible with viral infections, stress, or inflammation.',
    urgency: infConf > 0.7 ? 'high' : 'medium',
  });

  // Microcytic anemia (general)
  const microConf = fuzzyAnd(
    score(['mcv'], 'low'),
    score(['mch', 'mchc'], 'low'),
  );
  if (microConf > 0.3 && ironConf < 0.25) syndromes.push({
    name: 'Microcytic Anemia Pattern',
    confidence: microConf,
    description: 'Small, pale red blood cells (low MCV and MCH) suggest a problem with hemoglobin production — most commonly iron deficiency, but also thalassemia or chronic disease.',
    urgency: microConf > 0.6 ? 'high' : 'medium',
  });

  // Diabetes / glucose concern
  const glucoseHigh = score(['glucose', 'blood sugar'], 'high');
  const hba1cHigh   = score(['hba1c', 'a1c', 'glycated'], 'high');
  const glucoseConf = Math.max(glucoseHigh, hba1cHigh);
  if (glucoseConf > 0.2) syndromes.push({
    name: 'Elevated Blood Sugar Pattern',
    confidence: glucoseConf,
    description: 'Elevated glucose or HbA1c suggests the body may be having trouble regulating blood sugar. This can range from prediabetes to diabetes depending on severity and clinical context.',
    urgency: glucoseConf > 0.7 ? 'high' : 'medium',
  });

  // Liver stress
  const liverConf = fuzzyAnd(
    score(['alt', 'sgpt', 'alanine'], 'high') || score(['ast', 'sgot', 'aspartate'], 'high'),
    score(['bilirubin'], 'high') || score(['alkaline', 'alp'], 'high'),
  );
  if (liverConf > 0.25) syndromes.push({
    name: 'Liver Stress Pattern',
    confidence: liverConf,
    description: 'Multiple liver enzymes elevated together may indicate the liver is under stress — from fatty liver, medications, alcohol, viral hepatitis, or other causes.',
    urgency: liverConf > 0.6 ? 'high' : 'medium',
  });

  // Thyroid imbalance
  const tshLow  = score(['tsh'], 'low');
  const tshHigh = score(['tsh'], 'high');
  if (tshLow > 0.3) syndromes.push({
    name: 'Low TSH — Possible Hyperthyroidism',
    confidence: tshLow,
    description: 'A low TSH means the pituitary gland is signaling the thyroid to slow down — suggesting the thyroid may be overactive (hyperthyroidism). Symptoms can include rapid heartbeat, weight loss, and anxiety.',
    urgency: tshLow > 0.7 ? 'high' : 'medium',
  });
  if (tshHigh > 0.3) syndromes.push({
    name: 'High TSH — Possible Hypothyroidism',
    confidence: tshHigh,
    description: 'A high TSH means the pituitary is working hard to stimulate an underactive thyroid — suggesting hypothyroidism. Symptoms can include fatigue, weight gain, and cold intolerance.',
    urgency: tshHigh > 0.7 ? 'high' : 'medium',
  });

  return syndromes.sort((a, b) => b.confidence - a.confidence);
}

// ── Parse lab values from free text ──────────────────────────
// Extracts: parameter name, numeric value, units, and reference range
function parseLabText(text) {
  const results = [];
  const lines = text.split('\n');

  // Pattern: "Hemoglobin: 11.8 g/dL [Ref: 13.5-17.5]" or
  //          "Hemoglobin  11.8  13.5-17.5  LOW"
  const patterns = [
    // "Name: value unit [ref: low-high]" or "Name: value unit (low-high)"
    /([A-Za-z][A-Za-z0-9\s/(),%]+?)\s*[:\t]\s*([\d.]+)\s*([a-zA-Z%/µμ³⁶⁰³\s]*?)\s*[\[(](?:[Rr]ef[:\s]*)?(\d+\.?\d*)\s*[-–to]\s*(\d+\.?\d*)[\])]/,
    // "Name  value  ref_low-ref_high  FLAG"
    /([A-Za-z][A-Za-z0-9\s/(),%]{2,30}?)\s{2,}([\d.]+)\s+([a-zA-Z%/µμK³⁶⁰\s]*?)\s{2,}(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/,
    // "Name value unit Ref: low - high"
    /([A-Za-z][A-Za-z0-9\s/(),%]+?)\s+([\d.]+)\s+([a-zA-Z%/µμK³⁶\s]*?)\s+[Rr]ef[:\s]+(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/,
  ];

  for (const line of lines) {
    if (line.trim().length < 5) continue;
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const name  = match[1].trim().replace(/\s+/g, ' ');
        const value = parseFloat(match[2]);
        const unit  = match[3]?.trim() || '';
        const refLow  = parseFloat(match[4]);
        const refHigh = parseFloat(match[5]);

        if (!isNaN(value) && !isNaN(refLow) && !isNaN(refHigh) && name.length > 1) {
          const fuzzy = fuzzyScore(value, refLow, refHigh, name);
          results.push({ name, value, unit, refLow, refHigh, fuzzy });
        }
        break;
      }
    }
  }

  return results;
}

// ── Overall report severity (fuzzy aggregation) ───────────────
function computeOverallSeverity(parsedValues, syndromes) {
  if (parsedValues.length === 0) return 'unknown';
  const maxScore = Math.max(...parsedValues.map(v => v.fuzzy.score));
  const hasCritical = parsedValues.some(v => v.fuzzy.label.includes('critical'));
  const hasSevere   = parsedValues.some(v => v.fuzzy.label.includes('severe'));
  const highSyndrome = syndromes.some(s => s.urgency === 'high');

  if (hasCritical || (hasSevere && highSyndrome)) return 'urgent';
  if (maxScore > 0.3 || syndromes.length > 0) return 'attention_needed';
  return 'normal';
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
// AI PROMPT — Receives pre-computed fuzzy analysis
// ═══════════════════════════════════════════════════════════════
function buildSystemPrompt(language = 'english') {
  const langInstruction = language === 'english' ? '' :
    language === 'hindi'   ? '\n\nIMPORTANT: Write your ENTIRE response — all text fields in the JSON — in Hindi (Devanagari script). Keep parameter names, units, and medical terms in English for accuracy, but all explanations, summaries, questions, and descriptions must be in Hindi.' :
    language === 'spanish' ? '\n\nIMPORTANT: Write your ENTIRE response — all text fields in the JSON — in Spanish. Keep parameter names, units, and medical terms in English for accuracy, but all explanations, summaries, questions, and descriptions must be in Spanish.' :
    language === 'tamil'   ? '\n\nIMPORTANT: Write your ENTIRE response — all text fields in the JSON — in Tamil (Tamil script). Keep parameter names, units, and medical terms in English for accuracy, but all explanations, summaries, questions, and descriptions must be in Tamil.' : '';
  return `You are LabLens, an expert medical report explainer. You help patients and students understand lab results in plain, accurate, trustworthy language. You NEVER diagnose — you explain, contextualize, and guide.

You will receive a lab report AND a pre-computed fuzzy analysis that has already scored each value's severity (0.0 = normal, 1.0 = critical) and detected syndrome patterns. Use this analysis to write more nuanced, accurate explanations.

Respond ONLY with a valid JSON object — no preamble, no markdown:
{
  "headline": "one sentence plain-English summary of the overall picture",
  "overall_status": "normal" | "attention_needed" | "urgent",
  "summary": "3-4 sentence plain English overview, using the fuzzy severity context provided",
  "urgent_alert": null | "string shown prominently if any values are critical — when to seek care now",
  "findings": [
    {
      "parameter": "parameter name",
      "value": "reported value with units",
      "fuzzy_label": "the fuzzy severity label provided in context — use it exactly",
      "fuzzy_score": 0.0,
      "plain_meaning": "what this measures in simple terms (1 sentence, plain English)",
      "significance": "nuanced explanation that reflects the fuzzy severity — borderline values get 'slightly...' language, severe values get 'significantly...' language. 2-3 sentences.",
      "flag": true | false
    }
  ],
  "syndrome_explanations": [
    {
      "name": "syndrome name from fuzzy analysis",
      "confidence_pct": 85,
      "plain_explanation": "what this pattern means for the patient in plain English, 3-4 sentences",
      "what_doctor_looks_for": "what the doctor will likely investigate or order next"
    }
  ],
  "questions_for_doctor": [
    "specific, value-referenced question the patient should ask — e.g. 'My ferritin is 6 ng/mL — do I need iron supplementation?'"
  ],
  "lifestyle_notes": [
    "concrete, actionable note — not generic advice"
  ],
  "disclaimer": "This explanation is for educational purposes only. It does not constitute medical advice or diagnosis. Always discuss your results with your healthcare provider who has full knowledge of your medical history."
}

Accuracy rules:
- Match your language severity to the fuzzy_score. Score 0.0-0.2: 'slightly', 'marginally'. 0.2-0.5: 'mildly', 'somewhat'. 0.5-0.7: 'moderately', 'notably'. 0.7-0.9: 'significantly', 'considerably'. 0.9-1.0: 'severely', 'critically'.
- For borderline values say things like "Your value of X is just below the reference range and may not be clinically significant on its own."
- Never use alarming language for borderline findings.
- Never reassure falsely for severe findings.
- Syndrome confidence above 0.7: speak with confidence. Below 0.4: say "may suggest" or "is consistent with".${langInstruction}`;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function LabLens() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [report, setReport]       = useState('');
  const [result, setResult]       = useState(null);
  const [fuzzyData, setFuzzyData] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [charCount, setCharCount] = useState(0);
  const [activeTab, setActiveTab]   = useState('summary');
  const [language, setLanguage]     = useState('english');
  const fileRef = useRef();

  const LANGUAGES = [
    { code: 'english', label: 'English', flag: '🇬🇧' },
    { code: 'hindi',   label: 'हिंदी',   flag: '🇮🇳' },
    { code: 'spanish', label: 'Español', flag: '🇪🇸' },
    { code: 'tamil',   label: 'தமிழ்',  flag: '🇮🇳' },
  ];
  const MAX_CHARS = 5000;

  // ── palette ──────────────────────────────────────────────────
  const bg     = isDark ? '#08070f' : '#faf8ff';
  const card   = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const text   = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.82)';
  const muted  = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const ac     = isDark ? '#a78bfa' : '#7c3aed';
  const green  = '#10b981';
  const red    = '#f87171';
  const yellow = '#fbbf24';

  // ── severity color mapping ────────────────────────────────────
  function severityColor(label, score) {
    if (!label || label === 'within_range') return green;
    if (label.includes('critical')) return red;
    if (label.includes('severe'))   return '#fb923c';
    if (label.includes('moderate')) return yellow;
    if (label.includes('mild'))     return '#fde68a';
    if (label.includes('borderline')) return isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
    return muted;
  }

  function severityLabel(label) {
    const map = {
      within_range:    '✓ Normal',
      borderline_low:  '↓ Borderline Low',
      mildly_low:      '↓ Mildly Low',
      moderately_low:  '↓ Moderately Low',
      severely_low:    '↓↓ Severely Low',
      critically_low:  '↓↓ Critical Low',
      borderline_high: '↑ Borderline High',
      mildly_high:     '↑ Mildly High',
      moderately_high: '↑ Moderately High',
      severely_high:   '↑↑ Severely High',
      critically_high: '↑↑ Critical High',
    };
    return map[label] || label;
  }

  function overallBadge(status) {
    if (status === 'normal')           return { color: green,  icon: '✓', label: 'All values within normal range' };
    if (status === 'attention_needed') return { color: yellow, icon: '⚠', label: 'Some values need attention' };
    if (status === 'urgent')           return { color: red,    icon: '🚨', label: 'Urgent — please consult your doctor' };
    return { color: muted, icon: '·', label: 'Analysis complete' };
  }

  function confidenceLabel(conf) {
    if (conf >= 0.8) return 'High confidence';
    if (conf >= 0.5) return 'Moderate confidence';
    return 'Low confidence — may be coincidental';
  }

  // ── input ────────────────────────────────────────────────────
  function handleInput(val) {
    if (val.length <= MAX_CHARS) {
      setReport(val); setCharCount(val.length); setError('');
    }
  }

  function loadSample() { handleInput(SAMPLE_REPORT); setResult(null); setFuzzyData(null); }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100000) { setError('File too large. Max 100KB text file.'); return; }
    const reader = new FileReader();
    reader.onload = ev => handleInput((ev.target.result || '').slice(0, MAX_CHARS));
    reader.readAsText(file);
    e.target.value = '';
  }

  // ── analyze ──────────────────────────────────────────────────
  const analyze = useCallback(async () => {
    if (!report.trim())           { setError('Please paste your lab results or medical report.'); return; }
    if (report.trim().length < 30){ setError('Report is too short. Please paste the full text.'); return; }

    setLoading(true); setError(''); setResult(null); setFuzzyData(null);

    try {
      // Step 1: Client-side fuzzy analysis
      const parsedValues = parseLabText(report);
      const syndromes    = detectSyndromes(parsedValues);
      const overallFuzzy = computeOverallSeverity(parsedValues, syndromes);

      const fuzzyContext = parsedValues.length > 0 ? `
FUZZY PRE-ANALYSIS (use this to calibrate your language):
Parsed values: ${JSON.stringify(parsedValues.map(v => ({
  name: v.name, value: v.value, unit: v.unit,
  ref: `${v.refLow}-${v.refHigh}`,
  fuzzy_score: v.fuzzy.score,
  fuzzy_label: v.fuzzy.label,
  direction: v.fuzzy.direction,
  clinical_override: v.fuzzy.clinical || false,
})), null, 2)}

Detected syndrome patterns: ${JSON.stringify(syndromes.map(s => ({
  name: s.name,
  confidence: s.confidence,
  confidence_pct: Math.round(s.confidence * 100),
  urgency: s.urgency,
  description: s.description,
})), null, 2)}

Computed overall severity: ${overallFuzzy}
` : 'Note: Could not parse structured values from this report. Analyze from raw text.';

      setFuzzyData({ parsedValues, syndromes, overallFuzzy });

      // Step 2: AI call with fuzzy context
      // Fallback: try 70b first, fall back to 8b if rate-limited
      const primaryModel  = TOOL_MODELS.labLens  || MODELS.HEAVY;
      const fallbackModel = MODELS.MEDIUM;

      let res;
      try {
        res = await fetchWithBackoff(GROQ_API_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model:       primaryModel,
            max_tokens:  2000,
            temperature: 0.15,
            toolId:      'lablens',
            messages: [
              { role: 'system', content: buildSystemPrompt(language) },
              { role: 'user',   content: `${fuzzyContext}\n\nRAW LAB REPORT:\n${report}` },
            ],
          }),
        });
        if (res.status === 429) throw new Error('rate_limit');
      } catch (e) {
        if (e.message === 'rate_limit' || e.message?.includes('429')) {
          res = await fetchWithBackoff(GROQ_API_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model:       fallbackModel,
              max_tokens:  2000,
              temperature: 0.15,
              toolId:      'lablens-fallback',
              messages: [
                { role: 'system', content: buildSystemPrompt(language) },
                { role: 'user',   content: `${fuzzyContext}\n\nRAW LAB REPORT:\n${report}` },
              ],
            }),
          });
        } else { throw e; }
      }

      const data = await res.json();
      const raw  = data?.choices?.[0]?.message?.content || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response. Please try again.');
      const parsed = JSON.parse(jsonMatch[0]);
      setResult(parsed);
      setActiveTab('summary');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [report]);

  function clear() { setReport(''); setResult(null); setFuzzyData(null); setError(''); setCharCount(0); }

  const flagged = result?.findings?.filter(f => f.flag) || [];

  // ── Fuzzy severity bar ────────────────────────────────────────
  function SeverityBar({ score, label }) {
    const color = severityColor(label, score);
    const pct   = Math.round((score || 0) * 100);
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.65rem', color: color, fontWeight: 600 }}>{severityLabel(label)}</span>
          {score > 0 && <span style={{ fontSize: '0.62rem', color: muted }}>{pct}% severity</span>}
        </div>
        <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: bg, width: '100%' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 20px 80px', fontFamily: "'Space Mono', monospace" }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)'}`, borderRadius: '100px', padding: '5px 16px', marginBottom: '18px' }}>
            <span style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.18em' }}>◆ MEDICAL · AI + FUZZY LOGIC</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
            Lab<span style={{ color: green }}>Lens</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: muted, lineHeight: 1.75, maxWidth: '600px', marginBottom: '16px' }}>
            Paste your blood work or lab results. LabLens uses a fuzzy logic engine to score every value on a nuanced severity scale — then AI explains what it means in plain English, what patterns it sees, and what to ask your doctor.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontSize: '0.7rem', color: yellow }}>⚕ Educational only — not medical advice or diagnosis</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontSize: '0.7rem', color: green }}>✓ Nuanced severity scoring — not just HIGH/LOW</span>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.12em', marginBottom: '10px' }}>OUTPUT LANGUAGE</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)}
                style={{ background: language === lang.code ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : card, border: `1px solid ${language === lang.code ? green+'66' : border}`, borderRadius: '10px', padding: '8px 16px', fontSize: '0.78rem', color: language === lang.code ? green : muted, cursor: 'pointer', fontFamily: "'Space Mono',monospace", fontWeight: language === lang.code ? 700 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
          {language !== 'english' && (
            <div style={{ marginTop: '8px', fontSize: '0.68rem', color: muted }}>
              ⓘ Medical terms and values stay in English for accuracy — explanations will be in {LANGUAGES.find(l => l.code === language)?.label}
            </div>
          )}
        </div>

        {/* Input Card */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.12em' }}>PASTE LAB REPORT / RESULTS</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={loadSample} style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.07)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: '8px', padding: '5px 12px', fontSize: '0.7rem', color: green, cursor: 'pointer', fontFamily: "'Space Mono',monospace" }}>
                Sample CBC
              </button>
              <button onClick={() => fileRef.current?.click()} style={{ background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.07)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.2)'}`, borderRadius: '8px', padding: '5px 12px', fontSize: '0.7rem', color: ac, cursor: 'pointer', fontFamily: "'Space Mono',monospace" }}>
                Upload .txt
              </button>
              <input ref={fileRef} type="file" accept=".txt,.csv" style={{ display: 'none' }} onChange={handleFile} />
            </div>
          </div>

          <textarea
            value={report}
            onChange={e => handleInput(e.target.value)}
            placeholder={`Paste your lab results here — copy directly from your patient portal or report PDF...\n\nExample:\nHemoglobin: 11.8 g/dL  [Ref: 13.5-17.5]  LOW\nWBC: 11.2 K/uL  [Ref: 4.5-11.0]  HIGH\nFerritin: 6 ng/mL  [Ref: 12-300]  LOW\n\nLabLens works best when values include reference ranges.`}
            style={{ width: '100%', minHeight: '200px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${border}`, borderRadius: '10px', padding: '16px', color: text, fontSize: '0.82rem', lineHeight: 1.7, resize: 'vertical', fontFamily: "'Space Mono',monospace", outline: 'none', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: charCount > MAX_CHARS * 0.9 ? yellow : muted }}>
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
        {error && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', fontSize: '0.82rem', color: red }}>{error}</div>}

        {/* Loading */}
        {loading && (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '16px' }}>🔬</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '10px' }}>Analyzing your report…</div>
            <div style={{ fontSize: '0.78rem', color: muted, lineHeight: 1.9 }}>
              Step 1: Fuzzy logic engine scoring each value's severity<br />
              Step 2: Detecting patterns across related markers<br />
              Step 3: AI writing plain-English explanations
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
                      <div style={{ marginTop: '8px', fontSize: '0.68rem', color: muted }}>
                        Fuzzy engine parsed {fuzzyData.parsedValues.length} value{fuzzyData.parsedValues.length !== 1 ? 's' : ''} · {flagged.length} flagged · {fuzzyData.syndromes.length} pattern{fuzzyData.syndromes.length !== 1 ? 's' : ''} detected
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
              {[
                { key: 'summary',   label: 'Summary' },
                { key: 'findings',  label: `Values (${(result.findings||[]).length})` },
                { key: 'flagged',   label: `Flagged (${flagged.length})` },
                { key: 'patterns',  label: `Patterns (${(result.syndrome_explanations||[]).length})` },
                { key: 'questions', label: 'Ask Doctor' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ flex: 1, background: activeTab === tab.key ? (isDark ? 'rgba(255,255,255,0.08)' : '#fff') : 'transparent', border: activeTab === tab.key ? `1px solid ${border}` : '1px solid transparent', borderRadius: '8px', padding: '8px 2px', fontSize: '0.6rem', color: activeTab === tab.key ? (isDark ? '#fff' : '#1a1a1a') : muted, cursor: 'pointer', fontFamily: "'Space Mono',monospace", transition: 'all 0.15s' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Summary */}
            {activeTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px' }}>
                  <div style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.15em', marginBottom: '12px' }}>◆ PLAIN ENGLISH SUMMARY</div>
                  <p style={{ fontSize: '0.92rem', color: text, lineHeight: 1.85, margin: 0 }}>{result.summary}</p>
                </div>
                {result.lifestyle_notes?.length > 0 && (
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px' }}>
                    <div style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.15em', marginBottom: '14px' }}>◆ WHAT YOU CAN DO</div>
                    {result.lifestyle_notes.map((note, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: i < result.lifestyle_notes.length - 1 ? '12px' : 0 }}>
                        <span style={{ color: green, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: '0.88rem', color: text, lineHeight: 1.7 }}>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All findings */}
            {activeTab === 'findings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(result.findings||[]).map((f, i) => {
                  const col = severityColor(f.fuzzy_label, f.fuzzy_score);
                  return (
                    <div key={i} style={{ background: card, border: `1px solid ${f.flag ? col+'44' : border}`, borderRadius: '12px', padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#fff' : '#1a1a1a' }}>{f.parameter}</span>
                          <span style={{ fontSize: '0.78rem', color: muted, marginLeft: '10px' }}>{f.value}</span>
                        </div>
                        <span style={{ background: `${col}18`, border: `1px solid ${col}44`, borderRadius: '100px', padding: '3px 12px', fontSize: '0.62rem', color: col, fontWeight: 700 }}>
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

            {/* Flagged */}
            {activeTab === 'flagged' && (
              flagged.length === 0 ? (
                <div style={{ background: `${green}10`, border: `1px solid ${green}30`, borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✓</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: green, marginBottom: '6px' }}>No abnormal values detected</div>
                  <div style={{ fontSize: '0.82rem', color: muted }}>All reported values appear within normal reference ranges</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {flagged.map((f, i) => {
                    const col = severityColor(f.fuzzy_label, f.fuzzy_score);
                    return (
                      <div key={i} style={{ background: `${col}08`, border: `1px solid ${col}33`, borderRadius: '12px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '0.95rem', color: col }}>{f.parameter}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.82rem', color: text }}>{f.value}</span>
                            <span style={{ background: `${col}20`, border: `1px solid ${col}44`, borderRadius: '100px', padding: '3px 12px', fontSize: '0.62rem', color: col, fontWeight: 700 }}>{severityLabel(f.fuzzy_label)}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '8px' }}>{f.plain_meaning}</div>
                        <div style={{ fontSize: '0.88rem', color: text, lineHeight: 1.7, marginBottom: '8px' }}>{f.significance}</div>
                        {f.fuzzy_score > 0 && <SeverityBar score={f.fuzzy_score} label={f.fuzzy_label} />}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Patterns */}
            {activeTab === 'patterns' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(result.syndrome_explanations||[]).length === 0 ? (
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.88rem', color: muted }}>No significant multi-marker patterns detected in this report.</div>
                  </div>
                ) : (result.syndrome_explanations||[]).map((s, i) => {
                  const fuzzyS = fuzzyData?.syndromes?.find(fs => fs.name === s.name);
                  const conf   = fuzzyS?.confidence || (s.confidence_pct / 100);
                  const col    = conf > 0.7 ? red : conf > 0.4 ? yellow : green;
                  return (
                    <div key={i} style={{ background: `${col}08`, border: `1px solid ${col}30`, borderRadius: '14px', padding: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1rem', color: isDark ? '#fff' : '#1a1a1a' }}>{s.name}</div>
                        <div style={{ background: `${col}18`, border: `1px solid ${col}40`, borderRadius: '100px', padding: '4px 14px', fontSize: '0.65rem', color: col, fontWeight: 700 }}>
                          {confidenceLabel(conf)}
                        </div>
                      </div>
                      <SeverityBar score={conf} label={conf > 0.7 ? 'severely_high' : conf > 0.4 ? 'moderately_high' : 'mildly_high'} />
                      <div style={{ fontSize: '0.88rem', color: text, lineHeight: 1.75, marginTop: '14px' }}>{s.plain_explanation}</div>
                      {s.what_doctor_looks_for && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${border}` }}>
                          <div style={{ fontSize: '0.65rem', color: ac, letterSpacing: '0.1em', marginBottom: '6px' }}>WHAT YOUR DOCTOR WILL LIKELY CHECK</div>
                          <div style={{ fontSize: '0.84rem', color: muted, lineHeight: 1.65 }}>{s.what_doctor_looks_for}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Questions */}
            {activeTab === 'questions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px' }}>
                  <div style={{ fontSize: '0.6rem', color: ac, letterSpacing: '0.15em', marginBottom: '18px' }}>◆ BRING THESE TO YOUR APPOINTMENT</div>
                  {(result.questions_for_doctor||[]).map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingBottom: i < result.questions_for_doctor.length - 1 ? '16px' : 0, marginBottom: i < result.questions_for_doctor.length - 1 ? '16px' : 0, borderBottom: i < result.questions_for_doctor.length - 1 ? `1px solid ${border}` : 'none' }}>
                      <div style={{ background: ac, color: '#fff', fontSize: '0.62rem', fontWeight: 700, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>{i + 1}</div>
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
            <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.15em', marginBottom: '16px', textAlign: 'center' }}>HOW LABLENS WORKS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { icon: '📋', title: 'Paste your report', desc: 'Copy from patient portal, PDF, or photo-to-text' },
                { icon: '⚖️', title: 'Fuzzy scoring', desc: 'Every value scored 0–100% severity — not just HIGH/LOW' },
                { icon: '🧩', title: 'Pattern detection', desc: 'Clusters related markers into named medical patterns' },
                { icon: '🤖', title: 'AI explanation', desc: 'Language calibrated to actual severity — mild vs critical get different words' },
                { icon: '🩺', title: 'Doctor questions', desc: 'Value-specific questions for your appointment' },
                { icon: '🔒', title: 'Private', desc: 'Nothing is stored. Your data never leaves your session.' },
              ].map((item, i) => (
                <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '5px' }}>{item.title}</div>
                  <div style={{ fontSize: '0.7rem', color: muted, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.12em', marginBottom: '12px' }}>WORKS WITH</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['CBC', 'Lipid Panel', 'Metabolic Panel', 'Thyroid (TSH/T3/T4)', 'Liver Function', 'Kidney Function', 'Iron Studies', 'HbA1c / Diabetes', 'Urinalysis', 'Vitamin D / B12', 'Hormone Panel', 'Cardiac Markers', 'Coagulation', 'Electrolytes'].map(t => (
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
