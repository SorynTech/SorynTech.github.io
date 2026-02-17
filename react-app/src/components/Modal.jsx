import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h3>{title || 'Confirm'}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="modal-btn-cancel" style={{
            flex: 1, padding: '0.75rem 2rem', borderRadius: '10px', color: 'var(--text-primary)',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            background: 'rgba(255, 0, 110, 0.2)', border: '1px solid rgba(255, 0, 110, 0.4)'
          }} onClick={onClose}>Cancel</button>
          <button className="modal-btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
