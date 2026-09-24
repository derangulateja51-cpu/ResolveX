import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading, switchRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Checking authorization...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="app-container page-wrapper">
        <div
          className="glass-panel"
          style={{
            maxWidth: '560px',
            margin: '4rem auto',
            padding: '2.5rem',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.15)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: '#ffffff' }}>
            Access Restricted
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your current account role (<strong>{user.role}</strong>) does not have authorization to view this section.
            Required role: <strong>{allowedRoles.join(' or ')}</strong>.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {allowedRoles.map(role => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                Switch to {role.replace('_', ' ')}
              </button>
            ))}
            <Link to="/dashboard" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <ArrowLeft size={14} />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
