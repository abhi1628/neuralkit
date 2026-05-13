// Proxies visitor count to avoid CORS issues client-side
export default async function handler(req, res) {
  const allowedOrigins = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const r = await fetch("https://countapi.mileshilliard.com/api/v1/hit/zeroapi-in-visits");
    const data = await r.json();
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: "Visitor counter unavailable" });
  }
}
