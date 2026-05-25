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
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#060a0f';
      document.body.style.color = '#fff';
    } else {
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
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
    accent:      theme === 'dark' ? '#00ffe0'               : '#00897b',
    accentLight: theme === 'dark' ? 'rgba(0,255,224,0.08)' : '#e0f2f1',
    accentGlow:  theme === 'dark' ? 'rgba(0,255,224,0.15)' : 'rgba(0,137,123,0.15)',
    error:       theme === 'dark' ? '#ff6b6b'               : '#dc2626',
    warning:     theme === 'dark' ? '#febc2e'               : '#d97706',
    success:     theme === 'dark' ? '#00ffe0'               : '#15803d',
    bg: {
      primary:  theme === 'dark' ? '#060a0f'                  : '#f8fafc',
      secondary:theme === 'dark' ? 'rgba(255,255,255,0.04)'   : '#ffffff',
      tertiary: theme === 'dark' ? 'rgba(255,255,255,0.03)'   : '#f1f5f9',
      elevated: theme === 'dark' ? 'rgba(255,255,255,0.06)'   : '#ffffff',
      code:     theme === 'dark' ? '#0d1117'                  : '#f5f5f5',
    },
    text: {
      primary:   theme === 'dark' ? '#ffffff'                  : '#0f172a',
      secondary: theme === 'dark' ? 'rgba(255,255,255,0.7)'   : '#334155',
      muted:     theme === 'dark' ? 'rgba(255,255,255,0.5)'   : '#64748b',
      inverse:   theme === 'dark' ? '#1a1a2e'                  : '#ffffff',
    },
    border: {
      subtle: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
      medium: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.13)',
      strong: theme === 'dark' ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.22)',
    },
  }), [theme]);
}
