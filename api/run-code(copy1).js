// Existing compiler proxy — now with rate limiting and origin restriction
export default async function handler(req, res) {
  const allowedOrigins = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { compiler, code, input } = req.body;
  if (!compiler || !code) return res.status(400).json({ error: "Missing compiler or code" });

  // Rate limit: 15 runs per 5 min per IP
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const rateKey = `run_${clientIp}`;
  const now = Date.now();
  if (!global.rateMap) global.rateMap = new Map();
  const entry = global.rateMap.get(rateKey);
  if (entry && now - entry.windowStart < 300000) {
    if (entry.count >= 15) return res.status(429).json({ error: "Too many code runs. Try again in a few minutes." });
    entry.count++;
  } else {
    global.rateMap.set(rateKey, { windowStart: now, count: 1 });
  }

  try {
    const response = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
      method: "POST",
      headers: {
        "Authorization": process.env.COMPILER_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ compiler, code, input: input || "" }),
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: "Execution failed. Please try again." });
  }
}
