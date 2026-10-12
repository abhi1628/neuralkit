// src/labCore.js — LabLens engine v3
//
// Design: RULES MEASURE, AI EXPLAINS, CODE VERIFIES.
//  • Parser reads real lab-report tables (multi-space columns, one-sided ranges, flags, Indian units)
//  • Every value is normalised to a canonical unit before any threshold is applied (no unit-mistake alarms)
//  • Severity is calibrated; only analyte-specific emergency thresholds can say "urgent"
//  • The AI never sees the patient's name/ID — only test names and numbers — and its text is validated:
//    any number it invents is rejected and replaced with rule-based text
//  • Without AI the tool still works: meanings, notes, patterns and questions are rule-based
//  • Reports of any length are handled (no 5,000-character cap): values are parsed in code, AI works in batches
//
// Not a medical device. It explains reports; it does not diagnose.

import { aiCall, parseJsonLoose, numberSet, ungroundedNumbers, clamp } from './resumeCore';

/* ═══════════════════════════════════════════════════════════════
   1. Unit families (factor × reported value = canonical value)
═══════════════════════════════════════════════════════════════ */
const THOU = [/^(x?10e?3|x?103|k|thou|thous|thousand)s?\/(ul|mm3|cumm|cmm|l)$/, 1];
const THOU_G = [/^(x?109|g|giga)\/l$/, 1];
const THOU_RAW = [/^(\/|cells\/|cell\/|no\/|n\/)?(ul|mm3|cumm|cmm)$/, 0.001];
const LAKH = [/^lakhs?\/(cumm|cmm|mm3|ul)$/, 100];
const MILL = [/^(x?10e?6|x?106|m|mill|mil|million)s?\/(ul|mm3|cumm|cmm)$/, 1];
const MILL_L = [/^(x?1012|t|tera)\/l$/, 1];
const MILL_RAW = [/^(\/|cells\/)?(ul|mm3|cumm|cmm)$/, 1e-6];

const GDL = [/^(g\/?dl|gm\/?dl|gms\/?dl|gm%|g%|gram\/?dl)$/, 1];
const GL_TO_GDL = [/^g\/l$/, 0.1];
const MGDL = [/^mg\/?dl$/, 1];
const PCT = [/^(%|percent|pct)$/, 1];

/* ═══════════════════════════════════════════════════════════════
   2. Analyte database
═══════════════════════════════════════════════════════════════
 id, label, re (name match), unit (canonical), units [[regex, factor|fn]], plaus [min,max] (canonical),
 ref {all:[lo,hi]} | {male:[..],female:[..]}, th (emergency / severity thresholds), tol (variation tolerance),
 meaning, low, high  — short, conservative, patient-level statements.                                          */
const A = [];
const add = (o) => A.push({ tol: 1, th: {}, ...o });

// ── Blood count
add({ id: 'hba1c', label: 'HbA1c', re: /hba1c|\ba1c\b|glycat|glycos|glyco/, unit: '%', units: [PCT, [/^mmol\/mol$/, (v) => v / 10.929 + 2.15]], plaus: [3, 20], ref: { all: [4, 5.6] }, th: { modHigh: 8, sevHigh: 10 }, group: 'Blood sugar',
  meaning: 'Your average blood sugar over roughly the last 3 months.',
  low: 'A low value is usually not a concern on its own.',
  high: 'Higher values mean blood sugar has been running high. 5.7–6.4% is the prediabetes range and 6.5% or more is the diabetes range (a doctor confirms this).' });
add({ id: 'hemoglobin', label: 'Hemoglobin', re: /\bhemoglobin\b|\bhaemoglobin\b|\bhgb\b|\bhb\b/, not: /hba1c|glyc/, unit: 'g/dL', units: [GDL, GL_TO_GDL], plaus: [3, 25], ref: { male: [13, 17], female: [12, 15.5] }, th: { sevLow: 9, urgLow: 7, modLow: 11 }, group: 'Blood count',
  meaning: 'The protein in red blood cells that carries oxygen around your body.',
  low: 'Low hemoglobin means anemia. Iron deficiency is the most common cause, but low vitamin B12 or folate, blood loss and long-term illness can also cause it.',
  high: 'High hemoglobin can occur with dehydration, smoking, living at high altitude or conditions that increase red-cell production.' });
add({ id: 'hematocrit', label: 'Hematocrit (PCV)', re: /hematocrit|haematocrit|\bpcv\b|\bhct\b|packed cell/, unit: '%', units: [PCT], plaus: [10, 70], ref: { male: [40, 52], female: [36, 46] }, group: 'Blood count',
  meaning: 'The share of your blood volume that is red blood cells.',
  low: 'Usually goes along with anemia.', high: 'Often reflects dehydration or increased red-cell production.' });
add({ id: 'rbc', label: 'Red blood cells (RBC)', re: /\brbc\b|red blood cell|red cell count|erythrocyte/, not: /distribution|rdw/, unit: 'million/µL', units: [MILL, MILL_L, MILL_RAW], plaus: [1, 9], ref: { male: [4.5, 5.9], female: [4.1, 5.1] }, group: 'Blood count',
  meaning: 'The number of oxygen-carrying red cells in your blood.',
  low: 'A low count goes with anemia.', high: 'A high count can occur with dehydration, smoking or some blood conditions; in iron deficiency or thalassemia trait the count can be normal or high while the cells are small.' });
add({ id: 'wbc', label: 'White blood cells (WBC)', re: /\bwbc\b|\btlc\b|white blood cell|leuc?kocyte|total leu|total wbc|white cell count/, not: /differential/, unit: '×10³/µL', units: [THOU, THOU_G, LAKH, THOU_RAW], plaus: [0.1, 300], ref: { all: [4, 11] }, th: { urgLow: 1, sevLow: 2, urgHigh: 30, sevHigh: 20 }, group: 'Blood count',
  meaning: 'The cells that defend your body against infection.',
  low: 'Low white cells can follow viral infections, some medicines or bone-marrow problems.',
  high: 'High white cells usually point to infection or inflammation; stress, steroid medicines and smoking can also raise them.' });
add({ id: 'platelets', label: 'Platelets', re: /platelet|\bplt\b/, not: /distribution|pdw|mpv|large/, unit: '×10³/µL', units: [THOU, THOU_G, LAKH, THOU_RAW], plaus: [2, 3000], ref: { all: [150, 450] }, th: { urgLow: 20, sevLow: 50, modLow: 100, urgHigh: 1000 }, group: 'Blood count',
  meaning: 'Tiny cell fragments that help your blood clot.',
  low: 'Low platelets can raise the risk of bleeding or bruising. Viral infections such as dengue, some medicines and immune conditions are common causes.',
  high: 'High platelets often follow infection or inflammation, and can also occur with iron deficiency.' });
add({ id: 'mcv', label: 'MCV', re: /\bmcv\b|mean cell volume|mean corpuscular volume/, unit: 'fL', units: [[/^(fl|femtoliter|fl\.)$/, 1]], plaus: [40, 160], ref: { all: [80, 100] }, group: 'Blood count',
  meaning: 'The average size of your red blood cells.',
  low: 'Small red cells are typical of iron deficiency or thalassemia trait.',
  high: 'Large red cells can come from low vitamin B12 or folate, alcohol use, thyroid or liver conditions.' });
add({ id: 'mchc', label: 'MCHC', re: /\bmchc\b/, unit: 'g/dL', units: [GDL, GL_TO_GDL, PCT], plaus: [20, 45], ref: { all: [32, 36] }, group: 'Blood count',
  meaning: 'How concentrated the hemoglobin is inside your red cells.', low: 'Low values (pale cells) go with iron deficiency.', high: 'High values are uncommon and can be a lab artifact.' });
add({ id: 'mch', label: 'MCH', re: /\bmch\b/, unit: 'pg', units: [[/^pg$/, 1]], plaus: [10, 50], ref: { all: [27, 33] }, group: 'Blood count',
  meaning: 'The average amount of hemoglobin in each red cell.', low: 'Low values are typical of iron deficiency.', high: 'High values can accompany large red cells (low B12 or folate).' });
add({ id: 'rdw', label: 'RDW', re: /\brdw\b|red cell distribution|red blood cell distribution/, unit: '%', units: [PCT], plaus: [8, 40], ref: { all: [11.5, 14.5] }, group: 'Blood count',
  meaning: 'How much your red cells vary in size.', low: 'A low value is not usually a concern.', high: 'A high value is often an early sign of iron, B12 or folate deficiency.' });
const DIFF = [
  ['neutrophils', 'Neutrophils', /neutrophil|polymorph|\bneut\b|segmented|\bpmn\b|\bpolys?\b/, [40, 75], 'The white cells that fight bacterial infection.', 'Low neutrophils can follow viral infections or some medicines.', 'High neutrophils commonly signal a bacterial infection or inflammation; stress and steroid medicines can also raise them.'],
  ['lymphocytes', 'Lymphocytes', /lymphocyte|\blymph\b/, [20, 45], 'White cells that fight viruses and build immunity.', 'Low lymphocytes can occur with stress, steroids or some infections.', 'High lymphocytes are common during viral infections.'],
  ['eosinophils', 'Eosinophils', /eosinophil|\beos\b/, [1, 6], 'White cells involved in allergies and parasite defence.', 'A low value is usually not a concern.', 'High eosinophils usually point to allergy, asthma or a parasitic infection.'],
  ['monocytes', 'Monocytes', /monocyte|\bmono\b/, [2, 10], 'White cells that clean up after infections.', 'A low value is usually not a concern.', 'High monocytes can follow infections and with inflammation.'],
  ['basophils', 'Basophils', /basophil|\bbaso\b/, [0, 2], 'White cells involved in allergic reactions.', 'A low value is not a concern.', 'A high value is uncommon and a doctor may want to repeat it.'],
];
DIFF.forEach(([id, label, re, ref, meaning, low, high]) => {
  add({ id, label: `${label} (%)`, re, pct: true, unit: '%', units: [PCT], plaus: [0, 100], ref: { all: ref }, tol: 0.35, group: 'Blood count', meaning, low, high });
  add({ id: `${id}_abs`, label: `${label} (absolute)`, re, abs: true, unit: '×10³/µL', units: [THOU, THOU_G, LAKH, THOU_RAW], plaus: [0, 100], ref: null, group: 'Blood count', meaning, low, high });
});
add({ id: 'esr', label: 'ESR', re: /\besr\b|sedimentation/, unit: 'mm/hr', units: [[/^mm\/?(hr|h|hour|1sthr|1sthour)$/, 1]], plaus: [0, 160], ref: { male: [0, 15], female: [0, 20] }, tol: 0.5, group: 'Inflammation',
  meaning: 'A general, non-specific marker of inflammation in the body.', low: 'A low value is not a concern.', high: 'Can be raised by infection, inflammation, anemia and some long-term conditions. It does not point to one cause.' });
add({ id: 'crp', label: 'CRP', re: /\bcrp\b|c[- ]reactive/, unit: 'mg/L', units: [[/^mg\/l$/, 1], [/^mg\/dl$/, 10]], plaus: [0, 600], ref: { all: [0, 5] }, tol: 0.3, group: 'Inflammation',
  meaning: 'A protein the liver releases when there is inflammation or infection.', low: 'A low value is normal.', high: 'High CRP signals inflammation, often from infection; it does not show where it comes from.' });

// ── Sugar
add({ id: 'glucose', label: 'Blood glucose', re: /glucose|\bfbs\b|\bppbs\b|\brbs\b|\bfbg\b|blood sugar|\bfpg\b/, not: /urine|csf|hba1c/, unit: 'mg/dL', units: [MGDL, [/^mmol\/l$/, 18.016], [/^gm?\/?l$/, 100]], plaus: [20, 900], ref: { all: [70, 99] }, th: { urgLow: 50, modHigh: 200, sevHigh: 300, urgHigh: 500 }, tol: 0.5, group: 'Blood sugar',
  meaning: 'The sugar level in your blood at the time of the test.',
  low: 'Low sugar can cause shakiness, sweating and confusion, and needs attention if it happens often.',
  high: 'High sugar can mean prediabetes or diabetes; whether you were fasting matters a lot for how this is read.' });

// ── Kidney / minerals
add({ id: 'creatinine', label: 'Creatinine', re: /creatinine/, not: /clearance|urine/, unit: 'mg/dL', units: [MGDL, [/^(umol|µmol)\/l$/, 1 / 88.4]], plaus: [0.1, 30], ref: { male: [0.7, 1.3], female: [0.5, 1.1] }, th: { sevHigh: 5, urgHigh: 10 }, tol: 0.6, group: 'Kidney',
  meaning: 'A waste product that healthy kidneys clear from your blood.', low: 'A low value is usually not a concern; it can reflect low muscle mass.',
  high: 'High creatinine can mean the kidneys are filtering less well; dehydration, some medicines and heavy exercise can also raise it.' });
add({ id: 'bun', label: 'Blood urea nitrogen (BUN)', re: /\bbun\b|urea nitrogen/, unit: 'mg/dL', units: [MGDL, [/^mmol\/l$/, 2.801]], plaus: [1, 200], ref: { all: [7, 21] }, tol: 0.6, group: 'Kidney',
  meaning: 'A waste product made when your body breaks down protein; cleared by the kidneys.', low: 'Low values are usually not a concern.', high: 'Can rise with dehydration, a high-protein diet or reduced kidney function.' });
add({ id: 'urea', label: 'Urea', re: /\burea\b|blood urea/, not: /nitrogen|clearance/, unit: 'mg/dL', units: [MGDL, [/^mmol\/l$/, 6.006]], plaus: [2, 500], ref: { all: [15, 45] }, tol: 0.6, group: 'Kidney',
  meaning: 'A waste product of protein breakdown that the kidneys remove.', low: 'Low values are usually not a concern.', high: 'Can rise with dehydration, a high-protein diet or reduced kidney function.' });
add({ id: 'uric', label: 'Uric acid', re: /uric acid|urate/, unit: 'mg/dL', units: [MGDL, [/^(umol|µmol)\/l$/, 1 / 59.48], [/^mmol\/l$/, 16.81]], plaus: [0.5, 25], ref: { male: [3.5, 7.2], female: [2.6, 6] }, tol: 0.7, group: 'Kidney',
  meaning: 'A by-product of food and cell breakdown, removed by the kidneys.', low: 'A low value is not usually a concern.', high: 'High uric acid can lead to gout or kidney stones; red meat, alcohol, dehydration and some medicines can raise it.' });
add({ id: 'egfr', label: 'eGFR', re: /\begfr\b|glomerular filtration/, unit: 'mL/min/1.73m²', units: [[/^ml\/min/, 1]], plaus: [1, 220], ref: { all: [60, 220] }, th: { sevLow: 30 }, group: 'Kidney',
  meaning: 'An estimate of how well your kidneys filter blood.', low: 'A value below 60 for three months or more suggests reduced kidney function; a doctor will confirm this.', high: 'Higher values are fine.' });
add({ id: 'sodium', label: 'Sodium', re: /\bsodium\b|\bna\+?\b/, unit: 'mmol/L', units: [[/^(mmol|meq|mm)\/l$/, 1]], plaus: [90, 190], ref: { all: [135, 145] }, th: { urgLow: 120, sevLow: 125, modLow: 130, urgHigh: 155, sevHigh: 150 }, group: 'Electrolytes',
  meaning: 'A salt that controls fluid balance, nerves and muscles.', low: 'Low sodium can come from too much water, some medicines or illness; a very low level can cause confusion.', high: 'High sodium usually means dehydration.' });
add({ id: 'potassium', label: 'Potassium', re: /\bpotassium\b|\bk\+?\b/, unit: 'mmol/L', units: [[/^(mmol|meq|mm)\/l$/, 1]], plaus: [1.5, 9], ref: { all: [3.5, 5.1] }, th: { urgLow: 2.5, sevLow: 3, urgHigh: 6.5, sevHigh: 6, modHigh: 5.5 }, group: 'Electrolytes',
  meaning: 'A mineral that keeps your heart rhythm and muscles working.', low: 'Low potassium can come from vomiting, diarrhea or some water tablets and can affect heart rhythm.', high: 'High potassium can affect heart rhythm and needs a doctor’s review; a hemolyzed (damaged) sample can also read falsely high.' });
add({ id: 'chloride', label: 'Chloride', re: /\bchloride\b|\bcl-?\b/, unit: 'mmol/L', units: [[/^(mmol|meq|mm)\/l$/, 1]], plaus: [60, 140], ref: { all: [98, 107] }, group: 'Electrolytes',
  meaning: 'A salt that works with sodium to balance fluids.', low: 'Usually follows sodium or vomiting.', high: 'Usually follows sodium or dehydration.' });
add({ id: 'calcium', label: 'Calcium', re: /\bcalcium\b/, not: /ionized|ionised|urine/, unit: 'mg/dL', units: [MGDL, [/^mmol\/l$/, 4.008]], plaus: [4, 18], ref: { all: [8.6, 10.2] }, th: { urgLow: 6.5, sevLow: 7.5, urgHigh: 13, sevHigh: 12, modHigh: 11 }, group: 'Minerals',
  meaning: 'A mineral for bones, nerves and muscles.', low: 'Low calcium can come from low vitamin D or albumin and can cause cramps or tingling.', high: 'High calcium needs a doctor’s review; the parathyroid glands and vitamin D are common causes.' });
add({ id: 'phosphorus', label: 'Phosphorus', re: /phosph(?:orus|ate)|\bphos\b/, unit: 'mg/dL', units: [MGDL, [/^mmol\/l$/, 3.097]], plaus: [0.5, 15], ref: { all: [2.5, 4.5] }, group: 'Minerals',
  meaning: 'A mineral that works with calcium for bone health.', low: 'Can occur with poor nutrition or low vitamin D.', high: 'Can be raised when the kidneys are not clearing it well.' });
add({ id: 'magnesium', label: 'Magnesium', re: /magnesium|\bmg\b(?!\/)/, unit: 'mg/dL', units: [MGDL, [/^mmol\/l$/, 2.431]], plaus: [0.5, 6], ref: { all: [1.7, 2.2] }, group: 'Minerals',
  meaning: 'A mineral for nerves, muscles and heart rhythm.', low: 'Low magnesium can cause cramps and tiredness.', high: 'High magnesium is uncommon and linked to kidney problems or supplements.' });

// ── Lipids
const LIP = [/^mg\/?dl$/, 1], LIPM = (f) => [/^mmol\/l$/, f];
add({ id: 'ldl', label: 'LDL cholesterol', re: /\bldl\b/, not: /\bvldl\b/, unit: 'mg/dL', units: [LIP, LIPM(38.67)], plaus: [5, 600], ref: { all: [0, 100] }, tol: 0.35, group: 'Cholesterol',
  meaning: 'The “bad” cholesterol that can build up in artery walls.', low: 'Low LDL is generally fine.', high: 'High LDL raises long-term risk of heart disease and stroke. Diet, activity, weight, genetics and thyroid or kidney conditions all play a part.' });
add({ id: 'hdl', label: 'HDL cholesterol', re: /\bhdl\b/, not: /non/, unit: 'mg/dL', units: [LIP, LIPM(38.67)], plaus: [5, 200], ref: { male: [40, 200], female: [50, 200] }, tol: 0.7, group: 'Cholesterol',
  meaning: 'The “good” cholesterol that helps clear fat from your blood.', low: 'Low HDL is linked to higher heart risk. Regular exercise, not smoking and a healthy diet help.', high: 'A high HDL is generally good.' });
add({ id: 'vldl', label: 'VLDL cholesterol', re: /\bvldl\b/, unit: 'mg/dL', units: [LIP, LIPM(38.67)], plaus: [1, 200], ref: { all: [2, 30] }, tol: 0.5, group: 'Cholesterol',
  meaning: 'Cholesterol carried with triglycerides in the blood.', low: 'Not a concern.', high: 'Usually goes along with high triglycerides.' });
add({ id: 'nonhdl', label: 'Non-HDL cholesterol', re: /non[- ]?hdl/, unit: 'mg/dL', units: [LIP, LIPM(38.67)], plaus: [10, 600], ref: { all: [0, 130] }, tol: 0.5, group: 'Cholesterol',
  meaning: 'All the cholesterol except the “good” HDL.', low: 'Generally fine.', high: 'High values raise long-term heart risk.' });
add({ id: 'tg', label: 'Triglycerides', re: /triglycerid|\btgl?\b|\btg\b/, unit: 'mg/dL', units: [LIP, LIPM(88.57)], plaus: [10, 5000], ref: { all: [0, 150] }, th: { urgHigh: 1000, sevHigh: 500 }, tol: 0.25, group: 'Cholesterol',
  meaning: 'A type of fat in your blood that comes from food and is made by the liver.', low: 'Not a concern.', high: 'High triglycerides are linked to sugary or fatty diets, alcohol, weight and diabetes; very high levels can inflame the pancreas.' });
add({ id: 'cholesterol', label: 'Total cholesterol', re: /cholesterol/, not: /hdl|ldl|vldl|ratio/, unit: 'mg/dL', units: [LIP, LIPM(38.67)], plaus: [30, 900], ref: { all: [0, 200] }, tol: 0.5, group: 'Cholesterol',
  meaning: 'The total amount of cholesterol in your blood.', low: 'Generally fine.', high: 'High total cholesterol raises long-term risk of heart disease; the split between LDL and HDL matters more.' });

// ── Liver
add({ id: 'alt', label: 'ALT (SGPT)', re: /\balt\b|sgpt|alanine/, unit: 'U/L', units: [[/^(u|iu)\/l$/, 1]], plaus: [1, 5000], ref: { all: [7, 55] }, th: { sevHigh: 300, urgHigh: 1000 }, tol: 0.25, group: 'Liver',
  meaning: 'An enzyme found mainly in liver cells.', low: 'Not a concern.', high: 'Can rise with fatty liver, hepatitis, alcohol, some medicines and strenuous exercise.' });
add({ id: 'ast', label: 'AST (SGOT)', re: /\bast\b|sgot|aspartate/, unit: 'U/L', units: [[/^(u|iu)\/l$/, 1]], plaus: [1, 5000], ref: { all: [10, 40] }, th: { sevHigh: 300, urgHigh: 1000 }, tol: 0.25, group: 'Liver',
  meaning: 'An enzyme found in the liver and muscles.', low: 'Not a concern.', high: 'Can rise with liver conditions, alcohol, some medicines and muscle injury or hard exercise.' });
add({ id: 'alp', label: 'Alkaline phosphatase (ALP)', re: /alkaline phosph|\balp\b|\balk phos/, unit: 'U/L', units: [[/^(u|iu)\/l$/, 1]], plaus: [5, 3000], ref: { all: [44, 147] }, tol: 0.3, group: 'Liver',
  meaning: 'An enzyme in the liver, bile ducts and bones.', low: 'Usually not a concern.', high: 'Can come from the liver or bile ducts, or from bone growth or repair; it is normally higher in children and in pregnancy.' });
add({ id: 'ggt', label: 'GGT', re: /\bggt\b|gamma[- ]?g|\bggtp\b/, unit: 'U/L', units: [[/^(u|iu)\/l$/, 1]], plaus: [1, 3000], ref: { all: [8, 61] }, tol: 0.25, group: 'Liver',
  meaning: 'A liver and bile-duct enzyme that is sensitive to alcohol and some medicines.', low: 'Not a concern.', high: 'Can rise with alcohol, fatty liver, bile-duct problems and some medicines.' });
add({ id: 'bili_d', label: 'Direct bilirubin', re: /(direct|conjugated)\s*bil|bil\w*\s*(direct|conjugated)|\bd\.?\s*bil/, unit: 'mg/dL', units: [MGDL, [/^(umol|µmol)\/l$/, 1 / 17.1]], plaus: [0, 30], ref: { all: [0, 0.3] }, tol: 0.5, group: 'Liver',
  meaning: 'Bilirubin that the liver has already processed.', low: 'Not a concern.', high: 'Raised with bile-duct or liver conditions.' });
add({ id: 'bili_i', label: 'Indirect bilirubin', re: /(indirect|unconjugated)\s*bil|bil\w*\s*(indirect|unconjugated)/, unit: 'mg/dL', units: [MGDL, [/^(umol|µmol)\/l$/, 1 / 17.1]], plaus: [0, 30], ref: { all: [0.2, 0.9] }, tol: 0.5, group: 'Liver',
  meaning: 'Bilirubin from broken-down red cells that the liver has not yet processed.', low: 'Not a concern.', high: 'Often mildly raised in harmless conditions such as Gilbert’s syndrome, or when red cells break down faster.' });
add({ id: 'bili_t', label: 'Total bilirubin', re: /bilirubin|\bbil\b/, unit: 'mg/dL', units: [MGDL, [/^(umol|µmol)\/l$/, 1 / 17.1]], plaus: [0, 40], ref: { all: [0.1, 1.2] }, tol: 0.5, group: 'Liver',
  meaning: 'A yellow pigment made when red cells are broken down; the liver clears it.', low: 'Not a concern.', high: 'High bilirubin can cause yellowing of the skin and eyes; liver, bile-duct and red-cell conditions are possible causes.' });
add({ id: 'albumin', label: 'Albumin', re: /albumin/, not: /globulin|ratio|a\/g|urine|microalb/, unit: 'g/dL', units: [GDL, GL_TO_GDL], plaus: [0.5, 8], ref: { all: [3.5, 5] }, group: 'Liver',
  meaning: 'The main protein in your blood, made by the liver.', low: 'Low albumin can reflect liver or kidney problems, poor nutrition or long-term illness.', high: 'High albumin usually means dehydration.' });
add({ id: 'protein', label: 'Total protein', re: /total protein|\bt\.?\s*protein/, unit: 'g/dL', units: [GDL, GL_TO_GDL], plaus: [2, 14], ref: { all: [6, 8.3] }, group: 'Liver',
  meaning: 'All the proteins in your blood together.', low: 'Can reflect liver or kidney problems or poor nutrition.', high: 'Can reflect dehydration or raised antibodies; a doctor may do follow-up tests.' });
add({ id: 'globulin', label: 'Globulin', re: /globulin/, unit: 'g/dL', units: [GDL, GL_TO_GDL], plaus: [0.5, 10], ref: { all: [2, 3.5] }, group: 'Liver',
  meaning: 'A group of blood proteins that includes antibodies.', low: 'Can reflect poor nutrition or low antibodies.', high: 'Can be raised in long-term infection or inflammation.' });

// ── Thyroid
add({ id: 'tsh', label: 'TSH', re: /\btsh\b|thyroid stimulating|thyrotropin/, unit: 'µIU/mL', units: [[/^(u|m)iu\/(ml|l)$|^miu\/l$/, 1], [/^uiu\/ml$/, 1]], plaus: [0.001, 500], ref: { all: [0.4, 4.5] }, th: { sevLow: 0.1, sevHigh: 10 }, tol: 0.4, group: 'Thyroid',
  meaning: 'The pituitary signal that tells your thyroid how hard to work.', low: 'A low TSH suggests an overactive thyroid (or too much thyroid medicine).', high: 'A high TSH suggests an underactive thyroid: the gland is being pushed harder to keep up.' });
add({ id: 'ft4', label: 'Free T4', re: /free\s*t4|\bft4\b|free thyroxine/, unit: 'ng/dL', units: [[/^ng\/dl$/, 1], [/^pmol\/l$/, 1 / 12.87]], plaus: [0.05, 10], ref: { all: [0.8, 1.8] }, group: 'Thyroid',
  meaning: 'The active thyroid hormone circulating in your blood.', low: 'Low free T4 with a high TSH points to an underactive thyroid.', high: 'High free T4 with a low TSH points to an overactive thyroid.' });
add({ id: 'ft3', label: 'Free T3', re: /free\s*t3|\bft3\b|free triiodo/, unit: 'pg/mL', units: [[/^pg\/ml$/, 1], [/^pmol\/l$/, 1 / 1.536]], plaus: [0.2, 30], ref: { all: [2.3, 4.2] }, group: 'Thyroid',
  meaning: 'The most active thyroid hormone.', low: 'Can be low in underactive thyroid or long illness.', high: 'Can be high in an overactive thyroid.' });
add({ id: 't4', label: 'Total T4', re: /\bt4\b|thyroxine/, not: /free/, unit: 'µg/dL', units: [[/^(ug|mcg)\/dl$/, 1], [/^nmol\/l$/, 1 / 12.87]], plaus: [0.5, 40], ref: { all: [5, 12] }, group: 'Thyroid',
  meaning: 'Total thyroid hormone (bound and free).', low: 'Can point to an underactive thyroid.', high: 'Can point to an overactive thyroid.' });
add({ id: 't3', label: 'Total T3', re: /\bt3\b|triiodothyronine/, not: /free/, unit: 'ng/dL', units: [[/^ng\/dl$/, 1], [/^nmol\/l$/, 65.1], [/^ng\/ml$/, 100]], plaus: [10, 800], ref: { all: [80, 200] }, group: 'Thyroid',
  meaning: 'Total active thyroid hormone (bound and free).', low: 'Can be low in underactive thyroid or illness.', high: 'Can be high in an overactive thyroid.' });

// ── Vitamins / iron
add({ id: 'vitd', label: 'Vitamin D (25-OH)', re: /vitamin\s*d|25[- ]?oh|25 hydroxy|\bvit\.? ?d\b|cholecalciferol/, unit: 'ng/mL', units: [[/^ng\/ml$/, 1], [/^nmol\/l$/, 1 / 2.496]], plaus: [1, 400], ref: { all: [30, 100] }, th: { sevLow: 10, modLow: 20 }, tol: 0.5, group: 'Vitamins',
  meaning: 'Shows how much vitamin D your body has stored; it supports bones and muscles.', low: 'Low vitamin D is very common in India. It can weaken bones and cause aches or tiredness. Sunlight, diet and, if your doctor advises, supplements help.', high: 'Very high levels usually come from too many supplements.' });
add({ id: 'b12', label: 'Vitamin B12', re: /b[- ]?12|cobalamin/, unit: 'pg/mL', units: [[/^pg\/ml$/, 1], [/^ng\/l$/, 1], [/^pmol\/l$/, 1.355]], plaus: [20, 5000], ref: { all: [200, 900] }, th: { sevLow: 150 }, tol: 0.6, group: 'Vitamins',
  meaning: 'A vitamin needed for nerves and for making healthy red blood cells.', low: 'Low B12 can cause tiredness, tingling and anemia; vegetarian diets and some stomach conditions or medicines are common causes.', high: 'High values usually come from supplements.' });
add({ id: 'folate', label: 'Folate', re: /folate|folic/, unit: 'ng/mL', units: [[/^ng\/ml$/, 1], [/^nmol\/l$/, 1 / 2.266]], plaus: [0.5, 50], ref: { all: [3, 17] }, group: 'Vitamins',
  meaning: 'A B vitamin needed to make red blood cells and DNA.', low: 'Low folate can cause anemia and is linked to poor diet or alcohol use.', high: 'High values usually come from supplements.' });
add({ id: 'ferritin', label: 'Ferritin', re: /ferritin/, unit: 'ng/mL', units: [[/^(ng\/ml|ug\/l|µg\/l|mcg\/l)$/, 1]], plaus: [0.5, 6000], ref: { male: [30, 400], female: [13, 150] }, th: { sevLow: 10 }, tol: 0.5, group: 'Iron',
  meaning: 'Shows how much iron your body has stored.', low: 'Low ferritin is the earliest and most reliable sign of iron deficiency.', high: 'High ferritin can reflect inflammation, liver conditions or iron overload; it is also raised by infection.' });
add({ id: 'iron', label: 'Serum iron', re: /serum iron|\biron\b/, not: /binding|tibc|saturation/, unit: 'µg/dL', units: [[/^(ug|µg|mcg)\/dl$/, 1], [/^(umol|µmol)\/l$/, 5.585]], plaus: [2, 600], ref: { all: [60, 170] }, tol: 0.7, group: 'Iron',
  meaning: 'The amount of iron circulating in your blood right now.', low: 'Low iron fits with iron deficiency, though it varies through the day.', high: 'High values can occur after taking iron tablets or with iron overload.' });
add({ id: 'tibc', label: 'TIBC', re: /\btibc\b|total iron binding|iron binding capacity/, unit: 'µg/dL', units: [[/^(ug|µg|mcg)\/dl$/, 1], [/^(umol|µmol)\/l$/, 5.585]], plaus: [50, 900], ref: { all: [250, 450] }, group: 'Iron',
  meaning: 'How much iron your blood could carry.', low: 'Can be low in long-term illness or inflammation.', high: 'Rises when the body is short of iron.' });
add({ id: 'tsat', label: 'Transferrin saturation', re: /transferrin sat|\btsat\b|iron saturation|% sat/, unit: '%', units: [PCT], plaus: [1, 100], ref: { all: [20, 50] }, group: 'Iron',
  meaning: 'The share of your iron-carrying protein that is actually loaded with iron.', low: 'Low saturation fits with iron deficiency.', high: 'High saturation can point to iron overload.' });

const BY_ID = Object.fromEntries(A.map((a) => [a.id, a]));
export const ANALYTE_COUNT = A.length;

/* ═══════════════════════════════════════════════════════════════
   3. Parsing
═══════════════════════════════════════════════════════════════ */
const NOISE_START = /^(page|patient|name|age|sex|gender|date|dob|ref(?:erence)?\b|sample|specimen|collected|collection|reported|registered|registration|barcode|lab\b|laboratory|phone|mobile|tel\b|address|dr\b|dr\.|doctor|consultant|referred|method|note|notes|comment|comments|interpretation|test name|test\b|investigation|result|unit|units|bio\.?|biological|report|end of|printed|authori[sz]ed|signature|pathologist|technologist|checked|verified|www\.|email|e-mail|disclaimer|please|kindly|instrument|status|accession|uhid|mrn|visit|bill|invoice|case|client|sr\.?\s*no|s\.?no\b|\*+\s|--|==)/i;

const QUAL_WORDS = /^(positive|negative|reactive|non[- ]?reactive|nonreactive|present|absent|nil|trace|normal|abnormal|detected|not detected|clear|turbid|yellow|pale yellow|straw|adequate|few|occasional|plenty|\+{1,4})$/i;

const STRIP_DASH = (s) => s.replace(/[\u2013\u2014\u2212]/g, '-');
const normUnit = (u) => String(u || '').toLowerCase().replace(/[\s.*]/g, '').replace(/[µμ]/g, 'u').replace(/×/g, 'x').replace(/\^/g, '').replace(/³/g, '3').replace(/⁶/g, '6').replace(/⁹/g, '9').replace(/¹²/g, '12').replace(/²/g, '2');
const normName = (n) => String(n || '').toLowerCase().replace(/[^a-z0-9%+\s/-]/g, ' ').replace(/\s+/g, ' ').trim();

const FLAG_RE = /(?:^|[\s(\[])(HH|LL|H|L|HIGH|LOW|CRITICAL|ABNORMAL|\*)(?=$|[\s)\]])/i;

function parseRef(s, sex) {
  if (!s) return null;
  const t = STRIP_DASH(String(s));
  // sex-specific pair: "Male: 13-17 Female: 12-15"
  const mf = t.match(/male[^0-9<>]*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)[^]*?female[^0-9<>]*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/i);
  if (mf) {
    const m = [+mf[1], +mf[2]], f = [+mf[3], +mf[4]];
    if (sex === 'male') return { lo: m[0], hi: m[1], note: '' };
    if (sex === 'female') return { lo: f[0], hi: f[1], note: '' };
    return { lo: Math.min(m[0], f[0]), hi: Math.max(m[1], f[1]), note: 'Report gives different ranges for men and women; the wider range is used.' };
  }
  const found = [];
  const push = (re, make) => { const m = re.exec(t); if (m) found.push({ i: m.index, ...make(m) }); };
  push(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/i, (m) => ({ lo: +m[1], hi: +m[2] }));
  push(/(?:<=?|≤|up\s*to|upto|less\s*than|below|upper\s*limit)\s*[:]?\s*(\d+(?:\.\d+)?)/i, (m) => ({ lo: null, hi: +m[1] }));
  push(/(?:>=?|≥|greater\s*than|more\s*than|above|lower\s*limit)\s*[:]?\s*(\d+(?:\.\d+)?)/i, (m) => ({ lo: +m[1], hi: null }));
  if (!found.length) return null;
  found.sort((a, b) => a.i - b.i);
  const r = found[0];
  if (r.lo != null && r.hi != null && r.lo > r.hi) return null;
  return { lo: r.lo, hi: r.hi, note: '' };
}

const UNIT_TOKEN = /^[a-zA-Zµμ%×x*0-9^³⁶⁹¹²²./\-]+$/;
const NOT_UNIT = /^(h|l|hh|ll|high|low|critical|abnormal|normal|ref|reference|range|bio|biological|interval|male|female|adult|child|children|fasting|desirable|optimal|borderline|method|calculated|measured)$/i;

function pickUnit(tokens) {
  let u = tokens[0];
  if (!u || NOT_UNIT.test(u) || !UNIT_TOKEN.test(u)) return { unit: '', rest: tokens };
  if (/^\d+(\.\d+)?(-\d+(\.\d+)?)?$/.test(u)) return { unit: '', rest: tokens }; // a number / range, not a unit
  if (!/[a-zA-Zµμ%]/.test(u)) return { unit: '', rest: tokens };
  let used = 1;
  // "x 10^3 / µL" split across tokens
  if (/^(x|×)?10\^?\d*$/i.test(u) && tokens[1] && /^\//.test(tokens[1])) { u += tokens[1]; used = 2; }
  else if (/^\/$/.test(tokens[1] || '') && tokens[2]) { u += `/${tokens[2]}`; used = 3; }
  return { unit: u, rest: tokens.slice(used) };
}

export function parseLine(rawLine, sex) {
  let line = STRIP_DASH(String(rawLine || ''))
    .replace(/(\d),(?=\d{2,3}(?:\D|$))/g, '$1')
    .replace(/(x|×)\s*10\s*\^?\s*(\d+)\s*\/\s*/gi, 'x10^$2/')
    .replace(/25\s?-?\s?(?:OH|hydroxy)(?:\s?-?\s?(?:cholecalciferol|vitamin d))?/i, 'Vitamin D')
    .replace(/\s+$/g, '');
  const trimmed = line.trim();
  if (trimmed.length < 4 || trimmed.length > 220) return null;
  if (NOISE_START.test(trimmed)) return null;
  if (/^[\d\s./:-]+$/.test(trimmed)) return null;

  let name, valStr, qual = '', restStr;

  const cells = trimmed.split(/\s{2,}|\t|\|/).map((c) => c.trim()).filter(Boolean);
  const numCell = (c) => /^(?:[<>]=?|≤|≥)?\s*\d+(?:\.\d+)?(?:\s*(?:H|L|HH|LL|HIGH|LOW|\*))?$/i.test(c);

  if (cells.length >= 3 && /[A-Za-z]{2}/.test(cells[0]) && !/^\d/.test(cells[0])) {
    const idx = cells.findIndex((c, i) => i > 0 && numCell(c));
    if (idx > 0) {
      name = cells.slice(0, idx).join(' ');
      const m = cells[idx].match(/^([<>]=?|≤|≥)?\s*(\d+(?:\.\d+)?)/);
      qual = m[1] || ''; valStr = m[2];
      restStr = [cells[idx].replace(m[0], '').trim(), ...cells.slice(idx + 1)].join('   ').trim();
    }
  }
  if (!name) {
    const m = trimmed.match(/^([A-Za-z][A-Za-z0-9 ()/%.,'&+\-]*?)\s*[:=]?\s+([<>]=?|≤|≥)?\s*(\d+(?:\.\d+)?)(?=\s|$|[A-Za-zµμ%/])(.*)$/);
    if (m) { name = m[1]; qual = m[2] || ''; valStr = m[3]; restStr = (m[4] || '').trim(); }
  }
  if (!name || valStr == null) {
    // qualitative result  "Urine Protein   Negative"
    const q = cells.length >= 2 ? cells : trimmed.split(/\s{2,}|:\s+/);
    if (q.length >= 2 && /[A-Za-z]{3}/.test(q[0]) && QUAL_WORDS.test(q[1].trim())) {
      return { kind: 'qual', name: q[0].trim().slice(0, 60), text: q[1].trim(), ref: q.slice(2).join(' ').trim(), line: trimmed };
    }
    return null;
  }

  name = name.replace(/[:\-–\s]+$/, '').replace(/\s{2,}/g, ' ').trim();
  if (name.length < 2 || name.length > 60 || !/[A-Za-z]{2}/.test(name)) return null;
  if (/\b(years?|yrs?|age|dated?|phone|mobile|pin|floor|road|street|lab no|sample id|reg\.? no)\b/i.test(name)) return null;

  const value = parseFloat(valStr);
  if (!Number.isFinite(value)) return null;

  let flag = null;
  const fm = restStr.match(FLAG_RE) || (cells.length ? (cells.join(' ').match(FLAG_RE)) : null);
  if (fm) { const f = fm[1].toUpperCase(); flag = f.startsWith('H') || f === 'HIGH' || f === '*' ? 'H' : f.startsWith('L') || f === 'LOW' ? 'L' : 'X'; if (f === '*') flag = 'X'; if (f === 'CRITICAL' || f === 'ABNORMAL') flag = 'X'; }
  if (/\b(HIGH|H)\b/.test(restStr) && /\bnormal range\b/i.test(restStr)) flag = flag || 'H';

  const tokens = restStr.replace(/[\[\]()]/g, ' ').split(/\s+/).filter(Boolean);
  const { unit, rest } = pickUnit(tokens);
  const refText = rest.join(' ');
  const ref = parseRef(refText, sex) || parseRef(restStr, sex);

  return { kind: 'num', name, value, qual, unit, ref, flag, line: trimmed };
}

/* ── analyte resolution & unit normalisation ─────────────────── */
export function resolveAnalyte(name, unit) {
  const nn = normName(name);
  const nu = normUnit(unit);
  const isPctUnit = nu === '%' || nu === 'percent';
  const looksAbs = /\babsolute\b|\babs\b|\bcount\b/.test(nn) || (!isPctUnit && /(\/ul|\/cumm|\/mm3|\/cmm|\/l)$/.test(nu));
  for (const a of A) {
    if (!a.re.test(nn)) continue;
    if (a.not && a.not.test(nn)) continue;
    if (a.pct && (looksAbs && !isPctUnit)) continue;
    if (a.abs && !looksAbs) continue;
    return a;
  }
  return null;
}

function convertValue(v, unit, a) {
  const nu = normUnit(unit);
  const apply = (f, x) => (typeof f === 'function' ? f(x) : x * f);
  if (nu) {
    for (const [re, f] of a.units) if (re.test(nu)) return { ok: true, f, assumed: false };
    return { ok: false, unknown: true };
  }
  return { ok: true, f: 1, assumed: true, apply };
}

function rescueFactor(v, a) {
  // magnitude rescue for counts when the unit is unclear (e.g. 2.5 lakhs, 250000)
  if (!(a.id === 'platelets' || a.id === 'wbc' || a.id === 'rbc' || a.abs)) return null;
  const cands = a.id === 'rbc' ? [1e-6, 1] : [0.001, 100, 1];
  for (const f of cands) { const c = v * f; if (c >= a.plaus[0] && c <= a.plaus[1]) return f; }
  return null;
}

function pickRef(a, sex, guard) {
  if (!a?.ref || guard) return null;
  if (a.ref.all) return { lo: a.ref.all[0], hi: a.ref.all[1], note: '' };
  if (sex === 'male') return { lo: a.ref.male[0], hi: a.ref.male[1], note: '' };
  if (sex === 'female') return { lo: a.ref.female[0], hi: a.ref.female[1], note: '' };
  return { lo: Math.min(a.ref.male[0], a.ref.female[0]), hi: Math.max(a.ref.male[1], a.ref.female[1]), note: 'Sex not given, so a wider range was used.' };
}

/* ═══════════════════════════════════════════════════════════════
   4. Severity (calibrated; only analyte emergency thresholds say "urgent")
═══════════════════════════════════════════════════════════════ */
const BANDS = [[0.05, 0.1, 'borderline'], [0.15, 0.3, 'mildly'], [0.3, 0.5, 'moderately'], [0.5, 0.7, 'severely']];

export function fuzzyScore(v, lo, hi, a) {
  const th = a?.th || {};
  const tol = a ? (a.tol ?? 1) : 0.5; // tests we don't know get softer grading (no thresholds, no urgency)
  const below = lo != null && v < lo;
  const above = hi != null && v > hi;
  if (!below && !above) {
    // closeness to an edge is worth a note but not a flag
    return { score: 0, label: 'within_range', direction: 'normal', urgent: false };
  }
  const dir = below ? 'low' : 'high';
  const limit = below ? lo : hi;
  const gap = Math.abs(v - limit);
  const base = (Math.abs(limit) > 1e-9 ? gap / Math.abs(limit) : gap / Math.max(Math.abs(hi ?? lo ?? 1), 1e-9)) * tol;

  let score, word;
  if (base < BANDS[0][0]) { score = 0.1 + (base / BANDS[0][0]) * 0.08; word = 'borderline'; }
  else if (base < BANDS[1][0]) { score = 0.2 + ((base - 0.05) / 0.1) * 0.19; word = 'mildly'; }
  else if (base < BANDS[2][0]) { score = 0.4 + ((base - 0.15) / 0.15) * 0.19; word = 'moderately'; }
  else { score = Math.min(0.85, 0.6 + ((base - 0.3) / 0.5) * 0.25); word = 'severely'; }

  let urgent = false;
  const L = dir === 'low';
  const urg = L ? th.urgLow : th.urgHigh, sev = L ? th.sevLow : th.sevHigh, mod = L ? th.modLow : th.modHigh;
  const hit = (t) => t != null && (L ? v <= t : v >= t);
  if (hit(urg)) { score = 1; word = 'critically'; urgent = true; }
  else if (hit(sev) && score < 0.8) { score = 0.8; word = 'severely'; }
  else if (hit(mod) && score < 0.55) { score = 0.55; word = 'moderately'; }

  return { score: Math.round(score * 100) / 100, label: `${word}_${dir}`, direction: dir, urgent };
}

const roundNice = (x) => { if (x == null) return null; const a = Math.abs(x); return a >= 100 ? Math.round(x) : a >= 10 ? Math.round(x * 10) / 10 : a >= 1 ? Math.round(x * 100) / 100 : Math.round(x * 1000) / 1000; };

export const SEVERITY_TEXT = {
  within_range: 'Normal', borderline_low: 'Borderline low', mildly_low: 'Mildly low', moderately_low: 'Moderately low', severely_low: 'Severely low', critically_low: 'Critically low',
  borderline_high: 'Borderline high', mildly_high: 'Mildly high', moderately_high: 'Moderately high', severely_high: 'Severely high', critically_high: 'Critically high',
};

/* ═══════════════════════════════════════════════════════════════
   5. Report parsing → structured values
═══════════════════════════════════════════════════════════════ */
export function detectMeta(text) {
  const t = String(text || '');
  const meta = { age: null, sex: null };
  const am = t.match(/\bage\s*[:/-]?\s*(\d{1,3})(?:\s*(?:y(?:ea)?rs?|y\b))?/i) || t.match(/\b(\d{1,3})\s*(?:y(?:ea)?rs?|y)\s*[/,|-]?\s*(?:male|female|m\b|f\b)/i);
  if (am) { const n = +am[1]; if (n > 0 && n < 120) meta.age = n; }
  const monthsOnly = /\b(\d{1,2})\s*(?:months?|mos?)\b/i.test(t) && !meta.age;
  if (monthsOnly) meta.age = 0;
  const sm = t.match(/\b(?:sex|gender)\s*[:/-]?\s*(male|female|m|f)\b/i) || t.match(/\b\d{1,3}\s*(?:y(?:ea)?rs?|y)?\s*[/,|-]\s*(male|female|m|f)\b/i);
  if (sm) meta.sex = /^m/i.test(sm[1]) ? 'male' : 'female';
  return meta;
}

const guardOf = (p) => !!((p.age != null && p.age < 18) || p.pregnant);

const name_words = (n) => String(n).trim().split(/\s+/).length;

export function parseLabReport(text, patient = {}) {
  const sex = patient.sex || null;
  const guard = guardOf(patient);
  const lines = String(text || '').split('\n');
  const values = [];
  const qualitative = [];
  const unread = [];
  const seen = new Set();

  for (const raw of lines) {
    if (!raw.trim()) continue;
    let p;
    try { p = parseLine(raw, sex); } catch { p = null; }
    if (!p) {
      const t = raw.trim();
      if (/[A-Za-z]{3}/.test(t) && /\d/.test(t) && t.length <= 160 && !NOISE_START.test(t) && !/^[\d\s./:-]+$/.test(t) && /\b\d+(?:\.\d+)?\b/.test(t) && !/(page|date|phone|www|@)/i.test(t)) unread.push(t.slice(0, 140));
      continue;
    }
    if (p.kind === 'qual') { qualitative.push({ name: p.name, text: p.text, ref: p.ref }); continue; }

    const a = resolveAnalyte(p.name, p.unit);
    const unitOk = /[\/%]|^(fl|pg|u|iu|mg|g|kg|ml|l|mmol|umol|µmol|meq|ng|mcg|µg|ug|miu|mm|hr|sec|s|cells|copies|ratio|index|score|mmhg|bpm|kpa|s\.?)$/i.test(p.unit || '');
    if (!a && !p.ref && !unitOk && p.flag == null) { unread.push(p.line.slice(0, 140)); continue; } // not clearly a lab row
    if (!a && name_words(p.name) > 6) { unread.push(p.line.slice(0, 140)); continue; }

    let cValue = p.value, cUnit = p.unit || '', note = '', assumption = '', unitUnknown = false, f = 1;
    let refLo = p.ref ? p.ref.lo : null, refHi = p.ref ? p.ref.hi : null;
    let refSource = p.ref ? 'report' : null;
    let refNote = p.ref?.note || '';

    if (a) {
      const c = convertValue(p.value, p.unit, a);
      if (c.ok) { f = c.f; }
      else { unitUnknown = true; }
      if (!unitUnknown) {
        const conv = (x) => (typeof f === 'function' ? f(x) : x * f);
        cValue = conv(p.value);
        // magnitude rescue (counts) when unit absent or implausible
        if (cValue < a.plaus[0] || cValue > a.plaus[1]) {
          const rf = rescueFactor(p.value, a);
          if (rf != null) { f = rf; cValue = p.value * rf; note = 'Unit looked unusual, so the count was interpreted by size.'; }
          else { unread.push(p.line.slice(0, 140)); continue; }
        }
        cUnit = a.unit;
        if (c.assumed) assumption = `Unit not shown; assumed ${a.unit}.`;
        if (normUnit(p.unit) && cUnit !== p.unit && (typeof f === 'function' || Math.abs(f - 1) > 1e-9)) note = `Converted from ${p.unit} to ${a.unit}.`;
        const conv2 = (x) => (typeof f === 'function' ? f(x) : x * f);
        if (refLo != null) refLo = conv2(refLo);
        if (refHi != null) refHi = conv2(refHi);
      } else {
        note = `Unit “${p.unit}” isn’t recognised, so this value is shown as printed and no built-in thresholds are applied.`;
        cValue = p.value; cUnit = p.unit;
      }
    }

    // reference: the report's own range is the truth; built-in only when the report has none
    let usedBuiltin = false;
    if (a && !unitUnknown && refLo == null && refHi == null) {
      const b = pickRef(a, sex, guard);
      if (b) {
        let { lo, hi } = b;
        if (a.id === 'glucose') {
          const n = normName(p.name);
          if (/post|\bpp\b|ppbs|2\s*h|random|\brbs\b/.test(n)) { lo = 70; hi = 139; refNote = 'Built-in range for a non-fasting sample.'; }
          else if (!/fasting|\bfbs\b|\bfbg\b|\bfpg\b/.test(n)) refNote = 'Assumes a fasting sample (not stated in the report).';
        }
        refLo = lo; refHi = hi; refSource = 'built-in'; usedBuiltin = true;
        refNote = refNote || b.note;
      }
    }

    // qualifier handling ("<0.5", ">10")
    let v = cValue;
    if (p.qual && /^</.test(p.qual) && refHi != null && cValue <= refHi) v = Math.min(cValue, refHi);
    let fz;
    if (refLo == null && refHi == null) {
      if (p.flag === 'H') fz = { score: 0.3, label: 'mildly_high', direction: 'high', urgent: false };
      else if (p.flag === 'L') fz = { score: 0.3, label: 'mildly_low', direction: 'low', urgent: false };
      else if (p.flag === 'X') fz = { score: 0.3, label: 'mildly_high', direction: 'unknown', urgent: false };
      else fz = { score: 0, label: 'within_range', direction: 'unknown', urgent: false, noRange: true };
    } else {
      fz = fuzzyScore(v, refLo, refHi, unitUnknown ? null : a);
      if (p.qual && /^>/.test(p.qual) && refLo != null && cValue >= refLo && fz.direction === 'low') fz = { score: 0, label: 'within_range', direction: 'normal', urgent: false };
    }

    const key = `${a ? a.id : normName(p.name)}|${p.value}`;
    if (seen.has(key)) continue;
    seen.add(key);

    values.push({
      idx: values.length,
      name: p.name,
      id: a ? a.id : null,
      label: a ? a.label : p.name,
      group: a?.group || 'Other',
      value: p.value, unit: p.unit, qual: p.qual,
      cValue: roundNice(cValue), cUnit,
      refLo: roundNice(refLo),
      refHi: roundNice(refHi),
      refSource, refNote, usedBuiltin,
      flag: p.flag, note, assumption, unitUnknown,
      fuzzy: fz,
      glucoseState: a?.id === 'glucose' ? (/post|\bpp\b|ppbs|2\s*h/.test(normName(p.name)) ? 'pp' : /random|\brbs\b/.test(normName(p.name)) ? 'random' : /fasting|\bfbs\b|\bfbg\b|\bfpg\b/.test(normName(p.name)) ? 'fasting' : 'unknown') : null,
      meaning: a?.meaning || '',
      detail: a ? (fz.direction === 'low' ? a.low : fz.direction === 'high' ? a.high : '') : '',
    });
  }
  return { values, qualitative, unread: [...new Set(unread)].slice(0, 40), lineCount: lines.filter((l) => l.trim()).length };
}

/* ═══════════════════════════════════════════════════════════════
   6. Patterns (hedged; never a diagnosis)
═══════════════════════════════════════════════════════════════ */
export function detectPatterns(values, patient = {}) {
  if (guardOf(patient)) return [];
  const get = (id) => values.find((v) => v.id === id && !v.unitUnknown);
  const out = [];
  const lowOf = (id) => { const v = get(id); return v && v.fuzzy.direction === 'low' && v.fuzzy.score >= 0.1 ? v : null; };
  const highOf = (id) => { const v = get(id); return v && v.fuzzy.direction === 'high' && v.fuzzy.score >= 0.1 ? v : null; };
  const conf = (...vs) => { const s = vs.filter(Boolean); if (!s.length) return 0; return Math.min(0.95, 0.3 + s.length * 0.12 + (s.reduce((n, v) => n + v.fuzzy.score, 0) / s.length) * 0.35); };
  const push = (name, urgency, c, note, vs) => out.push({ name, urgency, confidence: Math.round(c * 100) / 100, clinical_note: note, based_on: vs.filter(Boolean).map((v) => v.label) });

  // Iron deficiency
  { const hb = lowOf('hemoglobin'), mcv = lowOf('mcv'), mch = lowOf('mch'), fer = lowOf('ferritin'), fe = lowOf('iron'), tsat = lowOf('tsat'), tibc = highOf('tibc'), rdw = highOf('rdw');
    const n = [fer, fe, tsat, tibc].filter(Boolean).length;
    if ((fer && (hb || mcv || mch)) || n >= 2 || (hb && mcv && (mch || rdw))) {
      push('Iron-deficiency pattern', fer && hb ? 'soon' : 'routine', conf(hb, mcv, mch, fer, fe, tsat, tibc, rdw), 'Small, pale red cells with low iron stores are a typical iron-deficiency picture. A doctor will look for the cause (diet, blood loss) before choosing treatment.', [hb, mcv, mch, fer, fe, tsat, tibc, rdw]);
    } else if (hb && mcv && !fer) {
      push('Small-cell anemia pattern', 'soon', conf(hb, mcv, mch), 'Low hemoglobin with small red cells is most often iron deficiency, but thalassemia trait is another common cause. Iron studies help tell them apart.', [hb, mcv, mch]);
    } }

  // Macrocytic anemia
  { const hb = lowOf('hemoglobin'), mcv = highOf('mcv'), b12 = lowOf('b12'), fol = lowOf('folate');
    if (mcv && (hb || b12 || fol)) push('Large-cell (B12 / folate) pattern', 'soon', conf(hb, mcv, b12, fol), 'Enlarged red cells can be linked to low vitamin B12 or folate, and sometimes to alcohol, thyroid or liver conditions.', [hb, mcv, b12, fol]); }

  // Infection / inflammation
  { const w = highOf('wbc'), n = highOf('neutrophils'), c = highOf('crp'), e = highOf('esr');
    if ((w && n) || (c && (w || e))) push('Infection / inflammation pattern', w && w.fuzzy.score >= 0.4 ? 'soon' : 'routine', conf(w, n, c, e), 'A raised white-cell count with more neutrophils, or raised CRP/ESR, commonly goes with an infection or inflammation. Symptoms and examination decide what it means.', [w, n, c, e]); }

  // Glycaemia
  { const a1c = get('hba1c'), g = get('glucose');
    const gFasting = g && (g.glucoseState === 'fasting' || g.glucoseState === 'unknown');
    if (a1c && a1c.cValue >= 6.5) push('Blood sugar in the diabetes range', 'soon', 0.8, 'An HbA1c of 6.5% or more is in the diabetes range. Doctors confirm it with a repeat test or a matching fasting glucose, and then plan treatment.', [a1c, g]);
    else if (g && gFasting && g.cValue >= 126) push('Blood sugar in the diabetes range', 'soon', a1c ? 0.75 : 0.6, 'A fasting glucose of 126 mg/dL or more is in the diabetes range. It is usually confirmed with a second test or HbA1c.', [a1c, g]);
    else if (g && (g.glucoseState === 'random' || g.glucoseState === 'pp') && g.cValue >= 200) push('Very high blood sugar', 'soon', 0.7, 'A non-fasting glucose of 200 mg/dL or more needs a doctor’s review, especially with thirst, frequent urination or weight loss.', [g, a1c]);
    else if ((a1c && a1c.cValue >= 5.7) || (g && gFasting && g.cValue >= 100)) push('Blood sugar in the prediabetes range', 'routine', conf(a1c, g) * 0.8, 'Blood sugar slightly above normal is called prediabetes. It is a chance to act early: activity, weight and diet changes can often bring it back down.', [a1c, g]); }

  // Lipids
  { const ldl = highOf('ldl'), tc = highOf('cholesterol'), tg = highOf('tg'), hdl = lowOf('hdl'), nh = highOf('nonhdl');
    const n = [ldl, tc, tg, hdl, nh].filter(Boolean).length;
    if (n >= 2 || (ldl && ldl.fuzzy.score >= 0.4) || (tg && tg.fuzzy.score >= 0.4)) push('Cholesterol / lipid pattern', 'routine', conf(ldl, tc, tg, hdl, nh), 'Your fat levels are outside the usual targets. A doctor weighs them with your age, blood pressure, sugar and family history to estimate heart risk.', [ldl, tc, tg, hdl, nh]); }

  // Liver
  { const alt = highOf('alt'), ast = highOf('ast'), ggt = highOf('ggt'), alp = highOf('alp'), bil = highOf('bili_t');
    const n = [alt, ast, ggt, alp, bil].filter(Boolean).length;
    if (n >= 2 || (alt && alt.fuzzy.score >= 0.4)) push('Liver-enzyme elevation', [alt, ast].some((v) => v && v.fuzzy.score >= 0.6) ? 'soon' : 'routine', conf(alt, ast, ggt, alp, bil), 'Several liver markers are raised. Fatty liver, medicines, alcohol and viral hepatitis are common causes; your doctor may repeat the test and look at the pattern.', [alt, ast, ggt, alp, bil]); }

  // Kidney
  { const cr = highOf('creatinine'), ur = highOf('urea') || highOf('bun'), eg = lowOf('egfr'), uric = highOf('uric');
    if (cr || eg || (ur && uric)) push('Possible reduced kidney function', (cr && cr.fuzzy.score >= 0.5) || (eg && eg.fuzzy.score >= 0.55) ? 'soon' : 'routine', conf(cr, ur, eg), 'Raised creatinine or urea, or a lower eGFR, can mean the kidneys are filtering less well, though dehydration or a recent hard workout can do the same. A repeat test and urine test usually follow.', [cr, ur, eg, uric]); }

  // Thyroid
  { const tsh = get('tsh'), ft4 = get('ft4');
    if (tsh && tsh.fuzzy.direction === 'high' && tsh.fuzzy.score >= 0.1) push('Underactive thyroid pattern', ft4 && ft4.fuzzy.direction === 'low' ? 'soon' : 'routine', conf(tsh, lowOf('ft4')), 'A raised TSH suggests the thyroid may be underactive. A low free T4 alongside it strengthens this; if free T4 is normal it is called subclinical.', [tsh, ft4]);
    else if (tsh && tsh.fuzzy.direction === 'low' && tsh.fuzzy.score >= 0.1) push('Overactive thyroid pattern', 'soon', conf(tsh, highOf('ft4'), highOf('ft3')), 'A low TSH suggests the thyroid may be overactive (or that thyroid medicine is too strong). Free T4 and T3 help confirm it.', [tsh, ft4, get('ft3')]); }

  // Vitamins
  { const d = get('vitd'); if (d && d.cValue < 30) push(d.cValue < 20 ? 'Vitamin D deficiency' : 'Low vitamin D (insufficiency)', 'routine', d.cValue < 20 ? 0.8 : 0.6, 'Low vitamin D is very common. It matters for bones and muscles. Sunlight, diet and, if your doctor advises, supplements are the usual route.', [d]); }
  { const b = lowOf('b12'); if (b) push('Low vitamin B12', 'soon', conf(b, highOf('mcv')), 'Low B12 can cause tiredness, tingling and anemia. Diet (especially vegetarian) and some stomach conditions or medicines are common causes.', [b, get('mcv')]); }

  out.sort((x, y) => y.confidence - x.confidence);
  return out.slice(0, 6);
}

/* ═══════════════════════════════════════════════════════════════
   7. Overall status, rule-based text, doctor questions
═══════════════════════════════════════════════════════════════ */
export function overallStatus(values, patterns) {
  if (values.some((v) => v.fuzzy.urgent)) return 'urgent';
  if (values.some((v) => v.fuzzy.score >= 0.2) || patterns.length) return 'attention_needed';
  return 'normal';
}

const fmtVal = (v) => `${v.cValue}${v.cUnit ? ` ${v.cUnit}` : ''}`;
const fmtRef = (v) => (v.refLo != null && v.refHi != null ? `${v.refLo}–${v.refHi}` : v.refHi != null ? `up to ${v.refHi}` : v.refLo != null ? `${v.refLo} or more` : '');

export function ruleText(v) {
  const word = SEVERITY_TEXT[v.fuzzy.label] || '';
  if (v.fuzzy.score < 0.1) return { significance: v.noRange || (v.refLo == null && v.refHi == null) ? `${v.label} is ${fmtVal(v)}. The report gives no reference range to compare with.` : `${v.label} is ${fmtVal(v)}, within the reference range (${fmtRef(v)}).`, care_note: '' };
  const sig = `${v.label} is ${word.toLowerCase()} at ${fmtVal(v)}${fmtRef(v) ? ` (reference ${fmtRef(v)})` : ''}. ${v.detail || ''}`.trim();
  const care = v.fuzzy.urgent ? 'Please contact a doctor today about this result.' : v.fuzzy.score >= 0.6 ? 'Discuss this result with your doctor soon.' : v.fuzzy.score >= 0.4 ? 'Worth discussing with your doctor at your next visit.' : 'Mention it to your doctor; small changes like this are often harmless.';
  return { significance: sig, care_note: care };
}

export function ruleQuestions(values, patterns) {
  const q = [];
  values.filter((v) => v.fuzzy.score >= 0.3).sort((a, b) => b.fuzzy.score - a.fuzzy.score).slice(0, 3).forEach((v) => q.push(`My ${v.label} is ${fmtVal(v)}${fmtRef(v) ? ` (reference ${fmtRef(v)})` : ''}. What could be causing this, and do I need any follow-up?`));
  patterns.slice(0, 2).forEach((p) => q.push(`My results show a “${p.name.toLowerCase()}”. Which tests would confirm or rule this out?`));
  if (!q.length) q.push('All my values look within range — is there anything else I should be screened for at my age?');
  q.push('Should I repeat any of these tests, and when?');
  return q.slice(0, 5);
}

export function ruleLifestyle(patterns) {
  const L = [];
  const has = (re) => patterns.some((p) => re.test(p.name));
  if (has(/iron|small-cell/i)) L.push('Include iron-rich foods (leafy greens, legumes, jaggery, dates) with a vitamin C source such as lemon or amla. Avoid tea or coffee with meals. Take iron supplements only if your doctor advises.');
  if (has(/b12|large-cell/i)) L.push('B12 comes from animal foods, dairy and fortified foods; if you are vegetarian, ask your doctor about testing and supplements.');
  if (has(/vitamin d/i)) L.push('Safe sunlight on arms and legs for about 15–20 minutes most days, plus foods like eggs and fortified milk, can help vitamin D; ask your doctor before starting supplements.');
  if (has(/sugar|diabetes/i)) L.push('Regular walking, fewer sugary drinks and sweets, and more fibre-rich foods help keep blood sugar steady.');
  if (has(/cholesterol|lipid/i)) L.push('Cut back on fried and packaged foods, add oats, nuts and vegetables, and aim for 30 minutes of activity on most days.');
  if (has(/liver/i)) L.push('Avoid alcohol and unnecessary painkillers until your doctor has reviewed your liver tests; reducing sweets and fried food helps fatty liver.');
  if (has(/kidney/i)) L.push('Drink enough water, avoid anti-inflammatory painkillers unless a doctor advises them, and have the test repeated as suggested.');
  if (has(/thyroid/i)) L.push('Take any thyroid medicine exactly as prescribed, and ask your doctor when to repeat the TSH test.');
  if (!L.length) L.push('Keep up regular activity, a balanced diet with plenty of vegetables, good sleep and enough water.');
  return L.slice(0, 4);
}

/* ═══════════════════════════════════════════════════════════════
   8. Privacy: redaction before anything leaves the browser
═══════════════════════════════════════════════════════════════ */
export function redactReport(text) {
  return String(text || '').split('\n').map((l) => {
    const t = l.trim();
    if (/^(patient|name|mr\.?|mrs\.?|ms\.?|address|phone|mobile|tel|email|e-mail|uhid|mrn|lab\s*(id|no)|sample\s*(id|no)|barcode|registration|reg\.?\s*no|referred|ref\.?\s*by|doctor|dr\.?|consultant|dob|date of birth|guardian|father|mother|husband|wife|aadhaar|passport|bill|invoice|client|case)\b/i.test(t)) return /\b(age|sex|gender)\b\s*[:/-]?\s*\w+/i.test(t) ? t.replace(/(patient|name)\s*[:\-]?[^|/]*/i, '').replace(/\s+\|\s+/g, ' | ') : '[removed]';
    return l;
  }).join('\n')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/(?:\+?\d[\s-]?){10,}/g, '[number]')
    .replace(/\b\d{8,}\b/g, '[id]');
}

/* ═══════════════════════════════════════════════════════════════
   9. AI: extract (fallback), explain, summarise, translate — all validated
═══════════════════════════════════════════════════════════════ */
const GUARD_TEXT = 'PATIENT GUARD: this patient is a child or pregnant. Do NOT compare with adult norms or speculate about causes; keep notes brief and recommend the pediatrician / obstetrician.';

export async function aiExtractRows({ text, model, ai = aiCall }) {
  const clean = redactReport(text).slice(0, 14000);
  const { text: raw } = await ai({
    toolId: 'lablens-v5', model, json: true, reasoning: 'low', maxTokens: 6000, temperature: 0,
    messages: [
      { role: 'system', content: 'You extract lab test rows from a medical report (any language) into JSON. Output ONE object: {"rows":[{"name_en":"English test name","value":number,"unit":"as printed","ref_low":number|null,"ref_high":number|null,"flag":"H|L|null"}]}. Copy numbers exactly as printed. NEVER invent or calculate values. Skip text-only results and anything you are unsure about.' },
      { role: 'user', content: clean },
    ],
  });
  const rows = Array.isArray(parseJsonLoose(raw).rows) ? parseJsonLoose(raw).rows : [];
  const nums = numberSet(clean);
  const lines = [];
  for (const r of rows.slice(0, 120)) {
    const v = Number(r?.value);
    if (!Number.isFinite(v) || !r?.name_en) continue;
    if (!nums.has(String(r.value).replace(/,/g, '')) && !nums.has(String(v))) continue; // value must exist in the report text
    const lo = Number.isFinite(Number(r.ref_low)) && r.ref_low !== null ? Number(r.ref_low) : null;
    const hi = Number.isFinite(Number(r.ref_high)) && r.ref_high !== null ? Number(r.ref_high) : null;
    const ref = lo != null && hi != null ? `${lo} - ${hi}` : hi != null ? `< ${hi}` : lo != null ? `> ${lo}` : '';
    lines.push(`${String(r.name_en).slice(0, 50)}   ${v}   ${String(r.unit || '').slice(0, 20)}   ${ref}   ${r.flag === 'H' || r.flag === 'L' ? r.flag : ''}`.trimEnd());
  }
  return lines.join('\n');
}

const EXPLAIN_SYSTEM = `You explain lab results to patients with no medical background. Reply with ONE JSON object only.
RULES
1. Use ONLY the numbers supplied for each item. Never add other numbers, thresholds, percentages or doses.
2. Never diagnose. Use phrases like "can be a sign of", "is often caused by", "your doctor may want to check".
3. No medicine names or doses. Simple diet or activity ideas are fine.
4. Calm, clear, kind. Match the tone to the severity score: 0.1–0.2 slight, 0.2–0.4 mild, 0.4–0.6 moderate (see a doctor), 0.6+ significant (see a doctor soon).
5. Each text is 1–2 short sentences about what THIS value means for this person.
SCHEMA {"items":[{"id":<number given>,"significance":"…","care_note":"one concrete next step or question for the doctor"}]}`;

export function allowedNumbers(sourceText, values) {
  const s = numberSet(sourceText);
  values.forEach((v) => {
    [v.value, v.cValue, v.refLo, v.refHi].forEach((n) => { if (n != null) s.add(String(n)); });
    if (v.id && BY_ID[v.id]) { const a = BY_ID[v.id]; Object.values(a.th || {}).forEach((n) => s.add(String(n))); if (a.ref) Object.values(a.ref).flat().forEach((n) => s.add(String(n))); }
  });
  [6.5, 5.7, 6.4, 126, 100, 125, 200, 30, 20, 60, 3, 12, 24, 1, 2, 7, 8, 14, 15, 20, 30].forEach((n) => s.add(String(n)));
  return s;
}

const validText = (t, allowed) => typeof t === 'string' && t.trim().length > 0 && t.length < 600 && ungroundedNumbers(t, allowed).length === 0;

export async function aiExplain({ values, patient, sourceText, model, ai = aiCall, onProgress }) {
  const flagged = values.filter((v) => v.fuzzy.score >= 0.1 || v.flag);
  const allowed = allowedNumbers(sourceText, values);
  const out = new Map();
  let rejected = 0, failedBatches = 0;
  const batches = [];
  for (let i = 0; i < flagged.length; i += 10) batches.push(flagged.slice(i, i + 10));
  for (let b = 0; b < batches.length; b++) {
    onProgress?.(b + 1, batches.length);
    const payload = batches[b].map((v) => ({
      id: v.idx, test: v.label, value: fmtVal(v), reference: fmtRef(v) || 'not given', status: SEVERITY_TEXT[v.fuzzy.label] || 'flagged', severity_score: v.fuzzy.score,
      background: v.detail || v.meaning || '',
    }));
    try {
      const { text } = await ai({
        toolId: 'lablens-v5', model, json: true, reasoning: 'low', maxTokens: 3500, temperature: 0.2,
        messages: [
          { role: 'system', content: EXPLAIN_SYSTEM },
          { role: 'user', content: `${guardOf(patient) ? `${GUARD_TEXT}\n\n` : ''}Patient: ${patient.age != null ? `${patient.age} years` : 'age not given'}, ${patient.sex || 'sex not given'}.\nITEMS:\n${JSON.stringify(payload)}` },
        ],
      });
      const parsed = parseJsonLoose(text);
      for (const it of Array.isArray(parsed.items) ? parsed.items : []) {
        const id = Number(it?.id);
        if (!Number.isInteger(id)) continue;
        const sig = validText(it.significance, allowed) ? it.significance.trim() : '';
        const care = validText(it.care_note, allowed) ? it.care_note.trim() : '';
        if (!sig || (it.significance && !sig)) rejected++;
        if (sig || care) out.set(id, { significance: sig, care_note: care });
      }
    } catch (e) {
      failedBatches++;
      if (e?.kind === 'rate') throw e;
      break; // service trouble: stop here instead of waiting through every remaining batch
    }
  }
  return { map: out, rejected, failedBatches, batches: batches.length };
}

const SUMMARY_SYSTEM = `You write the overview of a lab report for a patient with no medical background. Reply with ONE JSON object only.
RULES
1. Use ONLY the numbers given. Never add other numbers, thresholds or doses. Never diagnose; use "can suggest", "often linked to".
2. No medicine names or doses. Calm, kind, plain language.
3. "syndromes": explain ONLY the patterns supplied, using their EXACT names.
SCHEMA {"headline":"one short sentence","summary":"3-4 sentences covering what is normal, what needs attention, and the most important next step","syndromes":[{"name":"EXACT name","plain_explanation":"2 sentences","what_doctor_looks_for":"1-2 sentences about follow-up tests"}],"questions_for_doctor":["4-5 specific questions the patient can ask"],"lifestyle_notes":["3-4 general, safe habits relevant to these results"]}`;

export async function aiSummary({ values, patterns, patient, sourceText, model, ai = aiCall }) {
  const allowed = allowedNumbers(sourceText, values);
  const abnormal = values.filter((v) => v.fuzzy.score >= 0.1);
  const user = [
    guardOf(patient) ? GUARD_TEXT : '',
    `Patient: ${patient.age != null ? `${patient.age} years` : 'age not given'}, ${patient.sex || 'sex not given'}.`,
    `Total values read: ${values.length}. Within range: ${values.length - abnormal.length}.`,
    `ABNORMAL: ${JSON.stringify(abnormal.slice(0, 25).map((v) => ({ test: v.label, value: fmtVal(v), reference: fmtRef(v) || 'n/a', status: SEVERITY_TEXT[v.fuzzy.label] })))}`,
    `PATTERNS: ${JSON.stringify(patterns.map((p) => ({ name: p.name, note: p.clinical_note })))}`,
  ].filter(Boolean).join('\n');
  const { text } = await ai({ toolId: 'lablens-v5', model, json: true, reasoning: 'low', maxTokens: 3500, temperature: 0.2, messages: [{ role: 'system', content: SUMMARY_SYSTEM }, { role: 'user', content: user }] });
  const p = parseJsonLoose(text);
  const ok = (t) => validText(t, allowed);
  const list = (a) => (Array.isArray(a) ? a.map((x) => String(x || '').trim()).filter(ok).slice(0, 5) : []);
  return {
    headline: ok(p.headline) ? p.headline.trim() : '',
    summary: ok(p.summary) ? p.summary.trim() : '',
    syndromes: (Array.isArray(p.syndromes) ? p.syndromes : []).map((s) => ({ name: String(s?.name || ''), plain: ok(s?.plain_explanation) ? s.plain_explanation.trim() : '', follow: ok(s?.what_doctor_looks_for) ? s.what_doctor_looks_for.trim() : '' })),
    questions: list(p.questions_for_doctor),
    lifestyle: list(p.lifestyle_notes),
  };
}

/* ───────── translation (JSON in → JSON out, numbers must survive) ───────── */
const numsIn = (s) => (String(s).match(/\d+(?:\.\d+)?/g) || []).sort().join(',');

export async function translateStrings({ strings, targetLang, model, ai = aiCall, onProgress }) {
  const out = strings.slice();
  let failed = 0;
  const idxs = strings.map((s, i) => (s && s.trim() ? i : -1)).filter((i) => i >= 0);
  const size = 18;
  const batches = [];
  for (let i = 0; i < idxs.length; i += size) batches.push(idxs.slice(i, i + size));
  for (let b = 0; b < batches.length; b++) {
    onProgress?.(b + 1, batches.length);
    const ids = batches[b];
    try {
      const { text } = await ai({
        toolId: 'lablens-trans', model, json: true, reasoning: 'low', maxTokens: 6000, temperature: 0.1,
        messages: [
          { role: 'system', content: `You translate patient-friendly medical text into ${targetLang}. Reply with ONE JSON object: {"texts":["…"]} with EXACTLY the same number of items, in the same order. Keep every number, unit, test name (e.g. Hemoglobin, TSH, mg/dL) and abbreviation in English/Latin script. Use simple everyday words. Do not add or remove information.` },
          { role: 'user', content: JSON.stringify({ texts: ids.map((i) => strings[i]) }) },
        ],
      });
      const arr = parseJsonLoose(text).texts;
      if (!Array.isArray(arr) || arr.length !== ids.length) { failed += ids.length; continue; }
      ids.forEach((i, k) => {
        const t = String(arr[k] || '').trim();
        if (t && numsIn(t) === numsIn(strings[i])) out[i] = t; else failed++;
      });
    } catch (e) { failed += ids.length; if (e?.kind === 'rate') throw e; }
  }
  return { strings: out, failed, total: idxs.length };
}

/* ═══════════════════════════════════════════════════════════════
   10. Orchestrator
═══════════════════════════════════════════════════════════════ */
export const MIN_VALUES_FOR_RULE_PARSE = 3;

/** Stage 1 (instant, offline): parse → normalise → score → patterns. */
export async function analyzeLocal({ text, patient, model, ai = aiCall, onNote }) {
  let parsed = parseLabReport(text, patient);
  let usedAiExtraction = false;
  const numericTokens = (String(text).match(/\d+(?:\.\d+)?/g) || []).length;
  if (parsed.values.length < MIN_VALUES_FOR_RULE_PARSE && numericTokens >= 8) {
    onNote?.('Reading the report with AI-assisted extraction…');
    try {
      const rows = await aiExtractRows({ text, model, ai });
      const p2 = parseLabReport(rows, patient);
      if (p2.values.length > parsed.values.length) { parsed = { ...p2, unread: parsed.unread, lineCount: parsed.lineCount }; usedAiExtraction = true; }
    } catch (e) { if (e?.kind === 'rate') throw e; }
  }
  const patterns = detectPatterns(parsed.values, patient);
  const status = overallStatus(parsed.values, patterns);
  parsed.values.forEach((v) => { const r = ruleText(v); v.significance = r.significance; v.care_note = r.care_note; v.textSource = 'rule'; });
  return { ...parsed, patterns, status, usedAiExtraction, guard: guardOf(patient) };
}

/** Stage 2: AI explanations (validated). Never throws for AI problems — returns what it could. */
export async function enrichWithAi({ local, patient, sourceText, model, ai = aiCall, onProgress }) {
  const result = { values: local.values.map((v) => ({ ...v })), patterns: local.patterns.map((p) => ({ ...p })), headline: '', summary: '', questions: ruleQuestions(local.values, local.patterns), lifestyle: ruleLifestyle(local.patterns), aiStatus: 'none', aiNote: '' };
  const fallbackHeadline = () => {
    const ab = local.values.filter((v) => v.fuzzy.score >= 0.2).length;
    if (local.status === 'urgent') return 'Some values need prompt medical attention';
    if (local.patterns[0]) return `${local.patterns[0].name} — worth discussing with your doctor`;
    return ab ? `${ab} value${ab > 1 ? 's are' : ' is'} outside the normal range` : 'Your values are within the expected ranges';
  };
  result.headline = fallbackHeadline();
  result.summary = `${local.values.length} values were read. ${local.values.filter((v) => v.fuzzy.score >= 0.2).length} are outside the reference range${local.patterns.length ? `, and ${local.patterns.length} pattern${local.patterns.length > 1 ? 's' : ''} stand out` : ''}. See the Flagged tab for each result and a plain-language note.`;

  let ok = 0;
  try {
    const ex = await aiExplain({ values: local.values, patient, sourceText, model, ai, onProgress });
    ex.map.forEach((t, id) => {
      const v = result.values.find((x) => x.idx === id);
      if (v) { if (t.significance) v.significance = t.significance; if (t.care_note) v.care_note = t.care_note; v.textSource = 'ai'; }
    });
    ok += ex.map.size;
    if (ex.failedBatches || ex.rejected) result.aiNote = `${ex.rejected ? `${ex.rejected} AI note(s) were replaced with rule-based text because they contained numbers not in your report. ` : ''}${ex.failedBatches ? 'Some explanations could not be generated. ' : ''}`.trim();
  } catch (e) { result.aiNote = e?.message || 'AI explanations are unavailable right now.'; }

  const explainDead = result.aiNote && ok === 0;
  try {
    if (explainDead) throw new Error(result.aiNote);
    const s = await aiSummary({ values: local.values, patterns: local.patterns, patient, sourceText, model, ai });
    if (s.headline) result.headline = s.headline;
    if (s.summary) result.summary = s.summary;
    if (s.questions.length >= 2) result.questions = s.questions;
    if (s.lifestyle.length) result.lifestyle = s.lifestyle;
    s.syndromes.forEach((x) => {
      const p = result.patterns.find((q) => q.name.toLowerCase() === x.name.toLowerCase());
      if (p) { if (x.plain) p.plain = x.plain; if (x.follow) p.follow = x.follow; }
    });
    ok += 1;
  } catch (e) { result.aiNote = result.aiNote || e?.message || 'AI summary is unavailable right now.'; }

  result.aiStatus = ok === 0 ? 'none' : result.aiNote ? 'partial' : 'full';
  return result;
}

/* ── translation helpers: collect → translate → apply ── */
export function collectStrings(r) {
  const items = [];
  const add = (path, text) => { if (text && String(text).trim()) items.push({ path, text: String(text) }); };
  add(['headline'], r.headline); add(['summary'], r.summary); add(['urgentAlert'], r.urgentAlert);
  r.values.forEach((v, i) => { add(['values', i, 'meaning'], v.meaning); add(['values', i, 'significance'], v.significance); add(['values', i, 'care_note'], v.care_note); });
  r.patterns.forEach((p, i) => { add(['patterns', i, 'plain'], p.plain || p.clinical_note); add(['patterns', i, 'follow'], p.follow); });
  r.questions.forEach((q, i) => add(['questions', i], q));
  r.lifestyle.forEach((q, i) => add(['lifestyle', i], q));
  (r.notices || []).forEach((q, i) => add(['notices', i], q));
  return items;
}
export function applyStrings(r, items, strings) {
  const c = JSON.parse(JSON.stringify(r));
  items.forEach((it, k) => {
    let o = c;
    for (let i = 0; i < it.path.length - 1; i++) o = o[it.path[i]];
    o[it.path[it.path.length - 1]] = strings[k];
  });
  return c;
}

/* ── plain text / share ── */
export function summaryText(r, patient = {}) {
  const L = ['LAB REPORT SUMMARY (explained by ZeroAPI LabLens — not a diagnosis)'];
  if (patient.age != null || patient.sex) L.push(`Patient: ${[patient.age != null ? `${patient.age} y` : '', patient.sex || ''].filter(Boolean).join(', ')}`);
  L.push('', r.headline, '', r.summary);
  const ab = r.values.filter((v) => v.fuzzy.score >= 0.1);
  if (ab.length) { L.push('', 'OUT OF RANGE'); ab.forEach((v) => L.push(`• ${v.label}: ${fmtVal(v)}${fmtRef(v) ? ` (ref ${fmtRef(v)})` : ''} — ${SEVERITY_TEXT[v.fuzzy.label]}`)); }
  if (r.patterns.length) { L.push('', 'PATTERNS'); r.patterns.forEach((p) => L.push(`• ${p.name}`)); }
  if (r.questions.length) { L.push('', 'QUESTIONS FOR THE DOCTOR'); r.questions.forEach((q) => L.push(`• ${q}`)); }
  return L.join('\n');
}

export { fmtVal, fmtRef, guardOf, BY_ID as ANALYTES };
