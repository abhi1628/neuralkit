// src/resumeCore.js
// Shared engine for ZeroAPI's resume suite (Analyzer · Builder · Wizard · Cover Letter).
//
//  • aiCall()            – one hardened client for /api/ai (device id, JSON mode, fail-fast rate limits)
//  • parseJsonLoose()    – JSON parser that survives fences, <think> blocks and truncated output
//  • extractDocument()   – PDF / DOCX / TXT → clean text (line-preserving, 2-column aware, scan detection)
//  • analyzeSignals()    – deterministic, explainable ATS measurements (no LLM → consistent scores)
//  • scoreSignals()      – category scores + overall
//  • matchJobDescription() – keyword coverage vs a pasted JD
//  • quote/grounding     – every AI claim must be traceable to the user's own text
//  • resume model        – canonical shape, normaliser, plain-text renderer, section ordering
//  • prompts             – analysis, build, import, improve
//
// This file has no React and no direct dependency on constants.js, so it can be unit-tested in Node.

import { loadScript } from './utils';

/* ═══════════════════════════════════════════════════════════════
   1. Small helpers
═══════════════════════════════════════════════════════════════ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function fmtWait(sec) {
  if (sec < 90) return `${Math.ceil(sec)}s`;
  return `${Math.ceil(sec / 60)} min`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function copyTo(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function slugify(s, fallback = 'resume') {
  const out = String(s || '').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
  return out || fallback;
}

/** Fire-and-forget usage ping for the dev dashboard (same endpoint the other tools use). */
export function dispatchRun(toolId) {
  try {
    fetch('/api/track-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'run', targetId: toolId }) }).catch(() => {});
  } catch { /* ignore */ }
}

/* ═══════════════════════════════════════════════════════════════
   2. AI client
═══════════════════════════════════════════════════════════════ */
let _memCid = null;
export function getClientId() {
  const ok = (v) => typeof v === 'string' && /^[a-zA-Z0-9_-]{16,64}$/.test(v);
  try {
    let id = localStorage.getItem('zeroapi:cid');
    if (!ok(id)) {
      const raw = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
      id = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48).padEnd(16, 'x');
      localStorage.setItem('zeroapi:cid', id);
    }
    return id;
  } catch {
    if (!_memCid) _memCid = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`.padEnd(16, 'x').slice(0, 40);
    return _memCid;
  }
}

export class AiError extends Error {
  constructor(kind, message, extra = {}) {
    super(message);
    this.name = 'AiError';
    this.kind = kind; // rate | busy | network | empty | truncated | api
    Object.assign(this, extra);
  }
}

/**
 * Hardened call to /api/ai.
 * Returns { text, finishReason }. Throws AiError with a user-safe message.
 * Our own rate limiter (429 + retryAfter) fails FAST instead of spinning for a minute.
 */
export async function aiCall({
  toolId, model, system, user, messages,
  maxTokens = 3000, temperature = 0.2, json = false, reasoning = 'low', signal,
}) {
  const msgs = messages || [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
  const payload = { toolId, model, max_tokens: maxTokens, temperature, messages: msgs };
  if (json) payload.response_format = { type: 'json_object' };
  if (reasoning) payload.reasoning_effort = reasoning;

  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    let res;
    try {
      res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Id': getClientId() },
        body: JSON.stringify(payload),
        signal,
      });
    } catch (e) {
      if (e?.name === 'AbortError') throw e;
      lastErr = new AiError('network', 'Connection problem. Check your internet and try again.');
      if (attempt < 1) { await sleep(1200); continue; }
      throw lastErr;
    }

    let data = null;
    try { data = await res.json(); } catch { /* non-JSON body */ }
    const errMsg = typeof data?.error === 'string' ? data.error : data?.error?.message;

    if (res.ok) {
      const choice = data?.choices?.[0];
      const text = (choice?.message?.content || '').trim();
      const finishReason = choice?.finish_reason || '';
      if (!text) {
        if (finishReason === 'length') {
          throw new AiError('truncated', 'The AI ran out of room before it finished. Please try again (shorter input helps).');
        }
        throw new AiError('empty', 'The AI returned an empty answer. Please try again.');
      }
      return { text, finishReason };
    }

    if (res.status === 429) {
      const ra = Number(data?.retryAfter);
      if (Number.isFinite(ra) && ra > 0) {
        throw new AiError('rate', `You're going a little fast. Please wait ${fmtWait(ra)} and try again.`, { retryAfter: ra });
      }
      lastErr = new AiError('busy', 'The AI service is busy right now. Retrying…');
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (res.status >= 500) {
      lastErr = new AiError('api', errMsg || 'The AI service had a hiccup.');
      await sleep(1500 * (attempt + 1));
      continue;
    }
    throw new AiError('api', errMsg || `Request failed (${res.status}).`);
  }
  throw lastErr || new AiError('busy', 'The service is busy right now. Please try again in a moment.');
}

/* ═══════════════════════════════════════════════════════════════
   3. Robust JSON parsing
═══════════════════════════════════════════════════════════════ */
function sliceBalanced(s) {
  let depth = 0, inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) return { text: s.slice(0, i + 1), complete: true };
    }
  }
  return { text: s, complete: false };
}

const stripTrailingCommas = (s) => s.replace(/,\s*([}\]])/g, '$1');

function repairTruncated(s) {
  const stack = [];
  let inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }
  let out = s;
  if (esc) out = out.slice(0, -1);
  if (inStr) out += '"';
  // drop dangling fragments until stable: `,`  `"key":`  `, "x"`
  for (let i = 0; i < 6; i++) {
    const before = out;
    out = out
      .replace(/[\s,]+$/, '')
      .replace(/"(?:[^"\\]|\\.)*"\s*:\s*$/, '')
      .replace(/,\s*"(?:[^"\\]|\\.)*"\s*$/, '')
      .replace(/:\s*$/, ': null');
    if (out === before) break;
  }
  out = stripTrailingCommas(out);
  return out + stack.reverse().join('');
}

export function parseJsonLoose(raw) {
  if (raw == null || !String(raw).trim()) throw new Error('Empty response.');
  let s = String(raw).replace(/^\uFEFF/, '');
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```(?:json)?/gi, '').trim();
  const start = s.search(/[{[]/);
  if (start === -1) throw new Error('No JSON found in the AI response.');
  s = s.slice(start);

  const cand = sliceBalanced(s);
  const tries = [cand.text, stripTrailingCommas(cand.text)];
  if (!cand.complete) tries.push(repairTruncated(s));
  for (const t of tries) {
    try { return JSON.parse(t); } catch { /* next */ }
  }
  try {
    return JSON.parse(stripTrailingCommas(cand.text.replace(/[\u201C\u201D]/g, '"')));
  } catch { /* fall through */ }
  throw new Error('The AI response was not valid JSON. Please try again.');
}

/* ═══════════════════════════════════════════════════════════════
   4. Text cleaning & document extraction
═══════════════════════════════════════════════════════════════ */
const LIGATURES = { '\uFB00': 'ff', '\uFB01': 'fi', '\uFB02': 'fl', '\uFB03': 'ffi', '\uFB04': 'ffl' };

export function cleanResumeText(t) {
  return String(t || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\uFB00-\uFB04]/g, (m) => LIGATURES[m] || m)
    .replace(/[\uF0B7\uF0A7\uF0D8\uF076\u25AA\u25AB\u2023\u2043]/g, '•')
    .replace(/[\u00A0\u2007\u202F]/g, ' ')
    .replace(/\t/g, '  ')
    .replace(/[ ]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pdfItemsToLines(items) {
  const lines = [];
  let cur = null;
  for (const it of items) {
    if (!it || (!it.str && !it.hasEOL)) continue;
    const x = it.transform ? it.transform[4] : 0;
    const y = it.transform ? it.transform[5] : 0;
    const h = it.height || (it.transform ? Math.abs(it.transform[3]) : 10) || 10;
    if (!cur || Math.abs(y - cur.y) > Math.max(2, h * 0.55)) {
      cur = { y, segs: [] };
      lines.push(cur);
    }
    if (it.str) cur.segs.push({ x, w: it.width || 0, str: it.str });
    if (it.hasEOL) cur = null;
  }
  return lines;
}

function lineToString(line) {
  const segs = [...line.segs].sort((a, b) => a.x - b.x);
  let out = '';
  let prevEnd = null;
  for (const sg of segs) {
    if (prevEnd != null) {
      const gap = sg.x - prevEnd;
      const needsSpace = gap > 1.2 && !/\s$/.test(out) && !/^\s/.test(sg.str);
      if (gap > 28) out += '   ';
      else if (needsSpace) out += ' ';
    }
    out += sg.str;
    prevEnd = sg.x + sg.w;
  }
  return out.replace(/\s+$/g, '');
}

function detectColumns(lines, pageWidth) {
  const gaps = [];
  let split = 0;
  for (const ln of lines) {
    const segs = [...ln.segs].sort((a, b) => a.x - b.x);
    for (let i = 1; i < segs.length; i++) {
      const prev = segs[i - 1];
      const gap = segs[i].x - (prev.x + prev.w);
      const leftTxt = segs.slice(0, i).map((s) => s.str).join('').trim();
      const rightTxt = segs.slice(i).map((s) => s.str).join('').trim();
      if (gap > pageWidth * 0.06 && leftTxt.length >= 18 && rightTxt.length >= 18) {
        split++;
        gaps.push(segs[i].x - gap / 2);
        break;
      }
    }
  }
  const multi = split >= 6 && split / Math.max(1, lines.length) > 0.2;
  if (!multi) return { multi: false };
  gaps.sort((a, b) => a - b);
  return { multi: true, splitX: gaps[Math.floor(gaps.length / 2)] };
}

function buildPdfPageText(items, pageWidth) {
  const lines = pdfItemsToLines(items);
  const cols = detectColumns(lines, pageWidth);
  if (!cols.multi) {
    return { text: lines.map(lineToString).filter((l) => l.trim()).join('\n'), multiColumn: false };
  }
  const left = [], right = [];
  for (const it of items) {
    if (!it || !it.str) continue;
    const x = it.transform ? it.transform[4] : 0;
    (x < cols.splitX ? left : right).push(it);
  }
  const lt = pdfItemsToLines(left).map(lineToString).filter((l) => l.trim());
  const rt = pdfItemsToLines(right).map(lineToString).filter((l) => l.trim());
  return { text: [...lt, ...rt].join('\n'), multiColumn: true };
}

/**
 * Reads a PDF / DOCX / TXT file.
 * @returns {{text:string, pages:{pageNum:number,text:string}[], kind:string, multiColumn:boolean, warnings:string[]}}
 */
export async function extractDocument(file) {
  const name = (file?.name || '').toLowerCase();
  const warnings = [];
  let multiColumn = false;
  let pages = [];
  let text = '';
  let kind = '';

  if (name.endsWith('.pdf') || file?.type === 'application/pdf') {
    kind = 'pdf';
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const built = buildPdfPageText(content.items, viewport.width);
      if (built.multiColumn) multiColumn = true;
      pages.push({ pageNum: i, text: built.text });
    }
    text = pages.map((p) => p.text).join('\n\n');
    if (text.replace(/\s/g, '').length < 120) {
      throw new Error('This PDF looks like a scan or an image, so there is no text to read. Upload a text-based PDF (for example exported from Word or Google Docs), or paste the text instead.');
    }
    if (multiColumn) warnings.push('Two-column layout detected. Many ATS systems read columns in the wrong order — a single-column resume is safer.');
    if (pdf.numPages > 2) warnings.push(`Your resume is ${pdf.numPages} pages. Most recruiters expect 1 page (freshers) or 2 pages (experienced).`);
  } else if (name.endsWith('.docx')) {
    kind = 'docx';
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    text = String(result.value || '').replace(/\n{2,}/g, '\n');
    pages = [{ pageNum: 1, text }];
  } else if (name.endsWith('.doc')) {
    throw new Error('Old .doc files can’t be read. Please save it as .docx or PDF and upload again.');
  } else if (name.endsWith('.txt') || file?.type === 'text/plain') {
    kind = 'txt';
    text = await file.text();
    pages = [{ pageNum: 1, text }];
  } else {
    throw new Error('Please upload a PDF or Word (.docx) file — or paste your text.');
  }

  text = cleanResumeText(text);
  pages = pages.map((p) => ({ ...p, text: cleanResumeText(p.text) }));
  if (!text.trim()) throw new Error('Could not extract any text from this file.');
  return { text, pages, kind, multiColumn, warnings };
}

/* ═══════════════════════════════════════════════════════════════
   5. Sections & signals (deterministic analysis)
═══════════════════════════════════════════════════════════════ */
const SECTION_ALIASES = {
  summary: ['summary', 'professional summary', 'career summary', 'profile', 'professional profile', 'objective', 'career objective', 'about me', 'about', 'personal statement', 'executive summary'],
  experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'internships', 'internship', 'internship experience', 'industrial training', 'training', 'relevant experience', 'academic experience', 'teaching experience', 'research experience'],
  education: ['education', 'academic background', 'academic qualifications', 'educational qualifications', 'qualifications', 'academics', 'education and qualifications', 'academic profile', 'educational background'],
  skills: ['skills', 'technical skills', 'core competencies', 'key skills', 'skills and tools', 'technologies', 'tech stack', 'areas of expertise', 'expertise', 'competencies', 'tools', 'technical proficiency', 'skills and expertise', 'technical expertise'],
  projects: ['projects', 'academic projects', 'personal projects', 'key projects', 'selected projects', 'project work', 'portfolio', 'major projects', 'technical projects'],
  certifications: ['certifications', 'certificates', 'licenses', 'courses', 'training and certifications', 'certifications and courses', 'online courses', 'licenses and certifications', 'professional certifications'],
  achievements: ['achievements', 'accomplishments', 'awards', 'honors', 'honours', 'awards and achievements', 'honors and awards', 'scholarships', 'recognition', 'awards and honors'],
  publications: ['publications', 'research', 'research papers', 'papers', 'books', 'patents', 'research and publications', 'selected publications', 'books and publications'],
  extracurricular: ['extracurricular', 'extra curricular', 'activities', 'extracurricular activities', 'positions of responsibility', 'leadership', 'volunteering', 'volunteer experience', 'co-curricular', 'volunteer and mentorship', 'mentorship', 'leadership and activities'],
  languages: ['languages', 'language skills', 'languages known'],
  personal: ['personal details', 'personal information', 'personal profile', 'personal data'],
  declaration: ['declaration'],
  interests: ['interests', 'hobbies', 'hobbies and interests'],
};

const ALIAS_LOOKUP = (() => {
  const m = new Map();
  for (const [key, list] of Object.entries(SECTION_ALIASES)) list.forEach((a) => m.set(a, key));
  return m;
})();

function headingKey(line) {
  const raw = line.trim();
  if (!raw || raw.length > 48) return null;
  const norm = raw.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return ALIAS_LOOKUP.get(norm) || null;
}

export function splitSections(text) {
  const lines = String(text || '').split('\n');
  const header = [];
  const sections = {};
  const order = [];
  let current = null;
  for (const line of lines) {
    const key = headingKey(line);
    if (key) {
      current = key;
      if (!sections[key]) { sections[key] = []; order.push(key); }
      continue;
    }
    if (current) sections[current].push(line);
    else header.push(line);
  }
  return { header, sections, order };
}

const ACTION_PAST = `achieved acquired administered advised analyzed analysed architected assembled assessed audited authored automated benchmarked boosted built calculated catalogued championed clarified coached collaborated compiled completed composed conceived conducted configured consolidated constructed consulted containerized contributed converted coordinated created customized debugged decreased defined delivered deployed designed detected developed devised diagnosed directed discovered documented doubled drafted drove earned eliminated enabled encrypted engineered enhanced established estimated evaluated examined executed expanded expedited explored extracted fabricated facilitated finalized fine-tuned fixed forecasted formulated founded generated guided handled identified implemented improved increased influenced initiated innovated inspected installed instituted integrated interviewed introduced invented investigated launched led leveraged maintained managed mapped measured mentored merged migrated minimized modeled modelled modernized monitored negotiated normalized optimized orchestrated organized outperformed overhauled oversaw owned parsed partnered performed piloted pioneered planned prepared presented prioritized processed produced programmed prototyped provisioned published queried raised rebuilt recommended reconciled recruited redesigned reduced refactored refined released remediated replaced reported researched resolved restructured retrieved revamped reviewed revised rewrote saved scaled scheduled secured selected served shaped shipped simplified simulated sold solved sourced spearheaded standardized streamlined strengthened structured supervised supported surpassed synthesized taught tested tracked trained transformed translated troubleshot tuned unified upgraded validated verified visualized won wrote`;

const ACTION_VERBS = (() => {
  const set = new Set();
  for (const w of ACTION_PAST.split(/\s+/)) {
    set.add(w);
    if (w.endsWith('ied')) set.add(w.slice(0, -3) + 'y');
    if (w.endsWith('ed')) { set.add(w.slice(0, -2)); set.add(w.slice(0, -1)); }
    if (/([bdfglmnprst])\1ed$/.test(w)) set.add(w.slice(0, -3));
    set.add(w + 's');
  }
  ['led', 'built', 'wrote', 'won', 'drove', 'ran', 'taught', 'sold', 'saw', 'made', 'began', 'grew', 'took', 'gave', 'found', 'set', 'cut', 'put', 'ran', 'lead', 'build', 'write', 'run', 'drive', 'teach', 'make', 'grow', 'take', 'give', 'find'].forEach((w) => set.add(w));
  return set;
})();

const WEAK_STARTS = /^(responsible for|worked on|worked with|helped|assisted|involved in|duties included|tasked with|participated in|was part of|part of|handled|dealt with|exposure to|knowledge of|familiar with|learned|learnt|attended|was responsible)/i;

const BUZZWORDS = ['hard-working', 'hardworking', 'hard working', 'team player', 'go-getter', 'self-motivated', 'self motivated', 'results-oriented', 'results oriented', 'detail-oriented', 'detail oriented', 'synergy', 'think outside the box', 'fast learner', 'quick learner', 'people person', 'highly motivated', 'proven track record', 'rockstar', 'ninja', 'guru', 'passionate about', 'excellent communication skills', 'strong communication skills', 'dynamic', 'seasoned'];

const BULLET_RE = /^\s*(?:[•●▪◦‣∙·▸►➢✓✔■□○*]|[-–—](?=\s)|\d{1,2}[.)](?=\s))\s*/;
const DATE_LINE_RE = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}|\b(?:19|20)\d{2}\b)\s*[-–—to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}|\b(?:19|20)\d{2}\b|present|current|now|ongoing|till date)/i;

const NUMBER_IN_BULLET = /\d|%|₹|\$|€|£|\b(?:lakh|lakhs|crore|crores|million|billion|thousand)\b/i;

function countMatches(re, s) { return (s.match(re) || []).length; }

function findContacts(text) {
  const email = (text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/) || [])[0] || '';
  let phone = '';
  const phoneRe = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s.-]?){1,4}\d{2,5}/g;
  for (const m of text.slice(0, 1500).matchAll(phoneRe)) {
    const digits = m[0].replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13 && !/^(19|20)\d{2}(19|20)\d{2}/.test(digits)) { phone = m[0].trim(); break; }
  }
  const linkedin = /linkedin\.com\/(?:in|pub)\/[\w\-%]+/i.test(text) || /\blinkedin\b/i.test(text);
  const github = /github\.com\/[\w-]+/i.test(text) || /\bgithub\b/i.test(text);
  const otherUrl = /(?:https?:\/\/|www\.)(?!(?:www\.)?(?:linkedin|github)\.com)[\w.-]+\.[a-z]{2,}/i.test(text);
  return { email, phone, linkedin, github, portfolio: otherUrl };
}

function extractBullets(sections, header) {
  const scopes = ['experience', 'projects', 'extracurricular', 'achievements', 'summary'];
  const bullets = [];
  let implicit = false;
  const collect = (lines, implicitMode) => {
    let prev = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const t = line.trim();
      if (!t) { prev = null; continue; }
      const marked = BULLET_RE.test(line);
      if (marked) {
        const body = t.replace(BULLET_RE, '').trim();
        prev = { text: body };
        bullets.push(prev);
        continue;
      }
      if (prev && /^[a-z0-9(%$₹]/.test(t) && !DATE_LINE_RE.test(t) && t.split(/\s+/).length <= 40) {
        prev.text += ' ' + t; // wrapped line of the previous bullet
        continue;
      }
      if (implicitMode && t.split(/\s+/).length >= 7 && !DATE_LINE_RE.test(t) && /[a-z]/.test(t)) {
        prev = { text: t };
        bullets.push(prev);
        continue;
      }
      prev = null;
    }
  };
  const bodyScopes = scopes.filter((k) => sections[k]);
  const markedCount = bodyScopes.reduce((n, k) => n + sections[k].filter((l) => BULLET_RE.test(l)).length, 0);
  if (markedCount < 3) implicit = true;
  for (const k of bodyScopes) if (k !== 'summary') collect(sections[k], implicit);
  return { bullets, implicit };
}

function yearsFromExperience(lines) {
  const txt = lines.join(' ');
  const years = [...txt.matchAll(/\b((?:19|20)\d{2})\b/g)].map((m) => Number(m[1]));
  if (!years.length) return 0;
  const present = /present|current|till date|ongoing|\bnow\b/i.test(txt);
  const thisYear = new Date().getFullYear();
  const min = Math.min(...years);
  const max = present ? thisYear : Math.max(...years);
  const span = max - min;
  return span >= 0 && span <= 45 ? span : 0;
}

function dateStyleMix(text) {
  // Only genuinely clashing styles count (year-only for education + "Mon YYYY" for jobs is normal).
  const styles = {
    'Mon YYYY': countMatches(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{4}\b/gi, text),
    'MM/YYYY': countMatches(/\b(?:0?[1-9]|1[0-2])\/(?:19|20)\d{2}\b/g, text),
  };
  return { styles, mixed: styles['Mon YYYY'] >= 2 && styles['MM/YYYY'] >= 2 };
}

export function analyzeSignals(text) {
  const clean = cleanResumeText(text);
  const { header, sections, order } = splitSections(clean);
  const lines = clean.split('\n').filter((l) => l.trim());
  const words = (clean.match(/\b[\w'+#.-]+\b/g) || []).length;
  const contacts = findContacts(header.join('\n') + '\n' + clean.slice(0, 1200));

  const { bullets, implicit } = extractBullets(sections, header);
  const bulletInfo = bullets.map((b) => {
    const t = b.text.replace(/\s+/g, ' ').trim();
    const first = (t.split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z-]/g, '');
    return {
      text: t,
      words: t.split(/\s+/).filter(Boolean).length,
      hasNumber: NUMBER_IN_BULLET.test(t),
      strong: ACTION_VERBS.has(first),
      weak: WEAK_STARTS.test(t),
      first,
      endsPeriod: /[.!]$/.test(t),
    };
  });
  const nB = bulletInfo.length;
  const withNumbers = bulletInfo.filter((b) => b.hasNumber).length;
  const strong = bulletInfo.filter((b) => b.strong).length;
  const weak = bulletInfo.filter((b) => b.weak).length;
  const avgWords = nB ? bulletInfo.reduce((n, b) => n + b.words, 0) / nB : 0;
  const longBullets = bulletInfo.filter((b) => b.words > 35).length;
  const periodShare = nB ? bulletInfo.filter((b) => b.endsPeriod).length / nB : 0;

  const firstCounts = {};
  bulletInfo.forEach((b) => { if (b.first && b.first.length > 2) firstCounts[b.first] = (firstCounts[b.first] || 0) + 1; });
  const repeated = Object.entries(firstCounts).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).map(([w, n]) => ({ word: w, count: n }));

  const bodyText = bulletInfo.map((b) => b.text).join(' ') + ' ' + (sections.summary || []).join(' ');
  const pronouns = countMatches(/(?:^|[\s(])(I|I'm|I've|my|me|myself)(?=[\s.,;:)])/g, bodyText);
  const lowerAll = clean.toLowerCase();
  const buzz = BUZZWORDS.filter((w) => lowerAll.includes(w));

  const personal = [];
  if (/date of birth|\bd\.?o\.?b\b|born on/i.test(clean)) personal.push('date of birth');
  if (/marital status|\bunmarried\b|\bmarried\b/i.test(clean)) personal.push('marital status');
  if (/father'?s? name|mother'?s? name|son of|daughter of|\bs\/o\b|\bd\/o\b/i.test(clean)) personal.push('parents’ names');
  if (/\breligion\b|\bnationality\b|\bcaste\b/i.test(clean)) personal.push('religion / nationality');
  if (/\bgender\s*:|\bsex\s*:/i.test(clean)) personal.push('gender');
  const hasDeclaration = !!sections.declaration || /i hereby declare/i.test(clean);
  if (hasDeclaration) personal.push('“I hereby declare” statement');

  const expLines = sections.experience || [];
  const yearsExp = yearsFromExperience(expLines);
  const expText = expLines.join(' ').toLowerCase();
  const onlyInterns = expLines.length > 0 && /intern|trainee|apprentice|training/.test(expText) && !/(engineer|developer|analyst|manager|consultant|lead|professor|lecturer|scientist|executive|associate)(?!.*intern)/.test(expText.replace(/intern[a-z]*/g, ''));
  let level = 'fresher';
  if (expLines.join('').trim() && !onlyInterns) {
    level = yearsExp >= 7 ? 'senior' : yearsExp >= 3 ? 'mid' : yearsExp >= 1 ? 'junior' : 'fresher';
  }
  const pubCount = (sections.publications || []).filter((l) => l.trim()).length;
  const profile = pubCount >= 4 ? 'academic' : level === 'fresher' ? 'fresher' : 'experienced';

  const skillsRaw = (sections.skills || []).join(' , ');
  const skillList = skillsRaw.split(/[,;|•●▪·\n]|\s{3,}/).map((s) => s.replace(/^[A-Za-z &/]{2,24}:\s*/, '').trim()).filter((s) => s && s.length <= 40 && s.split(/\s+/).length <= 5);
  const techFound = [...TECH_TERMS].filter((t) => hasTerm(normalizeForTerms(clean), t)).length;

  const dates = dateStyleMix(clean);

  return {
    words,
    lineCount: lines.length,
    estPages: Math.max(1, Math.ceil(words / 520)),
    contacts,
    sections: { present: order, header: header.filter((l) => l.trim()).slice(0, 6) },
    has: {
      summary: !!(sections.summary || []).join('').trim(),
      experience: !!expLines.join('').trim(),
      education: !!(sections.education || []).join('').trim(),
      skills: !!(sections.skills || []).join('').trim(),
      projects: !!(sections.projects || []).join('').trim(),
      certifications: !!(sections.certifications || []).join('').trim(),
      achievements: !!(sections.achievements || []).join('').trim(),
      publications: pubCount > 0,
    },
    bullets: {
      count: nB, implicit, withNumbers, strong, weak, avgWords: Math.round(avgWords * 10) / 10, longBullets,
      periodShare: Math.round(periodShare * 100) / 100,
      numberRatio: nB ? withNumbers / nB : 0,
      strongRatio: nB ? strong / nB : 0,
      weakRatio: nB ? weak / nB : 0,
      items: bulletInfo,
      repeated,
    },
    writing: { pronouns, buzzwords: buzz, personal },
    skills: { count: skillList.length, list: skillList.slice(0, 80), techFound },
    dates,
    yearsExp,
    level,
    profile,
    sectionLines: sections,
  };
}

/* ═══════════════════════════════════════════════════════════════
   6. Tech vocabulary & JD matching
═══════════════════════════════════════════════════════════════ */
const TECH_LIST = `python java javascript typescript c++ c# golang rust kotlin swift php ruby scala matlab sql nosql bash shell powershell dart perl
react angular vue next.js nuxt node.js express django flask fastapi spring spring-boot laravel html css sass tailwind bootstrap redux graphql rest-api websocket jquery webpack vite
pandas numpy scikit-learn tensorflow pytorch keras opencv nlp llm rag transformers hugging-face langchain machine-learning deep-learning computer-vision data-analysis data-science data-engineering data-visualization statistics power-bi tableau excel spark hadoop kafka airflow etl data-warehouse mlops generative-ai prompt-engineering reinforcement-learning time-series
aws azure gcp docker kubernetes terraform ansible jenkins ci/cd github-actions linux unix git github gitlab nginx serverless lambda vercel heroku
mysql postgresql mongodb redis sqlite firebase supabase oracle dynamodb elasticsearch cassandra neo4j
android ios flutter react-native xamarin
selenium junit pytest jest cypress postman playwright unit-testing tdd
jira figma vs-code jupyter intellij eclipse
agile scrum kanban microservices oop data-structures algorithms system-design design-patterns devops sdlc api-design oauth jwt
cybersecurity penetration-testing owasp encryption networking tcp/ip
verilog vhdl systemverilog fpga rtl embedded-c arduino raspberry-pi iot stm32 microcontroller asic vlsi cadence synopsys spice uvm
project-management stakeholder-management leadership communication problem-solving teamwork customer-service salesforce sap erp seo content-writing digital-marketing google-analytics`
  .split(/\s+/).filter(Boolean).map((t) => t.replace(/-/g, ' '));

const TECH_TERMS = new Set(TECH_LIST);

const SYNONYMS = [
  [/\breact\.?js\b/g, 'react'], [/\bnodejs\b/g, 'node.js'], [/\bnode js\b/g, 'node.js'], [/\bnode\b(?!\.)/g, 'node.js'], [/\bnextjs\b/g, 'next.js'], [/\bvuejs\b|\bvue\.js\b/g, 'vue'], [/\bangularjs\b|\bangular\.js\b/g, 'angular'],
  [/\bexpressjs\b|\bexpress\.js\b/g, 'express'], [/(^|[^a-z0-9.])js\b/g, '$1javascript'], [/(^|[^a-z0-9.])ts\b/g, '$1typescript'], [/\bgolang\b/g, 'golang'], [/\bcpp\b/g, 'c++'],
  [/\bml\b/g, 'machine learning'], [/\bdl\b/g, 'deep learning'], [/\bk8s\b/g, 'kubernetes'], [/\bpostgres\b/g, 'postgresql'], [/\bmongo\b/g, 'mongodb'],
  [/\bsklearn\b|\bscikit learn\b|\bscikitlearn\b/g, 'scikit-learn'], [/\btf\b/g, 'tensorflow'], [/\bpowerbi\b/g, 'power bi'], [/\bci\s*\/?\s*cd\b/g, 'ci/cd'],
  [/\bgen\s?ai\b|\bgenai\b/g, 'generative ai'], [/\blarge language models?\b/g, 'llm'], [/\brestful( apis?)?\b|\brest apis?\b/g, 'rest api'], [/\bms excel\b|\bmicrosoft excel\b/g, 'excel'],
  [/\bobject[- ]oriented( programming)?\b/g, 'oop'], [/\bdsa\b/g, 'data structures'], [/\bnatural language processing\b/g, 'nlp'], [/\bhugging ?face\b/g, 'hugging face'],
  [/\bvisual studio code\b|\bvscode\b/g, 'vs code'], [/\bspringboot\b/g, 'spring boot'], [/\bamazon web services\b/g, 'aws'], [/\bgoogle cloud( platform)?\b/g, 'gcp'],
];

export function normalizeForTerms(s) {
  let t = ' ' + String(s || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[–—]/g, '-') + ' ';
  for (const [re, to] of SYNONYMS) t = t.replace(re, to);
  return t;
}

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

export function hasTerm(normText, term) {
  if (!term) return false;
  const t = term.toLowerCase();
  const re = new RegExp(`(^|[^a-z0-9+#.])${escRe(t)}(?![a-z0-9+#])`, 'i');
  return re.test(normText);
}

const STOP = new Set(`a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its just me more most my no nor not now of off on once only or other our out over own same she should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours`.split(/\s+/));

const JD_NOISE = new Set(`experience work team will looking ability strong skills role job candidate requirements responsibilities preferred required years year etc including plus good excellent knowledge understanding must using new use used well working across within based related ideal proven demonstrated successful opportunity company join help support make ensure part full time position apply benefits salary location minimum degree bachelor master equivalent least both able need needs highly high level high-level seeking responsible environment business client clients customers customer product products services service solutions solution drive passion passionate collaborate collaboration key variety day daily general various overall like etc ensure provide providing understand develop developing development`.split(/\s+/));

export function matchJobDescription(resumeText, jd) {
  const jdText = String(jd || '').trim();
  if (jdText.length < 40) return null;
  const resumeNorm = normalizeForTerms(resumeText);
  const jdNorm = normalizeForTerms(jdText);

  const jdLines = jdText.split('\n').map((l) => normalizeForTerms(l));
  const isRequiredLine = (term) => jdLines.some((l) => /required|must have|must-have|mandatory|minimum|essential|should have/.test(l) && hasTerm(l, term));

  const candidates = new Map();
  const add = (term, weight, count) => {
    const prev = candidates.get(term);
    if (!prev || prev.weight < weight) candidates.set(term, { term, weight, count });
  };

  for (const term of TECH_TERMS) {
    if (hasTerm(jdNorm, term)) {
      const count = (jdNorm.match(new RegExp(`(^|[^a-z0-9+#.])${escRe(term)}(?![a-z0-9+#])`, 'gi')) || []).length;
      add(term, 2 + Math.min(2, count - 1) * 0.5 + (isRequiredLine(term) ? 1 : 0), count);
    }
  }
  const freq = {};
  for (const w of jdNorm.match(/[a-z][a-z+#.-]{2,}/g) || []) {
    if (STOP.has(w) || JD_NOISE.has(w) || TECH_TERMS.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  Object.entries(freq).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .forEach(([w, n]) => add(w, 1, n));

  const all = [...candidates.values()];
  if (!all.length) return null;
  const matched = [], missing = [];
  for (const c of all) (hasTerm(resumeNorm, c.term) ? matched : missing).push(c);
  const total = all.reduce((n, c) => n + c.weight, 0);
  const got = matched.reduce((n, c) => n + c.weight, 0);
  const byWeight = (a, b) => b.weight - a.weight || b.count - a.count;
  return {
    score: Math.round((got / total) * 100),
    matched: matched.sort(byWeight).slice(0, 30),
    missing: missing.sort(byWeight).slice(0, 18),
    total: all.length,
  };
}

/* ═══════════════════════════════════════════════════════════════
   7. Scoring
═══════════════════════════════════════════════════════════════ */
export const SCORE_WEIGHTS = { contact: 10, structure: 25, impact: 30, writing: 20, skills: 15 };
export const SCORE_WEIGHTS_JD = { contact: 8, structure: 20, impact: 25, writing: 14, skills: 13, jd: 20 };

export function scoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Needs work';
  return 'Weak';
}

const note = (type, text) => ({ type, text });

export function scoreSignals(sig, { jdMatch = null, multiColumn = false } = {}) {
  const cats = [];

  // 1 ── Contact & basics
  {
    const c = sig.contacts;
    const n = [];
    let s = 0;
    if (c.email) { s += 35; } else n.push(note('bad', 'No email address found.'));
    if (c.phone) { s += 25; } else n.push(note('bad', 'No phone number found.'));
    if (c.linkedin) { s += 20; } else n.push(note('warn', 'Add your LinkedIn URL — recruiters check it.'));
    const techy = sig.skills.techFound >= 3;
    if (c.github || c.portfolio) { s += 20; } else n.push(note(techy ? 'warn' : 'info', techy ? 'Add a GitHub or portfolio link to back up your skills.' : 'A portfolio or website link is optional but helpful.'));
    if (!techy && !(c.github || c.portfolio)) s += 12;
    if (s >= 80) n.unshift(note('good', 'Contact details are complete.'));
    cats.push({ key: 'contact', label: 'Contact details', score: clamp(s), notes: n });
  }

  // 2 ── Structure & ATS readability
  {
    const n = [];
    let s = 0;
    const h = sig.has;
    if (h.education) s += 20; else n.push(note('bad', 'No clear Education section found.'));
    if (h.skills) s += 20; else n.push(note('bad', 'No clear Skills section found — ATS scans it first.'));
    if (h.experience || h.projects) s += 20; else n.push(note('bad', 'No Experience or Projects section found.'));
    if (h.summary) s += 8; else n.push(note('warn', sig.level === 'fresher' ? 'Add a 2-line objective with your target role and top skills.' : 'Add a short professional summary at the top.'));
    const lo = sig.level === 'fresher' ? 250 : 350;
    const hi = sig.level === 'fresher' ? 650 : sig.level === 'senior' ? 1200 : 950;
    if (sig.words >= lo && sig.words <= hi) { s += 17; }
    else if (sig.words < lo) { s += Math.max(4, Math.round(17 * sig.words / lo)); n.push(note('warn', `Only ${sig.words} words — too thin. Add detail on projects, internships, or skills.`)); }
    else { s += Math.max(5, Math.round(17 * hi / sig.words)); n.push(note('warn', `${sig.words} words is long. ${sig.level === 'fresher' ? 'Freshers should fit on one page' : 'Trim to the most relevant 2 pages'}.`)); }
    if (!multiColumn) s += 10; else n.push(note('bad', 'Two-column layout can scramble the reading order in ATS systems.'));
    if (!sig.dates.mixed) s += 5; else n.push(note('warn', 'Date formats are inconsistent (mix of “Jan 2023”, “01/2023” and years). Pick one.'));
    if (sig.bullets.count >= 4) s += 0; else n.push(note('warn', 'Few bullet points detected. Bullets are easier for recruiters and ATS to scan than paragraphs.'));
    if (s >= 85 && !n.length) n.push(note('good', 'Clean, scannable structure.'));
    cats.push({ key: 'structure', label: 'Structure & ATS readability', score: clamp(s), notes: n });
  }

  // 3 ── Impact & results
  {
    const b = sig.bullets;
    const n = [];
    let s;
    if (b.count < 3) {
      s = 15;
      n.push(note('bad', 'Not enough achievement bullets to judge impact. Describe what you built and the result.'));
    } else {
      const target = sig.level === 'fresher' ? 0.35 : 0.5;
      const metrics = Math.min(1, b.numberRatio / target) * 50;
      const verbs = Math.min(1, b.strongRatio / 0.7) * 30;
      const weakPenalty = 20 * (1 - Math.min(1, b.weakRatio / 0.2));
      s = metrics + verbs + weakPenalty;
      const pct = Math.round(b.numberRatio * 100);
      if (b.numberRatio >= target) n.push(note('good', `${pct}% of your bullets include numbers — great evidence of impact.`));
      else n.push(note('warn', `Only ${pct}% of bullets include numbers (aim for ${Math.round(target * 100)}%+). Add users, %, time saved, scale, or accuracy.`));
      if (b.strongRatio >= 0.7) n.push(note('good', 'Most bullets start with strong action verbs.'));
      else n.push(note('warn', `${Math.round(b.strongRatio * 100)}% of bullets start with a strong action verb (aim for 70%+).`));
      if (b.weak > 0) n.push(note('warn', `${b.weak} bullet${b.weak > 1 ? 's' : ''} start with weak phrases like “Responsible for” or “Worked on”.`));
    }
    cats.push({ key: 'impact', label: 'Impact & results', score: clamp(Math.round(s)), notes: n });
  }

  // 4 ── Writing quality
  {
    const w = sig.writing;
    const b = sig.bullets;
    const n = [];
    let s = 100;
    if (w.pronouns > 0) { s -= Math.min(15, 4 + w.pronouns * 2); n.push(note('warn', 'Avoid “I / my / me” — resumes use implied first person.')); }
    if (w.buzzwords.length) { s -= Math.min(20, w.buzzwords.length * 6); n.push(note('warn', `Replace vague buzzwords with proof: ${w.buzzwords.slice(0, 4).map((x) => `“${x}”`).join(', ')}.`)); }
    if (b.count >= 3) {
      if (b.avgWords < 8) { s -= 10; n.push(note('warn', 'Bullets are very short — add what you did and the result.')); }
      else if (b.avgWords > 30) { s -= 10; n.push(note('warn', 'Bullets are long. Aim for 12–25 words each.')); }
      if (b.longBullets >= 2) { s -= 5; n.push(note('warn', `${b.longBullets} bullets run over 35 words — split or tighten them.`)); }
      if (b.periodShare > 0.25 && b.periodShare < 0.75) { s -= 4; n.push(note('info', 'Inconsistent end punctuation across bullets — either use full stops everywhere or nowhere.')); }
      if (b.repeated.length) { s -= Math.min(12, b.repeated.length * 5); n.push(note('warn', `Repeated openers: ${b.repeated.slice(0, 3).map((r) => `“${r.word}” ×${r.count}`).join(', ')}. Vary your verbs.`)); }
    }
    if (w.personal.length) { s -= Math.min(15, w.personal.length * 5); n.push(note('warn', `Outdated personal details: ${w.personal.join(', ')}. Modern resumes leave these out.`)); }
    if (!n.length) n.push(note('good', 'Clear, professional writing.'));
    cats.push({ key: 'writing', label: 'Writing quality', score: clamp(Math.round(s)), notes: n });
  }

  // 5 ── Skills & keywords
  {
    const n = [];
    let s = 0;
    if (sig.has.skills) s += 20; else n.push(note('bad', 'Add a dedicated Skills section (comma-separated, exact tool names).'));
    const cnt = sig.skills.count;
    s += Math.min(1, cnt / 12) * 40;
    if (cnt < 8 && sig.has.skills) n.push(note('warn', `Only ${cnt} skills listed. List every relevant tool and technology (aim for 12+).`));
    s += Math.min(1, sig.skills.techFound / 8) * 40;
    if (sig.skills.techFound >= 8) n.push(note('good', `${sig.skills.techFound} recognised tools & technologies — good keyword coverage.`));
    cats.push({ key: 'skills', label: 'Skills & keywords', score: clamp(Math.round(s)), notes: n });
  }

  // 6 ── Job match (optional)
  if (jdMatch) {
    const n = [];
    if (jdMatch.score >= 70) n.push(note('good', `You cover ${jdMatch.matched.length} of the ${jdMatch.total} key terms in this job description.`));
    if (jdMatch.missing.length) n.push(note(jdMatch.score >= 70 ? 'info' : 'warn', `Missing: ${jdMatch.missing.slice(0, 6).map((m) => m.term).join(', ')}. Add them only if you truly have the skill.`));
    cats.push({ key: 'jd', label: 'Job description match', score: clamp(jdMatch.score), notes: n });
  }

  const W = jdMatch ? SCORE_WEIGHTS_JD : SCORE_WEIGHTS;
  let sum = 0, wsum = 0;
  for (const c of cats) { c.weight = W[c.key]; sum += c.score * c.weight; wsum += c.weight; }
  const overall = Math.round(sum / wsum);
  return { overall, categories: cats, label: scoreLabel(overall) };
}

/* ═══════════════════════════════════════════════════════════════
   8. Quote validation & grounding (anti-hallucination)
═══════════════════════════════════════════════════════════════ */
export function normForMatch(s) {
  return String(s || '').toLowerCase()
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-')
    .replace(/[^a-z0-9%+#.$₹\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function makeSourceIndex(text) {
  const norm = normForMatch(text);
  const words = norm.split(' ');
  const shingles = new Set();
  for (let i = 0; i <= words.length - 3; i++) shingles.add(words.slice(i, i + 3).join(' '));
  return { norm, shingles };
}

export function quoteInSource(quote, idx) {
  const q = normForMatch(quote);
  if (q.length < 6) return false;
  if (idx.norm.includes(q)) return true;
  const w = q.split(' ');
  if (w.length < 4) return false;
  let hit = 0, tot = 0;
  for (let i = 0; i <= w.length - 3; i++) { tot++; if (idx.shingles.has(w.slice(i, i + 3).join(' '))) hit++; }
  return tot > 0 && hit / tot >= 0.8;
}

const YEAR_RE = /^(19|20)\d{2}$/;
const NUM_RE = /\d[\d,]*(?:\.\d+)?/g;

export function numberSet(text) {
  const set = new Set();
  for (const m of String(text || '').matchAll(NUM_RE)) set.add(m[0].replace(/,/g, ''));
  return set;
}

export function ungroundedNumbers(text, srcNums) {
  const out = [];
  for (const m of String(text || '').matchAll(NUM_RE)) {
    const v = m[0].replace(/,/g, '');
    if (YEAR_RE.test(v)) continue;
    if (v.length === 1 && !/%/.test(text.slice(m.index, m.index + m[0].length + 1))) continue; // "1", "2" in prose
    if (!srcNums.has(v)) out.push(m[0]);
  }
  return out;
}

export const PLACEHOLDER_RE = /\[add [^\]]{1,28}\]/gi;
export const countPlaceholders = (text) => (String(text || '').match(PLACEHOLDER_RE) || []).length;

/** Validates AI issues/strengths: keeps only items whose quote really exists in the resume. */
export function validateFindings(list, idx, { allowEmpty = true } = {}) {
  const kept = [];
  let dropped = 0;
  for (const it of list || []) {
    const q = String(it?.quote || '').trim();
    if (!q) { if (allowEmpty) kept.push({ ...it, quote: '' }); else dropped++; continue; }
    if (quoteInSource(q, idx)) kept.push(it);
    else dropped++;
  }
  return { kept, dropped };
}

/** Checks a generated resume against the user's source text. */
export function groundingCheck(resume, sourceText) {
  const idx = makeSourceIndex(sourceText);
  const srcNums = numberSet(sourceText);
  const r = normalizeResume(resume);
  const numbers = [];
  const scanText = (where, text) => {
    const bad = ungroundedNumbers(text, srcNums);
    bad.forEach((v) => numbers.push({ value: v, where }));
  };
  scanText('Summary', r.summary);
  r.experience.forEach((e) => e.bullets.forEach((b) => scanText(`${e.title || 'Experience'}`, b)));
  r.projects.forEach((p) => { scanText(p.name || 'Project', p.description); p.bullets.forEach((b) => scanText(p.name || 'Project', b)); });
  r.achievements.forEach((a) => scanText('Achievements', a));
  r.awards.forEach((a) => scanText('Awards', a));

  const hasInSource = (s) => {
    const n = normForMatch(s);
    return !n || ` ${idx.norm} `.includes(` ${n} `) || idx.norm.includes(n);
  };
  const skills = [];
  [...r.skills.technical, ...r.skills.tools].forEach((s) => { if (!hasInSource(s)) skills.push(s); });
  const entities = [];
  r.experience.forEach((e) => { if (e.company && !hasInSource(e.company)) entities.push(e.company); });
  r.education.forEach((e) => { if (e.institution && !hasInSource(e.institution)) entities.push(e.institution); });

  const uniq = (a) => [...new Set(a)];
  const out = {
    numbers: numbers.filter((n, i, a) => a.findIndex((m) => m.value === n.value && m.where === n.where) === i),
    skills: uniq(skills),
    entities: uniq(entities),
  };
  out.clean = !out.numbers.length && !out.skills.length && !out.entities.length;
  return out;
}

/* ═══════════════════════════════════════════════════════════════
   9. Resume model
═══════════════════════════════════════════════════════════════ */
export const SECTION_TITLES = {
  summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects',
  certifications: 'Certifications', publications: 'Publications', awards: 'Awards', achievements: 'Achievements',
  mentorship: 'Volunteer & Mentorship', languages: 'Languages',
};

export function emptyResume() {
  return {
    name: '',
    contact: { email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], tools: [], soft: [] },
    projects: [],
    certifications: [],
    publications: { books: [], papers: [], datasets: [] },
    awards: [],
    achievements: [],
    mentorship: [],
    languages: [],
  };
}

const S = (v) => (v == null ? '' : String(v).replace(/\s+/g, ' ').trim());
const stripBullet = (s) => S(s).replace(BULLET_RE, '').trim();
const toArr = (v) => (Array.isArray(v) ? v : (typeof v === 'string' && v.trim() ? v.split(/\n/) : []));
const objText = (x) => (x && typeof x === 'object' ? Object.values(x).filter((y) => typeof y === 'string' && y).join(' — ') : S(x));
const strList = (v) => toArr(v).map((x) => (typeof x === 'string' ? x : objText(x))).map(stripBullet).filter(Boolean);
const skillList = (v) => toArr(typeof v === 'string' ? v.replace(/\n/g, ',') : v)
  .flatMap((x) => (typeof x === 'string' ? x.split(/\s*[,;|•]\s*/) : [objText(x)]))
  .map((x) => S(x)).filter(Boolean)
  .filter((x, i, a) => a.findIndex((y) => y.toLowerCase() === x.toLowerCase()) === i);

export function normalizeResume(raw) {
  const r = raw && typeof raw === 'object' ? (raw.resume && typeof raw.resume === 'object' ? raw.resume : raw) : {};
  const out = emptyResume();
  const c = r.contact || {};
  out.name = S(r.name);
  out.contact = {
    email: S(c.email ?? r.email), phone: S(c.phone ?? r.phone), location: S(c.location ?? r.location),
    linkedin: S(c.linkedin ?? r.linkedin), github: S(c.github ?? r.github), website: S(c.website ?? c.portfolio ?? r.website),
  };
  out.summary = S(r.summary ?? r.objective);
  out.experience = toArr(r.experience).filter((e) => e && typeof e === 'object').map((e) => ({
    title: S(e.title ?? e.role), company: S(e.company ?? e.organization), location: S(e.location),
    dates: S(e.dates ?? ([e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – '))),
    bullets: strList(e.bullets ?? e.responsibilities ?? e.description),
  })).filter((e) => e.title || e.company || e.bullets.length);
  out.education = toArr(r.education).filter((e) => e && typeof e === 'object').map((e) => {
    let degree = S(e.degree);
    if (e.field && !degree.toLowerCase().includes(S(e.field).toLowerCase())) degree = degree ? `${degree} in ${S(e.field)}` : S(e.field);
    return { degree, institution: S(e.institution ?? e.school ?? e.university), location: S(e.location), dates: S(e.dates ?? e.year), gpa: S(e.gpa ?? e.cgpa ?? e.grade), details: strList(e.details) };
  }).filter((e) => e.degree || e.institution);
  const sk = r.skills;
  if (Array.isArray(sk) || typeof sk === 'string') out.skills.technical = skillList(sk);
  else if (sk && typeof sk === 'object') out.skills = { technical: skillList(sk.technical), tools: skillList(sk.tools), soft: skillList(sk.soft ?? sk.soft_skills) };
  out.projects = toArr(r.projects).filter((p) => p && typeof p === 'object').map((p) => ({
    name: S(p.name ?? p.title), tech: Array.isArray(p.tech) ? p.tech.map(S).filter(Boolean).join(', ') : S(p.tech ?? p.stack),
    link: S(p.link ?? p.url), description: S(typeof p.description === 'string' ? p.description : ''), bullets: strList(p.bullets),
  })).filter((p) => p.name || p.description || p.bullets.length);
  out.certifications = strList(r.certifications ?? r.certs);
  const pub = r.publications;
  if (Array.isArray(pub)) out.publications.papers = strList(pub);
  else if (pub && typeof pub === 'object') out.publications = { books: strList(pub.books), papers: strList(pub.papers), datasets: strList(pub.datasets) };
  out.awards = strList(r.awards);
  out.achievements = strList(r.achievements);
  out.mentorship = strList(r.mentorship ?? r.volunteering);
  out.languages = skillList(r.languages);
  return out;
}

export function inferProfile(resume) {
  const r = normalizeResume(resume);
  const pubs = r.publications.books.length + r.publications.papers.length + r.publications.datasets.length;
  if (pubs >= 4) return 'academic';
  const exp = r.experience;
  if (!exp.length || exp.every((e) => /intern|trainee|apprentice|training/i.test(`${e.title} ${e.company}`))) return 'fresher';
  return 'experienced';
}

export function sectionOrder(resume, profile) {
  const p = profile || inferProfile(resume);
  if (p === 'fresher') return ['summary', 'education', 'skills', 'projects', 'experience', 'certifications', 'achievements', 'awards', 'publications', 'mentorship', 'languages'];
  if (p === 'academic') return ['summary', 'education', 'experience', 'publications', 'projects', 'skills', 'certifications', 'awards', 'achievements', 'mentorship', 'languages'];
  return ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'publications', 'awards', 'achievements', 'mentorship', 'languages'];
}

/** Resume → text with ATS-style headings (used for re-scoring and grounding). */
export function resumeToText(resume) {
  const r = normalizeResume(resume);
  const L = [];
  if (r.name) L.push(r.name);
  const c = r.contact;
  const contact = [c.email, c.phone, c.location, c.linkedin, c.github, c.website].filter(Boolean).join(' | ');
  if (contact) L.push(contact);
  const sec = (title, lines) => { if (lines.length) { L.push('', title.toUpperCase(), ...lines); } };
  sec('Summary', r.summary ? [r.summary] : []);
  sec('Experience', r.experience.flatMap((e) => [[e.title, e.company].filter(Boolean).join(' — ') + (e.dates ? `  ${e.dates}` : ''), ...e.bullets.map((b) => `• ${b}`)]));
  sec('Education', r.education.flatMap((e) => [[e.degree, e.institution].filter(Boolean).join(' — ') + (e.dates ? `  ${e.dates}` : ''), ...(e.gpa ? [`GPA: ${e.gpa}`] : []), ...e.details.map((d) => `• ${d}`)]));
  const sk = [];
  if (r.skills.technical.length) sk.push(`Technical: ${r.skills.technical.join(', ')}`);
  if (r.skills.tools.length) sk.push(`Tools: ${r.skills.tools.join(', ')}`);
  if (r.skills.soft.length) sk.push(`Soft skills: ${r.skills.soft.join(', ')}`);
  sec('Skills', sk);
  sec('Projects', r.projects.flatMap((p) => [p.name + (p.tech ? ` (${p.tech})` : ''), ...(p.description ? [`• ${p.description}`] : []), ...p.bullets.map((b) => `• ${b}`)]));
  sec('Certifications', r.certifications.map((x) => `• ${x}`));
  const pubs = [...r.publications.books, ...r.publications.papers, ...r.publications.datasets];
  sec('Publications', pubs.map((x) => `• ${x}`));
  sec('Awards', r.awards.map((x) => `• ${x}`));
  sec('Achievements', r.achievements.map((x) => `• ${x}`));
  sec('Volunteer and Mentorship', r.mentorship.map((x) => `• ${x}`));
  sec('Languages', r.languages.length ? [r.languages.join(', ')] : []);
  return L.join('\n');
}

export function resumeStats(resume) {
  const r = normalizeResume(resume);
  const bullets = r.experience.reduce((n, e) => n + e.bullets.length, 0) + r.projects.reduce((n, p) => n + p.bullets.length + (p.description ? 1 : 0), 0);
  return { roles: r.experience.length, projects: r.projects.length, skills: r.skills.technical.length + r.skills.tools.length, bullets };
}

export function resumeHasContent(resume) {
  const r = normalizeResume(resume);
  return !!(r.name || r.experience.length || r.education.length || r.skills.technical.length || r.projects.length);
}

/* ═══════════════════════════════════════════════════════════════
   10. Prompts & AI tasks
═══════════════════════════════════════════════════════════════ */
const clip = (s, n) => String(s || '').slice(0, n);

function measuredFacts(sig, jdMatch) {
  const b = sig.bullets;
  const lines = [
    `Level (estimated): ${sig.level}${sig.yearsExp ? `, ~${sig.yearsExp} yrs` : ''}`,
    `Words: ${sig.words}; bullets detected: ${b.count}; with numbers: ${b.withNumbers}; strong action verbs: ${b.strong}; weak openers: ${b.weak}`,
    `Sections found: ${sig.sections.present.join(', ') || 'none'}`,
    `Contact: email ${sig.contacts.email ? 'yes' : 'NO'}, phone ${sig.contacts.phone ? 'yes' : 'NO'}, LinkedIn ${sig.contacts.linkedin ? 'yes' : 'no'}, GitHub/portfolio ${sig.contacts.github || sig.contacts.portfolio ? 'yes' : 'no'}`,
  ];
  if (jdMatch) lines.push(`JD keyword match: ${jdMatch.score}%. Missing JD terms: ${jdMatch.missing.slice(0, 12).map((m) => m.term).join(', ') || 'none'}`);
  return lines.join('\n');
}

export const ANALYSIS_SYSTEM = `You are a senior technical recruiter and ATS specialist reviewing resumes for Indian and global job markets. Reply with ONE valid JSON object only — no markdown, no commentary.

RULES
1. EVIDENCE: every strength and issue needs "quote": an EXACT contiguous excerpt (max 25 words) copied from the resume. If you cannot quote it, do not report it. For something missing entirely (e.g. no summary) use quote "" and name the section it belongs in.
2. NEVER invent facts, employers, tools or numbers. If a rewrite needs a metric the resume does not contain, use a placeholder exactly like [add number], [add %] or [add metric] — never a made-up figure.
3. "rewrite" may only reuse facts that are in the resume (plus placeholders).
4. Be specific, candid and constructive. No flattery, no generic advice. Maximum 10 issues ordered by impact, maximum 4 strengths.
5. Calibrate to the candidate's level: for freshers, projects/internships/skills are the evidence — never penalise missing work experience.
6. Trust the MEASURED FACTS block; do not contradict it. Do not comment on visual design or columns.
7. Keep every text field under 30 words.

SCHEMA
{"level":"fresher|junior|mid|senior","inferred_roles":["…"],"quality_score":0-100,"verdict":"2 candid sentences","strengths":[{"point":"","quote":""}],"issues":[{"severity":"high|medium|low","section":"summary|experience|education|skills|projects|certifications|other","quote":"","problem":"","fix":"","rewrite":""}],"missing_sections":["…"],"keyword_suggestions":["skills commonly expected for the inferred roles that the resume does not mention"],"jd_fit":{"summary":"","tailoring_tips":["…"]}}
Include "jd_fit" only when a job description is supplied; otherwise omit it. "quality_score" judges content clarity, relevance and evidence — not formatting.`;

export function buildAnalysisMessages({ text, sig, jd, role, jdMatch }) {
  const parts = [`MEASURED FACTS (computed by our parser):\n${measuredFacts(sig, jdMatch)}`];
  if (role) parts.push(`TARGET ROLE: ${clip(role, 120)}`);
  if (jd && jd.trim().length >= 40) parts.push(`JOB DESCRIPTION:\n${clip(jd, 5000)}`);
  parts.push(`RESUME:\n${clip(text, 12000)}`);
  return [{ role: 'system', content: ANALYSIS_SYSTEM }, { role: 'user', content: parts.join('\n\n') }];
}

/**
 * Full analysis pipeline: deterministic (instant) + AI review (validated).
 * `onDeterministic` fires immediately so the UI can show scores while the AI works.
 */
export const blendScore = (det, quality) => (quality == null ? det : Math.round(det * 0.8 + quality * 0.2));

/** Instant, offline half of the analysis (also used to re-score a generated resume). */
export function computeDeterministic(text, { jd = '', multiColumn = false } = {}) {
  const sig = analyzeSignals(text);
  const jdMatch = matchJobDescription(text, jd);
  const det = scoreSignals(sig, { jdMatch, multiColumn });
  return { sig, jdMatch, det, multiColumn };
}

function cleanLlm(parsed, idx, sig) {
  const issues = validateFindings(Array.isArray(parsed.issues) ? parsed.issues : [], idx);
  const strengths = validateFindings(Array.isArray(parsed.strengths) ? parsed.strengths : [], idx, { allowEmpty: false });
  const sev = { high: 0, medium: 1, low: 2 };
  const cleanIssues = issues.kept
    .map((i) => ({
      severity: ['high', 'medium', 'low'].includes(i.severity) ? i.severity : 'medium',
      section: S(i.section) || 'other', quote: S(i.quote), problem: S(i.problem), fix: S(i.fix), rewrite: S(i.rewrite),
    }))
    .filter((i) => i.problem || i.fix)
    .sort((a, b) => sev[a.severity] - sev[b.severity])
    .slice(0, 10);
  const q = Number(parsed.quality_score);
  return {
    level: S(parsed.level) || sig.level,
    roles: strList(parsed.inferred_roles).slice(0, 3),
    quality: Number.isFinite(q) ? clamp(Math.round(q)) : null,
    verdict: S(parsed.verdict),
    strengths: strengths.kept.map((s2) => ({ point: S(s2.point), quote: S(s2.quote) })).filter((s2) => s2.point).slice(0, 4),
    issues: cleanIssues,
    missingSections: strList(parsed.missing_sections).slice(0, 6),
    keywordSuggestions: strList(parsed.keyword_suggestions).slice(0, 12),
    jdFit: parsed.jd_fit && typeof parsed.jd_fit === 'object' ? { summary: S(parsed.jd_fit.summary), tips: strList(parsed.jd_fit.tailoring_tips).slice(0, 5) } : null,
    dropped: issues.dropped + strengths.dropped,
  };
}

/**
 * Full analysis pipeline: deterministic (instant) + AI review (validated).
 * `onDeterministic` fires immediately so the UI can show scores while the AI works.
 */
export async function analyzeResume({ text, jd = '', role = '', model, multiColumn = false, onDeterministic, ai = aiCall }) {
  const base = computeDeterministic(text, { jd, multiColumn });
  if (onDeterministic) onDeterministic(base);

  const { text: raw } = await ai({
    toolId: 'resume-analyzer', model, json: true, reasoning: 'low', maxTokens: 6000, temperature: 0.2,
    messages: buildAnalysisMessages({ text, sig: base.sig, jd, role, jdMatch: base.jdMatch }),
  });
  const llm = cleanLlm(parseJsonLoose(raw), makeSourceIndex(text), base.sig);
  const overall = blendScore(base.det.overall, llm.quality);
  return { ...base, llm, overall, label: scoreLabel(overall) };
}

/** Plain-text report for copy/paste or sharing with a mentor. */
export function analysisToText(a, role = '') {
  const L = [`RESUME REVIEW — score ${a.overall}/100 (${a.label})`];
  if (role) L.push(`Target role: ${role}`);
  if (a.llm?.verdict) L.push('', a.llm.verdict);
  L.push('', 'CATEGORY SCORES');
  a.det.categories.forEach((c) => L.push(`- ${c.label}: ${c.score}/100`));
  if (a.jdMatch) L.push('', `JOB MATCH: ${a.jdMatch.score}%`, `Missing terms: ${a.jdMatch.missing.map((m) => m.term).join(', ') || 'none'}`);
  if (a.llm?.issues?.length) {
    L.push('', 'FIXES (highest impact first)');
    a.llm.issues.forEach((i, n) => {
      L.push(`${n + 1}. [${i.severity.toUpperCase()}] ${i.section}: ${i.problem}`);
      if (i.quote) L.push(`   Quote: “${i.quote}”`);
      if (i.fix) L.push(`   Fix: ${i.fix}`);
      if (i.rewrite) L.push(`   Rewrite: ${i.rewrite}`);
    });
  }
  L.push('', 'Reviewed with ZeroAPI Resume Analyzer — zeroapi.in');
  return L.join('\n');
}

/* ───────── Build / tailor ───────── */
const RESUME_SCHEMA = `{"name":"","contact":{"email":"","phone":"","location":"","linkedin":"","github":"","website":""},"summary":"","experience":[{"title":"","company":"","location":"","dates":"","bullets":[""]}],"education":[{"degree":"","institution":"","dates":"","gpa":"","details":[""]}],"skills":{"technical":[""],"tools":[""],"soft":[""]},"projects":[{"name":"","tech":"","link":"","description":"","bullets":[""]}],"certifications":[""],"publications":{"books":[""],"papers":[""],"datasets":[""]},"awards":[""],"achievements":[""],"mentorship":[""],"languages":[""]}`;

export const BUILD_SYSTEM = `You are an expert resume writer and ATS specialist. Produce ONE valid JSON object only — no markdown, no commentary.

OUTPUT: {"resume": <resume>, "changes": [{"section":"","before":"","after":"","reason":""}]}
<resume> schema: ${RESUME_SCHEMA}

NON-NEGOTIABLE RULES
1. TRUTH: use only facts present in the SOURCE. Never invent employers, titles, dates, degrees, grades, tools, certifications, publications or numbers. Copy names, dates, institutions, grades, publications and certifications exactly as written.
2. NUMBERS: keep every original number exactly. Add no new numbers. Where a bullet clearly lacks a result and a metric would be natural, you may end it with a placeholder such as [add number], [add %] or [add metric] — only when placeholders are allowed (see OPTIONS), at most once per bullet and for at most 6 bullets in total.
3. SKILLS: list every tool, language, framework and technology that appears anywhere in the SOURCE, copied VERBATIM (ATS matches exact strings; "TensorFlow" stays "TensorFlow"). Put the ones most relevant to the target role first. Never add a skill that is not in the SOURCE, even if the job description asks for it.
4. BULLETS: start with a strong past-tense action verb (present tense for a current role), one idea each, 12–24 words, no first person, no "responsible for". Keep the original meaning.
5. SUMMARY: 2–3 sentences, no first person, no buzzwords ("hard-working", "team player", "passionate"). For freshers write a focused objective naming the target role and 3–4 strongest skills or projects. Base it only on SOURCE facts.
6. LAYOUT: single column; every section that has content is kept. Drop outdated personal details (date of birth, marital status, parents' names, religion, "I hereby declare", photo).
7. If a JOB DESCRIPTION is given, mirror its terminology ONLY where the SOURCE already evidences the skill (e.g. say "REST API" if the SOURCE says "RESTful services"); lead with the most relevant experience and skills.
8. "changes": up to 12 of the most meaningful rewrites. "before" must be an EXACT excerpt copied from the SOURCE (max 30 words); "after" is the new text; "reason" is under 12 words. Skip trivial edits.`;

function optionsBlock({ polish = 'strong', placeholders = true, profile = 'experienced', role = '', jd = '' }) {
  const lines = [
    `OPTIONS: polish=${polish === 'light' ? 'LIGHT (keep the author\'s own wording wherever it is already clear; fix grammar, tense and structure only)' : 'STRONG (rewrite for impact)'}; placeholders=${placeholders && polish !== 'light' ? 'ALLOWED' : 'NOT ALLOWED'}; candidate profile=${profile}`,
  ];
  if (role) lines.push(`TARGET ROLE: ${clip(role, 120)}`);
  if (jd && jd.trim().length >= 40) lines.push(`JOB DESCRIPTION (tailor to this, truthfully):\n${clip(jd, 5000)}`);
  return lines.join('\n');
}

export function buildFromTextMessages({ text, issues = [], opts = {} }) {
  const fixes = issues.slice(0, 10).map((i, n) => `${n + 1}. [${i.section}] ${i.problem} → ${i.fix}`).join('\n');
  const user = [
    optionsBlock(opts),
    fixes ? `REVIEW FINDINGS TO APPLY WHERE THEY CAN BE FIXED TRUTHFULLY:\n${fixes}` : '',
    `SOURCE (the candidate's current resume):\n${clip(text, 12000)}`,
  ].filter(Boolean).join('\n\n');
  return [{ role: 'system', content: BUILD_SYSTEM }, { role: 'user', content: user }];
}

export function buildFromFormMessages({ sourceText, opts = {} }) {
  const user = [optionsBlock(opts), `SOURCE (details the candidate typed into a form):\n${clip(sourceText, 12000)}`].join('\n\n');
  return [{ role: 'system', content: BUILD_SYSTEM }, { role: 'user', content: user }];
}

/** Runs the build call; validates "before" quotes; returns { resume, changes, droppedChanges, truncated }. */
export async function generateResume({ messages, sourceText, model, ai = aiCall, toolId = 'resume-builder' }) {
  const { text: raw, finishReason } = await ai({ toolId, model, json: true, reasoning: 'low', maxTokens: 7000, temperature: 0.2, messages });
  const parsed = parseJsonLoose(raw);
  const resume = normalizeResume(parsed.resume || parsed);
  const idx = makeSourceIndex(sourceText);
  const rawChanges = Array.isArray(parsed.changes) ? parsed.changes : [];
  const { kept, dropped } = validateFindings(rawChanges.map((c) => ({ ...c, quote: c?.before })), idx, { allowEmpty: false });
  const changes = kept.map((c) => ({ section: S(c.section), before: S(c.before), after: S(c.after), reason: S(c.reason) })).filter((c) => c.after && c.after !== c.before).slice(0, 12);
  if (!resume.name && !resume.experience.length && !resume.education.length && !resume.projects.length) {
    throw new Error('The AI could not build a resume from that input. Please add more detail and try again.');
  }
  return { resume, changes, droppedChanges: dropped, truncated: finishReason === 'length' };
}

/* ───────── Import (paste / upload → wizard form) ───────── */
export const IMPORT_SYSTEM = `You convert resume or LinkedIn text into form fields. Reply with ONE valid JSON object only.
Copy facts exactly as written — never invent, summarise or "improve". Leave a field "" (or [] ) when the text does not contain it. Do not guess dates.
SCHEMA: {"name":"","email":"","phone":"","location":"","linkedin":"","github":"","summary":"","experience":[{"title":"","company":"","startDate":"","endDate":"","current":false,"bullets":"one bullet per line, original wording"}],"education":[{"degree":"","field":"","institution":"","year":"","gpa":""}],"techSkills":"comma-separated","tools":"comma-separated","softSkills":"comma-separated","projects":[{"name":"","tech":"","description":""}],"certs":"one per line","languages":"comma-separated","achievements":"one per line","publications":"one per line"}
Put programming languages, frameworks and technical concepts in techSkills; software, platforms and cloud tools in tools. "current" is true only if the text says Present/Current.`;

export async function importToForm({ text, model, ai = aiCall }) {
  const { text: raw } = await ai({
    toolId: 'resume-import', model, json: true, reasoning: 'low', maxTokens: 5000, temperature: 0.1,
    messages: [{ role: 'system', content: IMPORT_SYSTEM }, { role: 'user', content: clip(text, 12000) }],
  });
  const p = parseJsonLoose(raw);
  const mk = (n) => Date.now() + n;
  const join = (v) => (Array.isArray(v) ? v.join(', ') : S(v));
  const lines = (v) => (Array.isArray(v) ? v.join('\n') : String(v || '').trim());
  return {
    name: S(p.name), email: S(p.email), phone: S(p.phone), location: S(p.location), linkedin: S(p.linkedin), github: S(p.github),
    summary: S(p.summary),
    experience: toArr(p.experience).filter((e) => e && typeof e === 'object').map((e, i) => ({
      id: mk(i), title: S(e.title), company: S(e.company), startDate: S(e.startDate), endDate: S(e.endDate), current: !!e.current,
      bullets: lines(e.bullets),
    })),
    education: toArr(p.education).filter((e) => e && typeof e === 'object').map((e, i) => ({
      id: mk(100 + i), degree: S(e.degree), field: S(e.field), institution: S(e.institution), year: S(e.year), gpa: S(e.gpa),
    })),
    techSkills: join(p.techSkills), tools: join(p.tools), softSkills: join(p.softSkills),
    projects: toArr(p.projects).filter((e) => e && typeof e === 'object').map((e, i) => ({
      id: mk(200 + i), name: S(e.name), tech: S(e.tech), description: S(e.description),
    })),
    certs: lines(p.certs), languages: join(p.languages), achievements: lines(p.achievements), publications: lines(p.publications),
  };
}

/* ───────── Improve a single bullet / summary ───────── */
export async function improveText({ kind = 'bullet', text, context = '', role = '', jd = '', model, ai = aiCall }) {
  const rules = kind === 'summary'
    ? 'Rewrite as a 2–3 sentence professional summary. No first person, no buzzwords. Use only facts in the text and context.'
    : 'Rewrite as ONE resume bullet: strong action verb, 12–24 words, what you did + how + result. Keep every original number; add NO new numbers. If a metric is obviously missing you may end with a placeholder like [add number] or [add %].';
  const { text: raw } = await ai({
    toolId: 'resume-improve', model, json: true, reasoning: 'low', maxTokens: 1200, temperature: 0.3,
    messages: [
      { role: 'system', content: `You are a precise resume editor. Never invent facts, tools, employers or numbers. ${rules} Reply with JSON only: {"text":"…"}` },
      { role: 'user', content: [role && `Target role: ${clip(role, 100)}`, jd && jd.length > 40 && `Job description (use its terminology only if the facts support it):\n${clip(jd, 1500)}`, context && `Context:\n${clip(context, 600)}`, `Text to improve:\n${clip(text, 800)}`].filter(Boolean).join('\n\n') },
    ],
  });
  const out = S(parseJsonLoose(raw).text);
  if (!out) throw new Error('No suggestion came back. Please try again.');
  return out;
}

/* ───────── Form → source text (wizard) ───────── */
export function formToSourceText(d) {
  const L = [];
  L.push(`Name: ${d.name}`, `Email: ${d.email}`, `Phone: ${d.phone}`, `Location: ${d.location}`, `LinkedIn: ${d.linkedin}`, `GitHub/Portfolio: ${d.github}`);
  if (d.target) L.push(`Target role: ${d.target}`);
  if (d.summary) L.push('', 'SUMMARY', d.summary);
  const exp = (d.experience || []).filter((e) => e.title?.trim() || e.company?.trim() || e.bullets?.trim());
  if (exp.length) {
    L.push('', 'EXPERIENCE');
    exp.forEach((e) => L.push(`${e.title} at ${e.company} (${e.startDate} – ${e.current ? 'Present' : e.endDate})`, e.bullets || '', ''));
  }
  const edu = (d.education || []).filter((e) => (e.degree + e.institution + e.field).trim());
  if (edu.length) {
    L.push('', 'EDUCATION');
    edu.forEach((e) => L.push(`${e.degree}${e.field ? ` in ${e.field}` : ''}, ${e.institution}, ${e.year}${e.gpa ? `, ${e.gpa}` : ''}`));
  }
  if (d.techSkills || d.tools || d.softSkills) L.push('', 'SKILLS', `Technical: ${d.techSkills}`, `Tools: ${d.tools}`, `Soft skills: ${d.softSkills}`);
  const proj = (d.projects || []).filter((p) => p.name?.trim() || p.description?.trim());
  if (proj.length) { L.push('', 'PROJECTS'); proj.forEach((p) => L.push(`${p.name} (${p.tech}): ${p.description}`)); }
  if (d.certs) L.push('', 'CERTIFICATIONS', d.certs);
  if (d.publications) L.push('', 'PUBLICATIONS', d.publications);
  if (d.achievements) L.push('', 'ACHIEVEMENTS', d.achievements);
  if (d.languages) L.push('', 'LANGUAGES', d.languages);
  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Plain-text copy of the resume for pasting into job portals. */
export function resumeToPlainText(resume) {
  return resumeToText(resume)
    .replace(/^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|PUBLICATIONS|AWARDS|ACHIEVEMENTS|VOLUNTEER AND MENTORSHIP|LANGUAGES)$/gm, (m) => `\n${m}`)
    .replace(/\n{3,}/g, '\n\n').trim();
}

/* ───────── Wizard draft persistence ───────── */
export function saveDraft(key, value) {
  try { localStorage.setItem(key, JSON.stringify({ v: 2, at: Date.now(), value })); } catch { /* storage full / blocked */ }
}
export function loadDraft(key, maxAgeDays = 30) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || o.v !== 2 || Date.now() - o.at > maxAgeDays * 864e5) return null;
    return o.value;
  } catch { return null; }
}
export function clearDraft(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } }
