import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ErrorBanner({ message, onDismiss, actionText, onAction }) {
  if (!message) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius-md)',
        color: '#991b1b',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {actionText && onAction && (
          <button
            onClick={onAction}
            style={{
              background: '#ffffff',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {actionText}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'transparent',
              color: '#991b1b',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              borderRadius: '4px'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
