// api/ai.js — Proxies all AI requests to Groq, keeps API key server-side
//
// v3 changes (resume-suite upgrade):
//  • Forwards `response_format: {type:"json_object"}` (whitelisted) so structured tools get valid JSON
//  • Forwards `reasoning_effort` (low|medium|high) for gpt-oss models — stops reasoning tokens
//    from eating max_tokens (the cause of truncated JSON / empty replies)
//  • Optional/unsupported params are stripped automatically if Groq rejects them (never breaks a tool)
//  • Device-aware rate limiting: an anonymous X-Client-Id lets 100 students on one campus Wi-Fi
//    each get their own bucket, with a generous per-IP ceiling to bound abuse
//  • Rate-limit 429s carry a `retryAfter` (seconds) in the body so clients can fail fast
//  • In-memory fallback store is pruned (no unbounded growth)

const MODEL_WHITELIST = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",  // exact API ID — includes slash, no hyphen
];

const MODEL_FALLBACKS = {
  "openai/gpt-oss-120b": "openai/gpt-oss-20b",  // if 120B fails, use 20B (NOT qwen — thinking model burns all tokens)
  "openai/gpt-oss-20b":  "openai/gpt-oss-120b", // if 20B fails, upscale back
  "qwen/qwen3.6-27b":    "openai/gpt-oss-20b",  // if Qwen fails, use 20B instruct
};

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const MAX_TOKENS_CAP  = 8000;
const FETCH_TIMEOUT   = 45000; // reasoning models can take a little longer on big resumes
const MAX_BODY_SIZE   = 2 * 1024 * 1024; // 2MB

const ALLOWED_REASONING = ["low", "medium", "high"];

// Limits ---------------------------------------------------------------
const STD_WINDOW_MS   = 300000; // 5 min
const STD_PER_CLIENT  = 20;     // per device (or per IP when no device id is sent)
const STD_PER_IP_CAP  = 400;    // ceiling for a whole network (campus NAT) when device ids are used
const HEAVY_WINDOW_MS = 120000; // 2 min
const HEAVY_PER_CLIENT = 10;
const HEAVY_PER_IP_CAP = 120;

const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
];

if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:5173", "http://localhost:3000");
}

// ── Security Headers ──────────────────────────────────────────
function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
}

// ── CORS (strict) ─────────────────────────────────────────────
function applyCors(res, origin) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Id');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ── Rate Limiting (Redis + memory fallback) ──────────────────
async function checkRateLimit(bucketId, options = {}) {
  const { windowMs = STD_WINDOW_MS, maxRequests = STD_PER_CLIENT, keyPrefix = 'ai:std' } = options;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${keyPrefix}:${bucketId}:${windowStart}`;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetTime: windowStart + windowMs,
        total: current,
      };
    } catch (err) {
      console.warn('[ZeroAPI] Redis rate limit failed, using memory:', err.message);
    }
  }

  // In-memory fallback (per serverless instance) with periodic pruning
  if (!global._rateLimitStore) global._rateLimitStore = new Map();
  const store = global._rateLimitStore;
  if (store.size > 5000) {
    for (const [k, v] of store.entries()) {
      if (now - v.windowStart > 2 * 300000) store.delete(k);
    }
  }

  const entry = store.get(key);
  if (!entry || entry.windowStart !== windowStart) {
    store.set(key, { windowStart, count: 1 });
    return { allowed: true, remaining: maxRequests - 1, resetTime: windowStart + windowMs, total: 1 };
  }

  entry.count++;
  return {
    allowed: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetTime: windowStart + windowMs,
    total: entry.count,
  };
}

// ── Legacy cleanup (kept for compatibility) ────────────────────
function initGlobals() {
  if (!global.rateMap)        global.rateMap   = new Map();
  if (!global.heavyMap)       global.heavyMap  = new Map();
  if (!global.cleanupStarted) {
    global.cleanupStarted = true;
    setInterval(() => {
      const t = Date.now();
      for (const [k, v] of global.rateMap.entries())  { if (t - v.windowStart > 300000) global.rateMap.delete(k); }
      for (const [k, v] of global.heavyMap.entries()) { if (t - v.windowStart > 120000) global.heavyMap.delete(k); }
    }, 600000);
  }
}

async function fetchWithTimeout(url, options, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function postGroq(payload) {
  const res = await fetchWithTimeout(GROQ_URL, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  let data;
  try { data = await res.json(); } catch { data = { error: { message: `Bad upstream response (${res.status})` } }; }
  return { res, data };
}

// Rejections that mean "an optional parameter isn't supported" (not a real failure)
function isParamError(res, data) {
  if (res.ok || res.status !== 400) return false;
  const m = (data?.error?.message || "").toLowerCase();
  return /response_format|reasoning|include_reasoning|json|unsupported|not support|unknown (param|field)|invalid parameter/.test(m);
}

function isModelError(res, data) {
  const errMsg = data?.error?.message || "";
  return !res.ok && (
    errMsg.includes("decommissioned") ||
    errMsg.includes("no longer supported") ||
    errMsg.includes("model not found") ||
    errMsg.includes("does not exist")
  );
}

// Sends the request; if optional params are rejected, retries without them
async function sendWithParamFallback(modelName, messages, maxTokens, temperature, extras) {
  const base = { model: modelName, messages, max_tokens: maxTokens, temperature: temperature ?? 0.7 };
  const attempts = [];
  attempts.push({ ...base, ...extras });
  const { response_format } = extras;
  if (Object.keys(extras).length) {
    if (extras.reasoning_effort || extras.include_reasoning === false) {
      // drop reasoning knobs, keep JSON mode
      const keepJson = response_format ? { response_format } : {};
      attempts.push({ ...base, ...keepJson });
    }
    if (response_format) attempts.push({ ...base }); // bare
  }

  let last;
  for (const payload of attempts) {
    last = await postGroq(payload);
    if (!isParamError(last.res, last.data)) return last;
    console.warn('[ZeroAPI] Optional params rejected, retrying without them:', (last.data?.error?.message || '').slice(0, 160));
  }
  return last;
}

async function callGroq(modelName, messages, maxTokens, temperature, extras = {}) {
  let result = await sendWithParamFallback(modelName, messages, maxTokens, temperature, extras);

  if (isModelError(result.res, result.data)) {
    const fallback = MODEL_FALLBACKS[modelName];
    if (fallback) {
      console.warn(`[ZeroAPI] Model "${modelName}" unavailable. Falling back to "${fallback}".`);
      // qwen-only extras don't apply to the fallback, gpt-oss accepts them
      result = await sendWithParamFallback(fallback, messages, maxTokens, temperature, extras);
    }
  }
  return result;
}

// ── Helper: Hash IP for live users (privacy-safe) ────────────
function hashIp(ip) {
  if (!ip) return 'unknown';
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `u${Math.abs(hash)}`;
}

// ── Extract client IP with proxy awareness ────────────────────
function getClientIp(req) {
  return req.headers["x-vercel-forwarded-for"]?.split(",")[0]?.trim() ||
         req.headers["cf-connecting-ip"] ||
         req.headers["x-forwarded-for"]?.split(",").pop()?.trim() ||
         req.socket?.remoteAddress ||
         'unknown';
}

// Anonymous device id (random, generated in the browser, never tied to a person)
function getClientId(req) {
  const raw = req.headers["x-client-id"];
  return (typeof raw === "string" && /^[a-zA-Z0-9_-]{16,64}$/.test(raw)) ? raw : null;
}

// ── Security audit logger ────────────────────────────────────
function logSecurityEvent(req, type, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    ip: getClientIp(req),
    path: req.url,
    method: req.method,
    userAgent: req.headers['user-agent']?.slice(0, 200),
    origin: req.headers.origin,
    ...details,
  };
  console.log('[ZeroAPI Security]', JSON.stringify(logEntry));
}

// ── MAIN HANDLER (Vercel-compatible export) ───────────────────
export default async function handler(req, res) {
  applySecurityHeaders(res);

  const origin = req.headers.origin;
  applyCors(res, origin);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    logSecurityEvent(req, 'PAYLOAD_TOO_LARGE', { size: contentLength, max: MAX_BODY_SIZE });
    return res.status(413).json({ error: "Payload too large. Max 2MB." });
  }

  if (req.method !== "POST") {
    logSecurityEvent(req, 'METHOD_NOT_ALLOWED', { method: req.method });
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body && typeof req.body === "object") ? req.body : {};
  const { messages, model, max_tokens, temperature, toolId, response_format, reasoning_effort } = body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array" });
  }

  if (messages.length === 0 || messages.length > 50) {
    return res.status(400).json({ error: "messages must be an array with 1-50 items" });
  }

  const isValidMessage = (m) => (
    m &&
    typeof m === "object" &&
    !Array.isArray(m) &&
    typeof m.role === "string" &&
    ["system", "user", "assistant", "tool"].includes(m.role) &&
    (typeof m.content === "string" || (typeof m.content === "object" && m.content !== null))
  );

  if (!messages.every(isValidMessage)) {
    return res.status(400).json({ error: "Invalid message format" });
  }

  const safeModel = MODEL_WHITELIST.includes(model) ? model : DEFAULT_MODEL;

  const rawMaxTokens = Number(max_tokens);
  const safeMaxTokens = (
    Number.isFinite(rawMaxTokens) && rawMaxTokens > 0
  ) ? Math.min(Math.floor(rawMaxTokens), MAX_TOKENS_CAP) : 1000;

  const rawTemp = Number(temperature);
  const safeTemperature = (
    Number.isFinite(rawTemp) && rawTemp >= 0 && rawTemp <= 2
  ) ? rawTemp : 0.7;

  // Whitelisted optional params only — nothing else from the client reaches Groq
  const extras = {};
  if (response_format && typeof response_format === "object" && response_format.type === "json_object") {
    extras.response_format = { type: "json_object" };
  }
  if (typeof reasoning_effort === "string" && ALLOWED_REASONING.includes(reasoning_effort) && safeModel.startsWith("openai/gpt-oss")) {
    extras.reasoning_effort = reasoning_effort;
    extras.include_reasoning = false;
  }

  initGlobals();

  const clientIp = getClientIp(req);
  const clientId = getClientId(req);
  const now = Date.now();

  // Device bucket when an anonymous id is present, otherwise fall back to the IP (old behaviour)
  const bucket = clientId ? `c:${clientId}` : `ip:${clientIp}`;

  const stdCheck = await checkRateLimit(bucket, { windowMs: STD_WINDOW_MS, maxRequests: STD_PER_CLIENT, keyPrefix: 'ai:std' });
  if (!stdCheck.allowed) {
    logSecurityEvent(req, 'RATE_LIMITED', { type: 'standard', remaining: stdCheck.remaining, resetTime: stdCheck.resetTime, toolId: String(toolId || '').slice(0, 32) });
    res.setHeader('X-RateLimit-Remaining', stdCheck.remaining);
    res.setHeader('X-RateLimit-Reset', stdCheck.resetTime);
    return res.status(429).json({
      error: "Too many requests. Try again in a few minutes.",
      retryAfter: Math.max(1, Math.ceil((stdCheck.resetTime - now) / 1000)),
    });
  }

  // Network-wide ceiling (only meaningful when device ids are used; protects against id spoofing)
  if (clientId) {
    const ipCap = await checkRateLimit(`ip:${clientIp}`, { windowMs: STD_WINDOW_MS, maxRequests: STD_PER_IP_CAP, keyPrefix: 'ai:ipcap' });
    if (!ipCap.allowed) {
      logSecurityEvent(req, 'RATE_LIMITED', { type: 'ip-cap', resetTime: ipCap.resetTime });
      return res.status(429).json({
        error: "This network is sending a lot of requests. Please try again shortly.",
        retryAfter: Math.max(1, Math.ceil((ipCap.resetTime - now) / 1000)),
      });
    }
  }

  const isHeavyRequest = messages.some(m => typeof m.content === "string" && m.content.length > 1500);
  if (isHeavyRequest) {
    const heavyCheck = await checkRateLimit(bucket, { windowMs: HEAVY_WINDOW_MS, maxRequests: HEAVY_PER_CLIENT, keyPrefix: 'ai:heavy' });
    let heavyOk = heavyCheck.allowed;
    let heavyReset = heavyCheck.resetTime;
    if (heavyOk && clientId) {
      const heavyIp = await checkRateLimit(`ip:${clientIp}`, { windowMs: HEAVY_WINDOW_MS, maxRequests: HEAVY_PER_IP_CAP, keyPrefix: 'ai:heavyip' });
      heavyOk = heavyIp.allowed; heavyReset = heavyIp.resetTime;
    }
    if (!heavyOk) {
      logSecurityEvent(req, 'RATE_LIMITED', { type: 'heavy', resetTime: heavyReset });
      return res.status(429).json({
        error: "Large document limit reached. Please wait a moment and try again.",
        retryAfter: Math.max(1, Math.ceil((heavyReset - now) / 1000)),
      });
    }
  }

  try {
    const { res: groqRes, data } = await callGroq(safeModel, messages, safeMaxTokens, safeTemperature, extras);

    if (!groqRes.ok) {
      console.error('[ZeroAPI] Groq error:', groqRes.status, JSON.stringify(data?.error || data).slice(0, 300));
    }

    res.setHeader('X-RateLimit-Remaining', Math.max(0, stdCheck.remaining));

    if (groqRes.ok && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        const safeToolId = (
          typeof toolId === "string" && /^[a-z0-9_-]{1,32}$/i.test(toolId)
        ) ? toolId : null;

        const currentLabelId = safeModel;

        if (safeToolId) {
          await redis.hincrby("zeroapi:analytics", `runs:${safeToolId} (${currentLabelId})`, 1);
        } else {
          await redis.hincrby("zeroapi:analytics", `runs:${currentLabelId}`, 1);
        }

        const today = new Date().toISOString().slice(0, 10);
        const dailyKey = `zeroapi:analytics:daily:${today}`;
        await redis.hincrby(dailyKey, safeToolId ? `runs:${safeToolId}` : `runs:${currentLabelId}`, 1);
        await redis.expire(dailyKey, 2592000); // 30 days

        await redis.set(`active:${hashIp(clientIp)}`, "1", { ex: 300 }); // 5 min TTL
      } catch (redisErr) {
        console.error("Telemetry write skip:", redisErr.message);
      }
    }

    return res.status(groqRes.status).json(data);
  } catch (err) {
    logSecurityEvent(req, 'AI_SERVICE_ERROR', { error: err.message });
    return res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
}
