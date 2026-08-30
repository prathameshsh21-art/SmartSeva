import React from 'react';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function StaffTable({
  staffMembers = [],
  onToggleStatus,
  onResetPassword,
}) {
  const columns = [
    { key: 'staffId', label: 'ID' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = staffMembers.map((staff) => ({
    key: staff.staffId,
    staffId: `#${staff.staffId}`,
    fullName: staff.fullName,
    username: staff.username,
    email: staff.email,
    phoneNumber: staff.phoneNumber,
    role: (
      <span className={`badge ${staff.role === 'ROLE_ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
        {staff.role === 'ROLE_ADMIN' ? 'ADMIN' : 'STAFF'}
      </span>
    ),
    status: (
      <StatusBadge status={staff.status || 'ACTIVE'} />
    ),
    actions: (
      <div className="d-flex gap-2">
        <button
          className={`btn btn-sm ${
            staff.status === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'
          }`}
          onClick={() => onToggleStatus(staff)}
          title="Toggle Staff Status"
        >
          {staff.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </button>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onResetPassword(staff)}
          title="Reset Password"
        >
          Reset Key
        </button>
      </div>
    ),
  }));

  return (
    <DataTable
      columns={columns}
      data={tableData}
    />
  );
}