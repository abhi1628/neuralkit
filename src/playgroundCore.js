// src/playgroundCore.js — pure logic for the Code Playground (no React, testable in Node)
//  • tiny syntax highlighter (6 languages) whose output text == source text, so an overlay editor stays aligned
//  • editor edits: auto-indent, bracket/quote pairing, Tab / Shift+Tab, comment toggle (return a single replace op)
//  • short share links (deflate + base64url in the URL #fragment)
//  • example library (verified by running them), instant error hints, line diff, mini-markdown, AI prompts

import { aiCall, parseJsonLoose } from './resumeCore';

/* ═══════════════════════════════════════════════════════════════
   Language metadata
═══════════════════════════════════════════════════════════════ */
export const FILE_EXT = { python: 'py', c: 'c', cpp: 'cpp', java: 'java', javascript: 'js', typescript: 'ts' };
export const REPLIT_TEMPLATE = { python: 'python', c: 'c', cpp: 'cpp', java: 'java', javascript: 'nodejs', typescript: 'nodejs' };
const INDENT = { python: '    ', c: '    ', cpp: '    ', java: '    ', javascript: '  ', typescript: '  ' };
const COMMENT = { python: '# ', c: '// ', cpp: '// ', java: '// ', javascript: '// ', typescript: '// ' };
export const indentUnit = (lang) => INDENT[lang] || '  ';
export const downloadName = (lang) => (lang === 'java' ? 'Main.java' : `zeroapi-${lang}.${FILE_EXT[lang] || 'txt'}`);

/* ═══════════════════════════════════════════════════════════════
   Syntax highlighting — output text content is IDENTICAL to the source
═══════════════════════════════════════════════════════════════ */
const set = (s) => new Set(s.split(/\s+/).filter(Boolean));
const KW = {
  python: set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'),
  c: set('auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while'),
  cpp: set('auto break case catch class const constexpr continue default delete do else enum explicit extern false for friend goto if inline namespace new noexcept nullptr operator override private protected public return sizeof static struct switch template this throw true try typedef typename union using virtual volatile while final'),
  java: set('abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try volatile while var record true false null'),
  javascript: set('async await break case catch class const continue debugger default delete do else export extends finally for from function if import in instanceof let new of return static super switch this throw try typeof var void while with yield true false null undefined'),
};
KW.typescript = new Set([...KW.javascript, ...set('interface type enum implements private public protected readonly abstract namespace declare as keyof is satisfies infer')]);
const TY = {
  python: set('int str float bool list dict set tuple bytes object type'),
  c: set('char double float int long short signed unsigned void size_t FILE bool'),
  cpp: set('bool char double float int long short signed unsigned void size_t string vector map set unordered_map unordered_set pair queue stack deque array'),
  java: set('boolean byte char double float int long short void String Integer Double Long Boolean Character Object Math System Scanner List ArrayList Map HashMap Set HashSet'),
  javascript: set('Array Object String Number Boolean Map Set Promise Date Math JSON Symbol Error'),
  typescript: set('Array Object String Number Boolean Map Set Promise Date Math JSON Symbol Error string number boolean any unknown never void object'),
};
const BI = {
  python: set('print input len range enumerate zip map filter sum min max abs sorted reversed isinstance open round super self'),
  c: set('printf scanf puts gets fgets getchar putchar malloc calloc free strlen strcpy strcmp strcat sqrt pow main'),
  cpp: set('cout cin cerr endl getline main sort swap min max'),
  java: set('main println print printf'),
  javascript: set('console log require module process'),
  typescript: set('console log require module process'),
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const isIdStart = (c) => /[A-Za-z_$]/.test(c);
const isIdChar = (c) => /[A-Za-z0-9_$]/.test(c);

export function highlight(code, lang) {
  const py = lang === 'python';
  const cLike = !py;
  const hasPP = lang === 'c' || lang === 'cpp';
  const hasTpl = lang === 'javascript' || lang === 'typescript';
  const kw = KW[lang] || new Set(), ty = TY[lang] || new Set(), bi = BI[lang] || new Set();
  const n = code.length;
  let out = '';
  let i = 0;
  let lineStart = true;
  const emit = (cls, text) => { out += cls ? `<span class="pgt-${cls}">${esc(text)}</span>` : esc(text); };

  while (i < n) {
    const c = code[i];
    if (c === '\n') { out += '\n'; i++; lineStart = true; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { out += c; i++; continue; }

    // preprocessor
    if (hasPP && lineStart && c === '#') {
      let j = i; while (j < n && code[j] !== '\n') j++;
      emit('pp', code.slice(i, j)); i = j; continue;
    }
    lineStart = false;

    // comments
    if (py && c === '#') { let j = i; while (j < n && code[j] !== '\n') j++; emit('com', code.slice(i, j)); i = j; continue; }
    if (cLike && c === '/' && code[i + 1] === '/') { let j = i; while (j < n && code[j] !== '\n') j++; emit('com', code.slice(i, j)); i = j; continue; }
    if (cLike && c === '/' && code[i + 1] === '*') {
      let j = code.indexOf('*/', i + 2); j = j === -1 ? n : j + 2;
      // keep newlines outside spans' mismatch-free: spans may contain newlines (fine for <pre>)
      emit('com', code.slice(i, j)); i = j; continue;
    }

    // strings
    if (c === '"' || c === "'" || (hasTpl && c === '`')) {
      if (py && (code.startsWith('"""', i) || code.startsWith("'''", i))) {
        const q = code.slice(i, i + 3); let j = code.indexOf(q, i + 3); j = j === -1 ? n : j + 3;
        emit('str', code.slice(i, j)); i = j; continue;
      }
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === c) { j++; break; }
        if (code[j] === '\n' && c !== '`') break;
        j++;
      }
      if (j > n) j = n;
      emit('str', code.slice(i, j)); i = j; continue;
    }

    // numbers
    if (/[0-9]/.test(c) && !(i > 0 && isIdChar(code[i - 1]))) {
      const m = /^(0[xX][0-9a-fA-F]+|0[bB][01]+|\d+(?:_\d+)*\.?\d*(?:[eE][+-]?\d+)?[fFlLuU]*)/.exec(code.slice(i, i + 40));
      if (m) { emit('num', m[0]); i += m[0].length; continue; }
    }

    // identifiers
    if (isIdStart(c)) {
      let j = i + 1; while (j < n && isIdChar(code[j])) j++;
      const w = code.slice(i, j);
      let k = j; while (k < n && (code[k] === ' ' || code[k] === '\t')) k++;
      let cls = '';
      if (kw.has(w)) cls = 'kw';
      else if (ty.has(w)) cls = 'ty';
      else if (bi.has(w)) cls = 'bi';
      else if (code[k] === '(') cls = 'fn';
      else if (/^[A-Z][a-zA-Z0-9]*[a-z][a-zA-Z0-9]*$/.test(w)) cls = 'ty';
      emit(cls, w); i = j; continue;
    }

    emit('', c); i++;
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════
   Editor edits (each returns one replace operation)
   { from, to, text, selStart, selEnd }  — replace value[from:to] with text, then select selStart..selEnd
═══════════════════════════════════════════════════════════════ */
const lineStartOf = (v, i) => v.lastIndexOf('\n', i - 1) + 1;
const lineEndOf = (v, i) => { const j = v.indexOf('\n', i); return j === -1 ? v.length : j; };

export function editEnter(value, s, e, lang) {
  const unit = indentUnit(lang);
  const ls = lineStartOf(value, s);
  const before = value.slice(ls, s);
  const indent = before.match(/^[ \t]*/)[0];
  const last = before.trimEnd().slice(-1);
  const opens = lang === 'python' ? last === ':' : last !== '' && '{(['.includes(last);
  const next = value[e];
  if (opens && ((last === '{' && next === '}') || (last === '(' && next === ')') || (last === '[' && next === ']'))) {
    const text = `\n${indent}${unit}\n${indent}`;
    const sel = s + 1 + indent.length + unit.length;
    return { from: s, to: e, text, selStart: sel, selEnd: sel };
  }
  const text = `\n${indent}${opens ? unit : ''}`;
  return { from: s, to: e, text, selStart: s + text.length, selEnd: s + text.length };
}

export function editTab(value, s, e, lang, shift) {
  const unit = indentUnit(lang);
  const multi = value.slice(s, e).includes('\n');
  if (!shift && !multi) return { from: s, to: e, text: unit, selStart: s + unit.length, selEnd: s + unit.length };
  const from = lineStartOf(value, s);
  const to = lineEndOf(value, e > s && value[e - 1] === '\n' ? e - 1 : e);
  const lines = value.slice(from, to).split('\n');
  let removedFirst = 0, removedTotal = 0;
  const out = lines.map((ln, idx) => {
    if (!shift) return ln.length ? unit + ln : ln;
    const m = ln.match(new RegExp(`^(?:\\t| {1,${unit.length}})`));
    const r = m ? m[0].length : 0;
    if (idx === 0) removedFirst = r;
    removedTotal += r;
    return ln.slice(r);
  });
  const text = out.join('\n');
  if (!shift) {
    const added = text.length - (to - from);
    return { from, to, text, selStart: s + (lines[0].length ? unit.length : 0), selEnd: e + added };
  }
  return { from, to, text, selStart: Math.max(from, s - removedFirst), selEnd: Math.max(from, e - removedTotal) };
}

export function editComment(value, s, e, lang) {
  const pre = COMMENT[lang] || '// ';
  const trimPre = pre.trimEnd();
  const from = lineStartOf(value, s);
  const to = lineEndOf(value, e > s && value[e - 1] === '\n' ? e - 1 : e);
  const lines = value.slice(from, to).split('\n');
  const body = lines.filter((l) => l.trim());
  const allCommented = body.length > 0 && body.every((l) => l.trimStart().startsWith(trimPre));
  const minIndent = Math.min(...body.map((l) => l.match(/^[ \t]*/)[0].length), 1e9);
  const out = lines.map((l) => {
    if (!l.trim()) return l;
    if (allCommented) { const ind = l.match(/^[ \t]*/)[0]; const rest = l.slice(ind.length); return ind + (rest.startsWith(pre) ? rest.slice(pre.length) : rest.slice(trimPre.length)); }
    const k = minIndent === 1e9 ? 0 : minIndent;
    return l.slice(0, k) + pre + l.slice(k);
  });
  const text = out.join('\n');
  const delta = text.length - (to - from);
  return { from, to, text, selStart: s, selEnd: e + delta };
}

const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);

export function editType(value, s, e, ch, lang) {
  const closer = PAIRS[ch];
  const next = value[e];
  const prev = value[s - 1];
  // type-over a closing character
  if (s === e && CLOSERS.has(ch) && next === ch) return { skip: true, selStart: s + 1, selEnd: s + 1 };
  if (!closer) return null;
  if (ch === '`' && lang !== 'javascript' && lang !== 'typescript') return null;
  if (ch === "'" && s === e && prev && /[A-Za-z0-9_]/.test(prev)) return null; // apostrophe / prefix like f'
  if ((ch === '"' || ch === "'") && s === e && prev && /[A-Za-z0-9_]/.test(prev) && !(lang === 'python' && /[rRfFbBuU]/.test(prev) && !(value[s - 2] && /[A-Za-z0-9_]/.test(value[s - 2])))) return null;
  if (e > s) { // wrap selection
    const sel = value.slice(s, e);
    return { from: s, to: e, text: ch + sel + closer, selStart: s + 1, selEnd: s + 1 + sel.length };
  }
  if (next && !/[\s)\]}.,;:]/.test(next)) return null; // only auto-close before whitespace / closers / end
  return { from: s, to: s, text: ch + closer, selStart: s + 1, selEnd: s + 1 };
}

export function editBackspace(value, s, e) {
  if (s !== e || s === 0) return null;
  const a = value[s - 1], b = value[s];
  if (PAIRS[a] && PAIRS[a] === b) return { from: s - 1, to: s + 1, text: '', selStart: s - 1, selEnd: s - 1 };
  return null;
}

/** Applies an edit result to a string (used by tests and by the fallback path). */
export function applyEdit(value, ed) { return value.slice(0, ed.from) + ed.text + value.slice(ed.to); }

/* ═══════════════════════════════════════════════════════════════
   Input detection
═══════════════════════════════════════════════════════════════ */
const NEEDS_INPUT = {
  python: /\binput\s*\(|sys\.stdin/,
  c: /\b(scanf|gets|fgets|getchar|getc|fscanf)\s*\(/,
  cpp: /\bcin\b|\bgetline\s*\(|\bscanf\s*\(/,
  java: /\bScanner\b|BufferedReader|System\.in\b/,
  javascript: /\bprompt\s*\(|Deno\.stdin|readline|process\.stdin/,
  typescript: /\bprompt\s*\(|Deno\.stdin|readline|process\.stdin/,
};
export const needsInput = (code, lang) => !!(NEEDS_INPUT[lang] && NEEDS_INPUT[lang].test(code || ''));

/* ═══════════════════════════════════════════════════════════════
   Run response handling
═══════════════════════════════════════════════════════════════ */
export function parseRun(data, ms) {
  const out = String(data?.output ?? data?.stdout ?? '');
  const err = String(data?.error ?? data?.stderr ?? data?.compile_output ?? data?.message ?? '');
  const exit = [data?.exit_code, data?.exitCode, data?.returncode].find((x) => typeof x === 'number');
  const status = data?.status;
  const statusBad = status !== undefined && status !== 'success' && status !== 'ok' && status !== 0 && status !== true;
  const failed = statusBad || (typeof exit === 'number' && exit !== 0) || (!out.trim() && !!err.trim());
  const kind = !failed ? 'success'
    : /error:|SyntaxError|IndentationError|cannot find symbol|expected|undefined reference|not declared|ld returned|compilation terminated/i.test(err) && !/Traceback|Exception in thread|Segmentation/i.test(err) ? 'compile_error' : 'runtime_error';
  const display = [out.replace(/\s+$/, ''), err.trim() ? err.replace(/\s+$/, '') : ''].filter(Boolean);
  return {
    ok: !failed, kind, stdout: out, stderr: err, exit, ms,
    text: display.length ? display.join(out.trim() && err.trim() ? '\n' : '') : (failed ? `Error: ${status || 'Unknown error'}` : '(No output)'),
    hasStdout: !!out.trim(), hasStderr: !!err.trim(),
  };
}

export function compareOutput(actual, expected) {
  const norm = (s) => String(s || '').replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
  const a = norm(actual), b = norm(expected);
  if (a === b) return { pass: true };
  const al = a.split('\n'), bl = b.split('\n');
  const n = Math.max(al.length, bl.length);
  for (let i = 0; i < n; i++) if (al[i] !== bl[i]) return { pass: false, line: i + 1, got: al[i] ?? '(nothing)', want: bl[i] ?? '(nothing)' };
  return { pass: false, line: 1, got: a, want: b };
}

/* ═══════════════════════════════════════════════════════════════
   Instant error hints (no AI needed)
═══════════════════════════════════════════════════════════════ */
const HINTS = [
  ['python', /EOFError/, 'Your program called input() but there was nothing to read. Add the values it expects in the Input tab (one per line).'],
  ['python', /IndentationError|unexpected indent|expected an indented block/, 'Python is strict about indentation. Use the same number of spaces for every line in a block.'],
  ['python', /SyntaxError.*(invalid syntax|was never closed|unterminated)/s, 'There is a typo near the line shown — look for a missing colon, bracket or quote on or just above that line.'],
  ['python', /NameError: name '([^']+)'/, 'A variable or function is used before it is defined (or its name is misspelled). Check the spelling and the order of your code.'],
  ['python', /ZeroDivisionError/, 'Something is being divided by zero. Check the value of the divisor before dividing.'],
  ['python', /IndexError/, 'You are reading a position that does not exist in the list. Lists start at 0 and the last index is len(list) - 1.'],
  ['python', /ValueError: invalid literal for int/, 'int() was given something that is not a whole number (for example text or an empty line). Check your input.'],
  ['python', /TypeError: can only concatenate str/, 'You are adding text and a number. Convert with str(number) or use an f-string.'],
  ['python', /ModuleNotFoundError/, 'This playground only has the Python standard library. Third-party packages (numpy, pandas…) are not installed.'],
  ['c', /undefined reference to `?main/, 'Your program has no main() function (or it is misspelled).'],
  ['c', /expected ['‘]?;['’]?|expected ';'/, 'A semicolon is missing at the end of a statement — usually on the line just above the one reported.'],
  ['c', /implicit declaration of function/, 'You called a function that has not been declared. Add the right #include (for example <stdio.h> or <string.h>) or declare the function before main().'],
  ['c', /Segmentation fault|SIGSEGV/, 'The program touched memory it does not own — typical causes are an array index out of range, a NULL pointer, or scanf without & for a number.'],
  ['cpp', /was not declared in this scope/, 'A name is used before it is declared, or a header/namespace is missing. Check #include and “using namespace std;”.'],
  ['cpp', /Segmentation fault|SIGSEGV/, 'Invalid memory access — check array/vector indexes and pointers.'],
  ['java', /class (\w+) is public, should be declared in a file named/, 'Name the public class “Main” (the file is Main.java here), or remove the word “public” from the class.'],
  ['java', /cannot find symbol/, 'Java cannot find a variable, method or class by that name. Check spelling, capital letters and imports (for example import java.util.*;).'],
  ['java', /NoSuchElementException/, 'Your program asked the Scanner for more input than was provided. Add the values in the Input tab.'],
  ['java', /ArrayIndexOutOfBoundsException/, 'An array index is outside 0 … length-1.'],
  ['java', /NullPointerException/, 'A variable that is null was used. Make sure objects are created with new before using them.'],
  ['any', /Time limit|timed out|timeout|Killed|SIGKILL/i, 'The program ran too long and was stopped. Check for an infinite loop, or a program that is waiting for input that was never given.'],
  ['javascript', /ReferenceError: (\w+) is not defined/, 'A variable is used before it is declared or is misspelled.'],
  ['typescript', /TS\d{4}/, 'TypeScript found a type problem. Read the message — it names the line and the types that do not match.'],
  ['any', /ReferenceError: (\w+) is not defined/, 'A variable is used before it is declared or is misspelled.'],
];
export function quickHint(lang, text) {
  for (const [l, re, hint] of HINTS) if ((l === lang || l === 'any') && re.test(text || '')) return hint;
  return '';
}

/* ═══════════════════════════════════════════════════════════════
   Line diff (LCS)
═══════════════════════════════════════════════════════════════ */
export function diffLines(a, b) {
  const A = String(a).split('\n'), B = String(b).split('\n');
  const n = A.length, m = B.length;
  if (n * m > 600000) return [...A.map((t) => ({ t: 'del', text: t })), ...B.map((t) => ({ t: 'add', text: t }))];
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ t: 'same', text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: 'del', text: A[i++] });
    else out.push({ t: 'add', text: B[j++] });
  }
  while (i < n) out.push({ t: 'del', text: A[i++] });
  while (j < m) out.push({ t: 'add', text: B[j++] });
  return out;
}

/** Collapses long unchanged runs, keeping 2 lines of context around changes. */
export function compactDiff(d, ctx = 2) {
  const keep = d.map((x) => x.t !== 'same');
  const idx = d.map((_, i) => i);
  const show = idx.map((i) => { for (let k = Math.max(0, i - ctx); k <= Math.min(d.length - 1, i + ctx); k++) if (keep[k]) return true; return false; });
  const out = [];
  let skipped = 0;
  d.forEach((x, i) => { if (show[i]) { if (skipped) { out.push({ t: 'skip', text: `… ${skipped} unchanged line${skipped > 1 ? 's' : ''}` }); skipped = 0; } out.push(x); } else skipped++; });
  if (skipped) out.push({ t: 'skip', text: `… ${skipped} unchanged line${skipped > 1 ? 's' : ''}` });
  return out;
}

/* ═══════════════════════════════════════════════════════════════
   Mini markdown → blocks (rendered by React, no innerHTML)
═══════════════════════════════════════════════════════════════ */
export function inlineParts(text) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ t: 'text', v: text.slice(last, m.index) });
    parts.push(m[0].startsWith('**') ? { t: 'bold', v: m[0].slice(2, -2) } : { t: 'code', v: m[0].slice(1, -1) });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t: 'text', v: text.slice(last) });
  return parts;
}

export function parseMarkdown(src) {
  const lines = String(src || '').replace(/\r/g, '').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (/^```/.test(ln)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; blocks.push({ type: 'code', text: buf.join('\n') }); continue;
    }
    if (/^\s*\|.*\|\s*$/.test(ln)) {
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i].trim().slice(1, -1).split('|').map((c) => c.trim())); i++; }
      const data = rows.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
      if (data.length) blocks.push({ type: 'table', head: data[0], rows: data.slice(1) });
      continue;
    }
    const h = ln.match(/^(#{1,4})\s+(.*)$/);
    if (h) { blocks.push({ type: 'heading', text: h[2] }); i++; continue; }
    if (/^\s*([-*•]|\d+[.)])\s+/.test(ln)) {
      const items = [];
      while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*([-*•]|\d+[.)])\s+/, '')); i++; }
      blocks.push({ type: 'list', items }); continue;
    }
    if (!ln.trim()) { i++; continue; }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^```|^#{1,4}\s|^\s*\|/.test(lines[i]) && !/^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) para.push(lines[i++]);
    blocks.push({ type: 'para', text: para.join(' ') });
  }
  return blocks;
}

/* ═══════════════════════════════════════════════════════════════
   Share links:  /playground#s=<token>   (deflate-raw → base64url; falls back to plain)
═══════════════════════════════════════════════════════════════ */
const b64url = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64url = (str) => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)); return Uint8Array.from(s, (c) => c.charCodeAt(0)); };

async function pipe(bytes, stream) {
  const w = stream.writable.getWriter(); w.write(bytes); w.close();
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

export async function encodeShare({ lang, code, stdin = '' }) {
  const bytes = new TextEncoder().encode(JSON.stringify({ l: lang, c: code, i: stdin || undefined }));
  if (typeof CompressionStream !== 'undefined') {
    try { return `z.${b64url(await pipe(bytes, new CompressionStream('deflate-raw')))}`; } catch { /* fall through */ }
  }
  return `p.${b64url(bytes)}`;
}

export async function decodeShare(token) {
  const [kind, body] = [token.slice(0, 2), token.slice(2)];
  let bytes = unb64url(body);
  if (kind === 'z.') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (kind !== 'p.') throw new Error('Unknown link format');
  const o = JSON.parse(new TextDecoder().decode(bytes));
  if (typeof o?.c !== 'string') throw new Error('Bad link');
  return { lang: String(o.l || ''), code: o.c, stdin: String(o.i || '') };
}

/* ═══════════════════════════════════════════════════════════════
   Example library (every example is executed in tests)
═══════════════════════════════════════════════════════════════ */
const T = (title, code, stdin = '') => ({ title, code: code.replace(/^\n/, ''), stdin });

export const EXAMPLE_LIB = {
  python: [
    T('Fibonacci series', `
n = int(input("How many terms? "))
a, b = 0, 1
for _ in range(n):
    print(a, end=" ")
    a, b = b, a + b
print()
`, '10'),
    T('Prime number check', `
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

n = int(input("Enter a number: "))
print(n, "is prime" if is_prime(n) else "is not prime")
`, '29'),
    T('Bubble sort', `
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))
`),
    T('Palindrome check', `
s = input("Enter a word: ").strip().lower()
print("Palindrome" if s == s[::-1] else "Not a palindrome")
`, 'Madam'),
    T('OOP: classes & inheritance', `
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound"


class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"


for a in [Animal("Generic"), Dog("Bruno")]:
    print(a.speak())
`),
    T('Quick sort', `
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
`),
  ],
  c: [
    T('Fibonacci series', `
#include <stdio.h>

int main() {
    int n, a = 0, b = 1;
    printf("How many terms? ");
    scanf("%d", &n);
    for (int i = 0; i < n; i++) {
        printf("%d ", a);
        int next = a + b;
        a = b;
        b = next;
    }
    printf("\\n");
    return 0;
}
`, '10'),
    T('Prime number check', `
#include <stdio.h>

int is_prime(int n) {
    if (n < 2) return 0;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return 0;
    return 1;
}

int main() {
    int n;
    printf("Enter a number: ");
    scanf("%d", &n);
    printf("%d is %s\\n", n, is_prime(n) ? "prime" : "not prime");
    return 0;
}
`, '29'),
    T('Bubble sort', `
#include <stdio.h>

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int t = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = t;
            }
        }
    }
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}
`),
    T('Palindrome check', `
#include <stdio.h>
#include <string.h>

int main() {
    char s[100];
    printf("Enter a word: ");
    scanf("%99s", s);
    int n = strlen(s), ok = 1;
    for (int i = 0; i < n / 2; i++)
        if (s[i] != s[n - 1 - i]) { ok = 0; break; }
    printf("%s\\n", ok ? "Palindrome" : "Not a palindrome");
    return 0;
}
`, 'madam'),
    T('Structures', `
#include <stdio.h>

struct Student {
    char name[30];
    int marks[3];
};

float average(struct Student s) {
    return (s.marks[0] + s.marks[1] + s.marks[2]) / 3.0f;
}

int main() {
    struct Student s = {"Riya", {78, 85, 92}};
    printf("%s's average: %.2f\\n", s.name, average(s));
    return 0;
}
`),
    T('Pointers & swap', `
#include <stdio.h>

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main() {
    int x = 10, y = 20;
    printf("Before: x=%d y=%d\\n", x, y);
    swap(&x, &y);
    printf("After:  x=%d y=%d\\n", x, y);
    return 0;
}
`),
  ],
  cpp: [
    T('Fibonacci series', `
#include <iostream>
using namespace std;

int main() {
    int n, a = 0, b = 1;
    cout << "How many terms? ";
    cin >> n;
    for (int i = 0; i < n; i++) {
        cout << a << " ";
        int next = a + b;
        a = b;
        b = next;
    }
    cout << endl;
    return 0;
}
`, '10'),
    T('Prime number check', `
#include <iostream>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

int main() {
    int n;
    cout << "Enter a number: ";
    cin >> n;
    cout << n << (isPrime(n) ? " is prime" : " is not prime") << endl;
    return 0;
}
`, '29'),
    T('Bubble sort (vector)', `
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {64, 34, 25, 12, 22, 11, 90};
    for (size_t i = 0; i + 1 < v.size(); i++)
        for (size_t j = 0; j + 1 < v.size() - i; j++)
            if (v[j] > v[j + 1]) swap(v[j], v[j + 1]);
    for (int x : v) cout << x << " ";
    cout << endl;
    return 0;
}
`),
    T('Palindrome check', `
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    cout << "Enter a word: ";
    cin >> s;
    string r(s.rbegin(), s.rend());
    cout << (s == r ? "Palindrome" : "Not a palindrome") << endl;
    return 0;
}
`, 'madam'),
    T('OOP: inheritance & virtual', `
#include <iostream>
#include <string>
using namespace std;

class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() {}
};

class Rectangle : public Shape {
    double w, h;
public:
    Rectangle(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

int main() {
    Shape* shapes[] = {new Rectangle(3, 4), new Circle(2)};
    for (Shape* s : shapes) {
        cout << "Area: " << s->area() << endl;
        delete s;
    }
    return 0;
}
`),
    T('Constructor & destructor', `
#include <iostream>
using namespace std;

class Demo {
    int id;
public:
    Demo(int i) : id(i) { cout << "Created " << id << endl; }
    ~Demo() { cout << "Destroyed " << id << endl; }
};

int main() {
    Demo a(1);
    {
        Demo b(2);
    }
    cout << "End of main" << endl;
    return 0;
}
`),
  ],
  java: [
    T('Fibonacci series', `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("How many terms? ");
        int n = sc.nextInt();
        int a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            System.out.print(a + " ");
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
    }
}
`, '10'),
    T('Prime number check', `
import java.util.Scanner;

public class Main {
    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++)
            if (n % i == 0) return false;
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int n = sc.nextInt();
        System.out.println(n + (isPrime(n) ? " is prime" : " is not prime"));
    }
}
`, '29'),
    T('Bubble sort', `
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int t = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = t;
                }
            }
        }
        System.out.println(Arrays.toString(arr));
    }
}
`),
    T('Palindrome check', `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a word: ");
        String s = sc.next().toLowerCase();
        String r = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(r) ? "Palindrome" : "Not a palindrome");
    }
}
`, 'Madam'),
    T('OOP: abstract class & inheritance', `
public class Main {
    public static void main(String[] args) {
        Employee[] team = {new Manager("Asha"), new Developer("Ravi")};
        for (Employee e : team) e.show();
    }
}

abstract class Employee {
    protected String name;

    Employee(String name) {
        this.name = name;
    }

    abstract double salary();

    void show() {
        System.out.println(name + " earns " + salary());
    }
}

class Manager extends Employee {
    Manager(String name) { super(name); }
    double salary() { return 90000; }
}

class Developer extends Employee {
    Developer(String name) { super(name); }
    double salary() { return 70000; }
}
`),
    T('Exception handling', `
public class Main {
    public static void main(String[] args) {
        try {
            int[] a = new int[3];
            a[5] = 10;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught: " + e.getMessage());
        } finally {
            System.out.println("finally always runs");
        }
    }
}
`),
  ],
  javascript: [
    T('Fibonacci series', `
const n = 10;
let a = 0, b = 1;
const out = [];
for (let i = 0; i < n; i++) {
  out.push(a);
  [a, b] = [b, a + b];
}
console.log(out.join(" "));
`),
    T('Prime numbers', `
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

for (const n of [2, 15, 29, 100]) {
  console.log(n, isPrime(n) ? "is prime" : "is not prime");
}
`),
    T('Bubble sort', `
function bubbleSort(arr) {
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    }
  }
  return a;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
`),
    T('Palindrome check', `
const isPalindrome = (s) => {
  const t = s.toLowerCase();
  return t === [...t].reverse().join("");
};

for (const w of ["Madam", "hello", "level"]) {
  console.log(w, isPalindrome(w) ? "-> palindrome" : "-> not a palindrome");
}
`),
    T('Classes & inheritance', `
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return this.name + " makes a sound";
  }
}

class Dog extends Animal {
  speak() {
    return this.name + " says Woof!";
  }
}

for (const a of [new Animal("Generic"), new Dog("Bruno")]) console.log(a.speak());
`),
    T('Array methods', `
const nums = [1, 2, 3, 4, 5, 6];
const squares = nums.map((n) => n * n);
const evens = squares.filter((n) => n % 2 === 0);
const total = evens.reduce((sum, n) => sum + n, 0);
console.log({ squares, evens, total });
`),
  ],
  typescript: [
    T('Fibonacci series', `
const n: number = 10;
let a = 0, b = 1;
const out: number[] = [];
for (let i = 0; i < n; i++) {
  out.push(a);
  [a, b] = [b, a + b];
}
console.log(out.join(" "));
`),
    T('Prime numbers', `
const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

for (const n of [2, 15, 29, 100]) {
  console.log(n, isPrime(n) ? "is prime" : "is not prime");
}
`),
    T('Interfaces & types', `
interface User {
  name: string;
  age: number;
  email?: string;
}

function describe(u: User): string {
  return u.name + " (" + u.age + ")" + (u.email ? " <" + u.email + ">" : "");
}

const users: User[] = [{ name: "Asha", age: 21 }, { name: "Ravi", age: 24, email: "ravi@example.com" }];
users.forEach((u) => console.log(describe(u)));
`),
    T('Generics', `
function firstOf<T>(items: T[]): T | undefined {
  return items[0];
}

console.log(firstOf<number>([10, 20, 30]));
console.log(firstOf<string>(["a", "b"]));
console.log(firstOf<boolean>([]));
`),
    T('Classes & inheritance', `
class Animal {
  constructor(protected name: string) {}
  speak(): string {
    return this.name + " makes a sound";
  }
}

class Dog extends Animal {
  speak(): string {
    return this.name + " says Woof!";
  }
}

for (const a of [new Animal("Generic"), new Dog("Bruno")]) console.log(a.speak());
`),
    T('Union types', `
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };

function area(s: Shape): number {
  return s.kind === "circle" ? Math.PI * s.r * s.r : s.side * s.side;
}

console.log(area({ kind: "circle", r: 2 }).toFixed(2));
console.log(area({ kind: "square", side: 3 }));
`),
  ],
};

/* ═══════════════════════════════════════════════════════════════
   AI tasks
═══════════════════════════════════════════════════════════════ */
const clip = (s, n) => String(s || '').slice(0, n);

export const EXPLAIN_MODES = {
  beginner: { label: 'Beginner', hint: 'Plain-language walk-through' },
  lines: { label: 'Line by line', hint: 'Every important line explained' },
  exam: { label: 'Exam answer', hint: 'Aim, algorithm, dry run, complexity' },
  review: { label: 'Review', hint: 'Bugs, edge cases, improvements' },
};

const MODE_PROMPT = {
  beginner: `Explain the code for a beginner. Use these Markdown sections:
## What it does
One or two sentences.
## How it works
A short numbered list in plain language.
## Key concepts
A short bullet list of the programming ideas used.
## Output
What it prints or returns (use the real output if provided).`,
  lines: `Explain the code line by line. For each important line or small group of lines, write "**Line N:** \`code\` — what it does". Skip blank lines and obvious braces. Finish with one sentence on what the whole program does.`,
  exam: `Write an exam-ready answer (as a student would write in a university exam). Use these Markdown sections:
## Aim
One sentence.
## Concept / Definition
Define the main concept in 2-3 lines.
## Algorithm
Numbered steps.
## Dry run
A Markdown table tracing the program for the given input (or a small sample if none). Columns should be the key variables.
## Output
## Time and space complexity
Give Big-O with a one-line reason.
## Viva questions
3 short questions an examiner might ask, with one-line answers.`,
  review: `Review the code like a senior engineer teaching a student. Use these Markdown sections:
## Bugs and risks
Real problems only (or "None found").
## Edge cases
Inputs that could break it.
## Complexity
Time and space in Big-O.
## Improvements
At most 4 concrete suggestions, each with a tiny code snippet in a fenced block when helpful.`,
};

export async function explainCode({ mode = 'beginner', lang, label, code, stdin, run, model }) {
  const runInfo = run ? `\n\nLAST RUN (${run.ok ? 'succeeded' : 'FAILED'}):\n${clip(run.text, 1500)}` : '';
  const { text } = await aiCall({
    toolId: 'code-playground', model, reasoning: 'low', maxTokens: 3500, temperature: 0.3,
    messages: [
      { role: 'system', content: `You are an expert ${label} teacher for university students. Be accurate and concise. Never invent output you cannot derive from the code. Format in Markdown.\n\n${MODE_PROMPT[mode] || MODE_PROMPT.beginner}` },
      { role: 'user', content: `${label} code:\n\`\`\`\n${clip(code, 9000)}\n\`\`\`${stdin ? `\n\nProgram input:\n${clip(stdin, 500)}` : ''}${runInfo}` },
    ],
  });
  return text;
}

export async function fixCode({ lang, label, code, stdin, run, model }) {
  const { text } = await aiCall({
    toolId: 'code-playground', model, json: true, reasoning: 'low', maxTokens: 7000, temperature: 0.2,
    messages: [
      { role: 'system', content: `You debug ${label} programs for students. Reply with ONE JSON object only:
{"cause":"1-2 plain sentences: what went wrong and why","fix_summary":"what you changed, in one sentence","fixed_code":"the COMPLETE corrected program","tips":["1-3 short tips to avoid this next time"]}
RULES
1. Make the SMALLEST change that fixes the problem. Keep the student's variable names, style and structure.
2. Do not add features or change what the program is meant to do.
3. The program is run with the input provided (if any). If the failure is only because input is missing, say so in "cause" and return fixed_code identical to the original.
4. fixed_code must be a full, runnable program for ${label} (no placeholders, no markdown fences).` },
      { role: 'user', content: `PROGRAM:\n${clip(code, 9000)}\n\nINPUT PROVIDED:\n${clip(stdin, 500) || '(none)'}\n\nERROR / OUTPUT:\n${clip(run?.text, 2000)}` },
    ],
  });
  const p = parseJsonLoose(text);
  const fixed = String(p.fixed_code || '').replace(/^```[a-z+]*\n?|\n?```$/gi, '');
  return {
    cause: String(p.cause || '').trim(),
    summary: String(p.fix_summary || '').trim(),
    fixed: fixed.trim().length >= 5 ? fixed : '',
    tips: (Array.isArray(p.tips) ? p.tips : []).map((t) => String(t).trim()).filter(Boolean).slice(0, 3),
  };
}
