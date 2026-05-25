// src/utils.js
import { DANGEROUS_INPUT_PATTERNS, DANGEROUS_OUTPUT_PATTERNS, VISITOR_API_URL } from './constants.js';

// ── Security ──────────────────────────────────────────────────
export function sanitizeInput(text) {
  if (!text) return text;
  let cleaned = text;
  DANGEROUS_INPUT_PATTERNS.forEach(p => { cleaned = cleaned.replace(p, '[REDACTED]'); });
  return cleaned;
}

export function sanitizeOutput(text) {
  if (!text) return text;
  let cleaned = text;
  DANGEROUS_OUTPUT_PATTERNS.forEach(p => { cleaned = cleaned.replace(p, '[FILTERED]'); });
  return cleaned;
}

export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Fetch with Exponential Backoff ────────────────────────────
// Automatically retries on Groq 429 rate-limit errors.
// Attempts: 1st retry after ~2s, 2nd after ~4s, 3rd after ~8s.
// Jitter (±500ms random) prevents all users retrying simultaneously.
export async function fetchWithBackoff(url, options, maxRetries = 3) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    let response;
    try {
      response = await fetch(url, options);
    } catch (networkErr) {
      // Network failure (offline, DNS) — don't retry
      throw new Error('Connection error. Please check your network and try again.');
    }

    // Success
    if (response.ok) return response;

    // Rate limited by Groq — backoff and retry
    if (response.status === 429) {
      attempt++;
      if (attempt > maxRetries) break;

      // Exponential delay: 2s → 4s → 8s + up to 500ms random jitter
      const baseDelay = Math.pow(2, attempt) * 1000;
      const jitter    = Math.random() * 500;
      const delay     = baseDelay + jitter;

      console.warn(`[ZeroAPI] Rate limited. Retry ${attempt}/${maxRetries} in ${(delay / 1000).toFixed(1)}s`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    // Server error (500, 503) — retry once
    if (response.status >= 500 && attempt < 1) {
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1500));
      continue;
    }

    // Any other error — return as-is, let the caller handle
    return response;
  }

  // All retries exhausted
  throw new Error('Service is busy right now. Please wait a moment and try again.');
}

// ── Analytics ─────────────────────────────────────────────────
export function loadGA(id) {
  if (document.getElementById('ga-script')) return;
  const s = document.createElement('script');
  s.id  = 'ga-script';
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
}

export function trackEvent(name, params = {}) {
  if (window.gtag) window.gtag('event', name, params);
}

// ── Visitor Count ─────────────────────────────────────────────
export async function fetchVisitorCount() {
  try {
    const r = await fetch(VISITOR_API_URL);
    return (await r.json()).value;
  } catch { return null; }
}

// ── Script Loader ─────────────────────────────────────────────
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s    = document.createElement('script');
    s.src      = src;
    s.onload   = resolve;
    s.onerror  = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
    setTimeout(() => reject(new Error(`Timeout loading ${src}`)), 10000);
  });
}

// ── PDF Download ──────────────────────────────────────────────
export async function downloadAsPDF(text, filename = 'zeroapi-output') {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const cleaned = text
    .replace(/[🎯🔍💡⚠️📌✅❌🚀📈◆]/g, m => ({
      '🎯': '[CORE]', '🔍': '[FINDINGS]', '💡': '[INFO]', '⚠️': '[WARNING]',
      '📌': '[NOTE]', '✅': '[+]', '❌': '[-]', '🚀': '[KEY]', '📈': '[GROWTH]', '◆': '*',
    }[m] || m))
    .replace(/undefineddefined/g, '').replace(/undefined/g, '').replace(/[^\x00-\x7F]/g, '');
  doc.setFont('helvetica');
  doc.setFontSize(18); doc.setTextColor(0, 0, 0);
  doc.text('ZeroAPI - AI Output', 10, 20);
  doc.setFontSize(9); doc.setTextColor(130, 130, 130);
  doc.text(`zeroapi.in | Generated: ${new Date().toLocaleDateString('en-IN')}`, 10, 28);
  doc.setDrawColor(0, 200, 180); doc.setLineWidth(0.5); doc.line(10, 32, 200, 32);
  doc.setFontSize(11);
  let y = 42;
  for (const line of cleaned.split('\n')) {
    if (line.trim() === '') { y += 7; continue; }
    const wrapped = doc.splitTextToSize(line, 185);
    for (const wl of wrapped) {
      if (y > 280) { doc.addPage(); y = 20; }
      if (wl.startsWith('[') || wl.startsWith('Q'))            { doc.setFont('helvetica', 'bold');       doc.setTextColor(0, 150, 130); }
      else if (wl.startsWith('Answer:') || wl.startsWith('Explanation:')) { doc.setFont('helvetica', 'bolditalic'); doc.setTextColor(0, 200, 180); }
      else                                                       { doc.setFont('helvetica', 'normal');     doc.setTextColor(30, 30, 30);  }
      doc.text(wl, 10, y); y += 7;
    }
  }
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(180, 180, 180);
    doc.text(`ZeroAPI.in - Free AI Tools | Page ${i} of ${pages}`, 10, 290);
  }
  doc.save(`${filename}.pdf`);
}

// ── Clipboard ─────────────────────────────────────────────────
export function copyToClipboard(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });
}

// ── Text ──────────────────────────────────────────────────────
export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatOutput(text, theme) {
  return text.split('\n').map((line, i) => {
    const isBold = line.startsWith('**') || line.match(/^[🎯🔍💡⚠️📌✅❌🚀📈1-9]/);
    return (
      <div key={i} style={{
        marginBottom: line === '' ? '14px' : '6px',
        fontWeight:   isBold ? 700 : 400,
        color:        isBold ? 'var(--accent)' : (theme === 'dark' ? 'rgba(255,255,255,0.88)' : '#2c3e50'),
        fontSize: '0.9rem', lineHeight: 1.85, letterSpacing: '0.01em',
        paddingLeft: isBold ? '0' : '4px', textAlign: 'left',
      }}>
        {line.replace(/\*\*/g, '')}
      </div>
    );
  });
}

// ── Confetti ──────────────────────────────────────────────────
import confetti from 'canvas-confetti';

export function fireConfetti() {
  const colors   = ['#a78bfa', '#a78bfa', '#ffffff', '#00aaff'];
  const defaults = { spread: 360, ticks: 100, gravity: 0.8, decay: 0.94, startVelocity: 20, colors };
  const end      = Date.now() + 1500;
  const frame    = () => {
    confetti({ ...defaults, particleCount: 4, origin: { x: Math.random() * 0.3 + 0.35, y: Math.random() * 0.3 + 0.3 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
