import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { 
  ThumbsUp, 
  PlusCircle, 
  MapPin, 
  Clock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function KnownIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState(new Set());

  useEffect(() => {
    loadKnownIssues();
  }, []);

  const loadKnownIssues = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getKnownIssues();
      setIssues(data);
    } catch (err) {
      console.error('Failed to load known issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    if (upvotedIds.has(id)) return;

    try {
      await complaintService.upvoteComplaint(id);
      setUpvotedIds(prev => new Set([...prev, id]));
      setIssues(prev => prev.map(issue => {
        if (issue._id === id || issue.id === id) {
          return { ...issue, upvotes: (issue.upvotes || 0) + 1 };
        }
        return issue;
      }));
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  return (
    <div className="app-container page-wrapper">
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary-deep)', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Self-Service Deflection
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          Campus Known Incidents & Alerts
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '720px' }}>
          Check active facility outages currently being repaired. If your issue is already listed, click <strong>"I Experience This"</strong> to boost its priority without creating duplicate tickets.
        </p>
      </div>

      {/* Deflection Guidance Card */}
      <div
        className="card-panel"
        style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          borderLeft: '4px solid var(--primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}
          >
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              Is your problem not covered by any active alert?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              If you have a distinct room, academic, or dining issue, submit an individual ticket.
            </p>
          </div>
        </div>

        <Link to="/report" className="btn-primary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
          <PlusCircle size={16} />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Known Issues List */}
      {loading ? (
        <LoadingSpinner message="Scanning active campus alerts..." />
      ) : issues.length === 0 ? (
        <div className="card-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle size={38} style={{ color: 'var(--status-resolved)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--text-main)' }}>All Systems Operating Normally</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>No major campus outages or known facility incidents reported right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {issues.map(issue => {
            const id = issue._id || issue.id;
            const hasUpvoted = upvotedIds.has(id);

            return (
              <div
                key={id}
                className="card-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: 'var(--primary-deep)',
                        backgroundColor: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {issue.category}
                    </span>
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} size="small" />
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    {issue.subject}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                    {issue.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {issue.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} style={{ color: 'var(--text-dim)' }} />
                        {issue.location}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} style={{ color: 'var(--text-dim)' }} />
                      Reported {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right Action: Upvote Support Button */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    minWidth: '150px'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>
                    {issue.upvotes || 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Students Affected
                  </div>

                  <button
                    onClick={() => handleUpvote(id)}
                    disabled={hasUpvoted}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: hasUpvoted ? 'var(--status-resolved-bg)' : '#ffffff',
                      color: hasUpvoted ? 'var(--status-resolved-text)' : 'var(--primary)',
                      border: `1px solid ${hasUpvoted ? 'var(--status-resolved-border)' : 'var(--border-medium)'}`,
                      cursor: hasUpvoted ? 'default' : 'pointer',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <ThumbsUp size={13} />
                    <span>{hasUpvoted ? 'Upvoted' : 'I Experience This'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
