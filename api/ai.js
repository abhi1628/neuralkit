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

const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
  "http://localhost:5173",
  "http://localhost:3000",
];

function initGlobals() {
  if (!global.rateMap)        global.rateMap   = new Map();
  if (!global.heavyMap)       global.heavyMap  = new Map();
  // Initialize analytics matrix storage mapping states in node runtime memory
  if (!global.analyticsMap)   global.analyticsMap = { views: {}, runs: {} };
  if (!global.cleanupStarted) {
    global.cleanupStarted = true;
    setInterval(() => {
      const t = Date.now();
      for (const [k, v] of global.rateMap.entries())  { if (t - v.windowStart > 300000) global.rateMap.delete(k); }
      for (const [k, v] of global.heavyMap.entries()) { if (t - v.windowStart > 120000) global.heavyMap.delete(k); }
    }, 600000);
  }
}

async function callGroq(modelName, messages, maxTokens, temperature) {
  const body = JSON.stringify({
    model:       modelName,
    messages,
    max_tokens:  maxTokens,
    temperature: temperature ?? 0.7,
  });

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      const fallbackRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

  const safeModel     = MODEL_WHITELIST.includes(model) ? model : DEFAULT_MODEL;
  const safeMaxTokens = Math.min(parseInt(max_tokens) || 1000, MAX_TOKENS_CAP);

  initGlobals();
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const now      = Date.now();

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
    const { res: groqRes, data } = await callGroq(safeModel, messages, safeMaxTokens, temperature);
    
    // Increment specific invocation model trackers inside memory map layers
    if (groqRes.ok && global.analyticsMap) {
      const currentLabelId = model || "default-model";
      global.analyticsMap.runs[currentLabelId] = (global.analyticsMap.runs[currentLabelId] || 0) + 1;
    }

    return res.status(groqRes.status).json(data);
  } catch {
    return res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
}
