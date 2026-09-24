import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { 
  Search, 
  Filter, 
  Layers, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function AdminComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getAllComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await complaintService.updateComplaintStatus(id, newStatus, `Quick status transition to ${newStatus}`);
      await loadComplaints();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filtered = complaints.filter(c => {
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      const matchSubject = c.subject.toLowerCase().includes(t);
      const matchDesc = c.description.toLowerCase().includes(t);
      const matchId = String(c._id || c.id).toLowerCase().includes(t);
      const matchStudent = c.studentName && c.studentName.toLowerCase().includes(t);
      if (!matchSubject && !matchDesc && !matchId && !matchStudent) return false;
    }
    if (statusFilter !== 'All' && c.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (categoryFilter !== 'All' && c.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (priorityFilter !== 'All' && c.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    return true;
  });

  const categories = ['All', 'IT/WiFi', 'Hostel', 'Academic', 'Mess', 'Infrastructure', 'Transport', 'Other'];
  const statuses = ['All', 'Pending', 'In Review', 'In Progress', 'Resolved', 'Rejected', 'Escalated', 'Withdrawn'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  return (
    <div className="app-container page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Complaint Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Inspect, filter, update states, and resolve student grievances across university facilities.
          </p>
        </div>

        <Link to="/admin" className="btn-secondary">
          <span>View Metrics</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}
      >
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search tickets, student, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        </div>

        <div>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statuses.map(s => <option key={s} value={s}>Status: {s}</option>)}
          </select>
        </div>

        <div>
          <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>Category: {c}</option>)}
          </select>
        </div>

        <div>
          <select className="form-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            {priorities.map(p => <option key={p} value={p}>Priority: {p}</option>)}
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <span>Showing <strong>{filtered.length}</strong> complaints matching criteria</span>
          {(searchTerm || statusFilter !== 'All' || categoryFilter !== 'All' || priorityFilter !== 'All') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('All'); setCategoryFilter('All'); setPriorityFilter('All'); }}
              style={{ background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Querying complaint registry..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No complaints match filters"
            description="Adjust your search keywords or filter criteria to inspect other tickets."
          />
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Student Info</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Quick State Transition</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const id = c._id || c.id;
                  return (
                    <tr key={id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        #{String(id).slice(-6).toUpperCase()}
                      </td>

                      <td style={{ maxWidth: '280px' }}>
                        <Link to={`/admin/complaints/${id}`} style={{ color: 'var(--text-main)', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.subject}
                        </Link>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {c.location || 'General Campus'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--primary-deep)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                          {c.category}
                        </span>
                      </td>

                      <td>
                        <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.86rem' }}>{c.studentName || 'Student'}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.studentId || c.studentEmail}</div>
                      </td>

                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>

                      <td>
                        <StatusBadge status={c.status} size="small" />
                      </td>

                      {/* Quick State Machine Transition Dropdown */}
                      <td>
                        <select
                          className="form-select"
                          value={c.status}
                          onChange={(e) => handleQuickStatusChange(id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            backgroundColor: '#f8fafc',
                            minWidth: '130px'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Review">In Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/complaints/${id}`}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          <span>Resolution</span>
                          <ArrowRight size={13} />
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
