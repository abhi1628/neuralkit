// src/components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('ZeroAPI Error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#060a0f', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Please refresh the page to continue.</p>
          <button onClick={() => window.location.reload()} style={{ background: isDark ? 'linear-gradient(135deg, #a78bfa, #818cf8)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
