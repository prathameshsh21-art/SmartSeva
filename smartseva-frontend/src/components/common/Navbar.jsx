import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold">SmartSeva Platform</span>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-light text-primary fw-semibold">
            {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Staff Member'}
          </span>
          <span className="text-white small">{user?.fullName}</span>
          <button className="btn btn-outline-light btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}