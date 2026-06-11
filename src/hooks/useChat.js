// src/hooks/useChat.js
// Zer0 chat logic v3 — context-aware + topic tracking for follow-up suggestions

import { useState, useCallback, useRef, useEffect } from 'react';
import { GROQ_API_URL, CHAT_SYSTEM_PROMPT } from '../constants';

const MAX_MESSAGES_PER_SESSION = 10;
const SESSION_KEY = 'zeroapi_chat_session';

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.lastActive && Date.now() - parsed.lastActive < 2 * 60 * 60 * 1000) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Zer0] Session load failed:', e.message);
  }
  return null;
}

function saveSession(session) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      ...session,
      lastActive: Date.now(),
    }));
  } catch (e) {
    console.warn('[Zer0] Session save failed:', e.message);
  }
}

function detectContext() {
  const path = window.location.pathname;
  const hash = window.location.hash;

  if (path.includes('/tools/')) {
    const slug = path.split('/tools/')[1];
    if (slug?.includes('summarizer')) return 'summarizer';
    if (slug?.includes('code')) return 'code';
    if (slug?.includes('mcq')) return 'mcq';
    if (slug?.includes('resume')) return 'resume';
    return 'tools';
  }
  if (path.includes('/playground')) return 'playground';
  if (path.includes('/breakit')) return 'breakit';
  if (path.includes('/roadmaps')) return 'roadmaps';
  if (path.includes('/tutorials')) return 'tutorials';
  if (path.includes('/learn')) return 'learn';
  if (hash === '#tools' || path === '/') return 'general';
  return 'general';
}

// Simple topic extraction from user messages
function extractTopic(text) {
  const lower = text.toLowerCase();

  if (lower.includes('python') || lower.includes('code') || lower.includes('programming') || lower.includes('compiler')) return 'code';
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats') || lower.includes('job')) return 'resume';
  if (lower.includes('summar') || lower.includes('paper') || lower.includes('research') || lower.includes('pdf')) return 'summarizer';
  if (lower.includes('mcq') || lower.includes('question') || lower.includes('exam') || lower.includes('quiz')) return 'mcq';
  if (lower.includes('interview') || lower.includes('mock')) return 'interview';
  if (lower.includes('roadmap') || lower.includes('learning') || lower.includes('career path')) return 'roadmaps';
  if (lower.includes('tutorial') || lower.includes('learn') || lower.includes('course')) return 'tutorials';
  if (lower.includes('playground') || lower.includes('run code') || lower.includes('execute')) return 'playground';
  if (lower.includes('breakit') || lower.includes('debug') || lower.includes('challenge')) return 'breakit';
  if (lower.includes('tool') || lower.includes('feature') || lower.includes('what can')) return 'tools';
  if (lower.includes('abhishek') || lower.includes('author') || lower.includes('professor')) return 'author';
  if (lower.includes('price') || lower.includes('cost') || lower.includes('free') || lower.includes('pay')) return 'pricing';

  return 'general';
}

export function useChat() {
  const [messages, setMessages] = useState(() => {
    const saved = loadSession();
    return saved?.messages || [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLimited, setIsLimited] = useState(false);
  const [activeContext, setActiveContext] = useState('general');
  const [lastTopic, setLastTopic] = useState('general');
  const sessionRef = useRef(() => {
    const saved = loadSession();
    return saved || { id: generateSessionId(), messages: [], count: 0 };
  });

  // Update context when route changes
  useEffect(() => {
    const updateContext = () => setActiveContext(detectContext());
    updateContext();
    window.addEventListener('popstate', updateContext);
    const interval = setInterval(updateContext, 1000);
    return () => {
      window.removeEventListener('popstate', updateContext);
      clearInterval(interval);
    };
  }, []);

  // Sync to sessionStorage
  useEffect(() => {
    const session = sessionRef.current;
    session.messages = messages;
    session.count = messages.filter(m => m.role === 'user').length;
    session.lastActive = Date.now();
    saveSession(session);
    setIsLimited(session.count >= MAX_MESSAGES_PER_SESSION);
  }, [messages]);

  const sendMessage = useCallback(async (userText) => {
    const session = sessionRef.current;
    const currentCount = messages.filter(m => m.role === 'user').length;

    if (currentCount >= MAX_MESSAGES_PER_SESSION) {
      setIsLimited(true);
      return;
    }

    // Track topic from this message
    const topic = extractTopic(userText);
    setLastTopic(topic);

    const userMsg = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    const context = detectContext();
    const contextHint = context !== 'general'
      ? `\n\nThe user is currently viewing the ${context} section of ZeroAPI. Tailor your response to help them with this specific tool or section.`
      : '';

    const topicHint = topic !== 'general'
      ? `\n\nThe user is asking about ${topic}. Provide relevant, specific information about this topic.`
      : '';

    try {
      const apiMessages = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT + contextHint + topicHint },
        ...updatedMessages,
      ];

      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: 'llama-3.1-8b-instant',
          max_tokens: 800,
          temperature: 0.7,
          toolId: 'chatbot',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantContent = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.';

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      console.error('[Zer0] API error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Something went wrong. Please try again in a moment.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const resetChat = useCallback(() => {
    const newSession = { id: generateSessionId(), messages: [], count: 0 };
    sessionRef.current = newSession;
    setMessages([]);
    setIsLimited(false);
    setLastTopic('general');
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const messageCount = messages.filter(m => m.role === 'user').length;

  return {
    messages,
    isLoading,
    isLimited,
    sendMessage,
    resetChat,
    messageCount,
    activeContext,
    lastTopic,
  };
}
