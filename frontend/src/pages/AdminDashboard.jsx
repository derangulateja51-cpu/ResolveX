import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { 
  Layers, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BarChart3, 
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getAllComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'In Review').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const urgent = complaints.filter(c => c.priority === 'Urgent' || c.priority === 'High').length;

  // Category counts
  const categoryCounts = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="app-container page-wrapper">
      {/* Admin Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#4f46e5', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Administration Portal
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Campus Complaints Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Real-time status tracking, departmental triage, and resolution performance across campus.
          </p>
        </div>

        <Link to="/admin/complaints" className="btn-primary">
          <Layers size={17} />
          <span>Manage All Complaints</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Total */}
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Complaints</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{total}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all departments</span>
        </div>

        {/* Pending (Amber) */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-pending)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Needs Review</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--status-pending-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-pending)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-pending)' }}>{pending}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unassigned / pending review</span>
        </div>

        {/* In Progress (Blue) */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-progress)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>In Remediation</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--status-progress-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-progress)' }}>
              <Wrench size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-progress)' }}>{inProgress}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staff dispatched</span>
        </div>

        {/* Resolved (Green) */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-resolved)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Resolved</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--status-resolved-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-resolved)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-resolved)' }}>{resolved}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified fixes</span>
        </div>

        {/* Urgent (Red) */}
        <div className="card-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--status-rejected)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Urgent Alerts</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'var(--status-rejected-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-rejected)' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-rejected)' }}>{urgent}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority escalations</span>
        </div>
      </div>

      {/* Category Breakdown Chips */}
      <div className="card-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
          <span>Category Distribution</span>
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div
              key={cat}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{cat}</span>
              <span
                style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-deep)',
                  border: '1px solid var(--primary-border)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming Complaints Queue Table */}
      <div className="card-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Recent Incoming Queue</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Latest student complaints pending staff review</p>
          </div>
          <Link to="/admin/complaints" style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Full Table View</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading queue..." />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Student</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 6).map(c => {
                  const id = c._id || c.id;
                  return (
                    <tr key={id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        #{String(id).slice(-6).toUpperCase()}
                      </td>
                      <td style={{ color: 'var(--text-main)', fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.subject}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-deep)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                          {c.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {c.studentName || 'Student'}
                      </td>
                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td>
                        <StatusBadge status={c.status} size="small" />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/complaints/${id}`}
                          className="btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                        >
                          Resolve
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
