// api/analytics-stats.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ALLOWED_ORIGINS = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const rawData = await redis.hgetall("zeroapi:analytics");
    const stats = { views: {}, runs: {} };
    
    if (rawData) {
      Object.entries(rawData).forEach(([key, value]) => {
        const parts = key.split(':');
        if (parts.length >= 2) {
          const type = parts[0];
          const targetId = parts.slice(1).join(':');
          if (type === 'views') stats.views[targetId] = parseInt(value) || 0;
          if (type === 'runs')  stats.runs[targetId]  = parseInt(value) || 0;
        }
      });
    }

    return res.status(200).json(stats);
  } catch (err) {
    console.error("[Analytics Stats Fetch Crash]:", err.message);
    return res.status(200).json({ views: {}, runs: {}, note: "Cache sync pending" });
  }
}
