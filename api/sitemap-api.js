// api/sitemap.js — Dynamic sitemap generator for ZeroAPI
// Auto-generates sitemap.xml from blog posts, roadmaps, tutorials, breakit challenges
// Caches for 1 hour to avoid regenerating on every crawl

import { BLOG_POSTS } from '../src/Blog.jsx';
import { ROADMAPS, getAllRoadmapSlugs } from '../src/constants.js';

const BASE_URL = 'https://zeroapi.in';
const CACHE_TTL = 3600; // 1 hour in seconds

// Static routes that never change
const STATIC_ROUTES = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.6', changefreq: 'monthly' },
  { path: '/learn', priority: '0.9', changefreq: 'weekly' },
  { path: '/breakit', priority: '0.9', changefreq: 'weekly' },
  { path: '/roadmaps', priority: '0.8', changefreq: 'monthly' },
  { path: '/tutorials', priority: '0.9', changefreq: 'weekly' },
  { path: '/tools/summarizer', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/code-explainer', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/mcq-generator', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/resume-builder', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/document-summarizer', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/resume-analyzer', priority: '0.8', changefreq: 'monthly' },
];

// BreakIt challenge slugs (from your existing sitemap)
const BREAKIT_SLUGS = [
  'silent-data-killer', 'type-conversion-trap', 'merge-mayhem', 'mutable-default-disaster',
  'floating-point-finance', 'accuracy-trap', 'leaky-validation', 'imbalanced-metrics-mirage',
  'data-leakage-temporal', 'vanishing-gradient-activation', 'optimized-query', 'null-in-subquery-trap',
  'count-falsy-trap', 'havings-vs-where-mixup', 'un-parameterized-injection', 'api-that-works',
  'async-race-condition', 'cors-wildcard-exposure', 'unhandled-promise-leak', 'payload-limit-flood',
  'secure-api-key', 'root-container-vulnerability', 'zombie-process-leak', 'cors-wildcard-ml-exposure',
  'latest-tag-instability', 'cache-invalidation', 'thundering-herd-crash', 'retry-storm-cascade',
  'read-your-own-writes-gap', 'rate-limit-stateless-bypass', 'cisco-async-leak', 'cisco-packet-race',
  'cisco-subnet-overflow', 'cisco-unhandled-rejection', 'cisco-deadlock-queue', 'cisco-slowloris-timeout',
  'cisco-checksum-failure', 'cisco-token-bucket', 'cisco-dangling-pool', 'cisco-dns-cache-poison',
  'tcs-time-complexity', 'tcs-integer-overflow', 'tcs-string-leak', 'tcs-matrix-boundary',
  'tcs-float-precision', 'tcs-hash-collision', 'tcs-binary-search-edge', 'tcs-recursion-stack',
  'tcs-graph-cycle', 'tcs-type-evaluation', 'cloud-iam-exposure', 'cloud-cors-wildcard',
  'cloud-ssrf-metadata', 'cloud-docker-root', 'cloud-zombie-pid', 'cloud-k8s-spiral',
  'cloud-thundering-herd', 'cloud-retry-storm', 'cloud-stateless-bypass', 'cloud-promise-leak'
];

// Tutorial series structure (from your existing sitemap)
const TUTORIAL_SERIES = [
  {
    slug: 'ml-foundations',
    parts: [
      'part-1-linear-algebra',
      'part-2-calculus-optimization',
      'part-3-probability-information',
      'part-4-ml-pipeline'
    ]
  }
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlEntry(path, priority, changefreq, lastmod = null) {
  let xml = `  <url>\n`;
  xml += `    <loc>${escapeXml(BASE_URL + path)}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <priority>${priority}</priority>\n`;
  xml += `    <changefreq>${changefreq}</changefreq>\n`;
  xml += `  </url>\n`;
  return xml;
}

export default async function handler(req, res) {
  // Security headers
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}, stale-while-revalidate=86400`);

  // CORS for sitemap access
  const origin = req.headers.origin;
  if (origin && (origin === 'https://zeroapi.in' || origin === 'https://www.zeroapi.in')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  try {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static routes
    STATIC_ROUTES.forEach(route => {
      xml += buildUrlEntry(route.path, route.priority, route.changefreq);
    });

    // Blog posts (dynamic from BLOG_POSTS)
    BLOG_POSTS.forEach(post => {
      const lastmod = post.date ? new Date(post.date).toISOString().slice(0, 10) : null;
      xml += buildUrlEntry(`/learn/${post.slug}`, '0.8', 'monthly', lastmod);
    });

    // BreakIt challenges
    BREAKIT_SLUGS.forEach(slug => {
      xml += buildUrlEntry(`/breakit/${slug}`, '0.8', 'monthly');
    });

    // Roadmaps
    const roadmapSlugs = getAllRoadmapSlugs ? getAllRoadmapSlugs() : [];
    roadmapSlugs.forEach(slug => {
      xml += buildUrlEntry(`/roadmaps/${slug}`, '0.8', 'monthly');
    });

    // Tutorials
    TUTORIAL_SERIES.forEach(series => {
      xml += buildUrlEntry(`/tutorials/${series.slug}`, '0.8', 'weekly');
      series.parts.forEach(part => {
        xml += buildUrlEntry(`/tutorials/${series.slug}/${part}`, '0.8', 'monthly');
      });
    });

    xml += '</urlset>';

    return res.status(200).send(xml);
  } catch (err) {
    console.error('[ZeroAPI] Sitemap generation error:', err.message);
    // Fallback to static sitemap if dynamic generation fails
    return res.status(500).json({ error: 'Sitemap generation failed' });
  }
}
