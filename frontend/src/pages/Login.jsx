import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  LogIn, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  ShieldCheck, 
  UserCog,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import ErrorBanner from '../components/ErrorBanner';

export default function Login() {
  const { login, demoUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'grievance_officer') {
        navigate('/grievance');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleKey) => {
    const targetUser = demoUsers[roleKey];
    if (!targetUser) return;

    let pass = 'Password123!';
    if (roleKey === 'admin') pass = 'AdminPass123!';
    if (roleKey === 'grievance_officer') pass = 'GrievancePass123!';

    const useEmail = targetUser.email || targetUser.legacyEmail;
    setEmail(useEmail);
    setPassword(pass);
    setError('');
    setLoading(true);

    try {
      const { user } = await login(useEmail, pass);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'grievance_officer') navigate('/grievance');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem'
      }}
    >
      <div
        className="card-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              marginBottom: '1rem'
            }}
          >
            <Shield size={28} style={{ strokeWidth: 2.3 }} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Issue<span style={{ color: 'var(--primary)' }}>Hub</span>
          </h2>

          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-deep)',
              border: '1px solid var(--primary-border)',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.6rem'
            }}
          >
            Report. Track. Resolve.
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            University Student Complaint Management & Grievance Portal
          </p>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Institutional Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="student@issuehub.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Mail
                size={17}
                style={{
                  position: 'absolute',
                  left: '13px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                required
              />
              <Lock
                size={17}
                style={{
                  position: 'absolute',
                  left: '13px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)'
                }}
              />
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '0.4rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Evaluation Logins with Interactive Role Cards */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Evaluation Logins
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
              1-Click Sign In
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Student Role Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-xs)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Student: Alex Rivera
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Roll: CS20240901 • Dept. of CSE
                  </div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-dim)' }} />
            </button>

            {/* Admin Role Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-xs)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#f5f3ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserCog size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Admin: Dr. Sarah Jenkins
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Dean of Student Affairs
                  </div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-dim)' }} />
            </button>

            {/* Grievance Officer Role Card */}
            <button
              type="button"
              onClick={() => handleQuickLogin('grievance_officer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-xs)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Grievance Officer: Justice Verma
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Ombudsman & Ethics Cell
                  </div>
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-dim)' }} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
