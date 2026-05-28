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
