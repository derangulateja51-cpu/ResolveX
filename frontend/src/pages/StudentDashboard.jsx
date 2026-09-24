import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import { 
  Sparkles, 
  PlusCircle, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [knownIssuesCount, setKnownIssuesCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [myList, knownList] = await Promise.all([
        complaintService.getMyComplaints(),
        complaintService.getKnownIssues()
      ]);
      setComplaints(myList);
      setKnownIssuesCount(knownList.length);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculation
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'In Review').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="app-container page-wrapper">
      {/* Top Welcome Banner & Hero Action */}
      <div
        className="card-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 20px -2px rgba(37, 99, 235, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#bfdbfe',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Student Portal
              </span>
              <span style={{ color: '#93c5fd' }}>•</span>
              <span style={{ fontSize: '0.82rem', color: '#e0f2fe' }}>
                ID: {user?.studentId || 'CS20240901'}
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.3rem' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p style={{ color: '#dbeafe', fontSize: '0.95rem', maxWidth: '620px' }}>
              {user?.department || 'Department of Computer Science & Engineering'} • Track your active tickets or report new campus grievances below.
            </p>
          </div>

          {/* Prominent Action Button */}
          <Link
            to="/report"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              color: 'var(--primary-deep)',
              padding: '12px 22px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              transition: 'transform 150ms ease, box-shadow 150ms ease'
            }}
          >
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <span>Report an Issue with AI</span>
          </Link>
        </div>
      </div>

      {/* Campus Deflection Alert Banner */}
      {knownIssuesCount > 0 && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
              <strong>{knownIssuesCount} active campus incidents</strong> are already under maintenance. Check known alerts to avoid filing duplicate tickets.
            </span>
          </div>
          <Link
            to="/known-issues"
            style={{
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View Known Alerts</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Attractive Summary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Total Complaints */}
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Complaints</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <FileText size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>{totalCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Submitted by your account</span>
        </div>

        {/* Pending (Amber) */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-pending)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Review</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--status-pending-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-pending)' }}>
              <Clock size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--status-pending)', lineHeight: 1.1 }}>{pendingCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Awaiting initial triage</span>
        </div>

        {/* In Progress (Blue) */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-progress)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>In Progress</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--status-progress-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-progress)' }}>
              <Wrench size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--status-progress)', lineHeight: 1.1 }}>{inProgressCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Work order dispatched</span>
        </div>

        {/* Resolved (Green) */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-resolved)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Resolved</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--status-resolved-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-resolved)' }}>
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--status-resolved)', lineHeight: 1.1 }}>{resolvedCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Verified & confirmed fixes</span>
        </div>
      </div>

      {/* Main Section: Recent Complaints */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Your Recent Complaints</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Overview of your latest reported issues and current statuses</p>
          </div>
          <Link
            to="/history"
            style={{
              fontSize: '0.88rem',
              color: 'var(--primary)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View All History</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Retrieving your complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No grievances reported yet"
            description="Have an issue with WiFi, hostel amenities, classrooms, or mess dining? Use our AI-powered intake to file a complaint in seconds."
            actionLink="/report"
            actionText="Report Your First Complaint"
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {complaints.slice(0, 4).map(c => (
              <ComplaintCard
                key={c._id || c.id}
                complaint={c}
                onUpdate={loadDashboardData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
