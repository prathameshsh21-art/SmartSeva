import React from 'react';

export default function StatusBadge({ status }) {
  const getBadgeClass = (st) => {
    switch (st) {
      case 'COMPLETED':
      case 'ACTIVE':
        return 'bg-success';
      case 'PENDING':
      case 'WAITING_FOR_DOCUMENT':
        return 'bg-warning text-dark';
      case 'IN_PROGRESS':
      case 'NEW':
        return 'bg-info text-dark';
      case 'SERVER_ISSUE':
      case 'SUSPENDED':
      case 'INACTIVE':
        return 'bg-danger';
      case 'ARCHIVED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  return <span className={`badge ${getBadgeClass(status)}`}>{status || 'UNKNOWN'}</span>;
}