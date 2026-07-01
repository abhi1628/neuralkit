// src/components/LabLens.jsx
// LabLens v5 — Accuracy upgrade + Chinese + field-by-field translation + AI opinion wording
import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, TOOL_MODELS, MODELS } from '../constants';
import { fetchWithBackoff } from '../utils';

// ═══════════════════════════════════════════════════════════════
// FUZZY LOGIC ENGINE v2 — age/sex aware reference ranges
// ═══════════════════════════════════════════════════════════════
const CLINICAL_THRESHOLDS = {
  hemoglobin:  { criticalLow:7.0,  severeLow:9.0,   moderateLow:11.0 },
  hgb:         { criticalLow:7.0,  severeLow:9.0,   moderateLow:11.0 },
  ferritin:    { criticalLow:5.0,  severeLow:10.0,  moderateLow:20.0 },
  glucose:     { criticalLow:50,   criticalHigh:500, severeHigh:350   },
  potassium:   { criticalLow:2.5,  criticalHigh:6.5 },
  sodium:      { criticalLow:120,  criticalHigh:155 },
  platelets:   { criticalLow:50,   severeLow:100,   criticalHigh:1000 },
  wbc:         { criticalLow:1.0,  criticalHigh:30.0 },
  creatinine:  { criticalHigh:10.0, severeHigh:5.0 },
  tsh:         { criticalLow:0.01, criticalHigh:10.0 },
  hba1c:       { severeHigh:10.0,  moderateHigh:8.0 },
  troponin:    { criticalHigh:0.4, severeHigh:0.1 },
  inr:         { criticalHigh:5.0, severeHigh:3.5 },
};

// Age/sex adjusted reference ranges for key parameters
function getAdjustedRef(paramName, defaultLow, defaultHigh, patientInfo) {
  const name = paramName.toLowerCase();
  const { age, sex } = patientInfo || {};
  if (!age && !sex) return { refLow: defaultLow, refHigh: defaultHigh };

  // Hemoglobin: sex-specific ranges
  if ((name.includes('hemoglobin') || name === 'hgb') && sex) {
    if (sex === 'female') return { refLow: 12.0, refHigh: 16.0 };
    if (sex === 'male')   return { refLow: 13.5, refHigh: 17.5 };
  }
  // Hematocrit
  if (name.includes('hematocrit') && sex) {
    if (sex === 'female') return { refLow: 36, refHigh: 48 };
    if (sex === 'male')   return { refLow: 41, refHigh: 53 };
  }
  // Ferritin: sex-specific (women have lower stores normally)
  if (name.includes('ferritin') && sex) {
    if (sex === 'female') return { refLow: 12, refHigh: 150 };
    if (sex === 'male')   return { refLow: 30, refHigh: 300 };
  }
  // Creatinine: sex-specific
  if (name.includes('creatinine') && sex) {
    if (sex === 'female') return { refLow: 0.5, refHigh: 1.1 };
    if (sex === 'male')   return { refLow: 0.7, refHigh: 1.3 };
  }
  // TSH: slightly higher upper limit in elderly
  if (name.includes('tsh') && age && age > 70) {
    return { refLow: defaultLow || 0.4, refHigh: 6.0 };
  }
  return { refLow: defaultLow, refHigh: defaultHigh };
}

function fuzzyScore(value, refLow, refHigh, paramName = '') {
  const name = paramName.toLowerCase();
  const override = Object.keys(CLINICAL_THRESHOLDS).find(k => name.includes(k));
  if (override) {
    const t = CLINICAL_THRESHOLDS[override];
    if (value < refLow) {
      if (t.criticalLow  !== undefined && value <= t.criticalLow)  return { score:1.00, label:'critically_low',  direction:'low',  clinical:true };
      if (t.severeLow    !== undefined && value <= t.severeLow)    return { score:0.80, label:'severely_low',    direction:'low',  clinical:true };
      if (t.moderateLow  !== undefined && value <= t.moderateLow)  return { score:0.55, label:'moderately_low',  direction:'low',  clinical:true };
    }
    if (value > refHigh) {
      if (t.criticalHigh !== undefined && value >= t.criticalHigh) return { score:1.00, label:'critically_high', direction:'high', clinical:true };
      if (t.severeHigh   !== undefined && value >= t.severeHigh)   return { score:0.80, label:'severely_high',   direction:'high', clinical:true };
      if (t.moderateHigh !== undefined && value >= t.moderateHigh) return { score:0.55, label:'moderately_high', direction:'high', clinical:true };
    }
  }
  if (value >= refLow && value <= refHigh) return { score:0, label:'within_range', direction:'normal' };
  const range = refHigh - refLow || 1;
  if (value < refLow) {
    const dev = (refLow - value) / range;
    if (dev < 0.05) return { score:+(dev/0.05*0.2).toFixed(3),                   label:'borderline_low',  direction:'low' };
    if (dev < 0.15) return { score:+(0.2+(dev-0.05)/0.10*0.2).toFixed(3),        label:'mildly_low',      direction:'low' };
    if (dev < 0.30) return { score:+(0.4+(dev-0.15)/0.15*0.2).toFixed(3),        label:'moderately_low',  direction:'low' };
    if (dev < 0.50) return { score:+(0.6+(dev-0.30)/0.20*0.2).toFixed(3),        label:'severely_low',    direction:'low' };
                    return { score:+Math.min(1,0.8+(dev-0.50)/0.50*0.2).toFixed(3), label:'critically_low', direction:'low' };
  }
  const dev = (value - refHigh) / range;
  if (dev < 0.05) return { score:+(dev/0.05*0.2).toFixed(3),                     label:'borderline_high', direction:'high' };
  if (dev < 0.15) return { score:+(0.2+(dev-0.05)/0.10*0.2).toFixed(3),          label:'mildly_high',     direction:'high' };
  if (dev < 0.30) return { score:+(0.4+(dev-0.15)/0.15*0.2).toFixed(3),          label:'moderately_high', direction:'high' };
  if (dev < 0.50) return { score:+(0.6+(dev-0.30)/0.20*0.2).toFixed(3),          label:'severely_high',   direction:'high' };
                  return { score:+Math.min(1,0.8+(dev-0.50)/0.50*0.2).toFixed(3), label:'critically_high', direction:'high' };
}

function fuzzyAnd(...scores) { return Math.min(...scores.filter(s => s > 0)); }

function detectSyndromes(parsedValues) {
  const find  = names => { for (const n of names) { const h=parsedValues.find(v=>v.name.toLowerCase().includes(n)); if(h) return h; } return null; };
  const score = (names,dir) => { const f=find(names); return (!f||f.fuzzy.direction!==dir)?0:f.fuzzy.score; };
  const syndromes = [];

  // Iron deficiency anemia
  const ironConf = fuzzyAnd(score(['ferritin'],'low'), score(['hemoglobin','hgb'],'low')||score(['mcv'],'low'));
  if (ironConf>0.25) syndromes.push({ name:'Iron Deficiency Pattern', confidence:Math.min(1,ironConf+score(['tibc'],'high')*0.3), urgency:ironConf>0.7?'high':'medium',
    clinical_note:'Iron deficiency is the most common nutritional deficiency globally. Low ferritin = depleted iron stores. Low MCV = small red blood cells from insufficient hemoglobin.' });

  // Bacterial infection / inflammation
  const infConf = fuzzyAnd(score(['wbc'],'high'), score(['neutrophil'],'high'));
  if (infConf>0.2) syndromes.push({ name:'Infection / Inflammation Pattern', confidence:infConf, urgency:infConf>0.7?'high':'medium',
    clinical_note:'Elevated WBC with high neutrophils is the classic immune response to bacterial infection, though stress and steroids can also cause this.' });

  // Microcytic anemia (not iron-related)
  const microConf = fuzzyAnd(score(['mcv'],'low'), score(['mch','mchc'],'low'));
  if (microConf>0.3 && ironConf<0.25) syndromes.push({ name:'Microcytic Anemia Pattern', confidence:microConf, urgency:microConf>0.6?'high':'medium',
    clinical_note:'Small red blood cells without low ferritin may indicate thalassemia trait or anemia of chronic disease.' });

  // Diabetes / glucose
  const glucoseConf = Math.max(score(['glucose','blood sugar'],'high'), score(['hba1c','a1c','glycated'],'high'));
  if (glucoseConf>0.2) syndromes.push({ name:'Elevated Blood Sugar Pattern', confidence:glucoseConf, urgency:glucoseConf>0.7?'high':'medium',
    clinical_note:'Fasting glucose above 126 mg/dL on two occasions meets diabetes criteria. HbA1c above 6.5% reflects 3-month average blood sugar control.' });

  // Liver stress
  const liverConf = Math.max(
    fuzzyAnd(score(['alt','sgpt','alanine'],'high'), score(['ast','sgot'],'high')),
    fuzzyAnd(score(['bilirubin'],'high'), score(['alt','alp','alkaline'],'high'))
  );
  if (liverConf>0.25) syndromes.push({ name:'Liver Stress Pattern', confidence:liverConf, urgency:liverConf>0.6?'high':'medium',
    clinical_note:'Multiple liver enzymes elevated together may indicate fatty liver, medication effect, viral hepatitis, or alcohol-related injury.' });

  // Kidney function
  const kidneyConf = fuzzyAnd(score(['creatinine'],'high'), score(['urea','bun'],'high')||score(['egfr'],'low'));
  if (kidneyConf>0.3) syndromes.push({ name:'Kidney Function Concern', confidence:kidneyConf, urgency:kidneyConf>0.6?'high':'medium',
    clinical_note:'Elevated creatinine with high BUN/urea suggests the kidneys are not filtering waste efficiently. Dehydration is the most common benign cause.' });

  // Thyroid
  const tshLow=score(['tsh'],'low'), tshHigh=score(['tsh'],'high');
  if (tshLow>0.3)  syndromes.push({ name:'Low TSH — Possible Hyperthyroidism', confidence:tshLow,  urgency:tshLow>0.7?'high':'medium',
    clinical_note:'Low TSH means the pituitary is suppressing thyroid stimulation — suggesting the thyroid is overproducing hormones.' });
  if (tshHigh>0.3) syndromes.push({ name:'High TSH — Possible Hypothyroidism', confidence:tshHigh, urgency:tshHigh>0.7?'high':'medium',
    clinical_note:'High TSH means the pituitary is working harder to stimulate an underactive thyroid.' });

  // Lipid risk
  const lipidConf = Math.max(score(['ldl','low-density'],'high'), score(['cholesterol','total chol'],'high'));
  if (lipidConf>0.3) syndromes.push({ name:'Elevated Cardiovascular Risk Markers', confidence:lipidConf, urgency:lipidConf>0.6?'high':'medium',
    clinical_note:'High LDL cholesterol is a major modifiable risk factor for heart disease and stroke. Context matters — total risk depends on HDL, blood pressure, smoking, and diabetes.' });

  return syndromes.sort((a,b)=>b.confidence-a.confidence);
}

function parseLabText(text, patientInfo) {
  const results=[], lines=text.split('\n');
  const patterns=[
    /([A-Za-z][A-Za-z0-9\s/(),%]+?)\s*[:\t]\s*([\d.]+)\s*([a-zA-Z%/µμ³⁶⁰³\s]*?)\s*[\[(](?:[Rr]ef[:\s]*)?(\d+\.?\d*)\s*[-–to]\s*(\d+\.?\d*)[\])]/,
    /([A-Za-z][A-Za-z0-9\s/(),%]{2,30}?)\s{2,}([\d.]+)\s+([a-zA-Z%/µμK³⁶⁰\s]*?)\s{2,}(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/,
    /([A-Za-z][A-Za-z0-9\s/(),%]+?)\s+([\d.]+)\s+([a-zA-Z%/µμK³⁶\s]*?)\s+[Rr]ef[:\s]+(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/,
  ];
  for (const line of lines) {
    if (line.trim().length<5) continue;
    for (const pattern of patterns) {
      const m=line.match(pattern);
      if (m) {
        const name=m[1].trim().replace(/\s+/g,' ');
        const value=parseFloat(m[2]);
        let refLow=parseFloat(m[4]), refHigh=parseFloat(m[5]);
        if (!isNaN(value)&&!isNaN(refLow)&&!isNaN(refHigh)&&name.length>1) {
          // Apply age/sex adjusted ranges if available
          const adj=getAdjustedRef(name, refLow, refHigh, patientInfo);
          refLow=adj.refLow; refHigh=adj.refHigh;
          results.push({ name, value, unit:m[3]?.trim()||'', refLow, refHigh, fuzzy:fuzzyScore(value,refLow,refHigh,name) });
        }
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
  if (!raw) throw new Error('Empty response.');

  // Strip a completed <think>...</think> reasoning block (some models always emit one)
  raw = raw.replace(/<think>[\s\S]*?<\/think>/i, '').trim();

  // If a <think> tag is still open, the response got cut off mid-reasoning —
  // there is no JSON to recover. Fail fast with a clear message instead of
  // letting the brace-search below grab garbage from inside the thinking text.
  if (/<think>/i.test(raw)) {
    throw new Error('Model response was truncated during reasoning (no JSON produced).');
  }

  // Find first { — everything before is garbage (preamble, etc.)
  const firstBrace = raw.indexOf('{');
  if (firstBrace === -1) throw new Error('No JSON found.');

  let jsonStr = raw.slice(firstBrace);

  // Find last } — everything after is garbage
  const lastBrace = jsonStr.lastIndexOf('}');
  if (lastBrace === -1) throw new Error('No JSON closing brace found.');

  jsonStr = jsonStr.slice(0, lastBrace + 1);

  // Cleanup
  jsonStr = jsonStr
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*?)'/g, ':"$1"')
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ');

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Could not parse response. Please try again.');
  }
}

// ═══════════════════════════════════════════════════════════════
// AI PROMPTS
// ═══════════════════════════════════════════════════════════════
function buildAnalysisPrompt(patientInfo) {
  const patientContext = patientInfo?.age || patientInfo?.sex
    ? `Patient: ${patientInfo.age ? `age ${patientInfo.age}` : ''}${patientInfo.sex ? `, ${patientInfo.sex}` : ''}.`
    : '';

  return `You are a medical report explainer. Output ONLY valid JSON. No thinking, no explanations, no markdown.

${patientContext}

Rules:
- Use fuzzy_score (0-1) to calibrate language severity
- Borderline (<0.2): "may not be clinically significant"
- Critical (>0.9): include in urgent_alert
- plain_meaning: one sentence explaining the test
- significance: calibrated to actual severity

Required JSON fields: headline, overall_status (normal/attention_needed/urgent), summary, urgent_alert, findings (array with parameter, value, fuzzy_label, fuzzy_score, plain_meaning, significance, flag), syndrome_explanations (name, confidence_pct, plain_explanation, what_doctor_looks_for), questions_for_doctor, lifestyle_notes, ai_opinion_note.`;
}

// ── Field-by-field translation — no JSON structure to corrupt ──
async function translateFields(englishResult, targetLang, callAI, primaryModel, fallbackModel, onProgress) {
  // Collect all text that needs translation
  const fields = {
    headline:    englishResult.headline || '',
    summary:     englishResult.summary || '',
    urgent_alert: englishResult.urgent_alert || '',
    // findings: array of [plain_meaning, significance] pairs
    findings: (englishResult.findings||[]).map(f => `MEANING: ${f.plain_meaning}\nSIGNIFICANCE: ${f.significance}`).join('\n---\n'),
    // syndromes: array of [plain_explanation, what_doctor] pairs
    syndromes: (englishResult.syndrome_explanations||[]).map(s => `EXPLANATION: ${s.plain_explanation}\nDOCTOR: ${s.what_doctor_looks_for}`).join('\n---\n'),
    questions: (englishResult.questions_for_doctor||[]).join('\n'),
    lifestyle: (englishResult.lifestyle_notes||[]).join('\n'),
  };

  const systemMsg = `You are a precise medical translator. Translate each section from English to ${targetLang}. Keep all medical terms, parameter names, and numeric values in English. Translate only the explanatory prose. Output ONLY the translated text in the EXACT same format as input — same section labels (MEANING:, SIGNIFICANCE:, EXPLANATION:, DOCTOR:, ---), same line breaks.`;

  const results = {};

  // Translate each field group independently — if one fails, others still work
  const fieldKeys = Object.keys(fields);
  let stepNum = 0;
  for (const [key, val] of Object.entries(fields)) {
    stepNum++;
    if (onProgress) onProgress(stepNum, fieldKeys.length);
    if (!val) { results[key] = val; continue; }
    try {
      let res;
      try {
        res = await callAI(primaryModel, `lablens-trans-${key}`, [
          { role:'system', content: systemMsg },
          { role:'user',   content: val },
        ]);
        if (res.status === 429) throw new Error('rate_limit');
      } catch(e) {
        if (e.message==='rate_limit'||e.message?.includes('429'))
          res = await callAI(fallbackModel, `lablens-trans-${key}-fb`, [
            { role:'system', content: systemMsg },
            { role:'user',   content: val },
          ]);
        else throw e;
      }
      const data = await res.json();
      results[key] = data?.choices?.[0]?.message?.content?.trim() || val;
    } catch(_) {
      results[key] = val; // Keep English on failure
    }
  }

  // Reassemble findings
  const findingLines = results.findings ? results.findings.split('\n---\n') : [];
  const mergedFindings = (englishResult.findings||[]).map((f,i) => {
    const block = findingLines[i] || '';
    const meaningMatch = block.match(/MEANING:\s*(.+?)(?:\n|$)/);
    const sigMatch     = block.match(/SIGNIFICANCE:\s*([\s\S]+?)(?:\n---|\n?$)/);
    return {
      ...f,
      plain_meaning: meaningMatch?.[1]?.trim() || f.plain_meaning,
      significance:  sigMatch?.[1]?.trim()     || f.significance,
    };
  });

  // Reassemble syndromes
  const syndromeLines = results.syndromes ? results.syndromes.split('\n---\n') : [];
  const mergedSyndromes = (englishResult.syndrome_explanations||[]).map((s,i) => {
    const block = syndromeLines[i] || '';
    const expMatch    = block.match(/EXPLANATION:\s*([\s\S]+?)(?:\nDOCTOR:|\n?$)/);
    const doctorMatch = block.match(/DOCTOR:\s*([\s\S]+?)(?:\n---|\n?$)/);
    return {
      ...s,
      plain_explanation:     expMatch?.[1]?.trim()    || s.plain_explanation,
      what_doctor_looks_for: doctorMatch?.[1]?.trim() || s.what_doctor_looks_for,
    };
  });

  return {
    ...englishResult,
    headline:    results.headline || englishResult.headline,
    summary:     results.summary  || englishResult.summary,
    urgent_alert: results.urgent_alert || englishResult.urgent_alert,
    findings:    mergedFindings,
    syndrome_explanations: mergedSyndromes,
    questions_for_doctor: results.questions ? results.questions.split('\n').filter(Boolean) : englishResult.questions_for_doctor,
    lifestyle_notes: results.lifestyle ? results.lifestyle.split('\n').filter(Boolean) : englishResult.lifestyle_notes,
  };
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE CONFIG — 5 languages with AI opinion note
// ═══════════════════════════════════════════════════════════════
const LANG_CONFIG = {
  english: {
    flag:'🇬🇧', nativeLabel:'English', targetLang:null,
    uploadHint:'Upload your lab report — PDF, text, or CSV in any language',
    analyzeBtn:'Explain My Report →',
    step3:'AI writing plain-language explanations',
    opinionNote:'These results and suggestions are AI opinions based on standard reference ranges. They are not a substitute for professional medical judgment. Please consult your doctor before making any health decisions.',
  },
  hindi: {
    flag:'🇮🇳', nativeLabel:'हिंदी', targetLang:'Hindi (Devanagari script)',
    uploadHint:'अपनी लैब रिपोर्ट अपलोड करें — किसी भी भाषा में PDF, टेक्स्ट या CSV',
    analyzeBtn:'मेरी रिपोर्ट समझाएं →',
    step3:'AI हिंदी में स्पष्टीकरण तैयार कर रहा है',
    opinionNote:'ये परिणाम और सुझाव मानक संदर्भ सीमाओं पर आधारित AI की राय हैं। ये पेशेवर चिकित्सीय निर्णय का विकल्प नहीं हैं। कोई भी स्वास्थ्य निर्णय लेने से पहले अपने डॉक्टर से परामर्श करें।',
  },
  spanish: {
    flag:'🇪🇸', nativeLabel:'Español', targetLang:'Spanish',
    uploadHint:'Suba su informe — PDF, texto o CSV en cualquier idioma',
    analyzeBtn:'Explicar mi informe →',
    step3:'IA escribiendo explicaciones en Español',
    opinionNote:'Estos resultados y sugerencias son opiniones de IA basadas en rangos de referencia estándar. No sustituyen el criterio médico profesional. Consulte a su médico antes de tomar decisiones de salud.',
  },
  tamil: {
    flag:'🇮🇳', nativeLabel:'தமிழ்', targetLang:'Tamil (Tamil script)',
    uploadHint:'உங்கள் அறிக்கையை பதிவேற்றவும் — எந்த மொழியிலும் PDF, உரை அல்லது CSV',
    analyzeBtn:'என் அறிக்கையை விளக்கு →',
    step3:'AI தமிழில் விளக்கங்கள் தயாரிக்கிறது',
    opinionNote:'இந்த முடிவுகளும் பரிந்துரைகளும் நிலையான குறிப்பு மதிப்புகளின் அடிப்படையிலான AI கருத்துகள். இவை மருத்துவ நிபுணரின் தீர்ப்பிற்கு மாற்றாகாது. எந்த உடல்நல முடிவும் எடுப்பதற்கு முன் உங்கள் மருத்துவரை அணுகவும்.',
  },
  chinese: {
    flag:'🇨🇳', nativeLabel:'中文', targetLang:'Simplified Chinese (Mandarin)',
    uploadHint:'上传您的检验报告 — 支持任何语言的PDF、文本或CSV',
    analyzeBtn:'解释我的报告 →',
    step3:'AI正在用中文撰写说明',
    opinionNote:'这些结果和建议是基于标准参考范围的AI意见，不能替代专业医疗判断。在做出任何健康决定之前，请咨询您的医生。',
  },
};

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function LabLens() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [report, setReport]           = useState('');
  const [result, setResult]           = useState(null);
  const [fuzzyData, setFuzzyData]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadingStep, setLoadingStep]     = useState('');
  const [progressSteps, setProgressSteps] = useState([]);
  const [loadingPdf, setLoadingPdf]       = useState(false);

  // Progress helpers — each step has id, label, status: 'active'|'done'|'fail'|'skip'
  const addStep  = (id, label)        => setProgressSteps(prev => [...prev, { id, label, status:'active' }]);
  const doneStep = (id, label)        => setProgressSteps(prev => prev.map(s => s.id===id ? { ...s, status:'done', label:label||s.label } : s));
  const failStep = (id, label)        => setProgressSteps(prev => prev.map(s => s.id===id ? { ...s, status:'fail', label:label||s.label } : s));
  const skipStep = (id, label)        => setProgressSteps(prev => prev.map(s => s.id===id ? { ...s, status:'skip', label:label||s.label } : s));
  const [error, setError]             = useState('');
  const [charCount, setCharCount]     = useState(0);
  const [activeTab, setActiveTab]     = useState('summary');
  const [language, setLanguage]       = useState('english');
  const [patientAge, setPatientAge]   = useState('');
  const [patientSex, setPatientSex]   = useState('');
  const fileRef = useRef();
  const MAX_CHARS = 5000;

  const lang = LANG_CONFIG[language] || LANG_CONFIG.english;

  const bg     = isDark ? '#08070f' : '#faf8ff';
  const card   = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const text   = isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.82)';
  const muted  = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const ac     = isDark ? '#a78bfa' : '#7c3aed';
  const green  = '#10b981';
  const red    = '#f87171';
  const warn   = '#d97706';
  const warnBg = isDark ? 'rgba(217,119,6,0.08)' : 'rgba(217,119,6,0.06)';
  const warnBorder = 'rgba(217,119,6,0.25)';

  const scriptFont = ['hindi','tamil','chinese'].includes(language)
    ? "'Noto Sans SC','Noto Sans','Mangal',system-ui,sans-serif"
    : "'Space Mono',monospace";

  function severityColor(label) {
    if (!label||label==='within_range') return green;
    if (label.includes('critical'))  return red;
    if (label.includes('severe'))    return '#fb923c';
    if (label.includes('moderate'))  return '#f59e0b';
    if (label.includes('mild'))      return '#84cc16';
    return muted;
  }
  function severityLabel(label) {
    return { within_range:'✓ Normal', borderline_low:'↓ Borderline Low', mildly_low:'↓ Mildly Low', moderately_low:'↓ Moderately Low', severely_low:'↓↓ Severely Low', critically_low:'↓↓ Critical Low', borderline_high:'↑ Borderline High', mildly_high:'↑ Mildly High', moderately_high:'↑ Moderately High', severely_high:'↑↑ Severely High', critically_high:'↑↑ Critical High' }[label] || label;
  }
  function overallBadge(status) {
    if (status==='normal')           return { color:green, icon:'✓', label:'All values within normal range' };
    if (status==='attention_needed') return { color:warn,  icon:'⚠', label:'Some values need attention' };
    if (status==='urgent')           return { color:red,   icon:'🚨', label:'Urgent — please consult your doctor' };
    return { color:warn, icon:'⚠', label:'Some values need attention' };
  }

  function handleInput(val) {
    if (val.length<=MAX_CHARS) { setReport(val); setCharCount(val.length); setError(''); }
  }
  function loadSample() { handleInput(SAMPLE_REPORT); setResult(null); setFuzzyData(null); setPatientAge('45'); setPatientSex('male'); }

  async function handleFile(e) {
    const file=e.target.files?.[0]; if(!file) return; e.target.value='';
    if (file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size>5*1024*1024) { setError('PDF too large. Max 5MB.'); return; }
      setLoadingPdf(true); setError('');
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve,reject)=>{ const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload=resolve; s.onerror=()=>reject(new Error('PDF reader load failed.')); document.head.appendChild(s); });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const pdf=await window.pdfjsLib.getDocument({ data:await file.arrayBuffer() }).promise;
        let fullText='';
        for (let i=1;i<=pdf.numPages;i++) { const page=await pdf.getPage(i); fullText+=(await page.getTextContent()).items.map(it=>it.str).join(' ')+'\n'; }
        fullText.trim() ? handleInput(fullText.slice(0,MAX_CHARS)) : setError('Could not extract text. PDF may be a scanned image — please paste the text manually.');
      } catch(err) { setError('PDF reading failed: '+err.message); }
      finally { setLoadingPdf(false); }
      return;
    }
    if (file.size>200000) { setError('File too large. Max 200KB.'); return; }
    const reader=new FileReader(); reader.onload=ev=>handleInput((ev.target.result||'').slice(0,MAX_CHARS)); reader.readAsText(file);
  }

  const analyze = useCallback(async () => {
    if (!report.trim())            { setError('Please paste your lab results or medical report.'); return; }
    if (report.trim().length < 30) { setError('Report is too short. Please paste the full text.'); return; }

    setLoading(true); setError(''); setResult(null); setFuzzyData(null); setProgressSteps([]);

    const patientInfo = {
      age: patientAge ? parseInt(patientAge) : null,
      sex: patientSex || null,
    };

    try {
      // Step 1: Fuzzy analysis (client-side — instant)
      addStep('fuzzy', 'Running fuzzy logic engine…');
      const parsedValues = parseLabText(report, patientInfo);
      const syndromes    = detectSyndromes(parsedValues);
      const overallFuzzy = computeOverallSeverity(parsedValues, syndromes);
      setFuzzyData({ parsedValues, syndromes, overallFuzzy });
      doneStep('fuzzy', `✓ ${parsedValues.length} values scored · ${syndromes.length} pattern${syndromes.length!==1?'s':''} detected`);

      const fuzzyContext = parsedValues.length > 0
        ? `FUZZY PRE-ANALYSIS (use these scores to calibrate your language precisely):\n${JSON.stringify(parsedValues.map(v=>({ name:v.name, value:v.value, unit:v.unit, ref:`${v.refLow}-${v.refHigh}`, fuzzy_score:v.fuzzy.score, fuzzy_label:v.fuzzy.label, direction:v.fuzzy.direction, clinical_override:v.fuzzy.clinical||false })),null,2)}\n\nDetected syndromes:\n${JSON.stringify(syndromes.map(s=>({ name:s.name, confidence:+(s.confidence).toFixed(2), confidence_pct:Math.round(s.confidence*100), urgency:s.urgency, clinical_note:s.clinical_note })),null,2)}\n\nComputed overall severity: ${overallFuzzy}\n${patientInfo.age||patientInfo.sex?`Patient: ${patientInfo.age?`age ${patientInfo.age}`:''}${patientInfo.sex?`, ${patientInfo.sex}`:''}`:''}`
        : 'Note: Could not parse structured values. Analyze from raw text only.';

      // labLens now uses gpt-oss-120b (non-thinking content channel), so
      // max_tokens here is purely for the JSON payload itself — full panels
      // (CBC + iron studies, ~13+ findings plus syndromes/questions/lifestyle)
      // need real headroom or the response truncates mid-array.
      const primaryModel  = TOOL_MODELS.labLens || MODELS.MEDIUM;
      const fallbackModel = MODELS.HEAVY;

      const callAI = async (model, toolId, messages) => fetchWithBackoff(GROQ_API_URL, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model,
          max_tokens: 8000,
          temperature: 0.0,
          toolId,
          messages,
        }),
      });

      // Step 2a: English analysis
      addStep('ai', 'AI reading your report and writing explanations…');
      setLoadingStep('AI reading your report…');
      let res;
      try {
        res = await callAI(primaryModel, 'lablens-v5', [
          { role:'system', content:buildAnalysisPrompt(patientInfo) },
          { role:'user',   content:`${fuzzyContext}\n\nRAW REPORT:\n${report}` },
        ]);
        if (res.status===429) throw new Error('rate_limit');
      } catch(e) {
        if (e.message==='rate_limit'||e.message?.includes('429'))
          res = await callAI(fallbackModel, 'lablens-v5-fb', [
            { role:'system', content:buildAnalysisPrompt(patientInfo) },
            { role:'user',   content:`${fuzzyContext}\n\nRAW REPORT:\n${report}` },
          ]);
        else throw e;
      }

      const data = await res.json();
      const raw  = data?.choices?.[0]?.message?.content || '';
      let englishResult;

      try {
        englishResult = safeParseJSON(raw);
      } catch (parseErr) {
        console.error('[LabLens] JSON parse failed:', parseErr.message, '\nRaw response:', raw.slice(0, 500));

        // If it was a reasoning-truncation issue, retry once with the
        // fallback model and a bigger token budget instead of giving up.
        if (/truncated during reasoning/i.test(parseErr.message)) {
          try {
            const retryRes = await callAI(fallbackModel, 'lablens-v5-retry', [
              { role:'system', content: buildAnalysisPrompt(patientInfo) },
              { role:'user',   content: `${fuzzyContext}\n\nRAW REPORT:\n${report}` },
            ]);
            const retryData = await retryRes.json();
            const retryRaw  = retryData?.choices?.[0]?.message?.content || '';
            englishResult = safeParseJSON(retryRaw);
          } catch (retryErr) {
            console.error('[LabLens] Retry also failed:', retryErr.message);
          }
        }

        if (!englishResult) {
          // No valid JSON came back — fall back to showing the model's plain-text
          // response as-is. This is a legitimate, readable output mode (not an
          // error), so no warning banner — just render it with line breaks intact.
          const cleanText = raw.replace(/<think>[\s\S]*?<\/think>/i, '').replace(/<\/?think>/gi, '').trim();
          doneStep('ai', '✓ Analysis complete');
          setResult({
            headline: 'Report Analysis',
            overall_status: overallFuzzy !== 'unknown' ? overallFuzzy : 'attention_needed',
            summary: cleanText || 'No analysis text was returned. Please try again.',
            textMode: true,
            urgent_alert: null,
            findings: [],
            syndrome_explanations: [],
            questions_for_doctor: [],
            lifestyle_notes: [],
            ai_opinion_note: 'These results and suggestions represent AI analysis based on standard reference ranges. They are not a substitute for professional medical judgment.'
          });
          setActiveTab('summary');
          setLoading(false);
          setLoadingStep('');
          return;
        }
      }
      doneStep('ai', `✓ Analysis complete — ${(englishResult.findings||[]).length} findings explained`);

      // Validate & override AI fuzzy scores with our computed ones (prevent hallucination)
      if (englishResult.findings && parsedValues.length > 0) {
        englishResult.findings = englishResult.findings.map(f => {
          const match = parsedValues.find(p => p.name.toLowerCase().includes(f.parameter?.toLowerCase().substring(0,5)));
          if (match) {
            return { ...f, fuzzy_score: match.fuzzy.score, fuzzy_label: match.fuzzy.label, flag: match.fuzzy.score > 0.1 };
          }
          return f;
        });
      }

      // Normalize overall_status
      const validStatuses = ['normal','attention_needed','urgent'];
      if (!validStatuses.includes(englishResult.overall_status)) {
        const s=(englishResult.overall_status||'').toLowerCase();
        englishResult.overall_status = s.includes('urgent')||s.includes('critical') ? 'urgent' : overallFuzzy !== 'unknown' ? overallFuzzy : 'attention_needed';
      }
      // Override with fuzzy if AI understates severity
      if (overallFuzzy==='urgent' && englishResult.overall_status!=='urgent') englishResult.overall_status='urgent';

      // Step 2b: Translate if non-English
      let finalResult = englishResult;
      if (language !== 'english' && lang.targetLang) {
        addStep('trans', `Translating to ${lang.nativeLabel} (5 steps)…`);
        setLoadingStep(`Translating to ${lang.nativeLabel}…`);
        finalResult = await translateFields(englishResult, lang.targetLang, callAI, primaryModel, fallbackModel,
          (step, total) => setProgressSteps(prev => prev.map(s => s.id==='trans' ? { ...s, label:`Translating to ${lang.nativeLabel}… (${step}/${total})` } : s))
        );
        doneStep('trans', `✓ Translation to ${lang.nativeLabel} complete`);
      }

      addStep('done', '✓ Report ready');
      setResult(finalResult);
      setActiveTab('summary');
    } catch(err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false); setLoadingStep('');
    }
  }, [report, language, patientAge, patientSex]);

  function clear() { setReport(''); setResult(null); setFuzzyData(null); setError(''); setCharCount(0); setProgressSteps([]); }

  const flagged = result?.findings?.filter(f=>f.flag) || [];

  function SeverityBar({ score, label }) {
    const color=severityColor(label), pct=Math.round((score||0)*100);
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

  // AI Opinion block — replaces old "educational caution"
  function OpinionBlock() {
    return (
      <div style={{ background:warnBg, border:`1px solid ${warnBorder}`, borderRadius:'12px', padding:'16px 20px', marginTop:'16px' }}>
        <div style={{ fontSize:'0.7rem', color:warn, fontWeight:700, marginBottom:'10px', letterSpacing:'0.05em' }}>🤖 AI OPINION — NOT MEDICAL ADVICE</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
          {Object.entries(LANG_CONFIG).map(([code,cfg])=>(
            <div key={code} style={{ fontSize:'0.7rem', color:warn, lineHeight:1.7, fontFamily:['hindi','tamil','chinese'].includes(code)?"'Noto Sans SC','Noto Sans',system-ui,sans-serif":'inherit' }}>
              {cfg.flag} {cfg.opinionNote}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:bg, width:'100%' }}>
      <div style={{ maxWidth:'840px', margin:'0 auto', padding:'60px 20px 80px', fontFamily:"'Space Mono',monospace" }}>

        {/* Header */}
        <div style={{ marginBottom:'28px', textAlign:'left' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:isDark?'rgba(16,185,129,0.1)':'rgba(16,185,129,0.08)', border:`1px solid rgba(16,185,129,0.25)`, borderRadius:'100px', padding:'5px 16px', marginBottom:'14px' }}>
            <span style={{ fontSize:'0.6rem', color:green, letterSpacing:'0.18em' }}>◆ MEDICAL · AI + FUZZY LOGIC</span>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(2rem,5vw,3rem)', fontWeight:800, color:isDark?'#fff':'#1a1a1a', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:'10px' }}>
            Lab<span style={{ color:green }}>Lens</span>
          </h1>
          <p style={{ fontSize:'0.92rem', color:muted, lineHeight:1.75, maxWidth:'580px', marginBottom:'14px', textAlign:'left' }}>
            Paste or upload your lab report in any language. LabLens uses a fuzzy logic engine for nuanced severity scoring, then AI explains every value and pattern — in 5 languages.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:warnBg, border:`1px solid ${warnBorder}`, borderRadius:'8px', padding:'6px 14px' }}>
              <span style={{ fontSize:'0.7rem', color:warn, fontWeight:600 }}>🤖 AI opinion — consult your doctor before decisions</span>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:isDark?'rgba(16,185,129,0.06)':'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'8px', padding:'6px 14px' }}>
              <span style={{ fontSize:'0.7rem', color:green, fontWeight:600 }}>✓ Nuanced severity · 5 languages · Age & sex aware</span>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom:'18px' }}>
          <div style={{ fontSize:'0.6rem', color:muted, letterSpacing:'0.12em', marginBottom:'8px', textTransform:'uppercase' }}>Output Language</div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {Object.entries(LANG_CONFIG).map(([code,cfg])=>{
              const active=language===code;
              return (
                <button key={code} onClick={()=>setLanguage(code)}
                  style={{ background:active?(isDark?'rgba(16,185,129,0.12)':'rgba(16,185,129,0.09)'):card, border:`1px solid ${active?green+'80':border}`, borderRadius:'10px', padding:'7px 16px', fontSize:'0.78rem', color:active?green:text, cursor:'pointer', fontFamily:['hindi','tamil','chinese'].includes(code)?"'Noto Sans SC','Noto Sans',system-ui,sans-serif":"'Space Mono',monospace", fontWeight:active?700:400, transition:'all 0.15s', display:'flex', alignItems:'center', gap:'6px', boxShadow:active?`0 0 0 2px ${green}22`:'none' }}>
                  {cfg.flag} {cfg.nativeLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient context — improves accuracy */}
        <div style={{ marginBottom:'16px', background:card, border:`1px solid ${border}`, borderRadius:'12px', padding:'16px 20px' }}>
          <div style={{ fontSize:'0.6rem', color:green, letterSpacing:'0.12em', marginBottom:'12px', textTransform:'uppercase' }}>◆ Optional: Patient Info (improves accuracy)</div>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            <div style={{ flex:'1', minWidth:'120px' }}>
              <div style={{ fontSize:'0.65rem', color:muted, marginBottom:'6px' }}>Age</div>
              <input type="number" min="1" max="120" value={patientAge} onChange={e=>setPatientAge(e.target.value)} placeholder="e.g. 35"
                style={{ width:'100%', background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${border}`, borderRadius:'8px', padding:'8px 12px', color:text, fontSize:'0.82rem', fontFamily:"'Space Mono',monospace", outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ flex:'1', minWidth:'160px' }}>
              <div style={{ fontSize:'0.65rem', color:muted, marginBottom:'6px' }}>Sex</div>
              <div style={{ display:'flex', gap:'8px' }}>
                {['male','female','other'].map(s=>(
                  <button key={s} onClick={()=>setPatientSex(patientSex===s?'':s)}
                    style={{ flex:1, background:patientSex===s?(isDark?'rgba(16,185,129,0.12)':'rgba(16,185,129,0.08)'):isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)', border:`1px solid ${patientSex===s?green+'60':border}`, borderRadius:'8px', padding:'8px 4px', fontSize:'0.7rem', color:patientSex===s?green:muted, cursor:'pointer', fontFamily:"'Space Mono',monospace", textTransform:'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ fontSize:'0.65rem', color:muted, alignSelf:'flex-end', paddingBottom:'10px', maxWidth:'200px', lineHeight:1.5 }}>
              Age & sex adjust reference ranges for hemoglobin, ferritin, creatinine, and TSH.
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'16px', padding:'22px', marginBottom:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
            <span style={{ fontSize:'0.6rem', color:muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>Paste Lab Report / Results</span>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={loadSample} style={{ background:isDark?'rgba(16,185,129,0.08)':'rgba(16,185,129,0.07)', border:`1px solid rgba(16,185,129,0.2)`, borderRadius:'8px', padding:'5px 12px', fontSize:'0.7rem', color:green, cursor:'pointer', fontFamily:"'Space Mono',monospace" }}>Sample CBC</button>
              <button onClick={()=>fileRef.current?.click()} disabled={loadingPdf}
                style={{ background:isDark?'rgba(167,139,250,0.08)':'rgba(124,58,237,0.07)', border:`1px solid ${isDark?'rgba(167,139,250,0.2)':'rgba(124,58,237,0.2)'}`, borderRadius:'8px', padding:'5px 12px', fontSize:'0.7rem', color:ac, cursor:loadingPdf?'wait':'pointer', fontFamily:"'Space Mono',monospace", opacity:loadingPdf?0.6:1 }}>
                {loadingPdf?'Reading PDF…':'↑ Upload PDF / TXT'}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv" style={{ display:'none' }} onChange={handleFile} />
            </div>
          </div>
          <div style={{ marginBottom:'10px', padding:'7px 12px', background:isDark?'rgba(16,185,129,0.05)':'rgba(16,185,129,0.04)', border:`1px solid rgba(16,185,129,0.15)`, borderRadius:'8px', fontSize:'0.67rem', color:green, fontFamily:scriptFont }}>
            📂 {lang.uploadHint}
          </div>
          <textarea value={report} onChange={e=>handleInput(e.target.value)}
            placeholder={`Paste your lab results here...\n\nExample:\nHemoglobin: 11.8 g/dL  [Ref: 13.5-17.5]  LOW\nFerritin: 6 ng/mL  [Ref: 12-300]  LOW\n\nWorks with reports in any language.`}
            style={{ width:'100%', minHeight:'190px', background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', border:`1px solid ${border}`, borderRadius:'10px', padding:'14px', color:text, fontSize:'0.82rem', lineHeight:1.7, resize:'vertical', fontFamily:"'Space Mono',monospace", outline:'none', boxSizing:'border-box' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px', flexWrap:'wrap', gap:'8px' }}>
            <span style={{ fontSize:'0.65rem', color:charCount>MAX_CHARS*0.9?warn:muted }}>{charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars</span>
            <div style={{ display:'flex', gap:'8px' }}>
              {report && <button onClick={clear} style={{ background:'transparent', border:`1px solid ${border}`, borderRadius:'8px', padding:'8px 14px', fontSize:'0.72rem', color:muted, cursor:'pointer', fontFamily:"'Space Mono',monospace" }}>Clear</button>}
              <button onClick={analyze} disabled={loading||!report.trim()}
                style={{ background:report.trim()&&!loading?`linear-gradient(135deg,${green},#059669)`:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)', border:'none', borderRadius:'10px', padding:'10px 24px', fontSize:'0.82rem', fontWeight:700, color:report.trim()&&!loading?'#fff':muted, cursor:report.trim()&&!loading?'pointer':'not-allowed', fontFamily:scriptFont, transition:'all 0.2s' }}>
                {loading?'…':lang.analyzeBtn}
              </button>
            </div>
          </div>
        </div>

        {error && <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:'10px', padding:'12px 16px', marginBottom:'14px', fontSize:'0.82rem', color:red, lineHeight:1.6 }}>{error}</div>}

        {loading && (
          <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'16px', padding:'28px', marginBottom:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <div style={{ fontSize:'1.6rem' }}>🔬</div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.95rem', color:isDark?'#fff':'#1a1a1a' }}>Analyzing your report…</div>
                <div style={{ fontSize:'0.68rem', color:muted, marginTop:'2px' }}>Each step updates as it completes</div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
              {progressSteps.length === 0 && (
                <div style={{ fontSize:'0.75rem', color:muted, padding:'8px 0' }}>Starting…</div>
              )}
              {progressSteps.map((step) => {
                const isDone   = step.status === 'done';
                const isFail   = step.status === 'fail';
                const isSkip   = step.status === 'skip';
                const isActive = step.status === 'active';
                const stepColor = isDone ? green : isFail ? red : isSkip ? muted : ac;
                const icon = isDone ? '✓' : isFail ? '✗' : isSkip ? '−' : '○';
                return (
                  <div key={step.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background: isDone?(isDark?'rgba(16,185,129,0.06)':'rgba(16,185,129,0.04)'):isActive?(isDark?'rgba(167,139,250,0.08)':'rgba(124,58,237,0.04)'):'transparent', border:`1px solid ${isDone?green+'30':isActive?ac+'40':border}`, borderRadius:'10px', transition:'all 0.4s ease' }}>
                    <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:isDone?green+'20':isActive?ac+'15':'transparent', border:`1.5px solid ${stepColor}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:'0.68rem', color:stepColor, fontWeight:700 }}>{icon}</span>
                    </div>
                    <span style={{ fontSize:'0.77rem', color:isDone?(isDark?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)'):isActive?(isDark?'#fff':'#1a1a1a'):muted, fontFamily:"'Space Mono',monospace", flex:1, lineHeight:1.4 }}>
                      {step.label}
                    </span>
                    {isActive && (
                      <div style={{ display:'flex', gap:'3px', flexShrink:0 }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background:ac, opacity: 0.8,
                            animation:`lablens-bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <style>{'.lablens-bounce-wrap { } @keyframes lablens-bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }'}</style>
          </div>
        )}

        {result && !loading && (
          <div>
            {result.urgent_alert && (
              <div style={{ background:'rgba(248,113,113,0.1)', border:`2px solid ${red}44`, borderRadius:'14px', padding:'18px 22px', marginBottom:'14px', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'1.4rem', flexShrink:0 }}>🚨</span>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:red, marginBottom:'4px' }}>Action Needed</div>
                  <div style={{ fontSize:'0.88rem', color:text, lineHeight:1.65, fontFamily:scriptFont }}>{result.urgent_alert}</div>
                </div>
              </div>
            )}

            {(()=>{ const b=overallBadge(result.overall_status); return (
              <div style={{ background:`${b.color}10`, border:`1px solid ${b.color}30`, borderRadius:'14px', padding:'16px 20px', marginBottom:'18px', display:'flex', alignItems:'flex-start', gap:'12px' }}>
                <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{b.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.88rem', color:b.color, marginBottom:'4px' }}>{b.label}</div>
                  <div style={{ fontSize:'0.87rem', color:text, lineHeight:1.65, fontFamily:scriptFont }}>{result.headline}</div>
                  {fuzzyData?.parsedValues?.length>0 && <div style={{ marginTop:'6px', fontSize:'0.65rem', color:muted }}>Fuzzy engine: {fuzzyData.parsedValues.length} values · {flagged.length} flagged · {fuzzyData.syndromes.length} pattern{fuzzyData.syndromes.length!==1?'s':''} · {patientAge||patientSex?`Adjusted for ${patientAge?`age ${patientAge}`:''}${patientSex?` ${patientSex}`:''}`:''}</div>}
                </div>
              </div>
            ); })()}

            {/* Tabs */}
            <div style={{ display:'flex', gap:'3px', background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.04)', borderRadius:'10px', padding:'4px', marginBottom:'18px' }}>
              {(result.textMode
                ? [{key:'summary',label:'Summary'}]
                : [{key:'summary',label:'Summary'},{key:'findings',label:`Values (${(result.findings||[]).length})`},{key:'flagged',label:`Flagged (${flagged.length})`},{key:'patterns',label:`Patterns (${(result.syndrome_explanations||[]).length})`},{key:'questions',label:'Ask Doctor'}]
              ).map(tab=>(
                <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
                  style={{ flex:1, background:activeTab===tab.key?(isDark?'rgba(255,255,255,0.08)':'#fff'):'transparent', border:activeTab===tab.key?`1px solid ${border}`:'1px solid transparent', borderRadius:'7px', padding:'8px 2px', fontSize:'0.58rem', color:activeTab===tab.key?(isDark?'#fff':'#1a1a1a'):muted, cursor:'pointer', fontFamily:"'Space Mono',monospace", fontWeight:activeTab===tab.key?700:400, transition:'all 0.15s' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab==='summary' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'20px' }}>
                  <div style={{ fontSize:'0.6rem', color:green, letterSpacing:'0.15em', marginBottom:'10px', textTransform:'uppercase' }}>◆ Summary</div>
                  <p style={{ fontSize:'0.92rem', color:text, lineHeight:1.85, margin:0, fontFamily:scriptFont, whiteSpace:'pre-wrap' }}>{result.summary}</p>
                </div>
                {result.lifestyle_notes?.length>0 && (
                  <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'20px' }}>
                    <div style={{ fontSize:'0.6rem', color:green, letterSpacing:'0.15em', marginBottom:'12px', textTransform:'uppercase' }}>◆ What You Can Do</div>
                    {result.lifestyle_notes.map((note,i)=>(
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:i<result.lifestyle_notes.length-1?'10px':0 }}>
                        <span style={{ color:green, flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:'0.88rem', color:text, lineHeight:1.7, fontFamily:scriptFont }}>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
                <OpinionBlock />
              </div>
            )}

            {activeTab==='findings' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {(result.findings||[]).map((f,i)=>{ const col=severityColor(f.fuzzy_label); return (
                  <div key={i} style={{ background:card, border:`1px solid ${f.flag?col+'44':border}`, borderRadius:'12px', padding:'16px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px', marginBottom:'6px' }}>
                      <div><span style={{ fontWeight:700, fontSize:'0.88rem', color:isDark?'#fff':'#1a1a1a' }}>{f.parameter}</span><span style={{ fontSize:'0.78rem', color:muted, marginLeft:'10px' }}>{f.value}</span></div>
                      <span style={{ background:`${col}18`, border:`1px solid ${col}44`, borderRadius:'100px', padding:'3px 12px', fontSize:'0.62rem', color:col, fontWeight:700, whiteSpace:'nowrap' }}>{severityLabel(f.fuzzy_label)}</span>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:muted, marginBottom:'5px', fontFamily:scriptFont }}>{f.plain_meaning}</div>
                    <div style={{ fontSize:'0.84rem', color:text, lineHeight:1.65, fontFamily:scriptFont }}>{f.significance}</div>
                    {f.fuzzy_score>0 && <SeverityBar score={f.fuzzy_score} label={f.fuzzy_label} />}
                  </div>
                ); })}
                <OpinionBlock />
              </div>
            )}

            {activeTab==='flagged' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {flagged.length===0
                  ? <div style={{ background:`${green}10`, border:`1px solid ${green}30`, borderRadius:'14px', padding:'36px', textAlign:'center' }}><div style={{ fontSize:'2rem', marginBottom:'8px' }}>✓</div><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:green, marginBottom:'4px' }}>No abnormal values detected</div><div style={{ fontSize:'0.82rem', color:muted }}>All values appear within reference ranges</div></div>
                  : flagged.map((f,i)=>{ const col=severityColor(f.fuzzy_label); return (
                    <div key={i} style={{ background:`${col}08`, border:`1px solid ${col}33`, borderRadius:'12px', padding:'18px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px', marginBottom:'8px' }}>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.92rem', color:col }}>{f.parameter}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}><span style={{ fontSize:'0.82rem', color:text }}>{f.value}</span><span style={{ background:`${col}20`, border:`1px solid ${col}44`, borderRadius:'100px', padding:'3px 12px', fontSize:'0.62rem', color:col, fontWeight:700, whiteSpace:'nowrap' }}>{severityLabel(f.fuzzy_label)}</span></div>
                      </div>
                      <div style={{ fontSize:'0.75rem', color:muted, marginBottom:'6px', fontFamily:scriptFont }}>{f.plain_meaning}</div>
                      <div style={{ fontSize:'0.86rem', color:text, lineHeight:1.7, fontFamily:scriptFont }}>{f.significance}</div>
                      {f.fuzzy_score>0 && <SeverityBar score={f.fuzzy_score} label={f.fuzzy_label} />}
                    </div>
                  ); })
                }
                <OpinionBlock />
              </div>
            )}

            {activeTab==='patterns' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {!(result.syndrome_explanations?.length>0)
                  ? <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'32px', textAlign:'center' }}><div style={{ fontSize:'0.88rem', color:muted }}>No significant multi-marker patterns detected.</div></div>
                  : (result.syndrome_explanations||[]).map((s,i)=>{ const fuzzyS=fuzzyData?.syndromes?.find(fs=>fs.name===s.name); const conf=fuzzyS?.confidence||(s.confidence_pct/100); const col=conf>0.7?red:conf>0.4?warn:green; return (
                    <div key={i} style={{ background:`${col}08`, border:`1px solid ${col}30`, borderRadius:'14px', padding:'20px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px', marginBottom:'10px' }}>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'0.95rem', color:isDark?'#fff':'#1a1a1a' }}>{s.name}</div>
                        <div style={{ background:`${col}18`, border:`1px solid ${col}40`, borderRadius:'100px', padding:'4px 12px', fontSize:'0.62rem', color:col, fontWeight:700, whiteSpace:'nowrap' }}>{conf>=0.8?'High confidence':conf>=0.5?'Moderate confidence':'Low confidence'}</div>
                      </div>
                      <SeverityBar score={conf} label={conf>0.7?'severely_high':conf>0.4?'moderately_high':'mildly_high'} />
                      <div style={{ fontSize:'0.87rem', color:text, lineHeight:1.75, marginTop:'12px', fontFamily:scriptFont }}>{s.plain_explanation}</div>
                      {s.what_doctor_looks_for && <div style={{ marginTop:'10px', paddingTop:'10px', borderTop:`1px solid ${border}` }}><div style={{ fontSize:'0.6rem', color:ac, letterSpacing:'0.1em', marginBottom:'5px', textTransform:'uppercase' }}>What Your Doctor Will Likely Check</div><div style={{ fontSize:'0.83rem', color:muted, lineHeight:1.65, fontFamily:scriptFont }}>{s.what_doctor_looks_for}</div></div>}
                    </div>
                  ); })
                }
                <OpinionBlock />
              </div>
            )}

            {activeTab==='questions' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'14px', padding:'20px' }}>
                  <div style={{ fontSize:'0.6rem', color:ac, letterSpacing:'0.15em', marginBottom:'16px', textTransform:'uppercase' }}>◆ Bring These to Your Appointment</div>
                  {(result.questions_for_doctor||[]).map((q,i)=>(
                    <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', paddingBottom:i<result.questions_for_doctor.length-1?'14px':0, marginBottom:i<result.questions_for_doctor.length-1?'14px':0, borderBottom:i<result.questions_for_doctor.length-1?`1px solid ${border}`:'none' }}>
                      <div style={{ background:ac, color:'#fff', fontSize:'0.62rem', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px' }}>{i+1}</div>
                      <span style={{ fontSize:'0.87rem', color:text, lineHeight:1.75, fontFamily:scriptFont }}>{q}</span>
                    </div>
                  ))}
                </div>
                <OpinionBlock />
              </div>
            )}

            <div style={{ marginTop:'24px', textAlign:'center' }}>
              <button onClick={clear} style={{ background:'transparent', border:`1px solid ${border}`, borderRadius:'10px', padding:'10px 28px', fontSize:'0.78rem', color:muted, cursor:'pointer', fontFamily:"'Space Mono',monospace" }}>
                Analyze Another Report
              </button>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div style={{ marginTop:'36px' }}>
            <div style={{ fontSize:'0.6rem', color:muted, letterSpacing:'0.15em', marginBottom:'14px', textAlign:'center', textTransform:'uppercase' }}>How LabLens Works</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:'10px', marginBottom:'18px' }}>
              {[
                { icon:'📂', title:'Any language upload', desc:'PDF, text, or CSV lab reports — English, Hindi, Chinese, or any language' },
                { icon:'⚖️', title:'Age & sex aware', desc:'Reference ranges adjusted for your age and sex — more accurate results' },
                { icon:'🔬', title:'Fuzzy severity scoring', desc:'7-level scale from borderline to critical — not just HIGH/LOW' },
                { icon:'🧩', title:'Pattern detection', desc:'8 syndrome patterns detected across related markers' },
                { icon:'🌐', title:'5 languages', desc:'English, हिंदी, Español, தமிழ், 中文' },
                { icon:'🔒', title:'Private', desc:'Nothing stored. Your report never leaves your session.' },
              ].map((item,i)=>(
                <div key={i} style={{ background:card, border:`1px solid ${border}`, borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'1.3rem', marginBottom:'7px' }}>{item.icon}</div>
                  <div style={{ fontWeight:700, fontSize:'0.73rem', color:isDark?'#fff':'#1a1a1a', marginBottom:'4px' }}>{item.title}</div>
                  <div style={{ fontSize:'0.68rem', color:muted, lineHeight:1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:'12px', padding:'16px 20px' }}>
              <div style={{ fontSize:'0.6rem', color:muted, letterSpacing:'0.12em', marginBottom:'10px', textTransform:'uppercase' }}>Works With</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
                {['CBC','Lipid Panel','Metabolic Panel','Thyroid (TSH/T3/T4)','Liver Function','Kidney Function','Iron Studies','HbA1c / Diabetes','Urinalysis','Vitamin D / B12','Hormone Panel','Cardiac Markers (Troponin)','Coagulation (INR)','Electrolytes'].map(t=>(
                  <span key={t} style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)', border:`1px solid ${border}`, borderRadius:'100px', padding:'4px 11px', fontSize:'0.64rem', color:muted }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
