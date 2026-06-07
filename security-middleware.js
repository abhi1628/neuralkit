// middleware/security.js — Production-grade security headers for ZeroAPI
// Apply to all API routes and static responses

const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',

  // XSS protection (legacy but still useful as defense-in-depth)
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy — limit data leakage to third parties
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy — restrict browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()',

  // Strict Transport Security — force HTTPS (1 year, include subdomains)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Content Security Policy — strict but functional for React SPA
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.groq.com https://countapi.mileshilliard.com https://www.google-analytics.com https://*.upstash.io",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * Apply security headers to a response object
 * @param {object} res - Express/Vercel response object
 * @param {object} options - Optional overrides
 */
export function applySecurityHeaders(res, options = {}) {
  const headers = { ...SECURITY_HEADERS, ...options };

  Object.entries(headers).forEach(([key, value]) => {
    if (value) res.setHeader(key, value);
  });
}

/**
 * Vercel-compatible middleware wrapper
 * Use this in your API routes or as a Next.js/Vercel middleware
 */
export function withSecurity(handler) {
  return async function(req, res) {
    applySecurityHeaders(res);

    // Add CORS handling for API routes
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://zeroapi.in',
      'https://www.zeroapi.in',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

/**
 * Enhanced CORS middleware with stricter validation
 * Use this for sensitive API routes (ai.js, visitors.js)
 */
export function withStrictCors(handler, allowedOrigins = null) {
  const origins = allowedOrigins || [
    'https://zeroapi.in',
    'https://www.zeroapi.in'
  ];

  // Add localhost in development
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5173', 'http://localhost:3000');
  }

  return async function(req, res) {
    const origin = req.headers.origin;

    // Only set CORS if origin is present and allowed
    if (origin && origins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin'); // Important for caching
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Apply security headers
    applySecurityHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();

    return handler(req, res);
  };
}

/**
 * Rate limit helper using Redis (Upstash) for cross-instance consistency
 * Falls back to in-memory if Redis is unavailable
 */
export function createRateLimiter(options = {}) {
  const {
    windowMs = 300000,    // 5 minutes
    maxRequests = 20,      // max requests per window
    keyPrefix = 'ratelimit',
    redisUrl = process.env.UPSTASH_REDIS_REST_URL,
    redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
  } = options;

  return async function checkRateLimit(clientIp) {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const key = `${keyPrefix}:${clientIp}:${windowStart}`;

    // Try Redis first
    if (redisUrl && redisToken) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({ url: redisUrl, token: redisToken });

        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, Math.ceil(windowMs / 1000));
        }

        const remaining = Math.max(0, maxRequests - current);
        const resetTime = windowStart + windowMs;

        return {
          allowed: current <= maxRequests,
          remaining,
          resetTime,
          total: current
        };
      } catch (redisErr) {
        console.warn('[ZeroAPI] Redis rate limit failed, falling back to memory:', redisErr.message);
      }
    }

    // Fallback to in-memory (per-instance, less reliable)
    if (!global._rateLimitStore) global._rateLimitStore = new Map();
    const store = global._rateLimitStore;

    const entry = store.get(key);
    if (!entry || entry.windowStart !== windowStart) {
      store.set(key, { windowStart, count: 1 });
      return { allowed: true, remaining: maxRequests - 1, resetTime: windowStart + windowMs, total: 1 };
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);

    return {
      allowed: entry.count <= maxRequests,
      remaining,
      resetTime: windowStart + windowMs,
      total: entry.count
    };
  };
}

/**
 * Security audit logger — logs suspicious requests for analysis
 */
export function logSecurityEvent(req, type, details = {}) {
  const timestamp = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                 req.headers['cf-connecting-ip'] || 
                 req.socket?.remoteAddress || 
                 'unknown';

  const logEntry = {
    timestamp,
    type,
    ip: clientIp,
    path: req.url,
    method: req.method,
    userAgent: req.headers['user-agent']?.slice(0, 200),
    origin: req.headers.origin,
    ...details
  };

  // In production, send to logging service or store in Redis
  console.log('[ZeroAPI Security]', JSON.stringify(logEntry));
}

/**
 * Input validation helpers
 */
export function validateSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9_-]{1,64}$/i.test(slug);
}

export function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).replace(/[<>]/g, '');
}

export default { applySecurityHeaders, withSecurity, withStrictCors, createRateLimiter, logSecurityEvent, validateSlug, sanitizeString };
