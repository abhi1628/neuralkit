// src/ThemeContext.jsx
import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const getInitialTheme = () => {
    const saved = localStorage.getItem('zeroapi_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('zeroapi_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    // Overriding document.body styles directly via JS removed to prevent theme switching color flashes.
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeStyles() {
  const { theme } = useTheme();
  return useMemo(() => ({
    isDark: theme === 'dark',
    accent:      theme === 'dark' ? '#a78bfa'                   : '#7c3aed',
    accentLight: theme === 'dark' ? 'rgba(167,139,250,0.1)'     : '#ede9fe',
    accentGlow:  theme === 'dark' ? 'rgba(167,139,250,0.2)'     : 'rgba(124,58,237,0.15)',
    gradient:    theme === 'dark'
      ? 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)'
      : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    gradientText: theme === 'dark'
      ? 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #818cf8 100%)'
      : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #6366f1 100%)',
    glow: theme === 'dark'
      ? '0 0 40px rgba(167,139,250,0.4)'
      : '0 0 32px rgba(124,58,237,0.35)',
    error:   theme === 'dark' ? '#f87171'  : '#dc2626',
    warning: theme === 'dark' ? '#fbbf24'  : '#b45309',
    success: theme === 'dark' ? '#34d399'  : '#059669',
    bg: {
      primary:   theme === 'dark' ? '#08070f'                  : '#faf8ff',
      secondary: theme === 'dark' ? 'rgba(167,139,250,0.04)'   : '#ffffff',
      tertiary:  theme === 'dark' ? 'rgba(167,139,250,0.03)'   : '#f3f0ff',
      elevated:  theme === 'dark' ? 'rgba(255,255,255,0.06)'   : '#ffffff',
      code:      theme === 'dark' ? '#0d0b1a'                  : '#1e1b2e',
    },
    text: {
      primary:   theme === 'dark' ? '#f1f5f9'                  : '#1e1b4b',
      secondary: theme === 'dark' ? 'rgba(241,245,249,0.72)'   : '#3730a3',
      muted:     theme === 'dark' ? 'rgba(241,245,249,0.45)'   : '#6d6a8a',
      inverse:   theme === 'dark' ? '#1e1b4b'                  : '#ffffff',
    },
    border: {
      subtle: theme === 'dark' ? 'rgba(167,139,250,0.1)'  : 'rgba(124,58,237,0.07)',
      medium: theme === 'dark' ? 'rgba(167,139,250,0.16)' : 'rgba(124,58,237,0.14)',
      strong: theme === 'dark' ? 'rgba(167,139,250,0.28)' : 'rgba(124,58,237,0.25)',
    },
  }), [theme]);
}
