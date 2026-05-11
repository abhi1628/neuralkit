import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

const GROQ_API_URL = "/api/ai";
const VISITOR_API_URL = "/api/visitors";
const GA_ID = "G-FTQS5X9WF3";
const WORD_LIMIT = 8000;
const WORD_LIMIT_UPLOAD = 12000;

// ── EXAMPLES for "Try Example" feature ──────────────────────
const EXAMPLES = {
  summarizer: `Transformer architectures have revolutionized natural language processing since their introduction in "Attention Is All You Need" (Vaswani et al., 2017). Unlike recurrent neural networks that process sequences sequentially, transformers rely entirely on self-attention mechanisms to capture global dependencies in parallel. The key innovation is the multi-head attention layer, which allows the model to attend to different representation subspaces at different positions. When a sequence is processed, each token can directly attend to every other token, creating a fully connected graph of relationships. This parallelism enables training on unprecedented scale — GPT-4 reportedly uses over 1.8 trillion parameters across a mixture-of-experts architecture. The self-attention mechanism computes Query, Key, and Value matrices from input embeddings, then applies scaled dot-product attention: Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V. Positional encodings are added to inject sequence order information since the architecture itself is permutation-invariant. Layer normalization and residual connections stabilize training across deep stacks of 12-96 layers. Transformers have since expanded beyond NLP to computer vision (ViT), protein folding (AlphaFold2), and multimodal systems (CLIP, DALL-E), demonstrating their remarkable generality across domains.`,

  codeExplainer: `import torch
import torch.nn as nn

class SelfAttention(nn.Module):
    def __init__(self, embed_size, heads):
        super().__init__()
        self.embed_size = embed_size
        self.heads = heads
        self.head_dim = embed_size // heads
        self.values = nn.Linear(embed_size, embed_size)
        self.keys = nn.Linear(embed_size, embed_size)
        self.queries = nn.Linear(embed_size, embed_size)
        self.fc_out = nn.Linear(embed_size, embed_size)

    def forward(self, values, keys, query, mask):
        N = query.shape[0]
        value_len, key_len, query_len = values.shape[1], keys.shape[1], query.shape[1]
        values = self.values(values).view(N, value_len, self.heads, self.head_dim)
        keys = self.keys(keys).view(N, key_len, self.heads, self.head_dim)
        queries = self.queries(query).view(N, query_len, self.heads, self.head_dim)
        energy = torch.einsum("nqhd,nkhd->nhqk", [queries, keys])
        if mask is not None:
            energy = energy.masked_fill(mask == 0, float("-1e20"))
        attention = torch.softmax(energy / (self.embed_size ** (1/2)), dim=3)
        out = torch.einsum("nhql,nlhd->nqhd", [attention, values]).reshape(N, query_len, self.embed_size)
        return self.fc_out(out)`,

  mcq: `The Transformer architecture and its self-attention mechanism. Explain how multi-head attention works, the role of positional encodings, and why transformers replaced RNNs for sequence modeling.`,

  askAuthor: `What is the difference between Agentic AI and traditional LLM prompting? How does tool use and planning make agents fundamentally different?`,

  python: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Test it
print(quicksort([3, 6, 8, 10, 1, 2, 1]))`,

  c: `#include <stdio.h>
#include <stdlib.h>

// Binary search implementation
int binary_search(int arr[], int left, int right, int target) {
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    int arr[] = {2, 3, 4, 10, 40};
    int n = sizeof(arr) / sizeof(arr[0]);
    int result = binary_search(arr, 0, n - 1, 10);
    printf("Element found at index: %d\\n", result);
    return 0;
}`,

  cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Find the longest increasing subsequence
int lis(vector<int>& nums) {
    vector<int> tails;
    for (int num : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), num);
        if (it == tails.end()) tails.push_back(num);
        else *it = num;
    }
    return tails.size();
}

int main() {
    vector<int> nums = {10, 9, 2, 5, 3, 7, 101, 18};
    cout << "LIS length: " << lis(nums) << endl;
    return 0;
}`,

  java: `import java.util.*;

public class Main {
    // Dijkstra's shortest path algorithm
    static int[] dijkstra(Map<Integer, List<int[]>> graph, int start, int n) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[start] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[1]-b[1]);
        pq.offer(new int[]{start, 0});
        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int node = curr[0], d = curr[1];
            if (d > dist[node]) continue;
            for (int[] edge : graph.getOrDefault(node, new ArrayList<>())) {
                int next = edge[0], w = edge[1];
                if (dist[node] + w < dist[next]) {
                    dist[next] = dist[node] + w;
                    pq.offer(new int[]{next, dist[next]});
                }
            }
        }
        return dist;
    }
    public static void main(String[] args) {
        System.out.println("Dijkstra ready - add your graph!");
    }
}`,

  sql: `-- Find top 5 customers by total order value
SELECT 
    c.customer_id,
    c.name,
    COUNT(o.order_id) as total_orders,
    SUM(o.amount) as total_spent,
    AVG(o.amount) as avg_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= DATE('now', '-6 months')
GROUP BY c.customer_id
HAVING total_orders >= 3
ORDER BY total_spent DESC
LIMIT 5;`,

  javascript: `// Build a neural network from scratch
function NeuralNetwork(inputSize, hiddenSize, outputSize) {
    this.W1 = Array.from({length: inputSize}, () => 
        Array.from({length: hiddenSize}, () => Math.random() - 0.5));
    this.b1 = new Array(hiddenSize).fill(0);
    this.W2 = Array.from({length: hiddenSize}, () =>
        Array.from({length: outputSize}, () => Math.random() - 0.5));
    this.b2 = new Array(outputSize).fill(0);
}

NeuralNetwork.prototype.sigmoid = function(x) {
    return 1 / (1 + Math.exp(-x));
};

NeuralNetwork.prototype.forward = function(x) {
    this.z1 = x.map((_, i) => this.W1[i].reduce((s, w, j) => s + w * x[j], 0) + this.b1[i]);
    this.a1 = this.z1.map(z => this.sigmoid(z));
    this.z2 = this.W2[0].reduce((s, w, j) => s + w * this.a1[j], 0) + this.b2[0];
    return this.sigmoid(this.z2);
};

const nn = new NeuralNetwork(2, 4, 1);
console.log("Prediction:", nn.forward([0.5, 0.3]));`,
};

// ── Google Analytics ─────────────────────────────────────────
function loadGA(id) {
  if (document.getElementById("ga-script")) return;
  const s = document.createElement("script");
  s.id = "ga-script";
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);
}
function trackEvent(n, p = {}) { if (window.gtag) window.gtag("event", n, p); }

// ── Visitor Count ────────────────────────────────────────────
async function fetchVisitorCount() {
  try { const r = await fetch(VISITOR_API_URL); return (await r.json()).value; }
  catch { return null; }
}

// ── Script Loader ────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── PDF Download ─────────────────────────────────────────────
async function downloadAsPDF(text, filename = "zeroapi-output") {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const cleaned = text
    .replace(/[🎯🔍💡⚠️📌✅❌🚀📈◆]/g, m => ({"🎯":"[CORE]","🔍":"[FINDINGS]","💡":"[INSIGHTS]","⚠️":"[WARNING]","📌":"[NOTE]","✅":"[+]","❌":"[-]","🚀":"[KEY]","📈":"[GROWTH]","◆":"*"}[m]))
    .replace(/[^\x00-\x7F]/g, "").trim();
  doc.setFont("helvetica");
  doc.setFontSize(18); doc.setTextColor(0, 0, 0); doc.text("ZeroAPI - AI Output", 10, 20);
  doc.setFontSize(9); doc.setTextColor(130, 130, 130); doc.text(`zeroapi.in | Generated: ${new Date().toLocaleDateString("en-IN")}`, 10, 28);
  doc.setDrawColor(0, 200, 180); doc.setLineWidth(0.5); doc.line(10, 32, 200, 32);
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(cleaned, 185);
  let y = 42;
  lines.forEach(line => {
    if (y > 280) { doc.addPage(); y = 20; }
    if (line.startsWith("[")) { doc.setFont("helvetica", "bold"); doc.setTextColor(0, 150, 130); }
    else { doc.setFont("helvetica", "normal"); doc.setTextColor(30, 30, 30); }
    doc.text(line, 10, y); y += 7;
  });
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(180, 180, 180);
    doc.text(`ZeroAPI.in - Free AI Tools | Page ${i} of ${pageCount}`, 10, 290);
  }
  doc.save(`${filename}.pdf`);
}

// ── Clipboard ────────────────────────────────────────────────
function copyToClipboard(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
}

// ── Word Count Utility ───────────────────────────────────────
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── Format Output ────────────────────────────────────────────
function formatOutput(text) {
  return text.split("\n").map((line, i) => {
    const isBold = line.startsWith("**") || line.match(/^[🎯🔍💡⚠️📌✅❌🚀📈1-9]/);
    return (
      <div key={i} style={{ marginBottom: line === "" ? "14px" : "6px", fontWeight: isBold ? 700 : 400, color: isBold ? "#00ffe0" : "rgba(255,255,255,0.88)", fontSize: "0.9rem", lineHeight: 1.85, letterSpacing: "0.01em", paddingLeft: isBold ? "0" : "4px" }}>
        {line.replace(/\*\*/g, "")}
      </div>
    );
  });
}

// ── Feature 1: Word Counter Component ────────────────────────
function WordCounter({ text, limit = WORD_LIMIT }) {
  const words = countWords(text);
  const pct = (words / limit) * 100;
  let color = "rgba(255,255,255,0.25)";
  if (pct >= 100) color = "#ff6b6b";
  else if (pct >= 80) color = "#febc2e";
  else if (words > 0) color = "#00ffe0";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color }}>
      <span>{words.toLocaleString()} / {limit.toLocaleString()} words</span>
      {pct >= 100 && <span style={{ color: "#ff6b6b", fontWeight: 700 }}>— Over limit</span>}
      {pct >= 80 && pct < 100 && <span style={{ color: "#febc2e" }}>— Approaching limit</span>}
      <div style={{ marginLeft: "auto", width: "80px", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: pct >= 100 ? "#ff6b6b" : pct >= 80 ? "#febc2e" : "#00ffe0", borderRadius: "2px", transition: "all 0.3s" }} />
      </div>
    </div>
  );
}

// ── Feature 3: Try Example Button ────────────────────────────
function TryExample({ onFill, exampleMap, toolId }) {
  const example = exampleMap[toolId];
  if (!example) return null;
  return (
    <button onClick={() => onFill(example)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(0,255,224,0.06)", border: "1px solid rgba(0,255,224,0.15)", borderRadius: "8px", padding: "6px 14px", color: "#00ffe0", fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", cursor: "pointer", marginBottom: "12px", transition: "all 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,255,224,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,255,224,0.06)"; }}>
      ✨ Try Example
    </button>
  );
}

// ── Feature 5: Line Numbers ──────────────────────────────────
function LineNumbers({ code, scrollTop }) {
  const lines = code.split("\n").length;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "48px", padding: "20px 8px 20px 0", background: "#0a0e14", borderRight: "1px solid rgba(255,255,255,0.05)", fontFamily: "'Space Mono', monospace", fontSize: "0.78rem", lineHeight: 1.8, color: "rgba(255,255,255,0.2)", textAlign: "right", userSelect: "none", overflow: "hidden", height: "100%", boxSizing: "border-box" }}>
      <div style={{ transform: `translateY(-${scrollTop}px)` }}>
        {Array.from({ length: Math.max(lines, 1) }, (_, i) => (
          <div key={i} style={{ height: `${1.8 * 0.85}rem` }}>{i + 1}</div>
        ))}
      </div>
    </div>
  );
}

// ── Feature 7: Scroll to Top Button ──────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99, width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #00ffe0, #0af)", border: "none", color: "#000", fontSize: "1.2rem", cursor: "pointer", boxShadow: "0 0 24px rgba(0,255,224,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", animation: "fadeUp 0.3s ease" }}
      aria-label="Scroll to top">
      ↑
    </button>
  );
}

// ── Feature 6: Fire Confetti ─────────────────────────────────
function fireConfetti() {
  const colors = ["#00ffe0", "#a78bfa", "#ffffff", "#00aaff"];
  const defaults = { spread: 360, ticks: 100, gravity: 0.8, decay: 0.94, startVelocity: 20, colors };
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({ ...defaults, particleCount: 4, origin: { x: Math.random() * 0.3 + 0.35, y: Math.random() * 0.3 + 0.3 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

// ── TOOLS ────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "summarizer",
    icon: "⚡",
    name: "Research Summarizer",
    tagline: "Paste any paper, article, or abstract. Get instant structured insights.",
    placeholder: "Paste your research abstract, introduction, or any text (best results under 8,000 words)...",
    inputLabel: "Input Text",
    cta: "Summarize Now",
    systemPrompt: `You are an expert research analyst. When given text, produce a concise structured summary:
🎯 Core Idea (1-2 sentences)
🔍 Key Findings (3-5 bullet points)
💡 Practical Implications (2-3 points)
⚠️ Limitations or Gaps (1-2 points)
Be precise, technical yet accessible. Keep under 300 words.`,
  },
  {
    id: "codeExplainer",
    icon: "🧠",
    name: "Code & SQL Explainer",
    tagline: "Paste C, C++, Java, Python, SQL or pseudocode. Get a crystal-clear breakdown.",
    placeholder: "// Paste code or SQL query here\nSELECT * FROM users WHERE ...",
    inputLabel: "Code / SQL",
    cta: "Explain This",
    systemPrompt: `You are an expert software engineer and educator. When given a code snippet or SQL query in ANY language (C, C++, Java, Python, SQL, pseudocode, etc.):
1. **Language detected** — identify the language/query type
2. **What it does** — one sentence overview
3. **Step-by-step walkthrough** — explain each major block/clause clearly
4. **Key concepts used** — patterns, algorithms, SQL clauses, or libraries
5. **Gotchas or improvements** — flag bugs, inefficiencies, or optimization tips
Be educational but concise.`,
  },
  {
    id: "mcqGenerator",
    icon: "🎓",
    name: "MCQ Generator",
    tagline: "Paste any topic, paragraph, or chapter. Get ready-to-use multiple choice questions.",
    placeholder: "Paste any topic, paragraph, textbook content, or just write a subject like:\n\n'Transformer architecture in deep learning'\n'Photosynthesis in plants'\n'Newton's laws of motion'",
    inputLabel: "Topic / Content",
    cta: "Generate MCQs",
    systemPrompt: `You are an expert educator and exam paper setter. When given a topic or text, generate exactly 5 high-quality multiple choice questions. Format EXACTLY like this:

Q1. [Question text]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
✅ Answer: [Letter]) [Correct option]
💡 Explanation: [Brief explanation why]

Q2. [Question text]
...and so on for all 5 questions.

Make questions progressively harder. Cover different aspects. Avoid trivial questions.`,
  },
];

// ── Trivia Section ───────────────────────────────────────────
function TriviaSection() {
  const [trivia, setTrivia] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [shared, setShared] = useState(false);

  const topics = [
    "history of artificial intelligence and its pioneers",
    "large language models and transformer architecture",
    "computer vision and image recognition breakthroughs",
    "reinforcement learning and famous RL milestones",
    "famous AI researchers and their contributions",
    "natural language processing techniques",
    "AI ethics and bias in machine learning",
    "robotics and autonomous systems",
    "neural network architectures like CNN, RNN, LSTM",
    "AI applications in healthcare and medicine",
    "generative AI and diffusion models",
    "AI in gaming — AlphaGo, AlphaStar, OpenAI Five",
    "Python libraries for machine learning",
    "data science and statistics fundamentals",
    "AI safety and alignment research",
    "famous AI failures and lessons learned",
    "quantum computing and AI",
    "edge AI and on-device machine learning",
    "multimodal AI models",
    "AI regulation and global policies",
  ];

  async function loadTrivia() {
    setLoading(true); setSelected(null); setTrivia(null);
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const seed = Math.floor(Math.random() * 10000);
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", max_tokens: 300, temperature: 1.2,
          messages: [
            { role: "system", content: `Generate a single AI/tech trivia question. Respond ONLY in this exact JSON format with no extra text:\n{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","fact":"one interesting sentence about the answer"}` },
            { role: "user", content: `Generate a UNIQUE trivia question (seed:${seed}) specifically about: ${topic}. Make it different from common questions.` }
          ],
        }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        const clean = text.replace(/```json\s*|\s*```/g, "").trim();
        parsed = JSON.parse(clean);
        if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length !== 4) throw new Error("Invalid");
      } catch { parsed = { error: true }; }
      setTrivia(parsed);
    } catch { setTrivia({ error: true }); }
    setLoading(false);
  }

  useEffect(() => { loadTrivia(); }, []);

  function handleAnswer(opt) {
    if (selected || !trivia || trivia.error) return;
    setSelected(opt);
    setTotal(t => t + 1);
    if (opt.startsWith(trivia.answer)) {
      setScore(s => s + 1);
      fireConfetti(); // Feature 6: Confetti!
    }
  }

  function shareScore() {
    const text = `I scored ${score}/${total} on ZeroAPI AI Trivia!\nTest your AI knowledge for free → zeroapi.in`;
    navigator.clipboard.writeText(text).then(() => { setShared(true); setTimeout(() => setShared(false), 2500); });
  }

  const isCorrect = selected && trivia && !trivia.error && selected.startsWith(trivia.answer);

  return (
    <section className="trivia-section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "60px 32px", background: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "8px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase" }}>◆ Daily AI Trivia</div>
          {total > 0 && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", background: "rgba(0,255,224,0.1)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "100px", padding: "3px 12px", color: "#00ffe0" }}>Score: {score}/{total}</div>
              <button onClick={shareScore} style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", background: shared ? "rgba(0,255,224,0.15)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", padding: "3px 12px", color: shared ? "#00ffe0" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>{shared ? "Copied!" : "Share Score"}</button>
            </div>
          )}
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginBottom: "28px", fontFamily: "'Space Mono', monospace" }}>Test your AI knowledge — new question every time</p>
        {loading && <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem" }}><span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #00ffe0", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: "10px", verticalAlign: "middle" }} />Generating question...</div>}
        {trivia && !trivia.error && !loading && (
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "24px", lineHeight: 1.5 }}>{trivia.question}</div>
            <div className="trivia-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {trivia.options.map((opt) => {
                const isThis = selected === opt, correct = opt.startsWith(trivia.answer);
                let bg = "rgba(255,255,255,0.04)", border = "1px solid rgba(255,255,255,0.08)", color = "rgba(255,255,255,0.8)";
                if (selected) { if (correct) { bg = "rgba(0,255,224,0.12)"; border = "1px solid #00ffe0"; color = "#00ffe0"; } else if (isThis) { bg = "rgba(255,80,80,0.1)"; border = "1px solid #ff6b6b"; color = "#ff6b6b"; } }
                return <button key={opt} onClick={() => handleAnswer(opt)} style={{ background: bg, border, borderRadius: "10px", padding: "14px 16px", color, fontSize: "0.85rem", cursor: selected ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left", transition: "all 0.2s" }}>{opt}</button>;
              })}
            </div>
            {selected && <div style={{ background: isCorrect ? "rgba(0,255,224,0.06)" : "rgba(255,180,0,0.06)", border: `1px solid ${isCorrect ? "rgba(0,255,224,0.2)" : "rgba(255,180,0,0.2)"}`, borderRadius: "12px", padding: "16px", marginBottom: "20px", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
              {isCorrect ? "Correct! " : `Not quite. Answer: ${trivia.answer}. `}{trivia.fact}
            </div>}
            <button onClick={loadTrivia} style={{ background: "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "10px", padding: "10px 24px", color: "#00ffe0", fontFamily: "'Space Mono', monospace", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.05em" }}>↻ New Question</button>
          </div>
        )}
        {trivia?.error && !loading && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>Couldn&apos;t load trivia. <button onClick={loadTrivia} style={{ background: "none", border: "none", color: "#00ffe0", cursor: "pointer" }}>Try again</button></div>}
      </div>
    </section>
  );
}

// ── Output Actions ───────────────────────────────────────────
function OutputActions({ text, filename }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
      <button onClick={() => copyToClipboard(text, setCopied)} style={{ display: "flex", alignItems: "center", gap: "6px", background: copied ? "rgba(0,255,224,0.12)" : "rgba(255,255,255,0.06)", border: `1px solid ${copied ? "rgba(0,255,224,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", padding: "8px 16px", color: copied ? "#00ffe0" : "rgba(255,255,255,0.6)", fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.2s" }}>{copied ? "Copied!" : "Copy"}</button>
      <button onClick={async () => { setDownloading(true); await downloadAsPDF(text, filename); setDownloading(false); }} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 16px", color: "rgba(255,255,255,0.6)", fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.2s" }}>{downloading ? "Generating..." : "Download PDF"}</button>
    </div>
  );
}

// ── Tool Panel (Summarizer + Code Explainer) ─────────────────
function ToolPanel({ tool }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef(null);
  const isOverLimit = countWords(input) > WORD_LIMIT;

  useEffect(() => { setInput(""); setOutput(""); setError(""); }, [tool.id]);

  async function runTool() {
    if (!input.trim() || isOverLimit) return;
    setLoading(true); setOutput(""); setError("");
    trackEvent("tool_run", { tool_name: tool.name, input_length: input.length });
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1000, messages: [{ role: "system", content: tool.systemPrompt }, { role: "user", content: input }] }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) { setOutput(data.choices[0].message.content); setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100); }
      else if (data?.error) setError(`API Error: ${data.error.message}`);
      else setError("Unexpected response. Please try again.");
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  }

  const exampleKey = tool.id === "codeExplainer" ? "codeExplainer" : tool.id;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "#00ffe0", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>{tool.inputLabel}</label>
        <TryExample onFill={setInput} exampleMap={EXAMPLES} toolId={exampleKey} />
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={tool.placeholder} rows={8}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${isOverLimit ? "rgba(255,80,80,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius: "12px", padding: "16px", color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: "0.82rem", lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
          onFocus={(e) => !isOverLimit && (e.target.style.borderColor = "rgba(0,255,224,0.4)")}
          onBlur={(e) => e.target.style.borderColor = isOverLimit ? "rgba(255,80,80,0.4)" : "rgba(255,255,255,0.12)"} />
        <WordCounter text={input} />
      </div>
      <button onClick={runTool} disabled={loading || !input.trim() || isOverLimit} style={{ background: loading || !input.trim() || isOverLimit ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0 0%, #0af 100%)", border: "none", borderRadius: "10px", padding: "14px 28px", color: loading || !input.trim() || isOverLimit ? "rgba(255,255,255,0.3)" : "#000", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em", cursor: loading || !input.trim() || isOverLimit ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", boxShadow: !loading && input.trim() && !isOverLimit ? "0 0 24px rgba(0,255,224,0.3)" : "none" }}>
        {loading ? <><span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #00ffe0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Analyzing...</> : isOverLimit ? "Over word limit — trim input" : `→ ${tool.cta}`}
      </button>
      {error && <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: "10px", padding: "14px", color: "#ff6b6b", fontSize: "0.82rem", fontFamily: "'Space Mono', monospace" }}>⚠ {error}</div>}
      {output && (
        <div ref={outputRef}>
          <div style={{ background: "rgba(0,255,224,0.04)", border: "1px solid rgba(0,255,224,0.15)", borderRadius: "12px", padding: "24px 28px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid rgba(0,255,224,0.1)" }}>◆ Output</div>
            {formatOutput(output)}
          </div>
          <OutputActions text={output} filename={`zeroapi-${tool.id}`} />
        </div>
      )}
    </div>
  );
}

// ── MCQ Panel ────────────────────────────────────────────────
function MCQPanel({ tool }) {
  const [input, setInput] = useState("");
  const [rawOutput, setRawOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef(null);
  const isOverLimit = countWords(input) > WORD_LIMIT;

  async function generate() {
    if (!input.trim() || isOverLimit) return;
    setLoading(true); setRawOutput(""); setError("");
    trackEvent("tool_run", { tool_name: "MCQ Generator" });
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1200, messages: [{ role: "system", content: tool.systemPrompt }, { role: "user", content: input }] }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) { setRawOutput(data.choices[0].message.content); setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100); }
      else if (data?.error) setError(`API Error: ${data.error.message}`);
      else setError("Unexpected response. Please try again.");
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  }

  function formatMCQ(text) {
    const blocks = text.split(/\n(?=Q\d+\.\s)/).filter(b => b.trim());
    return blocks.map((block, i) => {
      const lines = block.trim().split("\n").filter(l => l.trim());
      const qLine = lines[0] || "";
      const opts = lines.filter(l => l.match(/^[A-D]\)/));
      const ansLine = lines.find(l => l.includes("✅")) || "";
      const expLine = lines.find(l => l.includes("💡")) || "";
      return (
        <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.1em", marginBottom: "10px" }}>QUESTION {i + 1}</div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "14px" }}>{qLine.replace(/^Q\d+\.\s*/, "")}</div>
          <div className="mcq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
            {opts.map((opt, j) => <div key={j} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "10px 12px", fontSize: "0.83rem", color: "rgba(255,255,255,0.75)" }}>{opt}</div>)}
          </div>
          {ansLine && <div style={{ background: "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem", color: "#00ffe0", marginBottom: "8px" }}>{ansLine}</div>}
          {expLine && <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{expLine}</div>}
        </div>
      );
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "#00ffe0", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>{tool.inputLabel}</label>
        <TryExample onFill={setInput} exampleMap={EXAMPLES} toolId="mcq" />
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={tool.placeholder} rows={6}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${isOverLimit ? "rgba(255,80,80,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius: "12px", padding: "16px", color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: "0.82rem", lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
          onFocus={(e) => !isOverLimit && (e.target.style.borderColor = "rgba(0,255,224,0.4)")}
          onBlur={(e) => e.target.style.borderColor = isOverLimit ? "rgba(255,80,80,0.4)" : "rgba(255,255,255,0.12)"} />
        <WordCounter text={input} />
      </div>
      <button onClick={generate} disabled={loading || !input.trim() || isOverLimit} style={{ background: loading || !input.trim() || isOverLimit ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0 0%, #0af 100%)", border: "none", borderRadius: "10px", padding: "14px 28px", color: loading || !input.trim() || isOverLimit ? "rgba(255,255,255,0.3)" : "#000", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", fontWeight: 700, cursor: loading || !input.trim() || isOverLimit ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
        {loading ? <><span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #00ffe0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Generating MCQs...</> : isOverLimit ? "Over word limit — trim input" : "→ Generate 5 MCQs"}
      </button>
      {error && <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: "10px", padding: "14px", color: "#ff6b6b", fontSize: "0.82rem", fontFamily: "'Space Mono', monospace" }}>⚠ {error}</div>}
      {rawOutput && (
        <div ref={outputRef}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>◆ Generated Questions</div>
          {formatMCQ(rawOutput)}
          <OutputActions text={rawOutput} filename="zeroapi-mcqs" />
        </div>
      )}
    </div>
  );
}

// ── Upload Tool (Document Summarizer / Resume Analyzer) ──────
function UploadTool({ prompt, filename, icon, label }) {
  const [fileName, setFileName] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name); setOutput(""); setError(""); setExtractedText("");
    setExtracting(true);
    try {
      let text = "";
      if (file.name.endsWith(".pdf")) {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const ab = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(s => s.str).join(" ") + "\n";
        }
      } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
        const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { setError("Please upload a PDF or Word (.docx) file."); setExtracting(false); return; }
      if (!text.trim()) { setError("Could not extract text from this file."); setExtracting(false); return; }
      const trimmed = text.slice(0, WORD_LIMIT_UPLOAD);
      setExtractedText(trimmed); setCharCount(trimmed.length);
    } catch { setError("Error reading file. Please try again."); }
    setExtracting(false);
  }

  async function analyze() {
    if (!extractedText) return;
    setLoading(true); setOutput(""); setError("");
    trackEvent("tool_run", { tool_name: label });
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1000, messages: [{ role: "system", content: prompt }, { role: "user", content: extractedText }] }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) setOutput(data.choices[0].message.content);
      else if (data?.error) setError(`API Error: ${data.error.message}`);
      else setError("Unexpected response. Please try again.");
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${fileName ? "rgba(0,255,224,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius: "14px", padding: "36px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: fileName ? "rgba(0,255,224,0.04)" : "transparent" }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(0,255,224,0.3)"}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = fileName ? "rgba(0,255,224,0.4)" : "rgba(255,255,255,0.12)"}>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleFile} />
        <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>{fileName ? icon : "⬆️"}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", color: fileName ? "#00ffe0" : "rgba(255,255,255,0.5)", marginBottom: "6px" }}>{extracting ? "Extracting text..." : fileName ? fileName : "Click to upload PDF or Word file"}</div>
        {!fileName && <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Supports .pdf · .doc · .docx · Max ~40 pages for best results</div>}
        {charCount > 0 && <div style={{ fontSize: "0.72rem", color: "rgba(0,255,224,0.6)", marginTop: "6px", fontFamily: "'Space Mono', monospace" }}>{charCount.toLocaleString()} characters extracted{charCount >= WORD_LIMIT_UPLOAD ? ` · Large file: first ${(WORD_LIMIT_UPLOAD/1000).toFixed(0)}K chars used` : ""}</div>}
      </div>
      {extractedText && (
        <button onClick={analyze} disabled={loading} style={{ background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0 0%, #0af 100%)", border: "none", borderRadius: "10px", padding: "14px 28px", color: loading ? "rgba(255,255,255,0.3)" : "#000", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", boxShadow: !loading ? "0 0 24px rgba(0,255,224,0.3)" : "none" }}>
          {loading ? <><span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #00ffe0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Analyzing...</> : `→ ${label}`}
        </button>
      )}
      {error && <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: "10px", padding: "14px", color: "#ff6b6b", fontSize: "0.82rem", fontFamily: "'Space Mono', monospace" }}>⚠ {error}</div>}
      {output && (
        <div>
          <div style={{ background: "rgba(0,255,224,0.04)", border: "1px solid rgba(0,255,224,0.15)", borderRadius: "12px", padding: "24px 28px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid rgba(0,255,224,0.1)" }}>◆ {label} Result</div>
            {formatOutput(output)}
          </div>
          <OutputActions text={output} filename={`zeroapi-${filename}`} />
        </div>
      )}
    </div>
  );
}

// ── Tool Card ────────────────────────────────────────────────
function ToolCard({ icon, name, tagline, active, onClick, fullWidth }) {
  return (
    <button onClick={onClick} style={{ background: active ? "linear-gradient(135deg, #00ffe0 0%, #0af 100%)" : "rgba(255,255,255,0.04)", border: active ? "none" : "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: fullWidth ? "18px 24px" : "24px", cursor: "pointer", textAlign: "left", transition: "all 0.3s ease", transform: active ? "scale(1.01)" : "scale(1)", boxShadow: active ? "0 0 40px rgba(0,255,224,0.25)" : "none", flex: fullWidth ? "none" : 1, width: fullWidth ? "100%" : "auto", display: "flex", alignItems: fullWidth ? "center" : "flex-start", gap: fullWidth ? "16px" : "0", flexDirection: fullWidth ? "row" : "column" }}>
      <div style={{ fontSize: "2rem", marginBottom: fullWidth ? 0 : "10px" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.95rem", fontWeight: 700, color: active ? "#000" : "#fff", marginBottom: "6px", letterSpacing: "-0.02em" }}>{name}</div>
        <div style={{ fontSize: "0.78rem", color: active ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{tagline}</div>
      </div>
    </button>
  );
}

// ── Code Playground ──────────────────────────────────────────
const LANG_MAP = {
  python: "python-3.14",
  c: "gcc-15",
  cpp: "g++-15",
  java: "openjdk-25",
  javascript: "typescript-deno",
};

const LANGUAGES = [
  { label: "Python", value: "python", icon: "🐍", starter: `# Python Playground\nprint("Hello from ZeroAPI!")\n\n# Try some code:\nfor i in range(5):\n    print(f"Number: {i}")` },
  { label: "C", value: "c", icon: "⚙️", starter: `#include <stdio.h>\n\nint main() {\n    printf("Hello from ZeroAPI!\\n");\n    \n    for(int i = 0; i < 5; i++) {\n        printf("Number: %d\\n", i);\n    }\n    return 0;\n}` },
  { label: "C++", value: "cpp", icon: "🔷", starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from ZeroAPI!" << endl;\n    \n    for(int i = 0; i < 5; i++) {\n        cout << "Number: " << i << endl;\n    }\n    return 0;\n}` },
  { label: "Java", value: "java", icon: "☕", starter: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from ZeroAPI!");\n        \n        for(int i = 0; i < 5; i++) {\n            System.out.println("Number: " + i);\n        }\n    }\n}` },
  { label: "SQL", value: "sqlite3", icon: "🗄️", starter: `-- SQL Playground (SQLite)\nCREATE TABLE students (\n    id INTEGER PRIMARY KEY,\n    name TEXT,\n    marks INTEGER\n);\n\nINSERT INTO students VALUES (1, 'Rahul', 85);\nINSERT INTO students VALUES (2, 'Priya', 92);\nINSERT INTO students VALUES (3, 'Arjun', 78);\n\nSELECT * FROM students ORDER BY marks DESC;` },
  { label: "JavaScript", value: "javascript", icon: "🌐", starter: `// JavaScript Playground\nconsole.log("Hello from ZeroAPI!");\n\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log("Doubled:", doubled);\n\nconst greet = name => \\`Hello, \\${name}!\\`;\nconsole.log(greet("ZeroAPI"));` },
];

function CodePlayground() {
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].starter);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");
  const [runError, setRunError] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const sqlLoaded = useRef(false);
  const codeAreaRef = useRef(null);

  function switchLang(l) {
    setLang(l); setCode(l.starter); setOutput(""); setExplanation(""); setError("");
  }

  // Feature 3: Try Example for playground
  function loadExample() {
    const key = lang.value === "sqlite3" ? "sql" : lang.value;
    const ex = EXAMPLES[key] || EXAMPLES.python;
    setCode(ex);
    setOutput(""); setExplanation(""); setError("");
    trackEvent("playground_example", { language: lang.label });
  }

  async function runCode() {
    if (!code.trim()) return;
    setRunning(true); setOutput(""); setError(""); setExplanation(""); setRunError(false);
    trackEvent("playground_run", { language: lang.label });

    if (lang.value === "sqlite3") {
      try {
        if (!sqlLoaded.current) { await loadScript("https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js"); sqlLoaded.current = true; }
        const SQL = await window.initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}` });
        const db = new SQL.Database();
        const statements = code.split(";").map(s => s.trim()).filter(s => s.length > 0);
        let result = "";
        for (const stmt of statements) {
          try {
            const res = db.exec(stmt + ";");
            if (res.length > 0) { const { columns, values } = res[0]; result += columns.join(" | ") + "\n"; result += columns.map(() => "---").join("-|-") + "\n"; values.forEach(row => { result += row.join(" | ") + "\n"; }); result += "\n"; }
          } catch (e) { result += `Error: ${e.message}\n`; }
        }
        setOutput(result.trim() || "(No output)"); setRunError(false);
      } catch (e) { setOutput(`SQL Error: ${e.message}`); setRunError(true); }
      setRunning(false); return;
    }

    try {
      const compiler = LANG_MAP[lang.value] || lang.value;
      const res = await fetch("/api/run-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ compiler, code, input: "" }) });
      const data = await res.json();
      const out = data?.output || ""; const err = data?.error || data?.message || "";
      if (out.trim()) { setOutput(out.trim()); setRunError(false); }
      else if (err.trim()) { setOutput(err.trim()); setRunError(true); }
      else if (data?.status === "success") { setOutput("(No output)"); setRunError(false); }
      else { setOutput(`Error: ${data?.status || "Unknown error"}`); setRunError(true); }
    } catch { setError("Connection error. Please try again."); }
    setRunning(false);
  }

  async function explainCode() {
    if (!code.trim()) return;
    setExplaining(true); setExplanation("");
    trackEvent("playground_explain", { language: lang.label });
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", max_tokens: 600,
          messages: [{ role: "system", content: `You are an expert ${lang.label} educator. Explain the given code clearly for a student:\n1. **What it does** — one sentence\n2. **Line by line** — explain each important line simply\n3. **Key concepts** — what programming concepts are used\n4. **Output** — what will it print/return\nKeep it beginner-friendly and concise.` }, { role: "user", content: `Explain this ${lang.label} code:\n\n${code}` }]
        }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) setExplanation(data.choices[0].message.content);
      else setError("Couldn't get explanation. Try again.");
    } catch { setError("Connection error."); }
    setExplaining(false);
  }

  function formatExplanation(text) {
    return text.split("\n").map((line, i) => {
      const isBold = line.startsWith("**") || line.match(/^[1-9]\./);
      return <div key={i} style={{ marginBottom: line === "" ? "12px" : "5px", fontWeight: isBold ? 700 : 400, color: isBold ? "#00ffe0" : "rgba(255,255,255,0.85)", fontSize: "0.88rem", lineHeight: 1.8, paddingLeft: isBold ? 0 : "4px" }}>{line.replace(/\*\*/g, "")}</div>;
    });
  }

  // Feature 4: Ctrl+Enter to run
  const handleCodeKeyDown = useCallback((e) => {
    if (e.key === "Tab") { e.preventDefault(); const s = e.target.selectionStart; const newCode = code.substring(0, s) + "  " + code.substring(e.target.selectionEnd); setCode(newCode); setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0); }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runCode(); }
  }, [code]);

  // Feature 5: Sync scroll for line numbers
  function handleCodeScroll(e) { setScrollTop(e.target.scrollTop); }

  return (
    <section id="playground" style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 32px 80px" }}>
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>◆ Code Playground</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", WebkitTextFillColor: "#fff", marginBottom: "12px" }}>Write. Run. Learn.</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", fontWeight: 300 }}>Browser-based code editor · 6 languages · AI explanation built-in</p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {LANGUAGES.map(l => (
          <button key={l.value} onClick={() => switchLang(l)} style={{ background: lang.value === l.value ? "linear-gradient(135deg, #00ffe0, #0af)" : "rgba(255,255,255,0.05)", border: lang.value === l.value ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", padding: "8px 18px", color: lang.value === l.value ? "#000" : "rgba(255,255,255,0.6)", fontFamily: "'Space Mono', monospace", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: lang.value === l.value ? "0 0 16px rgba(0,255,224,0.3)" : "none" }}>
            {l.icon} {l.label}
          </button>
        ))}
        <button onClick={loadExample} style={{ marginLeft: "auto", background: "rgba(0,255,224,0.06)", border: "1px solid rgba(0,255,224,0.15)", borderRadius: "100px", padding: "8px 18px", color: "#00ffe0", fontFamily: "'Space Mono', monospace", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,255,224,0.12)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,255,224,0.06)"}>
          ✨ Try Example
        </button>
      </div>

      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840" }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginLeft: "8px" }}>{lang.icon} {lang.label} Editor</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => { setCode(""); setOutput(""); setExplanation(""); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 14px", color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", cursor: "pointer" }}>Clear</button>
            <button onClick={() => setCode(lang.starter)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 14px", color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", cursor: "pointer" }}>Reset</button>
            <button onClick={runCode} disabled={running} style={{ background: running ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "8px", padding: "6px 20px", color: running ? "rgba(255,255,255,0.3)" : "#000", fontFamily: "'Space Mono', monospace", fontSize: "0.78rem", fontWeight: 700, cursor: running ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              {running ? <><span style={{ display: "inline-block", width: "10px", height: "10px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #00ffe0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Running...</> : "▶ Run"}
            </button>
          </div>
        </div>

        {/* Feature 5: Editor with line numbers */}
        <div style={{ position: "relative" }}>
          <LineNumbers code={code} scrollTop={scrollTop} />
          <textarea
            ref={codeAreaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleCodeKeyDown}
            onScroll={handleCodeScroll}
            spellCheck={false}
            style={{ width: "100%", minHeight: "280px", background: "#0d1117", border: "none", padding: "20px 20px 20px 60px", color: "#e6edf3", fontFamily: "'Space Mono', monospace", fontSize: "0.85rem", lineHeight: 1.8, resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {(output || error) && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ padding: "10px 20px", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: runError ? "#ff6b6b" : "#00ffe0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{runError ? "⚠ Error" : "◆ Output"}</span>
              <button onClick={explainCode} disabled={explaining} style={{ background: explaining ? "rgba(255,255,255,0.06)" : "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "8px", padding: "5px 14px", color: explaining ? "rgba(255,255,255,0.3)" : "#00ffe0", fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", cursor: explaining ? "not-allowed" : "pointer" }}>
                {explaining ? "Explaining..." : "🧠 Ask AI to Explain"}
              </button>
            </div>
            <pre style={{ margin: 0, padding: "16px 20px", fontFamily: "'Space Mono', monospace", fontSize: "0.82rem", color: runError ? "#ff6b6b" : "rgba(255,255,255,0.85)", lineHeight: 1.7, background: "#0d1117", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{output || error}</pre>
          </div>
        )}
      </div>

      {explanation && (
        <div style={{ marginTop: "20px", background: "rgba(0,255,224,0.03)", border: "1px solid rgba(0,255,224,0.12)", borderRadius: "16px", padding: "24px 28px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid rgba(0,255,224,0.1)" }}>🧠 AI Explanation</div>
          {formatExplanation(explanation)}
          <OutputActions text={explanation} filename="zeroapi-code-explanation" />
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "100px", padding: "6px 16px", fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
          💡 Tab to indent &nbsp;·&nbsp; Ctrl+Enter to run &nbsp;·&nbsp; Run code first, then &quot;Ask AI to Explain&quot;
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", color: "rgba(255,255,255,0.18)", letterSpacing: "0.03em" }}>
          <span>⚡ Powered by OnlineCompiler.io</span>
          <span style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
          <span>Standard library only</span>
          <span style={{ color: "rgba(255,255,255,0.08)" }}>·</span>
          <span onClick={() => window.open("https://colab.research.google.com", "_blank", "noopener,noreferrer")} style={{ color: "rgba(0,255,224,0.35)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>Use Colab for ML/DL</span>
        </div>
      </div>
    </section>
  );
}

// ── Ask the Author ───────────────────────────────────────────
function AskAuthor() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask() {
    if (!question.trim()) return;
    setLoading(true); setAnswer(""); setError("");
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 500, messages: [{ role: "system", content: `You are Prof. Abhishek Singh, Assistant Professor of CSE at Baderia Global Institute of Engineering and Management, Jabalpur, India. M.Tech in Data Science and VLSI Design, author of "Agentic AI Systems: Design & Engineering". Answer questions about AI, Agentic Systems, LLMs, Python, research in a friendly, professor-like tone. First person.` }, { role: "user", content: question }] }),
      });
      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) setAnswer(data.choices[0].message.content);
      else setError("Couldn't get a response. Please try again.");
    } catch { setError("Connection error."); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", minWidth: 0, position: "relative" }}>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="e.g. What is an AI agent? How do I start with LangGraph?" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => e.target.style.borderColor = "rgba(0,255,224,0.4)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
        </div>
        <button onClick={ask} disabled={loading || !question.trim()} style={{ flex: "0 0 auto", background: loading || !question.trim() ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "10px", padding: "12px 20px", color: loading || !question.trim() ? "rgba(255,255,255,0.3)" : "#000", fontWeight: 700, fontSize: "0.85rem", cursor: loading || !question.trim() ? "not-allowed" : "pointer", fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
          {loading ? "..." : "Ask →"}
        </button>
      </div>
      <TryExample onFill={setQuestion} exampleMap={EXAMPLES} toolId="askAuthor" />
      {error && <div style={{ color: "#ff6b6b", fontSize: "0.82rem", marginBottom: "12px" }}>⚠ {error}</div>}
      {answer && (
        <div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px 28px", fontSize: "0.9rem", color: "rgba(255,255,255,0.88)", lineHeight: 1.85, textAlign: "left", letterSpacing: "0.01em" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#00ffe0", marginBottom: "10px", letterSpacing: "0.1em" }}>◆ PROF. ABHISHEK SINGH</div>
            {answer}
          </div>
          <OutputActions text={answer} filename="zeroapi-ask-author" />
        </div>
      )}
    </div>
  );
}

// ── Particle ─────────────────────────────────────────────────
function Particle({ style }) {
  return <div style={{ position: "absolute", borderRadius: "50%", background: "rgba(0,255,224,0.15)", animation: "float linear infinite", ...style }} />;
}

// ── Error Boundary ───────────────────────────────────────────
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("ZeroAPI Error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#060a0f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.5rem", marginBottom: "12px" }}>Something went wrong</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>Please refresh the page to continue.</p>
          <button onClick={() => window.location.reload()} style={{ background: "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "10px", padding: "12px 24px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main App ─────────────────────────────────────────────────
function AppInner() {
  const [activeTool, setActiveTool] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [visitorCount, setVisitorCount] = useState(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => { loadGA(GA_ID); }, []);
  useEffect(() => { fetchVisitorCount().then(setVisitorCount); }, []);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleToolSwitch(index) {
    setActiveTool(index);
    const names = [...TOOLS.map(t => t.name), "Document Summarizer", "Resume Analyzer"];
    trackEvent("tool_selected", { tool_name: names[index] });
  }

  const particles = [
    { width: 6, height: 6, left: "10%", top: "20%", animationDuration: "8s", animationDelay: "0s", opacity: 0.6 },
    { width: 4, height: 4, left: "80%", top: "30%", animationDuration: "11s", animationDelay: "2s", opacity: 0.4 },
    { width: 8, height: 8, left: "55%", top: "15%", animationDuration: "9s", animationDelay: "1s", opacity: 0.3 },
    { width: 3, height: 3, left: "30%", top: "70%", animationDuration: "14s", animationDelay: "3s", opacity: 0.5 },
    { width: 5, height: 5, left: "70%", top: "80%", animationDuration: "10s", animationDelay: "0.5s", opacity: 0.4 },
  ];

  function renderPanel() {
    if (activeTool === 0) return <ToolPanel tool={TOOLS[0]} />;
    if (activeTool === 1) return <ToolPanel tool={TOOLS[1]} />;
    if (activeTool === 2) return <MCQPanel tool={TOOLS[2]} />;
    if (activeTool === 3) return <UploadTool icon="📄" label="Summarize Document" filename="doc-summary" prompt={`You are an expert research analyst. Produce a structured summary:\n🎯 Document Type & Purpose (1-2 sentences)\n🔍 Key Points (5-7 bullet points)\n💡 Main Conclusions (2-3 points)\n📌 Important Details (dates, names, figures)\n⚠️ Limitations or Gaps\nKeep under 400 words.`} />;
    if (activeTool === 4) return <UploadTool icon="📋" label="Analyze Resume" filename="resume-analysis" prompt={`You are an expert HR consultant and career coach. Analyze this resume and provide:\n✅ Strengths (3-5 points)\n❌ Weaknesses (3-5 points)\n🚀 Improvements (5-7 specific actionable suggestions)\n📈 ATS Score Estimate (out of 10) with reason\n💡 Best-fit Job Roles based on the resume\nBe honest, specific, and constructive.`} />;
  }

  function getActiveInfo() {
    if (activeTool < 3) return { icon: TOOLS[activeTool].icon, name: TOOLS[activeTool].name, tagline: TOOLS[activeTool].tagline };
    if (activeTool === 3) return { icon: "📄", name: "Document Summarizer", tagline: "Upload PDF or Word — instant AI structured summary" };
    return { icon: "📋", name: "Resume Analyzer", tagline: "Upload your resume — get expert feedback & ATS score" };
  }

  const activeInfo = getActiveInfo();

  const Modal = ({ title, content, onClose }) => (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "32px", maxWidth: "600px", maxHeight: "80vh", overflow: "auto", textAlign: "left" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", marginBottom: "16px", color: "#fff" }}>{title}</h3>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", lineHeight: 1.8, whiteSpace: "pre-line" }}>{content}</div>
        <button onClick={onClose} style={{ marginTop: "20px", background: "linear-gradient(135deg, #00ffe0, #0af)", border: "none", borderRadius: "8px", padding: "10px 20px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#060a0f", color: "#fff", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; background: #060a0f; overflow-x: hidden; }
        #root { width: 100%; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0% { transform: translateY(0px) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 0.4; } 100% { transform: translateY(-120vh) scale(0.5); opacity: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .hero-title { animation: fadeUp 0.9s ease forwards; }
        .hero-sub { animation: fadeUp 0.9s ease 0.2s both; }
        .hero-cta { animation: fadeUp 0.9s ease 0.4s both; }
        .tools-section { animation: fadeUp 0.9s ease 0.15s both; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #060a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,224,0.3); border-radius: 3px; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hero-section { padding: 100px 20px 60px !important; min-height: auto !important; }
          .hero-title { font-size: clamp(1.8rem, 8vw, 2.8rem) !important; }
          .hero-stats { gap: 30px !important; }
          .tools-section { padding: 60px 20px 80px !important; }
          .tool-row { flex-direction: column !important; }
          .tool-panel { padding: 24px !important; }
          .mcq-grid { grid-template-columns: 1fr !important; }
          .trivia-grid { grid-template-columns: 1fr !important; }
          .trivia-section { padding: 40px 20px !important; }
          #playground { padding: 60px 20px !important; }
          .about-section { padding: 60px 20px !important; }
          .about-buttons { flex-direction: column !important; align-items: center !important; }
          .footer-inner { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 16px !important; }
          nav { padding: 14px 20px !important; }
          .nav-try-btn { display: block !important; }
        }
      `}</style>

      {privacyOpen && <Modal title="Privacy Policy" content="ZeroAPI does not collect or store any personal data. Your AI queries are processed via Groq API and are never stored on our servers. Google Analytics is used for anonymous traffic insights only. No login or account is ever required." onClose={() => setPrivacyOpen(false)} />}
      {termsOpen && <Modal title="Terms of Use" content="ZeroAPI is a free platform for educational and research purposes. Tools are provided as-is. Do not use tools to generate harmful or illegal content. The creator reserves the right to modify or discontinue any feature at any time." onClose={() => setTermsOpen(false)} />}

      {/* Feature 7: Scroll to Top floating button */}
      <ScrollToTop />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(6,10,15,0.92)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="36" height="36" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ffe0"/><stop offset="100%" stopColor="#00aaff"/></linearGradient></defs>
            <circle cx="60" cy="60" r="48" fill="none" stroke="url(#lg1)" strokeWidth="3" strokeDasharray="220 80" strokeLinecap="round"/>
            <circle cx="60" cy="60" r="34" fill="none" stroke="rgba(0,255,224,0.2)" strokeWidth="1.5" strokeDasharray="160 60" strokeLinecap="round"/>
            <circle cx="60" cy="12" r="4" fill="#00ffe0"/><circle cx="108" cy="60" r="4" fill="#00aaff"/><circle cx="60" cy="108" r="4" fill="#00ffe0"/><circle cx="12" cy="60" r="4" fill="#00aaff"/>
            <line x1="60" y1="12" x2="60" y2="22" stroke="#00ffe0" strokeWidth="2"/><line x1="108" y1="60" x2="98" y2="60" stroke="#00aaff" strokeWidth="2"/><line x1="60" y1="108" x2="60" y2="98" stroke="#00ffe0" strokeWidth="2"/><line x1="12" y1="60" x2="22" y2="60" stroke="#00aaff" strokeWidth="2"/>
            <text x="60" y="55" textAnchor="middle" fontFamily="'Arial Black', sans-serif" fontSize="22" fontWeight="900" fill="url(#lg1)">0</text>
            <text x="60" y="74" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.5)" letterSpacing="3">API</text>
          </svg>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>ZeroAPI</span>
        </div>
        <div className="nav-links" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {[{ label: "Tools", action: () => document.getElementById("tools").scrollIntoView({ behavior: "smooth" }) }, { label: "Playground", action: () => document.getElementById("playground").scrollIntoView({ behavior: "smooth" }) }, { label: "About", action: () => document.getElementById("about").scrollIntoView({ behavior: "smooth" }) }].map(({ label, action }) => (
            <span key={label} onClick={action} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", cursor: "pointer", transition: "color 0.2s", fontWeight: 500 }} onMouseEnter={(e) => (e.target.style.color = "#fff")} onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.55)")}>{label}</span>
          ))}
          <span onClick={() => window.open("https://www.youtube.com/@pyofpython9668", "_blank", "noopener,noreferrer")} title="YouTube: pyofpython" style={{ cursor: "pointer", display: "flex", alignItems: "center", opacity: 0.6, transition: "opacity 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#ff0000" opacity="0.9"/><polygon points="9.5,7.5 9.5,16.5 17,12" fill="white"/></svg>
          </span>
          <button onClick={() => document.getElementById("tools").scrollIntoView({ behavior: "smooth" })} style={{ background: "linear-gradient(135deg, #00ffe0 0%, #0af 100%)", border: "none", borderRadius: "8px", padding: "8px 18px", color: "#000", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Space Mono', monospace", letterSpacing: "0.03em" }}>Try Free →</button>
        </div>
        <button className="nav-try-btn" style={{ display: "none", background: "linear-gradient(135deg, #00ffe0 0%, #0af 100%)", border: "none", borderRadius: "8px", padding: "8px 16px", color: "#000", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }} onClick={() => document.getElementById("tools").scrollIntoView({ behavior: "smooth" })}>Try Free →</button>
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 40px 80px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,224,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,224,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,170,255,0.07) 0%, transparent 70%)", top: "10%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} />
        {particles.map((p, i) => <Particle key={i} style={p} />)}

        <div className="hero-cta" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0,255,224,0.08)", border: "1px solid rgba(0,255,224,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "32px", fontSize: "0.72rem", fontFamily: "'Space Mono', monospace", color: "#00ffe0", letterSpacing: "0.06em", textAlign: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ffe0", animation: "pulse 1.5s ease infinite", display: "inline-block" }} />
          FREE AI TOOLS · ZERO API KEY · ZERO SIGNUP
        </div>

        <h1 className="hero-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 6vw, 6rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "24px", maxWidth: "900px", color: "#fff", wordBreak: "keep-all" }}>
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>Your AI </span>
          <span style={{ background: "linear-gradient(135deg, #00ffe0 0%, #0af 60%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block", whiteSpace: "nowrap" }}>Superpower</span>
          <br />
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>Starts Here</span>
        </h1>

        <p className="hero-sub" style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.5)", maxWidth: "560px", lineHeight: 1.7, marginBottom: "48px", fontWeight: 300 }}>
          Free, browser-based AI tools for developers, researchers, and engineers. Zero API key. Zero signup. Zero cost. Just intelligence at your fingertips.
        </p>

        <div className="hero-cta" style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => document.getElementById("tools").scrollIntoView({ behavior: "smooth" })} style={{ background: "linear-gradient(135deg, #00ffe0 0%, #0af 100%)", border: "none", borderRadius: "12px", padding: "16px 36px", color: "#000", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Space Mono', monospace", boxShadow: "0 0 40px rgba(0,255,224,0.3)", letterSpacing: "0.03em" }}>Try Tools Free →</button>
          <button onClick={() => window.open("https://www.reddit.com/r/artificial/", "_blank", "noopener,noreferrer")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "16px 36px", color: "rgba(255,255,255,0.7)", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer" }}>AI News →</button>
        </div>

        <div className="hero-stats" style={{ marginTop: "56px", display: "flex", gap: "60px", justifyContent: "center", flexWrap: "wrap" }}>
          {[{ n: visitorCount ? visitorCount.toLocaleString() : "...", label: "Visitors" }, { n: "0", label: "Signup Required" }, { n: "∞", label: "Possibilities" }].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, #00ffe0, #0af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS SECTION */}
      <section id="tools" className="tools-section" style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 32px 120px" }}>
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>◆ Live AI Tools</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff", WebkitTextFillColor: "#fff" }}>Pick a Tool. Run It. Free.</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginTop: "14px", fontSize: "1rem", fontWeight: 300 }}>Powered by Groq AI &nbsp;·&nbsp; No API Key &nbsp;·&nbsp; No Subscription &nbsp;·&nbsp; Always Free</p>
        </div>

        <div className="tool-row" style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          {TOOLS.slice(0, 2).map((tool, i) => (
            <ToolCard key={tool.id} icon={tool.icon} name={tool.name} tagline={tool.tagline} active={activeTool === i} onClick={() => handleToolSwitch(i)} />
          ))}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <ToolCard icon={TOOLS[2].icon} name={TOOLS[2].name} tagline={TOOLS[2].tagline} active={activeTool === 2} onClick={() => handleToolSwitch(2)} fullWidth />
        </div>

        <div className="tool-row" style={{ display: "flex", gap: "16px", marginBottom: "36px" }}>
          {[{ icon: "📄", name: "Document Summarizer", tagline: "Upload PDF or Word — get an instant structured summary." }, { icon: "📋", name: "Resume Analyzer", tagline: "Upload your resume — expert feedback, ATS score & improvements." }].map((t, i) => (
            <ToolCard key={t.name} icon={t.icon} name={t.name} tagline={t.tagline} active={activeTool === i + 3} onClick={() => handleToolSwitch(i + 3)} />
          ))}
        </div>

        <div className="tool-panel" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "1.5rem" }}>{activeInfo.icon}</span>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>{activeInfo.name}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{activeInfo.tagline}</div>
            </div>
          </div>
          {renderPanel()}
        </div>
      </section>

      <TriviaSection />

      <CodePlayground />

      {/* ABOUT */}
      <section id="about" className="about-section" style={{ maxWidth: "700px", margin: "0 auto", padding: "80px 24px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "20px", color: "#fff" }}>
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>Built by an </span>
          <span style={{ background: "linear-gradient(135deg, #00ffe0, #0af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>AI Researcher</span>
          <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}> for everyone.</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.9, fontSize: "1rem", fontWeight: 300, marginBottom: "36px" }}>
          ZeroAPI is built by <strong style={{ color: "#fff", fontWeight: 600 }}>Prof. Abhishek Singh</strong>, CSE Department at Baderia Global Institute of Engineering and Management, Jabalpur, MP, India — and author of <em>Agentic AI Systems: Design &amp; Engineering</em>.
          <br /><br />
          This platform exists because powerful AI tools shouldn&apos;t be locked behind paywalls or API keys. <strong style={{ color: "#00ffe0", fontWeight: 500 }}>Everything here runs free, instantly, with zero signup.</strong> ZeroAPI is the practical companion to the book — real tools, real AI, no gatekeeping.
        </p>
        <div className="about-buttons" style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          <button onClick={() => window.open("https://www.amazon.com/Agentic-Systems-Engineering-intelligent-collaborate/dp/B0GX5FBCSM", "_blank", "noopener,noreferrer")} style={{ background: "linear-gradient(135deg, #00ffe0 0%, #0af 100%)", border: "none", borderRadius: "12px", padding: "14px 32px", color: "#000", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Space Mono', monospace", boxShadow: "0 0 30px rgba(0,255,224,0.2)" }}>📘 Explore the Book →</button>
          <button onClick={() => window.open("https://www.youtube.com/@pyofpython9668", "_blank", "noopener,noreferrer")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "14px 24px", color: "rgba(255,255,255,0.7)", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "border-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,0,0,0.5)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="5" fill="#ff0000"/><polygon points="9.5,7.5 9.5,16.5 17,12" fill="white"/></svg>
            pyofpython
          </button>
        </div>
      </section>

      {/* ASK THE AUTHOR */}
      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(0,255,224,0.03)", border: "1px solid rgba(0,255,224,0.12)", borderRadius: "20px", padding: "36px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", color: "#00ffe0", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>◆ Ask the Author</div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginBottom: "20px" }}>Ask Prof. Abhishek Singh anything about AI, Agentic Systems, LLMs, or research.</p>
          <AskAuthor />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 40px" }}>
        <div className="footer-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>© {currentYear} ZeroAPI · Prof. Abhishek Singh · All Rights Reserved</div>
            {/* Feature 8: Back to top link in footer */}
            <span onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "rgba(0,255,224,0.4)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#00ffe0"} onMouseLeave={(e) => e.target.style.color = "rgba(0,255,224,0.4)"}>↑ Back to top</span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {[{ label: "Privacy", action: () => setPrivacyOpen(true) }, { label: "Terms", action: () => setTermsOpen(true) }, { label: "Contact", action: () => navigator.clipboard.writeText("abhi16.2007@gmail.com").then(() => alert("✅ Email copied!\n\nabhi16.2007@gmail.com\n\nPaste it in your email app to reach Prof. Abhishek Singh.")) }].map(({ label, action }) => (
              <span key={label} onClick={action} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "color 0.2s" }} onMouseEnter={(e) => (e.target.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.3)")}>{label}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
