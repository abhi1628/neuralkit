// src/components/ChatWidget.jsx
// Zer0 — Fixed version with markdown rendering, close button, layout fixes

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useChat } from '../hooks/useChat';
import { QUICK_REPLIES } from '../constants';

// Simple markdown formatter
function formatMarkdown(text) {
  if (!text) return '';

  return text
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700">$1</strong>')
    // Italic *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code `code`
    .replace(/`(.+?)`/g, '<code style="background:rgba(124,58,237,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;">$1</code>')
    // Links [text](url)
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline;">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br/>')
    // Bullet points
    .replace(/^\*\s+/gm, '• ')
    // Numbered lists
    .replace(/^\d+\.\s+/gm, (match) => match);
}

export default function ChatWidget() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    isLoading,
    isLimited,
    sendMessage,
    resetChat,
    messageCount,
    activeContext,
  } = useChat();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) setIsOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isLimited) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleQuickReply = (text) => {
    if (isLoading || isLimited) return;
    sendMessage(text);
  };

  const ac = isDark ? '#a78bfa' : '#7c3aed';
  const bg = isDark ? '#0f0f1a' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const text = isDark ? '#fff' : '#1a1a1a';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  const currentReplies = QUICK_REPLIES[activeContext] || QUICK_REPLIES.general;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Chat with Zer0"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${ac}, #818cf8)`,
            border: 'none',
            color: '#fff',
            fontSize: '1.4rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.25)'}`,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Z
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            ...(isMobile
              ? { top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0, width: '100%', height: '100vh' }
              : { bottom: '90px', right: '24px', width: '380px', height: '600px', maxHeight: '80vh', borderRadius: '20px' }
            ),
            background: bg,
            border: `1px solid ${border}`,
            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Header with close button */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700, color: '#fff',
              }}>Z</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: text }}>Zer0</div>
                <div style={{ fontSize: '0.7rem', color: textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: isLimited ? '#ef4444' : isLoading ? '#fbbf24' : '#22c55e',
                    display: 'inline-block',
                  }} />
                  {isLimited ? 'Limit reached' : isLoading ? 'Thinking...' : 'Online'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={resetChat}
                title="New chat"
                style={{
                  background: 'transparent', border: `1px solid ${border}`,
                  borderRadius: '8px', padding: '6px 10px',
                  color: textMuted, fontSize: '0.75rem', cursor: 'pointer',
                }}
              >
                🔄 New
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                style={{
                  background: 'transparent', border: 'none',
                  color: textMuted, fontSize: '1.2rem', cursor: 'pointer', padding: '4px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minHeight: 0,
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 8px', color: textMuted }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: '#fff',
                  margin: '0 auto 16px',
                }}>Z</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: text, marginBottom: '8px' }}>
                  Hi, I'm Zer0
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '8px' }}>
                  Your ZeroAPI assistant
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '20px' }}>
                  {10 - messageCount} messages remaining
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply.text)}
                      disabled={isLoading || isLimited}
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${border}`, borderRadius: '12px',
                        padding: '10px 14px', color: text, fontSize: '0.85rem',
                        textAlign: 'left', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}
                    >
                      <span>{reply.icon}</span>
                      <span>{reply.text}</span>
                      <span style={{ marginLeft: 'auto', opacity: 0.4 }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', color: '#fff', flexShrink: 0, marginTop: '4px',
                  }}>Z</div>
                )}
                <div style={{
                  maxWidth: 'calc(100% - 40px)',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user'
                    ? `linear-gradient(135deg, ${ac}, #818cf8)`
                    : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: msg.role === 'user' ? '#fff' : text,
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                }}>
                  {msg.isLoading ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <span style={{ animation: 'pulse 1.4s infinite 0s' }}>●</span>
                      <span style={{ animation: 'pulse 1.4s infinite 0.2s' }}>●</span>
                      <span style={{ animation: 'pulse 1.4s infinite 0.4s' }}>●</span>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  )}
                </div>
                {msg.role === 'user' && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', flexShrink: 0, marginTop: '4px',
                  }}>🧑</div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{
                display: 'flex', justifyContent: 'flex-start', gap: '8px',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', color: '#fff', flexShrink: 0,
                }}>Z</div>
                <div style={{
                  padding: '10px 14px', borderRadius: '16px',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: textMuted,
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ animation: 'pulse 1.4s infinite 0s' }}>●</span>
                    <span style={{ animation: 'pulse 1.4s infinite 0.2s' }}>●</span>
                    <span style={{ animation: 'pulse 1.4s infinite 0.4s' }}>●</span>
                  </div>
                </div>
              </div>
            )}

            {isLimited && (
              <div style={{
                padding: '14px 16px', borderRadius: '14px',
                background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.04)',
                border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)'}`,
                color: '#ef4444', fontSize: '0.85rem', textAlign: 'center',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>⏳ Session limit reached</div>
                <div style={{ opacity: 0.8, marginBottom: '10px' }}>
                  You've used all 10 messages. Start fresh to continue.
                </div>
                <button
                  onClick={resetChat}
                  style={{
                    background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                    border: 'none', borderRadius: '10px',
                    padding: '8px 20px', color: '#fff',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  🔄 Start New Chat
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '12px 20px 16px',
              borderTop: `1px solid ${border}`,
              display: 'flex', gap: '8px', alignItems: 'flex-end',
              flexShrink: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={isLimited ? 'Limit reached' : 'Ask Zer0...'}
              disabled={isLimited || isLoading}
              rows={1}
              style={{
                flex: 1, resize: 'none',
                border: `1px solid ${border}`, borderRadius: '14px',
                padding: '12px 16px',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                color: text, fontSize: '0.9rem',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none', maxHeight: '120px', lineHeight: 1.5,
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isLimited}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: (!input.trim() || isLoading || isLimited)
                  ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                  : `linear-gradient(135deg, ${ac}, #818cf8)`,
                border: 'none', color: '#fff',
                fontSize: '1.1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
