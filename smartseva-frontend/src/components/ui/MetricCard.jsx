import React from 'react';

export default function MetricCard({
  title,
  value,
  iconClass,
  colorClass = 'text-primary',
}) {
  return (
    <div className="card metric-card border-0 shadow-sm h-100">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <small className="text-muted">{title}</small>

          <h3 className="fw-bold mb-0">
            {value ?? 0}
          </h3>
        </div>

        {iconClass && (
          <i className={`${iconClass} ${colorClass} fs-1`}></i>
        )}
      </div>
    </div>
  );
}