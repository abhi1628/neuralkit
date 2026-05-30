// api/subscribe.js — Email subscribe API for ZeroAPI blog articles
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Rate limit store: 3 subscribe attempts per IP per hour
if (!global.subscribeRateStore) global.subscribeRateStore = new Map();
const rateStore = global.subscribeRateStore;

if (!global.subscribeCleanupStarted) {
  global.subscribeCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateStore.entries()) {
      if (now - entry.windowStart > 3600000) rateStore.delete(key);
    }
  }, 600000);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit: 3 attempts per IP per hour
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const now = Date.now();
  const key = `sub_${clientIp}`;
  const entry = rateStore.get(key);
  if (entry && now - entry.windowStart < 3600000) {
    if (entry.count >= 3) return res.status(429).json({ error: "Too many attempts. Try again later." });
    entry.count++;
  } else {
    rateStore.set(key, { windowStart: now, count: 1 });
  }

  const { email, source } = req.body;

  // Validate email
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required." });
  }
  const sanitizedEmail = email.trim().toLowerCase().slice(0, 254);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const sanitizedSource = source
    ? source.trim().slice(0, 100).replace(/[<>]/g, "")
    : "blog";

  const base = `${SUPABASE_URL}/rest/v1/email_subscribers`;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    // Check if already subscribed
    const checkRes = await fetch(
      `${base}?email=eq.${encodeURIComponent(sanitizedEmail)}&select=id`,
      { headers }
    );
    const existing = await checkRes.json();
    if (existing && existing.length > 0) {
      return res.status(200).json({ message: "already_subscribed" });
    }

    // Insert new subscriber
    const insertRes = await fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: sanitizedEmail,
        source: sanitizedSource,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.json();
      // Supabase unique constraint violation
      if (err?.code === "23505") {
        return res.status(200).json({ message: "already_subscribed" });
      }
      throw new Error(err?.message || "Insert failed");
    }

    return res.status(201).json({ message: "subscribed" });
  } catch (err) {
  console.error("Subscribe error:", err);
  // Return actual error for debugging (remove in production later)
  return res.status(500).json({ 
    error: "Failed to subscribe. Please try again.",
    debug: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

}
