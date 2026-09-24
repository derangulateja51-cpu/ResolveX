import React from 'react';
import { Inbox, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = 'No complaints found', 
  description = 'You have not submitted any complaints in this category yet.',
  actionLink = null,
  actionText = 'Report an Issue'
}) {
  return (
    <div
      className="card-panel"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed #cbd5e1',
        background: '#ffffff'
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          marginBottom: '1.25rem'
        }}
      >
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.92rem', marginBottom: actionLink ? '1.5rem' : '0' }}>
        {description}
      </p>

      {actionLink && (
        <Link to={actionLink} className="btn-primary">
          <PlusCircle size={17} />
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );
}
