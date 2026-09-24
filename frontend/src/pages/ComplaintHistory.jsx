import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/complaintService';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Clock, 
  Layers
} from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';

export default function ComplaintHistory() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort logic
  const filteredComplaints = complaints
    .filter(c => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSubject = c.subject.toLowerCase().includes(term);
        const matchesDesc = c.description.toLowerCase().includes(term);
        const matchesId = String(c._id || c.id).toLowerCase().includes(term);
        const matchesLocation = c.location && c.location.toLowerCase().includes(term);
        if (!matchesSubject && !matchesDesc && !matchesId && !matchesLocation) return false;
      }

      if (statusFilter !== 'All' && c.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (categoryFilter !== 'All' && c.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'priority') {
        const priorityWeight = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      } else if (sortBy === 'upvotes') {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      return 0;
    });

  const categories = ['All', 'IT/WiFi', 'Hostel', 'Academic', 'Mess', 'Infrastructure', 'Transport', 'Other'];
  const statuses = ['All', 'Pending', 'In Review', 'In Progress', 'Resolved', 'Rejected', 'Withdrawn'];

  return (
    <div className="app-container page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Complaint History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Inspect, filter, and track the progress of all your filed campus grievances.
          </p>
        </div>

        <Link to="/report" className="btn-primary">
          <PlusCircle size={17} />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search keywords, ID or block..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '13px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)'
            }}
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.88rem' }}
          >
            {statuses.map(s => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ fontSize: '0.88rem' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ fontSize: '0.88rem' }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="priority">Sort: Priority (Urgent first)</option>
            <option value="upvotes">Sort: Most Supported</option>
          </select>
        </div>
      </div>

      {/* Results Count & Reset Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        <span>
          Showing <strong>{filteredComplaints.length}</strong> complaints
        </span>

        {(searchTerm || statusFilter !== 'All' || categoryFilter !== 'All') && (
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('All'); setCategoryFilter('All'); }}
            style={{
              background: 'transparent',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering complaints..." />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          title="No complaints match your filters"
          description="Try resetting search keywords or category filters to view other tickets."
          actionLink={complaints.length === 0 ? '/report' : null}
          actionText="Report an Issue"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {filteredComplaints.map(c => (
            <ComplaintCard
              key={c._id || c.id}
              complaint={c}
              onUpdate={loadComplaints}
            />
          ))}
        </div>
      )}
    </div>
  );
}
