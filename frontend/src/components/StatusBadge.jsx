import React from 'react';
import { 
  Clock, 
  Search, 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Archive 
} from 'lucide-react';

export default function StatusBadge({ status = 'Pending', size = 'normal' }) {
  const norm = (status || 'Pending').toLowerCase();

  // Status mapping matching user specification:
  // Green for Resolved, Amber for Pending, Blue for In Progress, Red for errors/urgent
  let config = {
    bg: 'var(--status-pending-bg)',
    color: 'var(--status-pending-text)',
    border: 'var(--status-pending-border)',
    icon: Clock,
    label: status
  };

  if (norm.includes('pending')) {
    config = {
      bg: 'var(--status-pending-bg)',
      color: 'var(--status-pending-text)',
      border: 'var(--status-pending-border)',
      icon: Clock,
      label: 'Pending'
    };
  } else if (norm.includes('progress')) {
    config = {
      bg: 'var(--status-progress-bg)',
      color: 'var(--status-progress-text)',
      border: 'var(--status-progress-border)',
      icon: Wrench,
      label: 'In Progress'
    };
  } else if (norm.includes('resolved')) {
    config = {
      bg: 'var(--status-resolved-bg)',
      color: 'var(--status-resolved-text)',
      border: 'var(--status-resolved-border)',
      icon: CheckCircle2,
      label: 'Resolved'
    };
  } else if (norm.includes('review')) {
    config = {
      bg: 'var(--status-review-bg)',
      color: 'var(--status-review-text)',
      border: 'var(--status-review-border)',
      icon: Search,
      label: 'In Review'
    };
  } else if (norm.includes('rejected')) {
    config = {
      bg: 'var(--status-rejected-bg)',
      color: 'var(--status-rejected-text)',
      border: 'var(--status-rejected-border)',
      icon: XCircle,
      label: 'Rejected'
    };
  } else if (norm.includes('escalated')) {
    config = {
      bg: 'var(--status-escalated-bg)',
      color: 'var(--status-escalated-text)',
      border: 'var(--status-escalated-border)',
      icon: AlertTriangle,
      label: 'Escalated'
    };
  } else if (norm.includes('withdrawn') || norm.includes('cancelled')) {
    config = {
      bg: 'var(--status-withdrawn-bg)',
      color: 'var(--status-withdrawn-text)',
      border: 'var(--status-withdrawn-border)',
      icon: Archive,
      label: 'Withdrawn'
    };
  }

  const IconComponent = config.icon;
  const isSmall = size === 'small';

  return (
    <span
      className="badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        padding: isSmall ? '2px 8px' : '4px 11px',
        fontSize: isSmall ? '0.72rem' : '0.78rem',
        fontWeight: 600
      }}
    >
      <IconComponent size={isSmall ? 11 : 13} style={{ strokeWidth: 2.2 }} />
      <span>{config.label}</span>
    </span>
  );
}
