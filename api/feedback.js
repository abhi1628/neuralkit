// api/feedback.js — Secure, anonymized feedback API with fixed rate limits
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Rate limit store
if (!global.feedbackRateStore) global.feedbackRateStore = new Map();
const rateStore = global.feedbackRateStore;

// Clean old entries every 10 minutes
if (!global.feedbackCleanupStarted) {
  global.feedbackCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateStore.entries()) {
      if (now - entry.windowStart > 3600000) rateStore.delete(key);
    }
  }, 600000);
}

function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
}

export default async function handler(req, res) {
  applySecurityHeaders(res);
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const now = Date.now();

  // Rate limit GET: 120 per hour per IP (supports 30s polling comfortably)
  if (req.method === "GET") {
    const getKey = `get_${clientIp}`;
    const getEntry = rateStore.get(getKey);
    if (getEntry && now - getEntry.windowStart < 3600000) {
      if (getEntry.count >= 120) {
        res.setHeader('Retry-After', Math.ceil((getEntry.windowStart + 3600000 - now) / 1000));
        return res.status(429).json({ error: "Too many requests. Try again later." });
      }
      getEntry.count++;
    } else {
      rateStore.set(getKey, { windowStart: now, count: 1 });
    }
  }

  // Rate limit POST: 5 per hour per IP (slightly more generous)
  if (req.method === "POST") {
    const postKey = `post_${clientIp}`;
    const postEntry = rateStore.get(postKey);
    if (postEntry && now - postEntry.windowStart < 3600000) {
      if (postEntry.count >= 5) {
        res.setHeader('Retry-After', Math.ceil((postEntry.windowStart + 3600000 - now) / 1000));
        return res.status(429).json({ error: "Too many submissions. Try again later." });
      }
      postEntry.count++;
    } else {
      rateStore.set(postKey, { windowStart: now, count: 1 });
    }
  }

  const base = `${SUPABASE_URL}/rest/v1/feedback`;
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };

  // GET — fetch and SANITIZE feedback
  if (req.method === "GET") {
    try {
      const r = await fetch(`${base}?select=*&order=created_at.desc&limit=20`, { headers });
      const data = await r.json();

      // 🛡️ SANITIZE: Mask names, limit message length, strip HTML
      const sanitized = data.map(item => ({
        id: item.id,
        name: item.name === "Anonymous" || !item.name 
          ? "Anonymous" 
          : item.name.split(" ").map(part => part.charAt(0) + "***").join(" "),
        rating: item.rating,
        message: item.message 
          ? item.message.replace(/[<>]/g, "").replace(/javascript:/gi, "").slice(0, 200)
          : "",
        created_at: item.created_at,
      }));

      // Cache control: allow 15s client-side caching to reduce redundant fetches
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
      return res.status(200).json(sanitized);
    } catch (err) {
      console.error("Feedback fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch feedback" });
    }
  }

  // POST — submit new feedback
  if (req.method === "POST") {
    const { name, rating, message } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }

    if (message && message.trim().length > 500) {
      return res.status(400).json({ error: "Message too long (max 500 characters)" });
    }

    const sanitizedName = name 
      ? name.trim().slice(0, 50).replace(/[<>]/g, "").replace(/[^\w\s.-]/g, "") || "Anonymous"
      : "Anonymous";

    const sanitizedMessage = message 
      ? message.trim().slice(0, 500).replace(/[<>]/g, "").replace(/javascript:/gi, "")
      : "";

    try {
      const r = await fetch(base, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: sanitizedName,
          rating: parseInt(rating),
          message: sanitizedMessage,
        }),
      });
      const data = await r.json();
      return res.status(201).json(data);
    } catch (err) {
      console.error("Feedback save error:", err);
      return res.status(500).json({ error: "Failed to save feedback" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
