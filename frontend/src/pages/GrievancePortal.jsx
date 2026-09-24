import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  FileText, 
  AlertTriangle,
  Scale
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function GrievancePortal() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  // Investigation & Resolution State
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [resolutionSuccess, setResolutionSuccess] = useState('');

  useEffect(() => {
    loadGrievances();
  }, []);

  const loadGrievances = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getGrievanceComplaints();
      setGrievances(data);
      if (data.length > 0 && !selectedCase) {
        setSelectedCase(data[0]);
        if (data[0].resolutionNotes) setInvestigationNotes(data[0].resolutionNotes);
      }
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveGrievance = async () => {
    if (!selectedCase) return;
    setSavingNotes(true);
    try {
      const updated = await complaintService.resolveComplaint(
        selectedCase._id || selectedCase.id,
        investigationNotes || 'Grievance formal inquiry completed. Enacted ombudsman resolution measures.',
        'Ombudsman Formal Ruling Sealed & Filed',
        user?.name || 'Justice Verma (Ombudsman)'
      );

      setResolutionSuccess('Grievance investigation officially concluded and sealed.');
      setTimeout(() => setResolutionSuccess(''), 4000);
      await loadGrievances();
      setSelectedCase(updated);
    } catch (err) {
      console.error('Failed to resolve grievance:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="app-container page-wrapper">
      {/* Grievance Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#9f1239', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ombudsman & Ethics Cell
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Confidential Inquiries & Sensitive Grievances
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          Grievance Officer Portal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '780px' }}>
          Formal portal for evaluating escalated grievances, harassment disputes, and student welfare allegations under confidential identity-masking protocol.
        </p>
      </div>

      {resolutionSuccess && (
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
          <span style={{ fontWeight: 600 }}>{resolutionSuccess}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Decrypting grievance records..." />
      ) : grievances.length === 0 ? (
        <div className="card-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShieldCheck size={42} style={{ color: 'var(--status-resolved)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--text-main)' }}>No Escalated Grievances Pending</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>All confidential matters have been resolved or no grievances are flagged.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(420px, 1.4fr)', gap: '1.75rem', alignItems: 'start' }}>
          
          {/* Left Column: Confidential Case List */}
          <div className="card-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Lock size={18} style={{ color: 'var(--status-escalated)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                Confidential Case Queue ({grievances.length})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {grievances.map(c => {
                const id = c._id || c.id;
                const isSelected = selectedCase && (selectedCase._id === id || selectedCase.id === id);

                return (
                  <div
                    key={id}
                    onClick={() => { setSelectedCase(c); setInvestigationNotes(c.resolutionNotes || ''); }}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? '#fff1f2' : '#ffffff',
                      border: `1px solid ${isSelected ? '#fecdd3' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(225, 29, 72, 0.1)' : 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#9f1239', fontWeight: 700 }}>
                        #{String(id).slice(-6).toUpperCase()}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <PriorityBadge priority={c.priority} />
                        <StatusBadge status={c.status} size="small" />
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', lineHeight: 1.3 }}>
                      {c.subject}
                    </h4>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Location: {c.location || 'Protected Campus Area'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ombudsman Investigation & Sealed Ruling */}
          {selectedCase && (
            <div className="card-panel" style={{ padding: '2rem', border: '1px solid #fecdd3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#9f1239', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      PROTECTED GRIEVANCE
                    </span>
                    <PriorityBadge priority={selectedCase.priority} />
                    <StatusBadge status={selectedCase.status} />
                  </div>
                  <h2 style={{ fontSize: '1.45rem', color: 'var(--text-main)' }}>
                    {selectedCase.subject}
                  </h2>
                </div>
              </div>

              {/* Data Masking Protocol Notice */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.25rem',
                  fontSize: '0.88rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9f1239', fontWeight: 700, marginBottom: '2px' }}>
                  <ShieldAlert size={16} />
                  <span>Student Identity Masking Active</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Complainant: <strong>{selectedCase.studentName || 'Protected Complainant'}</strong> • Contact: {selectedCase.studentEmail}
                </div>
              </div>

              {/* Statement of Grievance */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Statement of Grievance
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                  {selectedCase.description}
                </p>
              </div>

              {/* Investigation Notes Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Ombudsman Investigation Findings & Action Plan
                </h4>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Record formal witness notes, committee findings, and enacted protection remedies..."
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                />
              </div>

              {/* Resolution Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleResolveGrievance}
                  disabled={savingNotes}
                  className="btn-primary"
                  style={{
                    backgroundColor: '#e11d48',
                    borderColor: 'transparent',
                    boxShadow: '0 2px 10px rgba(225, 29, 72, 0.25)'
                  }}
                >
                  <Scale size={17} />
                  <span>{savingNotes ? 'Sealing Ruling...' : 'Conclude & Seal Grievance'}</span>
                </button>
              </div>

              {/* Audit History */}
              <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                  Tamper-Evident Audit History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCase.auditLog && selectedCase.auditLog.map((log, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      • <strong>{log.action}</strong> by {log.performedBy} ({log.role}) on {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
