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
  // ── CORS Headers (always set, before any early return) ──────
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ── Log every incoming request ──────────────────────────────
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  SUBSCRIBE API HIT                           ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log("  Method:     ", req.method);
  console.log("  Origin:     ", origin || "none");
  console.log("  IP:         ", req.headers["x-forwarded-for"] || req.socket.remoteAddress);
  console.log("  Body:       ", JSON.stringify(req.body));
  console.log("  SUPABASE_URL set? ", !!SUPABASE_URL);
  console.log("  SUPABASE_KEY set? ", !!SUPABASE_KEY);
  console.log("  SUPABASE_URL:      ", SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, "") : "MISSING");

  // ── Handle OPTIONS preflight ────────────────────────────────
  if (req.method === "OPTIONS") {
    console.log("  → OPTIONS preflight — returning 200");
    console.log("╚══════════════════════════════════════════════╝");
    return res.status(200).end();
  }

  // ── Reject non-POST ─────────────────────────────────────────
  if (req.method !== "POST") {
    console.log("  → REJECTED: Method not allowed (", req.method, ")");
    console.log("╚══════════════════════════════════════════════╝");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Rate limit: 3 attempts per IP per hour ────────────────
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const now = Date.now();
  const key = `sub_${clientIp}`;
  const entry = rateStore.get(key);
  
  console.log("  Rate limit key:", key);
  console.log("  Rate limit entry:", entry ? `${entry.count} attempts, window started ${new Date(entry.windowStart).toISOString()}` : "none");
  
  if (entry && now - entry.windowStart < 3600000) {
    if (entry.count >= 3) {
      console.log("  → REJECTED: Rate limited (", entry.count, "attempts)");
      console.log("╚══════════════════════════════════════════════╝");
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }
    entry.count++;
    console.log("  → Rate count incremented to:", entry.count);
  } else {
    rateStore.set(key, { windowStart: now, count: 1 });
    console.log("  → New rate window started");
  }

  // ── Extract and validate email ──────────────────────────────
  const { email, source } = req.body;
  console.log("  Extracted email:", email);
  console.log("  Extracted source:", source);

  if (!email || typeof email !== "string") {
    console.log("  → REJECTED: Email missing or not string");
    console.log("╚══════════════════════════════════════════════╝");
    return res.status(400).json({ error: "Email is required." });
  }

  const sanitizedEmail = email.trim().toLowerCase().slice(0, 254);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    console.log("  → REJECTED: Invalid email format:", sanitizedEmail);
    console.log("╚══════════════════════════════════════════════╝");
    return res.status(400).json({ error: "Invalid email address." });
  }

  console.log("  Sanitized email:", sanitizedEmail);

  const sanitizedSource = source
    ? source.trim().slice(0, 100).replace(/[<>]/g, "")
    : "blog";
  
  console.log("  Sanitized source:", sanitizedSource);

  // ── Build Supabase request ──────────────────────────────────
  const baseUrl = SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, "") : "";
  const base = `${baseUrl}/rest/v1/email_subscribers`;
  
  console.log("  Supabase endpoint:", base);

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log("  → REJECTED: Missing Supabase credentials");
    console.log("╚══════════════════════════════════════════════╝");
    return res.status(500).json({ error: "Server configuration error: missing database credentials." });
  }

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    // ── Step 1: Check if already subscribed ───────────────────
    const checkUrl = `${base}?email=eq.${encodeURIComponent(sanitizedEmail)}&select=id`;
    console.log("  Check URL:", checkUrl);
    
    console.log("  → Sending check request...");
    const checkRes = await fetch(checkUrl, { headers });
    
    console.log("  Check response status:", checkRes.status);
    console.log("  Check response headers:", JSON.stringify(Object.fromEntries(checkRes.headers)));

    if (!checkRes.ok) {
      const checkErrText = await checkRes.text();
      console.log("  → CHECK FAILED:", checkRes.status, checkErrText);
      throw new Error(`Supabase check failed: ${checkRes.status} — ${checkErrText}`);
    }

    const existing = await checkRes.json();
    console.log("  Existing records:", JSON.stringify(existing));

    if (existing && existing.length > 0) {
      console.log("  → ALREADY SUBSCRIBED");
      console.log("╚══════════════════════════════════════════════╝");
      return res.status(200).json({ message: "already_subscribed" });
    }

    // ── Step 2: Insert new subscriber ─────────────────────────
    console.log("  → Inserting new subscriber...");
    
    const insertRes = await fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: sanitizedEmail,
        source: sanitizedSource,
      }),
    });

    console.log("  Insert response status:", insertRes.status);
    console.log("  Insert response headers:", JSON.stringify(Object.fromEntries(insertRes.headers)));

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.log("  → INSERT FAILED:", insertRes.status, errText);
      
      // Handle unique constraint violation (23505)
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.code === "23505") {
          console.log("  → Duplicate detected via 23505, returning already_subscribed");
          console.log("╚══════════════════════════════════════════════╝");
          return res.status(200).json({ message: "already_subscribed" });
        }
      } catch {}
      
      throw new Error(`Supabase insert failed: ${insertRes.status} — ${errText}`);
    }

    const data = await insertRes.json();
    console.log("  Insert success data:", JSON.stringify(data));
    console.log("  → SUBSCRIBED SUCCESSFULLY");
    console.log("╚══════════════════════════════════════════════╝");
    
    return res.status(201).json({ message: "subscribed" });

  } catch (err) {
    console.log("  → CATCH BLOCK ERROR:", err.message);
    console.log("  Stack:", err.stack);
    console.log("╚══════════════════════════════════════════════╝");
    
    return res.status(500).json({ 
      error: "Failed to subscribe. Please try again.",
      debug: err.message 
    });
  }
}
