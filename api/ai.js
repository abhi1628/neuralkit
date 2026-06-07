// api/ai.js — Proxies all AI requests to Groq, keeps API key server-side
// UPDATED: Uses security middleware + Redis-backed rate limiting

import { withStrictCors, createRateLimiter, logSecurityEvent } from '../middleware/security.js';

const MODEL_WHITELIST = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

const MODEL_FALLBACKS = {
  "llama-3.3-70b-versatile": "llama-3.1-8b-instant",
  "llama-3.1-8b-instant":    "llama-3.3-70b-versatile",
};

const DEFAULT_MODEL   = "llama-3.3-70b-versatile";
const MAX_TOKENS_CAP  = 2000;
const FETCH_TIMEOUT   = 30000; // 30 seconds
const MAX_BODY_SIZE   = 2 * 1024 * 1024; // 2MB

// Create rate limiters with Redis cross-instance consistency
const standardRateLimiter = createRateLimiter({
  windowMs: 300000,    // 5 minutes
  maxRequests: 20,     // 20 requests per 5 min
  keyPrefix: 'ai:std'
});

const heavyRateLimiter = createRateLimiter({
  windowMs: 120000,    // 2 minutes
  maxRequests: 10,     // 10 heavy requests per 2 min
  keyPrefix: 'ai:heavy'
});

function initGlobals() {
  // Legacy cleanup — kept for backward compatibility but Redis is primary now
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
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function callGroq(modelName, messages, maxTokens, temperature) {
  const body = JSON.stringify({
    model:       modelName,
    messages,
    max_tokens:  maxTokens,
    temperature: temperature ?? 0.7,
  });

  const groqRes = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body,
  });

  const data = await groqRes.json();
  const errMsg = data?.error?.message || "";
  const isModelError = !groqRes.ok && (
    errMsg.includes("decommissioned") ||
    errMsg.includes("no longer supported") ||
    errMsg.includes("model not found") ||
    errMsg.includes("does not exist")
  );

  if (isModelError) {
    const fallback = MODEL_FALLBACKS[modelName];
    if (fallback) {
      console.warn(`[ZeroAPI] Model "${modelName}" unavailable. Falling back to "${fallback}".`);
      const fallbackRes = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({ model: fallback, messages, max_tokens: maxTokens, temperature: temperature ?? 0.7 }),
      });
      const fallbackData = await fallbackRes.json();
      return { res: fallbackRes, data: fallbackData };
    }
  }

  return { res: groqRes, data };
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

// ── Main handler (wrapped with strict CORS + security headers) ─
async function aiHandler(req, res) {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    logSecurityEvent(req, 'PAYLOAD_TOO_LARGE', { size: contentLength, max: MAX_BODY_SIZE });
    return res.status(413).json({ error: "Payload too large. Max 2MB." });
  }

  if (req.method !== "POST") {
    logSecurityEvent(req, 'METHOD_NOT_ALLOWED', { method: req.method });
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, model, max_tokens, temperature, toolId } = req.body;

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
    Number.isFinite(rawMaxTokens) && 
    rawMaxTokens > 0 && 
    rawMaxTokens <= MAX_TOKENS_CAP
  ) ? Math.floor(rawMaxTokens) : 1000;

  const rawTemp = Number(temperature);
  const safeTemperature = (
    Number.isFinite(rawTemp) && 
    rawTemp >= 0 && 
    rawTemp <= 2
  ) ? rawTemp : 0.7;

  initGlobals();

  const clientIp = getClientIp(req);
  const now = Date.now();

  // ── Redis-backed rate limiting (cross-instance) ────────────
  const stdCheck = await standardRateLimiter(clientIp);
  if (!stdCheck.allowed) {
    logSecurityEvent(req, 'RATE_LIMITED', { 
      type: 'standard', 
      remaining: stdCheck.remaining, 
      resetTime: stdCheck.resetTime 
    });
    res.setHeader('X-RateLimit-Remaining', stdCheck.remaining);
    res.setHeader('X-RateLimit-Reset', stdCheck.resetTime);
    return res.status(429).json({ 
      error: "Too many requests. Try again in a few minutes.",
      retryAfter: Math.ceil((stdCheck.resetTime - now) / 1000)
    });
  }

  const isHeavyRequest = messages.some(m => typeof m.content === "string" && m.content.length > 1500);
  if (isHeavyRequest) {
    const heavyCheck = await heavyRateLimiter(clientIp);
    if (!heavyCheck.allowed) {
      logSecurityEvent(req, 'RATE_LIMITED', { 
        type: 'heavy', 
        remaining: heavyCheck.remaining, 
        resetTime: heavyCheck.resetTime 
      });
      res.setHeader('X-RateLimit-Remaining', heavyCheck.remaining);
      res.setHeader('X-RateLimit-Reset', heavyCheck.resetTime);
      return res.status(429).json({ 
        error: "Large document limit reached. Please wait a moment before summarizing again.",
        retryAfter: Math.ceil((heavyCheck.resetTime - now) / 1000)
      });
    }
  }

  try {
    const { res: groqRes, data } = await callGroq(safeModel, messages, safeMaxTokens, safeTemperature);

    // Add rate limit headers to successful responses
    res.setHeader('X-RateLimit-Remaining', stdCheck.remaining - 1);

    if (groqRes.ok) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        const rawToolId = toolId;
        const safeToolId = (
          typeof rawToolId === "string" && 
          /^[a-z0-9_-]{1,32}$/i.test(rawToolId)
        ) ? rawToolId : null;

        const currentLabelId = safeModel;

        // ── Write to totals ────────────────────────────────────
        if (safeToolId) {
          const redisKey = `runs:${safeToolId} (${currentLabelId})`;
          await redis.hincrby("zeroapi:analytics", redisKey, 1);
        } else {
          await redis.hincrby("zeroapi:analytics", `runs:${currentLabelId}`, 1);
        }

        // ── Write to daily bucket ──────────────────────────────
        const today = new Date().toISOString().slice(0, 10);
        const dailyKey = `zeroapi:analytics:daily:${today}`;
        const dailyField = safeToolId ? `runs:${safeToolId}` : `runs:${currentLabelId}`;
        await redis.hincrby(dailyKey, dailyField, 1);
        await redis.expire(dailyKey, 2592000); // 30 days

        // ── Track live user ────────────────────────────────────
        const userHash = hashIp(clientIp);
        await redis.set(`active:${userHash}`, "1", { ex: 300 }); // 5 min TTL

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

// Export wrapped with strict CORS + security headers
export default withStrictCors(aiHandler);
