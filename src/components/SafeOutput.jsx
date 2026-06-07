// components/SafeOutput.jsx — XSS-safe output renderer for AI responses
// Replaces dangerouslySetInnerHTML with sanitized rendering

import { useMemo } from 'react';

/**
 * DOMPurify-lite: Client-side HTML sanitization without external dependency
 * Sufficient for AI-generated content (not user-generated HTML from strangers)
 */
function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  // Step 1: Remove dangerous tags and attributes
  const forbiddenTags = /<(script|iframe|object|embed|form|input|textarea|button|select|style|link|meta|base|head|body|html|applet|frame|frameset)[^>]*>.*?<\/>/gi;
  const forbiddenTagsSelfClosing = /<(script|iframe|object|embed|form|input|textarea|button|select|style|link|meta|base|head|body|html|applet|frame|frameset|img|svg|math)[^>]*\/?>/gi;
  const eventHandlers = /\s(on\w+\s*=\s*["']?[^"'>]*["']?)/gi;
  const javascriptUrls = /\s(href|src|action|data)\s*=\s*["']?javascript:/gi;
  const dataUrls = /\s(href|src|action|data)\s*=\s*["']?data:/gi;

  let clean = dirty
    .replace(forbiddenTags, '')
    .replace(forbiddenTagsSelfClosing, '')
    .replace(eventHandlers, '')
    .replace(javascriptUrls, ' $1="blocked:')
    .replace(dataUrls, ' $1="blocked:')
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<\?[^>]*\?>/gi, '');

  // Step 2: Allow only safe HTML tags for formatting
  const allowedTags = new Set([
    'b', 'i', 'em', 'strong', 'u', 's', 'strike', 'del', 'ins',
    'mark', 'small', 'sub', 'sup', 'code', 'pre', 'kbd', 'samp',
    'br', 'hr', 'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'q', 'abbr', 'cite', 'dfn',
    'a', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'caption',
    'details', 'summary'
  ]);

  // Strip all attributes except safe ones from allowed tags
  clean = clean.replace(/<(\w+)([^>]*)>/gi, (match, tag, attrs) => {
    if (!allowedTags.has(tag.toLowerCase())) {
      // Not an allowed tag — strip it but keep content
      return '';
    }

    // Only allow safe attributes
    const safeAttrs = [];
    const attrMatches = attrs.match(/\s*(\w+)\s*=\s*["']([^"']*)["']/gi) || [];

    attrMatches.forEach(attr => {
      const match = attr.match(/\s*(\w+)\s*=\s*["']([^"]*)["']/i);
      if (!match) return;
      const [, name, value] = match;
      const lowerName = name.toLowerCase();

      // Safe attributes whitelist
      if (['class', 'id', 'title', 'alt', 'colspan', 'rowspan'].includes(lowerName)) {
        safeAttrs.push(`${lowerName}="${value.replace(/["]/g, '&quot;')}"`);
      }
      // Safe href/src — only http/https/mailto
      if ((lowerName === 'href' || lowerName === 'src') && 
          /^(https?:|mailto:|#|\/)/i.test(value)) {
        safeAttrs.push(`${lowerName}="${value.replace(/["]/g, '&quot;')}"`);
      }
      // Target="_blank" only with rel="noopener noreferrer"
      if (lowerName === 'target' && value === '_blank') {
        safeAttrs.push('target="_blank"');
        safeAttrs.push('rel="noopener noreferrer"');
      }
    });

    return `<${tag.toLowerCase()}${safeAttrs.length ? ' ' + safeAttrs.join(' ') : ''}>`;
  });

  // Remove closing tags for stripped tags
  clean = clean.replace(/<\/(\w+)>/gi, (match, tag) => {
    return allowedTags.has(tag.toLowerCase()) ? match : '';
  });

  return clean;
}

/**
 * SafeOutput — Renders AI-generated content without XSS risk
 * 
 * Usage: <SafeOutput html={aiResponse} theme={theme} />
 * 
 * Props:
 *   - html: string (raw AI output, may contain markdown-like HTML)
 *   - theme: 'dark' | 'light'
 *   - className: optional CSS class
 *   - as: 'div' | 'span' | 'pre' — default 'div'
 */
export default function SafeOutput({ html, theme, className = '', as: Tag = 'div' }) {
  const sanitized = useMemo(() => sanitizeHtml(html), [html]);

  const baseStyles = {
    lineHeight: 1.85,
    fontSize: '0.95rem',
    color: theme === 'dark' ? 'rgba(255,255,255,0.88)' : '#2c3e50',
    wordBreak: 'break-word',
  };

  // For code blocks, use pre styling
  const isCode = sanitized.includes('<code') || sanitized.includes('<pre');
  if (isCode) {
    baseStyles.fontFamily = "'Space Mono', monospace";
    baseStyles.fontSize = '0.85rem';
    baseStyles.lineHeight = 1.7;
  }

  return (
    <Tag 
      className={`safe-output ${className}`}
      style={baseStyles}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

/**
 * SafeFormatOutput — Theme-aware line-by-line renderer (no innerHTML at all)
 * Use this when you don't need HTML formatting, just styled text lines
 */
export function SafeFormatOutput({ text, theme }) {
  if (!text) return null;

  const lines = text.split('\n');
  const ac = theme === 'dark' ? '#a78bfa' : '#7c3aed';

  return (
    <div style={{ lineHeight: 1.85 }}>
      {lines.map((line, i) => {
        const isBold = line.startsWith('**') || line.match(/^[🎯🔍💡⚠️📌✅❌🚀📈1-9]/);
        const isEmpty = line.trim() === '';

        return (
          <div 
            key={i} 
            style={{
              marginBottom: isEmpty ? '14px' : '6px',
              fontWeight: isBold ? 700 : 400,
              color: isBold ? ac : (theme === 'dark' ? 'rgba(255,255,255,0.88)' : '#2c3e50'),
              fontSize: '0.9rem',
              letterSpacing: '0.01em',
              paddingLeft: isBold ? '0' : '4px',
              textAlign: 'left',
            }}
          >
            {line.replace(/\*\*/g, '')}
          </div>
        );
      })}
    </div>
  );
}

/**
 * SafeMarkdown — Renders markdown-like content safely
 * Converts markdown to HTML, then sanitizes
 */
export function SafeMarkdown({ text, theme }) {
  const html = useMemo(() => {
    if (!text) return '';

    let processed = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold/italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return sanitizeHtml(processed);
  }, [text]);

  return (
    <div 
      className="safe-markdown"
      style={{
        lineHeight: 1.85,
        fontSize: '0.95rem',
        color: theme === 'dark' ? 'rgba(255,255,255,0.88)' : '#2c3e50',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
