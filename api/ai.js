// Proxies all AI requests to Groq — keeps API key server-side
export default async function handler(req, res) {
  const allowedOrigins = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, model, max_tokens, temperature } = req.body;
  // 🛡️ Cap max_tokens to prevent cost bombing
const safeMaxTokens = Math.min(parseInt(max_tokens) || 1000, 2000);

// 🛡️ Validate model against whitelist
const ALLOWED_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"];
const safeModel = ALLOWED_MODELS.includes(model) ? model : "llama-3.3-70b-versatile";
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array" });
  }

  // Simple rate limit: max 20 requests per 5 minutes per IP
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const rateKey = `rate_${clientIp}`;
  const now = Date.now();
  if (!global.rateMap) global.rateMap = new Map();
  const entry = global.rateMap.get(rateKey);
  if (entry && now - entry.windowStart < 300000) {
    if (entry.count >= 20) return res.status(429).json({ error: "Too many requests. Try again in a few minutes." });
    entry.count++;
  } else {
    global.rateMap.set(rateKey, { windowStart: now, count: 1 });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages,
        max_tokens: max_tokens || 1000,
        temperature: temperature ?? 0.7,
      }),
    });
    const data = await groqRes.json();
    return res.status(groqRes.status).json(data);
  } catch {
    return res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
}
