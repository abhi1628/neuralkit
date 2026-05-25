// src/components/OutputActions.jsx
import { useState } from 'react';
import { copyToClipboard, downloadAsPDF } from '../utils';

export default function OutputActions({ text, filename = 'zeroapi-output', onClear }) {
  const [copied, setCopied] = useState(false);

  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
      <button
        onClick={() => copyToClipboard(text, setCopied)}
        className={`action-btn ${copied ? 'action-btn-success' : ''}`}
        aria-label="Copy to clipboard"
      >
        {copied ? '✓ Copied!' : '⎘ Copy'}
      </button>
      <button
        onClick={() => downloadAsPDF(text, filename)}
        className="action-btn"
        aria-label="Download as PDF"
      >
        ⬇ PDF
      </button>
      {onClear && (
        <button onClick={onClear} className="action-btn" aria-label="Clear output">
          ✕ Clear
        </button>
      )}
    </div>
  );
}
