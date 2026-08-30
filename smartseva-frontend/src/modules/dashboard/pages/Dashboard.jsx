import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardCards from '../components/DashboardCards';
import RecentActivities from '../components/RecentActivities';
import { dashboardService } from '../../../api/services/dashboardService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalServices: 0,
    pendingServices: 0,
    completedToday: 0,
    documentsUploaded: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, activitiesRes] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getRecentActivities(),
      ]);

      if (statsRes.status === 'fulfilled') {
        const statsData = statsRes.value?.data || statsRes.value;
        if (statsData) {
          setStats(statsData);
        }
      }

      if (activitiesRes.status === 'fulfilled') {
        const actData = activitiesRes.value?.data || activitiesRes.value;
        if (Array.isArray(actData)) {
          setActivities(actData);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to reach backend services. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div>
      {/* Header with Quick Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Operations Dashboard</h3>
          <p className="text-muted small mb-0">
            Real-time overview of customer requests, processing queue, and audit trail
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/customers" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-people me-1"></i> Customers
          </Link>
          <Link to="/services" className="btn btn-primary btn-sm">
            <i className="bi bi-plus-circle me-1"></i> New Service Order
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading dashboard metrics...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Real-time KPI Metric Cards */}
          <DashboardCards stats={stats} />

          {/* Operational Workflow Shortcuts & Recent Audit Trail */}
          <div className="row g-4">
            {/* Quick Action Hub */}
            <div className="col-lg-5">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white fw-bold">
                  Quick Operations & Workflows
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    <Link
                      to="/customers"
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                    >
                      <div>
                        <div className="fw-semibold text-primary">
                          <i className="bi bi-search me-2"></i> Walk-In Customer Lookup
                        </div>
                        <small className="text-muted">
                          Search customer by phone or register a new customer profile
                        </small>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </Link>

                    <Link
                      to="/services"
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                    >
                      <div>
                        <div className="fw-semibold text-primary">
                          <i className="bi bi-file-earmark-plus me-2"></i> Process Service Orders
                        </div>
                        <small className="text-muted">
                          Manage application numbers, update statuses, or upload documents
                        </small>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </Link>

                    <Link
                      to="/documents"
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                    >
                      <div>
                        <div className="fw-semibold text-primary">
                          <i className="bi bi-folder-check me-2"></i> Document Vault
                        </div>
                        <small className="text-muted">
                          Access securely stored customer certificates and acknowledgements
                        </small>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </Link>

                    <Link
                      to="/activities"
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                    >
                      <div>
                        <div className="fw-semibold text-primary">
                          <i className="bi bi-clock-history me-2"></i> Full Audit Trail
                        </div>
                        <small className="text-muted">
                          Inspect compliance and system event logs
                        </small>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Recent Activity Log */}
            <div className="col-lg-7">
              <RecentActivities activities={activities} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}