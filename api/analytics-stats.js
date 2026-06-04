// api/analytics-stats.js
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

const ADMIN_SECRET = process.env.ZEROAPI_ADMIN_SECRET;

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Secret");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const providedSecret = req.headers["x-admin-secret"];
  if (!ADMIN_SECRET || providedSecret !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const rawData = await redis.hgetall("zeroapi:analytics");
    const stats = { views: {}, runs: {}, totalViews: 0, totalRuns: 0 };
    
    if (rawData && typeof rawData === 'object') {
      Object.entries(rawData).forEach(([key, value]) => {
        const colonIndex = key.indexOf(':');
        if (colonIndex === -1) return;
        
        const type = key.slice(0, colonIndex);
        const targetId = key.slice(colonIndex + 1);
        const numValue = parseInt(value, 10) || 0;
        
        if (type === 'views') {
          stats.views[targetId] = numValue;
          stats.totalViews += numValue;
        }
        if (type === 'runs') {
          stats.runs[targetId] = numValue;
          stats.totalRuns += numValue;
        }
      });
    }

    stats.grandTotal = stats.totalViews + stats.totalRuns;

    return res.status(200).json(stats);
  } catch (err) {
    console.error("[Analytics Stats Fetch Crash]:", err.message);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
}
