// src/components/LabLens.jsx
// LabLens v4 — Two-step translation (English JSON → display language), multi-language upload, font fixes

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
  if (ironConf > 0.25) syndromes.push({ name:'Iron Deficiency Pattern', confidence: Math.min(1, ironConf + score(['tibc'],'high')*0.3), description:'Multiple iron-related markers pointing in the same direction.', urgency: ironConf>0.7?'high':'medium' });

  const infConf = fuzzyAnd(score(['wbc'],'high'), score(['neutrophil'],'high'));
  if (infConf > 0.2) syndromes.push({ name:'Infection / Inflammation Pattern', confidence: infConf, description:'Elevated white blood cells and neutrophils suggest immune response.', urgency: infConf>0.7?'high':'medium' });

  const microConf = fuzzyAnd(score(['mcv'],'low'), score(['mch','mchc'],'low'));
  if (microConf > 0.3 && ironConf < 0.25) syndromes.push({ name:'Microcytic Anemia Pattern', confidence: microConf, description:'Small, pale red blood cells suggest hemoglobin production problem.', urgency: microConf>0.6?'high':'medium' });

  const glucoseConf = Math.max(score(['glucose','blood sugar'],'high'), score(['hba1c','a1c','glycated'],'high'));
  if (glucoseConf > 0.2) syndromes.push({ name:'Elevated Blood Sugar Pattern', confidence: glucoseConf, description:'Elevated glucose or HbA1c suggests blood sugar regulation issues.', urgency: glucoseConf>0.7?'high':'medium' });

  const tshLow = score(['tsh'],'low'), tshHigh = score(['tsh'],'high');
  if (tshLow > 0.3)  syndromes.push({ name:'Low TSH — Possible Hyperthyroidism', confidence: tshLow,  description:'Low TSH suggests thyroid may be overactive.', urgency: tshLow>0.7?'high':'medium' });
  if (tshHigh > 0.3) syndromes.push({ name:'High TSH — Possible Hypothyroidism', confidence: tshHigh, description:'High TSH suggests thyroid may be underactive.', urgency: tshHigh>0.7?'high':'medium' });

  return syndromes.sort((a,b) => b.confidence - a.confidence);
}

function parseLabText(text) {
  const results = [];
  const lines   = text.split('\n');
  const patterns = [
    /([A-Za-z][A-Za-z0-9\s/(),%]+?)\s*[:\t]\s*([\d.]+)\s*([a-zA-Z%/\u00B5\u03BC\u00B3\u2076\u2070\u00B3\s]*?)\s*[\[(](?:[Rr]ef[:\s]*)?(\d+\.?\d*)\s*[-\u2013to]\s*(\d+\.?\d*)[\])]/,
    /([A-Za-z][A-Za-z0-9\s/(),%]{2,30}?)\s{2,}([\d.]+)\s+([a-zA-Z%/\u00B5\u03BCK\u00B3\u2076\u2070\s]*?)\s{2,}(\d+\.?\d*)\s*[-\u2013]\s*(\d+\.?\d*)/,
    /([A-Za-z][A-Za-z0-9\s/(),%]+?)\s+([\d.]+)\s+([a-zA-Z%/\u00B5\u03BC\u00B3\u2076\s]*?)\s+[Rr]ef[:\s]+(\d+\.?\d*)\s*[-\u2013]\s*(\d+\.?\d*)/,
    /([\u0900-\u097F\u0B80-\u0BFF\u00C0-\u024Fa-zA-Z][\u0900-\u097F\u0B80-\u0BFF\u00C0-\u024Fa-zA-Z0-9\s/(),%]+?)\s*[:\t]\s*([\d.]+)\s*([a-zA-Z%/\u00B5\u03BC\u00B3\u2076\u2070\u00B3\s]*?)\s*[\[(]?(?:[Rr]ef[:\s]*)?(\d+\.?\d*)\s*[-\u2013to]\s*(\d+\.?\d*)[\])]?/,
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

function safeParseJSON(raw) {
  if (!raw) throw new Error('Empty response from AI.');
  try { return JSON.parse(raw); } catch(_) {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch(_) {}
    let cleaned = match[0]
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ')
      .replace(/\t/g, ' ');
    try { return JSON.parse(cleaned); } catch(_) {}
  }
  throw new Error('Could not parse AI response. The model returned an unexpected format. Please try again.');
}

// ═══════════════════════════════════════════════════════════════
// TRANSLATION ENGINE — complete client-side i18n
// ═══════════════════════════════════════════════════════════════
const TRANSLATIONS = {
  hindi: {
    summary: 'सारांश', values: 'मान', flagged: 'चिह्नित', patterns: 'पैटर्न', askDoctor: 'डॉक्टर से पूछें',
    plainSummary: 'सरल भाषा सारांश', whatYouCanDo: 'आप क्या कर सकते हैं', bringToAppointment: 'अपॉइंटमेंट में ये ले जाएं',
    importantCaution: '⚕ महत्वपूर्ण सावधानी',
    educationalOnly: 'यह केवल शैक्षिक उद्देश्यों के लिए AI द्वारा तैयार की गई जानकारी है। यह कोई चिकित्सीय निदान नहीं है। कोई भी स्वास्थ्य निर्णय लेने से पहले योग्य डॉक्टर से परामर्श करें।',
    noAbnormal: 'कोई असामान्य मान नहीं मिला', allNormal: 'सभी रिपोर्ट किए गए मान सामान्य सीमा के भीतर हैं',
    noPatterns: 'इस रिपोर्ट में कोई महत्वपूर्ण बहु-मार्कर पैटर्न नहीं मिला।',
    whatDoctorChecks: 'आपका डॉक्टर क्या जांचेगा', analyzing: 'आपकी रिपोर्ट का विश्लेषण हो रहा है…',
    step1: 'चरण 1: फजी लॉजिक इंजन प्रत्येक मान की गंभीरता को स्कोर कर रहा है',
    step2: 'चरण 2: संबंधित मार्करों में पैटर्न का पता लगा रहा है',
    step3: 'चरण 3: AI सरल भाषा में व्याख्या लिख रहा है',
    within_range: '✓ सामान्य', borderline_low: '↓ सीमा के पास कम', mildly_low: '↓ हल्का कम',
    moderately_low: '↓ मध्यम कम', severely_low: '↓↓ गंभीर कम', critically_low: '↓↓ अत्यंत गंभीर कम',
    borderline_high: '↑ सीमा के पास अधिक', mildly_high: '↑ हल्का अधिक', moderately_high: '↑ मध्यम अधिक',
    severely_high: '↑↑ गंभीर अधिक', critically_high: '↑↑ अत्यंत गंभीर अधिक',
    allNormalStatus: 'सभी मान सामान्य सीमा में', attentionNeeded: 'कुछ मानों पर ध्यान देने की आवश्यकता है',
    urgent: 'तुरंत — कृपया अपने डॉक्टर से परामर्श करें', analysisComplete: 'विश्लेषण पूर्ण',
    actionNeeded: 'कार्रवाई की आवश्यकता', highConfidence: 'उच्च विश्वास', moderateConfidence: 'मध्यम विश्वास', lowConfidence: 'कम विश्वास',
    uploadHint: 'PDF लैब रिपोर्ट, सादा टेक्स्ट, CSV — अधिकतम 5MB PDF / 200KB टेक्स्ट',
    pastePlaceholder: 'अपने लैब परिणाम यहाँ पेस्ट करें...\n\nउदाहरण:\nHemoglobin: 11.8 g/dL  [Ref: 13.5-17.5]  LOW\nWBC: 11.2 K/uL  [Ref: 4.5-11.0]  HIGH\nFerritin: 6 ng/mL  [Ref: 12-300]  LOW\n\nLabLens तब सबसे अच्छा काम करता है जब मानों में संदर्भ सीमाएं हों।',
    sampleCBC: 'नमूना CBC', uploadPDF: '↑ PDF / TXT अपलोड करें', readingPDF: 'PDF पढ़ा जा रहा है…',
    explainReport: 'मेरी रिपोर्ट समझाएं →', clear: 'साफ करें', analyzeAnother: 'दूसरी रिपोर्ट का विश्लेषण करें',
    errorEmpty: 'कृपया अपने लैब परिणाम या मेडिकल रिपोर्ट पेस्ट करें।',
    errorShort: 'रिपोर्ट बहुत छोटी है। कृपया पूरा टेक्स्ट पेस्ट करें।',
    errorPDFLarge: 'PDF बहुत बड़ा है। अधिकतम 5MB।', errorFileLarge: 'फाइल बहुत बड़ी है। अधिकतम 200KB।',
    errorPDFRead: 'PDF पढ़ने में विफल: ', errorPDFExtract: 'इस PDF से टेक्स्ट निकाला नहीं जा सका। यह स्कैन्ड इमेज हो सकती है। कृपया टेक्स्ट मैन्युअली पेस्ट करें।',
    errorParse: 'AI प्रतिक्रिया को पार्स नहीं किया जा सका। मॉडल ने अप्रत्याशित प्रारूप दिया। कृपया पुनः प्रयास करें।',
    howItWorks: 'LabLens कैसे काम करता है', pasteUpload: 'पेस्ट या अपलोड करें',
    pasteUploadDesc: 'टेक्स्ट, PDF लैब रिपोर्ट, या CSV — अधिकतम 5MB',
    fuzzyScoring: 'फजी स्कोरिंग', fuzzyScoringDesc: 'प्रत्येक मान 0-100% गंभीरता पर स्कोर किया जाता है — केवल HIGH/LOW नहीं',
    patternDetection: 'पैटर्न पहचान', patternDetectionDesc: 'संबंधित मार्करों को नामित मेडिकल पैटर्न में समूहित करता है',
    yourLanguage: 'आपकी भाषा', yourLanguageDesc: 'अंग्रेजी, हिंदी, स्पेनिश, या तमिल आउटपुट',
    doctorQuestions: 'डॉक्टर के प्रश्न', doctorQuestionsDesc: 'आपके अपॉइंटमेंट के लिए मान-विशिष्ट प्रश्न',
    private: 'निजी', privateDesc: 'कुछ भी स्टोर नहीं किया जाता। आपका डेटा कभी सत्र से बाहर नहीं जाता।',
    worksWith: 'इसके साथ काम करता है',
  },
  spanish: {
    summary: 'Resumen', values: 'Valores', flagged: 'Marcados', patterns: 'Patrones', askDoctor: 'Preguntar al Médico',
    plainSummary: 'Resumen en Lenguaje Sencillo', whatYouCanDo: 'Qué Puedes Hacer', bringToAppointment: 'Lleva Esto a tu Cita',
    importantCaution: '⚕ Precaución Importante',
    educationalOnly: 'Esta es una explicación generada por IA con fines educativos únicamente. No es un diagnóstico médico. Consulte siempre a un médico calificado antes de tomar decisiones de salud.',
    noAbnormal: 'No se detectaron valores anormales', allNormal: 'Todos los valores reportados aparecen dentro de rangos normales',
    noPatterns: 'No se detectaron patrones significativos de múltiples marcadores en este informe.',
    whatDoctorChecks: 'Lo que Tu Médico Probablemente Verificará', analyzing: 'Analizando tu informe…',
    step1: 'Paso 1: Motor de lógica difusa calificando la gravedad de cada valor',
    step2: 'Paso 2: Detectando patrones entre marcadores relacionados',
    step3: 'Paso 3: IA escribiendo explicaciones en lenguaje sencillo',
    within_range: '✓ Normal', borderline_low: '↓ Ligeramente Bajo', mildly_low: '↓ Levemente Bajo',
    moderately_low: '↓ Moderadamente Bajo', severely_low: '↓↓ Gravemente Bajo', critically_low: '↓↓ Críticamente Bajo',
    borderline_high: '↑ Ligeramente Alto', mildly_high: '↑ Levemente Alto', moderately_high: '↑ Moderadamente Alto',
    severely_high: '↑↑ Gravemente Alto', critically_high: '↑↑ Críticamente Alto',
    allNormalStatus: 'Todos los valores dentro del rango normal', attentionNeeded: 'Algunos valores necesitan atención',
    urgent: 'Urgente — consulta a tu médico', analysisComplete: 'Análisis completo',
    actionNeeded: 'Acción Requerida', highConfidence: 'Alta confianza', moderateConfidence: 'Confianza moderada', lowConfidence: 'Baja confianza',
    uploadHint: 'Informes PDF, texto plano, CSV — Máx 5MB PDF / 200KB texto',
    pastePlaceholder: 'Pega tus resultados de laboratorio aquí...\n\nEjemplo:\nHemoglobin: 11.8 g/dL  [Ref: 13.5-17.5]  LOW\nWBC: 11.2 K/uL  [Ref: 4.5-11.0]  HIGH\nFerritin: 6 ng/mL  [Ref: 12-300]  LOW\n\nLabLens funciona mejor cuando los valores incluyen rangos de referencia.',
    sampleCBC: 'CBC de Muestra', uploadPDF: '↑ Subir PDF / TXT', readingPDF: 'Leyendo PDF…',
    explainReport: 'Explicar Mi Informe →', clear: 'Limpiar', analyzeAnother: 'Analizar Otro Informe',
    errorEmpty: 'Por favor pega tus resultados de laboratorio o informe médico.',
    errorShort: 'El informe es muy corto. Por favor pega el texto completo.',
    errorPDFLarge: 'PDF demasiado grande. Máx 5MB.', errorFileLarge: 'Archivo demasiado grande. Máx 200KB.',
    errorPDFRead: 'Error al leer PDF: ', errorPDFExtract: 'No se pudo extraer texto de este PDF. Puede ser una imagen escaneada. Por favor pega el texto manualmente.',
    errorParse: 'No se pudo analizar la respuesta de la IA. El modelo devolvió un formato inesperado. Inténtalo de nuevo.',
    howItWorks: 'Cómo Funciona LabLens', pasteUpload: 'Pegar o subir',
    pasteUploadDesc: 'Texto, informes PDF, o CSV — hasta 5MB',
    fuzzyScoring: 'Puntuación difusa', fuzzyScoringDesc: 'Cada valor se califica 0-100% gravedad — no solo ALTO/BAJO',
    patternDetection: 'Detección de patrones', patternDetectionDesc: 'Agrupa marcadores relacionados en patrones médicos nombrados',
    yourLanguage: 'Tu idioma', yourLanguageDesc: 'Salida en inglés, hindi, español o tamil',
    doctorQuestions: 'Preguntas para el médico', doctorQuestionsDesc: 'Preguntas específicas de valores para tu cita',
    private: 'Privado', privateDesc: 'Nada se almacena. Tus datos nunca salen de tu sesión.',
    worksWith: 'Compatible con',
  },
  tamil: {
    summary: 'சுருக்கம்', values: 'மதிப்புகள்', flagged: 'குறிக்கப்பட்டவை', patterns: 'முறைகள்', askDoctor: 'மருத்துவரிடம் கேளுங்கள்',
    plainSummary: 'எளிய மொழி சுருக்கம்', whatYouCanDo: 'நீங்கள் என்ன செய்யலாம்', bringToAppointment: 'உங்கள் சந்திப்பிற்கு இவற்றைக் கொண்டு வாருங்கள்',
    importantCaution: '⚕ முக்கிய எச்சரிக்கை',
    educationalOnly: 'இது கல்வி நோக்கங்களுக்காக மட்டுமே AI உருவாக்கிய விளக்கமாகும். இது மருத்துவ நோயறிதல் அல்ல. எந்த உடல்நல முடிவையும் எடுப்பதற்கு முன் தகுதிவாய்ந்த மருத்துவரை அணுகவும்.',
    noAbnormal: 'அசாதாரண மதிப்புகள் எதுவும் கண்டறியப்படவில்லை', allNormal: 'அனைத்து அறிக்கையிடப்பட்ட மதிப்புகளும் சாதாரண குறிப்பு வரம்புகளுக்குள் உள்ளன',
    noPatterns: 'இந்த அறிக்கையில் குறிப்பிடத்தக்க பல-மார்க்கர் முறைகள் எதுவும் கண்டறியப்படவில்லை.',
    whatDoctorChecks: 'உங்கள் மருத்துவர் என்ன சோதிப்பார்', analyzing: 'உங்கள் அறிக்கை பகுப்பாய்வு செய்யப்படுகிறது…',
    step1: 'படி 1: பிளஸி தர்க்க இயந்திரம் ஒவ்வொரு மதிப்பின் தீவிரத்தையும் மதிப்பிடுகிறது',
    step2: 'படி 2: தொடர்புடைய மார்க்கர்களுக்கு இடையே முறைகளைக் கண்டறிகிறது',
    step3: 'படி 3: AI எளிய மொழியில் விளக்கங்களை எழுதுகிறது',
    within_range: '✓ சாதாரணம்', borderline_low: '↓ எல்லைக்கு அருகில் குறைவு', mildly_low: '↓ சற்று குறைவு',
    moderately_low: '↓ மிதமான குறைவு', severely_low: '↓↓ கடுமையான குறைவு', critically_low: '↓↓ மிகக் கடுமையான குறைவு',
    borderline_high: '↑ எல்லைக்கு அருகில் அதிகம்', mildly_high: '↑ சற்று அதிகம்', moderately_high: '↑ மிதமான அதிகம்',
    severely_high: '↑↑ கடுமையான அதிகம்', critically_high: '↑↑ மிகக் கடுமையான அதிகம்',
    allNormalStatus: 'அனைத்து மதிப்புகளும் சாதாரண வரம்பில்', attentionNeeded: 'சில மதிப்புகளுக்கு கவனம் தேவை',
    urgent: 'அவசரம் — தயவுசெய்து உங்கள் மருத்துவரை அணுகவும்', analysisComplete: 'பகுப்பாய்வு முடிந்தது',
    actionNeeded: 'நடவடிக்கை தேவை', highConfidence: 'அதிக நம்பகத்தன்மை', moderateConfidence: 'மிதமான நம்பகத்தன்மை', lowConfidence: 'குறைந்த நம்பகத்தன்மை',
    uploadHint: 'PDF மருத்துவ அறிக்கைகள், சாதாரண உரை, CSV — அதிகபட்சம் 5MB PDF / 200KB உரை',
    pastePlaceholder: 'உங்கள் மருத்துவ முடிவுகளை இங்கே ஒட்டவும்...\n\nஉதாரணம்:\nHemoglobin: 11.8 g/dL  [Ref: 13.5-17.5]  LOW\nWBC: 11.2 K/uL  [Ref: 4.5-11.0]  HIGH\nFerritin: 6 ng/mL  [Ref: 12-300]  LOW\n\nLabLens மதிப்புகளில் குறிப்பு வரம்புகள் இருக்கும்போது சிறப்பாக செயல்படும்.',
    sampleCBC: 'மாதிரி CBC', uploadPDF: '↑ PDF / TXT பதிவேற்றம்', readingPDF: 'PDF படிக்கப்படுகிறது…',
    explainReport: 'என் அறிக்கையை விளக்கு →', clear: 'அழி', analyzeAnother: 'மற்றொரு அறிக்கையை பகுப்பாய்வு செய்',
    errorEmpty: 'தயவுசெய்து உங்கள் மருத்துவ முடிவுகள் அல்லது அறிக்கையை ஒட்டவும்.',
    errorShort: 'அறிக்கை மிகவும் குறுகியது. தயவுசெய்து முழு உரையை ஒட்டவும்.',
    errorPDFLarge: 'PDF மிகப்பெரியது. அதிகபட்சம் 5MB.', errorFileLarge: 'கோப்பு மிகப்பெரியது. அதிகபட்சம் 200KB.',
    errorPDFRead: 'PDF படிப்பது தோல்வியடைந்தது: ', errorPDFExtract: 'இந்த PDF இலிருந்து உரையை பிரித்தெடுக்க முடியவில்லை. இது ஸ்கேன் செய்யப்பட்ட படமாக இருக்கலாம். தயவுசெய்து உரையை கைமுறையாக ஒட்டவும்.',
    errorParse: 'AI பதிலை பகுப்பாய்வு செய்ய முடியவில்லை. மாதிரி எதிர்பாராத வடிவத்தை வழங்கியது. மீண்டும் முயற்சிக்கவும்.',
    howItWorks: 'LabLens எப்படி செயல்படுகிறது', pasteUpload: 'ஒட்டவும் அல்லது பதிவேற்றவும்',
    pasteUploadDesc: 'உரை, PDF மருத்துவ அறிக்கைகள், அல்லது CSV — அதிகபட்சம் 5MB',
    fuzzyScoring: 'பிளஸி மதிப்பீடு', fuzzyScoringDesc: 'ஒவ்வொரு மதிப்பும் 0-100% தீவிரத்தில் மதிப்பிடப்படுகிறது — வெறும் HIGH/LOW அல்ல',
    patternDetection: 'முறை கண்டறிதல்', patternDetectionDesc: 'தொடர்புடைய மார்க்கர்களை பெயரிடப்பட்ட மருத்துவ முறைகளில் தொகுக்கிறது',
    yourLanguage: 'உங்கள் மொழி', yourLanguageDesc: 'ஆங்கிலம், இந்தி, ஸ்பானிஷ், அல்லது தமிழ் வெளியீடு',
    doctorQuestions: 'மருத்துவர் கேள்விகள்', doctorQuestionsDesc: 'உங்கள் சந்திப்பிற்கான மதிப்பு-குறிப்பிட்ட கேள்விகள்',
    private: 'தனிப்பட்ட', privateDesc: 'எதுவும் சேமிக்கப்படுவதில்லை. உங்கள் தரவு உங்கள் அமர்வை விட்டு வெளியேறுவதில்லை.',
    worksWith: 'இதனுடன் பணிபுரிகிறது',
  },
  english: {
    summary: 'Summary', values: 'Values', flagged: 'Flagged', patterns: 'Patterns', askDoctor: 'Ask Doctor',
    plainSummary: 'Plain English Summary', whatYouCanDo: 'What You Can Do', bringToAppointment: 'Bring These to Your Appointment',
    importantCaution: '⚕ IMPORTANT CAUTION',
    educationalOnly: 'This is an AI-generated explanation for educational purposes only. It is not a medical diagnosis. Always consult a qualified doctor before making any health decisions.',
    noAbnormal: 'No abnormal values detected', allNormal: 'All reported values appear within normal reference ranges',
    noPatterns: 'No significant multi-marker patterns detected in this report.',
    whatDoctorChecks: 'What Your Doctor Will Likely Check', analyzing: 'Analyzing your report…',
    step1: "Step 1: Fuzzy logic engine scoring each value's severity",
    step2: 'Step 2: Detecting patterns across related markers',
    step3: 'Step 3: AI writing plain-language explanations',
    within_range: '✓ Normal', borderline_low: '↓ Borderline Low', mildly_low: '↓ Mildly Low',
    moderately_low: '↓ Moderately Low', severely_low: '↓↓ Severely Low', critically_low: '↓↓ Critical Low',
    borderline_high: '↑ Borderline High', mildly_high: '↑ Mildly High', moderately_high: '↑ Moderately High',
    severely_high: '↑↑ Severely High', critically_high: '↑↑ Critical High',
    allNormalStatus: 'All values within normal range', attentionNeeded: 'Some values need attention',
    urgent: 'Urgent — please consult your doctor', analysisComplete: 'Analysis complete',
    actionNeeded: 'Action Needed', highConfidence: 'High confidence', moderateConfidence: 'Moderate confidence', lowConfidence: 'Low confidence',
    uploadHint: 'PDF lab reports, plain text, CSV · Max 5MB PDF / 200KB text',
    pastePlaceholder: "Paste your lab results here...\n\nExample:\nHemoglobin: 11.8 g/dL  [Ref: 13.5-17.5]  LOW\nWBC: 11.2 K/uL  [Ref: 4.5-11.0]  HIGH\nFerritin: 6 ng/mL  [Ref: 12-300]  LOW\n\nLabLens works best when values include reference ranges.",
    sampleCBC: 'Sample CBC', uploadPDF: '↑ Upload PDF / TXT', readingPDF: 'Reading PDF…',
    explainReport: 'Explain My Report →', clear: 'Clear', analyzeAnother: 'Analyze Another Report',
    errorEmpty: 'Please paste your lab results or medical report.',
    errorShort: 'Report is too short. Please paste the full text.',
    errorPDFLarge: 'PDF too large. Max 5MB.', errorFileLarge: 'File too large. Max 200KB.',
    errorPDFRead: 'PDF reading failed: ', errorPDFExtract: 'Could not extract text from this PDF. It may be a scanned image. Please paste the text manually.',
    errorParse: 'Could not parse AI response. The model returned an unexpected format. Please try again.',
    howItWorks: 'How LabLens Works', pasteUpload: 'Paste or upload',
    pasteUploadDesc: 'Text, PDF lab reports, or CSV — up to 5MB',
    fuzzyScoring: 'Fuzzy scoring', fuzzyScoringDesc: 'Every value scored 0–100% severity — not just HIGH/LOW',
    patternDetection: 'Pattern detection', patternDetectionDesc: 'Clusters related markers into named medical patterns',
    yourLanguage: 'Your language', yourLanguageDesc: 'English, Hindi, Spanish, or Tamil output',
    doctorQuestions: 'Doctor questions', doctorQuestionsDesc: 'Value-specific questions for your appointment',
    private: 'Private', privateDesc: 'Nothing stored. Your data never leaves your session.',
    worksWith: 'Works With',
  }
};

function t(key, lang) {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.english[key] || key;
}

// ═══════════════════════════════════════════════════════════════
// AI PROMPTS — Two-step approach: English JSON first, then translate
// ═══════════════════════════════════════════════════════════════
function buildSystemPrompt() {
  return `You are LabLens, an expert medical report explainer. You help patients understand lab results in plain, accurate, trustworthy language. You NEVER diagnose — you explain, contextualize, and guide.

You receive a lab report AND pre-computed fuzzy severity scores. Use the scores to calibrate your language.

RESPOND ONLY with a valid JSON object. No markdown, no preamble, no trailing commas, no unescaped newlines in strings. ALL string values must be in English. No other language in the JSON:
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
- Syndrome confidence >0.7: speak with confidence. <0.4: say "may suggest".`;
}

function buildTranslationPrompt(targetLang) {
  const langNames = { hindi: 'Hindi', spanish: 'Spanish', tamil: 'Tamil' };
  const langName = langNames[targetLang] || targetLang;
  return `You are a professional medical translator. Translate the following JSON content into ${langName} for patient-friendly display. 

RULES:
1. Keep ALL keys (like "headline", "summary", "parameter", "value", "fuzzy_label", "fuzzy_score", "flag") in English exactly as they are
2. Only translate the STRING VALUES into ${langName}
3. Maintain medical accuracy — use standard medical terminology in ${langName}
4. Keep numbers, units, and percentages unchanged
5. Return ONLY valid JSON. No markdown, no preamble, no trailing commas, no unescaped newlines in strings
6. Write all translated strings on a single line. Escape quotes properly.

Translate this JSON:`;
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
    { code: 'english', label: 'English', flag: '🇬🇧', font: "'Space Mono', 'Poppins', monospace" },
    { code: 'hindi',   label: 'हिंदी',   flag: '🇮🇳', font: "'Poppins', 'Noto Sans Devanagari', 'Space Mono', sans-serif" },
    { code: 'spanish', label: 'Español', flag: '🇪🇸', font: "'Space Mono', 'Poppins', monospace" },
    { code: 'tamil',   label: 'தமிழ்',  flag: '🇮🇳', font: "'Noto Sans Tamil', 'Poppins', 'Space Mono', sans-serif" },
  ];

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

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

  function severityColor(label) {
    if (!label || label === 'within_range') return green;
    if (label.includes('critical'))  return red;
    if (label.includes('severe'))    return '#fb923c';
    if (label.includes('moderate'))  return '#f59e0b';
    if (label.includes('mild'))      return '#84cc16';
    if (label.includes('borderline')) return muted;
    return muted;
  }

  function severityLabel(label, lang = language) {
    const key = label || 'within_range';
    return t(key, lang) || {
      within_range:'✓ Normal', borderline_low:'↓ Borderline Low', mildly_low:'↓ Mildly Low',
      moderately_low:'↓ Moderately Low', severely_low:'↓↓ Severely Low', critically_low:'↓↓ Critical Low',
      borderline_high:'↑ Borderline High', mildly_high:'↑ Mildly High', moderately_high:'↑ Moderately High',
      severely_high:'↑↑ Severely High', critically_high:'↑↑ Critical High',
    }[label] || label;
  }

  function overallBadge(status) {
    if (status === 'normal')           return { color: green, icon: '✓', label: t('allNormalStatus', language) };
    if (status === 'attention_needed') return { color: warn,  icon: '⚠', label: t('attentionNeeded', language) };
    if (status === 'urgent')           return { color: red,   icon: '🚨', label: t('urgent', language) };
    return { color: muted, icon: '·', label: t('analysisComplete', language) };
  }

  function handleInput(val) {
    if (val.length <= MAX_CHARS) { setReport(val); setCharCount(val.length); setError(''); }
  }

  function loadSample() { handleInput(SAMPLE_REPORT); setResult(null); setFuzzyData(null); }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size > 5 * 1024 * 1024) { setError(t('errorPDFLarge', language)); return; }
      setLoadingPdf(true);
      setError('');
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error(t('errorPDFRead', language) + 'Could not load PDF reader.'));
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
          setError(t('errorPDFExtract', language));
        } else {
          handleInput(fullText.slice(0, MAX_CHARS));
        }
      } catch (err) {
        setError(t('errorPDFRead', language) + err.message);
      } finally {
        setLoadingPdf(false);
      }
      return;
    }

    if (file.size > 200000) { setError(t('errorFileLarge', language)); return; }
    const reader = new FileReader();
    reader.onload = ev => handleInput((ev.target.result || '').slice(0, MAX_CHARS));
    reader.readAsText(file);
  }

  // ── analyze — TWO-STEP: English JSON first, then translate ──
  const analyze = useCallback(async () => {
    if (!report.trim())            { setError(t('errorEmpty', language)); return; }
    if (report.trim().length < 30) { setError(t('errorShort', language)); return; }

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

      // Step 2: AI — ALWAYS request English JSON (100% reliable parsing)
      const primaryModel  = TOOL_MODELS.labLens || MODELS.HEAVY;
      const fallbackModel = MODELS.MEDIUM;

      const callAI = async (model, toolId, promptOverride) => fetchWithBackoff(GROQ_API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model, max_tokens: 2000, temperature: 0.1, toolId,
          messages: [
            { role: 'system', content: promptOverride || buildSystemPrompt() },
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
      let parsed = safeParseJSON(raw);

      // Step 3: TWO-STEP TRANSLATION — If not English, translate JSON in second call
      if (language !== 'english') {
        try {
          const transRes = await callAI(
            fallbackModel, 
            'lablens-translate', 
            buildTranslationPrompt(language)
          );
          const transData = await transRes.json();
          const transRaw  = transData?.choices?.[0]?.message?.content || '';
          const translated = safeParseJSON(transRaw);
          if (translated && translated.headline) {
            parsed = translated;
          }
        } catch (transErr) {
          console.warn('Translation failed, showing English:', transErr);
        }
      }

      setResult(parsed);
      setActiveTab('summary');
    } catch (err) {
      setError(err.message || t('errorParse', language));
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color, fontWeight: 600, fontFamily: currentLang.font }}>{severityLabel(label)}</span>
          {score > 0 && <span style={{ fontSize: '0.62rem', color: muted }}>{pct}% severity</span>}
        </div>
        <div style={{ height: '4px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, width: '100%' }}>
      {/* Font injection for Devanagari/Tamil */}
      {(language === 'hindi' || language === 'tamil') && (
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      )}
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 20px 80px', fontFamily: currentLang.font }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)', border: `1px solid rgba(16,185,129,0.25)`, borderRadius: '100px', padding: '5px 16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.18em' }}>◆ MEDICAL · AI + FUZZY LOGIC</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', 'Poppins', sans-serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '10px' }}>
            Lab<span style={{ color: green }}>Lens</span>
          </h1>
          <p style={{ fontSize: '0.92rem', color: muted, lineHeight: 1.75, maxWidth: '580px', marginBottom: '16px', textAlign: 'justify' }}>
            {t('pasteUploadDesc', language)}. LabLens scores every value on a nuanced severity scale using fuzzy logic, then AI explains what it means — in your language.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: warnBg, border: `1px solid ${warnBorder}`, borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontSize: '0.7rem', color: warn, fontWeight: 600 }}>⚕ {t('educationalOnly', language).split('।')[0].split('.')[0]}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '6px 14px' }}>
              <span style={{ fontSize: '0.7rem', color: green, fontWeight: 600 }}>✓ {language === 'english' ? 'Nuanced severity — not just HIGH/LOW' : t('fuzzyScoringDesc', language)}</span>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.12em', marginBottom: '10px', textTransform: 'uppercase' }}>Output Language / भाषा / Idioma / மொழி</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LANGUAGES.map(lang => {
              const active = language === lang.code;
              return (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  style={{ background: active ? (isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.09)') : card, border: `1px solid ${active ? green+'80' : border}`, borderRadius: '10px', padding: '8px 18px', fontSize: '0.8rem', color: active ? green : text, cursor: 'pointer', fontFamily: lang.font, fontWeight: active ? 700 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: active ? `0 0 0 2px ${green}22` : 'none' }}>
                  <span>{lang.flag}</span> <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
          {language !== 'english' && (
            <div style={{ marginTop: '8px', fontSize: '0.68rem', color: muted, paddingLeft: '2px' }}>
              ⓘ {t('pasteUploadDesc', language)} — {language === 'hindi' ? 'Hindi' : language === 'spanish' ? 'Spanish' : 'Tamil'}
            </div>
          )}
        </div>

        {/* Input Card */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Paste Lab Report / Results</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={loadSample}
                style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.07)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: '8px', padding: '5px 12px', fontSize: '0.7rem', color: green, cursor: 'pointer', fontFamily: currentLang.font }}>
                {t('sampleCBC', language)}
              </button>
              <button onClick={() => fileRef.current?.click()} disabled={loadingPdf}
                style={{ background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.07)', border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.2)'}`, borderRadius: '8px', padding: '5px 12px', fontSize: '0.7rem', color: ac, cursor: loadingPdf ? 'wait' : 'pointer', fontFamily: currentLang.font, opacity: loadingPdf ? 0.6 : 1 }}>
                {loadingPdf ? t('readingPDF', language) : t('uploadPDF', language)}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv"
                style={{ display: 'none' }} onChange={handleFile} />
            </div>
          </div>

          <div style={{ marginBottom: '10px', fontSize: '0.67rem', color: muted }}>
            {t('uploadHint', language)}
          </div>

          <textarea
            value={report}
            onChange={e => handleInput(e.target.value)}
            placeholder={t('pastePlaceholder', language)}
            style={{ width: '100%', minHeight: '200px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${border}`, borderRadius: '10px', padding: '16px', color: text, fontSize: '0.82rem', lineHeight: 1.7, resize: 'vertical', fontFamily: currentLang.font, outline: 'none', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: charCount > MAX_CHARS * 0.9 ? warn : muted }}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {report && <button onClick={clear} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: '8px', padding: '8px 16px', fontSize: '0.72rem', color: muted, cursor: 'pointer', fontFamily: currentLang.font }}>{t('clear', language)}</button>}
              <button onClick={analyze} disabled={loading || !report.trim()}
                style={{ background: report.trim() && !loading ? `linear-gradient(135deg,${green},#059669)` : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '0.82rem', fontWeight: 700, color: report.trim() && !loading ? '#fff' : muted, cursor: report.trim() && !loading ? 'pointer' : 'not-allowed', fontFamily: currentLang.font, transition: 'all 0.2s' }}>
                {loading ? t('analyzing', language) : t('explainReport', language)}
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
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '10px' }}>{t('analyzing', language)}</div>
            <div style={{ fontSize: '0.78rem', color: muted, lineHeight: 2 }}>
              {t('step1', language)}<br />
              {t('step2', language)}<br />
              {t('step3', language)}
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
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: red, marginBottom: '4px' }}>{t('actionNeeded', language)}</div>
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
                { key: 'summary',   label: t('summary', language) },
                { key: 'findings',  label: `${t('values', language)} (${(result.findings||[]).length})` },
                { key: 'flagged',   label: `${t('flagged', language)} (${flagged.length})` },
                { key: 'patterns',  label: `${t('patterns', language)} (${(result.syndrome_explanations||[]).length})` },
                { key: 'questions', label: t('askDoctor', language) },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ flex: 1, background: activeTab === tab.key ? (isDark ? 'rgba(255,255,255,0.08)' : '#fff') : 'transparent', border: activeTab === tab.key ? `1px solid ${border}` : '1px solid transparent', borderRadius: '7px', padding: '8px 2px', fontSize: '0.6rem', color: activeTab === tab.key ? (isDark ? '#fff' : '#1a1a1a') : muted, cursor: 'pointer', fontFamily: currentLang.font, transition: 'all 0.15s', fontWeight: activeTab === tab.key ? 700 : 400 }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Summary tab */}
            {activeTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px' }}>
                  <div style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.15em', marginBottom: '12px', textTransform: 'uppercase' }}>◆ {t('plainSummary', language)}</div>
                  <p style={{ fontSize: '0.92rem', color: text, lineHeight: 1.85, margin: 0 }}>{result.summary}</p>
                </div>
                {result.lifestyle_notes?.length > 0 && (
                  <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '22px' }}>
                    <div style={{ fontSize: '0.6rem', color: green, letterSpacing: '0.15em', marginBottom: '14px', textTransform: 'uppercase' }}>◆ {t('whatYouCanDo', language)}</div>
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
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: green, marginBottom: '6px' }}>{t('noAbnormal', language)}</div>
                    <div style={{ fontSize: '0.82rem', color: muted }}>{t('allNormal', language)}</div>
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
                      <div style={{ fontSize: '0.88rem', color: muted }}>{t('noPatterns', language)}</div>
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
                              {conf >= 0.8 ? t('highConfidence', language) : conf >= 0.5 ? t('moderateConfidence', language) : t('lowConfidence', language)}
                            </div>
                          </div>
                          <SeverityBar score={conf} label={conf > 0.7 ? 'severely_high' : conf > 0.4 ? 'moderately_high' : 'mildly_high'} />
                          <div style={{ fontSize: '0.88rem', color: text, lineHeight: 1.75, marginTop: '14px' }}>{s.plain_explanation}</div>
                          {s.what_doctor_looks_for && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${border}` }}>
                              <div style={{ fontSize: '0.6rem', color: ac, letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>{t('whatDoctorChecks', language)}</div>
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
                  <div style={{ fontSize: '0.6rem', color: ac, letterSpacing: '0.15em', marginBottom: '18px', textTransform: 'uppercase' }}>◆ {t('bringToAppointment', language)}</div>
                  {(result.questions_for_doctor||[]).map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingBottom: i < result.questions_for_doctor.length-1 ? '16px' : 0, marginBottom: i < result.questions_for_doctor.length-1 ? '16px' : 0, borderBottom: i < result.questions_for_doctor.length-1 ? `1px solid ${border}` : 'none' }}>
                      <div style={{ background: ac, color: '#fff', fontSize: '0.62rem', fontWeight: 700, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>{i+1}</div>
                      <span style={{ fontSize: '0.88rem', color: text, lineHeight: 1.75 }}>{q}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: warnBg, border: `1px solid ${warnBorder}`, borderRadius: '10px', padding: '16px 18px' }}>
                  <div style={{ fontSize: '0.75rem', color: warn, fontWeight: 700, marginBottom: '10px', letterSpacing: '0.05em' }}>{t('importantCaution', language)}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.72rem', color: warn, lineHeight: 1.7 }}>🇬🇧 {TRANSLATIONS.english.educationalOnly}</div>
                    <div style={{ fontSize: '0.72rem', color: warn, lineHeight: 1.7 }}>🇮🇳 {TRANSLATIONS.hindi.educationalOnly}</div>
                    <div style={{ fontSize: '0.72rem', color: warn, lineHeight: 1.7 }}>🇪🇸 {TRANSLATIONS.spanish.educationalOnly}</div>
                    <div style={{ fontSize: '0.72rem', color: warn, lineHeight: 1.7 }}>🇮🇳 {TRANSLATIONS.tamil.educationalOnly}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '28px', textAlign: 'center' }}>
              <button onClick={clear} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: '10px', padding: '10px 28px', fontSize: '0.78rem', color: muted, cursor: 'pointer', fontFamily: currentLang.font }}>
                {t('analyzeAnother', language)}
              </button>
            </div>
          </div>
        )}

        {/* Pre-result info */}
        {!result && !loading && (
          <div style={{ marginTop: '40px' }}>
            <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.15em', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase' }}>{t('howItWorks', language)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { icon: '📋', title: t('pasteUpload', language), desc: t('pasteUploadDesc', language) },
                { icon: '⚖️', title: t('fuzzyScoring', language), desc: t('fuzzyScoringDesc', language) },
                { icon: '🧩', title: t('patternDetection', language), desc: t('patternDetectionDesc', language) },
                { icon: '🌐', title: t('yourLanguage', language), desc: t('yourLanguageDesc', language) },
                { icon: '🩺', title: t('doctorQuestions', language), desc: t('doctorQuestionsDesc', language) },
                { icon: '🔒', title: t('private', language), desc: t('privateDesc', language) },
              ].map((item, i) => (
                <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: isDark ? '#fff' : '#1a1a1a', marginBottom: '5px' }}>{item.title}</div>
                  <div style={{ fontSize: '0.7rem', color: muted, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ fontSize: '0.6rem', color: muted, letterSpacing: '0.12em', marginBottom: '12px', textTransform: 'uppercase' }}>{t('worksWith', language)}</div>
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
