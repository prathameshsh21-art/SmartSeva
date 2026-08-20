import React from 'react';
import ActivityTable from '../components/ActivityTable';

export default function ActivityLogs() {

  const activities = [];

  return (
    <div>

      <h3 className="fw-bold mb-4">
        Activity Audit Trail
      </h3>

      <ActivityTable
        activities={activities}
      />

    </div>
  );
}