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

// Inject dev origins via env for local testing
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

export default async function handler(req, res) {
  // ── SIZE LIMIT ─────────────────────────────────────────────
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

  // ── Messages structure validation ──────────────────────────
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

  // ── Strict input validation ──────────────────────────────
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

  // ── Trust platform-specific forwarded headers ──────────────
  const clientIp = 
    req.headers["x-vercel-forwarded-for"]?.split(",")[0]?.trim() ||  // Vercel
    req.headers["cf-connecting-ip"] ||                                 // Cloudflare
    req.headers["x-forwarded-for"]?.split(",").pop()?.trim() ||      // Last IP = closest proxy
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
        
        // ── Sanitized telemetry ──────────────────────────────
        const rawToolId = req.body.toolId;
        const safeToolId = (
          typeof rawToolId === "string" && 
          /^[a-z0-9_-]{1,32}$/i.test(rawToolId)
        ) ? rawToolId : null;
        
        const currentLabelId = safeModel;
        
        if (safeToolId) {
          const redisKey = `runs:${safeToolId} (${currentLabelId})`;
          await redis.hincrby("zeroapi:analytics", redisKey, 1);
        } else {
          // Fallback legacy behavior if no valid toolId
          await redis.hincrby("zeroapi:analytics", `runs:${currentLabelId}`, 1);
        }
      } catch (redisErr) {
        console.error("Telemetry write skip:", redisErr.message);
      }
    }

    return res.status(groqRes.status).json(data);
  } catch {
    return res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
}
