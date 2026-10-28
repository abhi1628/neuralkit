// src/lib/citationResolvers.js — turn user input into trustworthy bibliographic metadata
//
// Principles (these fix the "wrong output" failures of v1):
//  1. An identifier (DOI / arXiv / ISBN / URL) is looked up in a real database. If the lookup fails we SAY SO —
//     we never ask an AI to guess a paper from a bare ID or URL.
//  2. Detection is strict: arXiv IDs need the word "arXiv" (or an arxiv.org URL), ISBNs need a valid checksum,
//     so "pages 1234.5678" or a phone number can't trigger a lookup.
//  3. AI is only used to read metadata out of text the USER supplied, and every field it returns is checked
//     against that text. Anything not found in the text is dropped.
//  4. Verifier: a pasted bibliography is checked against CrossRef / Open Library / arXiv; mismatches are shown.

import { aiCall, parseJsonLoose, getClientId } from '../resumeCore';
import { cleanText, splitName } from './citationEngine';

export const CITE_META_ENDPOINT = '/api/cite-meta';

/* ═══════════════════════════════════════════════════════════════
   Detection
═══════════════════════════════════════════════════════════════ */
export function extractDoi(text) {
  const m = String(text || '').match(/\b10\.\d{4,9}\/[^\s"<>]+/i);
  if (!m) return null;
  let d = m[0].replace(/[.,;:)\]}'"”’]+$/g, '');
  try { d = decodeURIComponent(d); } catch { /* keep */ }
  return d;
}

const validArxivNew = (id) => { const m = /^(\d{2})(\d{2})\.\d{4,5}$/.exec(id); return !!m && +m[1] >= 7 && +m[2] >= 1 && +m[2] <= 12; };

export function extractArxiv(text) {
  const s = String(text || '');
  let m = s.match(/arxiv\.org\/(?:abs|pdf|html)\/(\d{4}\.\d{4,5})(?:v\d+)?/i) || s.match(/arxiv\s*:?\s*(\d{4}\.\d{4,5})(?:v\d+)?/i);
  if (m && validArxivNew(m[1])) return m[1];
  m = s.match(/arxiv\.org\/(?:abs|pdf)\/([a-z\-]+(?:\.[A-Z]{2})?\/\d{7})/i) || s.match(/arxiv\s*:\s*([a-z\-]+(?:\.[A-Z]{2})?\/\d{7})/i);
  if (m) return m[1];
  const bare = s.trim().match(/^(\d{4}\.\d{4,5})(?:v\d+)?$/);
  if (bare && validArxivNew(bare[1])) return bare[1];
  const doi = s.match(/10\.48550\/arxiv\.([\w.\/-]+)/i);
  return doi ? doi[1] : null;
}

export function isValidIsbn(raw) {
  const s = String(raw || '').replace(/[^0-9Xx]/g, '').toUpperCase();
  if (s.length === 10) {
    let sum = 0;
    for (let i = 0; i < 10; i++) { const c = s[i] === 'X' ? 10 : /\d/.test(s[i]) ? +s[i] : NaN; if (Number.isNaN(c) || (s[i] === 'X' && i !== 9)) return false; sum += c * (10 - i); }
    return sum % 11 === 0;
  }
  if (s.length === 13 && /^97[89]\d{10}$/.test(s)) {
    let sum = 0; for (let i = 0; i < 13; i++) sum += +s[i] * (i % 2 ? 3 : 1);
    return sum % 10 === 0;
  }
  return false;
}

export function extractIsbn(text) {
  const s = String(text || '');
  const kw = s.match(/ISBN(?:-1[03])?[:\s#]*([0-9][0-9\-\s]{8,16}[0-9Xx])/i);
  if (kw && isValidIsbn(kw[1])) return kw[1].replace(/[^0-9Xx]/g, '').toUpperCase();
  const pure = s.trim().replace(/[\s-]/g, '');
  if (/^(97[89]\d{10}|\d{9}[\dXx])$/.test(pure) && isValidIsbn(pure)) return pure.toUpperCase();
  return null;
}

export function extractUrl(text) {
  const m = String(text || '').match(/https?:\/\/[^\s<>"]+/i);
  return m ? m[0].replace(/[.,;:)\]}'"”’]+$/g, '') : null;
}

const NATURE_URL = /nature\.com\/articles\/([a-z0-9\-]+)/i;

/** @returns {{type:'doi'|'arxiv'|'isbn'|'url'|'text', value:string, pure:boolean}} */
export function detectSource(input) {
  const s = String(input || '').trim();
  const strip = (match) => s.replace(match, '').replace(/\b(doi|arxiv|isbn(-1[03])?|https?|abs|pdf|url|available at|retrieved from|from)\b[:\s]*/gi, '').replace(/[^A-Za-z]/g, '');
  const doi = extractDoi(s);
  if (doi) return { type: 'doi', value: doi, pure: strip(doi).length < 12 };
  const ax = extractArxiv(s);
  if (ax) return { type: 'arxiv', value: ax, pure: strip(ax).length < 12 };
  const isbn = extractIsbn(s);
  if (isbn) return { type: 'isbn', value: isbn, pure: s.replace(/[^A-Za-z]/g, '').replace(/isbn/gi, '').length < 12 };
  const url = extractUrl(s);
  if (url) {
    const nat = url.match(NATURE_URL);
    if (nat) return { type: 'doi', value: `10.1038/${nat[1]}`, pure: strip(url).length < 12, derived: true };
    return { type: 'url', value: url, pure: strip(url).length < 12 };
  }
  return { type: 'text', value: s, pure: false };
}

/* ═══════════════════════════════════════════════════════════════
   Network helper
═══════════════════════════════════════════════════════════════ */
async function fetchJson(url, { fetchFn = globalThis.fetch, timeoutMs = 12000, headers } = {}) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetchFn(url, { headers: { Accept: 'application/json', ...headers }, signal: ctrl?.signal });
    if (!res.ok) {
      const e = new Error(`HTTP ${res.status}`); e.status = res.status;
      try { e.body = await res.json(); } catch { /* not JSON */ }
      throw e;
    }
    return await res.json();
  } finally { if (t) clearTimeout(t); }
}

/* ═══════════════════════════════════════════════════════════════
   Parsers (pure)
═══════════════════════════════════════════════════════════════ */
const first = (v) => (Array.isArray(v) ? v[0] : v);

export function parseCrossref(msg) {
  if (!msg || typeof msg !== 'object') return null;
  const typeMap = {
    'journal-article': 'article-journal', 'proceedings-article': 'paper-conference', book: 'book', monograph: 'book', 'edited-book': 'book', 'reference-book': 'book',
    'book-chapter': 'chapter', 'reference-entry': 'chapter', 'book-section': 'chapter', 'posted-content': 'preprint', dissertation: 'thesis', report: 'report',
  };
  const type = typeMap[msg.type] || (first(msg['container-title']) ? 'article-journal' : 'report');
  let title = cleanText(first(msg.title) || '');
  const sub = cleanText(first(msg.subtitle) || '');
  if (title && sub && !title.toLowerCase().includes(sub.toLowerCase())) title = `${title.replace(/[:.]\s*$/, '')}: ${sub}`;
  const person = (a) => (a.family || a.given ? { given: cleanText(a.given || ''), family: cleanText(a.family || ''), suffix: cleanText(a.suffix || '') } : a.name ? { given: '', family: cleanText(a.name), suffix: '' } : null);
  const dp = (msg.issued?.['date-parts'] || msg['published-print']?.['date-parts'] || msg['published-online']?.['date-parts'] || msg.published?.['date-parts'] || [[]])[0] || [];
  const doi = cleanText(msg.DOI || '');
  const arx = /^10\.48550\/arxiv\.(.+)$/i.exec(doi);
  let container = cleanText(first(msg['container-title']) || '');
  if (type === 'preprint') container = cleanText(msg['group-title'] || msg.institution?.[0]?.name || (arx ? 'arXiv' : container)) || 'Preprint';
  return {
    type, title, containerTitle: container,
    shortContainerTitle: cleanText(first(msg['short-container-title']) || ''),
    authors: (msg.author || []).map(person).filter(Boolean),
    editors: (msg.editor || []).map(person).filter(Boolean),
    year: dp[0] ? String(dp[0]) : '', month: dp[1] ? String(dp[1]) : '', day: dp[2] ? String(dp[2]) : '',
    volume: cleanText(msg.volume || ''), issue: cleanText(msg.issue || ''),
    pages: cleanText(msg.page || ''), articleNumber: cleanText(msg['article-number'] || ''),
    publisher: cleanText(msg.publisher || ''), city: cleanText(msg['publisher-location'] || ''),
    edition: cleanText(msg['edition-number'] || ''), doi,
    isbn: cleanText(first(msg.ISBN) || ''), url: doi ? '' : cleanText(msg.URL || ''), arxivId: arx ? arx[1] : '',
  };
}

export function parseDatacite(attr) {
  if (!attr) return null;
  const general = attr.types?.resourceTypeGeneral || '';
  const type = /preprint/i.test(general) || /arxiv/i.test(attr.publisher || '') ? 'preprint' : /book/i.test(general) ? 'book' : /report/i.test(general) ? 'report' : /dissertation/i.test(general) ? 'thesis' : /journal/i.test(general) ? 'article-journal' : 'report';
  const doi = cleanText(attr.doi || '');
  const arx = /^10\.48550\/arxiv\.(.+)$/i.exec(doi);
  return {
    type, title: cleanText(attr.titles?.[0]?.title || ''), containerTitle: type === 'preprint' ? 'arXiv' : cleanText(attr.container?.title || ''),
    authors: (attr.creators || []).map((c) => (c.familyName || c.givenName ? { given: cleanText(c.givenName || ''), family: cleanText(c.familyName || ''), suffix: '' } : c.name ? splitName(c.name) : null)).filter(Boolean),
    year: attr.publicationYear ? String(attr.publicationYear) : '', publisher: type === 'preprint' ? '' : cleanText(attr.publisher || ''), doi, url: doi ? '' : cleanText(attr.url || ''), arxivId: arx ? arx[1] : '',
  };
}

export function parseArxivXml(xml, idHint = '') {
  const x = String(xml || '');
  const entry = (x.match(/<entry>([\s\S]*?)<\/entry>/) || [])[1];
  if (!entry || /<title>\s*Error/i.test(entry)) return null;
  const tag = (name, src = entry) => { const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`).exec(src); return m ? cleanText(m[1]) : ''; };
  const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) => splitName(cleanText(m[1])));
  const published = tag('published');
  const idUrl = tag('id');
  const idm = /arxiv\.org\/abs\/(.+?)(?:v\d+)?$/.exec(idUrl);
  const doiM = /<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/.exec(entry);
  const dt = /^(\d{4})-(\d{2})-(\d{2})/.exec(published) || [];
  const title = tag('title');
  if (!title) return null;
  return {
    type: 'preprint', title, containerTitle: 'arXiv', authors, year: dt[1] || '', month: dt[2] ? String(+dt[2]) : '', day: dt[3] ? String(+dt[3]) : '',
    arxivId: (idm ? idm[1] : idHint), doi: doiM ? cleanText(doiM[1]) : `10.48550/arXiv.${idm ? idm[1] : idHint}`, url: '',
  };
}

export function parseOpenLibraryData(d) {
  if (!d || !d.title) return null;
  const yearM = /\b(\d{4})\b/.exec(d.publish_date || '');
  return {
    type: 'book', title: cleanText(d.subtitle && !String(d.title).includes(d.subtitle) ? `${d.title}: ${d.subtitle}` : d.title),
    authors: (d.authors || []).map((a) => splitName(a.name)).filter((a) => a.family), year: yearM ? yearM[1] : '',
    publisher: cleanText(d.publishers?.[0]?.name || ''), city: cleanText(d.publish_places?.[0]?.name || ''),
    isbn: cleanText(d.identifiers?.isbn_13?.[0] || d.identifiers?.isbn_10?.[0] || ''), url: '',
  };
}

export function parseOpenLibrarySearchDoc(d) {
  if (!d || !d.title) return null;
  return { type: 'book', title: cleanText(d.title), authors: (d.author_name || []).map((n) => splitName(n)), year: d.first_publish_year ? String(d.first_publish_year) : '', publisher: cleanText(d.publisher?.[0] || ''), isbn: cleanText(d.isbn?.[0] || ''), city: '' };
}

export function parseGoogleBooks(item) {
  const v = item?.volumeInfo;
  if (!v?.title) return null;
  const ids = v.industryIdentifiers || [];
  const isbn = (ids.find((i) => i.type === 'ISBN_13') || ids.find((i) => i.type === 'ISBN_10') || {}).identifier || '';
  const yearM = /\b(\d{4})\b/.exec(v.publishedDate || '');
  return {
    type: 'book', title: cleanText(v.subtitle && !v.title.includes(v.subtitle) ? `${v.title}: ${v.subtitle}` : v.title),
    authors: (v.authors || []).map((a) => splitName(a)), year: yearM ? yearM[1] : '', publisher: cleanText(v.publisher || ''), isbn, city: '', url: '',
  };
}

/* ═══════════════════════════════════════════════════════════════
   Resolvers (each returns { meta, via } or throws a readable Error)
═══════════════════════════════════════════════════════════════ */
const E = (msg, extra = {}) => Object.assign(new Error(msg), extra);

export async function resolveDoi(doi, deps = {}) {
  const enc = encodeURIComponent(doi);
  let crossrefErr = null;
  try {
    const j = await fetchJson(`https://api.crossref.org/works/${enc}`, deps);
    const meta = parseCrossref(j.message);
    if (meta && meta.title) return { meta, via: 'CrossRef' };
  } catch (e) { crossrefErr = e; }
  try { // DataCite covers arXiv DOIs, Zenodo, figshare, etc.
    const j = await fetchJson(`https://api.datacite.org/dois/${enc}`, deps);
    const meta = parseDatacite(j?.data?.attributes);
    if (meta && meta.title) return { meta, via: 'DataCite' };
  } catch { /* fall through */ }
  if (crossrefErr?.status === 404) throw E(`No record found for DOI ${doi}. Check the DOI for typos.`, { notFound: true });
  throw E('Couldn’t reach the DOI databases right now. Try again in a moment.', { network: true });
}

async function callProxy(kind, q, deps = {}) {
  const url = `${CITE_META_ENDPOINT}?kind=${kind}&q=${encodeURIComponent(q)}`;
  try {
    const j = await fetchJson(url, { ...deps, timeoutMs: 15000, headers: { 'X-Client-Id': getClientId() } });
    if (j && j.ok && j.meta) return j.meta;
    throw E(j?.error || 'No metadata found.', { notFound: true });
  } catch (e) {
    if (e.notFound) throw e;
    if (e.status === 429) throw E('Too many lookups — please wait a moment and try again.', { rate: true });
    if (e.status === 502 && e.body?.error) throw E(e.body.error, { network: true }); // e.g. “The site took too long to answer.”
    throw E('The lookup service is unavailable right now.', { network: true });
  }
}

export async function resolveArxiv(id, deps = {}) {
  try { return { meta: await callProxy('arxiv', id, deps), via: 'arXiv' }; } catch (proxyErr) {
    if (proxyErr.notFound) throw E(`arXiv has no paper with the ID ${id}.`, { notFound: true });
    try { // direct (works only if arXiv allows the browser request)
      const res = await (deps.fetchFn || globalThis.fetch)(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`);
      if (res.ok) { const meta = parseArxivXml(await res.text(), id); if (meta) return { meta, via: 'arXiv' }; }
    } catch { /* ignore */ }
    // arXiv DOIs are registered with DataCite, which allows browser requests
    try { return await resolveDoi(`10.48550/arXiv.${id}`, deps); } catch { /* ignore */ }
    throw E(`Couldn’t fetch arXiv ${id} right now. Paste the title and authors instead, or try again.`, { network: true });
  }
}

export async function resolveIsbn(isbn, deps = {}) {
  try {
    const j = await fetchJson(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, deps);
    const meta = parseOpenLibraryData(j[`ISBN:${isbn}`]);
    if (meta) return { meta: { ...meta, isbn }, via: 'Open Library' };
  } catch { /* try Google Books */ }
  try {
    const j = await fetchJson(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`, deps);
    const meta = parseGoogleBooks(j.items?.[0]);
    if (meta) return { meta: { ...meta, isbn }, via: 'Google Books' };
  } catch { /* fall through */ }
  throw E(`No book found for ISBN ${isbn}. Check the number, or paste the title and author.`, { notFound: true });
}

export async function resolveUrl(url, deps = {}) {
  const meta = await callProxy('url', url, deps);
  return { meta: { ...meta, url: meta.url || url }, via: 'Page metadata' };
}

/* ═══════════════════════════════════════════════════════════════
   Text normalisation + matching
═══════════════════════════════════════════════════════════════ */
const STOP = new Set('the a an of and or in on for to with by from at as is are was were be this that these those its their into via vs using use based study analysis approach new'.split(' '));
export const norm = (s) => cleanText(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const sigTokens = (s) => norm(s).split(' ').filter((w) => w.length > 2 && !STOP.has(w));

function coverage(candidateTokens, textSet) {
  if (!candidateTokens.length) return 0;
  return candidateTokens.filter((t) => textSet.has(t)).length / candidateTokens.length;
}

/** How well does a looked-up record agree with the text the user wrote? */
export function matchRecordToText(meta, text) {
  const t = norm(text);
  const textSet = new Set(t.split(' '));
  const titleCov = coverage(sigTokens(meta.title || ''), textSet);
  const fams = (meta.authors || []).slice(0, 3).map((a) => norm(a.family || a.given)).filter(Boolean);
  const famHits = fams.filter((f) => f.split(' ').every((w) => textSet.has(w)) || t.includes(f));
  const firstAuthorOk = fams.length === 0 ? null : famHits.includes(fams[0]) || (fams.length > 1 && famHits.length >= 1);
  const years = [...String(text).matchAll(/\b(19|20)\d{2}\b/g)].map((m) => m[0]);
  const yearOk = !meta.year ? null : years.includes(meta.year);
  const yearClose = !meta.year || !years.length ? null : years.some((y) => Math.abs(+y - +meta.year) <= 1);
  const venueTokens = sigTokens(meta.containerTitle || '');
  const venueOk = venueTokens.length ? coverage(venueTokens, textSet) >= 0.5 : null;
  const authorFrac = fams.length ? famHits.length / fams.length : 0.5;
  const score = 0.6 * titleCov + 0.2 * authorFrac + 0.1 * (yearOk ? 1 : yearClose ? 0.5 : 0) + 0.1 * (venueOk === null ? 0.5 : venueOk ? 1 : 0);
  return { score, titleCov, firstAuthorOk, yearOk, yearClose, venueOk, claimedYears: [...new Set(years)] };
}

/* ═══════════════════════════════════════════════════════════════
   AI extraction (validated against the user's own text)
═══════════════════════════════════════════════════════════════ */
const EXTRACT_SCHEMA = '{"type":"article-journal|paper-conference|book|chapter|webpage|preprint|report|thesis","title":"","authors":["Given Family"],"editors":["Given Family"],"container":"journal / book / proceedings / site name","year":"","month":"","day":"","volume":"","issue":"","pages":"","publisher":"","city":"","edition":"","doi":"","url":"","isbn":"","arxiv":""}';

const EXTRACT_RULES = `RULES
1. Copy values EXACTLY as printed in the text. Never use your own knowledge to add, correct or complete anything.
2. If a field is not in the text, use "" (or [] for lists). Do not guess authors, years, journals or publishers.
3. Authors as "Given Family" in the order printed. Keep initials as printed.
4. "type": choose the best match from the list; use "webpage" only for web pages.`;

const EXTRACT_SYSTEM = `You read bibliographic details out of a reference the user pasted. Reply with ONE JSON object only.\n${EXTRACT_RULES}\nSCHEMA ${EXTRACT_SCHEMA}`;
const EXTRACT_BATCH_SYSTEM = `You read bibliographic details out of several numbered references the user pasted. Reply with ONE JSON object: {"items":[{"id":<the reference number>, ...schema fields}]} with exactly one item per reference.\n${EXTRACT_RULES}\nSCHEMA (per item, plus "id") ${EXTRACT_SCHEMA}`;

const toMeta = (o) => ({
  type: String(o?.type || ''), title: String(o?.title || ''), authors: (Array.isArray(o?.authors) ? o.authors : []).map((a) => (typeof a === 'string' ? splitName(a) : a)),
  editors: (Array.isArray(o?.editors) ? o.editors : []).map((a) => (typeof a === 'string' ? splitName(a) : a)),
  containerTitle: String(o?.container || o?.containerTitle || ''), year: String(o?.year || ''), month: String(o?.month || ''), day: String(o?.day || ''),
  volume: String(o?.volume || ''), issue: String(o?.issue || ''), pages: String(o?.pages || ''), publisher: String(o?.publisher || ''), city: String(o?.city || ''),
  edition: String(o?.edition || ''), doi: String(o?.doi || ''), url: String(o?.url || ''), isbn: String(o?.isbn || ''), arxivId: String(o?.arxiv || o?.arxivId || ''),
});

/** Keeps only fields that really appear in `text`. Returns { meta, dropped:[field names] }. */
export function validateExtracted(metaIn, text) {
  const t = norm(text);
  const tSet = new Set(t.split(' '));
  const rawText = String(text);
  const m = { ...metaIn };
  const dropped = [];
  const inText = (v, minCov = 0.7) => { const tok = sigTokens(v); return tok.length ? coverage(tok, tSet) >= minCov : t.includes(norm(v)); };
  const famInText = (a) => { const f = norm(a.family || a.given); return !!f && (f.split(' ').every((w) => tSet.has(w)) || t.includes(f)); };

  m.authors = (m.authors || []).filter((a) => { const ok = famInText(a); if (!ok) dropped.push(`author ${a.family || a.given}`); return ok; });
  m.editors = (m.editors || []).filter(famInText);
  if (m.title && !inText(m.title, 0.7)) { dropped.push('title'); m.title = ''; }
  if (m.containerTitle && !inText(m.containerTitle, 0.6)) { dropped.push('container'); m.containerTitle = ''; }
  if (m.publisher && !inText(m.publisher, 0.6)) { dropped.push('publisher'); m.publisher = ''; }
  if (m.city && !t.includes(norm(m.city))) m.city = '';
  if (m.year && !new RegExp(`\\b${String(m.year).replace(/\D/g, '')}\\b`).test(rawText)) { dropped.push('year'); m.year = ''; }
  ['volume', 'issue'].forEach((k) => { if (m[k] && !new RegExp(`(^|[^0-9])${String(m[k]).replace(/[^0-9A-Za-z]/g, '')}([^0-9]|$)`).test(rawText)) { dropped.push(k); m[k] = ''; } });
  if (m.pages) { const nums = String(m.pages).match(/\d+/g) || []; if (!nums.length || !nums.every((n) => rawText.includes(n))) { dropped.push('pages'); m.pages = ''; } }
  if (m.doi && !rawText.toLowerCase().includes(String(m.doi).toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, ''))) m.doi = '';
  if (m.url && !rawText.includes(m.url.replace(/\/$/, ''))) m.url = '';
  if (m.isbn && !rawText.replace(/[-\s]/g, '').includes(String(m.isbn).replace(/[-\s]/g, ''))) m.isbn = '';
  if (m.arxivId && !rawText.includes(m.arxivId)) m.arxivId = '';
  if (m.month && !/^\d+$/.test(m.month) && !new RegExp(String(m.month).slice(0, 3), 'i').test(rawText)) m.month = '';
  return { meta: m, dropped };
}

export async function extractFromText(text, { ai = aiCall, model } = {}) {
  const { text: raw } = await ai({
    toolId: 'citation-extract', model, json: true, reasoning: 'low', maxTokens: 3000, temperature: 0,
    messages: [{ role: 'system', content: EXTRACT_SYSTEM }, { role: 'user', content: String(text).slice(0, 2500) }],
  });
  return validateExtracted(toMeta(parseJsonLoose(raw)), text);
}

export async function extractBatch(texts, { ai = aiCall, model } = {}) {
  if (!texts.length) return [];
  const payload = texts.map((t, i) => `[${i + 1}] ${String(t).slice(0, 900)}`).join('\n\n');
  const { text: raw } = await ai({
    toolId: 'citation-extract', model, json: true, reasoning: 'low', maxTokens: 7000, temperature: 0,
    messages: [{ role: 'system', content: EXTRACT_BATCH_SYSTEM }, { role: 'user', content: payload }],
  });
  const parsed = parseJsonLoose(raw);
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  return texts.map((t, i) => {
    const found = items.find((x) => Number(x?.id) === i + 1);
    return found ? validateExtracted(toMeta(found), t) : null;
  });
}

/* ═══════════════════════════════════════════════════════════════
   Orchestrator: one reference
═══════════════════════════════════════════════════════════════ */
/**
 * @returns {{status:'resolved'|'extracted'|'failed', meta?:object, via?:string, label?:string, error?:string, dropped?:string[]}}
 */
export async function resolveReference(input, deps = {}) {
  const det = detectSource(input);
  const label = det.type === 'text' ? 'Pasted reference' : det.type === 'doi' ? `DOI ${det.value}` : det.type === 'arxiv' ? `arXiv ${det.value}` : det.type === 'isbn' ? `ISBN ${det.value}` : 'Web page';
  const lookup = async () => {
    if (det.type === 'doi') return resolveDoi(det.value, deps);
    if (det.type === 'arxiv') return resolveArxiv(det.value, deps);
    if (det.type === 'isbn') return resolveIsbn(det.value, deps);
    return resolveUrl(det.value, deps);
  };

  if (det.type !== 'text') {
    try {
      const r = await lookup();
      return { status: 'resolved', meta: r.meta, via: r.via, label };
    } catch (e) {
      // A bare identifier/URL can't be read by AI — say what happened instead of guessing.
      if (det.pure) return { status: 'failed', label, error: e.message, retryable: !!(e.network || e.rate) };
      // A full reference that merely CONTAINS an identifier: fall through and read the text itself
    }
  }

  try {
    const { meta, dropped } = await extractFromText(String(input), deps);
    if (!meta.title) return { status: 'failed', label, error: 'Couldn’t read a title from that text. Add the title and authors, or paste a DOI / URL.' };
    return { status: 'extracted', meta, via: 'Read from your text', label, dropped };
  } catch (e) {
    return { status: 'failed', label, error: e?.message || 'Could not read that reference.', retryable: true };
  }
}

/* ═══════════════════════════════════════════════════════════════
   Bibliography splitting
═══════════════════════════════════════════════════════════════ */
export function splitReferences(text) {
  const raw = String(text || '').replace(/\r/g, '').trim();
  if (!raw) return [];
  const lines = raw.split('\n');
  const nonEmpty = lines.filter((l) => l.trim()).length;
  const marker = /^\s*(\[\d+\]|\(\d+\)|\d{1,3}[.)]\s|[•▪●\-–*]\s)/;
  const markers = lines.filter((l) => marker.test(l)).length;
  let entries;
  if (markers >= 2 && markers >= Math.ceil(nonEmpty * 0.4)) {
    entries = []; let cur = '';
    for (const l of lines) {
      if (marker.test(l)) { if (cur.trim()) entries.push(cur); cur = l.replace(marker, ''); } else if (l.trim()) cur += ` ${l.trim()}`;
    }
    if (cur.trim()) entries.push(cur);
  } else if (/\n\s*\n/.test(raw)) {
    entries = raw.split(/\n\s*\n/).map((b) => b.replace(/\n/g, ' '));
  } else {
    entries = lines.filter((l) => l.trim());
  }
  return entries.map((e) => e.replace(/\s+/g, ' ').trim()).filter((e) => e.length >= 12);
}

/* ═══════════════════════════════════════════════════════════════
   Bibliography conversion (many references)
═══════════════════════════════════════════════════════════════ */
export async function resolveMany(entries, { deps = {}, ai = aiCall, model, onProgress, concurrency = 4 } = {}) {
  const results = new Array(entries.length).fill(null);
  const pendingText = [];
  let done = 0;
  const tick = () => { done++; onProgress?.(done, entries.length); };

  // 1) identifiers (and URLs) via real databases, a few at a time
  const jobs = entries.map((e, i) => ({ e, i, det: detectSource(e) }));
  let idx = 0;
  const worker = async () => {
    while (idx < jobs.length) {
      const job = jobs[idx++];
      if (job.det.type === 'text') { pendingText.push(job); continue; }
      const r = await resolveReference(job.e, { ...deps, ai, model });
      if (r.status === 'failed' && !job.det.pure) pendingText.push(job); // let the batch AI read it
      else { results[job.i] = r; tick(); }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));

  // 2) free text → batched AI extraction, validated against each entry's own text
  for (let s = 0; s < pendingText.length; s += 8) {
    const chunk = pendingText.slice(s, s + 8);
    let out;
    try { out = await extractBatch(chunk.map((j) => j.e), { ai, model }); } catch (e) { if (e?.kind === 'rate') throw e; out = chunk.map(() => null); }
    chunk.forEach((job, k) => {
      const o = out[k];
      results[job.i] = o && o.meta.title
        ? { status: 'extracted', meta: o.meta, via: 'Read from your text', label: 'Pasted reference', dropped: o.dropped }
        : { status: 'failed', label: 'Pasted reference', error: 'Couldn’t read this reference — check it for typos.', retryable: true };
      tick();
    });
  }
  return results;
}

/* ═══════════════════════════════════════════════════════════════
   Verifier — does this reference actually exist, and do its details match?
═══════════════════════════════════════════════════════════════ */
async function crossrefSearch(query, deps) {
  const url = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query.slice(0, 350))}&rows=4`;
  const j = await fetchJson(url, deps);
  return (j?.message?.items || []).map(parseCrossref).filter((m) => m && m.title);
}
async function openLibrarySearch(query, deps) {
  const j = await fetchJson(`https://openlibrary.org/search.json?q=${encodeURIComponent(query.slice(0, 200))}&limit=4`, deps);
  return (j?.docs || []).map(parseOpenLibrarySearchDoc).filter(Boolean);
}

function judge(meta, text) {
  const m = matchRecordToText(meta, text);
  const reasons = [];
  const shortTitle = sigTokens(meta.title || '').length <= 2; // "Deep learning" matches almost any text — demand the author too
  if (m.titleCov >= 0.8 && !(shortTitle && m.firstAuthorOk === false && m.yearOk !== true)) {
    if (m.firstAuthorOk === false) reasons.push(`The author in your reference isn’t listed on this record (record: ${(meta.authors || []).slice(0, 3).map((a) => a.family).join(', ') || 'unknown'}).`);
    if (m.yearOk === false) reasons.push(`Year differs — your reference says ${m.claimedYears.join(' / ') || 'a different year'}, the record says ${meta.year}.`);
    if (m.venueOk === false) reasons.push(`Journal/venue differs — the record is “${meta.containerTitle}”.`);
    if (!reasons.length) return { status: 'verified', score: m.score, reasons: [] };
    return { status: 'check', score: m.score, reasons };
  }
  // partial title overlap only counts when the author or the year also agrees
  if (m.titleCov >= 0.55 && (m.firstAuthorOk === true || m.yearOk === true)) return { status: 'check', score: m.score, reasons: ['Only part of the title matches this record — check the wording; it may be a different paper.'] };
  return { status: 'not_found', score: m.score, reasons: [] };
}

/**
 * @returns {{status:'verified'|'check'|'not_found'|'unverifiable'|'error', score:number, reasons:string[], found:object|null, via:string, error?:string}}
 */
export async function verifyReference(text, deps = {}) {
  const det = detectSource(text);
  try {
    if (det.type === 'doi' || det.type === 'arxiv' || det.type === 'isbn') {
      let r;
      try { r = det.type === 'doi' ? await resolveDoi(det.value, deps) : det.type === 'arxiv' ? await resolveArxiv(det.value, deps) : await resolveIsbn(det.value, deps); } catch (e) {
        if (e.notFound) return { status: 'not_found', score: 0, reasons: [`${det.type === 'doi' ? 'This DOI' : det.type === 'arxiv' ? 'This arXiv ID' : 'This ISBN'} doesn’t exist: ${e.message}`], found: null, via: '' };
        return { status: 'error', score: 0, reasons: [], found: null, via: '', error: e.message };
      }
      return { ...judge(r.meta, text), found: r.meta, via: r.via };
    }
    if (det.type === 'url' && det.pure) return { status: 'unverifiable', score: 0, reasons: ['Web pages can’t be checked against a bibliographic database. Open the link to confirm it works.'], found: null, via: '' };

    // no usable identifier → search by the reference text itself
    const body = det.type === 'url' ? text.replace(det.value, ' ') : text;
    let best = null;
    let netErr = null;
    const consider = (list, via) => list.forEach((meta) => { const j = judge(meta, text); if (!best || j.score > best.j.score) best = { j, meta, via }; });
    try { consider(await crossrefSearch(body, deps), 'CrossRef'); } catch (e) { netErr = e; }
    if (!best || best.j.status === 'not_found') { try { consider(await openLibrarySearch(body, deps), 'Open Library'); } catch (e) { netErr = netErr || e; } }
    if (!best) {
      return { status: 'error', score: 0, reasons: [], found: null, via: '', error: netErr?.status === 429 ? 'Too many lookups — wait a moment and retry.' : 'The reference databases could not be reached. Try again.' };
    }
    if (best.j.status === 'not_found') return { status: 'not_found', score: best.j.score, reasons: ['No matching paper or book was found in CrossRef or Open Library. This reference may be misspelled — or invented.'], found: null, via: '' };
    return { ...best.j, found: best.meta, via: best.via };
  } catch (e) {
    return { status: 'error', score: 0, reasons: [], found: null, via: '', error: e?.message || 'Lookup failed.' };
  }
}

export async function verifyMany(entries, { deps = {}, onProgress, concurrency = 3 } = {}) {
  const out = new Array(entries.length);
  let idx = 0, done = 0;
  const worker = async () => {
    while (idx < entries.length) {
      const i = idx++;
      out[i] = await verifyReference(entries[i], deps);
      onProgress?.(++done, entries.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, entries.length) }, worker));
  return out;
}
