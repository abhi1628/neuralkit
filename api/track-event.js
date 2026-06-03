// api/track-event.js
const ALLOWED_ORIGINS = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, targetId } = req.body;
  if (!targetId) return res.status(400).json({ error: "Missing parameter tracks" });

  // Initialize unified telemetry structures inside runtime space memory locks
  if (!global.analyticsMap) global.analyticsMap = { views: {}, runs: {} };

  const storageKey = type === 'run' ? 'runs' : 'views';
  global.analyticsMap[storageKey][targetId] = (global.analyticsMap[storageKey][targetId] || 0) + 1;

  return res.status(200).json({ success: true });
}
