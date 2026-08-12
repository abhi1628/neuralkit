// src/lib/citationEngine.js
//
// Deterministic citation-formatting engine.
//
// WHY THIS EXISTS:
// LLMs are unreliable at exact punctuation/ordering rules for citation styles
// (comma vs period placement, "et al." thresholds, author inversion, italics,
// hanging-indent conventions). This module turns any *normalized metadata*
// object into APA 7 / MLA 9 / IEEE / Chicago 17 (notes-bibliography) / BibTeX
// output using plain, testable JS — no AI involved in the formatting step.
// AI (or a metadata API) is only ever used to fill in the normalized object;
// see resolvers.js and the AI extraction path in CitationFormatter.jsx.
//
// Normalized metadata shape (all fields optional except `title`):
// {
//   type: 'article-journal' | 'paper-conference' | 'book' | 'chapter' |
//         'webpage' | 'preprint' | 'report' | 'thesis',
//   title: string,
//   containerTitle: string,   // journal / conference / book (for a chapter) / website name
//   authors: [{ given, family }],
//   editors: [{ given, family }],
//   year: string, month: string, day: string,
//   volume: string, issue: string, pages: string,
//   publisher: string, city: string, edition: string,
//   doi: string, isbn: string, url: string,
//   accessDate: string, // ISO date, required for webpages with no publish date
// }

// ───────────────────────── name helpers ─────────────────────────

/** Split a raw "Given Middle Family" string into { given, family }. */
export function splitName(full) {
  const s = (full || '').trim().replace(/\s+/g, ' ');
  if (!s) return { given: '', family: '' };
  if (s.includes(',')) {
    // Already "Family, Given"
    const [family, given = ''] = s.split(',').map((p) => p.trim());
    return { given, family };
  }
  const parts = s.split(' ');
  if (parts.length === 1) return { given: '', family: parts[0] };
  const family = parts[parts.length - 1];
  const given = parts.slice(0, -1).join(' ');
  return { given, family };
}

/** "Ashish" -> "A.", "Jean Paul" -> "J. P." */
function initials(given) {
  if (!given) return '';
  return given
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => (/^[A-Z]\.?$/i.test(w) ? `${w[0].toUpperCase()}.` : `${w[0].toUpperCase()}.`))
    .join(' ');
}

function isValidAuthor(a) {
  return a && (a.family || a.given);
}

function cleanAuthors(authors) {
  return (Array.isArray(authors) ? authors : []).filter(isValidAuthor);
}

// ───────────────────────── style: author lists ─────────────────────────

function authorsAPA(rawAuthors) {
  const a = cleanAuthors(rawAuthors);
  if (a.length === 0) return '';
  const one = (p) => `${p.family}${p.given ? `, ${initials(p.given)}` : ''}`;
  if (a.length === 1) return one(a[0]);
  if (a.length <= 20) {
    const list = a.map(one);
    return `${list.slice(0, -1).join(', ')}, & ${list[list.length - 1]}`;
  }
  // APA 7: first 19 authors, ellipsis, then final author
  const first19 = a.slice(0, 19).map(one).join(', ');
  const last = one(a[a.length - 1]);
  return `${first19}, ... ${last}`;
}

function authorsMLA(rawAuthors) {
  const a = cleanAuthors(rawAuthors);
  if (a.length === 0) return '';
  const inverted = (p) => `${p.family}${p.given ? `, ${p.given}` : ''}`;
  const natural = (p) => `${p.given ? `${p.given} ` : ''}${p.family}`;
  if (a.length === 1) return inverted(a[0]);
  if (a.length === 2) return `${inverted(a[0])}, and ${natural(a[1])}`;
  return `${inverted(a[0])}, et al.`;
}

function authorsIEEE(rawAuthors) {
  const a = cleanAuthors(rawAuthors);
  if (a.length === 0) return '';
  const one = (p) => `${initials(p.given)}${p.given ? ' ' : ''}${p.family}`;
  if (a.length === 1) return one(a[0]);
  if (a.length <= 6) {
    const list = a.map(one);
    return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
  }
  return `${one(a[0])} et al.`;
}

function authorsChicago(rawAuthors) {
  const a = cleanAuthors(rawAuthors);
  if (a.length === 0) return '';
  const inverted = (p) => `${p.family}${p.given ? `, ${p.given}` : ''}`;
  const natural = (p) => `${p.given ? `${p.given} ` : ''}${p.family}`;
  if (a.length === 1) return inverted(a[0]);
  if (a.length <= 3) {
    const list = a.map((p, i) => (i === 0 ? inverted(p) : natural(p)));
    return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
  }
  return `${inverted(a[0])} et al.`;
}

function authorsBibtex(rawAuthors) {
  const a = cleanAuthors(rawAuthors);
  return a.map((p) => `${p.family}${p.given ? `, ${p.given}` : ''}`).join(' and ');
}

// ───────────────────────── small utils ─────────────────────────

function stripHtml(html) {
  return (html || '').replace(/<\/?[^>]+>/g, '');
}

function em(text) {
  return text ? `<i>${text}</i>` : '';
}

function join(parts, sep = ' ') {
  return parts.filter((p) => p !== undefined && p !== null && String(p).trim() !== '').join(sep);
}

/** Ensure a string ends with exactly one period (avoids "et al.." etc.). */
function terminate(str) {
  const s = (str || '').trim();
  if (!s) return '';
  return /[.!?]$/.test(s) ? s : `${s}.`;
}

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function monthName(m) {
  const n = parseInt(m, 10);
  return MONTH_NAMES[n] || m || '';
}

/** en-dash for numeric ranges, e.g. pages */
function dashRange(pages) {
  if (!pages) return '';
  return String(pages).replace(/\s*-\s*/g, '\u2013');
}

function bibtexKey(meta) {
  const a = cleanAuthors(meta.authors);
  const lead = a[0]?.family?.replace(/[^a-zA-Z]/g, '') || (meta.title || 'ref').split(' ')[0].replace(/[^a-zA-Z]/g, '');
  const firstWord = (meta.title || '').split(/\s+/).find((w) => w.length > 3)?.replace(/[^a-zA-Z]/g, '') || '';
  return `${lead}${meta.year || ''}${firstWord}`.trim() || 'citation';
}

function bibtexEscape(s) {
  return (s || '').replace(/[{}]/g, '');
}

// ───────────────────────── entry-type dispatch ─────────────────────────

function isArticle(meta) {
  return meta.type === 'article-journal' || (!meta.type && meta.containerTitle && !meta.isbn);
}
function isPreprint(meta) {
  return meta.type === 'preprint';
}
function isConference(meta) {
  return meta.type === 'paper-conference';
}
function isBook(meta) {
  return meta.type === 'book' || (!!meta.isbn && meta.type !== 'chapter');
}
function isWebpage(meta) {
  return meta.type === 'webpage';
}
function isReport(meta) {
  return meta.type === 'report' || meta.type === 'thesis';
}

// ───────────────────────── APA 7 ─────────────────────────

function apaCite(meta) {
  const authors = authorsAPA(meta.authors);
  const yr = meta.year ? `(${meta.year}).` : '(n.d.).';
  const title = meta.title ? `${meta.title}${/[.?!]$/.test(meta.title) ? '' : '.'}` : '';

  if (isWebpage(meta)) {
    const site = meta.containerTitle && meta.containerTitle !== meta.title ? `${meta.containerTitle}.` : '';
    return join([authors, yr, em(title), site, meta.url]);
  }

  if (isBook(meta)) {
    const ed = meta.edition ? ` (${meta.edition} ed.).` : '';
    const pub = meta.publisher ? ` ${meta.publisher}.` : '';
    return join([authors, yr, `${em(title)}${ed}`, pub.trim()]);
  }

  if (isPreprint(meta)) {
    const src = meta.containerTitle || 'Preprint';
    return join([authors, yr, title, `${em(src)}.`, meta.url]);
  }

  if (isConference(meta)) {
    const venue = meta.containerTitle ? ` ${em(meta.containerTitle)}${meta.pages ? `, ${dashRange(meta.pages)}` : ''}.` : '';
    return join([authors, yr, title, venue.trim(), meta.doi ? `https://doi.org/${meta.doi}` : meta.url]);
  }

  if (isReport(meta)) {
    const pub = meta.publisher ? ` ${meta.publisher}.` : '';
    return join([authors, yr, em(title), pub.trim(), meta.url]);
  }

  // journal article (default)
  const vol = meta.volume ? `<i>${meta.volume}</i>${meta.issue ? `(${meta.issue})` : ''}` : '';
  const pages = meta.pages ? `${vol ? ', ' : ''}${dashRange(meta.pages)}` : '';
  const journalBit = meta.containerTitle ? `${em(meta.containerTitle)}${vol || pages ? ', ' : '.'}${vol}${pages}${vol || pages ? '.' : ''}` : '';
  const link = meta.doi ? `https://doi.org/${meta.doi}` : meta.url;
  return join([authors, yr, title, journalBit, link]);
}

// ───────────────────────── MLA 9 ─────────────────────────

function mlaCite(meta) {
  const authors = authorsMLA(meta.authors);
  const authorPart = terminate(authors);
  const title = meta.title || '';

  if (isWebpage(meta)) {
    const titled = `"${title}."`;
    const site = meta.containerTitle ? `${em(meta.containerTitle)},` : '';
    const date = meta.year ? `${[meta.day, monthName(meta.month), meta.year].filter(Boolean).join(' ')},` : '';
    const access = meta.accessDate ? `Accessed ${meta.accessDate}.` : '';
    return join([authorPart, titled, site, date, meta.url ? `${meta.url}.` : '', access]);
  }

  if (isBook(meta)) {
    const pub = join([meta.publisher, meta.year], ', ');
    return join([authorPart, `${em(title)}.`, pub ? `${pub}.` : '']);
  }

  if (isPreprint(meta)) {
    const src = meta.containerTitle || 'arXiv';
    return join([authorPart, `"${title}."`, `${em(src)},`, meta.year ? `${meta.year},` : '', meta.url ? `${meta.url}.` : '']);
  }

  if (isConference(meta)) {
    return join([
      authorPart,
      `"${title}."`,
      meta.containerTitle ? `${em(meta.containerTitle)},` : '',
      meta.year ? `${meta.year},` : '',
      meta.pages ? `pp. ${dashRange(meta.pages)}.` : '',
    ]);
  }

  // journal article
  const vol = meta.volume ? `vol. ${meta.volume},` : '';
  const iss = meta.issue ? `no. ${meta.issue},` : '';
  const yr = meta.year ? `${meta.year},` : '';
  const pages = meta.pages ? `pp. ${dashRange(meta.pages)}.` : '';
  return join([
    authorPart,
    `"${title}."`,
    meta.containerTitle ? `${em(meta.containerTitle)},` : '',
    join([vol, iss, yr, pages]),
  ]);
}

// ───────────────────────── IEEE ─────────────────────────

function ieeeCite(meta) {
  const authors = authorsIEEE(meta.authors);
  const title = meta.title ? `"${meta.title},"` : '';

  if (isWebpage(meta)) {
    const site = meta.containerTitle ? `${meta.containerTitle}.` : '';
    const access = meta.accessDate ? ` [Online]. Available: ${meta.url}. [Accessed: ${meta.accessDate}].` : (meta.url ? ` [Online]. Available: ${meta.url}` : '');
    return join([authors ? `${authors},` : '', title, site, access.trim()]);
  }

  if (isBook(meta)) {
    const ed = meta.edition ? `, ${meta.edition} ed.` : '';
    return join([
      authors ? `${authors},` : '',
      `${em(meta.title)}${ed}.`,
      meta.city ? `${meta.city}:` : '',
      meta.publisher ? `${meta.publisher},` : '',
      meta.year ? `${meta.year}.` : '',
    ]);
  }

  if (isPreprint(meta)) {
    return join([
      authors ? `${authors},` : '',
      title,
      `${em('arXiv preprint')} arXiv:${meta.arxivId || ''}${meta.year ? `, ${meta.year}` : ''}.`,
    ]);
  }

  if (isConference(meta)) {
    return join([
      authors ? `${authors},` : '',
      title,
      meta.containerTitle ? `in ${em(meta.containerTitle)},` : '',
      meta.year ? `${meta.year},` : '',
      meta.pages ? `pp. ${dashRange(meta.pages)}.` : '',
    ]);
  }

  // journal article
  const vol = meta.volume ? `vol. ${meta.volume},` : '';
  const iss = meta.issue ? `no. ${meta.issue},` : '';
  const pages = meta.pages ? `pp. ${dashRange(meta.pages)},` : '';
  const yr = meta.year ? `${meta.year}.` : '';
  return join([
    authors ? `${authors},` : '',
    title,
    meta.containerTitle ? `${em(meta.containerTitle)},` : '',
    join([vol, iss, pages, yr]),
  ]);
}

// ───────────────────────── Chicago 17 (notes-bibliography) ─────────────────────────

function chicagoCite(meta) {
  const authors = authorsChicago(meta.authors);
  const authorPart = terminate(authors);
  const title = meta.title || '';

  if (isWebpage(meta)) {
    const site = meta.containerTitle ? `${meta.containerTitle}.` : '';
    const date = meta.year ? `${[monthName(meta.month), meta.day, meta.year].filter(Boolean).join(' ')}.` : '';
    const access = !meta.year && meta.accessDate ? `Accessed ${meta.accessDate}.` : '';
    return join([authorPart, `"${title}."`, site, date, access, meta.url ? `${meta.url}.` : '']);
  }

  if (isBook(meta)) {
    const place = join([meta.city, meta.publisher], ': ');
    return join([authorPart, `${em(title)}.`, place ? `${place},` : '', meta.year ? `${meta.year}.` : '']);
  }

  if (isPreprint(meta)) {
    return join([authorPart, `"${title}."`, `${meta.containerTitle || 'arXiv'} preprint,`, meta.year ? `${meta.year}.` : '', meta.url ? `${meta.url}.` : '']);
  }

  if (isConference(meta)) {
    return join([
      authorPart,
      `"${title}."`,
      meta.containerTitle ? `Paper presented at ${meta.containerTitle},` : '',
      meta.year ? `${meta.year}.` : '',
    ]);
  }

  // journal article
  const vol = meta.volume ? `${meta.volume}` : '';
  const iss = meta.issue ? `, no. ${meta.issue}` : '';
  const yr = meta.year ? ` (${meta.year})` : '';
  const pages = meta.pages ? `: ${dashRange(meta.pages)}` : '';
  return join([
    authorPart,
    `"${title}."`,
    meta.containerTitle ? `${em(meta.containerTitle)} ${vol}${iss}${yr}${pages}.` : '',
    meta.doi ? `https://doi.org/${meta.doi}.` : '',
  ]);
}

// ───────────────────────── BibTeX ─────────────────────────

function bibtexCite(meta) {
  const key = bibtexKey(meta);
  let entryType = 'misc';
  if (isArticle(meta)) entryType = 'article';
  else if (isPreprint(meta)) entryType = meta.arxivId ? 'misc' : 'article';
  else if (isBook(meta)) entryType = 'book';
  else if (isConference(meta)) entryType = 'inproceedings';
  else if (isReport(meta)) entryType = meta.type === 'thesis' ? 'phdthesis' : 'techreport';

  const fields = [];
  const a = authorsBibtex(meta.authors);
  if (a) fields.push(['author', a]);
  if (meta.title) fields.push(['title', bibtexEscape(meta.title)]);
  if (isArticle(meta) && meta.containerTitle) fields.push(['journal', meta.containerTitle]);
  if ((isBook(meta) || isConference(meta)) && meta.containerTitle) fields.push(['booktitle', meta.containerTitle]);
  if (meta.volume) fields.push(['volume', meta.volume]);
  if (meta.issue) fields.push(['number', meta.issue]);
  if (meta.pages) fields.push(['pages', String(meta.pages).replace(/\s*-\s*/g, '--')]);
  if (meta.year) fields.push(['year', meta.year]);
  if (meta.publisher) fields.push(['publisher', meta.publisher]);
  if (meta.doi) fields.push(['doi', meta.doi]);
  if (meta.isbn) fields.push(['isbn', meta.isbn]);
  if (meta.url) fields.push(['url', meta.url]);
  if (meta.arxivId) fields.push(['eprint', meta.arxivId], ['archivePrefix', 'arXiv']);

  const body = fields.map(([k, v]) => `  ${k} = {${v}}`).join(',\n');
  return `@${entryType}{${key},\n${body}\n}`;
}

// ───────────────────────── deterministic gap notes ─────────────────────────

function computeNotes(meta) {
  const notes = [];
  if (!meta.title) notes.push('No title found — citations will be incomplete.');
  if (!meta.authors || cleanAuthors(meta.authors).length === 0) notes.push('No author information found.');
  if (!meta.year) notes.push('No publication year found — using "n.d." where required.');
  if (isArticle(meta) && !meta.containerTitle) notes.push('No journal/source name found.');
  if (isWebpage(meta) && !meta.accessDate) notes.push('No access date recorded for this webpage.');
  return notes;
}

// ───────────────────────── public API ─────────────────────────

/**
 * Build all citation styles + BibTeX from a normalized metadata object.
 * Returns { source, formats: { apa: {html,text}, mla, ieee, chicago }, bibtex, notes }
 */
export function buildCitations(meta, sourceLabel) {
  const safe = { ...meta, authors: cleanAuthors(meta.authors) };
  const builders = { apa: apaCite, mla: mlaCite, ieee: ieeeCite, chicago: chicagoCite };
  const formats = {};
  for (const [key, fn] of Object.entries(builders)) {
    let html = '';
    try {
      html = fn(safe) || '';
    } catch {
      html = '';
    }
    formats[key] = { html, text: stripHtml(html) };
  }
  let bibtex = '';
  try {
    bibtex = bibtexCite(safe);
  } catch {
    bibtex = '';
  }
  return {
    source: sourceLabel || 'Formatted Citation',
    formats,
    bibtex,
    notes: computeNotes(safe),
    metadata: safe,
  };
}
