import React from 'react';
import NotificationTable from '../components/NotificationTable';

export default function NotificationCenter() {

  const notifications = [];

  return (
    <div>

      <h3 className="fw-bold mb-4">
        Notification Center
      </h3>

      <NotificationTable
        notifications={notifications}
      />

    </div>
  );
}