// api/track-event.js
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, targetId } = req.body;
  if (!targetId) return res.status(400).json({ error: "Missing parameter tracks" });

  try {
    const storageField = type === 'run' ? 'runs' : 'views';
    await redis.hincrby("zeroapi:analytics", `${storageField}:${targetId}`, 1);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Telemetry Write Crash]:", err.message);
    return res.status(500).json({ error: "Failed to write production tracker metrics safely." });
  }
}
