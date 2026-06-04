// api/ai.js — Proxies all AI requests to Groq, keeps API key server-side

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

const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
];

if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:5173", "http://localhost:3000");
}

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
  // Simple hash — sufficient for analytics, not cryptography
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `u${Math.abs(hash)}`;
}

export default async function handler(req, res) {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    return res.status(413).json({ error: "Payload too large. Max 2MB." });
  }

  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  const { messages, model, max_tokens, temperature } = req.body;

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

  const clientIp = 
    req.headers["x-vercel-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",").pop()?.trim() ||
    req.socket.remoteAddress;

  const now = Date.now();

  const rateKey   = `rate_${clientIp}`;
  const rateEntry = global.rateMap.get(rateKey);
  if (rateEntry && now - rateEntry.windowStart < 300000) {
    if (rateEntry.count >= 20) {
      return res.status(429).json({ error: "Too many requests. Try again in a few minutes." });
    }
    rateEntry.count++;
  } else {
    global.rateMap.set(rateKey, { windowStart: now, count: 1 });
  }

  const isHeavyRequest = messages.some(m => typeof m.content === "string" && m.content.length > 1500);
  if (isHeavyRequest) {
    const heavyKey   = `heavy_${clientIp}`;
    const heavyEntry = global.heavyMap.get(heavyKey);
    if (heavyEntry && now - heavyEntry.windowStart < 120000) {
      if (heavyEntry.count >= 10) {
        return res.status(429).json({ error: "Large document limit reached. Please wait a moment before summarizing again." });
      }
      heavyEntry.count++;
    } else {
      global.heavyMap.set(heavyKey, { windowStart: now, count: 1 });
    }
  }

  try {
    const { res: groqRes, data } = await callGroq(safeModel, messages, safeMaxTokens, safeTemperature);
    
    if (groqRes.ok) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        
        const rawToolId = req.body.toolId;
        const safeToolId = (
          typeof rawToolId === "string" && 
          /^[a-z0-9_-]{1,32}$/i.test(rawToolId)
        ) ? rawToolId : null;
        
        const currentLabelId = safeModel;
        
        // ── Write to totals (existing) ─────────────────────────
        if (safeToolId) {
          const redisKey = `runs:${safeToolId} (${currentLabelId})`;
          await redis.hincrby("zeroapi:analytics", redisKey, 1);
        } else {
          await redis.hincrby("zeroapi:analytics", `runs:${currentLabelId}`, 1);
        }

        // ── Write to daily bucket (NEW) ────────────────────────
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const dailyKey = `zeroapi:analytics:daily:${today}`;
        const dailyField = safeToolId ? `runs:${safeToolId}` : `runs:${currentLabelId}`;
        await redis.hincrby(dailyKey, dailyField, 1);
        // Auto-expire daily keys after 30 days to save memory
        await redis.expire(dailyKey, 2592000);

        // ── Track live user (NEW) ─────────────────────────────
        const userHash = hashIp(clientIp);
        await redis.set(`active:${userHash}`, "1", { ex: 300 }); // 5 min TTL

      } catch (redisErr) {
        console.error("Telemetry write skip:", redisErr.message);
      }
    }

    return res.status(groqRes.status).json(data);
  } catch {
    return res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
}
