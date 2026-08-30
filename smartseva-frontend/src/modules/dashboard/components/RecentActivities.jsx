import React from 'react';
import { formatDateTime } from '../../../utils/dateUtils';

export default function RecentActivities({ activities = [] }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
        <span>Recent Audit Activities</span>
        <span className="badge bg-light text-dark">{activities.length} entries</span>
      </div>

      <div className="card-body p-0">
        {activities.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No recent activities recorded yet.
          </p>
        ) : (
          <ul className="list-group list-group-flush small">
            {activities.map((activity, index) => (
              <li
                key={activity.activityId || index}
                className="list-group-item py-3 d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-semibold text-dark">
                    <span className="badge bg-secondary me-2">{activity.action}</span>
                    {activity.operatorName ? (
                      <span className="text-muted fw-normal">by {activity.operatorName}</span>
                    ) : null}
                  </div>

                  <div className="text-secondary mt-1">
                    {activity.details || activity.description || 'Action recorded in audit log'}
                  </div>
                </div>

                <small className="text-muted text-nowrap ms-3">
                  {formatDateTime(activity.timestamp)}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}