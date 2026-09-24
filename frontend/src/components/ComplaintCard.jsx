import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ThumbsUp, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Tag
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { complaintService } from '../services/complaintService';

export default function ComplaintCard({ complaint, linkPrefix = '/complaints', onUpdate }) {
  const [upvotes, setUpvotes] = useState(complaint.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUpvoted) return;

    try {
      await complaintService.upvoteComplaint(complaint._id || complaint.id);
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const formattedDate = complaint.createdAt 
    ? new Date(complaint.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  const detailPath = `${linkPrefix}/${complaint._id || complaint.id}`;

  return (
    <div
      className="card-panel"
      style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      <div>
        {/* Top Meta Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontFamily: 'monospace',
                color: 'var(--text-muted)',
                background: '#f1f5f9',
                padding: '2px 7px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              #{String(complaint._id || complaint.id).slice(-6).toUpperCase()}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--primary-deep)',
                background: 'var(--primary-light)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid var(--primary-border)'
              }}
            >
              <Tag size={11} />
              {complaint.category}
            </span>

            {complaint.isAIGenerated && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#6b21a8',
                  background: '#f3e8ff',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  border: '1px solid #d8b4fe'
                }}
                title="Structured with IssueHub AI Natural Language Intake"
              >
                <Sparkles size={11} />
                AI Generated
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} size="small" />
          </div>
        </div>

        {/* Sensitive Grievance Flag */}
        {complaint.isSensitive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#9f1239',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              padding: '4px 10px',
              borderRadius: '6px',
              marginBottom: '0.75rem'
            }}
          >
            <ShieldAlert size={14} style={{ color: '#e11d48' }} />
            <span>Confidential Grievance Protocol</span>
          </div>
        )}

        {/* Subject */}
        <h4
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: '0.5rem',
            color: 'var(--text-main)'
          }}
        >
          <Link to={detailPath} style={{ color: 'inherit', textDecoration: 'none' }}>
            {complaint.subject}
          </Link>
        </h4>

        {/* Excerpt */}
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {complaint.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} style={{ color: 'var(--text-dim)' }} />
            {formattedDate}
          </span>

          {complaint.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} style={{ color: 'var(--text-dim)' }} />
              {complaint.location}
            </span>
          )}

          {/* Upvote Deflection Button */}
          <button
            onClick={handleUpvote}
            disabled={hasUpvoted}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: hasUpvoted ? '#eff6ff' : '#ffffff',
              color: hasUpvoted ? '#1e40af' : '#475569',
              border: `1px solid ${hasUpvoted ? '#bfdbfe' : '#cbd5e1'}`,
              padding: '3px 8px',
              borderRadius: '6px',
              cursor: hasUpvoted ? 'default' : 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-xs)'
            }}
            title="Upvote if you also experience this issue"
          >
            <ThumbsUp size={12} />
            <span>{upvotes}</span>
          </button>
        </div>

        <Link
          to={detailPath}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '0.86rem'
          }}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
