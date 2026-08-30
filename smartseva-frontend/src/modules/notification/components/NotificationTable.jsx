import React from 'react';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatDateTime } from '../../../utils/dateUtils';

export default function NotificationTable({
  notifications = [],
}) {

  const getChannelBadge = (type) => {
    switch (type) {
      case 'SMS':
        return (
          <span className="badge bg-secondary text-white">
            <i className="bi bi-chat-text me-1"></i> SMS
          </span>
        );
      case 'WHATSAPP':
        return (
          <span className="badge bg-success text-white">
            <i className="bi bi-whatsapp me-1"></i> WhatsApp
          </span>
        );
      case 'EMAIL':
      default:
        return (
          <span className="badge bg-primary text-white">
            <i className="bi bi-envelope me-1"></i> Email
          </span>
        );
    }
  };

  const columns = [
    { key: 'recipient', label: 'Recipient' },
    { key: 'customerName', label: 'Customer' },
    { key: 'notificationType', label: 'Channel' },
    { key: 'serviceName', label: 'Service' },
    { key: 'status', label: 'Status' },
    { key: 'failureReason', label: 'Delivery Details' },
    { key: 'sentAt', label: 'Sent / Logged At' },
  ];

  const tableData = notifications.map((item, index) => ({
    key: item.notificationId || index,
    recipient: (
      <span className="fw-medium text-dark font-monospace small">
        {item.recipient || '-'}
      </span>
    ),
    customerName: item.customerName || '-',
    notificationType: getChannelBadge(item.notificationType),
    serviceName: item.serviceName ? (
      <span className="fw-semibold text-primary">
        {item.serviceName}
      </span>
    ) : '-',
    status: (
      <StatusBadge
        status={item.status || 'PENDING'}
      />
    ),
    failureReason: item.status === 'FAILED' && item.failureReason ? (
      <span className="text-danger small" title={item.failureReason}>
        <i className="bi bi-exclamation-circle me-1"></i>
        {item.failureReason.length > 40 ? item.failureReason.substring(0, 40) + '...' : item.failureReason}
      </span>
    ) : (
      <span className="text-muted small">
        {item.status === 'SENT' ? 'Delivered successfully' : 'Queued'}
      </span>
    ),
    sentAt: formatDateTime(item.sentAt || item.createdAt),
  }));

  return (
    <DataTable
      columns={columns}
      data={tableData}
    />
  );
}