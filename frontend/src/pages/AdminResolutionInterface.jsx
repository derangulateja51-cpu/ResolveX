import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Send, 
  MessageSquare, 
  User, 
  MapPin, 
  Calendar
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function AdminResolutionInterface() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Status State Machine Update
  const [targetStatus, setTargetStatus] = useState('In Progress');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Resolution Form
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofOfFix, setProofOfFix] = useState('');
  const [resolving, setResolving] = useState(false);

  // Clarification Thread
  const [clarificationText, setClarificationText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
      setTargetStatus(data.status);
      if (data.resolutionNotes) setResolutionNotes(data.resolutionNotes);
      if (data.proofOfFix) setProofOfFix(data.proofOfFix);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusTransition = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    setError('');
    try {
      const updated = await complaintService.updateComplaintStatus(
        complaint._id || complaint.id,
        targetStatus,
        statusComment,
        user?.name || 'Administrator'
      );
      setComplaint(updated);
      setSuccessMessage(`Status successfully transitioned to ${targetStatus}`);
      setStatusComment('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError('Please provide detailed resolution notes.');
      return;
    }

    setResolving(true);
    setError('');
    try {
      const updated = await complaintService.resolveComplaint(
        complaint._id || complaint.id,
        resolutionNotes,
        proofOfFix || 'Work order inspected and confirmed by facilities supervisor.',
        user?.name || 'Administrator'
      );
      setComplaint(updated);
      setTargetStatus('Resolved');
      setSuccessMessage('Complaint officially marked as Resolved with proof of fix.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResolving(false);
    }
  };

  const handleSendClarification = async (e) => {
    e.preventDefault();
    if (!clarificationText.trim()) return;

    setSendingMsg(true);
    try {
      const updated = await complaintService.postClarification(
        complaint._id || complaint.id,
        clarificationText,
        user?.name || 'Admin Office',
        'admin'
      );
      setComplaint(updated);
      setClarificationText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) return <div className="page-wrapper app-container"><LoadingSpinner message="Opening resolution console..." /></div>;
  if (error && !complaint) return <div className="page-wrapper app-container"><ErrorBanner message={error} /></div>;

  return (
    <div className="app-container page-wrapper">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/admin/complaints')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <ArrowLeft size={15} />
            <span>Back to Management Table</span>
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
            ADMIN RESOLUTION CONSOLE • #{String(complaint._id || complaint.id).slice(-8).toUpperCase()}
          </span>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--status-resolved-bg)',
              border: '1px solid var(--status-resolved-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-resolved-text)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Complaint Overview Header */}
        <div className="card-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-deep)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                  {complaint.category}
                </span>
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
              <h1 style={{ fontSize: '1.65rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                {complaint.subject}
              </h1>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            {complaint.description}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} style={{ color: 'var(--text-dim)' }} />
              Reported by: <strong>{complaint.studentName}</strong> ({complaint.studentEmail})
            </span>
            {complaint.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} style={{ color: 'var(--text-dim)' }} />
                {complaint.location}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} style={{ color: 'var(--text-dim)' }} />
              Date: {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Dual Actions Grid: State Machine & Formal Resolution */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Action 1: State Machine Transition */}
          <div className="card-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>State Transition</h3>
            </div>

            <form onSubmit={handleStatusTransition}>
              <div className="form-group">
                <label className="form-label">Update Status</label>
                <select
                  className="form-select"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                >
                  <option value="Pending">Pending (Awaiting Review)</option>
                  <option value="In Review">In Review (Evaluating Feasibility)</option>
                  <option value="In Progress">In Progress (Staff Dispatched)</option>
                  <option value="Rejected">Rejected (Non-Actionable)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status Update Comment</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Dispatched campus maintenance crew..."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                className="btn-secondary"
                style={{ width: '100%' }}
              >
                {updatingStatus ? 'Updating State...' : 'Apply Status Transition'}
              </button>
            </form>
          </div>

          {/* Action 2: Formal Resolution & Proof of Fix */}
          <div
            className="card-panel"
            style={{
              padding: '1.75rem',
              border: '1px solid var(--status-resolved-border)',
              backgroundColor: 'var(--status-resolved-bg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--status-resolved)' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--status-resolved-text)' }}>Official Resolution</h3>
            </div>

            <form onSubmit={handleResolveComplaint}>
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--status-resolved-text)' }}>
                  Resolution Summary <span style={{ color: 'var(--status-rejected)' }}>*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe the completed fix, parts replaced, or remedy enacted..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--status-resolved-text)' }}>
                  Proof of Fix / Work Order Details
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Swapped AP #12 / Cable continuity verified"
                  value={proofOfFix}
                  onChange={(e) => setProofOfFix(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={resolving || !resolutionNotes.trim()}
                className="btn-success"
                style={{ width: '100%', padding: '12px' }}
              >
                {resolving ? 'Submitting...' : 'Mark Complaint Officially Resolved'}
              </button>
            </form>
          </div>
        </div>

        {/* Clarification & Audit Trail Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          
          {/* Clarification Messaging */}
          <div className="card-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Clarification Thread</h3>
            </div>

            {complaint.clarificationThread && complaint.clarificationThread.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                {complaint.clarificationThread.map((msg, i) => (
                  <div key={i} style={{ padding: '10px', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{msg.sender} ({msg.role})</strong>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{msg.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                No clarification messages exchanged yet.
              </p>
            )}

            <form onSubmit={handleSendClarification} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ask student for clarification..."
                value={clarificationText}
                onChange={(e) => setClarificationText(e.target.value)}
              />
              <button type="submit" disabled={sendingMsg || !clarificationText.trim()} className="btn-primary" style={{ padding: '8px 16px' }}>
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* Audit Trail */}
          <div className="card-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Audit Trail</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaint.auditLog && complaint.auditLog.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{log.action}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {log.performedBy} ({log.role}) • {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.details && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{log.details}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
