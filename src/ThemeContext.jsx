// src/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Check for saved preference or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('zeroapi_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('zeroapi_theme', theme);
    // Apply theme to body element
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#060a0f';
      document.body.style.color = '#fff';
    } else {
      document.body.style.backgroundColor = '#f5f5f5';
      document.body.style.color = '#1a1a1a';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
