// src/lib/safeRegex.js
//
// Regex execution has an important failure mode the original tool never
// guarded against: catastrophic backtracking. A pattern like /(a+)+$/ run
// against an adversarial string can hang the JS main thread indefinitely.
// This module runs matching (and replace) inside a Web Worker with a hard
// timeout, so a runaway pattern only kills its own isolated thread — the
// worker is terminated and recreated, and the UI never freezes.

const WORKER_SRC = `
self.onmessage = function (e) {
  const { id, pattern, flags, text, mode, replacement } = e.data;
  try {
    const re = new RegExp(pattern, flags);
    if (mode === 'replace') {
      const result = text.replace(re, replacement);
      self.postMessage({ id, ok: true, result });
      return;
    }
    const results = [];
    const MAX_MATCHES = 5000;
    if (flags.includes('g')) {
      let m;
      let guard = 0;
      while ((m = re.exec(text)) !== null) {
        if (m.index === re.lastIndex) re.lastIndex++;
        results.push({ text: m[0], index: m.index, length: m[0].length, groups: m.slice(1), namedGroups: m.groups || null });
        if (++guard > MAX_MATCHES) break;
      }
    } else {
      const m = re.exec(text);
      if (m) results.push({ text: m[0], index: m.index, length: m[0].length, groups: m.slice(1), namedGroups: m.groups || null });
    }
    self.postMessage({ id, ok: true, results });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err.message });
  }
};
`;

let worker = null;
let seq = 0;
const pending = new Map();

function getWorker() {
  if (worker) return worker;
  try {
    const blob = new Blob([WORKER_SRC], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob));
    worker.onmessage = (e) => {
      const cb = pending.get(e.data.id);
      if (cb) {
        pending.delete(e.data.id);
        cb(e.data);
      }
    };
    worker.onerror = () => {
      for (const [, cb] of pending) cb({ ok: false, error: 'Worker crashed unexpectedly.' });
      pending.clear();
      worker = null;
    };
    return worker;
  } catch {
    return null; // Worker unsupported in this environment
  }
}

function runSync({ pattern, flags, text, mode, replacement }) {
  try {
    const re = new RegExp(pattern, flags);
    if (mode === 'replace') return { ok: true, result: text.replace(re, replacement) };
    const results = [];
    if (flags.includes('g')) {
      let m;
      while ((m = re.exec(text)) !== null) {
        if (m.index === re.lastIndex) re.lastIndex++;
        results.push({ text: m[0], index: m.index, length: m[0].length, groups: m.slice(1) });
      }
    } else {
      const m = re.exec(text);
      if (m) results.push({ text: m[0], index: m.index, length: m[0].length, groups: m.slice(1) });
    }
    return { ok: true, results };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Runs regex matching or replace off the main thread with a hard timeout.
 * Resolves to { ok, results?|result?, error?, timedOut? }.
 */
export function runRegexSafely({ pattern, flags = '', text = '', mode = 'match', replacement = '', timeoutMs = 1000 }) {
  const w = getWorker();
  if (!w) return Promise.resolve(runSync({ pattern, flags, text, mode, replacement }));

  const id = ++seq;
  return new Promise((resolve) => {
    let done = false;
    pending.set(id, (data) => {
      if (done) return;
      done = true;
      resolve(data);
    });
    w.postMessage({ id, pattern, flags, text, mode, replacement });
    setTimeout(() => {
      if (done) return;
      done = true;
      pending.delete(id);
      try {
        w.terminate();
      } catch {
        /* ignore */
      }
      worker = null; // force recreation on next call
      resolve({
        ok: false,
        error: 'Pattern took too long to run (possible catastrophic backtracking). Try a more specific pattern.',
        timedOut: true,
      });
    }, timeoutMs);
  });
}

/** Lightweight static heuristic to flag patterns likely to cause catastrophic backtracking. */
export function detectPotentialReDoS(pattern) {
  if (!pattern) return false;
  const nestedQuantifier = /\([^()]*[+*][^()]*\)[+*]/.test(pattern);
  const overlappingAlternation = /\(([^()|]+)\|\1\)[+*]/.test(pattern);
  return nestedQuantifier || overlappingAlternation;
}
