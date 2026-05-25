// api/blog-reactions.js
// Handles blog post likes and comments
// Supabase tables needed:
//   blog_likes   (id, post_slug, ip_hash, created_at)
//   blog_comments(id, post_slug, name, message, created_at)

import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

const ALLOWED_ORIGINS = [
  'https://zeroapi.in',
  'https://www.zeroapi.in',
  'http://localhost:5173',
  'http://localhost:3000',
];

// ── Rate limit store ──────────────────────────────────────────
if (!global.blogReactionRateStore) global.blogReactionRateStore = new Map();
const rateStore = global.blogReactionRateStore;

if (!global.blogReactionCleanupStarted) {
  global.blogReactionCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateStore.entries()) {
      if (now - entry.windowStart > 3600000) rateStore.delete(key);
    }
  }, 600000);
}

function checkRate(key, limit, windowMs) {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (entry && now - entry.windowStart < windowMs) {
    if (entry.count >= limit) return false;
    entry.count++;
  } else {
    rateStore.set(key, { windowStart: now, count: 1 });
  }
  return true;
}

// ── Hash IP for privacy ───────────────────────────────────────
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + 'zeroapi-salt-2025').digest('hex').slice(0, 32);
}

// ── Supabase helpers ──────────────────────────────────────────
const sbHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function sbGet(table, query) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: sbHeaders });
  return r.json();
}

async function sbPost(table, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST', headers: sbHeaders, body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}

// ── Main handler ──────────────────────────────────────────────
export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const ipHash   = hashIp(clientIp);
  const { slug, type } = req.query;

  if (!slug) return res.status(400).json({ error: 'post slug required' });

  // ── GET — fetch likes count + whether IP liked + comments ──
  if (req.method === 'GET') {
    if (!checkRate(`blog_get_${clientIp}`, 60, 60000))
      return res.status(429).json({ error: 'Too many requests.' });

    try {
      // Like count for this post
      const likes = await sbGet('blog_likes', `select=id&post_slug=eq.${encodeURIComponent(slug)}`);
      const likeCount = Array.isArray(likes) ? likes.length : 0;

      // Did this IP already like?
      const myLike = await sbGet('blog_likes',
        `select=id&post_slug=eq.${encodeURIComponent(slug)}&ip_hash=eq.${ipHash}&limit=1`);
      const liked = Array.isArray(myLike) && myLike.length > 0;

      // Comments for this post
      const comments = await sbGet('blog_comments',
        `select=id,name,message,created_at&post_slug=eq.${encodeURIComponent(slug)}&order=created_at.desc&limit=50`);

      const sanitizedComments = Array.isArray(comments)
        ? comments.map(c => ({
            id:         c.id,
            name:       c.name === 'Anonymous' || !c.name
              ? 'Anonymous'
              : c.name.split(' ').map(p => p.charAt(0) + '***').join(' '),
            message:    c.message?.replace(/[<>]/g, '').slice(0, 300) || '',
            created_at: c.created_at,
          }))
        : [];

      return res.status(200).json({ likeCount, liked, comments: sanitizedComments });
    } catch (err) {
      console.error('blog-reactions GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch reactions' });
    }
  }

  // ── POST — add like or add comment ────────────────────────
  if (req.method === 'POST') {
    // Like
    if (type === 'like') {
      if (!checkRate(`blog_like_${clientIp}`, 20, 3600000))
        return res.status(429).json({ error: 'Too many likes. Try again later.' });

      try {
        // Check if already liked
        const existing = await sbGet('blog_likes',
          `select=id&post_slug=eq.${encodeURIComponent(slug)}&ip_hash=eq.${ipHash}&limit=1`);

        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({ error: 'Already liked', liked: true });
        }

        await sbPost('blog_likes', { post_slug: slug, ip_hash: ipHash });

        // Return updated count
        const allLikes = await sbGet('blog_likes', `select=id&post_slug=eq.${encodeURIComponent(slug)}`);
        return res.status(201).json({ likeCount: Array.isArray(allLikes) ? allLikes.length : 1, liked: true });
      } catch (err) {
        console.error('blog-reactions like error:', err);
        return res.status(500).json({ error: 'Failed to save like' });
      }
    }

    // Comment
    if (type === 'comment') {
      // Rate limit: 3 comments per hour per IP
      if (!checkRate(`blog_comment_${clientIp}`, 3, 3600000))
        return res.status(429).json({ error: 'Too many comments. Try again in an hour.' });

      const { name, message } = req.body || {};

      if (!message || message.trim().length < 2)
        return res.status(400).json({ error: 'Comment is too short.' });
      if (message.trim().length > 500)
        return res.status(400).json({ error: 'Comment too long (max 500 characters).' });

      const cleanName = name
        ? name.trim().slice(0, 50).replace(/[<>]/g, '').replace(/[^\w\s.-]/g, '') || 'Anonymous'
        : 'Anonymous';
      const cleanMsg  = message.trim().slice(0, 500).replace(/[<>]/g, '').replace(/javascript:/gi, '');

      try {
        const { status, data } = await sbPost('blog_comments', {
          post_slug: slug,
          name:      cleanName,
          message:   cleanMsg,
        });
        if (status !== 201) return res.status(500).json({ error: 'Failed to save comment' });

        const saved = Array.isArray(data) ? data[0] : data;
        return res.status(201).json({
          id:         saved.id,
          name:       'Anonymous', // always mask immediately for privacy
          message:    cleanMsg,
          created_at: saved.created_at,
        });
      } catch (err) {
        console.error('blog-reactions comment error:', err);
        return res.status(500).json({ error: 'Failed to save comment' });
      }
    }

    return res.status(400).json({ error: 'Invalid type. Use like or comment.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
