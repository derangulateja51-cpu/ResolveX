import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: '#ffffff',
        padding: '2rem 0',
        marginTop: 'auto'
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Shield size={15} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: 'var(--text-main)'
            }}
          >
            Issue<span style={{ color: 'var(--primary)' }}>Hub</span>
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--primary-deep)',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Report. Track. Resolve.
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', maxWidth: '580px', margin: 0 }}>
          Centralized University Complaint Management & Grievance Resolution Platform.
        </p>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          © {new Date().getFullYear()} IssueHub. All university rights reserved.
        </div>
      </div>
    </footer>
  );
}
