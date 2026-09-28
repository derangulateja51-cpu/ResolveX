import React from 'react';

export default function PriorityBadge({ priority = 'Medium' }) {
  const norm = (priority || 'Medium').toLowerCase();

  let styles = {
    color: '#475569',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    indicator: '#64748b'
  };

  if (norm === 'urgent') {
    styles = {
      color: '#991b1b',
      bg: '#fef2f2',
      border: '#fecaca',
      indicator: '#dc2626'
    };
  } else if (norm === 'high') {
    styles = {
      color: '#92400e',
      bg: '#fffbeb',
      border: '#fde68a',
      indicator: '#d97706'
    };
  } else if (norm === 'medium') {
    styles = {
      color: '#1e40af',
      bg: '#eff6ff',
      border: '#bfdbfe',
      indicator: '#2563eb'
    };
  } else if (norm === 'low') {
    styles = {
      color: '#334155',
      bg: '#f8fafc',
      border: '#e2e8f0',
      indicator: '#94a3b8'
    };
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.74rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '2px 8px',
        borderRadius: '6px',
        backgroundColor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: styles.indicator
        }}
      />
      {priority}
    </span>
  );
}
