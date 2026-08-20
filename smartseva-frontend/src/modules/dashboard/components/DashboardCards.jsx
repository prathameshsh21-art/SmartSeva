import React from 'react';
import MetricCard from '../../../components/ui/MetricCard';

export default function DashboardCards({
  stats = {
    totalCustomers: 0,
    activeServices: 0,
    pendingServices: 0,
    totalStaff: 0,
  },
}) {
  return (
    <div className="row g-4 mb-4">

      <div className="col-md-6 col-xl-3">
        <MetricCard
          title="Customers"
          value={stats.totalCustomers}
          iconClass="bi bi-people-fill"
          colorClass="text-primary"
        />
      </div>

      <div className="col-md-6 col-xl-3">
        <MetricCard
          title="Active Services"
          value={stats.activeServices}
          iconClass="bi bi-briefcase-fill"
          colorClass="text-success"
        />
      </div>

      <div className="col-md-6 col-xl-3">
        <MetricCard
          title="Pending Services"
          value={stats.pendingServices}
          iconClass="bi bi-hourglass-split"
          colorClass="text-warning"
        />
      </div>

      <div className="col-md-6 col-xl-3">
        <MetricCard
          title="Staff Members"
          value={stats.totalStaff}
          iconClass="bi bi-person-badge-fill"
          colorClass="text-danger"
        />
      </div>

    </div>
  );
}