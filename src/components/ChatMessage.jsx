// src/components/ChatMessage.jsx
// Individual chat bubble with markdown-like formatting

import { useMemo } from 'react';

export default function ChatMessage({ message, isDark }) {
  const { role, content, isLoading } = message;

  const isUser = role === 'user';
  const ac = isDark ? '#a78bfa' : '#7c3aed';

  // Simple markdown parser for bold, italic, code, links
  const formattedContent = useMemo(() => {
    if (!content) return [];

    // Split by code blocks first
    const parts = [];
    const codeRegex = /```(\w+)?
([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', lang: match[1] || '', value: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.slice(lastIndex) });
    }

    if (parts.length === 0) {
      parts.push({ type: 'text', value: content });
    }

    return parts;
  }, [content]);

  const formatInline = (text) => {
    // Bold **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Inline code `code`
    text = text.replace(/`(.+?)`/g, '<code style="background:' + (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') + ';padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.85em;">$1</code>');
    // Links [text](url)
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:' + ac + ';text-decoration:underline;">$1</a>');
    // Line breaks
    text = text.replace(/
/g, '<br />');
    return text;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: '8px',
        maxWidth: '100%',
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${ac}, #818cf8)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            flexShrink: 0,
            marginTop: '4px',
          }}
        >
          🤖
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          maxWidth: 'calc(100% - 40px)',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser
            ? `linear-gradient(135deg, ${ac}, #818cf8)`
            : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          color: isUser ? '#fff' : isDark ? '#fff' : '#1a1a1a',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
            <span style={{ animation: 'chatPulse 1.4s infinite', animationDelay: '0s' }}>●</span>
            <span style={{ animation: 'chatPulse 1.4s infinite', animationDelay: '0.2s' }}>●</span>
            <span style={{ animation: 'chatPulse 1.4s infinite', animationDelay: '0.4s' }}>●</span>
          </div>
        ) : (
          formattedContent.map((part, i) => {
            if (part.type === 'code') {
              return (
                <div
                  key={i}
                  style={{
                    background: isDark ? '#1a1a2e' : '#f8f9fa',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    margin: '8px 0',
                    overflowX: 'auto',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                  }}
                >
                  {part.lang && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '6px',
                    }}>
                      {part.lang}
                    </div>
                  )}
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: isDark ? '#e2e8f0' : '#1a1a1a' }}>
                    {part.value}
                  </pre>
                </div>
              );
            }

            return (
              <div
                key={i}
                dangerouslySetInnerHTML={{ __html: formatInline(part.value) }}
                style={{ wordBreak: 'break-word' }}
              />
            );
          })
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            flexShrink: 0,
            marginTop: '4px',
          }}
        >
          🧑
        </div>
      )}
    </div>
  );
}
