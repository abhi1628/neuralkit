// src/components/RegexTool.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { GROQ_API_URL, TOOL_MODELS } from '../constants';
import { fetchWithBackoff } from '../utils';
import { runRegexSafely, detectPotentialReDoS } from '../lib/safeRegex';

const PRESETS = [
  { label: 'Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: '', desc: 'Standard email validation' },
  { label: 'Indian Phone', pattern: '^(\\+91[\\s-]?)?[0]?[6789]\\d{9}$', flags: '', desc: '+91 or 0 prefix optional' },
  { label: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'i', desc: 'HTTP/HTTPS URLs' },
  { label: 'IP Address', pattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', flags: '', desc: 'IPv4 address' },
  { label: 'Date (YYYY-MM-DD)', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', flags: '', desc: 'ISO date format' },
  { label: 'Strong Password', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', flags: '', desc: '8+ chars, upper, lower, number, symbol' },
  { label: 'Aadhaar', pattern: '^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$', flags: '', desc: '12-digit Indian Aadhaar' },
  { label: 'PAN Card', pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', flags: '', desc: 'Indian PAN format' },
  { label: 'Hex Color', pattern: '^#(?:[0-9a-fA-F]{3}){1,2}$', flags: '', desc: '#fff or #ffffff' },
  { label: 'Time (HH:MM)', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$', flags: '', desc: '24-hour time' },
];

const FLAG_OPTIONS = [
  { key: 'g', label: 'g', desc: 'Global — find all matches' },
  { key: 'i', label: 'i', desc: 'Ignore case' },
  { key: 'm', label: 'm', desc: 'Multiline — ^$ match line start/end' },
  { key: 's', label: 's', desc: 'DotAll — . matches newlines' },
  { key: 'u', label: 'u', desc: 'Unicode — proper Unicode support' },
];

const DEBOUNCE_MS = 300;

// ── Book Promo Config ──
const BOOK_LINK = 'https://www.amazon.com/Simplifying-Regular-Expression-Using-Python/dp/1094777978';
const BOOK_TITLE = 'Simplifying Regular Expression Using Python: Learn Regex Like Never Before';

// ── Robust JSON repair ──
function repairJson(raw) {
  if (!raw) throw new Error('Empty response from AI.');
  let s = raw
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/```json\s*|\s*```/g, '')
    .replace(/^\s*json\s*/i, '')
    .trim();
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('AI did not return valid JSON.');
  s = s
    .slice(first, last + 1)
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
  return JSON.parse(s);
}

/**
 * Runs the AI's own shouldMatch/shouldNotMatch examples against the pattern
 * it generated, off the main thread and with a timeout. This is what catches
 * cases where the model's regex doesn't actually do what it claims — instead
 * of trusting the AI's self-reported examples, we verify them.
 */
async function selfValidate(pattern, flags, testCases) {
  const cleanFlags = (flags || '').replace(/[^gimsuy]/g, '');
  const shouldMatch = testCases?.shouldMatch || [];
  const shouldNotMatch = testCases?.shouldNotMatch || [];

  const runOne = async (value) => {
    const res = await runRegexSafely({ pattern, flags: cleanFlags, text: value, mode: 'match', timeoutMs: 1000 });
    if (!res.ok) return { value, matched: false, error: res.error };
    return { value, matched: res.results.length > 0 };
  };

  const matchResults = await Promise.all(shouldMatch.map(runOne));
  const notMatchResults = await Promise.all(shouldNotMatch.map(runOne));

  const shouldMatchChecked = matchResults.map((r) => ({ ...r, passed: !r.error && r.matched }));
  const shouldNotMatchChecked = notMatchResults.map((r) => ({ ...r, passed: !r.error && !r.matched }));
  const allPassed = [...shouldMatchChecked, ...shouldNotMatchChecked].every((r) => r.passed);
  const engineError = [...matchResults, ...notMatchResults].find((r) => r.error)?.error || null;

  return { shouldMatch: shouldMatchChecked, shouldNotMatch: shouldNotMatchChecked, allPassed, engineError };
}

export default function RegexTool() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  // ── Tabs ──
  const [tab, setTab] = useState('generate'); // 'generate' | 'test'

  // ── Generate state ──
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [genResult, setGenResult] = useState(null);
  const [validation, setValidation] = useState(null); // { shouldMatch, shouldNotMatch, allPassed, engineError }
  const [validating, setValidating] = useState(false);

  // ── Test state ──
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false });
  const [sampleText, setSampleText] = useState('');
  const [matches, setMatches] = useState([]);
  const [matchError, setMatchError] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [checking, setChecking] = useState(false);

  // ── Replace sub-panel ──
  const [replaceOn, setReplaceOn] = useState(false);
  const [replacement, setReplacement] = useState('');
  const [replaceResult, setReplaceResult] = useState('');
  const [replaceError, setReplaceError] = useState('');

  const testRef = useRef(null);

  const activeFlagsStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
  const redosRisk = detectPotentialReDoS(pattern);

  // ── Live regex testing (debounced, off-main-thread, timeout-protected) ──
  useEffect(() => {
    if (!pattern || !sampleText) {
      setMatches([]);
      setMatchCount(0);
      setMatchError('');
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const t = setTimeout(async () => {
      const res = await runRegexSafely({ pattern, flags: activeFlagsStr, text: sampleText, mode: 'match', timeoutMs: 1500 });
      if (cancelled) return;
      if (res.ok) {
        setMatches(res.results);
        setMatchCount(res.results.length);
        setMatchError('');
      } else {
        setMatches([]);
        setMatchCount(0);
        setMatchError(res.error);
      }
      setChecking(false);
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [pattern, activeFlagsStr, sampleText]);

  // ── Live replace preview (debounced) ──
  useEffect(() => {
    if (!replaceOn || !pattern || !sampleText) {
      setReplaceResult('');
      setReplaceError('');
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const res = await runRegexSafely({
        pattern,
        flags: activeFlagsStr,
        text: sampleText,
        mode: 'replace',
        replacement,
        timeoutMs: 1500,
      });
      if (cancelled) return;
      if (res.ok) {
        setReplaceResult(res.result);
        setReplaceError('');
      } else {
        setReplaceResult('');
        setReplaceError(res.error);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [replaceOn, pattern, activeFlagsStr, sampleText, replacement]);

  // ── AI Generate + self-validate ──
  async function generateRegex(feedback) {
    if (!description.trim()) return;
    setGenerating(true);
    setGenError('');
    setGenResult(null);
    setValidation(null);

    const userPrompt = feedback
      ? `Generate a regex for this request. If an example number/string is included, match THAT exact format:\n\n${description.trim().slice(0, 500)}\n\nA previous attempt failed self-testing with this feedback — fix the pattern:\n${feedback}`
      : `Generate a regex for this request. If an example number/string is included, match THAT exact format:\n\n${description.trim().slice(0, 500)}`;

    try {
      const res = await fetchWithBackoff(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: TOOL_MODELS.regexGenerator || TOOL_MODELS.codeExplainer,
          max_tokens: 2500,
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: `You are an expert regex engineer producing JavaScript-compatible (ECMAScript) regular expressions. When a user describes a pattern, you MUST analyze their input carefully and match the EXACT format they show — never assume US-centric defaults.

Output ONLY valid JSON:
{
  "pattern": "the regex string, WITHOUT surrounding slashes, valid in JavaScript's RegExp engine",
  "flags": "recommended flags string (subset of g, i, m, s, u, y)",
  "explanation": [{"token": "...", "meaning": "..."}],
  "testCases": {"shouldMatch": ["...", "...", "..."], "shouldNotMatch": ["...", "..."]},
  "warnings": ["Any assumptions"]
}

CRITICAL RULES:
1. Output ONLY valid JSON. No markdown, no backticks, no preamble, no thinking tags.
2. If the user provides an example (like "+919713163762" or "user@email.com"), analyze its structure EXACTLY:
   - What country code? (+91, +1, +44, etc.)
   - How many digits total?
   - Are there separators? (spaces, hyphens, dots?)
   - What grouping? (Indian 5-5, US 3-3-4, or none?)
3. NEVER assume US formats (3-3-4 grouping, +1 prefix) unless the example clearly shows it.
4. NEVER use ^ and $ anchors unless the user explicitly says "validate" or "exact match." Default to finding patterns anywhere in text.
5. For emails: TLD must be {2,} (2 or MORE letters). Support .com, .edu, .co.in, .ac.uk.
6. If the request is vague, produce the SIMPLEST pattern that matches the example and note assumptions in "warnings."
7. Escape backslashes properly in JSON string values (e.g. "\\\\d+" not "\\d+" inside the JSON string).
8. Do NOT use features unsupported by JavaScript RegExp: no possessive quantifiers (++, *+), no atomic groups (?>...), no recursion, no conditional patterns.
9. Include at least 3 shouldMatch and 2 shouldNotMatch examples that are realistic and genuinely exercise edge cases (not trivially obvious ones) — these will be programmatically executed against your own pattern to verify correctness, so they must be accurate.`,
            },
            { role: 'user', content: userPrompt },
          ],
        }),
      });
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      if (!raw) throw new Error(data?.error?.message || 'Empty response from AI.');

      const parsed = repairJson(raw);
      if (!parsed.pattern) throw new Error('AI response missing pattern.');

      // Verify the pattern actually compiles as JS before showing it.
      const cleanFlags = (parsed.flags || '').replace(/[^gimsuy]/g, '');
      try {
        // eslint-disable-next-line no-new
        new RegExp(parsed.pattern, cleanFlags);
      } catch (err) {
        throw new Error(`AI generated an invalid pattern: ${err.message}`);
      }

      setGenResult(parsed);
      setGenerating(false);

      // Self-validate against the AI's own test cases (async, doesn't block display).
      if (parsed.testCases && (parsed.testCases.shouldMatch?.length || parsed.testCases.shouldNotMatch?.length)) {
        setValidating(true);
        const result = await selfValidate(parsed.pattern, cleanFlags, parsed.testCases);
        setValidation(result);
        setValidating(false);
      }
    } catch (e) {
      setGenError(e.message || 'Failed to generate regex. Please try again.');
      setGenerating(false);
    }
  }

  function regenerateWithFixes() {
    if (!genResult || !validation) return;
    const failedMatch = validation.shouldMatch.filter((r) => !r.passed).map((r) => `"${r.value}" should match but did not`);
    const failedNotMatch = validation.shouldNotMatch.filter((r) => !r.passed).map((r) => `"${r.value}" should NOT match but did`);
    const feedback = [...failedMatch, ...failedNotMatch].join('; ') || validation.engineError || 'Pattern failed self-tests.';
    generateRegex(feedback);
  }

  function sendToTest(parsed) {
    setPattern(parsed.pattern);
    const newFlags = { g: false, i: false, m: false, s: false, u: false };
    for (const ch of (parsed.flags || '')) {
      if (newFlags.hasOwnProperty(ch)) newFlags[ch] = true;
    }
    setFlags(newFlags);
    setTab('test');
    setTimeout(() => testRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  function applyPreset(preset) {
    setPattern(preset.pattern);
    const newFlags = { g: false, i: false, m: false, s: false, u: false };
    for (const ch of preset.flags) {
      if (newFlags.hasOwnProperty(ch)) newFlags[ch] = true;
    }
    setFlags(newFlags);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  const renderHighlighted = useCallback(() => {
    if (!sampleText || matches.length === 0) {
      return <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{sampleText}</span>;
    }
    const parts = [];
    let lastIndex = 0;
    const matchColor = isDark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.18)';
    const matchBorder = isDark ? 'rgba(167,139,250,0.6)' : 'rgba(124,58,237,0.4)';

    matches.forEach((match, idx) => {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`txt-${idx}`} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {sampleText.slice(lastIndex, match.index)}
          </span>
        );
      }
      parts.push(
        <mark
          key={`match-${idx}`}
          title={`Match ${idx + 1} at index ${match.index}`}
          style={{
            background: matchColor,
            borderBottom: `2px solid ${matchBorder}`,
            borderRadius: '2px',
            color: 'inherit',
            padding: '0 2px',
            cursor: 'help',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {match.text}
        </mark>
      );
      lastIndex = match.index + match.length;
    });
    if (lastIndex < sampleText.length) {
      parts.push(
        <span key="txt-end" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {sampleText.slice(lastIndex)}
        </span>
      );
    }
    return <>{parts}</>;
  }, [sampleText, matches, isDark]);

  const inputStyle = {
    width: '100%',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
    borderRadius: '10px',
    padding: '12px 14px',
    color: isDark ? '#fff' : '#1a1a1a',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical',
    transition: 'border-color 0.2s',
  };

  const btnPrimary = {
    background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 22px',
    color: '#000',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };

  const btnSecondary = {
    background: 'transparent',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
    borderRadius: '8px',
    padding: '6px 14px',
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
  };

  const tabBtn = (active) => ({
    background: active ? ac : 'transparent',
    border: `1px solid ${active ? ac : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
    borderRadius: '8px',
    padding: '8px 18px',
    color: active ? '#000' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    fontWeight: 700,
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
  });

  // ── Book Promo Banner Component ──
  const BookBanner = () => (
    <div
      onClick={() => window.open(BOOK_LINK, '_blank', 'noopener,noreferrer')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 18px',
        marginBottom: '24px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(129,140,248,0.06))'
          : 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(99,102,241,0.04))',
        border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 20px rgba(167,139,250,0.1)'
          : '0 4px 20px rgba(124,58,237,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '2rem', flexShrink: 0 }}>📘</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#e2d9f3' : '#4c1d95', marginBottom: '3px', lineHeight: 1.4 }}>
          Want to master regex deeply?
        </div>
        <div style={{ fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
          Check out <strong style={{ color: ac }}>{BOOK_TITLE}</strong> — awarded one of the best regex books by BookAuthority.org 🏆
        </div>
      </div>
      <div style={{ fontSize: '1.2rem', flexShrink: 0, color: ac }}>→</div>
    </div>
  );

  const testCasePill = (item, isDark2) => (
    <div
      key={item.value}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        background: item.passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${item.passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.35)'}`,
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: isDark2 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)',
        fontFamily: "'Space Mono', monospace",
        wordBreak: 'break-all',
      }}
    >
      <span style={{ flexShrink: 0 }}>{item.passed ? '✓' : '✗'}</span>
      <span>{item.value}</span>
    </div>
  );

  return (
    <div>
      {/* ── Tab Switcher ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button onClick={() => setTab('generate')} style={tabBtn(tab === 'generate')}>✨ Generate</button>
        <button onClick={() => setTab('test')} style={tabBtn(tab === 'test')}>🧪 Test & Explain</button>
      </div>

      {/* ═══════════════════════════════════════
          TAB: GENERATE
      ═══════════════════════════════════════ */}
      {tab === 'generate' && (
        <div>
          {/* ── Book Promo ── */}
          <BookBanner />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
              Describe what you want to match
            </label>
            <textarea
              rows={4}
              placeholder="e.g., Indian phone numbers starting with +91 or 0, 10 digits, optional spaces or hyphens"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: '100px' }}
              maxLength={500}
            />
            <div style={{ textAlign: 'right', fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>
              {description.length}/500
            </div>
          </div>

          <button onClick={() => generateRegex()} disabled={generating || !description.trim()} style={{ ...btnPrimary, opacity: generating || !description.trim() ? 0.6 : 1, cursor: generating || !description.trim() ? 'not-allowed' : 'pointer' }}>
            {generating ? <><span className="spinner" style={{ width: '14px', height: '14px', display: 'inline-block' }} /> Generating...</> : '⚡ Generate Regex'}
          </button>

          {genError && (
            <div className="error-box" style={{ marginTop: '16px' }}>
              ⚠ {genError}
            </div>
          )}

          {genResult && (
            <div style={{ marginTop: '24px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.68rem', color: ac, letterSpacing: '0.12em' }}>◆ AI-GENERATED REGEX</div>

                {validating && (
                  <div style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontFamily: "'Space Mono', monospace" }}>
                    ⏳ Verifying against test cases...
                  </div>
                )}
                {!validating && validation && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontFamily: "'Space Mono', monospace",
                      color: validation.allPassed ? '#22c55e' : '#ef4444',
                      background: validation.allPassed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${validation.allPassed ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.3)'}`,
                    }}
                  >
                    {validation.allPassed ? '✓ Verified — all self-tests passed' : '✗ Self-tests failed'}
                  </div>
                )}
              </div>

              {genResult.pattern && detectPotentialReDoS(genResult.pattern) && (
                <div style={{ marginBottom: '16px', background: isDark ? 'rgba(255,180,0,0.12)' : '#fff8e1', border: `1px solid ${isDark ? 'rgba(255,180,0,0.25)' : '#b45309'}`, borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: isDark ? '#febc2e' : '#b45309' }}>
                  ⚠ This pattern has a structure that can cause catastrophic backtracking (nested quantifiers) on certain inputs. It's protected by a timeout in the Test tab, but consider simplifying it for production use.
                </div>
              )}

              {/* Pattern */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pattern</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <code style={{ flex: 1, background: isDark ? 'rgba(0,0,0,0.4)' : '#f3f4f6', padding: '12px 14px', borderRadius: '8px', fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', color: isDark ? '#a78bfa' : '#7c3aed', wordBreak: 'break-all', border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)'}` }}>
                    /{genResult.pattern}/{genResult.flags || ''}
                  </code>
                  <button onClick={() => copyToClipboard(genResult.pattern)} style={btnSecondary} title="Copy pattern">📋</button>
                </div>
              </div>

              {/* Explanation */}
              {genResult.explanation?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Token Breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {genResult.explanation.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'baseline', padding: '8px 12px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                        <code style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: ac, minWidth: '80px', flexShrink: 0 }}>{item.token}</code>
                        <span style={{ fontSize: '0.82rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', lineHeight: 1.5 }}>{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Cases — now with verified pass/fail, not just AI's word */}
              {genResult.testCases && (
                <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✓ Should Match</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(validation?.shouldMatch || genResult.testCases.shouldMatch?.map((t) => ({ value: t, passed: null })) || []).map((item) =>
                        item.passed === null ? (
                          <div key={item.value} style={{ padding: '6px 10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)', fontFamily: "'Space Mono', monospace", wordBreak: 'break-all' }}>{item.value}</div>
                        ) : (
                          testCasePill(item, isDark)
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✗ Should Not Match</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(validation?.shouldNotMatch || genResult.testCases.shouldNotMatch?.map((t) => ({ value: t, passed: null })) || []).map((item) =>
                        item.passed === null ? (
                          <div key={item.value} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)', fontFamily: "'Space Mono', monospace", wordBreak: 'break-all' }}>{item.value}</div>
                        ) : (
                          testCasePill(item, isDark)
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {genResult.warnings?.length > 0 && (
                <div style={{ background: isDark ? 'rgba(255,180,0,0.12)' : '#fff8e1', border: `1px solid ${isDark ? 'rgba(255,180,0,0.25)' : '#b45309'}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#febc2e' : '#b45309', marginBottom: '6px' }}>⚠ Edge Cases</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
                    {genResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => sendToTest(genResult)} style={btnPrimary}>🧪 Test This Regex →</button>
                {validation && !validation.allPassed && (
                  <button onClick={regenerateWithFixes} disabled={generating} style={{ ...btnSecondary, borderColor: '#ef4444', color: '#ef4444' }}>
                    🔁 Regenerate (fix failing cases)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB: TEST
      ═══════════════════════════════════════ */}
      {tab === 'test' && (
        <div ref={testRef}>
          {/* Subtle book link in Test tab too */}
          <div
            onClick={() => window.open(BOOK_LINK, '_blank', 'noopener,noreferrer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              padding: '10px 14px',
              background: isDark ? 'rgba(167,139,250,0.05)' : 'rgba(124,58,237,0.04)',
              border: `1px dashed ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📘</span>
            <span style={{ fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
              Deep dive into regex with <strong style={{ color: ac }}>{BOOK_TITLE}</strong>
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: ac, fontFamily: "'Space Mono', monospace" }}>View →</span>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Presets</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => applyPreset(p)} title={p.desc} style={btnSecondary}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pattern + Flags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '16px', alignItems: 'start' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
                Regex Pattern
              </label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. ^\d{4}-\d{2}-\d{2}$"
                style={{ ...inputStyle, fontFamily: "'Space Mono', monospace", resize: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
                Flags
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {FLAG_OPTIONS.map((f) => (
                  <label key={f.key} title={f.desc} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: flags[f.key] ? (isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.1)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'), border: `1px solid ${flags[f.key] ? ac : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', color: flags[f.key] ? ac : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontFamily: "'Space Mono', monospace", fontWeight: flags[f.key] ? 700 : 400 }}>
                    <input type="checkbox" checked={flags[f.key]} onChange={(e) => setFlags(prev => ({ ...prev, [f.key]: e.target.checked }))} style={{ accentColor: ac, cursor: 'pointer' }} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {redosRisk && (
            <div style={{ marginBottom: '16px', background: isDark ? 'rgba(255,180,0,0.12)' : '#fff8e1', border: `1px solid ${isDark ? 'rgba(255,180,0,0.25)' : '#b45309'}`, borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: isDark ? '#febc2e' : '#b45309' }}>
              ⚠ This pattern has nested/overlapping quantifiers that can cause catastrophic backtracking on adversarial input. Matching below is protected by a timeout, but avoid this shape in production regexes.
            </div>
          )}

          {/* Sample Text */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
              Sample Text
            </label>
            <textarea
              rows={6}
              placeholder="Paste text here to test your regex against it..."
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              style={{ ...inputStyle, minHeight: '140px' }}
            />
          </div>

          {/* Match Stats */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 14px', background: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)'}` }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', color: ac }}>Matches: </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a' }}>{checking ? '…' : matchCount}</span>
            </div>
            {matchError && (
              <div style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.8rem', fontFamily: "'Space Mono', monospace" }}>
                ⚠ {matchError}
              </div>
            )}
            {pattern && !matchError && (
              <button onClick={() => copyToClipboard(pattern)} style={btnSecondary}>📋 Copy Pattern</button>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontFamily: "'Space Mono', monospace", cursor: 'pointer' }}>
              <input type="checkbox" checked={replaceOn} onChange={(e) => setReplaceOn(e.target.checked)} style={{ accentColor: ac, cursor: 'pointer' }} />
              🔀 Replace mode
            </label>
          </div>

          {/* Highlighted Output */}
          {sampleText && (
            <div style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#f9fafb', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '10px', padding: '16px', minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', letterSpacing: '0.1em', marginBottom: '10px', textTransform: 'uppercase' }}>Live Match Preview</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', lineHeight: 1.7 }}>
                {renderHighlighted()}
              </div>
            </div>
          )}

          {/* Replace Panel */}
          {replaceOn && (
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
                Replacement (use $1, $2… for capture groups)
              </label>
              <input
                type="text"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="e.g. [$1]"
                style={{ ...inputStyle, fontFamily: "'Space Mono', monospace", marginBottom: '10px' }}
              />
              {replaceError ? (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.8rem', fontFamily: "'Space Mono', monospace" }}>
                  ⚠ {replaceError}
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <pre style={{ background: isDark ? 'rgba(0,0,0,0.3)' : '#f9fafb', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '10px', padding: '14px', fontSize: '0.82rem', fontFamily: "'Space Mono', monospace", color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '60px' }}>
                    {replaceResult || '(replacement output will appear here)'}
                  </pre>
                  {replaceResult && (
                    <button onClick={() => copyToClipboard(replaceResult)} style={{ position: 'absolute', top: '10px', right: '10px', ...btnSecondary, background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)' }}>📋</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Match Details Table */}
          {matches.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Match Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matches.map((m, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: m.groups?.length ? '8px' : 0 }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: ac, fontWeight: 700 }}>#{i + 1}</span>
                      <code style={{ flex: 1, fontFamily: "'Space Mono', monospace", fontSize: '0.82rem', color: isDark ? '#a78bfa' : '#7c3aed', wordBreak: 'break-all' }}>{m.text}</code>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>idx {m.index}</span>
                    </div>
                    {m.groups?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '28px' }}>
                        {m.groups.map((g, gi) => (
                          <div key={gi} style={{ padding: '4px 8px', background: isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.06)', borderRadius: '4px', fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontFamily: "'Space Mono', monospace" }}>
                            Group {gi + 1}: <span style={{ color: ac }}>{g || '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
