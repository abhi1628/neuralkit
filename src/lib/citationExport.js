// src/lib/citationExport.js — getting citations OUT of the page without losing formatting
//  • copyRich(): puts text/html (with real italics) AND text/plain on the clipboard, so pasting into Word / Google Docs keeps italics
//  • renderBibliographyDocx(): a Word file with hanging indents and italic runs
//  • downloadText(): .bib / .ris / .txt
// All HTML handled here is produced by citationEngine (escaped, only <i> tags). It is re-checked below anyway.

import { downloadBlob } from '../resumeCore';

const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const unescapeHtml = (s) => s.replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENT[m]);
const xmlEsc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const escHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Belt-and-braces: keep only <i></i> tags; everything else that looks like a tag is dropped. */
export function onlyItalicTags(html) {
  return String(html ?? '').replace(/<(?!\/?i>)[^>]*>/gi, '');
}

/** "<i>Nature</i>, 521" → [{text:'', italic:false}, …] */
export function splitItalic(html) {
  const parts = [];
  let italic = false;
  for (const tok of onlyItalicTags(html).split(/(<\/?i>)/i)) {
    if (/^<i>$/i.test(tok)) { italic = true; continue; }
    if (/^<\/i>$/i.test(tok)) { italic = false; continue; }
    if (tok) parts.push({ text: unescapeHtml(tok), italic });
  }
  return parts;
}

/* ─────────────── clipboard ─────────────── */
export async function copyRich(html, text) {
  const safe = onlyItalicTags(html);
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([`<div>${safe}</div>`], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      })]);
      return true;
    }
  } catch { /* fall through */ }
  try { // older browsers: select a hidden element and copy
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:-9999px;top:0;white-space:pre-wrap;';
    el.innerHTML = safe;
    document.body.appendChild(el);
    const range = document.createRange(); range.selectNodeContents(el);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    const ok = document.execCommand && document.execCommand('copy');
    sel.removeAllRanges(); el.remove();
    if (ok) return true;
  } catch { /* fall through */ }
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

/** HTML for a whole bibliography with hanging indents (paste into Word / Docs). */
export function bibliographyHtml(entries, { numbered }) {
  return entries.map((e) => `<p style="margin:0 0 8pt 0;${numbered ? '' : 'padding-left:0.5in;text-indent:-0.5in;'}">${e.label ? `${escHtml(e.label)} ` : ''}${onlyItalicTags(e.html)}</p>`).join('');
}

/* ─────────────── downloads ─────────────── */
export const downloadText = (filename, text, mime = 'text/plain') => downloadBlob(new Blob([text], { type: `${mime};charset=utf-8` }), filename);

/* ─────────────── Word (.docx) ─────────────── */
const HEADINGS = { apa: 'References', mla: 'Works Cited', ieee: 'References', chicago: 'Bibliography', harvard: 'Reference list', vancouver: 'References' };
export const headingFor = (style) => HEADINGS[style] || 'References';

const run = (text, { italic, bold, size = 12 } = {}) => `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${bold ? '<w:b/>' : ''}${italic ? '<w:i/>' : ''}<w:sz w:val="${size * 2}"/><w:szCs w:val="${size * 2}"/></w:rPr><w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r>`;

function para(inner, { hanging, center, before = 0, after = 120, line = 360 } = {}) {
  return `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/>${hanging ? '<w:ind w:left="720" w:hanging="720"/>' : ''}${center ? '<w:jc w:val="center"/>' : ''}</w:pPr>${inner}</w:p>`;
}

/**
 * @param JSZipCtor window.JSZip
 * @param entries [{label, html}]
 */
export async function renderBibliographyDocx(JSZipCtor, entries, style, { numbered = false } = {}) {
  const body = [
    para(run(headingFor(style), { bold: true }), { center: true, after: 200 }),
    ...entries.map((e) => para(
      (e.label ? run(`${e.label} `) : '') + splitItalic(e.html).map((p) => run(p.text, { italic: p.italic })).join(''),
      { hanging: !numbered },
    )),
  ].join('');
  const zip = new JSZipCtor();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  zip.file('word/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-IN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>');
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE' });
}
