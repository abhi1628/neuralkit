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
    // ── Fetch totals ─────────────────────────────────────────
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

    // ── Fetch last 7 days trends (NEW) ───────────────────────
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayData = await redis.hgetall(`zeroapi:analytics:daily:${dateStr}`);
      
      let dayViews = 0;
      let dayRuns = 0;
      
      if (dayData && typeof dayData === 'object') {
        Object.entries(dayData).forEach(([key, value]) => {
          const num = parseInt(value, 10) || 0;
          if (key.startsWith('views:')) dayViews += num;
          if (key.startsWith('runs:')) dayRuns += num;
        });
      }
      
      dailyTrends.push({
        date: dateStr,
        views: dayViews,
        runs: dayRuns,
        total: dayViews + dayRuns
      });
    }

    // ── Fetch live users count (NEW) ─────────────────────────
    let liveUsers = 0;
    try {
      // Scan for active keys (Upstash Redis doesn't support SCAN well, use keys pattern)
      const activeKeys = await redis.keys('active:*');
      liveUsers = activeKeys?.length || 0;
    } catch (e) {
      console.error("Live users count error:", e.message);
    }

    // ── Parse tool breakdown from runs (NEW) ─────────────────
    const toolBreakdown = {};
    Object.entries(stats.runs).forEach(([key, count]) => {
      // Parse "toolId (modelName)" or just "modelName"
      const match = key.match(/^([^(]+)\s*\(([^)]+)\)$/);
      if (match) {
        const toolName = match[1].trim();
        const modelName = match[2].trim();
        if (!toolBreakdown[toolName]) toolBreakdown[toolName] = { count: 0, models: {} };
        toolBreakdown[toolName].count += count;
        toolBreakdown[toolName].models[modelName] = (toolBreakdown[toolName].models[modelName] || 0) + count;
      } else {
        // Legacy format: just model name
        if (!toolBreakdown[key]) toolBreakdown[key] = { count: 0, models: { [key]: count } };
        toolBreakdown[key].count += count;
      }
    });

    return res.status(200).json({
      ...stats,
      dailyTrends,
      liveUsers,
      toolBreakdown
    });
  } catch (err) {
    console.error("[Analytics Stats Fetch Crash]:", err.message);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
}
