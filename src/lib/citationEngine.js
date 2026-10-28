// src/lib/citationEngine.js — deterministic citation formatting (no AI)
//
// v2 — what changed and why
//  • SAFE OUTPUT: every field is cleaned to plain text first (CrossRef titles contain <i>, MathML, entities);
//    html is produced by escaping and only then adding <i>…</i>. Nothing from a source can inject markup.
//  • Styles: APA 7, MLA 9, IEEE, Chicago 17 (notes-bibliography), Harvard (Cite Them Right), Vancouver; + BibTeX, RIS
//  • Types: journal article, conference paper, book, BOOK CHAPTER (was formatted as a journal!), webpage, preprint, report, thesis
//  • Case rules per style (APA/IEEE/Harvard/Vancouver = sentence case, MLA/Chicago = title case), with a note when applied
//  • Names: particles (van, de la, al…), suffixes (Jr.), hyphenated initials (J.-P.)
//  • In-text citations, bibliography ordering, unique BibTeX keys, LaTeX-safe BibTeX
//
// Normalized metadata (all optional except title):
// { type, title, containerTitle, shortContainerTitle, authors:[{given,family,suffix}], editors:[…],
//   year, month, day, volume, issue, pages, articleNumber, publisher, city, edition,
//   doi, isbn, url, accessDate, arxivId }

export const STYLE_KEYS = ['apa', 'mla', 'ieee', 'chicago', 'harvard', 'vancouver'];
export const STYLE_LABELS = { apa: 'APA 7th', mla: 'MLA 9th', ieee: 'IEEE', chicago: 'Chicago 17th', harvard: 'Harvard', vancouver: 'Vancouver' };
export const NUMBERED_STYLES = new Set(['ieee', 'vancouver']);

/* ═══════════════════════════════════════════════════════════════
   Safe text handling
═══════════════════════════════════════════════════════════════ */
const IS = '\uE000'; // italic start marker
const IE = '\uE001'; // italic end marker
const it = (s) => (s ? `${IS}${s}${IE}` : '');
const vis = (s) => String(s ?? '').replace(/[\uE000\uE001]/g, '');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”' };

/** Cleans any source string into plain text: removes tags (incl. MathML), decodes entities, collapses space. */
export function cleanText(s) {
  let t = String(s ?? '');
  t = t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  // up to 3 passes so double-encoded markup (&lt;img&gt;) is also removed
  for (let i = 0; i < 3; i++) {
    const before = t;
    t = t.replace(/<\/?[a-zA-Z][^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    t = t.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : ''; }
      return ENTITIES[e.toLowerCase()] ?? m;
    });
    if (t === before) break;
  }
  // anything that still looks like a tag after decoding is dropped
  t = t.replace(/<\/?[a-zA-Z][^>]*>/g, '');
  return t.replace(/[\uE000\uE001]/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/\s+/g, ' ').trim();
}

const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Turns a marker string into { html, text }. html is fully escaped. */
export function renderMarked(s) {
  const raw = String(s ?? '').replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
  return { html: escHtml(raw).replace(new RegExp(IS, 'g'), '<i>').replace(new RegExp(IE, 'g'), '</i>'), text: vis(raw) };
}

/* ═══════════════════════════════════════════════════════════════
   Names
═══════════════════════════════════════════════════════════════ */
const SOFT_PARTICLES = new Set(['van', 'von', 'der', 'de', 'del', 'della', 'di', 'da', 'dos', 'das', 'du', 'la', 'le', 'el', 'al', 'bin', 'ibn']);
const SUFFIX = /^(jr|sr|ii|iii|iv|2nd|3rd)\.?$/i;

export function splitName(full) {
  const s = cleanText(full);
  if (!s) return { given: '', family: '', suffix: '' };
  if (s.includes(',')) {
    const parts = s.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 2 && SUFFIX.test(parts[1])) return { ...splitNatural(parts[0]), suffix: parts[1] };
    const [family, given = '', suffix = ''] = parts;
    return { given, family, suffix: SUFFIX.test(suffix) ? suffix : '' };
  }
  return splitNatural(s);
}

function splitNatural(s) {
  const tokens = s.split(' ');
  let suffix = '';
  if (tokens.length > 1 && SUFFIX.test(tokens[tokens.length - 1])) suffix = tokens.pop();
  if (tokens.length === 1) return { given: '', family: tokens[0], suffix };
  let i = tokens.length - 1; // index where the family name starts
  while (i > 1) { // keep at least one given-name token
    const p = tokens[i - 1];
    if (SOFT_PARTICLES.has(p.toLowerCase())) i--; else break;
  }
  return { given: tokens.slice(0, i).join(' '), family: tokens.slice(i).join(' '), suffix };
}

/** "Jean-Paul" → "J.-P."  "Juan Carlos" → "J. C."  "JK" → "J. K." */
export function initials(given, { hyphen = true } = {}) {
  if (!given) return '';
  return given.split(/\s+/).filter(Boolean).map((w) => {
    if (/^(?:[A-Za-z]\.?){2,3}$/.test(w) && w === w.toUpperCase()) return w.replace(/\./g, '').split('').map((c) => `${c}.`).join(' ');
    const bits = w.split('-').filter(Boolean);
    const ini = bits.map((b) => `${b[0].toUpperCase()}.`);
    return hyphen ? ini.join('-') : ini.join(' ');
  }).join(' ');
}
const initialsNoDots = (given) => initials(given).replace(/\./g, '').replace(/-/g, '').replace(/\s+/g, '');
const givenFull = (g) => (/^[A-Za-z]$/.test(g) ? `${g}.` : g);

const normAuthor = (a) => {
  if (!a) return null;
  if (typeof a === 'string') return normAuthor(splitName(a));
  const family = cleanText(a.family || a.lastName || '');
  const given = cleanText(a.given || a.firstName || '');
  const suffix = cleanText(a.suffix || '');
  return family || given ? { family, given, suffix } : null;
};
const authorsOf = (list) => (Array.isArray(list) ? list : []).map(normAuthor).filter(Boolean);

/* ═══════════════════════════════════════════════════════════════
   Capitalisation
═══════════════════════════════════════════════════════════════ */
const SMALL = new Set('a an and as at but by for from in nor of on or per the to via vs with into onto over upon off up out'.split(' '));
const PROPER = new Set(`january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday
india indian china chinese japan japanese korea korean usa us uk america american europe european africa african asia asian australia australian canada canadian germany german french france russia russian brazil brazilian pakistan bangladesh nepal sri lanka
english hindi tamil telugu bengali urdu spanish arabic latin greek
python java javascript typescript linux unix windows android ios macos google microsoft amazon apple facebook meta twitter youtube wikipedia github nvidia intel ibm openai
bayesian gaussian markov fourier turing euclidean boolean newtonian lagrangian hamiltonian kalman monte carlo bernoulli poisson laplace
covid-19 sars-cov-2`.split(/\s+/));

const isAcronym = (w) => /^[A-Z0-9][A-Z0-9\-+&/.]{1,}$/.test(w.replace(/[^\w\-+&/.]/g, '')) && /[A-Z]{2,}|\d/.test(w);
const hasInnerCaps = (w) => /[a-z][A-Z]/.test(w) || /^[A-Z][a-z]+[A-Z]/.test(w);

function looksTitleCase(title) {
  const words = title.split(/\s+/).filter((w) => /^[A-Za-z]{4,}$/.test(w.replace(/[^A-Za-z]/g, '')) && !SMALL.has(w.toLowerCase()));
  if (words.length < 2) return false;
  return words.filter((w) => /^[A-Z]/.test(w)).length / words.length >= 0.6;
}

export function toSentenceCase(title) {
  const t = vis(title);
  if (!t || !looksTitleCase(t)) return title;
  let startOfClause = true;
  return t.split(/(\s+)/).map((tok) => {
    if (/^\s+$/.test(tok)) return tok;
    const core = tok.replace(/^[("'“‘\[]+|[)"'”’\],.;:!?]+$/g, '');
    let out = tok;
    const keep = isAcronym(core) || hasInnerCaps(core) || PROPER.has(core.toLowerCase().replace(/[.,;:]$/, '')) || (/^[A-Z]$/.test(core) && !startOfClause);
    if (startOfClause) out = tok.replace(/[A-Za-z]/, (c) => c.toUpperCase());
    else if (!keep) out = tok.replace(/[A-Za-z][A-Za-z'’\-]*/, (w) => (isAcronym(w) || hasInnerCaps(w) ? w : w.toLowerCase()));
    startOfClause = /[:?!]$/.test(tok) || /[—–]$/.test(tok);
    return out;
  }).join('');
}

export function toTitleCase(title) {
  const t = vis(title);
  if (!t) return title;
  const toks = t.split(/(\s+)/);
  const wordIdx = toks.map((x, k) => (/\S/.test(x) ? k : -1)).filter((k) => k >= 0);
  const lastIdx = wordIdx[wordIdx.length - 1];
  const already = looksTitleCase(t);
  let startOfClause = true;
  return toks.map((tok, i) => {
    if (/^\s+$/.test(tok)) return tok;
    const core = tok.replace(/^[("'“‘\[]+|[)"'”’\],.;:!?]+$/g, '');
    const lower = core.toLowerCase();
    let out = tok;
    if (isAcronym(core) || hasInnerCaps(core)) out = tok;
    else if (startOfClause || i === lastIdx) out = tok.replace(/[A-Za-z]/, (c) => c.toUpperCase());
    else if (SMALL.has(lower)) out = tok.replace(core, lower); // Of → of, And → and
    else if (!already) out = tok.replace(/[A-Za-z]/, (c) => c.toUpperCase());
    startOfClause = /[:?!]$/.test(tok) || /[—–]$/.test(tok);
    return out;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════
   Metadata normalisation
═══════════════════════════════════════════════════════════════ */
const MONTH_FULL = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_MLA = ['', 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
const MONTH_IEEE = ['', 'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
const MONTH_3 = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthNum(m) {
  const s = cleanText(m).toLowerCase();
  if (!s) return 0;
  if (/^\d{1,2}$/.test(s)) { const n = parseInt(s, 10); return n >= 1 && n <= 12 ? n : 0; }
  const i = MONTH_FULL.findIndex((x) => x && x.toLowerCase().startsWith(s.slice(0, 3)));
  return i > 0 ? i : 0;
}
const ordinal = (n) => { const v = n % 100; return `${n}${v >= 11 && v <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`; };
function editionLabel(e) {
  const s = cleanText(e);
  if (!s) return '';
  const m = s.match(/(\d+)/);
  if (m && Number(m[1]) > 1) return ordinal(Number(m[1]));
  if (/^(first|1st|1)$/i.test(s)) return '';
  return s.replace(/\s*(ed\.?|edition)$/i, '').trim();
}
const cleanPages = (p) => cleanText(p).replace(/^(pp?\.?\s*)/i, '').replace(/\s*[-–—]+\s*/g, '–');
const safeUrl = (u) => { const s = cleanText(u); return /^https?:\/\/[^\s<>"]+$/i.test(s) ? s : ''; };
const cleanDoi = (d) => cleanText(d).replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:\s*)/i, '').replace(/[.,;]+$/, '');
const cleanIsbn = (i) => cleanText(i).replace(/[^0-9Xx]/g, '');

const TYPES = new Set(['article-journal', 'paper-conference', 'book', 'chapter', 'webpage', 'preprint', 'report', 'thesis']);

export function cleanMeta(raw) {
  const m = raw || {};
  const yearM = cleanText(m.year).match(/\d{4}/);
  const meta = {
    type: TYPES.has(m.type) ? m.type : '',
    title: cleanText(m.title).replace(/[.\s]+$/, (x) => (/[?!]/.test(x) ? x : '')),
    containerTitle: cleanText(m.containerTitle),
    shortContainerTitle: cleanText(m.shortContainerTitle),
    authors: authorsOf(m.authors),
    editors: authorsOf(m.editors),
    year: yearM ? yearM[0] : '',
    month: monthNum(m.month) ? String(monthNum(m.month)) : '',
    day: /^\d{1,2}$/.test(cleanText(m.day)) ? String(parseInt(m.day, 10)) : '',
    volume: cleanText(m.volume),
    issue: cleanText(m.issue),
    pages: cleanPages(m.pages),
    articleNumber: cleanText(m.articleNumber),
    publisher: cleanText(m.publisher),
    city: cleanText(m.city),
    edition: editionLabel(m.edition),
    doi: cleanDoi(m.doi),
    isbn: cleanIsbn(m.isbn),
    url: safeUrl(m.url),
    accessDate: /^\d{4}-\d{2}-\d{2}$/.test(cleanText(m.accessDate)) ? cleanText(m.accessDate) : '',
    arxivId: cleanText(m.arxivId),
  };
  if (!meta.type) meta.type = meta.isbn ? 'book' : meta.arxivId ? 'preprint' : meta.containerTitle && (meta.volume || meta.pages || meta.doi) ? 'article-journal' : meta.url && !meta.containerTitle ? 'webpage' : meta.containerTitle ? 'article-journal' : 'webpage';
  if (meta.type === 'webpage' && !meta.accessDate) meta.accessDate = new Date().toISOString().slice(0, 10);
  return meta;
}

/* ═══════════════════════════════════════════════════════════════
   Small helpers
═══════════════════════════════════════════════════════════════ */
const join = (parts, sep = ' ') => parts.filter((p) => p !== undefined && p !== null && vis(p).trim() !== '').join(sep);
function term(s, p = '.') {
  const v = vis(s).trim();
  if (!v) return '';
  return /[.!?]["”’')\]]*$/.test(v) ? String(s).trim() : `${String(s).trim()}${p}`;
}
/** Quoted title with the punctuation inside the quotes. */
function qTitle(t, p) {
  if (!t) return '';
  if (/[?!]$/.test(t)) return `“${t}”`;
  return `“${t.replace(/\.$/, '')}${p}”`;
}
const sq = (t) => (t ? `‘${t.replace(/\.$/, '')}’` : '');

const doiUrl = (m) => (m.doi ? `https://doi.org/${m.doi}` : '');
const link = (m) => doiUrl(m) || m.url;
const noProto = (u) => String(u || '').replace(/^https?:\/\//i, '');
const dateLong = (iso) => { if (!iso) return ''; const [y, mo, d] = iso.split('-').map(Number); return `${MONTH_FULL[mo]} ${d}, ${y}`; };
const dateDMY = (iso, months) => { if (!iso) return ''; const [y, mo, d] = iso.split('-').map(Number); return `${d} ${months[mo]} ${y}`; };
const dateIEEE = (iso) => { if (!iso) return ''; const [y, mo, d] = iso.split('-').map(Number); return `${MONTH_IEEE[mo]} ${d}, ${y}`; };

function pagesPart(m) {
  if (m.pages) return m.pages;
  if (m.articleNumber) return `Article ${m.articleNumber}`;
  return '';
}

/** 436–444 → 436–44 (MLA, Chicago, Vancouver abbreviate the end page when both numbers are long and the same length). */
function abbrevPages(p, sep = '–') {
  const m = /^(\d+)\s*[–-]\s*(\d+)$/.exec(p || '');
  if (!m || m[1].length !== m[2].length || +m[1] < 100) return (p || '').replace(/–/g, sep);
  let i = 0; while (i < m[1].length - 2 && m[1][i] === m[2][i]) i++;
  return `${m[1]}${sep}${m[2].slice(i)}`;
}

const lastNames = (authors) => authors.map((a) => a.family || a.given);

/* ═══════════════════════════════════════════════════════════════
   Author-list formatters
═══════════════════════════════════════════════════════════════ */
const suffixOf = (a) => (a.suffix ? `, ${a.suffix.replace(/\.?$/, '.').replace(/^(II|III|IV)\.$/i, '$1')}` : '');

function authorsAPA(auth) {
  if (!auth.length) return '';
  const one = (p) => `${p.family}${p.given ? `, ${initials(p.given)}` : ''}${suffixOf(p)}`;
  if (auth.length === 1) return one(auth[0]);
  if (auth.length <= 20) { const l = auth.map(one); return `${l.slice(0, -1).join(', ')}, & ${l[l.length - 1]}`; }
  return `${auth.slice(0, 19).map(one).join(', ')}, . . . ${one(auth[auth.length - 1])}`;
}
function authorsMLA(auth) {
  if (!auth.length) return '';
  const inv = (p) => `${p.family}${p.given ? `, ${givenFull(p.given)}` : ''}${suffixOf(p)}`;
  const nat = (p) => `${p.given ? `${givenFull(p.given)} ` : ''}${p.family}${suffixOf(p)}`;
  if (auth.length === 1) return inv(auth[0]);
  if (auth.length === 2) return `${inv(auth[0])}, and ${nat(auth[1])}`;
  return `${inv(auth[0])}, et al.`;
}
function authorsIEEE(auth) {
  if (!auth.length) return '';
  const one = (p) => `${p.given ? `${initials(p.given)} ` : ''}${p.family}${suffixOf(p)}`;
  if (auth.length === 1) return one(auth[0]);
  if (auth.length === 2) return `${one(auth[0])} and ${one(auth[1])}`;
  if (auth.length <= 6) { const l = auth.map(one); return `${l.slice(0, -1).join(', ')}, and ${l[l.length - 1]}`; }
  return `${one(auth[0])} ${it('et al.')}`;
}
function authorsChicago(auth) {
  if (!auth.length) return '';
  const inv = (p) => `${p.family}${p.given ? `, ${givenFull(p.given)}` : ''}${suffixOf(p)}`;
  const nat = (p) => `${p.given ? `${givenFull(p.given)} ` : ''}${p.family}${suffixOf(p)}`;
  let a = auth;
  let etal = false;
  if (auth.length > 10) { a = auth.slice(0, 7); etal = true; }
  if (a.length === 1) return etal ? `${inv(a[0])}, et al.` : inv(a[0]);
  const l = a.map((p, i) => (i === 0 ? inv(p) : nat(p)));
  if (etal) return `${l.join(', ')}, et al.`;
  if (a.length === 2) return `${l[0]}, and ${l[1]}`;
  return `${l.slice(0, -1).join(', ')}, and ${l[l.length - 1]}`;
}
function authorsHarvard(auth) {
  if (!auth.length) return '';
  const one = (p) => `${p.family}${p.given ? `, ${initials(p.given)}` : ''}`;
  if (auth.length === 1) return one(auth[0]);
  if (auth.length <= 3) { const l = auth.map(one); return `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}`; }
  return `${one(auth[0])} et al.`;
}
function authorsVancouver(auth) {
  if (!auth.length) return '';
  const one = (p) => `${p.family}${p.given ? ` ${initialsNoDots(p.given)}` : ''}`;
  if (auth.length <= 6) return auth.map(one).join(', ');
  return `${auth.slice(0, 6).map(one).join(', ')}, et al`;
}
const editorsNatural = (eds) => {
  const one = (p) => `${p.given ? `${initials(p.given)} ` : ''}${p.family}`;
  if (!eds.length) return '';
  if (eds.length === 1) return one(eds[0]);
  if (eds.length === 2) return `${one(eds[0])} & ${one(eds[1])}`;
  return `${eds.slice(0, -1).map(one).join(', ')}, & ${one(eds[eds.length - 1])}`;
};
const editorsFull = (eds) => {
  const one = (p) => `${p.given ? `${givenFull(p.given)} ` : ''}${p.family}`;
  if (!eds.length) return '';
  if (eds.length === 1) return one(eds[0]);
  if (eds.length === 2) return `${one(eds[0])} and ${one(eds[1])}`;
  return `${eds.slice(0, -1).map(one).join(', ')}, and ${one(eds[eds.length - 1])}`;
};

/* ═══════════════════════════════════════════════════════════════
   APA 7
═══════════════════════════════════════════════════════════════ */
function apaDate(m) {
  if (!m.year) return '(n.d.).';
  if (m.type === 'webpage' && m.month) return `(${m.year}, ${MONTH_FULL[+m.month]}${m.day ? ` ${m.day}` : ''}).`;
  return `(${m.year}).`;
}

function apaCite(m, S) {
  const A = authorsAPA(m.authors);
  const T = S.sentence(m.title);
  const date = apaDate(m);
  const lead = (titleItalic) => (A ? [A.endsWith('.') ? A : `${A}.`, date] : [titleItalic ? `${it(term(T))}` : term(T), date]);
  const rest = (titleItalic) => (A ? [titleItalic ? `${it(T)}` : term(T)] : []);
  const edT = (x) => (x ? ` (${x} ed.)` : '');

  switch (m.type) {
    case 'webpage': {
      const site = m.containerTitle && vis(m.containerTitle) !== vis(A.replace(/\.$/, '')) && m.containerTitle !== m.title ? `${m.containerTitle}.` : '';
      const retrieved = !m.year && m.accessDate ? `Retrieved ${dateLong(m.accessDate)}, from ${m.url}` : m.url;
      return join([...lead(true), ...(A ? [`${it(T)}.`] : []), site, retrieved]);
    }
    case 'book': return join([...lead(true), ...(A ? [`${it(T)}${edT(m.edition)}.`] : []), term(m.publisher), link(m)]);
    case 'chapter': {
      const eds = editorsNatural(m.editors);
      const inPart = `In ${eds ? `${eds} (${m.editors.length > 1 ? 'Eds.' : 'Ed.'}), ` : ''}${it(S.sentence(m.containerTitle))}${edT(m.edition)}${m.pages ? ` (${m.pages.includes('–') ? 'pp.' : 'p.'} ${m.pages})` : ''}.`;
      return join([...lead(false), ...rest(false), m.containerTitle ? inPart : '', term(m.publisher), link(m)]);
    }
    case 'paper-conference': {
      const inPart = m.containerTitle ? `In ${it(m.containerTitle)}${m.pages ? ` (${m.pages.includes('–') ? 'pp.' : 'p.'} ${m.pages})` : ''}.` : '';
      return join([...lead(false), ...rest(false), inPart, term(m.publisher), link(m)]);
    }
    case 'preprint': return join([...lead(true), ...(A ? [`${it(T)}.`] : []), `${m.containerTitle || 'arXiv'}.`, m.arxivId ? `https://arxiv.org/abs/${m.arxivId}` : link(m)]);
    case 'thesis': return join([...lead(true), ...(A ? [`${it(T)}`] : []), m.publisher ? `[Thesis, ${m.publisher}].` : '[Thesis].', link(m)]);
    case 'report': return join([...lead(true), ...(A ? [`${it(T)}.`] : []), term(m.publisher), link(m)]);
    default: { // journal article
      const vol = m.volume ? `${it(m.volume)}${m.issue ? `(${m.issue})` : ''}` : '';
      const loc = pagesPart(m);
      const src = m.containerTitle ? `${term(join([it(m.containerTitle), vol, loc], ', '))}` : '';
      return join([...lead(false), ...rest(false), src, link(m)]);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   MLA 9
═══════════════════════════════════════════════════════════════ */
function mlaDate(m) {
  if (!m.year) return '';
  if (m.type === 'webpage' || m.type === 'preprint') return join([m.day, m.month ? MONTH_MLA[+m.month] : '', m.year]);
  return m.month ? `${MONTH_MLA[+m.month]} ${m.year}` : m.year;
}
function mlaCite(m, S) {
  const A = term(authorsMLA(m.authors));
  const T = S.title(m.title);
  const date = mlaDate(m);
  const url = m.doi ? `https://doi.org/${m.doi}` : noProto(m.url);
  const edT = m.edition ? `${m.edition} ed.` : '';
  const pp = (p) => (p ? `${p.includes('–') ? 'pp.' : 'p.'} ${p}` : '');
  switch (m.type) {
    case 'webpage': {
      const access = m.accessDate && !m.year ? `Accessed ${dateDMY(m.accessDate, MONTH_MLA)}.` : '';
      return join([A, qTitle(T, '.'), m.containerTitle ? `${it(m.containerTitle)},` : '', date ? `${date},` : '', url ? `${url}.` : '', access]);
    }
    case 'book': return join([A, term(it(T)), term(join([edT, m.publisher, m.year], ', '))]);
    case 'chapter': {
      const eds = m.editors.length ? `edited by ${editorsFull(m.editors)}` : '';
      return join([A, qTitle(T, '.'), term(join([it(m.containerTitle), eds, edT, m.publisher, m.year, pp(m.pages)], ', ')), url ? `${url}.` : '']);
    }
    case 'paper-conference': return join([A, qTitle(T, '.'), term(join([it(m.containerTitle), m.publisher, m.year, pp(m.pages)], ', ')), url ? `${url}.` : '']);
    case 'preprint': return join([A, qTitle(T, '.'), term(join([it(m.containerTitle || 'arXiv'), date, m.arxivId ? `arxiv.org/abs/${m.arxivId}` : url], ', '))]);
    case 'thesis': case 'report': return join([A, term(it(T)), term(join([m.type === 'thesis' ? 'Thesis' : '', m.publisher, m.year], ', ')), url ? `${url}.` : '']);
    default: {
      const vol = m.volume ? `vol. ${m.volume}` : '';
      const iss = m.issue ? `no. ${m.issue}` : '';
      const pg = m.pages ? `${m.pages.includes('–') ? 'pp.' : 'p.'} ${abbrevPages(m.pages)}` : m.articleNumber ? `article ${m.articleNumber}` : '';
      return join([A, qTitle(T, '.'), term(join([it(m.containerTitle), vol, iss, date, pg], ', ')), url ? `${url}.` : '']);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   IEEE
═══════════════════════════════════════════════════════════════ */
function ieeeMonthYear(m) { return m.year ? join([m.month ? MONTH_IEEE[+m.month] : '', m.year]) : ''; }
function ieeeCite(m, S) {
  const A = authorsIEEE(m.authors);
  const lead = A ? `${A},` : '';
  const T = S.sentence(m.title);
  const doi = m.doi ? `doi: ${m.doi}` : '';
  const pg = m.pages ? `${m.pages.includes('–') ? 'pp.' : 'p.'} ${m.pages}` : m.articleNumber ? `Art. no. ${m.articleNumber}` : '';
  const edT = m.edition ? `${m.edition} ed.` : '';
  switch (m.type) {
    case 'webpage': {
      const acc = m.accessDate ? ` (accessed ${dateIEEE(m.accessDate)})` : '';
      return join([A ? `${A}.` : '', qTitle(T, '.'), m.containerTitle ? `${m.containerTitle}.` : '', m.url ? `${m.url}${acc}.` : '']);
    }
    case 'book': {
      const place = join([m.city ? `${m.city}:` : '', m.publisher ? `${m.publisher},` : '', m.year ? `${m.year}.` : '']);
      return join([lead, term(`${it(S.titleCase(m.title))}${edT ? `, ${edT}` : ''}`), place]);
    }
    case 'chapter': {
      const eds = m.editors.length ? `${editorsNatural(m.editors).replace(/ & /g, ' and ')}, ${m.editors.length > 1 ? 'Eds.' : 'Ed.'}` : '';
      const inPart = m.containerTitle ? `in ${it(m.containerTitle)}${eds ? `, ${eds}` : ''}` : '';
      const hasPlace = !!(m.city || m.publisher);
      return join([lead, qTitle(T, ','), inPart ? (hasPlace ? term(inPart) : `${inPart},`) : '', join([m.city ? `${m.city}:` : '', m.publisher ? `${m.publisher},` : ''], ' '), join([m.year ? `${m.year},` : '', pg ? `${pg}.` : ''], ' ').replace(/,$/, '.')]);
    }
    case 'paper-conference': {
      const body = join([lead, qTitle(T, ','), m.containerTitle ? `in ${it(m.containerTitle)},` : '', m.year ? `${m.year},` : '', pg ? `${pg},` : '', doi]);
      return `${body.replace(/[,.]\s*$/, '')}.`;
    }
    case 'preprint': return join([lead, qTitle(T, ','), m.year ? `${m.year},` : '', m.arxivId ? `arXiv:${m.arxivId}.` : m.url ? `${m.url}.` : '']);
    case 'thesis': case 'report': return join([lead, qTitle(T, ','), m.publisher ? `${m.publisher},` : '', m.city ? `${m.city},` : '', m.type === 'thesis' ? 'Thesis,' : 'Rep.,', `${m.year || 'n.d.'}.`]);
    default: {
      const jour = m.shortContainerTitle || m.containerTitle;
      const tail = join([m.volume ? `vol. ${m.volume},` : '', m.issue ? `no. ${m.issue},` : '', pg ? `${pg},` : '', ieeeMonthYear(m) ? `${ieeeMonthYear(m)}${doi ? ',' : '.'}` : '', doi ? `${doi}.` : '']);
      return join([lead, qTitle(T, ','), jour ? `${it(jour)},` : '', tail]).replace(/,\s*$/, '.');
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Chicago 17 (notes-bibliography)
═══════════════════════════════════════════════════════════════ */
function chicagoCite(m, S) {
  const A = term(authorsChicago(m.authors));
  const T = S.title(m.title);
  const edT = m.edition ? `${m.edition} ed.` : '';
  const dateMDY = m.year ? join([m.month ? MONTH_FULL[+m.month] : '', m.day ? `${m.day},` : '', m.year]).replace(/(\d+),\s*(\d{4})$/, '$1, $2') : '';
  const url = m.doi ? `https://doi.org/${m.doi}` : m.url;
  const place = join([m.city ? `${m.city}:` : '', m.publisher ? m.publisher : ''], ' ').replace(/:$/, '');
  const pubYear = term(join([place, m.year], ', '));
  switch (m.type) {
    case 'webpage': {
      const access = !m.year && m.accessDate ? `Accessed ${dateLong(m.accessDate)}.` : '';
      return join([A, qTitle(T, '.'), m.containerTitle ? term(m.containerTitle) : '', dateMDY ? term(dateMDY) : '', access, url ? `${url}.` : '']);
    }
    case 'book': return join([A, term(it(T)), edT, pubYear, m.doi || m.url ? `${url}.` : '']);
    case 'chapter': {
      const eds = m.editors.length ? `edited by ${editorsFull(m.editors)}` : '';
      return join([A, qTitle(T, '.'), m.containerTitle ? `In ${it(m.containerTitle)}${eds ? `, ${eds}` : ''}${m.pages ? `, ${abbrevPages(m.pages)}` : ''}.` : '', pubYear, m.doi ? `${url}.` : '']);
    }
    case 'paper-conference': return join([A, qTitle(T, '.'), m.containerTitle ? `Paper presented at ${m.containerTitle}${m.year ? `, ${m.year}` : ''}.` : '', m.doi || m.url ? `${url}.` : '']);
    case 'preprint': return join([A, qTitle(T, '.'), `Preprint, ${m.containerTitle || 'arXiv'}${dateMDY ? `, ${dateMDY}` : ''}.`, m.arxivId ? `https://arxiv.org/abs/${m.arxivId}.` : url ? `${url}.` : '']);
    case 'thesis': return join([A, qTitle(T, '.'), term(join([m.publisher, m.year], ', ')), m.url ? `${m.url}.` : '']);
    case 'report': return join([A, term(it(T)), pubYear, m.url ? `${m.url}.` : '']);
    default: {
      const vol = m.volume ? ` ${m.volume}` : '';
      const iss = m.issue ? `, no. ${m.issue}` : '';
      const yr = m.year ? ` (${m.month ? `${MONTH_FULL[+m.month]} ` : ''}${m.year})` : '';
      const pg = m.pages ? `: ${abbrevPages(m.pages)}` : m.articleNumber ? `: ${m.articleNumber}` : '';
      return join([A, qTitle(T, '.'), m.containerTitle ? `${it(m.containerTitle)}${vol}${iss}${yr}${pg}.` : '', url ? `${url}.` : '']);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Harvard (Cite Them Right)
═══════════════════════════════════════════════════════════════ */
function harvardCite(m, S) {
  const A = authorsHarvard(m.authors);
  const y = m.year ? `(${m.year})` : '(no date)';
  const T = S.sentence(m.title);
  const edT = m.edition ? `${m.edition} edn.` : '';
  const pg = m.pages ? `${m.pages.includes('–') ? 'pp.' : 'p.'} ${m.pages}` : '';
  const place = join([m.city ? `${m.city}:` : '', m.publisher ? `${m.publisher}` : ''], ' ').replace(/:$/, '');
  const lead = A || '';
  const url = link(m);
  const noA = !A;
  const accessed = m.accessDate ? `(Accessed: ${dateDMY(m.accessDate, MONTH_FULL)}).` : '';
  switch (m.type) {
    case 'webpage':
      if (noA) return join([term(it(T)), y, url ? `Available at: ${url}` : '', accessed]);
      return join([lead, y, term(it(T)), url ? `Available at: ${url}` : '', accessed]);
    case 'book':
      if (noA) return join([term(it(T)), y, edT, term(place)]);
      return join([lead, y, term(it(T)), edT, term(place)]);
    case 'chapter': {
      const eds = m.editors.length ? `in ${editorsNatural(m.editors).replace(/ & /g, ' and ')} (${m.editors.length > 1 ? 'eds.' : 'ed.'}) ` : 'in ';
      return join([lead, y, `${sq(T)},`, `${eds}${it(m.containerTitle)}.`, term(join([place, pg], ', '))]);
    }
    case 'paper-conference': return join([lead, y, `${sq(T)},`, `${it(m.containerTitle)}${place || pg ? '.' : ''}`, term(join([place, pg], ', ')), m.doi ? `doi: ${m.doi}` : '']);
    case 'preprint': return join([lead, y, term(it(T)), `${m.containerTitle || 'arXiv'}.`, url ? `Available at: ${url}` : '', accessed]);
    case 'thesis': case 'report': return join([lead, y, term(it(T)), term(join([m.type === 'thesis' ? 'Thesis' : '', place], ', ')), url ? `Available at: ${url}.` : '']);
    default: {
      const vi = m.volume ? `${m.volume}${m.issue ? `(${m.issue})` : ''}` : '';
      const tail = join([it(m.containerTitle), vi, pg || (m.articleNumber ? `Article ${m.articleNumber}` : '')], ', ');
      return join([lead, y, `${sq(T)},`, term(tail), m.doi ? `doi: https://doi.org/${m.doi}.` : m.url ? `Available at: ${m.url}.` : '']);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Vancouver (NLM)
═══════════════════════════════════════════════════════════════ */
function vancouverCite(m, S) {
  const A = authorsVancouver(m.authors);
  const lead = A ? term(A) : '';
  const T = term(S.sentence(m.title));
  const edT = m.edition ? `${m.edition} ed.` : '';
  const place = join([m.city ? `${m.city}:` : '', m.publisher || ''], ' ').replace(/:$/, '');
  const pg = abbrevPages(m.pages || '', '-');
  const cited = m.accessDate ? ` [cited ${m.accessDate.slice(0, 4)} ${MONTH_3[+m.accessDate.slice(5, 7)]} ${+m.accessDate.slice(8, 10)}]` : '';
  switch (m.type) {
    case 'webpage': return join([lead, `${S.sentence(m.title)} [Internet].`, `${m.containerTitle ? `${m.containerTitle}; ` : ''}${m.year || ''}${cited}.`, m.url ? `Available from: ${m.url}` : '']);
    case 'book': return join([lead, T, edT, `${place ? `${place}; ` : ''}${m.year || ''}.`]);
    case 'chapter': { const eds = m.editors.length ? `In: ${m.editors.map((e) => `${e.family} ${initialsNoDots(e.given)}`.trim()).join(', ')}, editor${m.editors.length > 1 ? 's' : ''}. ` : 'In: '; return join([lead, T, `${eds}${m.containerTitle ? `${m.containerTitle}.` : ''}`, `${place ? `${place}; ` : ''}${m.year || ''}.${pg ? ` p. ${pg}.` : ''}`]); }
    case 'paper-conference': return join([lead, T, m.containerTitle ? `In: ${m.containerTitle}.` : '', `${place ? `${place}; ` : ''}${m.year || ''}.${pg ? ` p. ${pg}.` : ''}`]);
    case 'preprint': return join([lead, T, `${m.containerTitle || 'arXiv'} [Preprint].`, `${m.year || ''}${cited}.`, m.url || m.arxivId ? `Available from: ${m.url || `https://arxiv.org/abs/${m.arxivId}`}` : '']);
    case 'thesis': case 'report': return join([lead, T, `${place ? `${place}; ` : ''}${m.year || ''}.`, m.url ? `Available from: ${m.url}` : '']);
    default: {
      const jour = m.shortContainerTitle || m.containerTitle;
      const ym = join([m.year, m.month ? MONTH_3[+m.month] : ''], ' ');
      const vi = `${m.volume ? m.volume : ''}${m.issue ? `(${m.issue})` : ''}`;
      const loc = pg || (m.articleNumber ? `${m.articleNumber}` : '');
      return join([lead, T, term(`${jour || ''}`), `${ym}${vi || loc ? ';' : ''}${vi}${loc ? `:${loc}` : ''}.`, m.doi ? `doi:${m.doi}` : '']);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   In-text citations
═══════════════════════════════════════════════════════════════ */
function authorShort(m, joiner) {
  const f = lastNames(m.authors);
  if (!f.length) return '';
  if (f.length === 1) return f[0];
  if (f.length === 2) return `${f[0]} ${joiner} ${f[1]}`;
  return `${f[0]} et al.`;
}
export function inTextCitation(metaIn, style, index = 1) {
  const m = cleanMeta(metaIn);
  const year = m.year || 'n.d.';
  const shortTitle = (m.title || 'Untitled').split(/\s+/).slice(0, 4).join(' ');
  let s;
  switch (style) {
    case 'apa': { const a = authorShort(m, '&'); s = a ? `(${a}, ${year})` : `(${it(shortTitle)}, ${year})`; break; }
    case 'mla': { const a = authorShort(m, 'and'); s = a ? `(${a})` : `(“${shortTitle}”)`; break; }
    case 'chicago': { const a = authorShort(m, 'and'); s = a ? `(${a} ${year})` : `(${shortTitle} ${year})`; break; }
    case 'harvard': { const a = authorShort(m, 'and'); s = a ? `(${a}, ${year})` : `(${shortTitle}, ${year})`; break; }
    case 'ieee': s = `[${index}]`; break;
    case 'vancouver': s = `(${index})`; break;
    default: s = '';
  }
  return renderMarked(s);
}

/* ═══════════════════════════════════════════════════════════════
   BibTeX / RIS
═══════════════════════════════════════════════════════════════ */
function bibEscape(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\textbackslash{}').replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$').replace(/#/g, '\\#').replace(/_/g, '\\_')
    .replace(/~/g, '\\textasciitilde{}').replace(/\^/g, '\\textasciicircum{}').replace(/[{}]/g, '');
}
function bibProtect(s) { // keep acronyms and mixed-case words capitalised through BibTeX style files
  return String(s ?? '').split(/(\s+)/).map((tok) => {
    const m = /^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/.exec(tok);
    const core = m ? m[2] : tok;
    if (/[A-Z]{2,}/.test(core) || /[a-z][A-Z]/.test(core)) return `${bibEscape(m[1])}{${bibEscape(core)}}${bibEscape(m[3])}`;
    return bibEscape(tok);
  }).join('');
}
const bibAuthor = (p) => `${p.family}${p.suffix ? `, ${p.suffix.replace(/\.$/, '')}` : ''}${p.given ? `, ${p.given}` : ''}`;

function bibKeyBase(m) {
  const strip = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toLowerCase();
  const fam = strip(m.authors[0]?.family || m.title.split(' ')[0] || 'ref');
  const word = strip(m.title.split(/\s+/).find((w) => w.replace(/[^a-zA-Z]/g, '').length > 3 && !SMALL.has(w.toLowerCase())) || '');
  return `${fam}${m.year}${word}` || 'citation';
}

export function bibtexEntry(metaIn, key) {
  const m = cleanMeta(metaIn);
  const k = key || bibKeyBase(m);
  const type = { 'article-journal': 'article', 'paper-conference': 'inproceedings', book: 'book', chapter: 'incollection', preprint: 'misc', webpage: 'misc', report: 'techreport', thesis: 'phdthesis' }[m.type] || 'misc';
  const f = [];
  const add = (name, v, raw) => { if (v) f.push([name, raw ? v : bibEscape(v)]); };
  if (m.authors.length) f.push(['author', m.authors.map((a) => bibEscape(bibAuthor(a))).join(' and ')]);
  if (m.editors.length) f.push(['editor', m.editors.map((a) => bibEscape(bibAuthor(a))).join(' and ')]);
  f.push(['title', bibProtect(m.title)]);
  if (type === 'article') add('journal', m.containerTitle);
  if (type === 'inproceedings' || type === 'incollection') add('booktitle', m.containerTitle);
  if (type === 'misc' && m.type === 'webpage') add('howpublished', m.containerTitle);
  add('year', m.year, true);
  if (m.month) f.push(['month', MONTH_3[+m.month].toLowerCase()]);
  add('volume', m.volume); add('number', m.issue);
  if (m.pages) f.push(['pages', m.pages.replace(/–/g, '--')]);
  if (m.articleNumber && !m.pages) add('eid', m.articleNumber);
  add('edition', m.edition); add('publisher', m.publisher); add('address', m.city);
  if (m.type === 'thesis') add('school', m.publisher);
  if (m.type === 'report') add('institution', m.publisher);
  add('doi', m.doi, true); add('isbn', m.isbn, true); add('url', m.url, true);
  if (m.arxivId) { f.push(['eprint', m.arxivId], ['archivePrefix', 'arXiv']); }
  if (m.type === 'webpage' && m.accessDate) f.push(['urldate', m.accessDate]);
  return `@${type}{${k},\n${f.map(([n, v]) => `  ${n} = {${v}}`).join(',\n')}\n}`;
}

export function risEntry(metaIn) {
  const m = cleanMeta(metaIn);
  const ty = { 'article-journal': 'JOUR', 'paper-conference': 'CONF', book: 'BOOK', chapter: 'CHAP', preprint: 'UNPB', webpage: 'ELEC', report: 'RPRT', thesis: 'THES' }[m.type] || 'GEN';
  const L = [`TY  - ${ty}`];
  m.authors.forEach((a) => L.push(`AU  - ${a.family}${a.given ? `, ${a.given}` : ''}${a.suffix ? `, ${a.suffix}` : ''}`));
  m.editors.forEach((a) => L.push(`ED  - ${a.family}${a.given ? `, ${a.given}` : ''}`));
  L.push(`TI  - ${m.title}`);
  if (m.containerTitle) L.push(`T2  - ${m.containerTitle}`);
  if (m.year) L.push(`PY  - ${m.year}${m.month ? `/${String(m.month).padStart(2, '0')}` : ''}${m.day ? `/${String(m.day).padStart(2, '0')}` : ''}`);
  if (m.volume) L.push(`VL  - ${m.volume}`);
  if (m.issue) L.push(`IS  - ${m.issue}`);
  if (m.pages) { const [sp, ep] = m.pages.split('–'); L.push(`SP  - ${sp}`); if (ep) L.push(`EP  - ${ep}`); }
  if (m.publisher) L.push(`PB  - ${m.publisher}`);
  if (m.city) L.push(`CY  - ${m.city}`);
  if (m.edition) L.push(`ET  - ${m.edition}`);
  if (m.doi) L.push(`DO  - ${m.doi}`);
  if (m.isbn) L.push(`SN  - ${m.isbn}`);
  if (m.url) L.push(`UR  - ${m.url}`);
  if (m.arxivId) L.push(`AN  - arXiv:${m.arxivId}`);
  L.push('ER  - ');
  return L.join('\n');
}

/* ═══════════════════════════════════════════════════════════════
   Public API
═══════════════════════════════════════════════════════════════ */
const BUILDERS = { apa: apaCite, mla: mlaCite, ieee: ieeeCite, chicago: chicagoCite, harvard: harvardCite, vancouver: vancouverCite };
const SENTENCE_STYLES = new Set(['apa', 'ieee', 'harvard', 'vancouver']);

export function formatReference(metaIn, style, { adjustCase = true } = {}) {
  const m = cleanMeta(metaIn);
  const S = {
    sentence: (t) => (adjustCase && SENTENCE_STYLES.has(style) ? toSentenceCase(t) : t),
    title: (t) => (adjustCase && (style === 'mla' || style === 'chicago') ? toTitleCase(t) : t),
    titleCase: (t) => (adjustCase ? toTitleCase(t) : t),
  };
  let marked = '';
  try { marked = BUILDERS[style](m, S) || ''; } catch { marked = ''; }
  return { ...renderMarked(marked), meta: m };
}

function computeNotes(m, opts = {}) {
  const notes = [];
  if (!m.title) notes.push('No title found — citations will be incomplete.');
  if (!m.authors.length) notes.push('No author information found.');
  if (!m.year) notes.push('No publication year found — “n.d.” is used where required.');
  if (m.type === 'article-journal' && !m.containerTitle) notes.push('No journal name found.');
  if (m.type === 'webpage' && !m.authors.length) notes.push('No author found — the page title or site name leads the reference.');
  if (m.type === 'book' && !m.publisher) notes.push('No publisher found.');
  if (m.type === 'book' && !m.city) notes.push('No publisher city found — IEEE and Chicago book references usually include it.');
  if (m.type === 'chapter' && !m.editors.length) notes.push('No editors found for this chapter.');
  if (m.type === 'article-journal' && !m.doi && !m.url) notes.push('No DOI or URL found.');
  if (opts.adjustCase !== false && m.title) notes.push('Title capitalisation is adjusted to each style (sentence case for APA, IEEE, Harvard, Vancouver; title case for MLA, Chicago). Check proper nouns.');
  if (m.type === 'article-journal' && !m.shortContainerTitle) notes.push('IEEE and Vancouver prefer abbreviated journal names — the full name is used here.');
  return notes;
}

/**
 * Build every style + BibTeX + RIS from one metadata object.
 * Returns { source, formats:{style:{html,text,inText:{html,text}}}, bibtex, ris, notes, metadata }
 */
export function buildCitations(meta, sourceLabel, opts = {}) {
  const m = cleanMeta(meta);
  const formats = {};
  STYLE_KEYS.forEach((s) => {
    const r = formatReference(m, s, opts);
    formats[s] = { html: r.html, text: r.text, inText: inTextCitation(m, s, 1) };
  });
  let bibtex = '', ris = '';
  try { bibtex = bibtexEntry(m); } catch { bibtex = ''; }
  try { ris = risEntry(m); } catch { ris = ''; }
  return { source: sourceLabel || 'Formatted citation', formats, bibtex, ris, notes: computeNotes(m, opts), metadata: m };
}

/* ───────── bibliography ───────── */
const sortKey = (m) => `${(m.authors[0]?.family || m.title || '').toLowerCase().replace(/^(the|a|an)\s+/, '')}|${m.year || '9999'}|${(m.title || '').toLowerCase()}`;

/** Formats a list of metadata objects as a bibliography in one style (alphabetical, or numbered for IEEE/Vancouver). */
export function buildBibliography(metas, style, opts = {}) {
  const items = metas.map((m, i) => ({ meta: cleanMeta(m), order: i }));
  const numbered = NUMBERED_STYLES.has(style);
  if (!numbered) items.sort((a, b) => (sortKey(a.meta) < sortKey(b.meta) ? -1 : sortKey(a.meta) > sortKey(b.meta) ? 1 : a.order - b.order));
  const entries = items.map((x, idx) => {
    const r = formatReference(x.meta, style, opts);
    const n = idx + 1;
    const label = style === 'ieee' ? `[${n}]` : style === 'vancouver' ? `${n}.` : '';
    return { n, label, html: r.html, text: r.text, meta: x.meta, source: x.order };
  });
  const text = entries.map((e) => `${e.label ? `${e.label} ` : ''}${e.text}`).join('\n\n');
  return { style, numbered, entries, text };
}

/** Unique BibTeX keys across a batch (adds b, c, d… when needed). */
export function bibtexAll(metas) {
  const seen = new Map();
  return metas.map((meta) => {
    const m = cleanMeta(meta);
    const base = bibKeyBase(m);
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    return bibtexEntry(m, n ? `${base}${String.fromCharCode(97 + n)}` : base);
  }).join('\n\n');
}
export const risAll = (metas) => metas.map((m) => risEntry(m)).join('\n\n');
