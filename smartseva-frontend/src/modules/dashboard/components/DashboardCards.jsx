import React from 'react';
import MetricCard from '../../../components/ui/MetricCard';

export default function DashboardCards({
  stats = {
    totalCustomers: 0,
    totalServices: 0,
    pendingServices: 0,
    completedToday: 0,
    documentsUploaded: 0,
  },
}) {
  return (
    <div className="row g-4 mb-4">
      <div className="col-sm-6 col-xl">
        <MetricCard
          title="Total Customers"
          value={stats.totalCustomers ?? 0}
          iconClass="bi bi-people-fill"
          colorClass="text-primary"
        />
      </div>

      <div className="col-sm-6 col-xl">
        <MetricCard
          title="Total Services"
          value={stats.totalServices ?? 0}
          iconClass="bi bi-briefcase-fill"
          colorClass="text-info"
        />
      </div>

      <div className="col-sm-6 col-xl">
        <MetricCard
          title="Pending Services"
          value={stats.pendingServices ?? 0}
          iconClass="bi bi-hourglass-split"
          colorClass="text-warning"
        />
      </div>

      <div className="col-sm-6 col-xl">
        <MetricCard
          title="Completed Today"
          value={stats.completedToday ?? 0}
          iconClass="bi bi-check-circle-fill"
          colorClass="text-success"
        />
      </div>

      <div className="col-sm-6 col-xl">
        <MetricCard
          title="Docs Uploaded"
          value={stats.documentsUploaded ?? 0}
          iconClass="bi bi-folder-fill"
          colorClass="text-secondary"
        />
      </div>
    </div>
  );
}