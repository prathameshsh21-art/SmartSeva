import React from 'react';
import DataTable from '../../../components/ui/DataTable';

export default function ActivityTable({ activities = [] }) {

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'module', label: 'Module' },
    { key: 'timestamp', label: 'Timestamp' },
  ];

  return (
    <DataTable
      columns={columns}
      data={activities}
    />
  );
}