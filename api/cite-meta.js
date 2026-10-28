// api/cite-meta.js — fetches citation metadata that browsers are not allowed to fetch themselves
//
//   GET /api/cite-meta?kind=url&q=<page url>      → reads citation_* / JSON-LD / Dublin Core / Open Graph tags
//   GET /api/cite-meta?kind=arxiv&q=<arXiv id>    → arXiv API (no browser CORS)
//
// Why it exists: most sites block cross-origin reads, so the old in-browser lookup failed silently and the AI
// then guessed. This endpoint reads the page on the server and returns structured metadata, or an honest error.
//
// SECURITY (this endpoint fetches user-supplied URLs):
//  • http/https only, ports 80/443 only, no credentials in the URL
//  • every address the connection actually uses is checked at connect time (DNS-rebinding safe)
//  • private / loopback / link-local / cloud-metadata ranges are refused (IPv4 and IPv6)
//  • redirects are followed manually (max 4) and re-validated at every hop
//  • 8 s timeout, 1.5 MB response cap, HTML/XML only, no cookies, no request body
//  • per-device and per-network rate limits

import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';

const ALLOWED_ORIGINS = ['https://zeroapi.in', 'https://www.zeroapi.in'];
if (process.env.NODE_ENV !== 'production') ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:3000');

const MAX_BYTES = 1.5 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 4;
const UA = 'Mozilla/5.0 (compatible; ZeroAPI-CitationBot/1.0; +https://zeroapi.in)';
const RATE_WINDOW_MS = 300000;
const RATE_PER_CLIENT = 40;
const RATE_PER_IP = 300;

/* ═══════════════════════════════════════════════════════════════
   Address safety
═══════════════════════════════════════════════════════════════ */
export function isBlockedAddress(addr) {
  if (!addr) return true;
  let a = String(addr).trim().toLowerCase();
  if (a.startsWith('::ffff:') && net.isIPv4(a.slice(7))) a = a.slice(7); // IPv4-mapped IPv6
  if (net.isIPv4(a)) {
    const [p, q] = a.split('.').map(Number);
    if (p === 0 || p === 10 || p === 127) return true;
    if (p === 169 && q === 254) return true;                 // link-local + cloud metadata
    if (p === 172 && q >= 16 && q <= 31) return true;
    if (p === 192 && q === 168) return true;
    if (p === 100 && q >= 64 && q <= 127) return true;       // carrier-grade NAT
    if (p === 192 && q === 0) return true;                   // 192.0.0.0/24, 192.0.2.0/24
    if (p === 198 && (q === 18 || q === 19)) return true;    // benchmarking
    if (p >= 224) return true;                               // multicast / reserved
    return false;
  }
  if (net.isIPv6(a)) {
    if (a === '::' || a === '::1') return true;
    if (/^f[cd]/.test(a)) return true;                       // fc00::/7 unique local
    if (/^fe[89ab]/.test(a)) return true;                    // fe80::/10 link-local
    if (/^ff/.test(a)) return true;                          // multicast
    if (/^64:ff9b:/.test(a)) return true;                    // NAT64
    if (/^2001:db8/.test(a)) return true;                    // documentation
    return false;
  }
  return true; // not an IP at all → refuse
}

const allowPrivate = () => process.env.NODE_ENV !== 'production' && process.env.CITE_META_ALLOW_PRIVATE === '1';

export function validateTarget(raw) {
  let u;
  try { u = new URL(String(raw)); } catch { return { ok: false, error: 'That is not a valid web address.' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false, error: 'Only http and https addresses can be read.' };
  if (u.username || u.password) return { ok: false, error: 'Addresses with a username or password are not allowed.' };
  const port = u.port ? Number(u.port) : (u.protocol === 'https:' ? 443 : 80);
  if (!allowPrivate() && port !== 80 && port !== 443) return { ok: false, error: 'Only standard web ports are allowed.' };
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!allowPrivate()) {
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.lan') || host.endsWith('.home.arpa')) return { ok: false, error: 'That address is not allowed.' };
    if (net.isIP(host) && isBlockedAddress(host)) return { ok: false, error: 'That address is not allowed.' };
  }
  return { ok: true, url: u };
}

/** DNS lookup that refuses private results at CONNECT time (so a hostname cannot switch to an internal IP). */
function safeLookup(hostname, options, cb) {
  const opts = typeof options === 'function' ? {} : options;
  const done = typeof options === 'function' ? options : cb;
  dns.lookup(hostname, { ...opts, all: true }, (err, addrs) => {
    if (err) return done(err);
    const list = Array.isArray(addrs) ? addrs : [{ address: addrs, family: 4 }];
    if (!allowPrivate() && list.some((x) => isBlockedAddress(x.address))) return done(Object.assign(new Error('blocked address'), { code: 'EBLOCKED' }));
    if (opts.all) return done(null, list);
    return done(null, list[0].address, list[0].family);
  });
}

function fetchOnce(urlObj) {
  return new Promise((resolve, reject) => {
    const lib = urlObj.protocol === 'https:' ? https : http;
    const req = lib.request({
      protocol: urlObj.protocol, hostname: urlObj.hostname.replace(/^\[|\]$/g, ''), port: urlObj.port || undefined, path: `${urlObj.pathname}${urlObj.search}`, method: 'GET',
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5', 'Accept-Encoding': 'identity', 'Accept-Language': 'en' },
      lookup: safeLookup, timeout: TIMEOUT_MS,
    }, (res) => {
      const status = res.statusCode || 0;
      if (status >= 300 && status < 400 && res.headers.location) { res.resume(); return resolve({ redirect: res.headers.location, status }); }
      const type = String(res.headers['content-type'] || '').toLowerCase();
      if (!/(text\/html|application\/xhtml|application\/xml|text\/xml|application\/atom)/.test(type)) { res.resume(); return resolve({ status, type, body: '', unsupported: true }); }
      const chunks = []; let size = 0;
      res.on('data', (c) => { size += c.length; if (size > MAX_BYTES) { chunks.push(c.slice(0, c.length - (size - MAX_BYTES))); res.destroy(); } else chunks.push(c); });
      const finish = () => resolve({ status, type, body: Buffer.concat(chunks).toString('utf8') });
      res.on('end', finish); res.on('close', finish); res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })));
    req.on('error', reject);
    req.end();
  });
}

export async function safeFetchText(startUrl) {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const v = validateTarget(current);
    if (!v.ok) throw Object.assign(new Error(v.error), { blocked: true });
    const r = await fetchOnce(v.url);
    if (r.redirect) { current = new URL(r.redirect, v.url).toString(); continue; }
    return { ...r, finalUrl: v.url.toString() };
  }
  throw Object.assign(new Error('Too many redirects.'), { blocked: true });
}

/* ═══════════════════════════════════════════════════════════════
   Parsing
═══════════════════════════════════════════════════════════════ */
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…' };
const decode = (s) => String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : ''; }
  return ENT[e.toLowerCase()] ?? m;
});
const clean = (s) => decode(String(s ?? '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

function metaTags(html) {
  const out = [];
  const re = /<meta\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = {};
    const are = /([a-zA-Z_:\-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let a;
    while ((a = are.exec(m[1]))) attrs[a[1].toLowerCase()] = a[3] ?? a[4] ?? a[5] ?? '';
    const key = (attrs.name || attrs.property || attrs.itemprop || '').toLowerCase();
    if (key && attrs.content !== undefined) out.push([key, clean(attrs.content)]);
  }
  return out;
}

function parseDate(s) {
  const t = String(s || '').trim();
  let m = /^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/.exec(t);
  if (m) return { year: m[1], month: String(+m[2]), day: String(+m[3]) };
  m = /^(\d{4})[\/\-.](\d{1,2})$/.exec(t);
  if (m) return { year: m[1], month: String(+m[2]), day: '' };
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  m = /(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})/.exec(t);
  if (m && months.indexOf(m[2].slice(0, 3).toLowerCase()) >= 0) return { year: m[3], month: String(months.indexOf(m[2].slice(0, 3).toLowerCase()) + 1), day: String(+m[1]) };
  m = /([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})/.exec(t);
  if (m && months.indexOf(m[1].slice(0, 3).toLowerCase()) >= 0) return { year: m[3], month: String(months.indexOf(m[1].slice(0, 3).toLowerCase()) + 1), day: String(+m[2]) };
  m = /([A-Za-z]{3,9})\s+(\d{4})/.exec(t);
  if (m && months.indexOf(m[1].slice(0, 3).toLowerCase()) >= 0) return { year: m[2], month: String(months.indexOf(m[1].slice(0, 3).toLowerCase()) + 1), day: '' };
  m = /\b(19|20)\d{2}\b/.exec(t);
  return m ? { year: m[0], month: '', day: '' } : { year: '', month: '', day: '' };
}

function personFromString(n) {
  const s = clean(n);
  if (!s) return null;
  if (s.includes(',')) { const [family, given = ''] = s.split(',').map((x) => x.trim()); return { family, given }; }
  const t = s.split(' ');
  return t.length === 1 ? { family: t[0], given: '' } : { given: t.slice(0, -1).join(' '), family: t[t.length - 1] };
}

function jsonLdObjects(html) {
  const out = [];
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const j = JSON.parse(m[1].trim());
      const stack = Array.isArray(j) ? [...j] : [j];
      while (stack.length) {
        const o = stack.shift();
        if (!o || typeof o !== 'object') continue;
        if (Array.isArray(o['@graph'])) stack.push(...o['@graph']);
        out.push(o);
      }
    } catch { /* ignore broken JSON-LD */ }
  }
  return out;
}

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const ldName = (v) => (typeof v === 'string' ? v : v?.name || '');

export function parseHtmlMeta(html, pageUrl) {
  const tags = metaTags(html);
  const all = (...keys) => tags.filter(([k]) => keys.includes(k)).map(([, v]) => v).filter(Boolean);
  const one = (...keys) => all(...keys)[0] || '';
  const ld = jsonLdObjects(html);
  const ldArticle = ld.find((o) => /Article|BlogPosting|Report|ScholarlyArticle|WebPage|Book|NewsArticle/i.test(asArray(o['@type']).join(' ')) && (o.headline || o.name));
  const htmlTitle = clean((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || '');

  const title = one('citation_title', 'dc.title', 'dcterms.title') || ldArticle?.headline || one('og:title', 'twitter:title') || ldArticle?.name || htmlTitle;
  let authors = all('citation_author', 'dc.creator', 'dcterms.creator').map(personFromString).filter(Boolean);
  if (!authors.length && ldArticle) authors = asArray(ldArticle.author).map((a) => ldName(a)).map(personFromString).filter(Boolean);
  if (!authors.length) authors = all('author', 'article:author', 'parsely-author', 'sailthru.author').filter((a) => !/^https?:/.test(a)).map(personFromString).filter(Boolean);
  const dateStr = one('citation_publication_date', 'citation_date', 'citation_online_date', 'dc.date', 'dcterms.date', 'article:published_time', 'og:published_time', 'date', 'pubdate', 'datepublished') || ldArticle?.datePublished || '';
  const d = parseDate(dateStr);
  const site = one('og:site_name', 'application-name', 'dc.publisher') || ldName(ldArticle?.publisher) || '';
  const journal = one('citation_journal_title', 'prism.publicationname');
  const conf = one('citation_conference_title', 'citation_conference');
  const inbook = one('citation_inbook_title');
  const isbn = one('citation_isbn');
  const doi = one('citation_doi', 'dc.identifier.doi', 'prism.doi').replace(/^doi:\s*/i, '') || (/^10\.\d{4,9}\//.test(one('dc.identifier')) ? one('dc.identifier') : '');
  const first = one('citation_firstpage'); const last = one('citation_lastpage');
  const arxivId = one('citation_arxiv_id');

  let type = 'webpage';
  if (journal) type = 'article-journal'; else if (conf) type = 'paper-conference'; else if (inbook) type = 'chapter';
  else if (one('citation_dissertation_institution')) type = 'thesis'; else if (one('citation_technical_report_institution')) type = 'report';
  else if (isbn && !/Article|Blog|News/i.test(asArray(ldArticle?.['@type']).join(' '))) type = 'book';

  // strip " | Site name" from the browser title when the site name is known
  let cleanTitle = clean(title);
  if (site && cleanTitle.toLowerCase().endsWith(site.toLowerCase())) cleanTitle = cleanTitle.slice(0, cleanTitle.length - site.length).replace(/[\s|\-–—:·•]+$/, '');
  return {
    type, title: cleanTitle, authors, year: d.year, month: d.month, day: d.day,
    containerTitle: journal || conf || inbook || site, publisher: one('citation_publisher') || (type === 'webpage' ? '' : site),
    volume: one('citation_volume'), issue: one('citation_issue'), pages: first ? (last ? `${first}-${last}` : first) : '',
    doi, isbn, arxivId, url: clean(one('og:url', 'citation_abstract_html_url') || pageUrl || ''),
  };
}

export function parseArxivXmlServer(xml, idHint = '') {
  const x = String(xml || '');
  const entry = (x.match(/<entry>([\s\S]*?)<\/entry>/) || [])[1];
  if (!entry || /<title>\s*Error/i.test(entry)) return null;
  const tag = (n) => { const m = new RegExp(`<${n}[^>]*>([\\s\\S]*?)<\\/${n}>`).exec(entry); return m ? clean(m[1]) : ''; };
  const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) => personFromString(m[1])).filter(Boolean);
  const idm = /arxiv\.org\/abs\/(.+?)(?:v\d+)?$/.exec(tag('id'));
  const dt = /^(\d{4})-(\d{2})-(\d{2})/.exec(tag('published')) || [];
  const title = tag('title');
  if (!title) return null;
  const doiM = /<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/.exec(entry);
  const id = idm ? idm[1] : idHint;
  return { type: 'preprint', title, containerTitle: 'arXiv', authors, year: dt[1] || '', month: dt[2] ? String(+dt[2]) : '', day: dt[3] ? String(+dt[3]) : '', arxivId: id, doi: doiM ? clean(doiM[1]) : `10.48550/arXiv.${id}`, url: '' };
}

/* ═══════════════════════════════════════════════════════════════
   Rate limiting (Upstash if configured, else per-instance memory)
═══════════════════════════════════════════════════════════════ */
async function hit(key, max) {
  const now = Date.now();
  const win = Math.floor(now / RATE_WINDOW_MS) * RATE_WINDOW_MS;
  const k = `cm:${key}:${win}`;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
      const n = await redis.incr(k);
      if (n === 1) await redis.expire(k, Math.ceil(RATE_WINDOW_MS / 1000));
      return { ok: n <= max, retryAfter: Math.ceil((win + RATE_WINDOW_MS - now) / 1000) };
    } catch { /* fall back to memory */ }
  }
  if (!global._citeRate) global._citeRate = new Map();
  const store = global._citeRate;
  if (store.size > 4000) for (const [kk, v] of store) if (now - v.win > 2 * RATE_WINDOW_MS) store.delete(kk);
  const e = store.get(k) || { win, n: 0 };
  e.n++; store.set(k, e);
  return { ok: e.n <= max, retryAfter: Math.ceil((win + RATE_WINDOW_MS - now) / 1000) };
}

const clientIp = (req) => req.headers['x-vercel-forwarded-for']?.split(',')[0]?.trim() || req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',').pop()?.trim() || req.socket?.remoteAddress || 'unknown';
const clientId = (req) => { const v = req.headers['x-client-id']; return typeof v === 'string' && /^[a-zA-Z0-9_-]{16,64}$/.test(v) ? v : null; };

/* ═══════════════════════════════════════════════════════════════
   Handler
═══════════════════════════════════════════════════════════════ */
export default async function handler(req, res) {
  const origin = req.headers.origin;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Id');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  let query = req.query;
  if (!query) { try { query = Object.fromEntries(new URL(req.url, 'http://x').searchParams); } catch { query = {}; } }
  const kind = String(query.kind || '');
  const q = String(query.q || '').trim().slice(0, 2000);
  if (!q || (kind !== 'url' && kind !== 'arxiv')) return res.status(400).json({ ok: false, error: 'Bad request' });

  const cid = clientId(req);
  const ip = clientIp(req);
  const a = await hit(cid ? `c:${cid}` : `ip:${ip}`, RATE_PER_CLIENT);
  const b = cid ? await hit(`ip:${ip}`, RATE_PER_IP) : { ok: true };
  if (!a.ok || !b.ok) return res.status(429).json({ ok: false, error: 'Too many lookups. Please wait a moment.', retryAfter: a.retryAfter });

  try {
    if (kind === 'arxiv') {
      if (!/^(\d{4}\.\d{4,5}|[a-z\-]+(\.[A-Z]{2})?\/\d{7})$/i.test(q)) return res.status(200).json({ ok: false, error: 'That is not a valid arXiv ID.' });
      const r = await safeFetchText(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(q)}`);
      const meta = parseArxivXmlServer(r.body, q);
      if (!meta) return res.status(200).json({ ok: false, error: `arXiv has no paper with the ID ${q}.` });
      res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
      return res.status(200).json({ ok: true, meta });
    }

    const v = validateTarget(q);
    if (!v.ok) return res.status(200).json({ ok: false, error: v.error });
    const r = await safeFetchText(v.url.toString());
    if (r.status >= 400) return res.status(200).json({ ok: false, error: `The site answered with an error (${r.status}).` });
    if (r.unsupported) return res.status(200).json({ ok: false, error: 'That address is not a web page (for example a PDF or image), so there is no page information to read.' });
    const meta = parseHtmlMeta(r.body, r.finalUrl);
    if (!meta.title) return res.status(200).json({ ok: false, error: 'No title could be found on that page.' });
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ ok: true, meta });
  } catch (e) {
    if (e?.blocked) return res.status(200).json({ ok: false, error: e.message });
    if (e?.code === 'EBLOCKED') return res.status(200).json({ ok: false, error: 'That address is not allowed.' });
    // upstream trouble (not "no such record"): 502 so the client keeps trying other routes instead of reporting "not found"
    const msg = e?.code === 'ETIMEDOUT' ? 'The site took too long to answer.' : e?.code === 'ENOTFOUND' ? 'That website could not be found.' : 'Could not reach that page.';
    return res.status(502).json({ ok: false, error: msg });
  }
}
