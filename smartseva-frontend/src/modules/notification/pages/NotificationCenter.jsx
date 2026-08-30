import React, { useState, useEffect } from 'react';
import NotificationTable from '../components/NotificationTable';
import SendNotificationModal from '../components/SendNotificationModal';
import Pagination from '../../../components/common/Pagination';
import { notificationService } from '../../../api/services/notificationService';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);

  const loadNotifications = async (pageNumber = page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getAll(pageNumber, 10);
      const pageData = response?.data;
      if (pageData && Array.isArray(pageData.content)) {
        setNotifications(pageData.content);
        setTotalPages(pageData.totalPages || 1);
      } else if (Array.isArray(pageData)) {
        setNotifications(pageData);
        setTotalPages(1);
      } else {
        setNotifications([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(page);
  }, [page]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-0">Notification Center</h3>
          <p className="text-muted small mb-0">
            Dispatch and monitor multi-channel customer communications via Email, WhatsApp, and SMS.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => loadNotifications(page)}
            disabled={loading}
            title="Refresh notifications list"
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm px-3 fw-semibold shadow-sm"
            onClick={() => setShowSendModal(true)}
          >
            <i className="bi bi-send-fill me-1"></i> Send Notification
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading notifications...</span>
          </div>
        </div>
      ) : (
        <NotificationTable notifications={notifications} />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <SendNotificationModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSuccess={() => {
          loadNotifications(0);
        }}
      />
    </div>
  );
}