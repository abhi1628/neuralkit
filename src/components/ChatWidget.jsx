// src/components/ChatWidget.jsx
// DIAGNOSTIC VERSION — shows errors instead of crashing
// Replace your current ChatWidget with this temporarily to see what's wrong

import { useState, useRef, useEffect } from 'react';

// Try to import useTheme, but don't crash if it fails
let useTheme;
try {
  const themeModule = require('../ThemeContext');
  useTheme = themeModule.useTheme;
} catch (e) {
  console.error('[Zer0] Failed to import useTheme:', e.message);
}

// Try to import useChat, but don't crash if it fails
let useChat;
try {
  const chatModule = require('../hooks/useChat');
  useChat = chatModule.useChat;
} catch (e) {
  console.error('[Zer0] Failed to import useChat:', e.message);
}

// Try to import constants, but don't crash if it fails
let QUICK_REPLIES = {};
try {
  const constants = require('../constants');
  QUICK_REPLIES = constants.QUICK_REPLIES || {};
} catch (e) {
  console.error('[Zer0] Failed to import QUICK_REPLIES:', e.message);
}

export default function ChatWidget() {
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Check for import errors
  useEffect(() => {
    if (!useTheme) setError('useTheme not found — check ThemeContext export');
    else if (!useChat) setError('useChat not found — check hooks/useChat.js');
    else if (!QUICK_REPLIES || Object.keys(QUICK_REPLIES).length === 0) 
      setError('QUICK_REPLIES not found — check constants.js exports');
  }, []);

  // If there's an import error, show it
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '300px',
        padding: '16px',
        background: '#ef4444',
        color: '#fff',
        borderRadius: '12px',
        zIndex: 99999,
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
      }}>
        <strong>🚨 Zer0 Error:</strong><br/>
        {error}<br/><br/>
        <small>Check console for details</small>
      </div>
    );
  }

  // Try to use the hooks
  let theme, isDark, ac;
  let chatState = {};

  try {
    const themeResult = useTheme();
    theme = themeResult.theme;
    isDark = theme === 'dark';
    ac = isDark ? '#a78bfa' : '#7c3aed';
  } catch (e) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '300px',
        padding: '16px',
        background: '#ef4444',
        color: '#fff',
        borderRadius: '12px',
        zIndex: 99999,
        fontFamily: 'monospace',
        fontSize: '0.8rem',
      }}>
        <strong>🚨 useTheme Error:</strong><br/>
        {e.message}<br/>
        <small>Is ThemeProvider wrapping your app?</small>
      </div>
    );
  }

  try {
    chatState = useChat();
  } catch (e) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '300px',
        padding: '16px',
        background: '#ef4444',
        color: '#fff',
        borderRadius: '12px',
        zIndex: 99999,
        fontFamily: 'monospace',
        fontSize: '0.8rem',
      }}>
        <strong>🚨 useChat Error:</strong><br/>
        {e.message}<br/>
        <small>Check hooks/useChat.js imports</small>
      </div>
    );
  }

  const { messages, isLoading, isLimited, sendMessage, resetChat, messageCount, activeContext } = chatState;

  const currentReplies = (QUICK_REPLIES && QUICK_REPLIES[activeContext || 'general']) || 
                         (QUICK_REPLIES && QUICK_REPLIES.general) || [];

  const bg = isDark ? '#0f0f1a' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const text = isDark ? '#fff' : '#1a1a1a';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
            cursor: 'pointer',
            boxShadow: `0 4px 20px ${isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.25)'}`,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          Z
        </button>
      )}

      {isOpen && (
        <div style={{
          position: 'fixed',
          ...(isMobile
            ? { top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0 }
            : { bottom: '90px', right: '24px', width: '380px', maxHeight: '600px', borderRadius: '20px' }
          ),
          background: bg,
          border: `1px solid ${border}`,
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${ac}, #818cf8)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, color: '#fff',
              }}>Z</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: text }}>Zer0</div>
                <div style={{ fontSize: '0.7rem', color: textMuted }}>Online</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: textMuted, fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 8px', color: textMuted }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: text, marginBottom: '8px' }}>Hi, I'm Zer0</div>
                <div style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Your ZeroAPI assistant</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{10 - (messageCount || 0)} messages remaining</div>

                {currentReplies.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    {currentReplies.map((reply, i) => (
                      <button key={i} onClick={() => sendMessage && sendMessage(reply.text)} style={{
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${border}`, borderRadius: '12px', padding: '10px 14px',
                        color: text, fontSize: '0.85rem', textAlign: 'left', cursor: 'pointer',
                      }}>{reply.icon} {reply.text}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: msg.role === 'user' ? `linear-gradient(135deg, ${ac}, #818cf8)` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                color: msg.role === 'user' ? '#fff' : text,
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}>{msg.content}</div>
            ))}

            {isLoading && <div style={{ color: textMuted, fontSize: '0.85rem' }}>Thinking...</div>}

            {isLimited && (
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', color: '#ef4444', textAlign: 'center' }}>
                Limit reached. <button onClick={resetChat} style={{ background: 'transparent', border: 'none', color: ac, textDecoration: 'underline', cursor: 'pointer' }}>Start new chat</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
