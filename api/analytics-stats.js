// api/analytics-stats.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ALLOWED_ORIGINS = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Fetch all keys and values from the analytics hash table
    const rawData = await redis.hgetall("zeroapi:analytics") || {};
    
    const stats = { views: {}, runs: {} };
    
    // Parse keys like "views:summarizer" or "runs:llama-3.3" back into structure format
    Object.entries(rawData).forEach(([key, value]) => {
      const [type, targetId] = key.split(':');
      if (type === 'views') stats.views[targetId] = parseInt(value) || 0;
      if (type === 'runs')  stats.runs[targetId]  = parseInt(value) || 0;
    });

    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
