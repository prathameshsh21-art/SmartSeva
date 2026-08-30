import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  const isAuthorized = user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
      <div className="container-fluid">
        <Link to="/dashboard" className="navbar-brand fw-bold d-flex align-items-center text-white text-decoration-none">
          <i className="bi bi-shield-check me-2"></i>
          SmartSeva Platform
        </Link>
        <div className="d-flex align-items-center gap-3">
          {isAuthorized && (
            <Link
              to="/dashboard"
              className="btn btn-outline-light btn-sm d-flex align-items-center"
              title="Return to Operational Dashboard"
            >
              <i className="bi bi-speedometer2 me-1"></i>
              Operational Dashboard
            </Link>
          )}
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