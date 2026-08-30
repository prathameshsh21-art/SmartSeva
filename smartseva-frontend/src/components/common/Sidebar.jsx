import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, isAdmin } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `nav-link text-dark fw-medium py-2 px-3 rounded d-flex align-items-center ${
      isActive ? 'bg-primary text-white active shadow-sm' : ''
    }`;

  const isAuthorized = user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF');
  if (!isAuthorized) return null;

  return (
    <div className="bg-white border-end vh-100 p-3 shadow-sm" style={{ width: '250px', paddingTop: '70px' }}>
      <ul className="nav nav-pills flex-column gap-1">
        <li className="nav-item">
          <NavLink to="/dashboard" className={linkClass}>
            <i className="bi bi-speedometer2 me-2"></i>
            Operational Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/customers" className={linkClass}>
            <i className="bi bi-people me-2"></i>
            Customers
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/services" className={linkClass}>
            <i className="bi bi-file-earmark-text me-2"></i>
            Service Orders
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/documents" className={linkClass}>
            <i className="bi bi-folder2-open me-2"></i>
            Documents Vault
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/notifications" className={linkClass}>
            <i className="bi bi-bell me-2"></i>
            Notifications
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/activities" className={linkClass}>
            <i className="bi bi-journal-text me-2"></i>
            Activity Audit
          </NavLink>
        </li>

        {isAdmin() && (
          <>
            <hr className="my-2" />
            <div className="text-uppercase text-muted extra-small fw-bold px-3 mb-1" style={{ fontSize: '0.75rem' }}>
              Admin Controls
            </div>
            <li className="nav-item">
              <NavLink to="/admin/staff" className={linkClass}>
                <i className="bi bi-person-badge me-2"></i>
                Staff Members
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/templates" className={linkClass}>
                <i className="bi bi-grid me-2"></i>
                Service Catalog
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}