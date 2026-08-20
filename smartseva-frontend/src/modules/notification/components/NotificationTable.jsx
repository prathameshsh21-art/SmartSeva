import React from 'react';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function NotificationTable({
  notifications = [],
}) {

  const columns = [
    { key: 'recipient', label: 'Recipient' },
    { key: 'subject', label: 'Subject' },
    { key: 'status', label: 'Status' },
    { key: 'sentAt', label: 'Sent At' },
  ];

  const tableData = notifications.map((item) => ({
    recipient: item.recipient,
    subject: item.subject,

    status: (
      <StatusBadge
        status={item.status || 'PENDING'}
      />
    ),

    sentAt: item.sentAt,
  }));

  return (
    <DataTable
      columns={columns}
      data={tableData}
    />
  );
}