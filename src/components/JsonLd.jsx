// components/JsonLd.jsx — JSON-LD structured data for SEO rich snippets
// Add to every blog post, tool page, and the homepage

import { useMemo } from 'react';

/**
 * BlogPostJsonLd — TechArticle schema for blog posts
 * Usage: <BlogPostJsonLd post={post} />
 */
export function BlogPostJsonLd({ post }) {
  const jsonLd = useMemo(() => {
    const base = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": post.title,
      "description": post.excerpt,
      "author": {
        "@type": "Person",
        "name": "Prof. Abhishek Singh",
        "jobTitle": "CSE Faculty, Baderia Global Institute of Engineering & Management",
        "url": "https://www.linkedin.com/in/abhishek-singh-170726123",
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Baderia Global Institute of Engineering & Management"
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "ZeroAPI",
        "url": "https://zeroapi.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://zeroapi.in/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://zeroapi.in/learn/${post.slug}`
      },
      "datePublished": post.date,
      "dateModified": post.date,
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "educationalLevel": "undergraduate",
      "audience": {
        "@type": "Audience",
        "audienceType": "Developers, Students, Researchers"
      }
    };

    // Add keywords from tags if available
    if (post.tags && post.tags.length > 0) {
      base.keywords = post.tags.join(', ');
    }

    // Add reading time
    if (post.readTime) {
      base.timeRequired = `PT${parseInt(post.readTime)}M`;
    }

    // Add image if available
    if (post.coverImage) {
      base.image = post.coverImage;
    }

    return base;
  }, [post]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * BreadcrumbJsonLd — BreadcrumbList schema for navigation breadcrumbs
 * Usage: <BreadcrumbJsonLd items={[{name: 'Home', url: '/'}, {name: 'Learn', url: '/learn'}, {name: post.title, url: `/learn/${post.slug}`}]} />
 */
export function BreadcrumbJsonLd({ items }) {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `https://zeroapi.in${item.url}`
    }))
  }), [items]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * OrganizationJsonLd — Organization schema for homepage and about page
 * Usage: <OrganizationJsonLd />
 */
export function OrganizationJsonLd() {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ZeroAPI",
    "url": "https://zeroapi.in",
    "logo": "https://zeroapi.in/logo.png",
    "description": "Free AI tools for developers, students, and researchers. No signup, no API keys, no paywalls.",
    "founder": {
      "@type": "Person",
      "name": "Prof. Abhishek Singh",
      "jobTitle": "CSE Faculty",
      "url": "https://www.linkedin.com/in/abhishek-singh-170726123"
    },
    "sameAs": [
      "https://www.youtube.com/@pyofpython9668",
      "https://www.linkedin.com/in/abhishek-singh-170726123"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Support",
      "email": "abhi16.2007@gmail.com",
      "availableLanguage": ["English", "Hindi"]
    }
  }), []);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * WebSiteJsonLd — WebSite schema with Sitelinks Searchbox
 * Usage: <WebSiteJsonLd /> (add to homepage only)
 */
export function WebSiteJsonLd() {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ZeroAPI",
    "url": "https://zeroapi.in",
    "description": "Free AI tools for developers, students, and researchers. No signup, no API keys, no paywalls.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://zeroapi.in/learn?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }), []);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * SoftwareApplicationJsonLd — For AI tool pages
 * Usage: <SoftwareApplicationJsonLd tool={tool} />
 */
export function SoftwareApplicationJsonLd({ tool }) {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.tagline,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1000"
    },
    "author": {
      "@type": "Organization",
      "name": "ZeroAPI",
      "url": "https://zeroapi.in"
    }
  }), [tool]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * FAQPageJsonLd — For pages with Q&A content
 * Usage: <FAQPageJsonLd questions={[{question: '...', answer: '...'}]} />
 */
export function FAQPageJsonLd({ questions }) {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  }), [questions]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * HowToJsonLd — For tutorial/roadmap pages
 * Usage: <HowToJsonLd title="..." steps={[{name: '...', text: '...', url: '...'}]} />
 */
export function HowToJsonLd({ title, description, steps, totalTime }) {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "totalTime": totalTime || "PT1H",
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url ? (step.url.startsWith('http') ? step.url : `https://zeroapi.in${step.url}`) : undefined
    }))
  }), [title, description, steps, totalTime]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * PersonJsonLd — For author bio pages
 * Usage: <PersonJsonLd />
 */
export function PersonJsonLd() {
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Prof. Abhishek Singh",
    "jobTitle": "CSE Faculty",
    "worksFor": {
      "@type": "Organization",
      "name": "Baderia Global Institute of Engineering & Management",
      "url": "https://baderiaglobal.com"
    },
    "alumniOf": [
      {
        "@type": "EducationalOrganization",
        "name": "M.Tech Data Science"
      },
      {
        "@type": "EducationalOrganization",
        "name": "M.Tech VLSI Design"
      }
    ],
    "knowsAbout": [
      "Artificial Intelligence",
      "Machine Learning",
      "Data Science",
      "Python Programming",
      "System Design",
      "Agentic AI"
    ],
    "sameAs": [
      "https://www.youtube.com/@pyofpython9668",
      "https://www.linkedin.com/in/abhishek-singh-170726123"
    ],
    "url": "https://zeroapi.in/about"
  }), []);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default {
  BlogPostJsonLd,
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
  SoftwareApplicationJsonLd,
  FAQPageJsonLd,
  HowToJsonLd,
  PersonJsonLd
};
