import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="bg-light vh-100 d-flex align-items-center justify-content-center">
      <Outlet />
    </div>
  );
}