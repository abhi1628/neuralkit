// api/analytics-stats.js

const ALLOWED_ORIGINS = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];

export default async function handler(req, res) {
  // ── Secure CORS Handling Layer ──
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ── Safe Inline CommonJS Loader ──
    // This prevents module bundling type crashes inside Vercel's engine
    const { Redis } = require('@upstash/redis');
    
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Fetch all keys and values from our permanent analytics hash table matrix
    const rawData = await redis.hgetall("zeroapi:analytics") || {};
    
    const stats = { views: {}, runs: {} };
    
    // Parse keys like "views:summarizer" or "runs:llama-3.3" back into dashboard arrays
    Object.entries(rawData).forEach(([key, value]) => {
      const [type, targetId] = key.split(':');
      if (type === 'views' && targetId) stats.views[targetId] = parseInt(value) || 0;
      if (type === 'runs' && targetId)  stats.runs[targetId]  = parseInt(value) || 0;
    });

    return res.status(200).json(stats);
  } catch (err) {
    console.error("[Analytics Stats Fetch Crash]:", err.message);
    return res.status(500).json({ 
      error: "Failed to collect metrics.", 
      details: err.message 
    });
  }
}
