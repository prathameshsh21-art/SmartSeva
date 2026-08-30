import React, { useState, useEffect } from 'react';
import StaffTable from '../components/StaffTable';
import StaffFormModal from '../components/StaffFormModal';
import Pagination from '../../../components/common/Pagination';
import { staffService } from '../../../api/services/staffService';

export default function StaffList() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadStaff = async (pageNumber = page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await staffService.getAll(pageNumber, 10);
      const pageData = response?.data;
      if (pageData && Array.isArray(pageData.content)) {
        setStaffMembers(pageData.content);
        setTotalPages(pageData.totalPages || 1);
      } else if (Array.isArray(pageData)) {
        setStaffMembers(pageData);
        setTotalPages(1);
      } else {
        setStaffMembers([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
      setError('Failed to load staff members.');
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff(page);
  }, [page]);

  const handleCreateStaff = async (formData) => {
    const response = await staffService.create(formData);
    if (response?.success === false) {
      throw new Error(response.message || 'Failed to create staff');
    }
    alert('Staff account created successfully!');
    await loadStaff(page);
  };

  const handleToggleStatus = async (staff) => {
    const newStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change status of "${staff.fullName}" to ${newStatus}?`)) {
      return;
    }
    try {
      await staffService.updateStatus(staff.staffId, newStatus);
      alert(`Staff status updated to ${newStatus}.`);
      await loadStaff(page);
    } catch (err) {
      console.error('Status toggle failed:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (staff) => {
    const newPassword = window.prompt(`Enter new temporary password for ${staff.fullName}:`);
    if (!newPassword || newPassword.trim() === '') return;
    try {
      await staffService.resetPassword(staff.staffId, { newPassword: newPassword.trim() });
      alert('Password reset successfully.');
    } catch (err) {
      console.error('Password reset failed:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to reset password');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Staff Administration</h3>
          <small className="text-muted">Manage operator accounts, access roles, and credentials</small>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Register Staff Account
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading staff members...</span>
          </div>
        </div>
      ) : (
        <StaffTable
          staffMembers={staffMembers}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <StaffFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateStaff}
      />
    </div>
  );
}