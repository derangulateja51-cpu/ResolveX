import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading IssueHub data...', inline = false }) {
  if (inline) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
        <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '0.85rem' }}>{message}</span>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
        color: 'var(--text-muted)'
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
