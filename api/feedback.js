// api/feedback.js — Supabase-backed shared feedback
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

const ALLOWED_ORIGINS = [
  "https://zeroapi.in",
  "https://www.zeroapi.in",
  "http://localhost:5173",
  "http://localhost:3000",
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const base = `${SUPABASE_URL}/rest/v1/feedback`;
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };

  // GET — fetch latest 20 feedbacks
  if (req.method === "GET") {
    try {
      const r = await fetch(`${base}?select=*&order=created_at.desc&limit=20`, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to fetch feedback" });
    }
  }

  // POST — submit new feedback
  if (req.method === "POST") {
    const { name, rating, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }

    // Basic spam check — message must be at least 5 chars
    if (message.trim().length < 5) {
      return res.status(400).json({ error: "Message too short" });
    }

    try {
      const r = await fetch(base, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name?.trim() || "Anonymous",
          rating: parseInt(rating),
          message: message.trim().slice(0, 500),
        }),
      });
      const data = await r.json();
      return res.status(201).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to save feedback" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
