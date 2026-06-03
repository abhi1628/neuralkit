// api/track-event.js
import { Redis } from '@upstash/redis';

// Initialize the permanent Upstash cloud datastore instance using secure system keys
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ALLOWED_ORIGINS = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];

export default async function handler(req, res) {
  // --- Secure CORS Handling Layout ---
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, targetId } = req.body;
  if (!targetId) return res.status(400).json({ error: "Missing parameter tracks" });

  try {
    // Standardize storage keys matching your analytics dashboard layout specification mapping
    const storageField = type === 'run' ? 'runs' : 'views';
    
    // Atomically increment the specific sub-field tracking sub-key inside a structured Redis Hash
    await redis.hincrby("zeroapi:analytics", `${storageField}:${targetId}`, 1);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Telemetry Write Crash]:", err.message);
    return res.status(500).json({ error: "Failed to write production tracker metrics safely." });
  }
}
