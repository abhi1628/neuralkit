// src/components/Modal.jsx
export default function Modal({ title, content, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div
        style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto', textAlign: 'left' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 id="modal-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.2rem', marginBottom: '16px', color: '#fff' }}>{title}</h3>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{content}</div>
        <button
          onClick={onClose}
          style={{ marginTop: '20px', background: isDark ? 'linear-gradient(135deg, #a78bfa, #818cf8)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          aria-label="Close modal"
        >
          Close
        </button>
      </div>
    </div>
  );
}
