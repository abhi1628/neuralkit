// src/resumeExport.js
// ONE block model → every output (HTML preview/print, PDF, DOCX).
// Because every renderer consumes the same blocks, the preview can never hide content
// that the download contains (and vice-versa).
//
// PDF: jsPDF text API → real, selectable, ATS-readable text (no images).
// DOCX: hand-built WordprocessingML zipped with JSZip (no extra library to ship).

import { normalizeResume, sectionOrder, inferProfile, SECTION_TITLES } from './resumeCore';

/* ═══════════════════════════════════════════════════════════════
   Templates
═══════════════════════════════════════════════════════════════ */
export const TEMPLATES = {
  modern: {
    label: 'Modern', hint: 'Blue accents · clean sans-serif',
    font: 'helvetica', css: "'Helvetica Neue', Helvetica, Arial, sans-serif", docx: 'Arial',
    accent: [30, 90, 200], body: 9.5, lh: 1.38, nameSize: 22, nameAlign: 'center', headSize: 10.5, head: 'accent-rule',
    m: { l: 14, r: 14, t: 14, b: 13 }, secGap: 4.4, entryGap: 2.2, bulletGap: 0.5, bulletIndent: 4.2,
  },
  classic: {
    label: 'Classic', hint: 'Serif · traditional, recruiter-safe',
    font: 'times', css: "'Times New Roman', Times, serif", docx: 'Times New Roman',
    accent: [20, 20, 20], body: 10.5, lh: 1.3, nameSize: 22, nameAlign: 'center', headSize: 11, head: 'caps-rule',
    m: { l: 16, r: 16, t: 15, b: 14 }, secGap: 4.4, entryGap: 2.2, bulletGap: 0.4, bulletIndent: 4.2,
  },
  minimal: {
    label: 'Minimal', hint: 'Quiet · left-aligned, no colour',
    font: 'helvetica', css: "'Helvetica Neue', Helvetica, Arial, sans-serif", docx: 'Arial',
    accent: [55, 55, 55], body: 9.5, lh: 1.4, nameSize: 20, nameAlign: 'left', headSize: 9.5, head: 'caps-plain',
    m: { l: 16, r: 16, t: 15, b: 14 }, secGap: 4.6, entryGap: 2.4, bulletGap: 0.5, bulletIndent: 4.2,
  },
  campus: {
    label: 'Campus (1 page)', hint: 'Dense · auto-fits one page',
    font: 'helvetica', css: "'Helvetica Neue', Helvetica, Arial, sans-serif", docx: 'Arial',
    accent: [20, 70, 160], body: 9, lh: 1.3, nameSize: 20, nameAlign: 'left', headSize: 10, head: 'accent-rule', onePage: true,
    m: { l: 12, r: 12, t: 11, b: 10 }, secGap: 3.2, entryGap: 1.7, bulletGap: 0.3, bulletIndent: 3.8,
  },
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATES);
export const defaultTemplateFor = (profile) => (profile === 'fresher' ? 'campus' : profile === 'academic' ? 'classic' : 'modern');

const PT = 0.3528; // mm per point
const A4 = { w: 210, h: 297 };

/* ═══════════════════════════════════════════════════════════════
   Block model
═══════════════════════════════════════════════════════════════ */
function toUrl(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  if (/^mailto:|^https?:\/\//i.test(s)) return s;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return `mailto:${s}`;
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(s)) return `https://${s}`;
  return '';
}
const shortUrl = (v) => String(v || '').replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');

function gradeLabel(g) {
  const s = String(g || '').trim();
  if (!s) return '';
  if (/cgpa|gpa|percent|%|grade|score|marks/i.test(s)) return s;
  if (/\/\s*4(\.0+)?$/.test(s)) return `GPA: ${s}`;
  if (/^\d{2,3}(\.\d+)?$/.test(s) && Number(s) > 10) return `Score: ${s}%`;
  return `CGPA: ${s}`;
}

export function buildBlocks(resumeIn, orderIn) {
  const r = normalizeResume(resumeIn);
  const order = orderIn || sectionOrder(r, inferProfile(r));
  const B = [];
  B.push({ t: 'name', text: r.name || 'Your Name' });

  const c = r.contact;
  const parts = [
    c.email && { text: c.email, url: toUrl(c.email) },
    c.phone && { text: c.phone },
    c.location && { text: c.location },
    c.linkedin && { text: shortUrl(c.linkedin), url: toUrl(c.linkedin) },
    c.github && { text: shortUrl(c.github), url: toUrl(c.github) },
    c.website && { text: shortUrl(c.website), url: toUrl(c.website) },
  ].filter(Boolean);
  if (parts.length) B.push({ t: 'contact', parts });

  const section = (key, fn) => {
    const inner = [];
    fn(inner);
    if (inner.length) B.push({ t: 'section', title: SECTION_TITLES[key] }, ...inner);
  };
  const bullets = (list) => list.map((text) => ({ t: 'bullet', text }));

  const render = {
    summary: () => section('summary', (o) => { if (r.summary) o.push({ t: 'para', text: r.summary }); }),
    experience: () => section('experience', (o) => r.experience.forEach((e) => {
      o.push({ t: 'entry', left: [e.title, e.company].filter(Boolean).join(' — '), right: e.dates, sub: e.location });
      o.push(...bullets(e.bullets));
    })),
    education: () => section('education', (o) => r.education.forEach((e) => {
      o.push({ t: 'entry', left: [e.degree, e.institution].filter(Boolean).join(' — '), right: e.dates, sub: [e.location, gradeLabel(e.gpa)].filter(Boolean).join(' · ') });
      o.push(...bullets(e.details));
    })),
    skills: () => section('skills', (o) => {
      if (r.skills.technical.length) o.push({ t: 'kv', label: 'Technical', text: r.skills.technical.join(', ') });
      if (r.skills.tools.length) o.push({ t: 'kv', label: 'Tools', text: r.skills.tools.join(', ') });
      if (r.skills.soft.length) o.push({ t: 'kv', label: 'Soft skills', text: r.skills.soft.join(', ') });
    }),
    projects: () => section('projects', (o) => r.projects.forEach((p) => {
      o.push({ t: 'entry', left: p.name, right: shortUrl(p.link), rightUrl: toUrl(p.link), sub: p.tech ? `Tech: ${p.tech}` : '' });
      if (p.description) o.push({ t: 'bullet', text: p.description });
      o.push(...bullets(p.bullets));
    })),
    certifications: () => section('certifications', (o) => o.push(...bullets(r.certifications))),
    publications: () => section('publications', (o) => {
      const groups = [['Books', r.publications.books], ['Papers', r.publications.papers], ['Datasets', r.publications.datasets]].filter(([, l]) => l.length);
      groups.forEach(([label, list]) => {
        if (groups.length > 1) o.push({ t: 'subhead', text: label });
        o.push(...bullets(list));
      });
    }),
    awards: () => section('awards', (o) => o.push(...bullets(r.awards))),
    achievements: () => section('achievements', (o) => o.push(...bullets(r.achievements))),
    mentorship: () => section('mentorship', (o) => o.push(...bullets(r.mentorship))),
    languages: () => section('languages', (o) => { if (r.languages.length) o.push({ t: 'para', text: r.languages.join(' · ') }); }),
  };
  order.forEach((k) => render[k] && render[k]());
  return B;
}

/* ═══════════════════════════════════════════════════════════════
   Plain-text safety for jsPDF's built-in fonts (WinAnsi)
═══════════════════════════════════════════════════════════════ */
const CP1252_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
export function pdfSafe(input) {
  const s = String(input ?? '')
    .replace(/₹\s?/g, 'Rs. ').replace(/→/g, '->').replace(/←/g, '<-').replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/≈/g, '~')
    .replace(/[✓✔]/g, '').replace(/[\u2022\u25CF\u25AA]/g, '•').replace(/\u2212/g, '-').replace(/[\u2010\u2011\u2012]/g, '-')
    .replace(/[\u00A0\u2007\u202F]/g, ' ').replace(/\u200B|\u200C|\u200D|\uFEFF/g, '');
  let out = '';
  for (const ch of s) {
    const code = ch.codePointAt(0);
    if (code <= 0xFF || CP1252_EXTRA.includes(ch)) out += ch;
    else out += '';
  }
  return out;
}

/** True when the visible text contains characters standard PDF fonts cannot show (e.g. Devanagari). */
export function hasUnsupportedChars(resume) {
  const blocks = buildBlocks(resume);
  const text = blocks.map((b) => [b.text, b.left, b.right, b.sub, b.label, b.title, ...(b.parts || []).map((p) => p.text)].filter(Boolean).join(' ')).join(' ');
  const cleaned = pdfSafe(text).replace(/\s+/g, '');
  const original = text.replace(/₹/g, 'R').replace(/[→←≥≤≈✓✔]/g, '').replace(/[\u00A0\u2007\u202F\u200B\u200C\u200D\uFEFF]/g, '').replace(/\s+/g, '');
  return cleaned.length < original.length - 2;
}

/* ═══════════════════════════════════════════════════════════════
   HTML (preview + print)
═══════════════════════════════════════════════════════════════ */
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rgb = (a) => `rgb(${a[0]},${a[1]},${a[2]})`;

function hl(text, highlight) {
  let h = esc(text);
  if (!highlight) return h;
  if (highlight.placeholders) h = h.replace(/\[add [^\]]{1,28}\]/gi, (m) => `<mark class="rz-ph">${m}</mark>`);
  if (highlight.numbers && highlight.numbers.size) {
    h = h.replace(/(^|[^\w.])(\d[\d,]*(?:\.\d+)?%?)/g, (m, pre, num) => {
      const key = num.replace(/[,%]/g, '');
      return highlight.numbers.has(key) ? `${pre}<mark class="rz-un" title="Not found in what you provided — verify">${num}</mark>` : m;
    });
  }
  return h;
}

export function paperCss(templateKey) {
  const t = TEMPLATES[templateKey] || TEMPLATES.modern;
  const acc = rgb(t.accent);
  const headBase = `font-size:${t.headSize}pt;font-weight:700;margin:${t.secGap}mm 0 1.4mm;padding-bottom:0.6mm;`;
  const headStyle = {
    'accent-rule': `${headBase}color:${acc};text-transform:uppercase;border-bottom:0.25mm solid ${acc};`,
    'caps-rule': `${headBase}color:${acc};text-transform:uppercase;border-bottom:0.25mm solid ${acc};`,
    'caps-plain': `${headBase}color:${acc};text-transform:uppercase;border-bottom:0;`,
  }[t.head];
  return `
.rz-paper{width:${A4.w}mm;min-height:${A4.h}mm;box-sizing:border-box;padding:${t.m.t}mm ${t.m.r}mm ${t.m.b}mm ${t.m.l}mm;background:#fff;color:#222;font-family:${t.css};font-size:${t.body}pt;line-height:${t.lh};text-align:left;}
.rz-paper *{box-sizing:border-box;}
.rz-name{font-size:${t.nameSize}pt;font-weight:700;text-align:${t.nameAlign};color:${t.head === 'caps-rule' ? '#111' : acc};line-height:1.15;margin:0 0 1.2mm;}
.rz-contact{font-size:${(t.body - 0.5).toFixed(1)}pt;text-align:${t.nameAlign};color:#444;margin-bottom:1mm;}
.rz-contact a{color:inherit;text-decoration:none;}
.rz-sep{padding:0 1.6mm;color:#999;}
.rz-sec{${headStyle}}
.rz-entry{display:flex;justify-content:space-between;gap:4mm;margin-top:${t.entryGap}mm;font-weight:700;}
.rz-entry .rz-r{font-weight:400;white-space:nowrap;color:#444;}
.rz-sub{font-style:italic;color:#555;}
.rz-b{display:flex;margin-top:${t.bulletGap}mm;}
.rz-b i{font-style:normal;width:${t.bulletIndent}mm;flex:none;}
.rz-b span{flex:1;}
.rz-p{margin-top:0.8mm;}
.rz-kv{display:flex;margin-top:0.6mm;}
.rz-kv b{flex:none;padding-right:1.5mm;}
.rz-subh{font-weight:700;font-style:italic;margin-top:1.2mm;}
.rz-ph{background:#fde68a;color:#7c2d12;border-radius:2px;padding:0 1px;}
.rz-un{background:#fecaca;color:#7f1d1d;border-radius:2px;padding:0 1px;}
`;
}

export function blocksToHtml(blocks, { highlight } = {}) {
  const out = [];
  blocks.forEach((b) => {
    switch (b.t) {
      case 'name': out.push(`<div class="rz-name">${esc(b.text)}</div>`); break;
      case 'contact': out.push(`<div class="rz-contact">${b.parts.map((p) => (p.url ? `<a href="${esc(p.url)}">${esc(p.text)}</a>` : esc(p.text))).join('<span class="rz-sep">|</span>')}</div>`); break;
      case 'section': out.push(`<div class="rz-sec">${esc(b.title)}</div>`); break;
      case 'entry':
        out.push(`<div class="rz-entry"><span>${hl(b.left, highlight)}</span>${b.right ? `<span class="rz-r">${b.rightUrl ? `<a href="${esc(b.rightUrl)}" style="color:inherit;text-decoration:none">${esc(b.right)}</a>` : esc(b.right)}</span>` : ''}</div>`);
        if (b.sub) out.push(`<div class="rz-sub">${esc(b.sub)}</div>`);
        break;
      case 'bullet': out.push(`<div class="rz-b"><i>•</i><span>${hl(b.text, highlight)}</span></div>`); break;
      case 'para': out.push(`<div class="rz-p">${hl(b.text, highlight)}</div>`); break;
      case 'kv': out.push(`<div class="rz-kv"><b>${esc(b.label)}:</b><span>${esc(b.text)}</span></div>`); break;
      case 'subhead': out.push(`<div class="rz-subh">${esc(b.text)}</div>`); break;
      default: break;
    }
  });
  return out.join('');
}

/** Opens the browser's print dialog with a pixel-matched copy (full Unicode fallback → "Save as PDF"). */
export function printResume(resume, { template = 'modern', order } = {}) {
  const blocks = buildBlocks(resume, order);
  const t = TEMPLATES[template] || TEMPLATES.modern;
  const name = normalizeResume(resume).name || 'Resume';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(name)} — Resume</title><style>
@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}
${paperCss(template)}
.rz-paper{min-height:0}
</style></head><body><div class="rz-paper" data-t="${esc(t.label)}">${blocksToHtml(blocks)}</div></body></html>`;
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch { /* user cancelled */ }
    setTimeout(() => iframe.remove(), 60000);
  }, 350);
}

/* ═══════════════════════════════════════════════════════════════
   PDF (jsPDF)
═══════════════════════════════════════════════════════════════ */
function layoutPdf(doc, blocks, st, scale, draw, branding) {
  const W = A4.w - st.m.l - st.m.r;
  const bottom = A4.h - st.m.b - (branding ? 4 : 0);
  let y = st.m.t;
  let page = 1;
  const body = st.body * scale;
  const lh = (size) => size * st.lh * PT;
  const asc = (size) => size * PT * 0.8;

  const setFont = (style, size, color) => {
    doc.setFont(st.font, style);
    doc.setFontSize(size);
    const c = color || [34, 34, 34];
    doc.setTextColor(c[0], c[1], c[2]);
  };
  const newPage = () => { page++; y = st.m.t; if (draw) doc.addPage(); };
  const ensure = (h) => { if (y + h > bottom) newPage(); };
  const put = (text, x, size, opts = {}) => {
    if (draw) doc.text(pdfSafe(text), x, y + asc(size), opts);
  };
  const wrap = (text, width) => doc.splitTextToSize(pdfSafe(text), Math.max(10, width));

  let afterSection = false;

  blocks.forEach((b, i) => {
    switch (b.t) {
      case 'name': {
        const size = st.nameSize * scale;
        setFont('bold', size, st.head === 'caps-rule' ? [17, 17, 17] : st.accent);
        const lines = wrap(b.text, W);
        lines.forEach((ln) => {
          ensure(lh(size));
          const x = st.nameAlign === 'center' ? st.m.l + W / 2 : st.m.l;
          put(ln, x, size, { align: st.nameAlign === 'center' ? 'center' : 'left' });
          y += size * 1.15 * PT;
        });
        y += 1;
        break;
      }
      case 'contact': {
        const size = (st.body - 0.5) * scale;
        setFont('normal', size, [68, 68, 68]);
        const sep = '  |  ';
        const sepW = doc.getTextWidth(sep);
        const rows = [[]];
        let cur = 0;
        b.parts.forEach((p) => {
          const w = doc.getTextWidth(pdfSafe(p.text));
          if (rows[rows.length - 1].length && cur + sepW + w > W) { rows.push([]); cur = 0; }
          if (rows[rows.length - 1].length) cur += sepW;
          rows[rows.length - 1].push({ ...p, w });
          cur += w;
        });
        rows.forEach((row) => {
          ensure(lh(size));
          const total = row.reduce((n, p, k) => n + p.w + (k ? sepW : 0), 0);
          let x = st.nameAlign === 'center' ? st.m.l + (W - total) / 2 : st.m.l;
          row.forEach((p, k) => {
            if (k) { put(sep, x, size); x += sepW; }
            put(p.text, x, size);
            if (draw && p.url) doc.link(x, y, p.w, lh(size), { url: p.url });
            x += p.w;
          });
          y += lh(size);
        });
        y += 0.6;
        break;
      }
      case 'section': {
        const size = st.headSize * scale;
        const gap = st.secGap * scale;
        ensure(gap + lh(size) + lh(body) * 2);
        y += gap;
        setFont('bold', size, st.accent);
        const title = st.head === 'caps-plain' || st.head === 'caps-rule' || st.head === 'accent-rule' ? b.title.toUpperCase() : b.title;
        put(title, st.m.l, size);
        y += lh(size) * 0.92;
        if (st.head !== 'caps-plain') {
          if (draw) {
            doc.setDrawColor(st.accent[0], st.accent[1], st.accent[2]);
            doc.setLineWidth(0.22);
            doc.line(st.m.l, y, st.m.l + W, y);
          }
        }
        y += 1.2;
        afterSection = true;
        break;
      }
      case 'entry': {
        const size = body;
        if (!afterSection) y += st.entryGap * scale;
        afterSection = false;
        setFont('normal', size, [68, 68, 68]);
        const rText = b.right || '';
        const rW = rText ? doc.getTextWidth(pdfSafe(rText)) : 0;
        setFont('bold', size);
        const lines = wrap(b.left, W - rW - 4);
        ensure(lh(size) * Math.min(lines.length, 2) + (b.sub ? lh(size) : 0));
        lines.forEach((ln, k) => {
          ensure(lh(size));
          setFont('bold', size);
          put(ln, st.m.l, size);
          if (k === 0 && rText) {
            setFont('normal', size, [68, 68, 68]);
            put(rText, st.m.l + W - rW, size);
            if (draw && b.rightUrl) doc.link(st.m.l + W - rW, y, rW, lh(size), { url: b.rightUrl });
          }
          y += lh(size);
        });
        if (b.sub) {
          setFont('italic', size, [85, 85, 85]);
          wrap(b.sub, W).forEach((ln) => { ensure(lh(size)); put(ln, st.m.l, size); y += lh(size); });
        }
        break;
      }
      case 'bullet': {
        afterSection = false;
        const size = body;
        setFont('normal', size);
        const ind = st.bulletIndent;
        const lines = wrap(b.text, W - ind);
        const total = lines.length * lh(size);
        if (lines.length <= 3) ensure(total); // keep short bullets together
        lines.forEach((ln, k) => {
          ensure(lh(size));
          setFont('normal', size);
          if (k === 0) put('•', st.m.l + 0.6, size);
          put(ln, st.m.l + ind, size);
          y += lh(size);
        });
        y += st.bulletGap * scale;
        break;
      }
      case 'para': {
        afterSection = false;
        const size = body;
        setFont('normal', size);
        wrap(b.text, W).forEach((ln) => { ensure(lh(size)); put(ln, st.m.l, size); y += lh(size); });
        y += 0.5;
        break;
      }
      case 'kv': {
        afterSection = false;
        const size = body;
        setFont('bold', size);
        const label = `${b.label}: `;
        const lw = doc.getTextWidth(pdfSafe(label)) + 0.9;
        setFont('normal', size);
        const lines = wrap(b.text, W - lw);
        lines.forEach((ln, k) => {
          ensure(lh(size));
          if (k === 0) { setFont('bold', size); put(label, st.m.l, size); }
          setFont('normal', size);
          put(ln, st.m.l + lw, size);
          y += lh(size);
        });
        y += 0.5;
        break;
      }
      case 'subhead': {
        afterSection = false;
        const size = body;
        ensure(lh(size) * 2);
        y += 0.8;
        setFont('bolditalic', size);
        put(b.text, st.m.l, size);
        y += lh(size);
        break;
      }
      default: break;
    }
    void i;
  });

  if (draw && branding) {
    for (let p = 1; p <= page; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(150, 150, 150);
      doc.text('Made with ZeroAPI.in', A4.w / 2, A4.h - 5, { align: 'center' });
    }
  }
  return page;
}

/**
 * Builds the PDF. Returns { doc, pages, scale }.
 * `jsPDFCtor` = window.jspdf.jsPDF
 */
export function renderResumePdf(jsPDFCtor, resume, { template = 'modern', order, onePage, branding = false } = {}) {
  const st = TEMPLATES[template] || TEMPLATES.modern;
  const r = normalizeResume(resume);
  const blocks = buildBlocks(r, order);
  const doc = new jsPDFCtor({ unit: 'mm', format: 'a4', compress: true });
  let scale = 1;
  const fit = onePage ?? st.onePage;
  if (fit) {
    let found = null;
    for (const s of [1, 0.96, 0.92, 0.88, 0.84, 0.8]) {
      if (layoutPdf(doc, blocks, st, s, false, branding) === 1) { found = s; break; }
    }
    scale = found || 1;
  }
  const pages = layoutPdf(doc, blocks, st, scale, true, branding);
  try {
    doc.setProperties({
      title: `${pdfSafe(r.name) || 'Resume'} — Resume`, author: pdfSafe(r.name), subject: 'Resume',
      keywords: [...r.skills.technical, ...r.skills.tools].slice(0, 20).map(pdfSafe).join(', '), creator: 'ZeroAPI Resume Builder',
    });
  } catch { /* optional */ }
  return { doc, pages, scale };
}

/* ═══════════════════════════════════════════════════════════════
   DOCX (JSZip + WordprocessingML)
═══════════════════════════════════════════════════════════════ */
const xmlEsc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const hex = (a) => a.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
const twip = (mm) => Math.round(mm * 56.693);

function run(text, { bold, italic, size, color, font } = {}) {
  const props = [
    font ? `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>` : '',
    bold ? '<w:b/>' : '', italic ? '<w:i/>' : '',
    color ? `<w:color w:val="${color}"/>` : '',
    size ? `<w:sz w:val="${Math.round(size * 2)}"/><w:szCs w:val="${Math.round(size * 2)}"/>` : '',
  ].join('');
  return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r>`;
}
const tabRun = '<w:r><w:tab/></w:r>';

function para(content, { align, before = 0, after = 0, tabs, ind, border, keepNext, line } = {}) {
  const pPr = [
    keepNext ? '<w:keepNext/>' : '',
    border ? `<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${border}"/></w:pBdr>` : '',
    tabs ? `<w:tabs>${tabs.map((t) => `<w:tab w:val="${t.type}" w:pos="${t.pos}"/>`).join('')}</w:tabs>` : '',
    `<w:spacing w:before="${before}" w:after="${after}"${line ? ` w:line="${line}" w:lineRule="auto"` : ''}/>`,
    ind ? `<w:ind w:left="${ind.left || 0}"${ind.hanging ? ` w:hanging="${ind.hanging}"` : ''}/>` : '',
    align ? `<w:jc w:val="${align}"/>` : '',
  ].join('');
  return `<w:p><w:pPr>${pPr}</w:pPr>${content}</w:p>`;
}

function blocksToDocxBody(blocks, st) {
  const font = st.docx;
  const textW = twip(A4.w - st.m.l - st.m.r);
  const acc = hex(st.accent);
  const body = st.body;
  const lineMul = Math.round(st.lh * 240 * 0.92);
  const out = [];
  let afterSection = false;
  blocks.forEach((b) => {
    switch (b.t) {
      case 'name':
        out.push(para(run(b.text, { bold: true, size: st.nameSize, color: st.head === 'caps-rule' ? '111111' : acc, font }), { align: st.nameAlign === 'center' ? 'center' : 'left', after: 40 }));
        break;
      case 'contact':
        out.push(para(b.parts.map((p, i) => (i ? run('  |  ', { size: body - 0.5, color: '999999', font }) : '') + run(p.text, { size: body - 0.5, color: '444444', font })).join(''), { align: st.nameAlign === 'center' ? 'center' : 'left', after: 40 }));
        break;
      case 'section':
        out.push(para(run(b.title.toUpperCase(), { bold: true, size: st.headSize, color: acc, font }), { before: Math.round(st.secGap * 56.7), after: 50, keepNext: true, border: st.head === 'caps-plain' ? undefined : acc }));
        afterSection = true;
        break;
      case 'entry': {
        out.push(para(run(b.left, { bold: true, size: body, font }) + (b.right ? tabRun + run(b.right, { size: body, color: '444444', font }) : ''), {
          before: afterSection ? 0 : Math.round(st.entryGap * 56.7), tabs: b.right ? [{ type: 'right', pos: textW }] : undefined, keepNext: true, line: lineMul,
        }));
        afterSection = false;
        if (b.sub) out.push(para(run(b.sub, { italic: true, size: body, color: '555555', font }), { keepNext: true, line: lineMul }));
        break;
      }
      case 'bullet':
        afterSection = false;
        out.push(para(run('•', { size: body, font }) + tabRun + run(b.text, { size: body, font }), { before: Math.round(st.bulletGap * 56.7), tabs: [{ type: 'left', pos: 300 }], ind: { left: 300, hanging: 300 }, line: lineMul }));
        break;
      case 'para':
        afterSection = false;
        out.push(para(run(b.text, { size: body, font }), { before: 20, line: lineMul }));
        break;
      case 'kv':
        afterSection = false;
        out.push(para(run(`${b.label}: `, { bold: true, size: body, font }) + run(b.text, { size: body, font }), { before: 20, line: lineMul }));
        break;
      case 'subhead':
        afterSection = false;
        out.push(para(run(b.text, { bold: true, italic: true, size: body, font }), { before: 40, keepNext: true }));
        break;
      default: break;
    }
  });
  return out.join('');
}

function docxPackage(JSZipCtor, bodyXml, { margins, title, author, font, size }) {
  const zip = new JSZipCtor();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}" w:eastAsia="${font}"/><w:sz w:val="${Math.round(size * 2)}"/><w:szCs w:val="${Math.round(size * 2)}"/><w:lang w:val="en-IN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>`);
  zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xmlEsc(title)}</dc:title><dc:creator>${xmlEsc(author)}</dc:creator></cp:coreProperties>`);
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyXml}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="${twip(margins.t)}" w:right="${twip(margins.r)}" w:bottom="${twip(margins.b)}" w:left="${twip(margins.l)}" w:header="400" w:footer="400" w:gutter="0"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE' });
}

/** Word (.docx) export — real text, single column, ATS-safe. `JSZipCtor` = window.JSZip */
export async function renderResumeDocx(JSZipCtor, resume, { template = 'modern', order } = {}) {
  const st = TEMPLATES[template] || TEMPLATES.modern;
  const r = normalizeResume(resume);
  const blocks = buildBlocks(r, order);
  return docxPackage(JSZipCtor, blocksToDocxBody(blocks, st), {
    margins: st.m, title: `${r.name || 'Resume'} — Resume`, author: r.name || 'ZeroAPI', font: st.docx, size: st.body,
  });
}

/* ═══════════════════════════════════════════════════════════════
   Cover letter (PDF + DOCX)
═══════════════════════════════════════════════════════════════ */
/**
 * letter = { name, contactLine, date, recipientLines[], subject, greeting, paragraphs[], closing, signoff }
 */
export function renderLetterPdf(jsPDFCtor, letter, { branding = false } = {}) {
  const doc = new jsPDFCtor({ unit: 'mm', format: 'a4', compress: true });
  const m = { l: 22, r: 22, t: 20, b: 18 };
  const W = A4.w - m.l - m.r;
  const draw = (scale, really) => {
    let y = m.t;
    let pages = 1;
    const body = 11 * scale;
    const lh = body * 1.45 * PT;
    const ensure = (h) => { if (y + h > A4.h - m.b - (branding ? 4 : 0)) { pages++; y = m.t; if (really) doc.addPage(); } };
    const put = (txt, x, size, style = 'normal', color = [34, 34, 34]) => {
      doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(color[0], color[1], color[2]);
      if (really) doc.text(pdfSafe(txt), x, y + size * PT * 0.8);
    };
    doc.setFont('helvetica', 'bold'); doc.setFontSize(17 * scale);
    put(letter.name || '', m.l, 17 * scale, 'bold', [20, 20, 20]);
    y += 17 * scale * PT * 1.25;
    if (letter.contactLine) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5 * scale);
      doc.splitTextToSize(pdfSafe(letter.contactLine), W).forEach((ln) => { put(ln, m.l, 9.5 * scale, 'normal', [90, 90, 90]); y += 9.5 * scale * 1.4 * PT; });
    }
    if (really) { doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.2); doc.line(m.l, y + 1.5, m.l + W, y + 1.5); }
    y += 7;
    const block = (lines, style = 'normal') => {
      lines.filter(Boolean).forEach((txt) => {
        doc.setFont('helvetica', style); doc.setFontSize(body);
        doc.splitTextToSize(pdfSafe(txt), W).forEach((ln) => { ensure(lh); put(ln, m.l, body, style); y += lh; });
      });
    };
    block([letter.date]); y += lh * 0.6;
    if (letter.recipientLines?.length) { block(letter.recipientLines); y += lh * 0.6; }
    if (letter.subject) { block([letter.subject], 'bold'); y += lh * 0.6; }
    block([letter.greeting]); y += lh * 0.4;
    (letter.paragraphs || []).forEach((p) => { block([p]); y += lh * 0.55; });
    y += lh * 0.2;
    block([letter.closing]); y += lh * 1.1;
    block([letter.signoff], 'bold');
    return pages;
  };
  let scale = 1;
  for (const s of [1, 0.96, 0.92, 0.88, 0.84]) { if (draw(s, false) === 1) { scale = s; break; } scale = 1; }
  const pages = draw(scale, true);
  if (branding) {
    for (let p = 1; p <= pages; p++) { doc.setPage(p); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(150, 150, 150); doc.text('Made with ZeroAPI.in', A4.w / 2, A4.h - 5, { align: 'center' }); }
  }
  try { doc.setProperties({ title: `${pdfSafe(letter.name) || 'Cover'} — Cover Letter`, author: pdfSafe(letter.name) }); } catch { /* optional */ }
  return { doc, pages, scale };
}

export async function renderLetterDocx(JSZipCtor, letter) {
  const font = 'Arial';
  const mk = (txt, opts = {}) => para(run(txt, { size: opts.size || 11, bold: opts.bold, color: opts.color, font }), { after: opts.after ?? 120, line: 300 });
  const body = [
    mk(letter.name || '', { size: 17, bold: true, after: 40, color: '141414' }),
    letter.contactLine ? mk(letter.contactLine, { size: 9.5, color: '5A5A5A', after: 200 }) : '',
    mk(letter.date || ''),
    ...(letter.recipientLines || []).map((l, i, a) => mk(l, { after: i === a.length - 1 ? 200 : 0 })),
    letter.subject ? mk(letter.subject, { bold: true, after: 160 }) : '',
    mk(letter.greeting || '', { after: 120 }),
    ...(letter.paragraphs || []).map((p) => mk(p, { after: 140 })),
    mk(letter.closing || '', { after: 360 }),
    mk(letter.signoff || '', { bold: true }),
  ].join('');
  return docxPackage(JSZipCtor, body, { margins: { l: 22, r: 22, t: 20, b: 18 }, title: `${letter.name || 'Cover'} — Cover Letter`, author: letter.name || 'ZeroAPI', font, size: 11 });
}
