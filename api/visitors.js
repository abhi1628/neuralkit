// api/visitors.js — Self-hosted visitor counter with Redis + fallback
// Replaces external countapi.mileshilliard.com dependency

import { withSecurity, logSecurityEvent } from '../middleware/security.js';

const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
  "http://localhost:5173",
  "http://localhost:3000",
];

// In-memory fallback counter (per-instance, resets on deploy)
let memoryCounter = 0;
let memoryLastUpdate = Date.now();

/**
 * Get counter from Redis (primary) or memory (fallback)
 */
async function getCounter() {
  // Try Redis first
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const count = await redis.get('zeroapi:visitors:total');
      return count ? parseInt(count, 10) : 0;
    } catch (err) {
      console.warn('[ZeroAPI] Redis counter failed, using memory fallback:', err.message);
    }
  }

  // Fallback to memory
  return memoryCounter;
}

/**
 * Increment counter in Redis (primary) or memory (fallback)
 */
async function incrementCounter() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const newCount = await redis.incr('zeroapi:visitors:total');

      // Also track daily stats
      const today = new Date().toISOString().slice(0, 10);
      await redis.hincrby(`zeroapi:visitors:daily:${today}`, 'hits', 1);
      await redis.expire(`zeroapi:visitors:daily:${today}`, 2592000); // 30 days

      return parseInt(newCount, 10);
    } catch (err) {
      console.warn('[ZeroAPI] Redis increment failed, using memory fallback:', err.message);
    }
  }

  // Memory fallback
  memoryCounter++;
  return memoryCounter;
}

// 🛡️ Rate limit store (per-instance, acceptable for visitor counter)
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

async function visitorHandler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    logSecurityEvent(req, 'VISITOR_METHOD_NOT_ALLOWED', { method: req.method });
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 🛡️ Rate limit: 60 requests per minute per IP
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const rateKey = `vis_${clientIp}`;
  const entry = visitorStore.get(rateKey);

  if (entry && now - entry.windowStart < 60000) {
    if (entry.count >= 60) {
      logSecurityEvent(req, 'VISITOR_RATE_LIMITED', { ip: clientIp, count: entry.count });
      return res.status(429).json({ 
        error: "Too many requests. Try again later.",
        retryAfter: Math.ceil((entry.windowStart + 60000 - now) / 1000)
      });
    }
    entry.count++;
  } else {
    visitorStore.set(rateKey, { windowStart: now, count: 1 });
  }

  try {
    const count = await incrementCounter();
    return res.status(200).json({ 
      value: count,
      source: process.env.UPSTASH_REDIS_REST_URL ? 'redis' : 'memory',
      cached: false
    });
  } catch (err) {
    console.error("[ZeroAPI] Visitor counter error:", err);

    // Fallback: return current count without incrementing
    try {
      const current = await getCounter();
      return res.status(200).json({ 
        value: current,
        source: 'fallback',
        cached: true,
        warning: 'Counter temporarily unavailable'
      });
    } catch (fallbackErr) {
      return res.status(500).json({ error: "Visitor counter unavailable" });
    }
  }
}

// Export wrapped with security headers
export default withSecurity(visitorHandler);
