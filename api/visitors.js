// api/visitors.js — Secure visitor counter with rate limiting
const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
  "http://localhost:5173",
  "http://localhost:3000",
];

// 🛡️ Rate limit store
if (!global.visitorRateStore) global.visitorRateStore = new Map();
const visitorStore = global.visitorRateStore;

// Clean old entries every 10 minutes
if (!global.visitorCleanupStarted) {
  global.visitorCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of visitorStore.entries()) {
      if (now - entry.windowStart > 3600000) visitorStore.delete(key);
    }
  }, 600000);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  // 🛡️ Rate limit: 60 requests per minute per IP
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const now = Date.now();
  const rateKey = `vis_${clientIp}`;
  const entry = visitorStore.get(rateKey);

  if (entry && now - entry.windowStart < 60000) {
    if (entry.count >= 60) {
      return res.status(429).json({ error: "Too many requests. Try again later." });
    }
    entry.count++;
  } else {
    visitorStore.set(rateKey, { windowStart: now, count: 1 });
  }

  try {
    const r = await fetch("https://countapi.mileshilliard.com/api/v1/hit/zeroapi-in-visits");
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Visitor counter error:", err);
    return res.status(500).json({ error: "Visitor counter unavailable" });
  }
}
