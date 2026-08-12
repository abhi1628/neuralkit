// src/lib/citationResolvers.js
//
// Detects what kind of reference the user pasted (DOI / arXiv / ISBN / plain
// URL / none of those) and resolves it to the normalized metadata shape used
// by citationEngine.js, via free no-key APIs. Every resolver is best-effort
// and returns null on failure so the caller can fall back to AI extraction.

import { splitName } from './citationEngine';

// ───────────────────────── detection ─────────────────────────

export function extractDoi(input) {
  // DOIs can legally contain many characters; trim common trailing
  // sentence/citation punctuation that isn't part of the identifier.
  const m = input.match(/\b(10\.\d{4,9}\/[^\s]+)/);
  if (!m) return null;
  return m[1].replace(/[.,;:)\]>]+$/, '');
}

export function extractArxiv(input) {
  const m = input.match(/(?:arxiv\.org\/(?:abs|pdf)\/)?(\d{4}\.\d{4,5})(?:v\d+)?\b|(?:arxiv:)\s*([a-z-]+\/\d{7})/i);
  if (!m) return null;
  return (m[1] || m[2] || '').trim();
}

export function extractIsbn(input) {
  // Matches ISBN-10 or ISBN-13, with or without an explicit "ISBN" label,
  // hyphens/spaces allowed, optional trailing check digit "X".
  const m = input.match(/\b(97[89][-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d|(?:\d[-\s]?){9}[\dXx])\b/);
  if (!m) return null;
  const digits = m[1].replace(/[-\s]/g, '');
  if (digits.length !== 10 && digits.length !== 13) return null;
  return digits;
}

export function extractUrl(input) {
  const m = input.match(/https?:\/\/[^\s]+/i);
  return m ? m[0].replace(/[.,;:)\]>]+$/, '') : null;
}

/** Returns { kind, value } for the highest-priority identifier found. */
export function detectSource(input) {
  const doi = extractDoi(input);
  if (doi) return { kind: 'doi', value: doi };
  const arxiv = extractArxiv(input);
  if (arxiv) return { kind: 'arxiv', value: arxiv };
  const isbn = extractIsbn(input);
  if (isbn) return { kind: 'isbn', value: isbn };
  const url = extractUrl(input);
  if (url) return { kind: 'url', value: url };
  return { kind: 'none', value: null };
}

// ───────────────────────── DOI via CrossRef ─────────────────────────

export async function resolveDoi(doi) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (!res.ok) return null;
    const { message: m } = await res.json();
    const authors = (m.author || [])
      .map((a) => ({ given: a.given || '', family: a.family || '' }))
      .filter((a) => a.family);
    const typeMap = {
      'journal-article': 'article-journal',
      'proceedings-article': 'paper-conference',
      book: 'book',
      'book-chapter': 'chapter',
      report: 'report',
      'posted-content': 'preprint',
    };
    const dateParts = m.published?.['date-parts']?.[0] || m.created?.['date-parts']?.[0] || [];
    return {
      type: typeMap[m.type] || 'article-journal',
      title: Array.isArray(m.title) ? m.title[0] : m.title || '',
      containerTitle: m['container-title']?.[0] || m.publisher || '',
      authors,
      year: dateParts[0] ? String(dateParts[0]) : '',
      month: dateParts[1] ? String(dateParts[1]) : '',
      volume: m.volume || '',
      issue: m.issue || '',
      pages: m.page || '',
      publisher: m.publisher || '',
      doi: m.DOI || doi,
      url: m.URL || `https://doi.org/${doi}`,
    };
  } catch {
    return null;
  }
}

// ───────────────────────── arXiv ─────────────────────────

export async function resolveArxiv(id) {
  try {
    const res = await fetch(`https://export.arxiv.org/api/query?search_query=id:${encodeURIComponent(id)}&max_results=1`);
    if (!res.ok) return null;
    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const entry = doc.querySelector('entry');
    if (!entry) return null;
    const title = (entry.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
    const authors = Array.from(entry.querySelectorAll('author name')).map((n) => splitName(n.textContent.trim()));
    const published = entry.querySelector('published')?.textContent?.trim() || '';
    const year = published ? published.slice(0, 4) : '';
    const month = published ? String(Number(published.slice(5, 7))) : '';
    const doiEl = entry.querySelector('[*|title="doi"], link[title="doi"]');
    return {
      type: 'preprint',
      arxivId: id,
      title,
      containerTitle: 'arXiv',
      authors,
      year,
      month,
      doi: doiEl?.getAttribute?.('href')?.replace('https://doi.org/', '') || '',
      url: `https://arxiv.org/abs/${id}`,
    };
  } catch {
    return null;
  }
}

// ───────────────────────── ISBN via Open Library ─────────────────────────

export async function resolveIsbn(isbn) {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const book = data[`ISBN:${isbn}`];
    if (!book) return null;
    const authors = (book.authors || []).map((a) => splitName(a.name));
    const publishers = (book.publishers || []).map((p) => p.name).join(', ');
    const year = (book.publish_date || '').match(/\d{4}/)?.[0] || '';
    return {
      type: 'book',
      title: book.title || '',
      authors,
      year,
      publisher: publishers,
      isbn,
      url: book.url || `https://openlibrary.org/isbn/${isbn}`,
    };
  } catch {
    return null;
  }
}

// ───────────────────────── generic webpage ─────────────────────────

/**
 * Best-effort webpage metadata via meta tags. Many sites block cross-origin
 * fetches from the browser, so this frequently returns null — callers should
 * fall back to AI extraction (which can reason from the URL/title text the
 * user pasted) when this fails.
 */
export async function resolveUrl(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const meta = (name) =>
      doc.querySelector(`meta[property="${name}"]`)?.getAttribute('content') ||
      doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ||
      '';
    const title = meta('og:title') || doc.querySelector('title')?.textContent?.trim() || '';
    if (!title) return null;
    const site = meta('og:site_name') || new URL(url).hostname.replace(/^www\./, '');
    const authorRaw = meta('article:author') || meta('author') || '';
    const published = meta('article:published_time') || meta('date') || '';
    const year = published ? published.slice(0, 4) : '';
    const month = published ? String(Number(published.slice(5, 7)) || '') : '';
    const day = published ? String(Number(published.slice(8, 10)) || '') : '';
    return {
      type: 'webpage',
      title,
      containerTitle: site,
      authors: authorRaw ? [splitName(authorRaw)] : [],
      year,
      month,
      day,
      url,
      accessDate: new Date().toISOString().slice(0, 10),
    };
  } catch {
    return null;
  }
}

export async function resolveByKind(kind, value) {
  if (kind === 'doi') return resolveDoi(value);
  if (kind === 'arxiv') return resolveArxiv(value);
  if (kind === 'isbn') return resolveIsbn(value);
  if (kind === 'url') return resolveUrl(value);
  return null;
}
