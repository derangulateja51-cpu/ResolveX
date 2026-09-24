import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Sparkles, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  Layers, 
  FileText 
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleSwitch = (newRole) => {
    switchRole(newRole);
    if (newRole === 'admin') navigate('/admin');
    else if (newRole === 'grievance_officer') navigate('/grievance');
    else navigate('/dashboard');
  };

  // Role-specific navigation links
  const studentLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Report Issue', path: '/report', icon: PlusCircle, isHighlight: true },
    { label: 'My Complaints', path: '/history', icon: History },
    { label: 'Known Issues', path: '/known-issues', icon: HelpCircle }
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Complaints', path: '/admin/complaints', icon: Layers }
  ];

  const grievanceLinks = [
    { label: 'Grievance Portal', path: '/grievance', icon: Shield }
  ];

  let currentLinks = [];
  if (role === 'admin') {
    currentLinks = adminLinks;
  } else if (role === 'grievance_officer') {
    currentLinks = grievanceLinks;
  } else {
    currentLinks = studentLinks;
  }

  const roleLabel = 
    role === 'admin' ? 'Admin' :
    role === 'grievance_officer' ? 'Grievance Officer' : 'Student';

  const roleColor = 
    role === 'admin' ? '#4f46e5' :
    role === 'grievance_officer' ? '#e11d48' : '#2563eb';

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px'
        }}
      >
        {/* Brand Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link
            to={role === 'admin' ? '/admin' : role === 'grievance_officer' ? '/grievance' : '/dashboard'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Shield size={20} style={{ strokeWidth: 2.4 }} />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-main)',
                  display: 'block',
                  lineHeight: 1.1
                }}
              >
                Issue<span style={{ color: 'var(--primary)' }}>Hub</span>
              </span>
              <span
                style={{
                  fontSize: '0.66rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                  display: 'block',
                  textTransform: 'uppercase'
                }}
              >
                Report. Track. Resolve.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '4px'
            }}
            className="desktop-nav"
          >
            {user && currentLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 13px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary-deep)' : 'var(--text-secondary)',
                    backgroundColor: isActive 
                      ? 'var(--primary-light)' 
                      : link.isHighlight 
                        ? '#eff6ff' 
                        : 'transparent',
                    border: isActive 
                      ? '1px solid var(--primary-border)' 
                      : link.isHighlight 
                        ? '1px solid #bfdbfe' 
                        : '1px solid transparent',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon size={15} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Quick Demo Switcher, User Profile, Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick Role Switcher */}
          {user && (
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '2px',
                background: '#f1f5f9',
                padding: '3px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
              className="role-switcher-container"
              title="Quickly test roles"
            >
              <button
                onClick={() => handleRoleSwitch('student')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  backgroundColor: role === 'student' ? '#ffffff' : 'transparent',
                  color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: role === 'student' ? 'var(--shadow-xs)' : 'none'
                }}
              >
                Student
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  backgroundColor: role === 'admin' ? '#ffffff' : 'transparent',
                  color: role === 'admin' ? '#4f46e5' : 'var(--text-muted)',
                  boxShadow: role === 'admin' ? 'var(--shadow-xs)' : 'none'
                }}
              >
                Admin
              </button>
              <button
                onClick={() => handleRoleSwitch('grievance_officer')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  backgroundColor: role === 'grievance_officer' ? '#ffffff' : 'transparent',
                  color: role === 'grievance_officer' ? '#e11d48' : 'var(--text-muted)',
                  boxShadow: role === 'grievance_officer' ? 'var(--shadow-xs)' : 'none'
                }}
              >
                Grievance
              </button>
            </div>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 6px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: roleColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.78rem'
                  }}
                >
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {user.name || user.email}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: roleColor, fontWeight: 600, lineHeight: 1 }}>
                    {roleLabel}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  background: '#ffffff',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-medium)',
                  padding: '7px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)'
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: '#ffffff',
              color: 'var(--text-main)',
              border: '1px solid var(--border-medium)',
              padding: '7px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {user && currentLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--primary-deep)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.92rem'
                }}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {user && (
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                SWITCH ROLE DEMO
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => { handleRoleSwitch('student'); setMobileMenuOpen(false); }}
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                >
                  Student
                </button>
                <button 
                  onClick={() => { handleRoleSwitch('admin'); setMobileMenuOpen(false); }}
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                >
                  Admin
                </button>
                <button 
                  onClick={() => { handleRoleSwitch('grievance_officer'); setMobileMenuOpen(false); }}
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}
                >
                  Grievance
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Media query styling */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .role-switcher-container {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
