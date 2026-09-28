import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Clock, 
  Send,
  Sparkles,
  FileCheck,
  Check,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Clarification Message State
  const [clarificationText, setClarificationText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Confirmation State
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawReason.trim()) return;

    setWithdrawing(true);
    try {
      const updated = await complaintService.withdrawComplaint(complaint._id || complaint.id, withdrawReason);
      setComplaint(updated);
      setShowWithdrawModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleConfirmResolution = async () => {
    setConfirming(true);
    try {
      const updated = await complaintService.confirmResolution(complaint._id || complaint.id);
      setComplaint(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleSendClarification = async (e) => {
    e.preventDefault();
    if (!clarificationText.trim()) return;

    setSendingMessage(true);
    try {
      const updated = await complaintService.postClarification(
        complaint._id || complaint.id,
        clarificationText,
        user.name || user.email,
        user.role
      );
      setComplaint(updated);
      setClarificationText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) return <div className="page-wrapper app-container"><LoadingSpinner message="Loading complaint details..." /></div>;

  if (error || !complaint) {
    return (
      <div className="page-wrapper app-container">
        <ErrorBanner message={error || 'Complaint not found.'} />
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>
      </div>
    );
  }

  const isStudent = role === 'student';
  const canWithdraw = isStudent && ['Pending', 'In Review'].includes(complaint.status);
  const isResolved = complaint.status === 'Resolved';

  // Visual status timeline steps
  const statusStep = 
    complaint.status === 'Pending' ? 1 :
    ['In Review', 'In Progress'].includes(complaint.status) ? 2 :
    complaint.status === 'Resolved' ? 3 : 1;

  return (
    <div className="app-container page-wrapper">
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
            TICKET #{String(complaint._id || complaint.id).slice(-8).toUpperCase()}
          </span>
        </div>

        {/* Visual Status Timeline (Submitted -> In Progress -> Resolved) */}
        <div
          className="card-panel"
          style={{
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
            Resolution Progress Timeline
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Step 1: Submitted */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: statusStep >= 1 ? 'var(--status-resolved)' : '#e2e8f0',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Submitted</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Ticket registered</div>
              </div>
            </div>

            {/* Connecting Bar 1 */}
            <div style={{ height: '3px', flex: 1, backgroundColor: statusStep >= 2 ? 'var(--status-progress)' : '#e2e8f0', margin: '0 16px' }} />

            {/* Step 2: In Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: statusStep >= 2 ? 'var(--status-progress)' : '#e2e8f0',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {statusStep > 2 ? <Check size={16} /> : '2'}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>In Progress</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Maintenance active</div>
              </div>
            </div>

            {/* Connecting Bar 2 */}
            <div style={{ height: '3px', flex: 1, backgroundColor: statusStep >= 3 ? 'var(--status-resolved)' : '#e2e8f0', margin: '0 16px' }} />

            {/* Step 3: Resolved */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: statusStep === 3 ? 'var(--status-resolved)' : '#e2e8f0',
                  color: statusStep === 3 ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {statusStep === 3 ? <Check size={16} /> : '3'}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Resolved</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Fix verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Header Card */}
        <div
          className="card-panel"
          style={{
            padding: '2rem',
            marginBottom: '1.5rem',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--primary-deep)',
                    backgroundColor: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {complaint.category}
                </span>

                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />

                {complaint.isAIGenerated && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#6b21a8',
                      backgroundColor: '#f3e8ff',
                      border: '1px solid #d8b4fe',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    <Sparkles size={11} />
                    AI Intake
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: '1.65rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                {complaint.subject}
              </h1>
            </div>

            {/* Student Withdrawal Action */}
            {canWithdraw && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="btn-danger"
                style={{ fontSize: '0.85rem' }}
              >
                <XCircle size={15} />
                <span>Withdraw Complaint</span>
              </button>
            )}
          </div>

          {/* Meta Details Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} style={{ color: 'var(--text-dim)' }} />
              Reported on {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>

            {complaint.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} style={{ color: 'var(--text-dim)' }} />
                {complaint.location}
              </span>
            )}

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} style={{ color: 'var(--text-dim)' }} />
              {complaint.studentName || 'Student'} ({complaint.studentEmail})
            </span>
          </div>
        </div>

        {/* Sensitive Grievance Flag */}
        {complaint.isSensitive && (
          <div
            style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '1.5rem'
            }}
          >
            <ShieldAlert size={22} style={{ color: '#e11d48', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#9f1239', fontSize: '0.9rem' }}>
                Confidential Grievance Protocol Active
              </div>
              <div style={{ fontSize: '0.82rem', color: '#881337' }}>
                This case is handled under protected Ombudsman governance. Student identity is shielded from public facility logs.
              </div>
            </div>
          </div>
        )}

        {/* Description & Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Left Column: Description & Resolution Proof */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                Complaint Description
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.94rem', whiteSpace: 'pre-wrap' }}>
                {complaint.description}
              </p>
            </div>

            {/* Resolution Box (If Resolved) */}
            {isResolved && (
              <div
                className="card-panel"
                style={{
                  padding: '1.75rem',
                  border: '1px solid var(--status-resolved-border)',
                  backgroundColor: 'var(--status-resolved-bg)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--status-resolved)' }} />
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--status-resolved-text)' }}>
                    Resolution Summary & Proof of Fix
                  </h3>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--status-resolved-text)', fontWeight: 700, textTransform: 'uppercase' }}>
                    ADMIN RESOLUTION NOTES:
                  </span>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginTop: '4px' }}>
                    {complaint.resolutionNotes || 'The reported issue has been inspected and remediated by university staff.'}
                  </p>
                </div>

                {complaint.proofOfFix && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--status-resolved-text)', fontWeight: 700, textTransform: 'uppercase' }}>
                      PROOF OF FIX / INSPECTION:
                    </span>
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid var(--status-resolved-border)',
                        fontSize: '0.88rem',
                        color: 'var(--status-resolved-text)',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FileCheck size={16} />
                      <span>{complaint.proofOfFix}</span>
                    </div>
                  </div>
                )}

                {/* Student Resolution Confirmation */}
                {isStudent && (
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(5, 150, 105, 0.2)' }}>
                    {complaint.studentConfirmed ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-resolved-text)', fontSize: '0.88rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} />
                        <span>You verified and confirmed resolution satisfaction.</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleConfirmResolution}
                        disabled={confirming}
                        className="btn-success"
                        style={{ fontSize: '0.88rem', width: '100%' }}
                      >
                        <CheckCircle2 size={16} />
                        <span>{confirming ? 'Confirming...' : 'Confirm Resolution Satisfaction'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Withdrawal Reason if Withdrawn */}
            {complaint.status === 'Withdrawn' && (
              <div className="card-panel" style={{ padding: '1.5rem', backgroundColor: '#f8fafc' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                  Withdrawal Reason
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {complaint.withdrawalReason || 'Student withdrew this grievance.'}
                </p>
              </div>
            )}

            {/* Clarification Thread */}
            <div className="card-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  Clarification Thread
                </h3>
              </div>

              {(!complaint.clarificationThread || complaint.clarificationThread.length === 0) ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                  No messages yet. Use this thread if facilities staff requires additional details.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                  {complaint.clarificationThread.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: msg.role === 'student' ? 'var(--primary-light)' : '#f8fafc',
                        border: `1px solid ${msg.role === 'student' ? 'var(--primary-border)' : 'var(--border-subtle)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: msg.role === 'student' ? 'var(--primary-deep)' : '#4f46e5' }}>
                          {msg.sender} ({msg.role})
                        </span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendClarification} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a message or clarification note..."
                  value={clarificationText}
                  onChange={(e) => setClarificationText(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !clarificationText.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Audit Trail & Action Timeline */}
          <div>
            <div className="card-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <Clock size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  Audit Trail & History
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                {complaint.auditLog && complaint.auditLog.map((log, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        marginTop: '5px',
                        flexShrink: 0
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {log.action.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                        by {log.performedBy} ({log.role}) • {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      {log.details && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {log.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Confirmation Dialog Modal */}
        {showWithdrawModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              padding: '1rem'
            }}
          >
            <div
              className="card-panel"
              style={{
                width: '100%',
                maxWidth: '460px',
                padding: '2rem',
                backgroundColor: '#ffffff',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Withdraw Complaint?
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Withdrawing this grievance will cancel pending investigation by campus staff. Please provide a reason:
              </p>

              <form onSubmit={handleWithdraw}>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Issue resolved on its own, or filed by mistake..."
                  rows={3}
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  required
                  style={{ marginBottom: '1.25rem' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawing || !withdrawReason.trim()}
                    className="btn-danger"
                  >
                    {withdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
