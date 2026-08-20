import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { isAdmin } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    `nav-link text-dark fw-medium py-2 px-3 rounded ${isActive ? 'bg-primary text-white active' : ''}`;

  return (
    <div className="bg-white border-end vh-100 p-3 shadow-sm" style={{ width: '240px', paddingTop: '70px' }}>
      <ul className="nav nav-pills flex-column gap-1">
        <li className="nav-item">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/customers" className={linkClass}>Customers</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/services" className={linkClass}>Service Orders</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/documents" className={linkClass}>Documents Vault</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/activities" className={linkClass}>Activity Audit</NavLink>
        </li>

        {isAdmin() && (
          <>
            <hr className="my-2" />
            <div className="text-uppercase text-muted extra-small fw-bold px-3 mb-1">Admin Controls</div>
            <li className="nav-item">
              <NavLink to="/admin/staff" className={linkClass}>Staff Members</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/templates" className={linkClass}>Service Catalog</NavLink>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}