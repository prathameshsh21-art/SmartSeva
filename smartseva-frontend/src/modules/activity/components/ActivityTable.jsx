import React from 'react';
import DataTable from '../../../components/ui/DataTable';
import { formatDateTime } from '../../../utils/dateUtils';

export default function ActivityTable({ activities = [] }) {
  const columns = [
    { key: 'staffName', label: 'Operator' },
    { key: 'action', label: 'Action' },
    { key: 'details', label: 'Details' },
    { key: 'timestamp', label: 'Timestamp' },
  ];

  const tableData = activities.map((activity, index) => ({
    key: activity.activityId || index,
    staffName: activity.staffName || 'System',
    action: (
      <span className="badge bg-secondary">
        {activity.action}
      </span>
    ),
    details: (
      <div>
        {activity.serviceName && (
          <div className="fw-semibold text-primary">{activity.serviceName}</div>
        )}
        <small className="text-muted">{activity.description || '-'}</small>
      </div>
    ),
    timestamp: formatDateTime(activity.timestamp),
  }));

  return (
    <DataTable
      columns={columns}
      data={tableData}
    />
  );
}