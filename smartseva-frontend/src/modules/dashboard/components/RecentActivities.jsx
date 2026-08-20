import React from 'react';

export default function RecentActivities({ activities = [] }) {
  return (
    <div className="card shadow-sm border-0">

      <div className="card-header bg-white fw-bold">
        Recent Activities
      </div>

      <div className="card-body">

        {activities.length === 0 ? (
          <p className="text-muted mb-0">
            No recent activities available.
          </p>
        ) : (
          <ul className="list-group list-group-flush">

            {activities.map((activity, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-semibold">
                    {activity.action}
                  </div>

                  <small className="text-muted">
                    {activity.description}
                  </small>
                </div>

                <small className="text-muted">
                  {activity.time}
                </small>
              </li>
            ))}

          </ul>
        )}

      </div>

    </div>
  );
}