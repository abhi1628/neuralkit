// api/ai.js
// Production-Grade Centralized Multi-Provider LLM Gateway with Automatic Failovers

// 1. Centralized Matrix Map: Controls capabilities, providers, and fallbacks in one location
const CAPABILITY_ORCHESTRATION = {
  "large-model": [
    { provider: "groq", model: "llama-3.3-70b-versatile" },
    { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct" },
    { provider: "gemini", model: "gemini-1.5-pro" }
  ],
  "fast-model": [
    { provider: "groq", model: "llama-3.1-8b-instant" },
    { provider: "gemini", model: "gemini-1.5-flash" },
    { provider: "openrouter", model: "google/gemma-2-9b-it" }
  ],
  "coding-model": [
    { provider: "groq", model: "qwen-2.5-coder-32b" },
    { provider: "openrouter", model: "qwen/qwen-2.5-coder-32b-instruct" }
  ],
  "light-model": [
    { provider: "groq", model: "llama-3.1-8b-instant" },
    { provider: "gemini", model: "gemini-1.5-flash" }
  ]
};

export default async function handler(req, res) {
  // --- Secure CORS Handling Layout ---
  const allowedOrigins = ["https://zeroapi.in", "https://www.zeroapi.in", "http://localhost:5173", "http://localhost:3000"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, capability, max_tokens, temperature } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages array" });
  }

  // --- Rate Limit Execution Check (Preserved) ---
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const rateKey = `rate_${clientIp}`;
  const now = Date.now();
  if (!global.rateMap) global.rateMap = new Map();
  
  const entry = global.rateMap.get(rateKey);
  if (entry && now - entry.windowStart < 300000) {
    if (entry.count >= 20) return res.status(429).json({ error: "Too many requests. Try again in a few minutes." });
    entry.count++;
  } else {
    global.rateMap.set(rateKey, { windowStart: now, count: 1 });
  }

  // Determine appropriate routing pipeline order chain
  const requestedTier = capability || "fast-model";
  const fallbackRoutingChain = CAPABILITY_ORCHESTRATION[requestedTier] || CAPABILITY_ORCHESTRATION["fast-model"];

  // --- Core Resiliency Orchestrator Loop ---
  // Iterates through targets sequentially. If one breaks, it catches errors and falls back immediately.
  for (const executionTarget of fallbackRoutingChain) {
    try {
      let networkPayload = {};
      let downstreamApiUrl = "";
      let headerAuthorizationConfig = {};

      if (executionTarget.provider === "groq") {
        downstreamApiUrl = "https://api.groq.com/openai/v1/chat/completions";
        headerAuthorizationConfig = { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` };
        networkPayload = {
          model: executionTarget.model,
          messages,
          max_tokens: Math.min(parseInt(max_tokens) || 1000, 2000),
          temperature: temperature ?? 0.3
        };
      } 
      else if (executionTarget.provider === "gemini") {
        // Translate format schema structure into Google AI specification standards
        downstreamApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${executionTarget.model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
        headerAuthorizationConfig = {};
        
        // Simple structural mapping from OpenAI format to Google API schema format
        const formattedGeminiContents = messages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));
        
        networkPayload = { contents: formattedGeminiContents };
      } 
      else if (executionTarget.provider === "openrouter") {
        downstreamApiUrl = "https://openrouter.ai/api/v1/chat/completions";
        headerAuthorizationConfig = {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://zeroapi.in",
          "X-Title": "ZeroAPI Learn Platform"
        };
        networkPayload = {
          model: executionTarget.model,
          messages,
          max_tokens: parseInt(max_tokens) || 1000
        };
      }

      // Execute request
      const upstreamNetworkResponse = await fetch(downstreamApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headerAuthorizationConfig },
        body: JSON.stringify(networkPayload)
      });

      if (!upstreamNetworkResponse.ok) {
        throw new Error(`Provider ${executionTarget.provider} returned bad status status code: ${upstreamNetworkResponse.status}`);
      }

      const completedData = await upstreamNetworkResponse.json();
      
      // --- Normalize Output Formats ---
      // Standardizes response object layout across providers to protect frontend consumers
      if (executionTarget.provider === "gemini") {
        const textOutput = completedData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return res.status(200).json({
          choices: [{ message: { content: textOutput } }],
          provider: "gemini",
          model: executionTarget.model
        });
      }

      // Format already standardized by Groq and OpenRouter specifications
      return res.status(200).json({
        ...completedData,
        provider: executionTarget.provider,
        model: executionTarget.model
      });

    } catch (failoverError) {
      console.warn(`[Gateway Failover Alert]: Target provider ${executionTarget.provider} tracking model ${executionTarget.model} failed. Error: ${failoverError.message}. Proceeding down target chain matrix...`);
      // Keep loop moving to next valid target container safely
    }
  }

  // Fallbacks fully exhausted
  return res.status(502).json({ error: "All AI service integration backends are currently saturated. Please retry shortly." });
}
