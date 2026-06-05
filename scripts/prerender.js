import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the built index.html
const distPath = path.join(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// Dynamically find the actual built asset filenames
const assetsDir = path.join(distPath, 'assets');
const assetFiles = fs.readdirSync(assetsDir);
const jsFile = assetFiles.find(f => f.startsWith('index') && f.endsWith('.js'));
const cssFile = assetFiles.find(f => f.startsWith('index') && f.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('❌ Could not find built assets. Run `npm run build` first.');
  process.exit(1);
}

console.log(`Using JS:  /assets/${jsFile}`);
console.log(`Using CSS: /assets/${cssFile}`);

// Your blog posts data (hardcoded to match Blog.jsx)
const posts = [
  {
    slug: 'ats-resume-2026',
    title: 'How to Write an ATS-Friendly Resume in 2026',
    excerpt: '90% of large companies use Applicant Tracking Systems to filter resumes before a human ever sees them. Here\'s exactly how to beat the algorithm and get your resume in front of real people.'
  },
  {
    slug: 'python-312-313-314-differences',
    title: 'Python 3.12 vs 3.13 vs 3.14: What Actually Changed and Why It Matters',
    excerpt: 'Three major Python releases in quick succession brought significant changes — better error messages, a free-threaded mode, experimental JIT compilation, and major typing improvements.'
  },
  {
    slug: 'git-github-first-job',
    title: 'Git & GitHub for Your First Job: Beyond git push',
    excerpt: 'You know git add, commit, and push. But your first week at work will hit you with rebase, merge conflicts, squash commits, and PR reviews.'
  },
  {
    slug: 'system-design-interview-patterns',
    title: 'System Design for Interviews: The 5 Patterns You Actually Need',
    excerpt: 'Every MAANG interview now includes system design — even for 2 YOE candidates. Skip the 500-page books. These 5 patterns cover 80% of interview questions.'
  },
  {
    slug: 'ai-coding-assistants-2026',
    title: 'AI Coding Assistants in 2026: How to Use Them Without Becoming Replaceable',
    excerpt: 'Every student uses Cursor, Copilot, or Claude Code. But interviewers are asking: \'How do you know this code is correct?\''
  },
  {
  slug: 'sql-window-functions-ctes-2026',
  title: 'SQL in 2026: Window Functions, CTEs, and the Queries That Actually Get Asked in Interviews',
  excerpt: 'Stop writing SELECT * and hoping for the best. These are the SQL patterns that separate backend engineers from database wizards — and the exact questions Uber, Stripe, and Meta are asking in 2026.'
},
  {
  slug: 'cisco-ideathon-2026',
  title: 'Cisco Ideathon 2026: How to Build a Winning Project (Even If You\'re a Beginner)',
  excerpt: 'Cisco Ideathon 2026 registrations are opening soon. Here is the complete playbook — from cracking the online assessment to building an idea that impresses Cisco engineers.'
},
  {
  slug: 'model-swapping-ai-engineering-2026',
  title: 'Model Swapping: The One-Line Change That Breaks Production (And Nobody Talks About It)',
  excerpt: 'You changed one line — model = \'gpt-5\' to model = \'gemini-3\' — and everything broke. Not the API. Not the prompt. The model itself. Here is why model swapping is the most underestimated skill in AI engineering.'
},
  {
  slug: 'fullstack-roadmap-2026',
  title: 'The 2026 Full-Stack Roadmap: What to Learn (And What to Skip)',
  excerpt: 'The full-stack definition changed in 2026. It is no longer just React + Node. Here is the exact stack that gets you hired — and the technologies you should stop wasting time on.'
},
  {
  slug: "how-agentic-ai-actually-works-simple-python",
  title: "How Agentic AI Actually Works: The Simple Python Nobody Shows You",
  excerpt: "Strip away the buzzwords. Under the hood, multi-agent systems are just async functions sharing state. Here is the 40-line Python implementation nobody talks about."
  },
  {
  slug: "agentic-ai-roadmap-from-zero-to-production",
  title: "The No-BS Roadmap to Learning Agentic AI: From Zero to Production",
  excerpt: "Stop chasing every new framework. Agentic AI has a clear skill stack, and most people are learning it backwards. Here is the exact path from first principles to shipping production multi-agent systems."
  },
  {
  slug: "30-data-science-interview-questions-2026-faang",
  title: "30 Data Science Interview Questions That Actually You Should Know In 2026.",
  excerpt: "Forget generic prep lists. These are the exact questions Google, Meta, Amazon, Netflix, and Stripe asked candidates this year — with answers that separate the hire from the almost-hire."
  },
  {
    slug: "python-network-concurrency",
    title: "Mastering Python Network Concurrency: Diagnosing and Eliminating Thread Pool Leaks",
    excerpt: "Concurrency speeds up telemetry dashboards, but blocking network sockets can trap background worker threads in memory loops forever. Learn how to implement strict socket timeouts and clean breakdown routines."
  },
  {
    slug: "defensive-cpp-memory-management",
    title: "Defensive C++ Memory Management: Safeguarding Packet Buffers Against Out-of-Bounds Faults",
    excerpt: "High-throughput asynchronous routing pipelines process network frames completely out of sequence. Discover how un-guarded array indexing triggers segmentation faults, and how to build strict boundary walls."
  },
  {
    slug: "low-level-bitwise-networking",
    title: "Low-Level Bitwise Networking: Preventing Undefined Behavior and Integer Wrap-Around",
    excerpt: "Bitwise shifts process network subnets at the hardware register level. Learn why shifting data past a 32-bit register width triggers undefined behavior, and how to write explicit guard clauses for boundary masks."
  },
  {
    slug: "handling-hardware-network-timeouts",
    title: "Handling Hardware Network Timeouts: Defending Python Scripts Against Indefinite Sockets Hangs",
    excerpt: "Physical field switches drop offline or lose power without a clean TCP teardown. Discover why standard request managers freeze indefinitely when connections stall, and how to enforce absolute time limits."
  },
  {
    slug: "concurrency-deadlock-prevention",
    title: "Concurrency Deadlock Prevention: Eliminating Circular Wait Chains in Thread Operations",
    excerpt: "Parallel telemetry logging engines accelerate processing speeds, but inverted lock acquisition paths can easily freeze multi-threaded runtimes. Learn how to identify and break circular wait deadlocks."
  },
  {
    slug: "resilient-socket-programming",
    title: "Resilient Socket Programming: Defending Network Gateways Against Socket Starvation Attacks",
    excerpt: "Low-level C++ socket interfaces maximize throughput but leave systems exposed to connection exhaustion if clients go silent. Learn how to utilize setsockopt to enforce rigid kernel-level read windows."
  },
  {
    slug: "data-sanitization-techniques",
    title: "Data Sanitization Techniques: Eradicating Hidden Spacing Tokens in System Log Parsing",
    excerpt: "Raw network log command pipelines frequently append invisible cross-platform line breaks like carriage returns (\\r). Discover how to implement strict string trimming and casing normalization."
  },
  {
    slug: "thread-safety-in-python",
    title: "Thread Safety in Python: Preventing High-Speed Race Conditions in Shared Memory States",
    excerpt: "Multi-threaded token bucket limiters speed up gateway traffic management, but non-atomic read-modify-write sequences introduce bypass gaps. Learn how to enforce thread safety using mutual exclusion locks."
  },
  {
    slug: "advanced-python-multiprocessing",
    title: "Advanced Python Multiprocessing: Eliminating Zombie Sub-Processes and Resource Leaks",
    excerpt: "Spawning independent sub-processes bypasses the GIL for heavy data inspection, but unmanaged tasks leak entries into the OS kernel table. Discover how to transition to managed process pools."
  },
  {
    slug: "cpp-data-structure-performance",
    title: "C++ Data Structure Performance: Eliminating Sequential Lookups in Data Gateways",
    excerpt: "Searching through sequential array configurations drops high-throughput packet routing down to a slow linear O(N) complexity curve. Learn how to achieve lightning-fast O(1) speeds using unordered hash maps."
  },
  {
    slug: "iam-security-best-practices",
    title: "AWS IAM Security Best Practices: Eliminating Over-Privileged Wildcard Resource Exposures",
    excerpt: "A single '*' wildcard in an S3 or IAM bucket policy can expose proprietary enterprise assets to the public internet. Learn how to architect strict, cross-account least-privilege validation frameworks."
  },
  {
    slug: "mastering-cors-architectures",
    title: "Mastering CORS Architectures: Fixing Cross-Origin Authorization Browser Blocks",
    excerpt: "Combining universal origin wildcards with active credentials flags triggers immediate browser security blocks. Here is how to configure a dynamic, production-ready origin allowlist middleware."
  },
  {
    slug: "preventing-ssrf-vulnerabilities",
    title: "Preventing SSRF Vulnerabilities: Hardening Internal Proxies Against Metadata Exploits",
    excerpt: "Allowing users to supply raw routing URLs opens the door to Server-Side Request Forgery. Discover how to isolate internal cloud server metadata blocks and drop private subnet connection requests."
  },
  {
    slug: "hardening-docker-containers",
    title: "Hardening Docker Containers: Dropping Root Permissions for Low-Privilege Isolation",
    excerpt: "Defaulting container runtime contexts to root execution leaves your entire host node vulnerable to isolation breaks. Learn the explicit user allocation steps needed to satisfy enterprise security audits."
  },
  {
    slug: "container-process-lifecycles",
    title: "Container Process Lifecycles: Preventing PID 1 Thread Starvation and Process Leaks",
    excerpt: "Standard language runtimes lack system init capabilities and leave finished background sub-processes trapped as zombies inside memory maps. Discover how to regulate lifecycles using tiny init daemons."
  },
  {
    slug: "kubernetes-probe-orchestration",
    title: "Kubernetes Probe Orchestration: Defending Applications Against Liveness Death Spirals",
    excerpt: "Pointing automated cluster monitoring to heavy database synchronization lanes turns localized traffic surges into terminal pod restart loops. Here is how to decouple your orchestration health checks."
  },
  {
    slug: "caching-strategies-at-scale",
    title: "Caching Strategies at Scale: Mitigating Thundering Herd Traffic Avalanches",
    excerpt: "Simultaneous global cache key expirations send millions of concurrent requests crashing straight into downstream databases. Learn how to implement mutual exclusion locks and time-based expiration jitter."
  },
  {
    slug: "resilient-microservice-architectures",
    title: "Resilient Microservice Architectures: Implementing Circuit Breakers and Exponential Backoff",
    excerpt: "Immediate network retry loops turn minor downstream timeouts into total, cascading system outages. Learn how to protect recovery windows using exponential backoff delays and randomized jitter offsets."
  },
  {
    slug: "scaling-stateless-gateways",
    title: "Scaling Stateless Gateways: Migrating In-Memory Rate Limiters to Centralized Distributed States",
    excerpt: "Tracking rate limit thresholds inside local server memory variables breaks completely behind a load balancer cluster. Discover how to enforce global traffic limits cleanly using shared, atomic distributed caches."
  },
  {
    slug: "asynchronous-resource-management",
    title: "Asynchronous Resource Management: Eliminating Heap Leaks in Un-Timed Background Promises",
    excerpt: "Firing un-timed background workers without exception catch blocks causes memory leak build-ups when external endpoints drop connections. Learn how to wrap execution traces using strict timeout race conditions."
  },
  {
    "slug": "cuda-gpu-programming-deep-dive",
    "title": "CUDA: The Parallel Computing Engine That Built the AI Empire — And Why NVIDIA Rules It",
    "excerpt": "Why does NVIDIA own 90% of the AI accelerator market? The answer isn't just silicon — it's CUDA. Learn why this parallel computing platform became the most valuable software moat in tech history, and how to master it before abstraction layers make direct GPU programming a lost art."
  }
];

// Generate static HTML for each blog post
posts.forEach(post => {
  const postDir = path.join(distPath, 'learn', post.slug);
  fs.mkdirSync(postDir, { recursive: true });
  
  // Create HTML with proper meta tags for SEO
  const postHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} | ZeroAPI Learn</title>
  <meta name="description" content="${post.excerpt}">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.excerpt}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://zeroapi.in/learn/${post.slug}">
  <link rel="canonical" href="https://zeroapi.in/learn/${post.slug}">
  <link rel="stylesheet" href="/assets/${cssFile}">
  <style>
    body { font-family: 'DM Sans', sans-serif; background: #060a0f; color: #fff; margin: 0; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-family: 'Syne', sans-serif; font-size: 2rem; margin-bottom: 16px; }
    p { font-size: 1.1rem; line-height: 1.7; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
    .loading { text-align: center; padding: 60px 20px; color: #00ffe0; font-family: 'Space Mono', monospace; }
  </style>
</head>
<body>
  <div id="root">
    <div class="container">
      <div style="margin-bottom: 32px;">
        <a href="/learn" style="color: #0891b2; text-decoration: none; font-family: 'Space Mono', monospace; font-size: 0.85rem;">← All Articles</a>
      </div>
      <h1>${post.title}</h1>
      <p>${post.excerpt}</p>
      <p style="color: #00ffe0; font-family: 'Space Mono', monospace; font-size: 0.85rem;">Loading full article...</p>
      <noscript>
        <p>This article requires JavaScript to view the full interactive version. Please enable JavaScript or visit <a href="/" style="color: #00ffe0;">zeroapi.in</a>.</p>
      </noscript>
    </div>
  </div>
  <script type="module" src="/assets/${jsFile}"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(postDir, 'index.html'), postHtml);
  console.log(`✓ Generated /learn/${post.slug}/index.html`);
});

// Generate /learn/index.html
const learnDir = path.join(distPath, 'learn');
fs.mkdirSync(learnDir, { recursive: true });

const learnHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guides & Tutorials | ZeroAPI Learn</title>
  <meta name="description" content="Practical guides for developers, students, and job seekers. New articles every week.">
  <link rel="canonical" href="https://zeroapi.in/learn">
  <style>
    body { font-family: 'DM Sans', sans-serif; background: #060a0f; color: #fff; margin: 0; padding: 40px 20px; }
    .container { max-width: 860px; margin: 0 auto; }
    h1 { font-family: 'Syne', sans-serif; font-size: 2.5rem; margin-bottom: 16px; }
    .article { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 16px; }
    .article h2 { font-size: 1.25rem; margin: 0 0 8px 0; }
    .article p { font-size: 0.9rem; color: rgba(255,255,255,0.6); margin: 0; }
    a { color: #00ffe0; text-decoration: none; }
  </style>
</head>
<body>
  <div id="root">
    <div class="container">
      <h1>Guides & Tutorials</h1>
      <p style="color: rgba(255,255,255,0.5); margin-bottom: 40px;">Practical guides for developers, students, and job seekers.</p>
      ${posts.map(post => `
      <div class="article">
        <h2><a href="/learn/${post.slug}">${post.title}</a></h2>
        <p>${post.excerpt}</p>
      </div>
      `).join('')}
    </div>
  </div>
  <script type="module" src="/assets/${jsFile}"></script>
</body>
</html>`;

fs.writeFileSync(path.join(learnDir, 'index.html'), learnHtml);
console.log('✓ Generated /learn/index.html');

console.log('\n✅ Prerender complete!');
