// components/AffiliateBanner.jsx — Context-aware affiliate recommendations
// WITH per-link disclosure badge for compliance

import { useTheme } from '../ThemeContext';

// ── Affiliate link database (update with your actual codes) ───
const AFFILIATE_LINKS = {
  hostinger: {
    name: 'Hostinger',
    url: 'https://hostinger.com?REFERRALCODE=YOURCODE', // Replace with your code
    cta: 'Host your projects for ₹62/month →',
    icon: '🏠',
    color: '#6747c7',
    bgLight: 'rgba(103,71,199,0.06)',
    bgDark: 'rgba(103,71,199,0.1)',
    borderLight: 'rgba(103,71,199,0.2)',
    borderDark: 'rgba(103,71,199,0.3)',
    desc: 'Student-friendly hosting with free SSL, 99.9% uptime, and 24/7 support.'
  },
  scaler: {
    name: 'Scaler Academy',
    url: 'https://scaler.com?referral=YOURCODE', // Replace with your code
    cta: 'FAANG prep with mentorship →',
    icon: '🎓',
    color: '#1a73e8',
    bgLight: 'rgba(26,115,232,0.06)',
    bgDark: 'rgba(26,115,232,0.1)',
    borderLight: 'rgba(26,115,232,0.2)',
    borderDark: 'rgba(26,115,232,0.3)',
    desc: 'Structured DSA + System Design + Mock Interviews with industry mentors.'
  },
  udemy: {
    name: 'Udemy',
    url: 'https://udemy.com/course/COURSE_SLUG/?referralCode=YOURCODE', // Replace per course
    cta: 'Deep dive with video course →',
    icon: '📚',
    color: '#a435f0',
    bgLight: 'rgba(164,53,240,0.06)',
    bgDark: 'rgba(164,53,240,0.1)',
    borderLight: 'rgba(164,53,240,0.2)',
    borderDark: 'rgba(164,53,240,0.3)',
    desc: 'Lifetime access. Learn at your own pace with hands-on projects.'
  },
  coursera: {
    name: 'Coursera',
    url: 'https://coursera.org/learn/COURSE_SLUG', // Replace per course
    cta: 'University certificate program →',
    icon: '🎓',
    color: '#0056d2',
    bgLight: 'rgba(0,86,210,0.06)',
    bgDark: 'rgba(0,86,210,0.1)',
    borderLight: 'rgba(0,86,210,0.2)',
    borderDark: 'rgba(0,86,210,0.3)',
    desc: 'Learn from Stanford, Michigan, IBM. Shareable certificates for LinkedIn.'
  },
  youtube: {
    name: 'YouTube',
    url: 'https://youtube.com/@pyofpython9668',
    cta: 'Watch video tutorial →',
    icon: '▶️',
    color: '#ff0000',
    bgLight: 'rgba(255,0,0,0.06)',
    bgDark: 'rgba(255,0,0,0.1)',
    borderLight: 'rgba(255,0,0,0.2)',
    borderDark: 'rgba(255,0,0,0.3)',
    desc: 'Step-by-step coding walkthroughs on @pyofpython.'
  }
};

// ── Topic-to-affiliate mapping ───────────────────────────────
const TOPIC_MAP = {
  // Hosting/Deployment → Hostinger
  'fullstack-roadmap': 'hostinger',
  'roadmap': 'hostinger',
  'agentic-ai': 'hostinger',
  'system-design': 'hostinger',
  'scaling': 'hostinger',
  'microservice': 'hostinger',
  'aws': 'hostinger',
  'gateway': 'hostinger',

  // Interview Prep → Scaler
  'interview': 'scaler',
  'faang': 'scaler',
  'resume': 'scaler',
  'ats': 'scaler',
  'ideathon': 'scaler',
  'job': 'scaler',
  'career': 'scaler',

  // Python Deep Dive → Udemy
  'python': 'udemy',
  'concurrency': 'udemy',
  'multiprocessing': 'udemy',
  'thread': 'udemy',
  'cuda': 'udemy',
  'gpu': 'udemy',

  // C++ → Udemy
  'cpp': 'udemy',
  'c-plus': 'udemy',
  'memory': 'udemy',
  'data-structure': 'udemy',

  // SQL → Udemy
  'sql': 'udemy',
  'window-function': 'udemy',

  // Docker/K8s → Udemy
  'docker': 'udemy',
  'kubernetes': 'udemy',
  'container': 'udemy',
  'k8s': 'udemy',

  // AI/ML → Udemy or Coursera
  'ai': 'udemy',
  'machine-learning': 'coursera',
  'ml': 'coursera',
  'model': 'udemy',
  'deep-learning': 'coursera',

  // Security → Udemy
  'security': 'udemy',
  'cors': 'udemy',
  'ssrf': 'udemy',
  'iam': 'udemy',
  'sanitization': 'udemy',

  // Networking → Udemy
  'socket': 'udemy',
  'network': 'udemy',
  'bitwise': 'udemy',
  'deadlock': 'udemy',

  // Default fallback
  'default': 'youtube'
};

function matchAffiliate(slug) {
  const lowerSlug = slug.toLowerCase();

  // Check for exact matches first
  for (const [keyword, brand] of Object.entries(TOPIC_MAP)) {
    if (lowerSlug.includes(keyword)) return brand;
  }

  return 'youtube'; // Default: promote your own channel
}

// ── Disclosure badge component ───────────────────────────────
function DisclosureBadge({ isDark }) {
  return (
    <span 
      title="We may earn a commission if you purchase through this link. This helps keep ZeroAPI free for students."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.6rem',
        fontFamily: "'Space Mono', monospace",
        color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
        letterSpacing: '0.05em',
        cursor: 'help',
        marginLeft: '8px',
        padding: '2px 6px',
        borderRadius: '4px',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        textTransform: 'uppercase',
        fontWeight: 500
      }}
    >
      <span style={{ fontSize: '0.7rem' }}>🔗</span> Affiliate
    </span>
  );
}

export default function AffiliateBanner({ slug, theme }) {
  const isDark = theme === 'dark';
  const brand = matchAffiliate(slug);
  const affiliate = AFFILIATE_LINKS[brand];

  if (!affiliate) return null;

  const bg = isDark ? affiliate.bgDark : affiliate.bgLight;
  const border = isDark ? affiliate.borderDark : affiliate.borderLight;

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '14px',
      padding: '20px 24px',
      margin: '32px 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onClick={() => {
      window.open(affiliate.url, '_blank', 'noopener,noreferrer');
      if (window.gtag) window.gtag('event', 'affiliate_click', { brand: affiliate.name, slug });
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: affiliate.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
        flexShrink: 0
      }}>{affiliate.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '6px'
        }}>
          <div>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.62rem',
              color: affiliate.color,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>Recommended</span>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              color: isDark ? '#fff' : '#1a1a1a',
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {affiliate.name}
              <DisclosureBadge isDark={isDark} />
            </div>
          </div>
          <span style={{
            background: 'linear-gradient(135deg, ' + affiliate.color + ', ' + affiliate.color + '88)',
            color: '#fff',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>{affiliate.cta}</span>
        </div>
        <p style={{
          fontSize: '0.82rem',
          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          lineHeight: 1.6,
          margin: 0
        }}>{affiliate.desc}</p>
      </div>
    </div>
  );
}

// ── Multi-affiliate banner (shows 2-3 options for high-intent articles) ──
export function MultiAffiliateBanner({ slug, theme }) {
  const isDark = theme === 'dark';
  const lowerSlug = slug.toLowerCase();

  // High-intent articles get multiple options
  const multiMatch = {
    'fullstack-roadmap': ['scaler', 'hostinger', 'udemy'],
    'system-design': ['scaler', 'udemy', 'hostinger'],
    'data-science-interview': ['scaler', 'coursera', 'udemy'],
    'agentic-ai-roadmap': ['udemy', 'hostinger', 'coursera'],
    'python-interview': ['scaler', 'udemy'],
    'resume': ['scaler', 'udemy']
  };

  const brands = Object.entries(multiMatch).find(([k]) => lowerSlug.includes(k))?.[1];
  if (!brands) return <AffiliateBanner slug={slug} theme={theme} />;

  return (
    <div style={{ margin: '32px 0' }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.62rem',
        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '12px'
      }}>
        ◆ Continue Learning
      </div>
      {brands.map((brand, i) => (
        <AffiliateBanner key={brand} slug={brand} theme={theme} />
      ))}
    </div>
  );
}
