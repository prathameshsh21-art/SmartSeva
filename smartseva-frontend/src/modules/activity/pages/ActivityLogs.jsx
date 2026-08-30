import React, { useState, useEffect } from 'react';
import ActivityTable from '../components/ActivityTable';
import Pagination from '../../../components/common/Pagination';
import { activityService } from '../../../api/services/activityService';

export default function ActivityLogs() {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadActivities = async (pageNumber = page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activityService.getAll(pageNumber, 10);
      const pageData = response?.data;
      if (pageData && Array.isArray(pageData.content)) {
        setActivities(pageData.content);
        setTotalPages(pageData.totalPages || 1);
      } else if (Array.isArray(pageData)) {
        setActivities(pageData);
        setTotalPages(1);
      } else {
        setActivities([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError('Failed to load activity logs.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(page);
  }, [page]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Activity Audit Trail</h3>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading activities...</span>
          </div>
        </div>
      ) : (
        <ActivityTable activities={activities} />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}