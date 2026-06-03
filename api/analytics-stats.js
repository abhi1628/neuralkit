// api/analytics-stats.js
const ALLOWED_ORIGINS = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Default empty state protection handling logs
  const stats = global.analyticsMap || { views: {}, runs: {} };
  return res.status(200).json(stats);
}
