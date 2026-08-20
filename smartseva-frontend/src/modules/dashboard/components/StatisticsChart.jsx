import React from 'react';

export default function StatisticsChart() {
  return (
    <div className="card shadow-sm border-0">

      <div className="card-header bg-white fw-bold">
        Service Statistics
      </div>

      <div
        className="card-body d-flex justify-content-center align-items-center"
        style={{ height: '300px' }}
      >
        <div className="text-center text-muted">

          <i
            className="bi bi-bar-chart-line-fill"
            style={{ fontSize: '60px' }}
          ></i>

          <p className="mt-3 mb-0">
            Statistics Chart Placeholder
          </p>

          <small>
            Chart.js / Recharts integration will be added later.
          </small>

        </div>
      </div>

    </div>
  );
}