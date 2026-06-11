// src/components/ChatWidget.jsx
// Zer0 — ZeroAPI's AI Assistant v3
// Floating chatbot with quick-reply buttons + follow-up suggestion chips

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import { QUICK_REPLIES, FOLLOW_UP_SUGGESTIONS } from '../constants';

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
    lastTopic,
  } = useChat();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
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

  // Get follow-up suggestions based on last topic/context
  const getFollowUps = () => {
    if (!lastTopic || isLoading || messages.length === 0) return [];
    const contextFollowUps = FOLLOW_UP_SUGGESTIONS[activeContext] || FOLLOW_UP_SUGGESTIONS.general;
    const topicFollowUps = FOLLOW_UP_SUGGESTIONS[lastTopic] || [];
    // Combine and deduplicate, max 3
    const combined = [...topicFollowUps, ...contextFollowUps];
    const seen = new Set();
    return combined.filter(f => {
      if (seen.has(f.text)) return false;
      seen.add(f.text);
      return true;
    }).slice(0, 3);
  };

  const followUps = getFollowUps();
  const ac = isDark ? '#a78bfa' : '#7c3aed';
  const bg = isDark ? '#0f0f1a' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const text = isDark ? '#fff' : '#1a1a1a';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  const currentReplies = QUICK_REPLIES[activeContext] || QUICK_REPLIES.general;

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Chat with Zer0"
          className="zer0-trigger-btn"
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
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.25)'}`,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = `0 6px 28px ${isDark ? 'rgba(167,139,250,0.4)' : 'rgba(124,58,237,0.35)'}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 4px 20px ${isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.25)'}`;
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="zer0-chat-window"
          style={{
            position: 'fixed',
            ...(isMobile
              ? { top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0 }
              : { bottom: '90px', right: '24px', width: '400px', maxHeight: '650px', borderRadius: '20px' }
            ),
            background: bg,
            border: `1px solid ${border}`,
            boxShadow: isDark
              ? '0 20px 60px rgba(0,0,0,0.6)'
              : '0 20px 60px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                Z
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: text, fontFamily: "'Syne', sans-serif" }}>
                  Zer0
                </div>
                <div style={{ fontSize: '0.7rem', color: textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isLimited ? '#ef4444' : isLoading ? '#fbbf24' : '#22c55e',
                    display: 'inline-block',
                    animation: isLoading ? 'zer0Pulse 1.5s infinite' : 'none',
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
                  background: 'transparent',
                  border: `1px solid ${border}`,
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: textMuted,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ac;
                  e.currentTarget.style.color = ac;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.color = textMuted;
                }}
              >
                🔄 New
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: textMuted,
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = text}
                onMouseLeave={(e) => e.currentTarget.style.color = textMuted}
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
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 8px 16px', color: textMuted }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 auto 16px',
                  fontFamily: "'Syne', sans-serif",
                }}>
                  Z
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: text, marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>
                  Hi, I'm Zer0
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  Your ZeroAPI assistant. Ask me about tools, code, research, or careers.
                  <br />
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {10 - messageCount} messages remaining
                  </span>
                </div>

                {/* Initial Quick Reply Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                  {currentReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(reply.text)}
                      disabled={isLoading || isLimited}
                      className="zer0-quick-reply"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${border}`,
                        borderRadius: '12px',
                        padding: '10px 14px',
                        color: text,
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        cursor: (isLoading || isLimited) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: (isLoading || isLimited) ? 0.5 : 1,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading && !isLimited) {
                          e.currentTarget.style.borderColor = ac;
                          e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.06)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = border;
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{reply.icon}</span>
                      <span>{reply.text}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.9rem', opacity: 0.4 }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ChatMessage message={msg} isDark={isDark} />

                {/* Follow-up suggestion chips — appear AFTER assistant messages */}
                {msg.role === 'assistant' && !msg.isError && !isLoading && i === messages.length - 1 && followUps.length > 0 && !isLimited && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginLeft: '36px',
                    marginTop: '4px',
                    animation: 'zer0FadeIn 0.4s ease',
                  }}>
                    {followUps.map((followUp, fi) => (
                      <button
                        key={fi}
                        onClick={() => handleQuickReply(followUp.text)}
                        disabled={isLoading}
                        style={{
                          background: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)',
                          border: `1px solid ${isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)'}`,
                          borderRadius: '100px',
                          padding: '6px 14px',
                          color: ac,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)';
                          e.currentTarget.style.borderColor = ac;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.08)';
                          e.currentTarget.style.borderColor = isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span style={{ fontSize: '0.9rem' }}>{followUp.icon}</span>
                        <span>{followUp.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <ChatMessage
                message={{ role: 'assistant', content: '', isLoading: true }}
                isDark={isDark}
              />
            )}

            {isLimited && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.04)',
                  border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)'}`,
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>⏳</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Session limit reached</div>
                <div style={{ opacity: 0.8, marginBottom: '10px' }}>
                  You've used all 10 messages. Start fresh to continue.
                </div>
                <button
                  onClick={resetChat}
                  style={{
                    background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 20px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end',
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
              placeholder={isLimited ? 'Limit reached. Start new chat.' : 'Ask Zer0 anything...'}
              disabled={isLimited || isLoading}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: `1px solid ${border}`,
                borderRadius: '14px',
                padding: '12px 16px',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                color: text,
                fontSize: '0.9rem',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                maxHeight: '120px',
                lineHeight: 1.5,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = ac;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.1)'}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isLimited}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: (!input.trim() || isLoading || isLimited)
                  ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                  : `linear-gradient(135deg, ${ac}, #818cf8)`,
                border: 'none',
                color: '#fff',
                fontSize: '1.1rem',
                cursor: (!input.trim() || isLoading || isLimited) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                boxShadow: (!input.trim() || isLoading || isLimited) ? 'none' : `0 2px 10px ${isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.25)'}`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
