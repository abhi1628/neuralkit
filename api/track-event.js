// api/track-event.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
];
if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push("http://localhost:5173", "http://localhost:3000");
}

const MAX_BODY_SIZE = 64 * 1024; // 64KB
const VALID_TYPES = new Set(['run', 'view']);
const TARGET_ID_REGEX = /^[a-z0-9_-]{1,64}$/i;

const eventRateMap = new Map();
setInterval(() => {
  const t = Date.now();
  for (const [k, v] of eventRateMap.entries()) {
    if (t - v.windowStart > 60000) eventRateMap.delete(k);
  }
}, 300000);

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

export default async function handler(req, res) {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    return res.status(413).json({ error: "Payload too large" });
  }

  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, targetId } = req.body;

  if (!targetId || typeof targetId !== 'string') {
    return res.status(400).json({ error: "Missing or invalid targetId" });
  }
  if (!VALID_TYPES.has(type)) {
    return res.status(400).json({ error: "Invalid type. Must be 'run' or 'view'" });
  }
  if (!TARGET_ID_REGEX.test(targetId)) {
    return res.status(400).json({ error: "Invalid targetId format" });
  }

  const clientIp = 
    req.headers["x-vercel-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",").pop()?.trim() ||
    req.socket.remoteAddress;

  const now = Date.now();
  const rateKey = `evt_${clientIp}`;
  const entry = eventRateMap.get(rateKey);

  if (entry && now - entry.windowStart < 60000) {
    if (entry.count >= 30) {
      return res.status(429).json({ error: "Too many events" });
    }
    entry.count++;
  } else {
    eventRateMap.set(rateKey, { windowStart: now, count: 1 });
  }

  try {
    const storageField = type === 'run' ? 'runs' : 'views';
    
    // ── Write to totals (existing) ───────────────────────────
    await redis.hincrby("zeroapi:analytics", `${storageField}:${targetId}`, 1);

    // ── Write to daily bucket (NEW) ──────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    const dailyKey = `zeroapi:analytics:daily:${today}`;
    await redis.hincrby(dailyKey, `${storageField}:${targetId}`, 1);
    await redis.expire(dailyKey, 2592000); // 30 days

    // ── Track live user (NEW) ────────────────────────────────
    const userHash = hashIp(clientIp);
    await redis.set(`active:${userHash}`, "1", { ex: 300 }); // 5 min TTL

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Telemetry Write Crash]:", err.message);
    return res.status(500).json({ error: "Failed to write tracker metrics" });
  }
}
